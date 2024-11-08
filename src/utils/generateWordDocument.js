// import { Document, Packer, Paragraph } from "docx";
// import fs from "fs";
// import path from "path";

// export async function generateWordDocument(finalMessage) {
//     const doc = new Document({
//         sections: [
//             {
//                 children: [
//                     new Paragraph(finalMessage),
//                 ],
//             },
//         ],
//     });

//     const filePath = path.join(__dirname, "../public/temp", "final_message.docx");
//     const buffer = await Packer.toBuffer(doc);
//     fs.writeFileSync(filePath, buffer);
//     return filePath;
// }
