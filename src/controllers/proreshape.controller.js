import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const proReshape = asyncHandler(async (req, res) => {

    let { resume, requirements } = req.body
    
    if (!(resume && requirements)) {
        throw new ApiError(401, "Invalid Data")
    }

    resume = "Resume from Backend : " + resume
    requirements = "Requirements from Backend : " + requirements

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                resume: resume, requirements: requirements
            },
            "Response Updated Successfully !"
        )
    )

})

export {
    proReshape
}