const cron = require('node-cron');
const db = require("../models");
const { lineApi } = require("../services")

const User = db.user;

const notify = cron.schedule('* * * * *',  function() {
    console.log('=======> Start schedule line notify <=======')
    console.log('-------> '+new Date()+' <-------')

    try {
        User.find({lineToken : {$ne : null}})
        .exec((err,users) => {
            if(err){
                console.error(err);
                return err;
            }

              users.map(async (user) => {
                //Notification
                await lineApi.notify("System has user : "+user.name,user.lineToken)
            })
        })
    } catch (error) {
        console.error('Error , schedule line notify : ',error)
    }

    console.log('-------x '+new Date()+' x-------')
    console.log('=======x End schedule line notify x=======')

});

const schedule = {
    notify
};

module.exports = schedule;