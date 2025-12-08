const Contract = require('../models/Contract');
const Service = require('../models/Service');

async function archiveCompletedItems() {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const contractsToArchive = await Contract.find({
      status: 'completed',
      completedDate: { $lte: oneMonthAgo }
    });
    
    const servicesToArchive = await Service.find({
      status: 'completed',
      completedDate: { $lte: oneMonthAgo }
    });
    
    let archivedCount = 0;
    
    for (const contract of contractsToArchive) {
      contract.status = 'archived';
      contract.archivedDate = new Date();
      await contract.save();
      archivedCount++;
    }
    
    for (const service of servicesToArchive) {
      service.status = 'archived';
      service.archivedDate = new Date();
      await service.save();
      archivedCount++;
    }
    
    if (archivedCount > 0) {
      console.log(`[${new Date().toISOString()}] Auto-archived ${archivedCount} completed items (${contractsToArchive.length} contracts, ${servicesToArchive.length} services)`);
    }
    
    return archivedCount;
  } catch (error) {
    console.error('Auto-archive error:', error);
    return 0;
  }
}

function startArchiveScheduler() {
  console.log('Archive scheduler started - checking daily at midnight');
  
  setInterval(async () => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      await archiveCompletedItems();
    }
  }, 60000);
  
  archiveCompletedItems();
}

module.exports = { archiveCompletedItems, startArchiveScheduler };

