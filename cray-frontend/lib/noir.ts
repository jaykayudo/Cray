import { Noir } from '@noir-lang/noir_js';
import { UltraHonkBackend, Fr } from '@aztec/bb.js';
import checkPasswordCircuit from '../compiled_circuits/check_password.json';
import hashPasswordCircuit from '../compiled_circuits/hash_password.json';

export class NoirUtils {
    private static async initNoir(circuit: any) {
        const backend = new UltraHonkBackend(circuit.bytecode);
        const noir = new Noir(circuit);
        return [noir, backend];
    }

    static async generateHashProof(password: string): Promise<{ proof: string; publicInputs: string[] }> {
        const [noir, backend] = await this.initNoir(hashPasswordCircuit);
        
        // Convert password to bytes
        const passwordBytes = new TextEncoder().encode(password);
        
        // Generate hash proof
        const [witness] = await noir.execute({
            password: passwordBytes
        });
        const { proof, publicInputs } = await noir.generateProof(witness);

        return {
            proof: Buffer.from(proof).toString('base64'),
            publicInputs: publicInputs
        };
    }

    static async generatePasswordProof(username: string, password: string): Promise<{ proof: string; publicInputs: string[] }> {
        // Fetch password hash from backend
        const response = await fetch(`/api/auth/password-hash/${username}`);
        if (!response.ok) {
            throw new Error('Invalid credentials');
        }
        const { passwordHash } = await response.json();

        const [noir, backend] = await this.initNoir(checkPasswordCircuit);
        
        // Convert password to bytes
        const passwordBytes = new TextEncoder().encode(password);
        
        // Generate proof using stored hash as public input
        const [witness] = await noir.execute({
            password: passwordBytes,
            passwordHash: passwordHash
        });
        const { proof, publicInputs } = await noir.generateProof(witness);

        return {
            proof: Buffer.from(proof).toString('base64'),
            publicInputs: publicInputs
        };
    }
} 