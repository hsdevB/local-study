import User from '../models/user.js';

const signupDao = {
    createUser: async(params) => {
        try {
            const user = await User.create(params);
            return user;
        } catch (err) {
            throw new Error(`Failed to create user: ${err.toString()}`);
        }
    },
    findByUserId: async(userId) => {
        try {
            const user = await User.findOne({ where: { userId } });
            return user;
        } catch (err) {
            throw new Error(`Failed to find user by userId: ${err.toString()}`);
        }
    },
    findByEmail: async(email) => {
        try {
            const user = await User.findOne({ where: { email } });
            return user;
        } catch (err) {
            throw new Error(`Failed to find user by email: ${err.toString()}`);
        }
    }
};

export default signupDao;
