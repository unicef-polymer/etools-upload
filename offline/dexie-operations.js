export async function storeAttachmentInDb(fileInfo) {
  await window.Etools.AttachmentsDb.attachments.put(fileInfo);
  //id, formId?, filename, filetype, extraInfo, binaryData
}

export async function getAtachmentById(id) {
  await window.Etools.AttachmentsDb.attachments.get({id: id});
}

export const generateRandomHash = () => {
  return Math.random().toString(36).substring(8);
}

export async function getAtachmentsByIds(ids) {
  await window.Etools.AttachmentsDb.attachments
    .filter(att => ids.includes(att.id)).toArray();
}

