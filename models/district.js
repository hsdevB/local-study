import { DataTypes, Model } from 'sequelize';

class District extends Model {
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
    this.belongsTo(db.City, {
      foreignKey: 'city_id',
      targetKey: 'id',
      onDelete: 'CASCADE',
      as: 'City',
    });
    this.hasMany(db.Town, {
      foreignKey: 'district_id',
      sourceKey: 'id',
      onDelete: 'CASCADE',
      as: 'Towns',
    });
  }
}

export default District;