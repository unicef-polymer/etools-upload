export function getBlobAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('loadend', (e) => {
      resolve(reader.result);
    });
    reader.addEventListener('error', reject);
    reader.readAsText(file);
  });
}

export function getArrayBuffer(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('loadend', (e) => {
      resolve(reader.result);
    });
    reader.addEventListener('error', reject);
    reader.readAsArrayBuffer(blob);
  });
}

export async function getBlob(fileUrl) {
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
  const response = await fetch(fileUrl);
  return response.blob();
}

export function getFileUrl(file, doNotRevokeUrl) {
  const tempUrl = window.URL.createObjectURL(file);
  if (!doNotRevokeUrl) {
    setTimeout(() => {
      window.URL.revokeObjectURL(tempUrl); // For Memory management
    }, 3000);
  }
  return tempUrl;
}
