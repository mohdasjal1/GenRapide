import dotenv from "dotenv"
import { app } from "./app.js";
import OpenAI from "openai";
import Configuration from "openai"


dotenv.config({
    path: './.env'
})

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

const openai = new OpenAI(configuration);

async function getMatchPercentage(resumeText, requirementsText) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      // prompt: `Compare this resume: "${resumeText}" with these requirements: "${requirementsText}" and give a match percentage.`,
      messages: [
        {
          "role": "system",
          "content": [
            {
              "type": "text",
              "text": `
                You are an expert in analyzing government Bids/RFPs.
              `
            }
          ]
        },

        {
          "role": "user", "content": `Compare this resume: "${resumeText}" with these requirements: "${requirementsText}" and give a match percentage as a whole number between 0 and 100, no additional text.`
        }
      ],
      // stream: true,
    });

    const matchPercentage = parseInt(response.choices[0].message.content);

    // Implementing conditions based on match percentage
    let resultMessage = '';
    if (matchPercentage < 30) {
        resultMessage = "Analyze the extracted text from the requirements document and resume. If the match is below 30%, respond with: 'This candidate is not suitable for this role based on the current resume.' Provide a brief summary explaining why the candidate does not meet the basic requirements.";

    } else if (matchPercentage >= 30 && matchPercentage < 50) {
        resultMessage = "Analyze the match between the provided resume and requirements document. If the match is between 30-50%, respond with: 'Please review this candidate in detail,' and include specific areas where the candidate partially meets the requirements, highlighting both strengths and gaps.";

    } else if (matchPercentage >= 50) {
        resultMessage = "Analyze the resume in relation to the requirements document. If the match exceeds 50%, respond with: 'The candidate meets most requirements but lacks certain experience.' Then identify any missing experience, specific skills, or years of experience required. Offer suggestions for improvement to align the resume more closely with the stated requirements. Also add a match percentage heading in Response";
    }

    return { matchPercentage, resultMessage };

  }

  async function getResponse(resumeText, requirementsText, matchPercentage, resultMessage) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      // prompt: `Compare this resume: "${resumeText}" with these requirements: "${requirementsText}" and give a match percentage.`,
      messages: [
        {
          "role": "system",
          "content": [
            {
              "type": "text",
              "text": `
                You are an expert in analyzing government Bids/RFPs.
              `
            }
          ]
        },
        {
           "role": "user", "content": `RESUME: "${resumeText}"  REQUIREMENTS: "${requirementsText}",  BASED ON MATCH PERCENTAGE OF ${matchPercentage}, "${resultMessage}"` 
        }
      ],
      // stream: true,
      max_tokens: 4096,
    });

    const finalResult = (response.choices[0].message.content);

    return finalResult;

  }
   

app.get('/', (req, res) => {
    res.send("Api Working.")
})

app.listen(process.env.PORT || 4000, () => {
    console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
})

export {getMatchPercentage, getResponse}
