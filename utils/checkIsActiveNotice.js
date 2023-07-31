const cron = require('node-cron');
const {Notice} = require('../db/models/notices');

const checkIsActive = async () => {
    const today = new Date();
    const thirtyDays = today.getTime() - (30*24*60*60*1000);

    await Notice.aggregate([
        { $match: 
            { createdAt: {
                $lt: new Date(thirtyDays)} 
            }
        }, 
        {
            $merge: {
                into: "inactiveNotice",
                on: "_id",
                whenMatched: "replace",
                whenNotMatched: "insert"
            }
        }
        ]);
};


const job = cron.schedule("00 */1 * * * *", 
function () {
    console.log("Every minute");
    checkIsActive();
},
    {
    start: true, // start immediately
    timeZone: 'Europe/Kiev'
    },
);

job.start();