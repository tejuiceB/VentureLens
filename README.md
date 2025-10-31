# 🚀 VentureLens - AI-Powered Investor Intelligence Platform

<div align="center">

**Empowering investors with intelligent due diligence through Google's AI ecosystem**

[![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.12.3-orange?style=flat&logo=firebase)](https://firebase.google.com/)
[![Genkit](https://img.shields.io/badge/Genkit-1.8.0-blue?style=flat)](https://firebase.google.com/docs/genkit)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)

</div>

---

## 📋 Table of Contents
- [Problem Statement](#-problem-statement)
- [Our Agentic Solution](#-our-agentic-solution)
- [Tech Stack](#-tech-stack)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [AI Flows](#-ai-flows)
- [Contributing](#-contributing)

---

## 🎯 Problem Statement

### The Investment Due Diligence Challenge

Modern investors face critical challenges when evaluating startup investment opportunities:

1. **Information Overload**: Analyzing hundreds of pitch decks, financial reports, and market research documents is time-consuming and error-prone
2. **Inconsistent Analysis**: Manual evaluation leads to subjective decisions and missed red flags
3. **Regulatory Complexity**: Navigating multi-jurisdiction compliance requirements is overwhelming
4. **Limited Scalability**: Traditional due diligence doesn't scale when evaluating multiple opportunities simultaneously
5. **Fragmented Workflow**: Information scattered across emails, documents, and meetings makes decision-making inefficient
6. **Repetitive Tasks**: Investors waste time re-entering profile data and answering the same questions

**The Result**: Investment decisions take weeks, critical insights are missed, and opportunities slip away.

---

## 🤖 Our Agentic Solution

VentureLens leverages **Google's AI Development Kit (ADK)** and advanced agentic AI to transform investment due diligence into an intelligent, automated workflow:

### Intelligent AI Agents

Our platform deploys specialized AI agents powered by **Google Gemini** and **Vertex AI** that work collaboratively to:

#### 1. **Profiler Agent** 🎯
- Analyzes investor responses using natural language understanding
- Generates comprehensive risk profiles with multi-dimensional assessment
- Persists profiles intelligently using browser storage for seamless user experience

#### 2. **Matching Agent** 🔍
- Scans global startup databases with semantic search
- Scores opportunities against investor criteria using vector embeddings
- Provides ranked recommendations with explainable AI reasoning

#### 3. **Document Analyzer Agent** 📊
- Processes multiple file formats (PDF, DOCX, XLSX) simultaneously
- Extracts key insights using Gemini's multimodal capabilities
- Generates comprehensive investment memos with:
  - Executive summaries with sentiment analysis
  - Key highlights with color-coded risk indicators
  - Interactive flashcards for quick learning
  - Audio summaries via text-to-speech

#### 4. **Conversational Q&A Agent** 💬
- Answers investor questions using RAG (Retrieval-Augmented Generation)
- Maintains conversation context across multiple queries
- Cites specific sources for transparency and trust
- Provides instant responses using cached document analysis

#### 5. **Compliance Agent** ⚖️
- Evaluates regulatory adherence across jurisdictions
- Generates detailed compliance reports with risk scoring
- Exports professional documentation (PDF/Word)
- Adapts analysis based on investor's geographic preferences

#### 6. **Meeting Scheduler Agent** 📅
- Generates contextual meeting invitations
- Integrates with Google Calendar and Meet
- Includes relevant analysis summaries automatically
- Personalizes communication based on investor profile

### Agentic Orchestration

Our agents work together through:
- **Sequential Processing**: Each agent builds on previous outputs
- **Contextual Memory**: Shared state across all agents via Firebase
- **Adaptive Workflows**: Agents adjust based on document types and investor preferences
- **Error Recovery**: Graceful fallbacks and retry mechanisms

---

## 🛠 Tech Stack

### Google Cloud Ecosystem

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Firebase Genkit** | 1.8.0 | AI application development framework with built-in agentic patterns |
| **Vertex AI** | Latest | Enterprise-grade AI model hosting and fine-tuning |
| **Google Gemini** | Pro | Multimodal LLM for document analysis and natural language understanding |
| **Firebase** | 10.12.3 | Real-time database, authentication, and hosting |
| **Firebase Admin SDK** | 12.3.0 | Server-side Firebase operations |
| **Google Cloud Text-to-Speech** | Latest | Audio summary generation |

### Frontend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 14.2.5 | React framework with server-side rendering and API routes |
| **React** | 18.3.1 | UI component library |
| **TypeScript** | 5.x | Type-safe development |
| **Tailwind CSS** | 3.4.1 | Utility-first styling framework |
| **Radix UI** | Latest | Accessible component primitives |
| **Lucide React** | 0.475.0 | Modern icon library |

### AI & Data Processing

| Technology | Purpose |
|-----------|---------|
| **Genkit AI Flows** | Structured AI prompt orchestration |
| **Zod** | Runtime type validation for AI inputs/outputs |
| **Mammoth** | DOCX document parsing |
| **XLSX** | Excel spreadsheet processing |
| **React Markdown** | Formatted text rendering |

### Developer Experience

| Technology | Purpose |
|-----------|---------|
| **Genkit CLI** | AI flow development and testing |
| **ESLint** | Code quality and consistency |
| **PostCSS** | CSS preprocessing |

---

## ✨ Key Features

### 🎯 Intelligent Investor Profiling
- AI-powered questionnaire with natural language processing
- Multi-dimensional risk assessment
- Automatic profile persistence with browser storage
- Welcome back messages and profile management

### 🔍 Smart Startup Matching
- Global startup database scanning
- AI-scored compatibility rankings
- Custom startup analysis support
- Real-time filtering and search

### 📊 Advanced Document Analysis
- **Multi-format support**: PDF, DOCX, XLSX, images
- **Comprehensive reports**: Investment memos with highlights
- **Interactive flashcards**: Key terms and definitions
- **Audio summaries**: 2-3 minute overviews
- **Q&A Chatbot**: Ask questions about analyzed documents
- **Collapsible UI**: Space-efficient information display

### ⚖️ Automated Compliance Reports
- One-click report generation
- Jurisdiction-specific analysis
- Risk scoring and recommendations
- Professional exports (PDF/Word)

### 📅 Smart Meeting Scheduling
- AI-generated meeting invitations
- Google Meet integration
- Automatic context inclusion
- Calendar synchronization

### 🎨 Modern UI/UX
- Responsive design for all devices
- Dark/light mode support
- Smooth animations and transitions
- Accessible components (WCAG compliant)

---

## 🏗 Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                          │
│  (React 18 + TypeScript + Tailwind CSS)                     │
└────────────┬────────────────────────────┬───────────────────┘
             │                            │
             ▼                            ▼
┌────────────────────────┐   ┌──────────────────────────────┐
│   Client Components    │   │    Server Components          │
│   - Interactive UI     │   │    - SSR Pages                │
│   - Real-time Updates  │   │    - SEO Optimization         │
└────────────┬───────────┘   └──────────┬───────────────────┘
             │                          │
             ▼                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Firebase Genkit AI Layer                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  AI Agents (Orchestrated Flows)                      │   │
│  │  • Profiler Agent                                     │   │
│  │  • Matching Agent                                     │   │
│  │  • Analyzer Agent                                     │   │
│  │  • Q&A Agent                                          │   │
│  │  • Compliance Agent                                   │   │
│  │  • Scheduler Agent                                    │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────┬────────────────────────────┬───────────────────┘
             │                            │
             ▼                            ▼
┌────────────────────────┐   ┌──────────────────────────────┐
│   Google Vertex AI     │   │      Firebase Services        │
│   - Gemini Pro Model   │   │   - Firestore Database        │
│   - Embeddings         │   │   - Authentication            │
│   - Text-to-Speech     │   │   - Cloud Storage             │
└────────────────────────┘   └──────────────────────────────┘
```

### AI Flow Architecture

```
User Input → Genkit Flow → Gemini Processing → Structured Output
     ↓            ↓              ↓                    ↓
  Validation   Prompting    Vector Search        Type Safety
     ↓            ↓              ↓                    ↓
  Error Hand.  Context Mgmt  RAG Pipeline      Format & Store
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **npm** or **yarn** package manager
- **Firebase project** with Genkit enabled
- **Google Cloud account** with Vertex AI API enabled
- **Gemini API key**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tejuiceB/VentureLens.git
   cd VentureLens
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Firebase Admin (Server-side)
   FIREBASE_ADMIN_PROJECT_ID=your_project_id
   FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email
   FIREBASE_ADMIN_PRIVATE_KEY=your_private_key

   # Google AI
   GOOGLE_GENAI_API_KEY=your_gemini_api_key
   
   # Vertex AI (Optional for production)
   GOOGLE_CLOUD_PROJECT=your_gcp_project_id
   GOOGLE_CLOUD_LOCATION=us-central1
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   
   Visit [http://localhost:9002](http://localhost:9002)

5. **Run Genkit development UI (Optional)**
   ```bash
   npm run genkit:dev
   ```
   
   Visit Genkit UI at [http://localhost:4000](http://localhost:4000)

### Build for Production

```bash
npm run build
npm start
```
---

## 🤖 AI Flows

### Flow Catalog

| Flow | Input | Output | Purpose |
|------|-------|--------|---------|
| **investorRiskAssessment** | Questionnaire responses | InvestorProfile | Generate comprehensive risk profile |
| **personalizedStartupMatching** | InvestorProfile | Startup[] with scores | Match startups to investor criteria |
| **notebookLmReportGeneration** | Files + Criteria | Investment memo, flashcards, audio script | Comprehensive document analysis |
| **documentQA** | Question + Documents | Answer + Sources | Conversational Q&A about documents |
| **generateComplianceReport** | Startup + Criteria | Compliance report | Regulatory assessment |
| **scheduleMeeting** | Investor + Startup | Meeting details + Calendar link | Smart meeting scheduling |
| **textToSpeech** | Text script | Audio WAV file | Generate audio summaries |

### Example Flow Usage

```typescript
import { generateNotebookLmReport } from '@/ai/flows/notebook-lm-report-generation';

const result = await generateNotebookLmReport({
  files: [
    { name: 'pitch.pdf', dataUri: 'data:application/pdf;base64,...' }
  ],
  investorCriteria: "Focus on B2B SaaS, Series A, North America",
  startupName: "TechCorp Inc"
});

console.log(result.investmentMemo);
console.log(result.flashcards);
console.log(result.audioSummary);
```
