import { DataTypes, Model } from 'sequelize';

class TokenBlacklist extends Model {
    static init(sequelize) {
        return super.init(
            {
                token: {
                    type: DataTypes.STRING,
                    primaryKey: true,
                    allowNull: false
                },
                userId: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                expiresAt: {
                    type: DataTypes.DATE,
                    allowNull: false
                }
            },
            {
                sequelize,
                modelName: 'TokenBlacklist',
                tableName: 'token_blacklist',
                timestamps: true,
                underscored: true
            }
        );
    }

    static associate(db) {
        // TokenBlacklist와 User 모델 간의 관계 설정
        this.belongsTo(db.User, {
            foreignKey: 'userId',
            targetKey: 'userId',
            onDelete: 'CASCADE'
        });
    }
}

export default TokenBlacklist; 