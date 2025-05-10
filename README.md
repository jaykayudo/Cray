# Cray - Private Voting Protocol

Cray is a privacy preserving voting platform that leverages zero-knowledge proofs to ensure voter privacy and anonymity while maintaining the integrity of the voting process. Built with Next.js, TypeScript, and Noir circuits, Cray provides a secure and user-friendly interface for creating and participating in private voting campaigns.

## 🌟 Features

### Privacy-First Voting
- Zero-knowledge proof-based authentication
- Anonymous voting with verifiable results
- Age and country verification without revealing personal data
- Whitelist verification while maintaining privacy

### Campaign Management
- Create and manage voting campaigns
- Set campaign duration and eligibility criteria
- Real-time campaign status tracking
- Secure voter registration

### User Experience
- Modern, responsive UI built with Next.js and Tailwind CSS
- Real-time countdown for campaign phases
- Intuitive campaign creation and voting process
- Status indicators for campaign phases (upcoming, active, ended)

![Screenshot from 2025-05-10 03-10-26](https://github.com/user-attachments/assets/3abbc465-fb3b-4438-8ef5-4d176f106937)


### Privacy Features
- Password verification using Noir circuits
- Age verification without revealing actual age
- Country verification without exposing location
- Whitelist verification while maintaining anonymity

![Screenshot from 2025-05-10 03-45-14](https://github.com/user-attachments/assets/cdc75da4-5d8a-4138-b348-85ba343457b4)

![Screenshot from 2025-05-10 03-45-26](https://github.com/user-attachments/assets/750bad0b-ab58-4aa4-9db5-40acc7ab09f1)



## 🏗 Architecture

### Frontend (cray-frontend)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI Components**: Custom components with Tailwind CSS
- **State Management**: React Context for auth state
- **API Integration**: Axios-based API client
- **Authentication**: JWT with Noir circuit verification

### Backend (cray-backend)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT with Noir circuit verification
- **API**: RESTful endpoints for campaign and user management

### Noir Circuits
The project uses Noir circuits for zero-knowledge proofs in several key areas:

1. **Password Verification**
   - Proves knowledge of password hash without revealing the password
   - Circuit: `check_password.json`
   - Verifies password matches stored hash

2. **Age Verification**
   - Proves user meets age requirement without revealing actual age
   - Circuit: `check_age.json`
   - Verifies age is above threshold

3. **Country Verification**
   - Proves user is from allowed country without revealing location
   - Circuit: `check_country.json`
   - Verifies country is in whitelist

4. **Whitelist Verification**
   - Proves user is in whitelist without revealing identity
   - Circuit: `check_whitelist.json`
   - Verifies user is authorized to vote

[Screenshot of Noir Circuit Integration]

## 🔧 Development Environment

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Noir 0.10.0+
- Git

### Frontend Setup
```bash
cd cray-frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd cray-backend
npm install
npm run dev
```

### Noir Circuit Setup
```bash
cd cray_noir
nargo compile
```

### Environment Variables
Create `.env` files in both frontend and backend directories:

Frontend (.env):
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Backend (.env):
```
DATABASE_URL=postgresql://user:password@localhost:5432/cray
JWT_SECRET=your_jwt_secret
```

## 🚀 Project Structure

```
cray/
├── cray-frontend/           # Next.js frontend application
│   ├── app/                # Next.js app router pages
│   ├── components/         # React components
│   ├── contexts/          # React contexts
│   ├── lib/               # Utility functions
│   ├── services/          # API services
│   └── styles/            # Global styles
├── cray-backend/          # Express.js backend application
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   └── utils/         # Utility functions
│   └── tests/             # Backend tests
└── cray_noir/             # Noir circuits
    ├── src/               # Circuit source files
    └── target/            # Compiled circuits
```

## 🔐 Security Features

### Zero-Knowledge Proofs
- Password verification without revealing password
- Age verification without revealing age
- Country verification without revealing location
- Whitelist verification without revealing identity

### Authentication Flow
1. User registers with credentials
2. Frontend generates zero-knowledge proof using Noir circuits
3. Backend verifies proof using Noir verifier
4. JWT token issued upon successful verification

![Screenshot from 2025-05-10 03-11-35](https://github.com/user-attachments/assets/b3212fd2-ffca-4193-abe9-d26a2924dacd)

![Screenshot from 2025-05-10 03-11-43](https://github.com/user-attachments/assets/14098f76-2003-4185-b24e-47b1b212dfd9)



## 🛠 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials
- `GET /api/auth/me` - Get current user

### Campaigns
- `GET /api/campaigns` - List all campaigns
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/:id` - Get campaign details
- `POST /api/campaigns/:id/register` - Register for campaign
- `POST /api/campaigns/:id/vote` - Submit vote

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📫 Contact

Project Link: [https://github.com/jaykayudo/cray](https://github.com/jaykayudo/cray) 
