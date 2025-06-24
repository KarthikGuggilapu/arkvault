import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import CryptoJS from "crypto-js"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// AES encryption key (should be stored in env for production)
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_VAULT_KEY || "arkvault-static-key-2024";

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
