export function getBlobAsText(file: File): Promise<string> {
  return new Promise((resolve: (arg: any) => void, reject: () => void) => {
    const reader: FileReader = new FileReader();
    reader.addEventListener('loadend', () => {
      resolve(reader.result);
    });
    reader.addEventListener('error', reject);
    reader.readAsText(file);
  });
}

export function getArrayBuffer(blob: File): Promise<ArrayBuffer> {
  return new Promise((resolve: (arg: any) => void, reject: () => void) => {
    const reader: FileReader = new FileReader();
    reader.addEventListener('loadend', () => {
      resolve(reader.result);
    });
    reader.addEventListener('error', reject);
    reader.readAsArrayBuffer(blob);
  });
}

export async function getBlob(fileUrl: string): Promise<Blob> {
  //* * Using XHR */
  // return new Promise((resolve, reject) => {
  //   let xhr = new XMLHttpRequest();
  //   let blob;
  //   xhr.open('GET', blobUrl, true);
  //   xhr.responseType = 'blob';
  //   xhr.addEventListener('load', function () {
  //     if (xhr.status === 200) {
  //       blob = xhr.response;
  //       resolve(blob);
  //     }
  //   });
  //   xhr.send();
  // });

  //* * Using fetch */
  const response: Body = await fetch(fileUrl);
  return response.blob();
}

export function getFileUrl(file: File, doNotRevokeUrl?: boolean): string {
  const tempUrl: string = window.URL.createObjectURL(file);
  if (!doNotRevokeUrl) {
    setTimeout(() => {
      window.URL.revokeObjectURL(tempUrl); // For Memory management
    }, 3000);
  }
  return tempUrl;
}
