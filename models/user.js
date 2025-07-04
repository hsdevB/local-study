import { DataTypes, Model } from "sequelize";

class User extends Model {
  static init(sequelize) {
    return super.init(
      {
        userId: {
          type: DataTypes.STRING(20),
          allowNull: false,
          unique: {
            args: true,
            where: {
              deletedAt: null
            }
          }
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: {
            args: true,
            where: {
              deletedAt: null
            }
          }
        },
        phoneNumber: {
          type: DataTypes.STRING(20),
        },
        birthDate: {
          type: DataTypes.STRING(20),
        },
        gender: {
          type: DataTypes.STRING(20),
        },
        nickname: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: '유저',
          unique: {
            args: true,
            where: {
              deletedAt: null
            }
          }
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
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
    // User와 TokenBlacklist 간의 1:N 관계 설정
    this.hasMany(db.TokenBlacklist, {
      foreignKey: 'userId',
      sourceKey: 'userId',
      onDelete: 'CASCADE',
      as: 'BlacklistedTokens'
    });
  }
}

export default User;
