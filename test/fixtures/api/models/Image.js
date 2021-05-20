/**
 * Image.js
 *
 */

module.exports = {
  attributes: {
    url: {
      type: Sequelize.STRING,
    },
  },
  associations: function () {
    User.hasOne(Image, { onDelete: 'cascade' });
    Image.belongsTo(User);
  },
  options: {
    freezeTableName: false,
    tableName: 'image',
    classMethods: {},
    instanceMethods: {},
    hooks: {},
  },
};