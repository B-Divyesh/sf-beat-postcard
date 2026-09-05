import './styles.css';
import { PercussionAudio } from './audio';
import {
  decodePostcard,
  encodePostcard,
  generatedTempo,
  NOTE_KEYS,
  NOTE_NAMES,
  NOTE_SHORT,
  SAMPLE_POSTCARD,
  scoreAttempt,
  type Note,
  type Postcard,
  validPattern,
  validTempo,
} from './pattern';

type Route = 'home' | 'demo' | 'pattern' | 'privacy' | 'terms' | 'not-found';
type Phase = 'compose' | 'ready' | 'listening' | 'count-in' | 'copying' | 'win' | 'lose' | 'reply' | 'complete' | 'invalid';

interface Settings {
  muted: boolean;
  wideTiming: boolean;
  reduceMotion: boolean;
  timingOffset: number;
}

interface Draft {
  tempo: number;
  notes: Note[];
}

const DEFAULT_SETTINGS: Settings = { muted: false, wideTiming: false, reduceMotion: false, timingOffset: 0 };
const rootCandidate = document.querySelector<HTMLDivElement>('#app');
if (!rootCandidate) throw new Error('The game could not find its page container.');
const appRoot: HTMLDivElement = rootCandidate;

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);
}

function asNote(value: number): Note {
  return Math.max(0, Math.min(3, value)) as Note;
}

class BeatPostcardApp {
  private route: Route = 'home';
  private phase: Phase = 'compose';
  private demo = false;
  private postcard: Postcard | null = null;
  private tempo = generatedTempo();
  private composeNotes: Note[] = [];
  private replyNotes: Note[] = [];
  private selectedBeat: number | null = null;
  private playingBeat = -1;
  private activeBeat = -1;
  private countdown = 0;
  private hasListened = false;
  private played: Array<Note | null> = Array(8).fill(null);
  private timing: number[] = Array(8).fill(Infinity);
  private correct: boolean[] = Array(8).fill(false);
  private expectedAt = 0;
  private score = 0;
  private shareUrl = '';
  private status = 'Tap a pad to add beat 1.';
  private audio = new PercussionAudio();
  private audioReady = false;
  private settings: Settings = { ...DEFAULT_SETTINGS };
  private timers: number[] = [];
  private calibrationTimers: number[] = [];
  private calibrationExpected: number[] = [];
  private calibrationTaps: number[] = [];
  private lastFocused: HTMLElement | null = null;
  private frameSamples: number[] = [];
  private previousFrame = 0;
  private accumulator = 0;
  private padFlashUntil = [0, 0, 0, 0];

  constructor() {
    this.bindEvents();
    this.loadRoute(false);
    requestAnimationFrame((time) => this.frame(time));
  }

  private bindEvents(): void {
    appRoot.addEventListener('click', (event) => this.handleClick(event));
    appRoot.addEventListener('change', (event) => this.handleChange(event));
    appRoot.addEventListener('input', (event) => this.handleInput(event));
    window.addEventListener('popstate', () => this.loadRoute(true));
    window.addEventListener('keydown', (event) => this.handleKey(event));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && (this.phase === 'copying' || this.phase === 'count-in')) {
        this.clearTimers();
        this.phase = 'ready';
        this.activeBeat = -1;
        this.status = 'Round paused. Hear the pattern again when you are ready.';
        this.render();
      }
    });
  }

  private frame(time: number): void {
    if (!document.hidden) {
      if (this.previousFrame > 0) {
        const elapsed = Math.min(100, time - this.previousFrame);
        this.frameSamples.push(elapsed);
        if (this.frameSamples.length > 120) this.frameSamples.shift();
        this.accumulator = Math.min(100, this.accumulator + elapsed);
        while (this.accumulator >= 1000 / 60) this.accumulator -= 1000 / 60;
        if (this.frameSamples.length >= 30) {
          const sorted = [...this.frameSamples].sort((a, b) => a - b);
          const median = sorted[Math.floor(sorted.length / 2)];
          document.documentElement.dataset.fps = String(Math.round(1000 / median));
        }
      }
      this.previousFrame = time;
      document.querySelectorAll<HTMLElement>('[data-pad-index]').forEach((pad) => {
        const index = Number(pad.dataset.padIndex);
        pad.classList.toggle('is-hit', this.padFlashUntil[index] > time);
      });
    } else {
      this.previousFrame = 0;
    }
    requestAnimationFrame((next) => this.frame(next));
  }

  private routeFromPath(): Route {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    if (path === '/') return 'home';
    if (path === '/demo') return 'demo';
    if (path === '/privacy') return 'privacy';
    if (path === '/terms') return 'terms';
    if (path.startsWith('/p/')) return 'pattern';
    return 'not-found';
  }

  private loadRoute(moveFocus: boolean): void {
    this.clearTimers();
    this.route = this.routeFromPath();
    this.demo = this.route === 'demo';
    this.settings = this.loadSettings();
    this.applySettings();
    this.postcard = null;
    this.shareUrl = '';
    this.playingBeat = -1;
    this.activeBeat = -1;
    this.hasListened = false;
    this.score = 0;

    if (this.route === 'home') {
      this.phase = 'compose';
      const draft = this.loadDraft();
      this.tempo = draft?.tempo ?? generatedTempo();
      this.composeNotes = draft?.notes ?? [];
      this.status = this.composeNotes.length
        ? `Draft restored. Add beat ${Math.min(8, this.composeNotes.length + 1)} or choose a beat to replace.`
        : 'Tap a pad to add beat 1.';
    } else if (this.route === 'demo') {
      this.postcard = { ...SAMPLE_POSTCARD, call: [...SAMPLE_POSTCARD.call] };
      this.tempo = this.postcard.tempo;
      this.phase = 'ready';
      this.status = 'Mira sent this eight-beat call. Hear it before you copy it.';
      this.writeDemoSession('ready');
    } else if (this.route === 'pattern') {
      let code = '';
      try {
        code = decodeURIComponent(window.location.pathname.slice(3));
      } catch {
        code = '';
      }
      this.postcard = decodePostcard(code);
      if (!this.postcard) {
        this.phase = 'invalid';
        this.status = 'This pattern link is incomplete or damaged.';
      } else {
        this.tempo = this.postcard.tempo;
        this.phase = this.postcard.reply ? 'complete' : 'ready';
        this.replyNotes = this.postcard.reply ? [...this.postcard.reply] : [];
        this.status = this.postcard.reply
          ? 'Both bars are ready to play.'
          : 'A friend sent this eight-beat call. Hear it before you copy it.';
      }
    }

    this.updateMetadata();
    this.render();
    if (moveFocus) requestAnimationFrame(() => document.querySelector<HTMLElement>('h1')?.focus());
  }

  private updateMetadata(): void {
    const metadata: Record<Route, { title: string; description: string }> = {
      home: {
        title: 'Beat Postcard — Copy and extend a rhythm',
        description: 'Make an eight-beat percussion pattern, share its link, and let a friend copy it and add a bar.',
      },
      demo: {
        title: 'Demo — Beat Postcard',
        description: 'Copy Mira’s sample rhythm and add your own eight-beat reply.',
      },
      pattern: {
        title: this.postcard?.reply ? 'Completed reply — Beat Postcard' : 'Copy this rhythm — Beat Postcard',
        description: 'Hear this eight-beat percussion pattern, copy it, and add a reply bar.',
      },
      privacy: {
        title: 'Privacy — Beat Postcard',
        description: 'How Beat Postcard stores drafts, settings, and shared rhythm links.',
      },
      terms: {
        title: 'Terms — Beat Postcard',
        description: 'The terms for using the free Beat Postcard browser game.',
      },
      'not-found': {
        title: 'Page not found — Beat Postcard',
        description: 'This Beat Postcard page does not exist.',
      },
    };
    const current = metadata[this.route];
    document.title = current.title;
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', current.description);
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', `https://beat-postcard.sociobot.in${window.location.pathname}`);
  }

  private navigate(path: string): void {
    if (path === window.location.pathname) return;
    history.pushState({}, '', path);
    window.scrollTo(0, 0);
    this.loadRoute(true);
  }

  private storagePrefix(): string {
    return this.demo ? 'beat-postcard:demo' : 'beat-postcard:real';
  }

  private loadSettings(): Settings {
    try {
      const raw = localStorage.getItem(`${this.storagePrefix()}:settings`);
      if (!raw) return { ...DEFAULT_SETTINGS };
      const value = JSON.parse(raw) as Partial<Settings>;
      return {
        muted: Boolean(value.muted),
        wideTiming: Boolean(value.wideTiming),
        reduceMotion: Boolean(value.reduceMotion),
        timingOffset: Math.max(-150, Math.min(150, Number(value.timingOffset) || 0)),
      };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  private saveSettings(): void {
    localStorage.setItem(`${this.storagePrefix()}:settings`, JSON.stringify(this.settings));
  }

  private applySettings(): void {
    document.body.classList.toggle('reduce-motion', this.settings.reduceMotion);
    this.audio.setMuted(this.settings.muted);
  }

  private loadDraft(): Draft | null {
    try {
      const raw = localStorage.getItem('beat-postcard:real:draft');
      if (!raw) return null;
      const draft = JSON.parse(raw) as Draft;
      if (!validTempo(draft.tempo) || !Array.isArray(draft.notes) || draft.notes.length > 8 || !draft.notes.every((note) => Number.isInteger(note) && note >= 0 && note <= 3)) return null;
      return { tempo: draft.tempo, notes: draft.notes.map(asNote) };
    } catch {
      return null;
    }
  }

  private saveDraft(): void {
    if (this.demo) return;
    localStorage.setItem('beat-postcard:real:draft', JSON.stringify({ tempo: this.tempo, notes: this.composeNotes }));
  }

  private writeDemoSession(value: string): void {
    if (this.demo) localStorage.setItem('beat-postcard:demo:session', value);
  }

  private clearDemoStorage(): void {
    Object.keys(localStorage).filter((key) => key.startsWith('beat-postcard:demo:')).forEach((key) => localStorage.removeItem(key));
  }

  private render(): void {
    const content = this.route === 'privacy'
      ? this.privacyPage()
      : this.route === 'terms'
        ? this.termsPage()
        : this.route === 'not-found'
          ? this.notFoundPage()
          : this.route === 'home'
            ? this.homePage()
            : this.gamePage();

    appRoot.innerHTML = `
      <a class="skip-link" href="#main">Skip to game</a>
      ${this.demoBanner()}
      ${this.header()}
      ${content}
      ${this.footer()}
      <div class="route-announcer sr-only" aria-live="polite">${escapeHtml(document.title)}</div>
      ${this.settingsDialog()}
    `;
    this.applySettings();
  }

  private header(): string {
    return `
      <header class="site-header">
        <a class="wordmark" href="/" data-nav aria-label="Beat Postcard home"><span class="wordmark-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>Beat Postcard</span></a>
        <nav aria-label="Primary navigation">
          <a href="/" data-nav>Make pattern</a>
          <a href="/demo" data-nav>Demo</a>
          <a href="/privacy" data-nav>Privacy</a>
          <button class="text-button" type="button" data-action="open-settings">Settings</button>
        </nav>
      </header>`;
  }

  private footer(): string {
    return `
      <footer class="site-footer">
        <div><strong>Beat Postcard</strong><p>Trade short percussion challenges in a browser.</p></div>
        <nav aria-label="Footer navigation"><a href="/privacy" data-nav>Privacy</a><a href="/terms" data-nav>Terms</a><a href="https://sociobot.in" rel="external">Built by Param Factory <span class="sr-only">(external site)</span></a></nav>
        <p class="build">Original generated social artwork · v1.0.0 · build 2026.09.05</p>
      </footer>`;
  }

  private demoBanner(): string {
    if (!this.demo) return '';
    return `
      <aside class="demo-banner" aria-label="Sample data notice">
        <strong>Demo — sample data, nothing is saved</strong>
        <div><button type="button" data-action="reset-demo">Reset demo</button><button type="button" data-action="start-real">Start for real</button></div>
      </aside>`;
  }

  private homePage(): string {
    return `
      <main id="main" tabindex="-1">
        <section class="first-screen" aria-labelledby="page-title">
          <div class="intro-copy">
            <p class="eyebrow">A two-person browser game</p>
            <h1 id="page-title" tabindex="-1">Copy and extend a rhythm</h1>
            <p class="lede">For two friends who want a short music challenge without songs, installs, accounts, or rankings.</p>
            <div class="intro-actions">
              <a class="button primary" href="/demo" data-nav>Try it with sample data</a>
              <a class="button secondary" href="#instrument">Start your pattern</a>
            </div>
            <p class="action-note">The sample opens Mira’s 104 BPM call.</p>
            <ul class="plain-facts" aria-label="Game facts">
              <li>Free to play</li><li>No account</li><li>Built-in synth sounds</li>
            </ul>
          </div>
          ${this.composePanel('call')}
        </section>
        <section class="how-section" id="how-it-works" aria-labelledby="how-title">
          <div><p class="eyebrow">A scripted round finishes in under 45 seconds</p><h2 id="how-title">How it works</h2></div>
          <ol class="steps">
            <li><span>1</span><div><h3>Make eight beats</h3><p>Tap Kick, Clap, Tick, or Bell. Preview the bar before sharing.</p></div></li>
            <li><span>2</span><div><h3>Send the link</h3><p>The link carries the sounds and tempo. Your friend opens the same call.</p></div></li>
            <li><span>3</span><div><h3>Copy and reply</h3><p>Your friend repeats the call, then adds one bar and sends the completed link back.</p></div></li>
          </ol>
        </section>
        <section class="limits-section" aria-labelledby="limits-title">
          <h2 id="limits-title">What the game does not do</h2>
          <p>Beat Postcard has no song uploads, rankings, public profiles, ads, or biometric rhythm profiles.</p>
          <p>Drafts and settings stay in this browser. A pattern leaves only when you choose to copy or share its link.</p>
          <a href="/privacy" data-nav>Read the privacy details</a>
        </section>
      </main>`;
  }

  private gamePage(): string {
    if (this.phase === 'invalid') {
      return `
        <main id="main" class="narrow" tabindex="-1">
          <p class="eyebrow">Pattern link error</p>
          <h1 tabindex="-1">Open a complete rhythm link</h1>
          <p class="lede">This link is missing a valid eight-beat pattern. Ask your friend to copy the link again.</p>
          <a class="button primary" href="/" data-nav>Make a new pattern</a>
        </main>`;
    }
    const complete = this.phase === 'complete';
    const title = complete ? 'Review this completed reply' : this.demo ? 'Copy and extend a sample rhythm' : 'Copy and extend this rhythm';
    const description = complete
      ? 'Play the original call and its reply as one finished round.'
      : 'Hear the eight-beat call, copy at least six sounds, then add your own bar.';
    return `
      <main id="main" tabindex="-1">
        <section class="game-route-head">
          <div><p class="eyebrow">${complete ? 'End of round' : 'One call and one reply'}</p><h1 tabindex="-1">${title}</h1><p class="lede">${description}</p></div>
          <dl class="rhythm-meta"><div><dt>Tempo</dt><dd>${this.tempo} BPM</dd></div><div><dt>Length</dt><dd>${complete ? '16 beats' : '8 beats'}</dd></div><div><dt>Source</dt><dd>${this.demo ? 'Sample from Mira' : 'Shared link'}</dd></div></dl>
        </section>
        <section class="game-shell" aria-labelledby="state-heading">
          ${this.gameStatePanel()}
        </section>
        <section class="compact-help" aria-labelledby="controls-title">
          <h2 id="controls-title">Controls</h2>
          <p>Tap the four pads or use <kbd>D</kbd>, <kbd>F</kbd>, <kbd>J</kbd>, and <kbd>K</kbd>. Open Settings for wide timing and a four-tap timing check.</p>
        </section>
      </main>`;
  }

  private gameStatePanel(): string {
    const call = this.postcard?.call ?? [];
    if (this.phase === 'complete') return this.completePanel(call, this.replyNotes);
    if (this.phase === 'win') {
      return `
        <div class="result-panel win" data-end-state="win">
          <p class="result-mark" aria-hidden="true">${this.score}/8</p>
          <h2 id="state-heading" tabindex="-1">You copied the call</h2>
          <p>${this.score} sounds matched. Add an eight-beat reply to complete the postcard.</p>
          ${this.scoreStrip(call, this.correct)}
          <div class="button-row"><button class="primary" type="button" data-action="add-reply">Add your reply bar</button><button class="secondary" type="button" data-action="retry">Play the call again</button></div>
        </div>`;
    }
    if (this.phase === 'lose') {
      return `
        <div class="result-panel loss" data-end-state="loss">
          <p class="result-mark" aria-hidden="true">${this.score}/8</p>
          <h2 id="state-heading" tabindex="-1">Copy attempt did not pass</h2>
          <p>${this.score} sounds matched. Six matches complete the copy.</p>
          ${this.scoreStrip(call, this.correct)}
          <div class="button-row"><button class="primary" type="button" data-action="retry">Try the copy again</button><a class="button secondary" href="/" data-nav>Make a new pattern</a></div>
        </div>`;
    }
    if (this.phase === 'reply') return this.composePanel('reply');

    const phaseCopy = this.phase === 'listening'
      ? 'Listen to each sound.'
      : this.phase === 'count-in'
        ? `Count in: ${this.countdown}`
        : this.phase === 'copying'
          ? `Beat ${this.activeBeat + 1}: play one sound now.`
          : 'Hear the full call before you copy it.';
    return `
      <div class="instrument-panel challenge-panel" data-phase="${this.phase}">
        <div class="panel-heading"><div><p class="eyebrow">${this.demo ? 'Sample from Mira' : 'A friend’s call'}</p><h2 id="state-heading" tabindex="-1">Copy the eight-beat call</h2></div><span class="tempo">${this.tempo} BPM</span></div>
        ${this.audioGate()}
        <p class="game-instruction">${phaseCopy}</p>
        ${this.board(call, 'challenge')}
        <p class="status-line" id="game-status" role="status" aria-live="polite">${escapeHtml(this.status)}</p>
        <div class="button-row">
          <button class="secondary" type="button" data-action="listen" ${this.phase === 'listening' || this.phase === 'count-in' || this.phase === 'copying' ? 'disabled' : ''}>Hear pattern</button>
          <button class="primary" type="button" data-action="start-copy" ${!this.hasListened || this.phase !== 'ready' ? 'disabled' : ''}>Copy pattern</button>
        </div>
        <p class="quiet">Match at least 6 of 8 sounds. ${this.settings.wideTiming ? 'Wide timing is on.' : 'Standard timing is on.'}</p>
      </div>`;
  }

  private composePanel(kind: 'call' | 'reply'): string {
    const notes = kind === 'call' ? this.composeNotes : this.replyNotes;
    const isReply = kind === 'reply';
    const heading = isReply ? 'Add your eight-beat reply' : 'Make your eight-beat call';
    const instruction = notes.length < 8
      ? `Tap a pad for beat ${notes.length + 1}. Choose a filled beat to replace it.`
      : 'Your bar has eight sounds. Preview it or finish the link.';
    return `
      <div class="instrument-panel" id="${isReply ? 'reply-instrument' : 'instrument'}" data-phase="${this.phase}">
        <div class="panel-heading"><div><p class="eyebrow">${isReply ? 'Reply bar' : 'Your call'}</p><h2 id="state-heading" tabindex="-1">${heading}</h2></div><span class="tempo">${this.tempo} BPM</span></div>
        ${this.audioGate()}
        <p class="game-instruction">${instruction}</p>
        ${this.board(notes, 'compose')}
        <p class="status-line" id="game-status" role="status" aria-live="polite">${escapeHtml(this.status)}</p>
        <div class="button-row">
          <button class="secondary" type="button" data-action="undo" ${notes.length === 0 ? 'disabled' : ''}>Undo last</button>
          <button class="secondary" type="button" data-action="preview-${kind}" ${notes.length === 0 ? 'disabled' : ''}>Preview bar</button>
          <button class="primary" type="button" data-action="${isReply ? 'finish-reply' : 'make-link'}" ${notes.length !== 8 ? 'disabled' : ''}>${isReply ? 'Finish reply' : 'Create share link'}</button>
        </div>
        ${this.shareUrl && !isReply ? this.shareOutput('Your call link', this.shareUrl) : ''}
      </div>`;
  }

  private completePanel(call: Note[], reply: Note[]): string {
    const completedUrl = this.completedUrl(call, reply);
    return `
      <div class="result-panel complete" data-end-state="complete">
        <p class="result-mark" aria-hidden="true">✓</p>
        <h2 id="state-heading" tabindex="-1">The two-bar reply is complete</h2>
        <p>The original call and reply now travel in one link.</p>
        <div class="two-bars"><div><h3>Call</h3>${this.scoreStrip(call)}</div><div><h3>Reply</h3>${this.scoreStrip(reply)}</div></div>
        <div class="button-row"><button class="primary" type="button" data-action="play-duet">Play both bars</button><button class="secondary" type="button" data-action="restart-round">Play again</button></div>
        ${this.shareOutput('Completed reply link', completedUrl)}
        <a class="under-link" href="/" data-nav>Make a new pattern</a>
      </div>`;
  }

  private board(notes: Note[], mode: 'compose' | 'challenge'): string {
    const markers = Array.from({ length: 8 }, (_, index) => {
      const note = notes[index];
      const active = index === this.playingBeat || index === this.activeBeat;
      const selected = mode === 'compose' && index === this.selectedBeat;
      const result = this.phase === 'copying' && this.played[index] !== null ? (this.correct[index] ? ' correct' : ' wrong') : '';
      const label = note === undefined ? `Beat ${index + 1}, empty` : `Beat ${index + 1}, ${NOTE_NAMES[note]}`;
      const content = note === undefined ? '<span class="beat-empty" aria-hidden="true">+</span>' : `<span class="beat-symbol" aria-hidden="true">${NOTE_SHORT[note]}</span>`;
      if (mode === 'compose') {
        return `<li class="beat-position beat-${index + 1}"><button type="button" class="beat-marker${active ? ' active' : ''}${selected ? ' selected' : ''}" data-beat="${index}" aria-label="${label}. Select to replace."><span class="beat-number">${index + 1}</span>${content}</button></li>`;
      }
      return `<li class="beat-position beat-${index + 1}"><div class="beat-marker${active ? ' active' : ''}${result}" aria-label="${label}${active ? ', current beat' : ''}"><span class="beat-number">${index + 1}</span>${content}</div></li>`;
    }).join('');
    const pads = NOTE_NAMES.map((name, index) => `<button type="button" class="pad pad-${index}" data-pad="${index}" data-pad-index="${index}" aria-keyshortcuts="${NOTE_KEYS[index]}" aria-label="Play ${name}, key ${NOTE_KEYS[index]}"><span>${name}</span><kbd>${NOTE_KEYS[index]}</kbd></button>`).join('');
    return `
      <div class="board" aria-label="Circular percussion board">
        <ol class="beat-ring" aria-label="Eight-beat sequence">${markers}</ol>
        <div class="pad-grid" aria-label="Percussion pads">${pads}</div>
        <div class="board-center" aria-hidden="true"></div>
      </div>`;
  }

  private audioGate(): string {
    const text = this.settings.muted ? 'Sound muted in Settings.' : this.audioReady ? 'Sound ready.' : 'Sound waits for your first press.';
    return `<div class="audio-gate"><span class="audio-dot ${this.audioReady ? 'ready' : ''}" aria-hidden="true"></span><span>${text}</span>${!this.audioReady ? '<button type="button" data-action="enable-audio">Enable sound</button>' : ''}</div>`;
  }

  private scoreStrip(notes: Note[], results?: boolean[]): string {
    return `<ol class="score-strip" aria-label="Rhythm sequence">${notes.map((note, index) => {
      const state = results ? (results[index] ? 'matched' : 'missed') : '';
      return `<li class="note-${note} ${state}"><span>${index + 1}</span><strong>${NOTE_SHORT[note]}</strong><span class="sr-only"> ${NOTE_NAMES[note]}${state ? `, ${state}` : ''}</span></li>`;
    }).join('')}</ol>`;
  }

  private shareOutput(label: string, url: string): string {
    return `
      <div class="share-output" aria-live="polite">
        <label for="share-link">${label}</label>
        <div><input id="share-link" type="url" readonly value="${escapeHtml(url)}" /><button type="button" data-action="copy-link">Copy link</button></div>
        <p>The link contains only the tempo and two sound sequences.</p>
      </div>`;
  }

  private privacyPage(): string {
    return `
      <main id="main" class="legal-page" tabindex="-1">
        <p class="eyebrow">Last updated 5 September 2026</p>
        <h1 tabindex="-1">Privacy at Beat Postcard</h1>
        <p class="lede">The game works without an account and does not send rhythm activity to a product database.</p>
        <h2>What stays in your browser</h2>
        <p>Your unfinished call and game settings use local storage. You can remove them with your browser’s site-data controls.</p>
        <h2>What a shared link contains</h2>
        <p>A link contains the tempo and the selected percussion sounds. It does not contain your name or timing scores.</p>
        <h2>What we do not collect</h2>
        <p>There are no analytics, ads, tracking pixels, accounts, or biometric rhythm profiles. The game does not request a microphone.</p>
        <h2>Demo data</h2>
        <p>The demo uses a separate local-storage prefix. Reset demo or Start for real removes that sample session.</p>
        <h2>Privacy requests</h2>
        <p>There is no product account to export or delete. For a site-level privacy question, email <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a>.</p>
      </main>`;
  }

  private termsPage(): string {
    return `
      <main id="main" class="legal-page" tabindex="-1">
        <p class="eyebrow">Last updated 5 September 2026</p>
        <h1 tabindex="-1">Terms for Beat Postcard</h1>
        <p class="lede">Beat Postcard is a free browser game for creating and sharing short percussion patterns.</p>
        <h2>Use of the game</h2>
        <p>You may use and share patterns for personal or commercial purposes. Do not use links to harass people or disguise harmful destinations.</p>
        <h2>Availability</h2>
        <p>The game is provided as available. Browser audio rules, storage controls, or service changes may affect it.</p>
        <h2>Your links</h2>
        <p>Anyone with a pattern link can play its sounds. Check recipients before sending a link.</p>
        <h2>No payment</h2>
        <p>Every current game feature is free. Beat Postcard does not process payments.</p>
        <h2>Contact</h2>
        <p>For a terms question, email <a href="mailto:legal@sociobot.in">legal@sociobot.in</a>.</p>
      </main>`;
  }

  private notFoundPage(): string {
    return `
      <main id="main" class="narrow" tabindex="-1">
        <div class="missing-ring" aria-hidden="true">404</div>
        <h1 tabindex="-1">Page not found</h1>
        <p class="lede">The address does not match a game page or a complete pattern link.</p>
        <a class="button primary" href="/" data-nav>Make a pattern</a>
      </main>`;
  }

  private settingsDialog(): string {
    return `
      <dialog id="settings-dialog" aria-labelledby="settings-title">
        <form method="dialog">
          <div class="dialog-head"><h2 id="settings-title">Game settings</h2><button class="icon-button" value="close" aria-label="Close settings">×</button></div>
          <label class="switch-row"><span><strong>Mute percussion</strong><small>The visual playhead still runs.</small></span><input type="checkbox" data-setting="muted" ${this.settings.muted ? 'checked' : ''} /></label>
          <label class="switch-row"><span><strong>Wide timing</strong><small>Adds time around each beat.</small></span><input type="checkbox" data-setting="wideTiming" ${this.settings.wideTiming ? 'checked' : ''} /></label>
          <label class="switch-row"><span><strong>Reduce motion</strong><small>Removes pad and page movement.</small></span><input type="checkbox" data-setting="reduceMotion" ${this.settings.reduceMotion ? 'checked' : ''} /></label>
          <div class="timing-setting">
            <label for="timing-offset"><strong>Timing offset</strong><small>Move input earlier or later if sound feels delayed.</small></label>
            <input id="timing-offset" data-setting="timingOffset" type="range" min="-150" max="150" step="5" value="${this.settings.timingOffset}" />
            <output id="timing-output" for="timing-offset">${this.settings.timingOffset > 0 ? '+' : ''}${this.settings.timingOffset} ms</output>
            <div class="calibration-box">
              <p id="calibration-status" role="status">Four taps can set the offset.</p>
              <div><button type="button" class="secondary" data-action="start-calibration">Start four-tap check</button><button type="button" class="primary" data-action="calibration-tap" disabled>Tap with click</button></div>
            </div>
          </div>
        </form>
      </dialog>`;
  }

  private async handleClick(event: MouseEvent): Promise<void> {
    const target = event.target as HTMLElement;
    const nav = target.closest<HTMLAnchorElement>('a[data-nav]');
    if (nav) {
      event.preventDefault();
      this.navigate(new URL(nav.href).pathname);
      return;
    }
    const beat = target.closest<HTMLElement>('[data-beat]');
    if (beat && (this.phase === 'compose' || this.phase === 'reply')) {
      this.selectedBeat = Number(beat.dataset.beat);
      this.status = `Beat ${this.selectedBeat + 1} selected. Tap a pad to replace it.`;
      this.render();
      return;
    }
    const pad = target.closest<HTMLElement>('[data-pad]');
    if (pad) {
      await this.playPad(asNote(Number(pad.dataset.pad)));
      return;
    }
    const action = target.closest<HTMLElement>('[data-action]')?.dataset.action;
    if (!action) return;
    if (action === 'open-settings') this.openSettings(target.closest<HTMLElement>('[data-action]') ?? target);
    if (action === 'enable-audio') await this.enableAudio();
    if (action === 'undo') this.undoNote();
    if (action === 'preview-call') await this.preview(this.composeNotes);
    if (action === 'preview-reply') await this.preview(this.replyNotes);
    if (action === 'make-link') this.makeShareLink();
    if (action === 'copy-link') await this.copyShareLink();
    if (action === 'listen') await this.listenToCall();
    if (action === 'start-copy') await this.startChallenge();
    if (action === 'retry') this.retryChallenge();
    if (action === 'add-reply') this.startReply();
    if (action === 'finish-reply') this.finishReply();
    if (action === 'play-duet') await this.playDuet();
    if (action === 'restart-round') this.restartRound();
    if (action === 'reset-demo') this.resetDemo();
    if (action === 'start-real') this.startForReal();
    if (action === 'start-calibration') await this.startCalibration();
    if (action === 'calibration-tap') this.recordCalibrationTap();
  }

  private handleChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const setting = input.dataset.setting;
    if (setting === 'muted' || setting === 'wideTiming' || setting === 'reduceMotion') {
      this.settings[setting] = input.checked;
      this.saveSettings();
      this.applySettings();
    }
  }

  private handleInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.dataset.setting !== 'timingOffset') return;
    this.settings.timingOffset = Number(input.value);
    this.saveSettings();
    const output = document.querySelector<HTMLOutputElement>('#timing-output');
    if (output) output.value = `${this.settings.timingOffset > 0 ? '+' : ''}${this.settings.timingOffset} ms`;
  }

  private handleKey(event: KeyboardEvent): void {
    if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
    const element = event.target as HTMLElement;
    if (element.matches('input, textarea, select') || document.querySelector('dialog[open]')) return;
    const index = NOTE_KEYS.findIndex((key) => key.toLowerCase() === event.key.toLowerCase());
    if (index < 0) return;
    event.preventDefault();
    void this.playPad(asNote(index));
  }

  private async enableAudio(render = true): Promise<boolean> {
    const ready = await this.audio.enable();
    this.audioReady = ready;
    this.status = ready ? (this.settings.muted ? 'Audio is ready but muted in Settings.' : 'Sound ready. Tap a pad.') : 'Your browser blocked sound. Allow audio, then press Enable sound again.';
    if (render) this.render();
    return ready;
  }

  private async playPad(note: Note): Promise<void> {
    if (!this.audioReady) await this.enableAudio(false);
    this.audio.hit(note, undefined, this.noteIndexForCurrentBar() === 0 || this.noteIndexForCurrentBar() === 4);
    this.padFlashUntil[note] = performance.now() + 130;
    if (this.phase === 'compose' || this.phase === 'reply') {
      const notes = this.phase === 'compose' ? this.composeNotes : this.replyNotes;
      if (this.selectedBeat !== null && this.selectedBeat < notes.length) {
        notes[this.selectedBeat] = note;
        this.status = `Beat ${this.selectedBeat + 1} is now ${NOTE_NAMES[note]}.`;
        this.selectedBeat = null;
      } else if (notes.length < 8) {
        notes.push(note);
        this.status = notes.length === 8 ? 'Eight beats ready. Preview the bar or finish the link.' : `${NOTE_NAMES[note]} added. Tap a pad for beat ${notes.length + 1}.`;
      }
      if (this.phase === 'compose') {
        this.shareUrl = '';
        this.saveDraft();
      } else {
        this.writeDemoSession(`reply-${notes.length}`);
      }
      this.render();
      return;
    }
    if (this.phase === 'copying' && this.activeBeat >= 0 && this.played[this.activeBeat] === null) {
      const delta = performance.now() - this.expectedAt + this.settings.timingOffset;
      this.played[this.activeBeat] = note;
      this.timing[this.activeBeat] = delta;
      const beatMs = 60_000 / this.tempo;
      const windowMs = this.settings.wideTiming ? beatMs - 20 : beatMs * 0.78;
      this.correct[this.activeBeat] = note === this.postcard?.call[this.activeBeat] && Math.abs(delta) <= windowMs;
      this.status = this.correct[this.activeBeat] ? `Beat ${this.activeBeat + 1} matched.` : `Beat ${this.activeBeat + 1} did not match.`;
      this.render();
    }
  }

  private noteIndexForCurrentBar(): number {
    if (this.phase === 'compose') return this.composeNotes.length;
    if (this.phase === 'reply') return this.replyNotes.length;
    return this.activeBeat;
  }

  private undoNote(): void {
    const notes = this.phase === 'reply' ? this.replyNotes : this.composeNotes;
    if (!notes.length) return;
    const removed = notes.pop();
    this.selectedBeat = null;
    this.shareUrl = '';
    this.status = `${removed === undefined ? 'Sound' : NOTE_NAMES[removed]} removed. ${notes.length} of 8 beats remain.`;
    if (this.phase === 'compose') this.saveDraft();
    this.render();
  }

  private async preview(notes: Note[]): Promise<void> {
    if (!notes.length || !(await this.enableAudio(false))) return;
    this.clearTimers();
    const beatMs = 60_000 / this.tempo;
    const startsAt = this.audio.currentTime + 0.08;
    notes.forEach((note, index) => {
      this.audio.hit(note, startsAt + (index * beatMs) / 1000, index === 0 || index === 4);
      this.addTimer(() => { this.playingBeat = index; this.status = `Playing beat ${index + 1}: ${NOTE_NAMES[note]}.`; this.render(); }, 80 + index * beatMs);
    });
    this.addTimer(() => { this.playingBeat = -1; this.status = 'Preview finished.'; this.render(); }, 100 + notes.length * beatMs);
    this.status = 'Preview started.';
    this.render();
  }

  private makeShareLink(): void {
    if (!validPattern(this.composeNotes)) return;
    const code = encodePostcard({ version: 1, tempo: this.tempo, call: this.composeNotes });
    this.shareUrl = `${window.location.origin}/p/${code}`;
    this.status = 'Share link ready. Send it to one friend.';
    this.render();
    requestAnimationFrame(() => document.querySelector<HTMLInputElement>('#share-link')?.select());
  }

  private async copyShareLink(): Promise<void> {
    const input = document.querySelector<HTMLInputElement>('#share-link');
    if (!input) return;
    try {
      await navigator.clipboard.writeText(input.value);
      this.status = 'Link copied. Send it to your friend.';
    } catch {
      input.focus();
      input.select();
      this.status = 'Copy was blocked. The link is selected so you can copy it.';
    }
    const status = document.querySelector<HTMLElement>('#game-status');
    if (status) status.textContent = this.status;
  }

  private async listenToCall(): Promise<void> {
    const call = this.postcard?.call;
    if (!call || !(await this.enableAudio(false))) return;
    this.clearTimers();
    this.phase = 'listening';
    const beatMs = 60_000 / this.tempo;
    const startsAt = this.audio.currentTime + 0.08;
    call.forEach((note, index) => {
      this.audio.hit(note, startsAt + (index * beatMs) / 1000, index === 0 || index === 4);
      this.addTimer(() => { this.playingBeat = index; this.status = `Listening: beat ${index + 1}, ${NOTE_NAMES[note]}.`; this.render(); }, 80 + index * beatMs);
    });
    this.addTimer(() => {
      this.playingBeat = -1;
      this.phase = 'ready';
      this.hasListened = true;
      this.status = 'Pattern finished. Press Copy pattern when you are ready.';
      this.render();
    }, 100 + call.length * beatMs);
    this.status = 'Pattern started.';
    this.render();
  }

  private async startChallenge(): Promise<void> {
    if (!this.hasListened || !this.postcard || !(await this.enableAudio(false))) return;
    this.clearTimers();
    this.played = Array(8).fill(null);
    this.timing = Array(8).fill(Infinity);
    this.correct = Array(8).fill(false);
    this.activeBeat = -1;
    this.phase = 'count-in';
    this.countdown = 2;
    const beatMs = 60_000 / this.tempo;
    this.audio.click();
    this.addTimer(() => { this.countdown = 1; this.audio.click(); this.render(); }, beatMs);
    this.addTimer(() => this.beginChallengeBeat(0), beatMs * 2);
    this.status = 'Two-beat count-in started.';
    this.render();
  }

  private beginChallengeBeat(index: number): void {
    if (this.phase !== 'count-in' && this.phase !== 'copying') return;
    if (index >= 8) {
      this.endChallenge();
      return;
    }
    this.phase = 'copying';
    this.activeBeat = index;
    this.expectedAt = performance.now();
    this.audio.click();
    this.status = `Beat ${index + 1}. Play one sound.`;
    this.render();
    const beatMs = 60_000 / this.tempo;
    this.addTimer(() => this.beginChallengeBeat(index + 1), beatMs);
  }

  private endChallenge(): void {
    if (!this.postcard) return;
    this.clearTimers();
    const beatMs = 60_000 / this.tempo;
    this.correct = scoreAttempt(this.postcard.call, this.played, this.timing, this.settings.wideTiming ? beatMs - 20 : beatMs * 0.78);
    this.score = this.correct.filter(Boolean).length;
    this.activeBeat = -1;
    this.phase = this.score >= 6 ? 'win' : 'lose';
    this.status = this.phase === 'win' ? 'Copy complete.' : 'Copy ended. Try again to add a reply.';
    this.writeDemoSession(this.phase);
    this.render();
    requestAnimationFrame(() => document.querySelector<HTMLElement>('#state-heading')?.focus());
  }

  private retryChallenge(): void {
    this.clearTimers();
    this.phase = 'ready';
    this.hasListened = false;
    this.played = Array(8).fill(null);
    this.correct = Array(8).fill(false);
    this.status = 'Hear the full call again before your next try.';
    this.render();
  }

  private startReply(): void {
    this.phase = 'reply';
    this.replyNotes = [];
    this.selectedBeat = null;
    this.status = 'Tap a pad to add reply beat 1.';
    this.writeDemoSession('reply-0');
    this.render();
    requestAnimationFrame(() => document.querySelector<HTMLElement>('#state-heading')?.focus());
  }

  private finishReply(): void {
    if (!this.postcard || !validPattern(this.replyNotes)) return;
    this.postcard = { ...this.postcard, reply: [...this.replyNotes] };
    this.phase = 'complete';
    this.status = 'Two-bar reply complete.';
    this.writeDemoSession('complete');
    this.render();
    requestAnimationFrame(() => document.querySelector<HTMLElement>('#state-heading')?.focus());
  }

  private completedUrl(call: Note[], reply: Note[]): string {
    if (!validPattern(call) || !validPattern(reply)) return '';
    return `${window.location.origin}/p/${encodePostcard({ version: 1, tempo: this.tempo, call, reply })}`;
  }

  private async playDuet(): Promise<void> {
    if (!this.postcard || !validPattern(this.replyNotes) || !(await this.enableAudio(false))) return;
    this.clearTimers();
    const all = [...this.postcard.call, ...this.replyNotes];
    const beatMs = 60_000 / this.tempo;
    const startsAt = this.audio.currentTime + 0.08;
    all.forEach((note, index) => {
      this.audio.hit(note, startsAt + (index * beatMs) / 1000, index % 8 === 0 || index % 8 === 4);
    });
    this.status = 'Playing the call, then the reply.';
    const heading = document.querySelector<HTMLElement>('#state-heading');
    if (heading) heading.insertAdjacentHTML('afterend', '<p class="play-notice" role="status">Playing the call, then the reply.</p>');
    this.addTimer(() => document.querySelector('.play-notice')?.remove(), all.length * beatMs + 100);
  }

  private restartRound(): void {
    if (!this.postcard) return;
    this.postcard = { version: 1, tempo: this.postcard.tempo, call: [...this.postcard.call] };
    this.replyNotes = [];
    this.phase = 'ready';
    this.hasListened = false;
    this.score = 0;
    this.status = 'Round reset. Hear the call before you copy it.';
    this.writeDemoSession('ready');
    this.render();
    requestAnimationFrame(() => document.querySelector<HTMLElement>('#state-heading')?.focus());
  }

  private resetDemo(): void {
    this.clearDemoStorage();
    this.loadRoute(true);
  }

  private startForReal(): void {
    this.clearDemoStorage();
    this.navigate('/');
  }

  private openSettings(trigger: HTMLElement): void {
    this.lastFocused = trigger;
    const dialog = document.querySelector<HTMLDialogElement>('#settings-dialog');
    if (!dialog) return;
    dialog.addEventListener('close', () => this.lastFocused?.focus(), { once: true });
    dialog.showModal();
  }

  private async startCalibration(): Promise<void> {
    const status = document.querySelector<HTMLElement>('#calibration-status');
    const tap = document.querySelector<HTMLButtonElement>('[data-action="calibration-tap"]');
    if (!status || !tap) return;
    if (this.settings.muted) {
      status.textContent = 'Turn off Mute percussion before the timing check.';
      return;
    }
    if (!(await this.enableAudio(false))) {
      status.textContent = 'Sound is blocked. Allow browser audio, then try again.';
      return;
    }
    this.calibrationTimers.forEach(window.clearTimeout);
    this.calibrationTimers = [];
    this.calibrationExpected = [];
    this.calibrationTaps = [];
    tap.disabled = false;
    tap.dataset.calibrationComplete = 'false';
    tap.dataset.pulse = '0';
    status.textContent = 'Listen, then tap with each of four clicks.';
    [500, 1100, 1700, 2300].forEach((delay, index) => {
      const timer = window.setTimeout(() => {
        this.calibrationExpected[index] = performance.now();
        this.audio.click();
        tap.dataset.pulse = String(index + 1);
        tap.classList.add('pulse');
        window.setTimeout(() => tap.classList.remove('pulse'), 140);
      }, delay);
      this.calibrationTimers.push(timer);
    });
  }

  private recordCalibrationTap(): void {
    const status = document.querySelector<HTMLElement>('#calibration-status');
    const tap = document.querySelector<HTMLButtonElement>('[data-action="calibration-tap"]');
    if (!status || !tap || tap.disabled || !this.calibrationExpected.length) return;
    const index = this.calibrationTaps.length;
    if (index >= 4 || this.calibrationExpected[index] === undefined) return;
    this.calibrationTaps.push(performance.now() - this.calibrationExpected[index]);
    status.textContent = `${this.calibrationTaps.length} of 4 taps recorded.`;
    if (this.calibrationTaps.length === 4) {
      const sorted = [...this.calibrationTaps].sort((a, b) => a - b);
      const median = Math.round((sorted[1] + sorted[2]) / 2 / 5) * 5;
      this.settings.timingOffset = Math.max(-150, Math.min(150, median));
      this.saveSettings();
      const slider = document.querySelector<HTMLInputElement>('#timing-offset');
      const output = document.querySelector<HTMLOutputElement>('#timing-output');
      if (slider) slider.value = String(this.settings.timingOffset);
      if (output) output.value = `${this.settings.timingOffset > 0 ? '+' : ''}${this.settings.timingOffset} ms`;
      tap.disabled = true;
      tap.dataset.calibrationComplete = 'true';
      status.textContent = `Timing offset set to ${this.settings.timingOffset > 0 ? '+' : ''}${this.settings.timingOffset} ms.`;
    }
  }

  private addTimer(callback: () => void, delay: number): void {
    this.timers.push(window.setTimeout(callback, delay));
  }

  private clearTimers(): void {
    this.timers.forEach(window.clearTimeout);
    this.timers = [];
  }
}

new BeatPostcardApp();
