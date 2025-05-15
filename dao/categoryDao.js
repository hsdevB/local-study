import Category from '../models/category.js';

const categoryDao = {
    getAllCategories(){
        return new Promise((resolve, reject) => {
            Category.findAll()
                .then(categories => resolve(categories))
                .catch(err => reject(err));
        });
    } 
}

export default categoryDao;