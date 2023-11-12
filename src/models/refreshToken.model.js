
module.exports = (sequelize, Sequelize) => {
    
  const RefreshToken = sequelize.define("refreshToken", {
      token : Sequelize.STRING,
      expiryDate : Sequelize.DATE,
  });

  return RefreshToken;
};

