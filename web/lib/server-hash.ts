import { createHash, randomBytes } from "crypto";

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function sha256Hex(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function randomToken(bytes = 18) {
  return randomBytes(bytes).toString("hex");
}

export function hashPickupPin(pin: string) {
  const salt = process.env.REPORT_HASH_SALT || "campuspay-local";
  return sha256Hex(`${salt}:${pin}`);
}

export function createOrderCode() {
  return `CP-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export function createPickupPin() {
  const entropy = randomBytes(4);
  const first = 100 + (entropy[0] % 900);
  const second = 100 + (entropy[1] % 900);
  return `${first}-${second}`;
}

export function base58Encode(buffer: Buffer) {
  if (buffer.length === 0) return "";

  const digits = [0];

  for (const byte of buffer) {
    let carry = byte;
    for (let index = 0; index < digits.length; index += 1) {
      carry += digits[index] << 8;
      digits[index] = carry % 58;
      carry = Math.floor(carry / 58);
    }

    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }

  let output = "";
  for (const byte of buffer) {
    if (byte !== 0) break;
    output += BASE58_ALPHABET[0];
  }

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    output += BASE58_ALPHABET[digits[index]];
  }

  return output;
}

export function createSolanaReference() {
  return base58Encode(randomBytes(32));
}
