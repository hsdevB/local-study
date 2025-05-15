import sequelize from "./connection.js"
import Category from "./category.js"
import City from "./city.js"
import District from "./district.js"
import StudyApplication from "./studyApplication.js"
import Study from "./study.js"
import StudyThumbnail from "./studyThumbnail.js"
import Town from "./town.js"
import User from "./user.js"



const db = {};
db.sequelize = sequelize;

// Model 생성
db.Category = Category;
db.City = City;
db.District = District;
db.Town = Town;
db.StudyApplication = StudyApplication
db.Study = Study;
db.StudyThumbnail = StudyThumbnail;
db.Town = Town;
db.User = User;

// db 초기화
Category.init(sequelize);
City.init(sequelize);
District.init(sequelize);
Town.init(sequelize);
StudyApplication.init(sequelize);
Study.init(sequelize);
StudyThumbnail.init(sequelize);
Town.init(sequelize);
User.init(sequelize);

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export default db;
