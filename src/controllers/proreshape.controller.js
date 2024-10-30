import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { readFileContent } from "../utils/filereader.js";
import { getMatchPercentage } from "../index.js";

const proReshape = asyncHandler(async (req, res) => {
  let { resume, requirements } = req.body;

  if (!(resume && requirements)) {
    throw new ApiError(401, "Invalid Data");
  }

  resume = "Resume from Backend : " + resume;
  requirements = "Requirements from Backend : " + requirements;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        resume: resume,
        requirements: requirements,
      },
      "Response Updated Successfully !"
    )
  );
});

const rewriter = async (req, res) => {
  
  const resumeFile = req.files.resume[0];
  const requirementsFile = req.files.requirements[0];

  if (!(resumeFile && requirementsFile)) {
    return res.json({
      success: true,
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

    const matchPercentage = await getMatchPercentage(resumeText, requirementsText);

    res.json({ matchPercentage });

    // Now you can use resumeText and requirementsText with OpenAI API
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: "Error reading files" });
  }

//   return res.json({ success: true, message: "File uploaded successfully" });
};



// let hits = "Asjal"

// const hit = asyncHandler(async (req, res) => {
//     return res.
//     status(200).
//     json(
//         new ApiResponse(
//             200,
//             {hits: hits}
//         ),
//         "Response updated"
//     )
// })

export {
  proReshape,
  rewriter,
  // hit
};
