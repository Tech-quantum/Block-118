const { db } = require('../config/firebase');

async function seed() {
  try {
    const buildingRef = await db.collection('buildings').add({
      name: 'برج آفتاب',
      address: 'تهران، خیابان ولیعصر',
      floors: 10,
      unitsPerFloor: 4,
      totalUnits: 40,
      amenities: ['سالن اجتماعات', 'پارکینگ مهمان', 'روف‌گاردن'],
      managerId: null,
      createdAt: new Date(),
    });

    console.log(`✅ Building created with ID: ${buildingRef.id}`);

    const batch = db.batch();
    for (let floor = 1; floor <= 10; floor++) {
      for (let unit = 1; unit <= 4; unit++) {
        const unitNumber = `${floor}0${unit}`;
        const unitRef = db.collection('units').doc();
        batch.set(unitRef, {
          buildingId: buildingRef.id,
          unitNumber: unitNumber,
          floor: floor,
          area: 100,
          parkingCount: 1,
          storageCount: 1,
          ownershipType: 'owner',
          ownerId: null,
          residentIds: [],
          occupancyStatus: 'vacant',
          balance: 0,
          createdAt: new Date(),
        });
      }
    }
    await batch.commit();
    console.log('✅ 40 units created successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
