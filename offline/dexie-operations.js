export async function storeAttachmentInDb(fileInfo) {
  await window.Etools.AttachmentsDb.attachments.put(fileInfo);
  //id, formId?, filename, filetype, extraInfo, binaryData
}

export function getAtachmentById(id) {
  return window.Etools.AttachmentsDb.attachments.get({id: id});
}

export const generateRandomHash = () => {
  return Math.random().toString(36).substring(8);
}

export function getAtachmentsByIds(ids) {
  return window.Etools.AttachmentsDb.attachments
    .filter(att => ids.includes(att.id)).toArray();
}

export async function deleteUploadedFilesFromDb(ids) {
  await getAtachmentsByIds(ids).delete();
}

