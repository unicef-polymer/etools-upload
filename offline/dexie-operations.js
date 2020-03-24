export function storeFileInDexie(fileInfo) {
  return window.Etools.AttachmentsDb.attachments.put(fileInfo); 
}

export function getFileFromDexieById(id) {
  return window.Etools.AttachmentsDb.attachments.get({id: id});
}

export const generateRandomHash = () => {
  return Math.random().toString(36).substring(8);
}

export function getFilesFromDexieByIds(ids) {
  return window.Etools.AttachmentsDb.attachments
    .filter(att => ids.includes(att.id)).toArray();
}

export function deleteFileFromDexie(id) {
  return window.Etools.AttachmentsDb.attachments.delete(id);
}

