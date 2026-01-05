import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// Encryption configuration
const ALGORITHM = "aes-256-gcm";

/**
 * IV (Initialization Vector) Length for AES-GCM
 *
 * NIST Special Publication 800-38D recommends 96 bits (12 bytes) for GCM mode.
 * This is the optimal size because:
 * - Most efficient for the GCM algorithm
 * - Allows for 2^32 encryptions with the same key before security degrades
 * - Standard practice in the industry
 *
 * Other sizes are possible:
 * - 16 bytes (128 bits): Works but requires additional internal processing
 * - Other sizes: Possible but not recommended
 *
 * Reference: https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf
 */
const IV_LENGTH = 12;

/**
 * Gets the encryption key from environment variable.
 * The key should be a 32-byte (64 hex characters) string.
 * Generate one using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */
function getEncryptionKey(): Buffer {
	const key = process.env.ENCRYPTION_KEY;

	if (!key) {
		throw new Error(
			"ENCRYPTION_KEY environment variable is not set. Generate one using: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
		);
	}

	// Convert hex string to buffer
	const keyBuffer = Buffer.from(key, "hex");

	if (keyBuffer.length !== 32) {
		throw new Error(
			"ENCRYPTION_KEY must be 32 bytes (64 hex characters). Generate one using: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
		);
	}

	return keyBuffer;
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a string in the format: iv:authTag:encryptedData (all hex encoded)
 */
export function encrypt(plaintext: string): string {
	const key = getEncryptionKey();
	const iv = randomBytes(IV_LENGTH);

	const cipher = createCipheriv(ALGORITHM, key, iv);

	let encrypted = cipher.update(plaintext, "utf8", "hex");
	encrypted += cipher.final("hex");

	const authTag = cipher.getAuthTag();

	// Return format: iv:authTag:encryptedData
	return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts an encrypted string (in format: iv:authTag:encryptedData).
 * Returns the original plaintext string.
 */
export function decrypt(encryptedData: string): string {
	const key = getEncryptionKey();

	// Split the encrypted data into its components
	const parts = encryptedData.split(":");
	if (parts.length !== 3) {
		throw new Error("Invalid encrypted data format");
	}

	const iv = Buffer.from(parts[0], "hex");
	const authTag = Buffer.from(parts[1], "hex");
	const encrypted = parts[2];

	const decipher = createDecipheriv(ALGORITHM, key, iv);
	decipher.setAuthTag(authTag);

	let decrypted = decipher.update(encrypted, "hex", "utf8");
	decrypted += decipher.final("utf8");

	return decrypted;
}
