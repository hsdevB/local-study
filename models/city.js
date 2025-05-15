import { DataTypes, Model } from 'sequelize';

class City extends Model {
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
    this.hasMany(db.District, {
      foreignKey: 'city_id',
      sourceKey: 'id',
      onDelete: 'CASCADE',
      as: 'Districts',
    });
  }
}

export default City;