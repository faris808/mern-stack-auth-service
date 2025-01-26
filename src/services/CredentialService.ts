import bcrypt from "bcryptjs";

export class CredentialService {
    async comparePassword(userPassword: string, hashPassword: string) {
        return await bcrypt.compare(userPassword, hashPassword);
    }
}
