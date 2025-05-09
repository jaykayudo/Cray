import { Fr } from '@aztec/bb.js';

export class Conversions {
    /**
     * Converts a string to a Uint8Array (byte array)
     * @param str The string to convert
     * @returns Uint8Array containing the string's bytes
     */
    static stringToBytes(str: string): Uint8Array {
        return new TextEncoder().encode(str);
    }

    /**
     * Converts a Uint8Array (byte array) back to a string
     * @param bytes The byte array to convert
     * @returns The original string
     */
    static bytesToString(bytes: Uint8Array): string {
        return new TextDecoder().decode(bytes);
    }

    /**
     * Converts a hex string to a Uint8Array
     * @param hex The hex string to convert
     * @returns Uint8Array containing the hex string's bytes
     */
    static hexToBytes(hex: string): Uint8Array {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return bytes;
    }

    /**
     * Converts a Uint8Array to a hex string
     * @param bytes The byte array to convert
     * @returns The hex string representation
     */
    static bytesToHex(bytes: Uint8Array): string {
        return Array.from(bytes)
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');
    }

    /**
     * Converts a string to a hex string
     * @param str The string to convert
     * @returns The hex string representation
     */
    static stringToHex(str: string): string {
        return this.bytesToHex(this.stringToBytes(str));
    }

    /**
     * Converts a hex string back to a string
     * @param hex The hex string to convert
     * @returns The original string
     */
    static hexToString(hex: string): string {
        return this.bytesToString(this.hexToBytes(hex));
    }

    /**
     * Converts a byte array to a Noir field element
     * @param bytes The byte array to convert
     * @returns A Noir field element
     */
    static bytesToNoirField(bytes: Uint8Array): Fr {
        return Fr.fromBuffer(bytes);
    }

    /**
     * Converts a string to a Noir field element
     * @param str The string to convert
     * @returns A Noir field element
     */
    static stringToNoirField(str: string):Fr {
        return Fr.fromString(str);
    }

    /**
     * Converts a hex string to a Noir field element
     * @param hex The hex string to convert
     * @returns A Noir field element
     */
    static hexToNoirField(hex: string): Fr {
        return Fr.fromBufferReduce(this.hexToBytes(hex));
    }
} 