const cron = require('node-cron');
const {checkIsActive, sendDeactivationLetter} = require('../controllers/notices');

const job = cron.schedule("00 05 * * *", 
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