import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function loadUnits() {
  const snap = await getDocs(collection(db, "units"));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => a.unitNumber.localeCompare(b.unitNumber));
}

export async function seedUnits() {
  for (let floor = 1; floor <= 10; floor++) {
    for (let u = 1; u <= 4; u++) {
      const unitNumber = `${floor}0${u}`;
      await setDoc(doc(db, "units", unitNumber), {
        unitNumber,
        floor,
        owner: null,
        status: "vacant",
        debt: 0,
      });
    }
  }
}
