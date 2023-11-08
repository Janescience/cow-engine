

module.exports = (sequelize, Sequelize) => {
    const Farm = sequelize.define("farm", {
        code: {
            type: Sequelize.STRING
        },
        name: {
            type: Sequelize.STRING
        },
        lineToken: {
            type: Sequelize.STRING
        }
    });
  
    return Farm;
  };
