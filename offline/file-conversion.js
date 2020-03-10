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

export function getBlob(fileUrl) {
  //** Using XHR */
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

  //** Using fetch */
  let response = await fetch(fileUrl);
  return response.blob();
}

export function getFileUrl(file) {
  return window.URL.createObjectURL(file);
}