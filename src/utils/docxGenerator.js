// // utils/docxGenerator.js

// import fs from 'fs';
// import path from 'path';
// import { Document, Packer, Paragraph, TextRun } from 'docx';

// export async function generateDocxWithResponse(responseText, fileName = "Candidate_Analysis_Report.docx") {
//   // Initialize a new Document
//   const doc = new Document(
//     {
//         creator: "YourAppName",
//         title: "Resume Match Report",
//         sections: [
//             {
//               children: [
//                 // Create and add formatted paragraphs based on response text
//                 new Paragraph({
//                   children: responseText.split(/(\*\*.+?\*\*)/).map((segment) => {
//                     if (segment.startsWith("**") && segment.endsWith("**")) {
//                       // Bold text segment
//                       return new TextRun({ text: segment.replace(/\*\*/g, ''), bold: true });
//                     } else {
//                       // Regular text segment
//                       return new TextRun(segment);
//                     }
//                   }),
//                 }),
//               ],
//             },
//           ],
//     }
//   );

//   // Split by ** markers to identify bold text parts and create formatted paragraphs
//   const segments = responseText.split(/(\*\*.+?\*\*)/); // Split on **...**
//   const formattedParagraphs = segments.map((segment) => {
//     if (segment.startsWith("**") && segment.endsWith("**")) {
//       // Bold text segment
//       return new TextRun({ text: segment.replace(/\*\*/g, ''), bold: true });
//     } else {
//       // Regular text segment
//       return new TextRun(segment);
//     }
//   });

//   // Add the formatted paragraph to the document
//   doc.addSection({
//     children: [new Paragraph({ children: formattedParagraphs })],
//   });

//   // Generate the file buffer and write it to a temporary path
//   const buffer = await Packer.toBuffer(doc);
//   const filePath = path.join(process.cwd(), 'public/temp', fileName); // Ensure a temp folder exists
//   fs.writeFileSync(filePath, buffer);

//   return filePath;
// }


// utils/docxGenerator.js

import fs from 'fs';
import path from 'path';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export async function generateDocxWithResponse(responseText, fileName = "Candidate_Analysis_Report.docx") {
  // Initialize a new Document with sections and formatted paragraphs
  const doc = new Document({
    creator: "YourAppName",
    title: "Resume Match Report",
    sections: [
      {
        children: [
          // Create and add formatted paragraphs based on response text
          new Paragraph({
            children: responseText.split(/(\*\*.+?\*\*)/).map((segment) => {
              if (segment.startsWith("**") && segment.endsWith("**")) {
                // Bold text segment
                return new TextRun({ text: segment.replace(/\*\*/g, ''), bold: true });
              } else {
                // Regular text segment
                return new TextRun(segment);
              }
            }),
          }),
        ],
      },
    ],
  });

  // Generate the file buffer and write it to a temporary path
  const buffer = await Packer.toBuffer(doc);
  const filePath = path.join(process.cwd(), 'public/temp', fileName); // Ensure 'public/temp' folder exists
  fs.writeFileSync(filePath, buffer);

  return filePath;
}
