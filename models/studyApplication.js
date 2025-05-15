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
    this.belongsTo(db.Study, {
      foreignKey: 'study_id',
      targetKey: 'id',
      onDelete: 'CASCADE',
      as: 'Study',
    });
    this.belongsTo(db.User, {
      foreignKey: 'user_id',
      targetKey: 'id',
      onDelete: 'CASCADE',
      as: 'User',
    });
  }
}

export default StudyApplication;