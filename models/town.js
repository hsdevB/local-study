import { DataTypes, Model } from 'sequelize';

class Town extends Model {
  static init(sequelize) {
    return super.init({
        name: {
            type: DataTypes.STRING(255),
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

export default Town;