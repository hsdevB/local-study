import { DataTypes, Model } from "sequelize";

class User extends Model {
  static init(sequelize) {
    return super.init(
      {
        userId: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        username: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        phoneNumber: {
          type: DataTypes.STRING(20),
        },
        birthDate: {
          type: DataTypes.INTEGER(),
        },
        gender: {
          type: DataTypes.STRING(20),
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
    // User 모델과 Product 모델 간의 N:M 관계 설정 (찜하기)
    this.hasMany(db.Study, {
      foreignKey: 'user_id',
      sourceKey: 'id',
      onDelete: 'CASCADE',
      as: 'Studies',
    });
    this.hasMany(db.StudyApplication, {
      foreignKey: 'user_id',
      sourceKey: 'id',
      onDelete: 'CASCADE',
      as: 'StudyApplications',
    });
  }
}

export default User;
