import { DataTypes, Model } from "sequelize";

class Study extends Model {
  static init(sequelize) {
    return super.init(
      {
        title: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        start_date: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        end_date: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        max_participants: {
          type: DataTypes.INTEGER(),
          allowNull: false,
        },
        current_participants: {
          type: DataTypes.INTEGER(),
          defaultValue: 1
        },
      },
      {
        sequelize,
        underscored: true,
        timestamps: true,
        paranoid: true,
        // freezeTableName: true, // 테이블 이름을 복수형으로 설정 (true: 단수형, false: 복수형)
      }
    );
  }

  static associate(db) {
    this.belongsTo(db.Category, {
      foreignKey: 'category_id',
      targetKey: 'id',
      onDelete: 'CASCADE',
      as: 'Category',
    });
    this.belongsTo(db.City, {
      foreignKey: 'city_id',
      targetKey: 'id',
      onDelete: 'CASCADE',
      as: 'City',
    });
    this.belongsTo(db.User, {
      foreignKey: 'user_id',
      targetKey: 'id',
      onDelete: 'CASCADE',
      as: 'User',
    });
    this.hasMany(db.StudyApplication, {
      foreignKey: 'study_id',
      sourceKey: 'id',
      onDelete: 'CASCADE',
      as: 'StudyApplications',
    });
    this.hasMany(db.StudyThumbnail, {
      foreignKey: 'study_id',
      sourceKey: 'id',
      onDelete: 'CASCADE',
      as: 'StudyThumbnails',
    });
  }
}

export default Study;
