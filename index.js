import { GoogleGenAI } from "@google/genai";
import readlineSync from 'readline-sync';
import dotenv from 'dotenv';
dotenv.config();


const History = [];
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// const ai = new GoogleGenAI({ apiKey: "" });


function openWhatsapp({ number, message }) {
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    console.log(`Please open this URL in your browser to send the WhatsApp message:\n${url}`);
    return url;
}


function openTelegram({ username, message }) {
    const url = `https://t.me/${username}`;
    // Telegram does not support pre-filling messages via URL directly.
    // If using a bot, you can use https://t.me/<botname>?start=<payload>
    window.open(url, '_blank');
    return `Telegram opened for ${username} with message: ${message} (message needs to be sent manually)`;
}

function openEmail({ email, subject, body }) {
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
    return `Email client opened for ${email} with subject: ${subject} and body: ${body}`;
}

function openBrowser({ url }) {
    window.open(url, '_blank');
    return `Browser opened for ${url}`;
}







function sum({num1,num2}){
    return num1+num2;
}


function prime({num}){

    if(num<2)
        return false;

    for(let i=2;i<=Math.sqrt(num);i++)
        if(num%i==0) return false

    return true;
}


async function getCryptoPrice({coin}){

   const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coin}`)
   const data = await response.json();

   return data;
}

const sumDeclaration = {
    name:'sum',
    description:"Get the sum of 2 number",
    parameters:{
        type:'OBJECT',
        properties:{
            num1:{
                type:'NUMBER',
                description: 'It will be first number for addition ex: 10'
            },
            num2:{
                type:'NUMBER',
                description:'It will be Second number for addition ex: 10'
            }
        },
        required: ['num1','num2']   
    }
}



const primeDeclaration = {
    name:'prime',
    description:"Get if number if prime or not",
    parameters:{
        type:'OBJECT',
        properties:{
            num:{
                type:'NUMBER',
                description: 'It will be the number to find it is prime or not ex: 13'
            },
        },
        required: ['num']   
    }
}



const cryptoDeclaration = {
    name:'getCryptoPrice',
    description:"Get the current price of any crypto Currency like bitcoin",
    parameters:{
        type:'OBJECT',
        properties:{
            coin:{
                type:'STRING',
                description: 'It will be the crypto currency name, like bitcoin'
            },
        },
        required: ['coin']   
    }
}

const openWhatsappDeclaration = {
    name: 'openWhatsapp',
    description: 'Open WhatsApp with a message to a specific number',
    parameters: {
        type: 'OBJECT',
        properties: {
            number: {
                type: 'STRING',
                description: 'The phone number to send the message to, in international format (e.g., +1234567890)'
            },
            message: {
                type: 'STRING',
                description: 'The message to send via WhatsApp'
            }
        },
        required: ['number', 'message']
    }
};

const openTelegramDeclaration = {
    name: 'openTelegram',
    description: 'Open Telegram with a message to a specific number',
    parameters: {
        type: 'OBJECT',
        properties: {
            username: {
                type: 'STRING',
                description: 'The phone number to send the message to, in international format (e.g., +1234567890)'
            },
            message: {
                type: 'STRING',
                description: 'The message to send via Telegram'
            }
        },
        required: ['number', 'message']
        }
    } ;



const openEmailDeclaration = {
    name: 'openEmail',
    description: 'Open Email client with a subject and body',
    parameters: {
        type: 'OBJECT',
        properties: {
            subject: {
                type: 'STRING',
                description: 'The subject of the email'
            },
            body: {
                type: 'STRING',
                description: 'The body of the email'
            },
            email: {
                type: 'STRING',
                description: 'The email address of the recipient'
            }
        },
        required: ['email', 'subject', 'body']
    }
}; 


const openBrowserDeclaration = {
    name: 'openBrowser',
    description: 'Open a web browser to a specific URL',
    parameters: {
        type: 'OBJECT',
        properties: {
            url: {
                type: 'STRING',
                description: 'The URL to open in the web browser'
            }
        },
        required: ['url']
    }
};








const availableTools = {
    sum:sum,
    prime:prime,
    getCryptoPrice:getCryptoPrice,
    openWhatsapp: openWhatsapp,
    openTelegram: openTelegram,
    openBrowser: openBrowser,
    openEmail: openEmail

}



async function runAgent(userProblem) {

    History.push({
        role:'user',
        parts:[{text:userProblem}]
    });

   
    while(true){
    
   const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: History,
    config: {
        systemInstruction: `You are an AI Agent, You have access of 3 available tools like to
        to find sum of 2 number, get crypto price of any currency and find a number is prime or not, 
        You can also open whatsapp, telegram, email and browser with given parameters.
        You can use these tools to answer user query, if user ask about sum of 2 number you can use sum tool,
        if user ask about crypto price you can use getCryptoPrice tool, if user ask about prime number you can use prime tool,
        if user ask to open whatsapp you can use openWhatsapp tool, if user ask to open telegram you can use openTelegram tool,
        if user ask to open email you can use openEmail tool, if user ask to open browser you can use openBrowser tool.
        You can also answer user query directly if you don't need help of these tools.
       
        Use these tools whenever required to confirm user query.
        If user ask general question you can answer it directly if you don't need help of these three tools`,
    tools: [{

        
      functionDeclarations: [sumDeclaration,primeDeclaration,cryptoDeclaration,openWhatsappDeclaration,openEmailDeclaration]
    }],
    },
   });


   if(response.functionCalls&&response.functionCalls.length>0){
    
    console.log(response.functionCalls[0]);
    const {name,args} = response.functionCalls[0];

    const funCall =  availableTools[name];
    const result = await funCall(args);

    const functionResponsePart = {
      name: name,
      response: {
        result: result,
      },
    };
   
    // model 
    History.push({
      role: "model",
      parts: [
        {
          functionCall: response.functionCalls[0],
        },
      ],
    });

    // result Ko history daalna

    History.push({
      role: "user",
      parts: [
        {
          functionResponse: functionResponsePart,
        },
      ],
    });
   }
   else{

    History.push({
        role:'model',
        parts:[{text:response.text}]
    })
    console.log(response.text);
    break;
   }


  }




}


async function main() {
    const userProblem = readlineSync.question("Ask me anything--> ");
    await runAgent(userProblem);
    main();
}


main();





