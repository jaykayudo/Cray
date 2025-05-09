import { UltraHonkBackend } from '@aztec/bb.js';
import { CompiledCircuit } from '@noir-lang/types';

// Load compiled circuits from src/compiled_circuits
const checkAgeCircuit = require('../compiled_circuits/check_age.json') as CompiledCircuit;
const checkCountryCircuit = require('../compiled_circuits/check_country.json') as CompiledCircuit;
const checkWhitelistCircuit = require('../compiled_circuits/check_whitelist.json') as CompiledCircuit;
const checkPasswordCircuit = require('../compiled_circuits/check_password.json') as CompiledCircuit;

export class ProofVerification {
    private static async verifyProof(
        circuit: CompiledCircuit,
        proof: string,
        publicInputs: any
    ): Promise<boolean> {
        try {
            const backend = new UltraHonkBackend(circuit.bytecode);

            const verification = await backend.verifyProof({
                proof: Uint8Array.from(proof),
                publicInputs: publicInputs
            });

            return verification;
        } catch (error) {
            console.error('Proof verification error:', error);
            return false;
        }
    }

    static async verifyAgeProof(proof: string, publicInputs: { age: number }): Promise<boolean> {
        return this.verifyProof(checkAgeCircuit, proof, publicInputs);
    }

    static async verifyCountryProof(proof: string, publicInputs: { country: string }): Promise<boolean> {
        return this.verifyProof(checkCountryCircuit, proof, publicInputs);
    }

    static async verifyWhitelistProof(proof: string, publicInputs: { whitelist: string[] }): Promise<boolean> {
        return this.verifyProof(checkWhitelistCircuit, proof, publicInputs);
    }

    static async verifyPasswordProof(proof: string, publicInputs: { passwordHash: string }): Promise<boolean> {
        return this.verifyProof(checkPasswordCircuit, proof, publicInputs);
    }
} 