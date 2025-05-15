import { DataTypes, Model } from 'sequelize';

class Category extends Model {
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
    this.hasMany(db.Study, {
      foreignKey: 'category_id',
      sourceKey: 'id',
      onDelete: 'CASCADE',
      as: 'Studies',
    });
  }
}

export default Category;