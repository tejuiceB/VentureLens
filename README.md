# 🚀 VentureLens - AI-Powered Investor Intelligence Platform

<div align="center">

**Empowering investors with intelligent due diligence through Google's AI ecosystem**

[![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.12.3-orange?style=flat&logo=firebase)](https://firebase.google.com/)
[![Vertex AI](https://img.shields.io/badge/Vertex_AI-Latest-blue?style=flat&logo=google-cloud)](https://cloud.google.com/vertex-ai)
[![Gemini](https://img.shields.io/badge/Gemini-Pro-blue?style=flat&logo=google)](https://deepmind.google/technologies/gemini/)
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

VentureLens leverages **Google Agent Development Kit** with **Vertex AI** and **Gemini** to build specialized AI agents that transform investment due diligence into an intelligent, automated workflow:

### Intelligent AI Agents

Our platform deploys AI agents built using Google's Agent Development Kit, powered by **Vertex AI** and **Gemini Pro**, that work collaboratively to:

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
| **Google Agent Development Kit** | Latest | Framework for building intelligent AI agents with orchestration |
| **Vertex AI** | Latest | Enterprise-grade AI platform for model deployment and management |
| **Google Gemini** | Pro | Advanced multimodal LLM for document analysis and natural language understanding |
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
| **Zod** | Runtime type validation for AI inputs/outputs |
| **Mammoth** | DOCX document parsing |
| **XLSX** | Excel spreadsheet processing |
| **React Markdown** | Formatted text rendering |

### Developer Experience

| Technology | Purpose |
|-----------|---------|
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
│         Google Agent Development Kit Layer                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Intelligent AI Agents                                │   │
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

### Agent Processing Architecture

```
User Input → Agent Orchestration → Gemini (Vertex AI) → Structured Output
     ↓              ↓                      ↓                    ↓
  Validation    Agent Logic         Vector Search        Type Safety
     ↓              ↓                      ↓                    ↓
  Error Hand.   Context Mgmt          RAG Pipeline      Format & Store
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **npm** or **yarn** package manager
- **Firebase project** with authentication and Firestore enabled
- **Google Cloud account** with Vertex AI API enabled
- **Gemini API key** for AI agent operations

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

   # Google AI - Gemini & Vertex AI
   GOOGLE_GENAI_API_KEY=your_gemini_api_key
   GOOGLE_CLOUD_PROJECT=your_gcp_project_id
   GOOGLE_CLOUD_LOCATION=us-central1
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   
   Visit [http://localhost:9002](http://localhost:9002)

### Build for Production

```bash
npm run build
npm start
```
---

## 🤖 AI Agents Built with Google ADK

Our platform uses Google Agent Development Kit to build specialized agents powered by Vertex AI and Gemini:

### Agent Catalog

| Agent | Input | Output | Purpose |
|------|-------|--------|---------|
| **Profiler Agent** | Questionnaire responses | InvestorProfile | Generate comprehensive risk profile using Gemini analysis |
| **Matching Agent** | InvestorProfile | Startup[] with scores | Match startups to investor criteria with semantic search |
| **Analyzer Agent** | Files + Criteria | Investment memo, flashcards, audio script | Comprehensive document analysis via Gemini multimodal |
| **Q&A Agent** | Question + Documents | Answer + Sources | Conversational Q&A using RAG with Vertex AI embeddings |
| **Compliance Agent** | Startup + Criteria | Compliance report | Regulatory assessment powered by Gemini reasoning |
| **Scheduler Agent** | Investor + Startup | Meeting details + Calendar link | Smart meeting scheduling with context generation |

### How Agents Work

Each agent is built using Google's Agent Development Kit (ADK), which provides:

**Core Components:**
- **Agent Orchestration**: Coordinates multiple agents working together on complex tasks
- **Vertex AI Integration**: Leverages enterprise-grade AI models for scalable inference
- **Gemini Pro**: Powers natural language understanding, generation, and multimodal analysis
- **State Management**: Uses Firebase for real-time agent memory and context persistence
- **Type Safety**: Zod schemas ensure reliable data flow between agents

**Agent Workflow:**
1. User input is validated and processed
2. Agent receives context from previous agents via shared Firebase state
3. Agent calls Gemini (via Vertex AI) with structured prompts
4. Response is validated, formatted, and stored
5. Next agent in chain receives updated context
