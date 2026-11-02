import { fsRequest, toFields, fromDoc } from "./api";

// unit = null برای ادمین (همه درخواست‌ها)
export async function loadRequests(unit) {
  let docs;
  if (unit) {
    const rows = await fsRequest("POST", "/documents:runQuery", {
      structuredQuery: {
        from: [{ collectionId: "requests" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "unit" },
            op: "EQUAL",
            value: { stringValue: unit },
          },
        },
      },
    });
    docs = rows.filter((r) => r.document).map((r) => r.document);
  } else {
    const data = await fsRequest("GET", "/documents/requests?pageSize=300");
    docs = data.documents || [];
  }
  return docs
    .map(fromDoc)
    .sort(
      (a, b) =>
        ((b.createdAt && b.createdAt.seconds) || 0) -
        ((a.createdAt && a.createdAt.seconds) || 0)
    );
}

export async function addRequest({ unit, title, description }) {
  await fsRequest("POST", "/documents/requests", {
    fields: toFields({
      unit,
      title,
      description,
      status: "pending",
      createdAt: new Date(),
    }),
  });
}

export async function setRequestStatus(id, status) {
  await fsRequest(
    "PATCH",
    "/documents/requests/" +
      encodeURIComponent(id) +
      "?updateMask.fieldPaths=status",
    { fields: toFields({ status }) }
  );
}
