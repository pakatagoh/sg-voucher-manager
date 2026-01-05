# Voucher URL Encryption

## Overview

Voucher URLs contain sensitive information and are treated like passwords. All voucher URLs are encrypted before being stored in the database and decrypted only when needed for display or API calls.

## Implementation

### Database Schema (Simulated)

```typescript
interface VoucherLink {
  id: string;           // UUID - Primary key
  encryptedUrl: string; // Encrypted voucher URL
  createdAt: Date;      // Timestamp when link was added
}
```

### Encryption Algorithm

- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Size**: 256 bits (32 bytes)
- **IV (Initialization Vector)**: 12 bytes (96 bits) - NIST recommended size for GCM mode
  - This is the optimal size for AES-GCM
  - Randomly generated for each encryption
  - More efficient than 16 bytes for GCM mode
- **Authentication Tag**: 16 bytes (128 bits) - for ensuring data integrity and authenticity

### How It Works

1. **Adding a Voucher Link**:
   - User submits a plain-text voucher URL
   - URL is validated using Zod schema
   - System checks for duplicate URLs (by decrypting existing entries)
   - UUID is generated as the primary key
   - URL is encrypted using AES-256-GCM
   - Record is stored with: `{ id: UUID, encryptedUrl: string, createdAt: Date }`
   - Format: `iv:authTag:encryptedData` (all hex encoded)

2. **Retrieving Voucher Links**:
   - All records are fetched from database
   - Each encrypted URL is decrypted before sending to client
   - Returns: `{ id, url (decrypted), createdAt }`

3. **Deleting a Voucher Link**:
   - Client sends the link ID (UUID)
   - System looks up record by ID
   - Record is deleted directly using the ID as key

### Security Features

- **AES-256-GCM**: Industry-standard authenticated encryption
- **Random IVs**: Each encryption uses a unique initialization vector
- **Authentication Tags**: Ensures data integrity and authenticity
- **Environment-based Key**: Encryption key stored in environment variables, never in code
- **No Plain-text Storage**: URLs are never stored in plain text

## Files

- `src/server/encryption.ts` - Core encryption/decryption utilities
- `src/server/voucherStorage.ts` - Server functions that use encryption
- `.env` - Contains the encryption key (not committed to git)
- `.env.example` - Template for environment setup

## Key Management

### Development
- Key is generated locally and stored in `.env`
- Each developer should generate their own key

### Production
- Use a secure key management service (e.g., AWS KMS, HashiCorp Vault)
- Never commit production keys to version control
- Rotate keys periodically
- Have a key backup and recovery plan

### Generating a New Key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Migration Notes

If you need to change the encryption key:

1. **Decrypt existing data** with the old key
2. **Re-encrypt with the new key**
3. **Update all instances** with the new key

**Warning**: If you lose the encryption key, all encrypted data becomes unrecoverable.

## Future Enhancements

- Key rotation mechanism
- Per-user encryption keys
- Hardware security module (HSM) integration
- Audit logging for encryption/decryption events
