import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { readFileContent } from "../utils/filereader.js";
import { getMatchPercentage, getResponse } from "../index.js";
// import proReshapeModel from "../models/proreshape.models.js";

const handleText = asyncHandler(async (req, res) => {
  const { resumeText, requirementsText } = req.body;

  if (!(resumeText && requirementsText)) {
    throw new ApiError(401, "Invalid Data");
  }

  try {
    
    const { matchPercentage, resultMessage } = await getMatchPercentage(resumeText, requirementsText);
    const finalResult = await getResponse(resumeText, requirementsText, matchPercentage, resultMessage);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          matchPercentage,
          finalResult
        },
        "Response Updated Successfully !"
      )
    );

  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: "Error reading text" });
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

    res.json({ matchPercentage, resultMessage, finalResult });
    // res.json({matchPercentage, resultMessage})

    // Now you can use resumeText and requirementsText with OpenAI API
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: "Error reading files" });
  }

//   return res.json({ success: true, message: "File uploaded successfully" });
};

export {
  handlePdf,
  handleText
};
