import { DataTypes, Model } from 'sequelize';

class StudyApplication extends Model {
  static init(sequelize) {
    return super.init({
        status: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        applied_at: {
          type: DataTypes.DATE,
          allowNull: false,
        }
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

export default StudyApplication;