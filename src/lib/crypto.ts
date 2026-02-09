import crypto from 'crypto';

const algorithm = 'aes-256-gcm';

function getKey(): Buffer {
  const raw = process.env.FIELD_ENCRYPTION_KEY ?? '';
  const key = Buffer.from(raw, 'utf8');
  if (key.length !== 32) {
    throw new Error('FIELD_ENCRYPTION_KEY must be exactly 32 bytes');
  }
  return key;
}

export function encryptJson(input: object): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(input), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decryptJson<T>(payload: string): T {
  const buff = Buffer.from(payload, 'base64');
  const iv = buff.subarray(0, 16);
  const tag = buff.subarray(16, 32);
  const encrypted = buff.subarray(32);
  const decipher = crypto.createDecipheriv(algorithm, getKey(), iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8')) as T;
}
