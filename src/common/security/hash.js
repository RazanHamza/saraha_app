import bcrypt from "bcryptjs";

export const Hash = async (plainText, SALT_ROUNDS=12) => {
    return bcrypt.hashSync(plainText, SALT_ROUNDS);
}

export const Compare = async (plainText, cipherText) => {
    return  bcrypt.compareSync (plainText , cipherText);
}

