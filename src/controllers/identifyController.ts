import { Request, Response } from 'express';
import prisma from '../prisma/prismaClient';

export const identifyController = async (req:Request, res:Response) => {
    const { email, phoneNumber } = req.body;
    if (!email && !phoneNumber) {
        return res.status(400).json({ error: 'Either email or phoneNumber must be provided' });
      }

    try{
        const contacts = await prisma.contact.findMany({
            where: {
              OR: [
                { email },
                { phoneNumber },
              ],
            },
          });

        if (contacts.length === 0) {
            const newContact = await prisma.contact.create({
              data: {
                email,
                phoneNumber,
                linkPrecedence: 'primary',
              },
            });
      
        return res.status(200).json({
              contact: {
                primaryContactId: newContact.id,
                emails: [newContact.email],
                phoneNumbers: [newContact.phoneNumber],
                secondaryContactIds: [],
              },
            });
          }
    }
    catch (error) {
        console.error('Error identifying contact:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
}