const { CronJob } = require('cron');
const {Op} = require('sequelize');
const ChatHistory = require('../models/chat-history');
const ArchivedChat = require('../models/archeived-chat');
exports.job = new CronJob(
    '0 0 * * *', 
    function () {
        archiveOldRecords();
    },
    null,
    false,
    'Asia/Kolkata'
);

async function archiveOldRecords() {
    try {
        console.log("deleting started");
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      // Find records to archive
      const recordsToArchive = await ChatHistory.findAll({
        where: {
          date_time: {
            [Op.lt]: tenDaysAgo,
          },
        },
      });
      console.log(recordsToArchive);
  
      // Archive records
      await Promise.all(
        recordsToArchive.map(async (record) => {
          await ArchivedChat.create({
            id: record.id,
            message: record.message,
            date_time: record.date_time,
            isImage:record.isImage,
            UserId: record.UserId,
            GroupId: record.GroupId
          });
          await record.destroy();
        })
      );
  
      console.log('Old records archived successfully.');
    } catch (error) {
      console.error('Error archiving old records:', error);
    }
  }

// async function archiveOldRecords() {
//     try {
//       console.log("deleting started");
  
//       const fiveMinutesAgo = new Date();
//       fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
  
//       // Find records to archive
//       const recordsToArchive = await ChatHistory.findAll({
//         where: {
//           date_time: {
//             [Op.lt]: fiveMinutesAgo,
//           },
//         },
//       });  
//       await Promise.all(
//         recordsToArchive.map(async (record) => {
//           await ArchivedChat.create({
//             id: record.id,
//             message: record.message,
//             date_time: record.date_time,
//             UserId: record.UserId,
//             GroupId: record.GroupId
//           });
//           await record.destroy();
//         })
//       );
  
//       console.log('Old records archived successfully.');
//     } catch (error) {
//       console.error('Error archiving old records:', error);
//     }
//   }