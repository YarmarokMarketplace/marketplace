const cron = require('node-cron');
const {checkIsActive} = require('../controllers/notices');

const job = cron.schedule("05 10 * * *", 
async function () {
    await checkIsActive();
},
    {
    start: false,
    timeZone: 'Europe/Kiev'
    },
);

module.exports = {
    job,
};