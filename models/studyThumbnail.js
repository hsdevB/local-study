import { DataTypes, Model } from 'sequelize';

class StudyThumbnail extends Model {
  static init(sequelize) {
    return super.init({
        filename: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        path: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        size: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        mimetype: {
          type: DataTypes.STRING(100),
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
  }
}

export default StudyThumbnail;