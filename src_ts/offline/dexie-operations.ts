export function storeFileInDexie(fileInfo: any): Promise<any> {
  return window.Etools.AttachmentsDb.attachments.put(fileInfo);
}

export function getFileFromDexieById(id: string): Promise<any> {
  return window.Etools.AttachmentsDb.attachments.get({id: id});
}

export function generateRandomHash(): string {
  return Math.random()
    .toString(36)
    .substring(3)
    .replace(/[^a-z]+/, 'q');
}

export function getFilesFromDexieByIds(ids: string[]): Promise<any> {
  return window.Etools.AttachmentsDb.attachments.filter((att: any) => ids.includes(att.id)).toArray();
}

export function deleteFileFromDexie(id: string): Promise<any> {
  return window.Etools.AttachmentsDb.attachments.delete(id);
}

export function updateParentIdInDexie(oldParentId: string, newParentId: string): any {
  return window.Etools.AttachmentsDb.attachments.where({parentId: oldParentId}).modify({parentId: newParentId});
}

export function updateProvidedPropertyNameInDexie(attId: string, propName: string, val: string): any {
  return window.Etools.AttachmentsDb.attachments.where({id: attId}).modify({[propName]: val});
}

export function deleteByParentIdFromDexie(parentId: string): any {
  return window.Etools.AttachmentsDb.attachments.where({parentId: parentId}).delete();
}

/**
 * Avoid returning all files because they contain the binary data also and it's best to save memory
 */
export function getFileCountByParentIdFromDexie(parentId: string): any {
  return window.Etools.AttachmentsDb.attachments.where({parentId: parentId}).count();
}
