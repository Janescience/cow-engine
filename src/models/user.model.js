
module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        username:{
            type: Sequelize.STRING,
        },
        password:{
            type:Sequelize.STRING,
        }
    },{
        scopes: {
            withoutPassword: {
                attributes: { exclude: ['password'] },
            }
        }
    })

    return User;
}
