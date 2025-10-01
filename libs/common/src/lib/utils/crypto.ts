import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from 'crypto';

/**
 * Encrypt data
 * @param data - The data to encrypt
 * @param key - The key to encrypt the data with
 * @returns The encrypted data
 * @example
 * const encryptedData = encrypt('Hello, world!', 'my-secret-key');
 * console.log(encryptedData);
 */
export const encrypt = (data: string, key: string): string => {
  try {
    // Create a hash of the key to ensure it's the right length (256 bits)
    const hashedKey = createHash('sha256').update(key).digest();

    // Generate a random initialization vector
    const iv = randomBytes(12);

    // Create cipher
    const cipher = createCipheriv('aes-256-gcm', hashedKey, iv);

    // Encrypt the data
    let encryptedData = cipher.update(data, 'utf8', 'base64');
    encryptedData += cipher.final('base64');

    // Get the auth tag
    const authTag = cipher.getAuthTag();

    // Combine the IV, encrypted data, and auth tag
    // Format: base64(iv):base64(authTag):base64(encryptedData)
    return `${iv.toString('base64')}:${authTag.toString(
      'base64'
    )}:${encryptedData}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed');
  }
};

/**
 * Decrypt data
 * @param encryptedData - The encrypted data to decrypt
 * @param key - The key to decrypt the data with
 * @returns The decrypted data
 * @example
 * const decryptedData = decrypt('Hello, world!', 'my-secret-key');
 * console.log(decryptedData);
 */
export const decrypt = (encryptedData: string, key: string): string => {
  try {
    // Split the encrypted data into its components
    const [ivBase64, authTagBase64, encryptedDataBase64] =
      encryptedData.split(':');

    if (!ivBase64 || !authTagBase64 || !encryptedDataBase64) {
      throw new Error('Invalid encrypted data format');
    }

    // Convert base64 strings back to Buffers
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    const encryptedBuffer = Buffer.from(encryptedDataBase64, 'base64');

    // Create a hash of the key (same as in encrypt)
    const hashedKey = createHash('sha256').update(key).digest();

    // Create decipher
    const decipher = createDecipheriv('aes-256-gcm', hashedKey, iv);
    decipher.setAuthTag(authTag);

    // Decrypt the data
    let decryptedData = decipher.update(encryptedBuffer, undefined, 'utf8');
    decryptedData += decipher.final('utf8');

    return decryptedData;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed');
  }
};

/**
 * Generates a cryptographically secure random key
 * @param length Length of the key in bytes (default: 32 for 256 bits)
 * @param encoding Output encoding (default: 'base64')
 * @returns The generated key in the specified encoding
 * @example
 * const key = generateKey(32, 'hex');
 * console.log(key);
 */
export const generateKey = (
  length = 32,
  encoding: 'hex' | 'base64' | 'base64url' = 'base64'
): string => {
  try {
    // Generate cryptographically secure random bytes
    const keyBuffer = randomBytes(length);

    // Return in requested encoding
    return keyBuffer.toString(encoding);
  } catch (error) {
    console.error('Key generation error:', error);
    throw new Error('Key generation failed');
  }
};

/**
 * Generates a human-readable random key
 * @param length Length of the key in characters (default: 32)
 * @returns A human-readable random key
 * @example
 * const key = generateReadableKey(32);
 * console.log(key);
 */
export const generateReadableKey = (length = 32): string => {
  try {
    // Character set for readable keys (excluding similar-looking characters)
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let key = '';

    // Generate random bytes for selecting characters
    const randomBytesNeeded = Math.ceil((length * 256) / charset.length);
    const bytes = randomBytes(randomBytesNeeded);

    // Generate the key
    for (let i = 0; i < length; i++) {
      const randomIndex = bytes[i] % charset.length;
      key += charset[randomIndex];
    }

    return key;
  } catch (error) {
    console.error('Readable key generation error:', error);
    throw new Error('Readable key generation failed');
  }
};
