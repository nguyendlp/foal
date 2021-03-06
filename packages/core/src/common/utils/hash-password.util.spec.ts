// std
import { strictEqual } from 'assert';
import { pbkdf2, pbkdf2Sync } from 'crypto';

// FoalTS
import { promisify } from 'util';
import { hashPassword } from './hash-password.util';

describe('hashPassword', () => {

  it('should hash the plain password into a 32-byte derived key with PBKDF2/SHA256,'
      + ' 150 000 iterations and a 16-byte random salt.', async () => {
    const plainPassword = 'hello world';
    const actual = await hashPassword(plainPassword);

    const [ algorithm, iterations, salt, derivedKey ] = actual.split('$');

    strictEqual(algorithm, 'pbkdf2_sha256');
    strictEqual(parseInt(iterations, 10), 150000);
    strictEqual(Buffer.from(salt, 'base64').length, 16);
    strictEqual(Buffer.from(derivedKey, 'base64').length, 32);

    const expectedBuffer = await pbkdf2Sync(plainPassword, Buffer.from(salt, 'base64'), 150000, 32, 'sha256');

    strictEqual(derivedKey, expectedBuffer.toString('base64'));
  });

  it('should be able to salt and hash the plain password using the legacy way (old parsePassword util).', async () => {
    const plainPassword = 'hello world';
    const actual = await hashPassword(plainPassword, { legacy: true });

    strictEqual(typeof actual, 'string');
    const [ algorithm, iterations, salt, derivedKey] = actual.split('$');

    strictEqual(algorithm, 'pbkdf2_sha256');
    strictEqual(parseInt(iterations, 10), 100000);
    strictEqual(salt.length, 32); // 16 * 2
    strictEqual(derivedKey.length, 128); // 64 * 2

    const expectedBuffer = await promisify(pbkdf2)(
      plainPassword, salt, parseInt(iterations, 10), 64, 'sha256'
    );
    strictEqual(expectedBuffer.toString('hex'), derivedKey);
  });

});
