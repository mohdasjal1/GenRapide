import { asyncHandler } from "../utils/asyncHandler.js";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { BlobServiceClient } from "@azure/storage-blob";
import { Document, Packer, Paragraph, TextRun } from 'docx';

const AZURE_BLOB_CONNECTION_STRING = process.env.AZURE_BLOB_CONNECTION_STRING;
const CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME;


// MySQL Connection Setup

const connectionConfig = {

  host: process.env.DATABASE_HOST, 
  user: process.env.DATABASE_USER, 
  password: process.env.DATABASE_PASSWORD, 
  database: process.env.DATABASE_NAME, 
  port: process.env.DATABASE_PORT,

};


//  List all the PDFs uploaded through RFP Decoder
const getUserFiles = asyncHandler(async (req, res) => {
  const { userId } = req.params; 

  if (!userId) {
    throw new ApiError("User ID is required", 400);
  }

  // Connect to the database and fetch files for the given user ID
  const connection = await mysql.createConnection(connectionConfig);
  const [files] = await connection.execute(
    "SELECT user_id, file_name, data, created_at, file_size FROM extraction WHERE user_id = ?",
    [userId]
  );

  await connection.end();

  const formatFileSize = (bytes) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-US", options).replace(",", ""); // Ensure formatting without commas
  };

  const formattedFiles = files.map((file) => ({
    ...file,
    file_size: formatFileSize(file.file_size), // Replace raw file size with formatted size
    created_at: formatDate(file.created_at), // Replace raw date with formatted date
  }));

  res.status(200).json({ success: true, data: formattedFiles });
});


//  Get details of a specific PDF.
const getFileDetails = asyncHandler(async (req, res) => {
  const { fileId } = req.params; // Get file ID from request parameters
  const { folderId } = req.params; // Get file ID from request parameters


  if (!folderId) {
    throw new ApiError("File ID is required", 400);
  }

  if (!fileId) {
    throw new ApiError("File ID is required", 400);
  }

  // Connect to the database and fetch file details
  const connection = await mysql.createConnection(connectionConfig);
  const [fileDetails] = await connection.execute(
    "SELECT file_name, data FROM extraction WHERE id = ?",
    [fileId]
  );

  await connection.end();

  if (fileDetails.length === 0) {
    throw new ApiError("File not found", 404);
  }

  const { file_name, data } = fileDetails[0];

  // Construct download links
  const fileDownloadLink = `${req.protocol}://${req.get(
    "host"
  )}/uploads/${file_name}`;
  const wordFilePath = path.join("./downloads", `${file_name}.docx`);

  // Write data to a Word file
  fs.writeFileSync(wordFilePath, data);

  // Return file details and download links
  res.status(200).json({
    success: true,
    data: {
      file_name,
      file_content: data,
      file_download_link: fileDownloadLink,
      word_download_link: `${req.protocol}://${req.get(
        "host"
      )}/downloads/${file_name}.docx`,
    },
  });
});


//  List all the blobs

const listBlobs = async (req, res) => {
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_BLOB_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
  
    try {
      const blobList = [];
      for await (const blob of containerClient.listBlobsFlat()) {
        blobList.push(blob.name);
      }
      res.status(200).json({
        success: true,
        message: "Blobs retrieved successfully",
        data: blobList,
      });
    } catch (error) {
      console.error("Error listing blobs:", error.message);
      res.status(500).json({
        success: false,
        message: "Error listing blobs",
        error: error.message,
      });
    }
};


//  Download the PDF uploaded through RFP Decoder

const downloadBlob = async (req, res) => {
    const { blobName } = req.params;
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_BLOB_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    const blobClient = containerClient.getBlobClient(blobName);
  
    try {
      const downloadBuffer = await blobClient.downloadToBuffer();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${blobName}`);
      res.status(200).send(downloadBuffer);
    } catch (error) {
      console.error("Error downloading blob:", error.message);
      res.status(500).json({
        success: false,
        message: "Error downloading blob",
        error: error.message,
      });
    }
};


//  Generate and download Word document

const downloadDataAsDcox = asyncHandler(async (req, res) => {
  const { blobName } = req.params;

  if (!blobName) {
    throw new Error("Blob name is required");
  }

  // Connect to the database to fetch data
  const connection = await mysql.createConnection(connectionConfig);
  const [rows] = await connection.execute(
    "SELECT data FROM extraction WHERE file_name = ?",
    [blobName]
  );

  await connection.end();

  if (rows.length === 0) {
    throw new Error("No data found for the specified blob name");
  }

  // Combine the "data" column into a single string and parse it into JSON
  const rawData = rows.map((row) => row.data).join("\n\n");
  const parsedData = JSON.parse(rawData);

  // Helper function to parse and format content
  const parseAndFormatContent = (data) => {
    const formattedSections = [];

    data.forEach(({ title, data: content }) => {
      // Add the title as a bold, larger heading
      formattedSections.push(
        new Paragraph({
          children: [new TextRun({ text: title, bold: true, size: 28 })],
          spacing: { after: 200 },
        })
      );

      // Process the content, formatting line breaks and headings
      content.split("\n").forEach((line) => {
        if (line.startsWith("###")) {
          // Subheading
          formattedSections.push(
            new Paragraph({
              children: [new TextRun({ text: line.replace(/^###/, "").trim(), bold: true, size: 24 })],
              spacing: { after: 100 },
            })
          );
        } else if (line.startsWith("##")) {
          // Heading
          formattedSections.push(
            new Paragraph({
              children: [new TextRun({ text: line.replace(/^##/, "").trim(), bold: true, size: 26 })],
              spacing: { after: 150 },
            })
          );
        } else if (line.startsWith("#")) {
          // Main Title or Section
          formattedSections.push(
            new Paragraph({
              children: [new TextRun({ text: line.replace(/^#/, "").trim(), bold: true, size: 28 })],
              spacing: { after: 200 },
            })
          );
        } else if (line.trim()) {
          // Regular paragraph text
          formattedSections.push(
            new Paragraph({
              children: [new TextRun({ text: line.trim() })],
              spacing: { after: 100 },
            })
          );
        }
      });
    });

    return formattedSections;
  };

  // Parse and format the content
  const formattedContent = parseAndFormatContent(parsedData);

  // Create the Word document
  const doc = new Document({
    creator: "YourAppName",
    title: "Candidate Analysis Report",
    sections: [
      {
        children: formattedContent,
      },
    ],
  });

  try {
    // Generate the file buffer
    const buffer = await Packer.toBuffer(doc);

    // Set headers for Word document download
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${blobName.replace(/\..+$/, "")}.docx`
    );

    // Send the file buffer as the response
    res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    console.error("Error generating Word document:", error.message);
    res.status(500).json({
      success: false,
      message: "Error generating Word document",
      error: error.message,
    });
  }
});

  
export { getUserFiles, listBlobs, downloadBlob, downloadDataAsDcox }








