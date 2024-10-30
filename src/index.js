import dotenv from "dotenv"
import { app } from "./app.js";
// import { Configuration, OpenAIApi } from 'openai';
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
      model: "gpt-4",
      // prompt: `Compare this resume: "${resumeText}" with these requirements: "${requirementsText}" and give a match percentage.`,
      messages: [{ role: "user", content: `Compare this resume: "${resumeText}" with these requirements: "${requirementsText}" and give a match percentage.` }],
      // stream: true,
      max_tokens: 50,
    });

    // for await (const chunk of response) {
    //   // process.stdout.write(chunk.choices[0]?.delta?.content || "");
    //   console.log(chunk.choices[0]?.delta?.content || "");
    // return response.choices.content;
    return response.choices[0].message.content;

  }

   
  




app.get('/', (req, res) => {
    res.send("Api Working.")
})





app.listen(process.env.PORT || 8000, () => {
    console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
})


export {getMatchPercentage}
