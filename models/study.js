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
    // User 모델과 Product 모델 간의 N:M 관계 설정 (찜하기)
    
  }
}

export default Study;
