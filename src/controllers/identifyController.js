const prisma = require('../prisma/prismaClient');

const identifyController = async (req, res) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: 'Either email or phoneNumber must be provided.' });
  }

  try {
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

    if (phoneNumber && !email) {
      const existingContact = contacts.find(contact => contact.phoneNumber === phoneNumber);
      if (existingContact) {
        const primaryContact = contacts.find(contact => contact.linkPrecedence === 'primary') || existingContact;

        const allContacts = await prisma.contact.findMany({
          where: {
            OR: [
              { id: primaryContact.id },
              { linkedId: primaryContact.id },
            ],
          },
        });

        const emails = Array.from(new Set(allContacts.map(contact => contact.email).filter(Boolean)));
        const phoneNumbers = Array.from(new Set(allContacts.map(contact => contact.phoneNumber).filter(Boolean)));
        const secondaryContactIds = allContacts
          .filter(contact => contact.id !== primaryContact.id)
          .map(contact => contact.id);

        return res.status(200).json({
          contact: {
            primaryContactId: primaryContact.id,
            emails,
            phoneNumbers,
            secondaryContactIds,
          },
        });
      }
    }

    let primaryContact = contacts.find(contact => contact.linkPrecedence === 'primary') || contacts[0];

    const phoneNumberExists = contacts.some(contact => contact.phoneNumber === phoneNumber);
    const emailExists = contacts.some(contact => contact.email === email);

    if (phoneNumberExists && !emailExists) {
      const newSecondaryContact = await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkPrecedence: 'secondary',
          linkedId: primaryContact.id,
        },
      });

      contacts.push(newSecondaryContact);
    }

    for (const contact of contacts) {
      if (contact.linkPrecedence === 'primary' && contact.id !== primaryContact.id) {
        await prisma.contact.update({
          where: { id: contact.id },
          data: {
            linkPrecedence: 'secondary',
            linkedId: primaryContact.id,
          },
        });
      }
    }

    const allContacts = await prisma.contact.findMany({
      where: {
        OR: [
          { id: primaryContact.id },
          { linkedId: primaryContact.id },
        ],
      },
    });

    const emails = Array.from(new Set(allContacts.map(contact => contact.email).filter(Boolean)));
    const phoneNumbers = Array.from(new Set(allContacts.map(contact => contact.phoneNumber).filter(Boolean)));
    const secondaryContactIds = allContacts
      .filter(contact => contact.id !== primaryContact.id)
      .map(contact => contact.id);

    return res.status(200).json({
      contact: {
        primaryContactId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds,
      },
    });
  } catch (error) {
    console.error('Error identifying contact:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { identifyController };
