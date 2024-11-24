# Bitespeed Backend: Identity Reconciliation

---

## Table of Contents

- [Features](#features)
- [Database Schema](#database-schema)
- [Testing the API](#testing-the-api)
- [Technologies Used](#technologies-used)

---

## Features

- Creates new contact entries when no match is found.
- Links existing contacts under a primary contact for related entries.
- Dynamically updates contact precedence (primary or secondary) as required.
- Consolidates contact information to return comprehensive data.

---

## Database Schema

The application uses a single table named `Contact`:

```prisma
model Contact {
  id             Int                   @id @default(autoincrement())
  phoneNumber    String?
  email          String?
  linkedId       Int?                  // the ID of another Contact linked to this one
  linkPrecedence "secondary" | "primary" // "primary" if it's the first Contact in the link
  createdAt      DateTime              @default(now())
  updatedAt      DateTime              @updatedAt
  deletedAt      DateTime?
}
```

---

## Testing the API

### Endpoint: `/identify`

**Method**: `POST`

**Test URL**:  
`https://bitespeed-assignment-8x6k.onrender.com/identify`

### Steps to Test

1. Use any API testing tool like **Postman**.
2. Send a `POST` request to the URL mentioned above.
3. Provide the request body as either `email`, `phoneNumber`, or both.

### Request Body Example:

#### Case 1: Providing both email and phone number
```json
{
  "email": "example@gmail.com",
  "phoneNumber": "1234567890"
}
```

#### Case 2: Providing only phone number or email address
```json
{
  "phoneNumber": "789"
}
```

### Response Body Example:

#### Case 1: New Contact Created when no match is found.
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["example@gmail.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": []
  }
}
```

#### Case 2: Existing Contact Found
```json
{
  "contact": {
    "primaryContactId": 9,
    "emails": ["789@gmail.com", "987@gmail.com"],
    "phoneNumbers": ["789"],
    "secondaryContactIds": [10, 11]
  }
}
```

### Error Response:
If both `email` and `phoneNumber` are missing:

```json
{
  "error": "Email or Phone number is required"
}
```

---


## Technologies Used

- **Backend Framework**: Node.js + Express.js  
- **ORM**: Prisma  
- **Database**: MySQL
