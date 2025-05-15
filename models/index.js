const { sequelize } = require("./connection");
// const Category = require("./category");
// const User = require("./user");
// const ProductImage = require("./productImage");
// const Product = require("./product");
// const UserProductDibsJoin = require("./userProductDibsJoin");
// const UserProductLikeJoin = require("./userProductLikeJoin");

const db = {};
db.sequelize = sequelize;

// Model 생성
// db.Category = Category;
// db.User = User;
// db.ProductImage = ProductImage;
// db.Product = Product;
// db.UserProductDibsJoin = UserProductDibsJoin;
// db.UserProductLikeJoin = UserProductLikeJoin;

// db 초기화
// Category.init(sequelize);
// User.init(sequelize);
// ProductImage.init(sequelize);
// Product.init(sequelize);
// UserProductDibsJoin.init(sequelize);
// UserProductLikeJoin.init(sequelize);

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
