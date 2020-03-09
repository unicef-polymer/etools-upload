export async function storeAttachmentInDb(fileInfo) {
  await window.Etools.AttachmentsDb.attachments.put(fileInfo);
  //id, formId?, filename, filetype, extraInfo, binaryData
}

export async function getAtachment(id) {
  await window.Etools.AttachmentsDb.attachments.get({id: id});
}