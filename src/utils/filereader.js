// utils/fileReader.js

// import fs from 'fs';
// import pdfParse from 'pdf-parse';
// import mammoth from 'mammoth';

// export async function readFileContent(filePath, mimeType) {
//   if (mimeType === 'application/pdf') {
//     const dataBuffer = fs.readFileSync(filePath);
//     const pdfData = await pdfParse(dataBuffer);
//     return pdfData.text;
//   } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
//     const result = await mammoth.extractRawText({ path: filePath });
//     return result.value;
//   } else {
//     throw new Error('Unsupported file format');
//   }
// }

import fs from 'fs';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function readFileContent(filePath, mimeType) {
  const path = './test/data/05-versions-space.pdf';

if (fs.existsSync(path)) {
  const data = fs.readFileSync(path);
  // Process the file as needed
} else {
  console.warn(`File not found: ${path}`);
  // Handle the missing file scenario
}
  

  // Check if the file exists before reading
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  if (mimeType === 'application/pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text;
  } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } else {
    throw new Error('Unsupported file format');
  }
}
