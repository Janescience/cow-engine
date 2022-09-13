const cron = require('node-cron');

const notify = cron.schedule('* * * * *', function() {
    console.log('running a task every minute');
});

const schedule = {
    notify
};

module.exports = schedule;