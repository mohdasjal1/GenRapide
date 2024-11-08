import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { readFileContent } from "../utils/filereader.js";
import { getMatchPercentage, getResponse } from "../index.js";
import { generateDocxWithResponse } from "../utils/docxGenerator.js";
// import { generateWordDocument } from "../utils/generateworddocument.js";
import { Document, Packer, Paragraph } from "docx";
import path from "path";
import fs from "fs";

const handleText = asyncHandler(async (req, res) => {
  const { resumeText, requirementsText } = req.body;

  if (!(resumeText && requirementsText)) {
    throw new ApiError(401, "Invalid Data");
  }

  try {
    
    const { matchPercentage, resultMessage } = await getMatchPercentage(resumeText, requirementsText);
    const finalResult = await getResponse(resumeText, requirementsText, matchPercentage, resultMessage);



// Generate the DOCX file with the finalResult
const docxFilePath = await generateDocxWithResponse(finalResult);


    return res.json({
      matchPercentage,
      finalResult,
      downloadLink: `${req.protocol}://${req.get("host")}/api/v1/rewriter/download`
    });

    // return res.status(200).json(
    //   new ApiResponse(
    //     200,
    //     {
    //       matchPercentage,
    //       finalResult,
    //       downloadLink: `${req.protocol}://${req.get("host")}/api/v1/rewriter/download`            
    //     },
    //     "Response Updated Successfully !"
    //   )
    // );

  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: "Error generating document" });
  }


});


const handleDownload = async (req, res) => {
  const filePath = path.join(process.cwd(), 'public/temp', 'Candidate_Analysis_Report.docx');
  res.download(filePath, "Candidate_Analysis_Report.docx", (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      res.status(500).send("Could not download file");
    } else {
      fs.unlinkSync(filePath); // Clean up temp file after download
    }
  });
};


export const downloadFinalMessage = asyncHandler((req, res) => {
  const tempFilePath = path.join("public/temp", "final_message.docx");

  // Check if file exists before sending
  if (fs.existsSync(tempFilePath)) {
      res.download(tempFilePath, "Candidate_Analysis_Report.docx", (err) => {
          if (err) {
              console.log("Error in download:", err);
          }
          fs.unlinkSync(tempFilePath); // Delete after sending
      });
  } else {
      res.status(404).json({ error: "File not found" });
  }
});

const handlePdf = async (req, res) => {
  
  const resumeFile = req.files.resumeFile[0];
  const requirementsFile = req.files.requirementsFile[0];

  if (!(resumeFile && requirementsFile)) {
    return res.json({
      success: false,
      message: "File not uploaded successfully",
    });
  }

  try {
    const resumeText = await readFileContent(
      resumeFile.path,
      resumeFile.mimetype
    );
    const requirementsText = await readFileContent(
      requirementsFile.path,
      requirementsFile.mimetype
    );

    // console.log(resumeText);
    

    const { matchPercentage, resultMessage } = await getMatchPercentage(resumeText, requirementsText);

    const finalResult = await getResponse(resumeText, requirementsText,matchPercentage, resultMessage);

    // Generate the DOCX file with the finalResult
    const docxFilePath = await generateDocxWithResponse(finalResult);


    res.json(
      {
      matchPercentage,
      finalResult,
      downloadLink: `${req.protocol}://${req.get("host")}/api/v1/rewriter/download`
      }
  );
    

    
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: "Error reading files" });
  }

//   return res.json({ success: true, message: "File uploaded successfully" });
};



export {
  handlePdf,
  handleText,
  handleDownload
};
