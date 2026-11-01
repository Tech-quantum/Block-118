import {
  collection,
  addDoc,
  getDocsFromServer,
  query,
  where,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// unit = null برای ادمین (همه درخواست‌ها)
export async function loadRequests(unit) {
  const col = collection(db, "requests");
  const q = unit ? query(col, where("unit", "==", unit)) : col;
  const snap = await getDocsFromServer(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort(
      (a, b) =>
        (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
    );
}

export async function addRequest({ unit, title, description }) {
  await addDoc(collection(db, "requests"), {
    unit,
    title,
    description,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

export async function setRequestStatus(id, status) {
  await updateDoc(doc(db, "requests", id), { status });
}
