require("dotenv").config();

// show object spread works, i.e. babel works
const obj = {
  foo: "bar"
};
export async function handler(event, context) {
  console.log(process.env.TEST);
  console.log("queryStringParameters", event.queryStringParameters);
  return {
    statusCode: 200,
    body: JSON.stringify({ msg: process.env.TEST, ...obj })
  };
}
