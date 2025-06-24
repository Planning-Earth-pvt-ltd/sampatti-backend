import twilio from "twilio";
import { Request, Response } from "express";
import prisma from "../prisma";


const accountSID = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSID = process.env.TWILIO_SERVICE_SID;


if (!serviceSID) {
  throw new Error("TWILIO_SERVICE_SID is not defined in environment variables.");
}

const client = twilio(accountSID,authToken);


interface SendOtpRequestBody{
 phoneNumber:string;
 fullName?: string | null;
}

export const sendOTP = async (req:Request<{},{},SendOtpRequestBody>,res:Response):Promise<void> => {
  try {
   const {phoneNumber, fullName} = req.body; 

    
   const user = await prisma.user.findFirst({
     where:{
      phoneNumber
     }
   });

     let isExistingUser = false;

   // Checks if the user Exists or not

   if(user){
     isExistingUser = true;


     // if user exists and fullname is sent , block signup

     if(fullName != null){
        res.status(400).json({
         message:"User Already Exist, Kindly Login",
         success:false,
         isExistingUser:true,
       })
       return;
     }
   } else{
     //if user does not exist and fullname not send, block login

     if(fullName == null){
        res.status(401).json({
         message:"User not registered, Kindly SignUP",
         success:false,
         isExistingUser:false,
       })
       return;
     }
   }

   // Send OTP using twilio
   
   await client.verify.v2.services(serviceSID).verifications.create({
      to: `+91${phoneNumber}`,
      channel: "sms",
    });

     res.status(200).json({
      message: "OTP sent successfully",
      success: true,
      isExistingUser,
    });

   
  } catch (error:unknown) {
    console.error(error);
      res.status(500).json({
      message: "Failed to send OTP",
      success: false,
    });
    
  }
}
