import User from '../models/user.js';

const signupDao = {
    createUser: async(params) => {
        try {
            const user = await User.create(params);
            return user;
        } catch (err) {
            throw new Error(`Failed to create user: ${err.toString()}`);
        }
    }
};

export default signupDao;
