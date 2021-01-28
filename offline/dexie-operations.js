export function storeFileInDexie(fileInfo) {
  return window.Etools.AttachmentsDb.attachments.put(fileInfo);
}

export function getFileFromDexieById(id) {
  return window.Etools.AttachmentsDb.attachments.get({id: id});
}

export const generateRandomHash = () => {
  return Math.random().toString(36).substring(3).replace(/[^a-z]+/, 'q');
}

export function getFilesFromDexieByIds(ids) {
  return window.Etools.AttachmentsDb.attachments
    .filter(att => ids.includes(att.id)).toArray();
}

export function deleteFileFromDexie(id) {
  return window.Etools.AttachmentsDb.attachments.delete(id);
}

export function updateParentIdInDexie(oldParentId, newParentId) {
  return window.Etools.AttachmentsDb.attachments
  .where({parentId: oldParentId}).modify({parentId: newParentId});
}

export function deleteByParentIdFromDexie(parentId) {
  return window.Etools.AttachmentsDb.attachments
  .where({parentId: parentId}).delete();
}

/**
 * Avoid returning all files because they contain the binary data also and it's best to save memory
 */
export function getFileCountByParentIdFromDexie(parentId) {
  return window.Etools.AttachmentsDb.attachments
  .where({parentId: parentId}).count();
}
