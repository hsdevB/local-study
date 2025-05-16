import signupDao from '../dao/signupDao.js';
import hashUtil from '../utils/hashUtil.js';
import logger from '../utils/logger.js';

const signupService = {
    createUser: async (params) => {
        let inserted = null;
        try {
          let hashedPassword = null;
    
          hashedPassword = await hashUtil.makePasswordHash(params.password);
          params.password = hashedPassword;
    
          inserted = await signupDao.createUser(params);
          logger.debug("(signupService.createUser)", params, inserted);
        } catch (err) {
          logger.error("(signupService.createUser)", err.toString());
          return new Promise((resolve, reject) => {
            reject(err);
          });
        }
        return new Promise((resolve) => {
          resolve(inserted);
        });
      },
};

export default signupService;