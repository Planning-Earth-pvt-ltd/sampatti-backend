import prisma from "../prisma";
import { Request,Response } from "express";

interface PropertyOwner {
  name:string;
  phoneNumber:string;
  address:string;
}

export const OwnerAdd = async (req:Request<PropertyOwner>,res:Response): Promise<void> => {
    try {
    const {name,phoneNumber,address} = req.body;
    if (!name || !phoneNumber || !address){
      res.status(404).json({  
        message:"Something is missing",
        success:false
      })
    }

    let propertyOwner = await prisma.seller.findUnique({
      where:{phoneNumber},
    })

    if(propertyOwner){
      res.status(404).json({
        message:"Property Owner Already exists, No need to add owner again"
      })
    }

    propertyOwner = await prisma.seller.create({
      data:{
        name,
        phoneNumber,
        address,
      }
    });

    res.status(200).json({
      message:"PropertyOwner Added",
      success:true,
    })
  } catch (error){
    console.log(error);
}
}   
