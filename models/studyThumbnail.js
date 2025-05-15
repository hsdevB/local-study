import { DataTypes, Model } from 'sequelize';

class StudyThumbnail extends Model {
  static init(sequelize) {
    return super.init({
        title: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        path: {
          type: DataTypes.STRING(255),
        },
        size: {
          type: DataTypes.INTEGER(),
        },
        ext: {
          type: DataTypes.STRING(50),
        },
    }, {
        sequelize,
        underscored: true,
        timestamps: true,
        paranoid: true,
    })
  }

  static associate(db) {
    
  }
}

export default StudyThumbnail;