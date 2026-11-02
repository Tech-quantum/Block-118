import { fsRequest, toFields, fromDoc } from "./api";

export async function loadUnits() {
  const data = await fsRequest("GET", "/documents/units?pageSize=300");
  return (data.documents || [])
    .map(fromDoc)
    .sort((a, b) =>
      a.unitNumber.localeCompare(b.unitNumber, undefined, { numeric: true })
    );
}

export async function loadMyUnit(unitNumber) {
  try {
    const d = await fsRequest(
      "GET",
      "/documents/units/" + encodeURIComponent(unitNumber)
    );
    return [fromDoc(d)];
  } catch (err) {
    if (err.status === 404) return [];
    throw err;
  }
}

export async function seedUnits() {
  for (let floor = 1; floor <= 10; floor++) {
    for (let u = 1; u <= 4; u++) {
      const unitNumber = `${floor}0${u}`;
      await fsRequest("PATCH", "/documents/units/" + unitNumber, {
        fields: toFields({
          unitNumber,
          floor,
          owner: null,
          status: "vacant",
          debt: 0,
        }),
      });
    }
  }
}

export async function updateUnit(unitNumber, data) {
  const mask = Object.keys(data)
    .map((k) => "updateMask.fieldPaths=" + encodeURIComponent(k))
    .join("&");
  await fsRequest(
    "PATCH",
    "/documents/units/" + encodeURIComponent(unitNumber) + "?" + mask,
    { fields: toFields(data) }
  );
}
