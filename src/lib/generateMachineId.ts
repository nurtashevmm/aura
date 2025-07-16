// Генератор коротких уникальных ID для машин (5-6 символов, латиница + цифры)
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Без похожих символов (I, O, 0, 1)

export function generateMachineId(length = 6): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
  }
  return result;
}
