export const NOTE_NAMES = ['Kick', 'Clap', 'Tick', 'Bell'] as const;
export const NOTE_KEYS = ['D', 'F', 'J', 'K'] as const;
export const NOTE_SHORT = ['K', 'C', 'T', 'B'] as const;

export type Note = 0 | 1 | 2 | 3;

export interface Postcard {
  version: 1;
  tempo: number;
  call: Note[];
  reply?: Note[];
}

const TEMPO_MIN = 96;
const TEMPO_MAX = 116;

export function isNote(value: unknown): value is Note {
  return Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 3;
}

export function validPattern(notes: unknown): notes is Note[] {
  return Array.isArray(notes) && notes.length === 8 && notes.every(isNote);
}

export function validTempo(tempo: unknown): tempo is number {
  return Number.isInteger(tempo) && Number(tempo) >= TEMPO_MIN && Number(tempo) <= TEMPO_MAX;
}

export function encodePostcard(postcard: Postcard): string {
  if (!validTempo(postcard.tempo) || !validPattern(postcard.call) || (postcard.reply && !validPattern(postcard.reply))) {
    throw new Error('A postcard needs a valid tempo and eight sounds in each bar.');
  }
  const parts = ['v1', postcard.tempo.toString(36), postcard.call.join('')];
  if (postcard.reply) parts.push(postcard.reply.join(''));
  return parts.join('-');
}

export function decodePostcard(code: string): Postcard | null {
  const match = /^v1-([0-9a-z]+)-([0-3]{8})(?:-([0-3]{8}))?$/.exec(code);
  if (!match) return null;
  const tempo = Number.parseInt(match[1], 36);
  const call = [...match[2]].map(Number);
  const reply = match[3] ? [...match[3]].map(Number) : undefined;
  if (!validTempo(tempo) || !validPattern(call) || (reply && !validPattern(reply))) return null;
  return { version: 1, tempo, call, reply };
}

export function generatedTempo(randomValue = Math.random()): number {
  const bounded = Math.max(0, Math.min(0.999999, randomValue));
  return TEMPO_MIN + Math.floor(bounded * 6) * 4;
}

export function scoreAttempt(expected: Note[], played: Array<Note | null>, timing: number[], timingWindow: number): boolean[] {
  return expected.map((note, index) => played[index] === note && Math.abs(timing[index] ?? Infinity) <= timingWindow);
}

export const SAMPLE_POSTCARD: Postcard = {
  version: 1,
  tempo: 104,
  call: [0, 2, 1, 2, 0, 3, 1, 2],
};
