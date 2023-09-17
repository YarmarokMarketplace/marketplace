const cron = require('node-cron');
const {checkIsActive, sendDeactivationLetter} = require('../controllers/notices');

const job = cron.schedule("00 04 * * *", 
async function () {
    await checkIsActive();
    await sendDeactivationLetter()
},
    {
    start: false,
    timeZone: 'Europe/Kiev'
    },
);

module.exports = {
    job,
};