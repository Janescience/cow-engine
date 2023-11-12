
module.exports = (sequelize, Sequelize) => {
    
    const Milk = sequelize.define("milk", {
        time : {
            type:Sequelize.STRING,
            comment:'A=บ่าย, M=เช้า'
        },
        date : Sequelize.DATE,
    });

    return Milk;
};


