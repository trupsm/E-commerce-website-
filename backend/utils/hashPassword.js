const bcrypt = require("bcryptjs");
//for registration 
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
        password,
        salt
    );

    return hashedPassword;
};
//for login 
//we are not decrypting the password we are just comparing the hashed password of entered and stored password 

const comparePassword = async (
    enteredPassword,
    hashedPassword
) => {
    return bcrypt.compare(
        enteredPassword,
        hashedPassword
    );
};

module.exports = {
    hashPassword,
    comparePassword
};