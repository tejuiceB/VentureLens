
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileUp, Loader2, Trash2, BotMessageSquare, ShieldCheck, Video, Link as LinkIcon, Download, Play, Send, MessageCircle, Bot, ChevronDown, ChevronUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { generateNotebookLmReport, type NotebookLmReportOutput, type NotebookLmReportInput } from "@/ai/flows/notebook-lm-report-generation";
import { investorRiskAssessment, type InvestorRiskAssessmentOutput, type InvestorRiskAssessmentInput } from "@/ai/flows/investor-risk-assessment";
import { StartupList } from "@/components/dashboard/startup-list";
import ReactMarkdown from 'react-markdown';
import { findStartups, type FoundStartup, type FindStartupsInput } from "@/ai/flows/find-startups";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import { ReportDownloads } from "@/components/dashboard/report-downloads";
import { MultiSelect } from "@/components/ui/multi-select";
import { generateComplianceReport, type GenerateComplianceReportOutput, type GenerateComplianceReportInput } from "@/ai/flows/generate-compliance-report";
import { scheduleMeeting, type ScheduleMeetingOutput, type ScheduleMeetingInput } from "@/ai/flows/schedule-meeting";
import { textToSpeech } from "@/ai/flows/text-to-speech";
import { askDocumentQuestion, type DocumentQAInput, type DocumentQAOutput } from "@/ai/flows/document-qa";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { saveAs } from "file-saver";


const currencies = ["INR", "USD", "EUR", "GBP", "JPY", "CAD", "AUD"];
const investmentFocusOptions = ["Seed Stage", "Early Stage", "Growth Stage", "Late Stage", "Pre-IPO", "Buyouts", "Venture Debt"];
const investmentStageOptions = ["Pre-seed", "Seed", "Series A", "Series B", "Series C+", "Growth Equity", "Late Stage"];

const INVESTOR_PROFILE_STORAGE_KEY = "ventureLens_investorProfile";

export type InvestorProfile = InvestorRiskAssessmentInput & {
    fullName: string;
    involvement: string;
    ethicalConsiderations: string;
    preferredCurrency: string;
    generatedProfile: InvestorRiskAssessmentOutput | null;
};

export default function DashboardPage() {
  const [currentTab, setCurrentTab] = useState("profiler");
  const [currentAnalysisTab, setCurrentAnalysisTab] = useState("memo");
  
  // NotebookLM Analyzer States
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<{name: string, dataUri: string}[]>([]);
  const [customStartupName, setCustomStartupName] = useState("");
  const [investorCriteria, setInvestorCriteria] = useState("");
  const [analysisResult, setAnalysisResult] = useState<NotebookLmReportOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzerError, setAnalyzerError] = useState<string | null>(null);
  const [founderInput, setFounderInput] = useState("");
  const [selectedStartupsForAnalysis, setSelectedStartupsForAnalysis] = useState<string[]>([]);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  // Chatbot States
  type ChatMessage = { role: 'user' | 'assistant'; content: string; sources?: string[] };
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Risk Profiler States
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile>({
    fullName: "",
    riskAppetite: "",
    desiredReturns: "",
    investmentPreferences: "",
    investmentAmount: "",
    investmentHorizon: "",
    country: "",
    involvement: "",
    ethicalConsiderations: "",
    preferredCurrency: "INR",
    investmentFocus: "",
    investmentStage: "",
    investmentCriteria: "",
    generatedProfile: null,
  });
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);
  const [profilerError, setProfilerError] = useState<string | null>(null);
  const [isProfilerFormValid, setIsProfilerFormValid] = useState(false);
  const [foundStartups, setFoundStartups] = useState<FoundStartup[] | null>(null);
  const [isFindingStartups, setIsFindingStartups] = useState(false);

  // Compliance States
  const [complianceReport, setComplianceReport] = useState<GenerateComplianceReportOutput | null>(null);
  const [isGeneratingCompliance, setIsGeneratingCompliance] = useState(false);
  const [complianceError, setComplianceError] = useState<string | null>(null);

  // Connect & Invest States
  const [investorEmail, setInvestorEmail] = useState("");
  const [founderEmails, setFounderEmails] = useState("");
  const [meetingDetails, setMeetingDetails] = useState<ScheduleMeetingOutput | null>(null);
  const [isSchedulingMeeting, setIsSchedulingMeeting] = useState(false);
  const [meetingError, setMeetingError] = useState<string | null>(null);


  const startupOptionsForSelect = useMemo(() => {
    if (!foundStartups) return [];
    return foundStartups.map(s => ({ value: s.name, label: s.name }));
  }, [foundStartups]);

  // Load investor profile from localStorage on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(INVESTOR_PROFILE_STORAGE_KEY);
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile) as InvestorProfile;
        setInvestorProfile(parsed);
        console.log("✅ Investor profile loaded from localStorage");
      }
    } catch (error) {
      console.error("Failed to load investor profile from localStorage:", error);
    }
  }, []);

  // Save investor profile to localStorage whenever it changes
  useEffect(() => {
    // Only save if profile has meaningful data (at least name and one other field)
    if (investorProfile.fullName && investorProfile.riskAppetite) {
      try {
        localStorage.setItem(INVESTOR_PROFILE_STORAGE_KEY, JSON.stringify(investorProfile));
        console.log("💾 Investor profile saved to localStorage");
      } catch (error) {
        console.error("Failed to save investor profile to localStorage:", error);
      }
    }
  }, [investorProfile]);

  const handleFindStartups = useCallback(async (profile: InvestorProfile) => {
      setIsFindingStartups(true);
      setFoundStartups(null);
      setProfilerError(null);
      try {
        const input: FindStartupsInput = {
          riskAppetite: profile.riskAppetite,
          desiredReturns: profile.desiredReturns,
          investmentPreferences: profile.investmentPreferences,
          investmentAmount: `${profile.investmentAmount} ${profile.preferredCurrency}`,
          investmentHorizon: profile.investmentHorizon,
          country: profile.country,
          investmentFocus: profile.investmentFocus,
          investmentStage: profile.investmentStage,
          investmentCriteria: profile.investmentCriteria,
        };
        const result = await findStartups(input);
        if (result.startups && result.startups.length > 0) {
            setFoundStartups(result.startups);
        } else {
            setProfilerError("No startups found matching your criteria. The AI model may be temporarily unavailable or your criteria are very specific.");
        }
      } catch (err) {
        console.error("Error finding startups:", err);
        setProfilerError("Could not find startups. The AI model may be temporarily unavailable.");
      } finally {
        setIsFindingStartups(false);
      }
    }, []);

  useEffect(() => {
    if (investorProfile.generatedProfile) {
        const criteria = `
- **Investment Philosophy**: ${investorProfile.desiredReturns}
- **Risk Tolerance**: ${investorProfile.riskAppetite}
- **Preferred Sectors**: ${investorProfile.investmentPreferences}
- **Typical Investment Size**: ${investorProfile.investmentAmount} ${investorProfile.preferredCurrency}
- **Investment Horizon**: ${investorProfile.investmentHorizon}
- **Geographical Preferences**: ${investorProfile.country}
- **Desired Involvement**: ${investorProfile.involvement}
- **Investment Focus**: ${investorProfile.investmentFocus}
- **Investment Stage**: ${investorProfile.investmentStage}
- **Ethical Considerations**: ${investorProfile.ethicalConsiderations || 'Not specified'}
- **Specific Criteria**: ${investorProfile.investmentCriteria || 'Not specified'}
`;
        setInvestorCriteria(criteria);
        handleFindStartups(investorProfile);
    }
  }, [investorProfile.generatedProfile, investorProfile, handleFindStartups]);

  useEffect(() => {
    const { fullName, riskAppetite, desiredReturns, investmentPreferences, investmentAmount, investmentHorizon, country, involvement, preferredCurrency, investmentFocus, investmentStage } = investorProfile;
    const isValid = !!(fullName && riskAppetite && desiredReturns && investmentPreferences && investmentAmount && investmentHorizon && country && involvement && preferredCurrency && investmentFocus && investmentStage);
    setIsProfilerFormValid(isValid);
  }, [investorProfile]);


  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };
  
  const handleFiles = (files: FileList) => {
    const newFiles = Array.from(files);
    setUploadedFiles(prev => {
        const updatedFiles = [...prev, ...newFiles];
        // Reset subsequent steps whenever files change
        setAnalysisResult(null); 
        setAnalyzerError(null);
        setComplianceReport(null);
        setComplianceError(null);
        setMeetingDetails(null);
        setMeetingError(null);
        setAudioDataUri(null);
        return updatedFiles;
    });
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => {
        const newFiles = prev.filter(f => f.name !== fileName);
        if (newFiles.length === 0) {
            setAnalysisResult(null); 
            setAnalyzerError(null);
            setComplianceReport(null);
            setComplianceError(null);
            setMeetingDetails(null);
            setMeetingError(null);
            setAudioDataUri(null);
        }
        return newFiles;
    });
  }

  const handleAnalyze = async () => {
    if (uploadedFiles.length === 0 || !investorCriteria) {
      setAnalyzerError("Please upload at least one file and ensure your investor profile is generated.");
      return;
    }
    if (!customStartupName.trim()) {
      setAnalyzerError("Please enter the startup name you're analyzing.");
      return;
    }

    setIsAnalyzing(true);
    setAnalyzerError(null);
    setAnalysisResult(null);
    setComplianceReport(null);
    setComplianceError(null);
    setMeetingDetails(null);
    setMeetingError(null);
    setAudioDataUri(null);

    try {
      const fileProcessingPromises = uploadedFiles.map(file => {
        return new Promise<{name: string, dataUri: string}>(async (resolve, reject) => {
          const reader = new FileReader();
          
          if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
             reader.onload = async (e) => {
                try {
                    const arrayBuffer = e.target?.result;
                    if (arrayBuffer instanceof ArrayBuffer) {
                        const result = await mammoth.extractRawText({ arrayBuffer });
                        const base64Text = Buffer.from(result.value, 'utf-8').toString('base64');
                        resolve({ name: file.name, dataUri: `data:text/plain;base64,${base64Text}` });
                    } else {
                        reject(new Error('Failed to read .docx file.'));
                    }
                } catch (err) {
                    reject(err);
                }
             };
             reader.onerror = reject;
             reader.readAsArrayBuffer(file);
          } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel') {
             reader.onload = async (e) => {
                try {
                    const arrayBuffer = e.target?.result;
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                    let fullText = '';
                    workbook.SheetNames.forEach(sheetName => {
                        const worksheet = workbook.Sheets[sheetName];
                        const text = XLSX.utils.sheet_to_csv(worksheet);
                        fullText += `Sheet: ${sheetName}\n\n${text}\n\n`;
                    });
                    const base64Text = Buffer.from(fullText, 'utf-8').toString('base64');
                    resolve({ name: file.name, dataUri: `data:text/plain;base64,${base64Text}` });
                } catch (err) {
                    reject(err);
                }
             };
             reader.onerror = reject;
             reader.readAsArrayBuffer(file);
          } else {
            reader.onload = () => {
              if (typeof reader.result !== 'string') {
                return reject(new Error('Failed to read file as data URL.'));
              }
              resolve({ name: file.name, dataUri: reader.result });
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
          }
        });
      });

      const files = await Promise.all(fileProcessingPromises);
      
      // Store processed files for chatbot to reuse
      setProcessedFiles(files);
      
      const input: NotebookLmReportInput = {
          files, 
          investorCriteria, 
          startupName: customStartupName || undefined,
          founderInput, 
          startupComparison: selectedStartupsForAnalysis 
      };
      
      const result = await generateNotebookLmReport(input);
      setAnalysisResult(result);

    } catch (err: any) {
      console.error("Error analyzing files:", err);
      setAnalyzerError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!analysisResult?.audioSummary) {
      setAnalyzerError("No audio summary script available to generate audio.");
      return;
    }
    setIsGeneratingAudio(true);
    setAnalyzerError(null);
    try {
      const result = await textToSpeech(analysisResult.audioSummary);
      setAudioDataUri(result.audioDataUri);
    } catch (err: any) {
      console.error("Error generating audio:", err);
      setAnalyzerError(err.message || "Failed to generate audio overview.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!chatInput.trim() || !analysisResult) {
      setChatError("Please enter a question.");
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsAskingQuestion(true);
    setChatError(null);

    try {
      // Use the ALREADY PROCESSED files from the initial analysis
      // No need to re-read files - they're already in processedFiles state
      const input: DocumentQAInput = {
        files: processedFiles, // Use existing processed files!
        investmentMemo: analysisResult.investmentMemo,
        question: userMessage.content,
        conversationHistory: chatMessages.slice(-6).map(msg => ({ role: msg.role, content: msg.content })),
      };

      const result = await askDocumentQuestion(input);
      const assistantMessage: ChatMessage = { 
        role: 'assistant', 
        content: result.answer,
        sources: result.sources 
      };
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("Error asking question:", err);
      setChatError(err.message || "Failed to answer question.");
      // Remove the user message if there was an error
      setChatMessages(prev => prev.slice(0, -1));
    } finally {
      setIsAskingQuestion(false);
    }
  };

  const extractHighlights = useCallback((memo: string) => {
    const highlights: Array<{ title: string; text: string; icon?: string; color?: string }> = [];
    
    // Extract Executive Summary
    const execSummaryMatch = memo.match(/### Executive Summary\s*([\s\S]*?)(?=\n###|$)/);
    if (execSummaryMatch) {
      const content = execSummaryMatch[1].trim();
      const firstSentence = content.split(/[.!?]\s/)[0];
      if (firstSentence) {
        highlights.push({ 
          title: "Executive Summary", 
          text: firstSentence.replace(/^[-*]\s*/, ''),
          icon: "📊",
          color: "text-blue-600"
        });
      }
    }
    
    // Extract Recommendation with sentiment
    const recommendationMatch = memo.match(/### Recommendation\s*([\s\S]*?)(?=\n###|$)/);
    if (recommendationMatch) {
      const content = recommendationMatch[1].trim();
      const firstLine = content.split('\n')[0];
      let icon = "💡";
      let color = "text-yellow-600";
      
      if (content.toLowerCase().includes('strong buy') || content.toLowerCase().includes('highly recommend')) {
        icon = "🚀";
        color = "text-green-600";
      } else if (content.toLowerCase().includes('proceed with caution') || content.toLowerCase().includes('hold')) {
        icon = "⚠️";
        color = "text-orange-600";
      } else if (content.toLowerCase().includes('pass') || content.toLowerCase().includes('not recommend')) {
        icon = "🛑";
        color = "text-red-600";
      }
      
      if (firstLine) {
        highlights.push({ 
          title: "Investment Decision", 
          text: firstLine.replace(/^[-*]\s*/, ''),
          icon,
          color
        });
      }
    }
    
    // Extract Key Metrics/Traction
    const tractionMatch = memo.match(/### KPIs & Traction\s*([\s\S]*?)(?=\n###|$)/);
    if (tractionMatch) {
      const content = tractionMatch[1].trim();
      const lines = content.split('\n').filter(l => l.trim().match(/^\*|^-|^\d/));
      if (lines[0]) {
        highlights.push({ 
          title: "Key Metrics", 
          text: lines[0].replace(/^[-*]\s*/, ''),
          icon: "📈",
          color: "text-purple-600"
        });
      }
    }
    
    // Extract Market Opportunity
    const marketMatch = memo.match(/### Market Opportunity\s*([\s\S]*?)(?=\n###|$)/);
    if (marketMatch && highlights.length < 4) {
      const content = marketMatch[1].trim();
      const firstSentence = content.split(/[.!?]\s/)[0];
      if (firstSentence) {
        highlights.push({ 
          title: "Market Size", 
          text: firstSentence.replace(/^[-*]\s*/, ''),
          icon: "🌍",
          color: "text-teal-600"
        });
      }
    }
    
    return highlights;
  }, []);

  const downloadFlashcards = () => {
    if (!analysisResult?.flashcards) return;

    const doc = new jsPDF();
    const flashcards = analysisResult.flashcards.split("\n\n");
    const data = flashcards.map(fc => {
        const [term, definition] = fc.split('\n');
        return [term?.replace('Term: ', ''), definition?.replace('Definition: ', '')];
    }).filter(row => row[0] && row[1]);

    (doc as any).autoTable({
        head: [['Term', 'Definition']],
        body: data,
        styles: {
            cellPadding: 3,
            fontSize: 12,
            valign: 'middle'
        },
        headStyles: {
            fillColor: [35, 122, 122], // Deep Teal from theme
            textColor: 255,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [224, 240, 240] // Light Teal
        }
    });

    doc.save("flashcards.pdf");
  };

  const handleClearProfile = () => {
    if (confirm("Are you sure you want to clear your saved investor profile? This cannot be undone.")) {
      try {
        localStorage.removeItem(INVESTOR_PROFILE_STORAGE_KEY);
        setInvestorProfile({
          fullName: "",
          riskAppetite: "",
          desiredReturns: "",
          investmentPreferences: "",
          investmentAmount: "",
          investmentHorizon: "",
          country: "",
          involvement: "",
          ethicalConsiderations: "",
          preferredCurrency: "INR",
          investmentFocus: "",
          investmentStage: "",
          investmentCriteria: "",
          generatedProfile: null,
        });
        setFoundStartups(null);
        console.log("🗑️ Investor profile cleared");
      } catch (error) {
        console.error("Failed to clear investor profile:", error);
      }
    }
  };

  const handleGenerateProfile = async () => {
    if (!isProfilerFormValid) {
        setProfilerError("Please fill out all mandatory fields in the questionnaire.");
        return;
    }
    setIsGeneratingProfile(true);
    setProfilerError(null);
    setInvestorProfile(p => ({ ...p, generatedProfile: null }));
    setFoundStartups(null);

    try {
      const input: InvestorRiskAssessmentInput = {
        riskAppetite: investorProfile.riskAppetite,
        desiredReturns: investorProfile.desiredReturns,
        investmentPreferences: investorProfile.investmentPreferences,
        investmentAmount: `${investorProfile.investmentAmount} ${investorProfile.preferredCurrency}`,
        investmentHorizon: investorProfile.investmentHorizon,
        country: investorProfile.country,
        investmentFocus: investorProfile.investmentFocus,
        investmentStage: investorProfile.investmentStage,
        investmentCriteria: investorProfile.investmentCriteria,
      };
      const result = await investorRiskAssessment(input);
      setInvestorProfile(p => ({ ...p, generatedProfile: result }));
    } catch (err: any) {
      setProfilerError(err.message || "An unexpected error occurred while generating your profile.");
    } finally {
      setIsGeneratingProfile(false);
    }
  };

  const handleGenerateCompliance = async () => {
    if (!analysisResult?.investmentMemo || !investorProfile.country) {
        setComplianceError("Cannot generate compliance report without an investment memo and investor country.");
        return;
    }
    setIsGeneratingCompliance(true);
    setComplianceError(null);
    setComplianceReport(null);
    try {
        const fullMemo = analysisResult.investmentMemo;
        
        const startupName = customStartupName || uploadedFiles[0]?.name.split('.')[0] || "the startup";

        const executiveSummaryMatch = fullMemo.match(/### Executive Summary\s*([\s\S]*?)(?=\n###|$)/);
        const startupDescription = executiveSummaryMatch ? executiveSummaryMatch[1].trim() : 'No executive summary found.';
        
        const input: GenerateComplianceReportInput = {
            startupName: startupName,
            startupDescription: startupDescription,
            investorCountry: investorProfile.country,
            investmentMemo: fullMemo
        };
        const result = await generateComplianceReport(input);
        setComplianceReport(result);
    } catch(err: any) {
        setComplianceError(err.message || "An unexpected error occurred while generating the compliance report.");
    } finally {
        setIsGeneratingCompliance(false);
    }
  }

  const handleScheduleMeeting = async () => {
    if (!analysisResult || !founderEmails || !investorEmail) {
      setMeetingError("Please provide your email and at least one founder's email.");
      return;
    }
    setIsSchedulingMeeting(true);
    setMeetingError(null);
    setMeetingDetails(null);

    try {
      const startupName = customStartupName || uploadedFiles[0]?.name.split('.')[0] || "the startup";
      const emails = founderEmails.split(',').map(e => e.trim()).filter(e => e);
      if (emails.length === 0) {
        setMeetingError("Please enter at least one valid founder email.");
        setIsSchedulingMeeting(false);
        return;
      }
      
      const input: ScheduleMeetingInput = {
        startupName,
        investorEmail: investorEmail,
        founderEmails: emails
      };
      const result = await scheduleMeeting(input);
      setMeetingDetails(result);
    } catch(err: any) {
      setMeetingError(err.message || "An unexpected error occurred while scheduling the meeting.");
    } finally {
      setIsSchedulingMeeting(false);
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Welcome to your Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-lg">Your personalized hub for AI-powered investment insights.</p>
      </header>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profiler">1. Investor Profile</TabsTrigger>
          <TabsTrigger value="matching" disabled={!investorProfile.generatedProfile}>2. Startup Matching</TabsTrigger>
          <TabsTrigger value="analyzer" disabled={!investorProfile.generatedProfile}>3. Document Analyzer</TabsTrigger>
          <TabsTrigger value="compliance" disabled={!analysisResult}>4. Compliance</TabsTrigger>
          <TabsTrigger value="connect" disabled={!complianceReport}>5. Connect &amp; Invest</TabsTrigger>
        </TabsList>

        <TabsContent value="profiler">
          <Card className="bg-card border-border/60">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="font-headline flex items-center gap-2">
                    Investor Questionnaire
                    {investorProfile.fullName && (
                      <Badge variant="secondary" className="text-xs">
                        Saved ✓
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Complete this questionnaire to generate your personalized investment profile. 
                    {investorProfile.fullName && " Your profile is automatically saved."}
                  </CardDescription>
                </div>
                {investorProfile.fullName && (
                  <Button variant="outline" size="sm" onClick={handleClearProfile}>
                    Clear Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
               {investorProfile.fullName && investorProfile.generatedProfile && (
                 <Alert className="bg-primary/5 border-primary/20">
                   <AlertTitle className="flex items-center gap-2">
                     <span>👋</span> Welcome back, {investorProfile.fullName}!
                   </AlertTitle>
                   <AlertDescription>
                     Your investor profile has been loaded from your previous session. You can update any fields below or proceed to the next steps.
                   </AlertDescription>
                 </Alert>
               )}
               <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input id="full-name" placeholder="e.g., Jane Doe" value={investorProfile.fullName} onChange={(e) => setInvestorProfile(p => ({...p, fullName: e.target.value}))} />
                </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <Label htmlFor="investment-philosophy">What is your investment philosophy?</Label>
                   <Select onValueChange={(v) => setInvestorProfile(p => ({ ...p, desiredReturns: v}))} value={investorProfile.desiredReturns}>
                    <SelectTrigger id="investment-philosophy"><SelectValue placeholder="e.g., Value investing, growth investing..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Value Investing">Value Investing</SelectItem>
                      <SelectItem value="Growth Investing">Growth Investing</SelectItem>
                      <SelectItem value="Impact Investing">Impact Investing</SelectItem>
                       <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="risk-tolerance">What is your risk tolerance?</Label>
                  <Select onValueChange={(v) => setInvestorProfile(p => ({ ...p, riskAppetite: v}))} value={investorProfile.riskAppetite}>
                    <SelectTrigger id="risk-tolerance"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low - Prioritizing capital preservation (e.g., 5-8% annual return).</SelectItem>
                      <SelectItem value="Medium">Medium - Seeking a balance of risk and return (e.g., 8-15% annual return).</SelectItem>
                      <SelectItem value="High">High - Pursuing aggressive growth, comfortable with volatility (e.g., 15%+ annual return).</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <Label htmlFor="investment-horizon">What is your investment horizon?</Label>
                  <Select onValueChange={(v) => setInvestorProfile(p => ({ ...p, investmentHorizon: v}))} value={investorProfile.investmentHorizon}>
                    <SelectTrigger id="investment-horizon"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Short-term (1-3 years)">Short-term (1-3 years)</SelectItem>
                      <SelectItem value="Medium-term (3-7 years)">Medium-term (3-7 years)</SelectItem>
                      <SelectItem value="Long-term (7+ years)">Long-term (7+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="investment-preferences">Preferred investment sectors? (comma-separated)</Label>
                  <Input id="investment-preferences" placeholder="e.g., FinTech, HealthTech, AI" value={investorProfile.investmentPreferences} onChange={(e) => setInvestorProfile(p => ({...p, investmentPreferences: e.target.value}))} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="preferred-currency">Preferred Currency</Label>
                    <Select onValueChange={(v) => setInvestorProfile(p => ({ ...p, preferredCurrency: v }))} value={investorProfile.preferredCurrency}>
                      <SelectTrigger id="preferred-currency"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                 <div className="space-y-2">
                  <Label htmlFor="investment-amount">{`Typical investment size per deal? (in ${investorProfile.preferredCurrency})`}</Label>
                  <Select onValueChange={(v) => setInvestorProfile(p => ({ ...p, investmentAmount: v}))} value={investorProfile.investmentAmount}>
                    <SelectTrigger id="investment-amount"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="< 25,000">&lt; 25,000</SelectItem>
                      <SelectItem value="25,000 - 100,000">25,000 - 100,000</SelectItem>
                      <SelectItem value="100,000 - 500,000">100,000 - 500,000</SelectItem>
                       <SelectItem value="500,000+">500,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="geo-preferences">What are your geographical preferences?</Label>
                    <Input id="geo-preferences" placeholder="e.g., India, Uttar Pradesh, United States of America, Europe" value={investorProfile.country} onChange={(e) => setInvestorProfile(p => ({...p, country: e.target.value}))} />
                 </div>
                <div className="space-y-2">
                  <Label htmlFor="involvement-preference">What is your desired level of involvement?</Label>
                  <Select onValueChange={(v) => setInvestorProfile(p => ({ ...p, involvement: v}))} value={investorProfile.involvement}>
                    <SelectTrigger id="involvement-preference"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Passive">Passive (Financial investment only)</SelectItem>
                      <SelectItem value="Active">Active (Mentorship, advisory role)</SelectItem>
                      <SelectItem value="Lead Investor">Lead Investor (Board seat, strategic guidance)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="investment-focus">Investment Focus</Label>
                  <Select onValueChange={(v) => setInvestorProfile(p => ({...p, investmentFocus: v}))} value={investorProfile.investmentFocus}>
                    <SelectTrigger id="investment-focus"><SelectValue placeholder="Select investment focus..." /></SelectTrigger>
                    <SelectContent>
                      {investmentFocusOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="investment-stage">Investment Stage</Label>
                  <Select onValueChange={(v) => setInvestorProfile(p => ({...p, investmentStage: v}))} value={investorProfile.investmentStage}>
                    <SelectTrigger id="investment-stage"><SelectValue placeholder="Select investment stage..." /></SelectTrigger>
                    <SelectContent>
                      {investmentStageOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>


               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <Label htmlFor="ethical-considerations">Are there any ethical considerations or sectors you avoid? (Optional)</Label>
                   <Input id="ethical-considerations" placeholder="e.g., Gambling, tobacco, fossil fuels" value={investorProfile.ethicalConsiderations} onChange={(e) => setInvestorProfile(p => ({...p, ethicalConsiderations: e.target.value}))} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specific-criteria">Specific Investment Criteria (Optional)</Label>
                <Textarea 
                  id="specific-criteria" 
                  placeholder="Enter any other specific criteria you have, e.g., 'Founder must have 5+ years of industry experience', 'Company must have a clear path to profitability within 3 years'." 
                  value={investorProfile.investmentCriteria}
                  onChange={(e) => setInvestorProfile(p => ({...p, investmentCriteria: e.target.value}))} 
                  rows={3}
                />
              </div>


              <Button onClick={handleGenerateProfile} disabled={!isProfilerFormValid || isGeneratingProfile}>
                 {isGeneratingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate My Profile
              </Button>

              {profilerError && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{profilerError}</AlertDescription>
                </Alert>
              )}

              {investorProfile.generatedProfile && (
                 <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="font-headline text-xl">Your Investor Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{investorProfile.generatedProfile.riskProfile}</ReactMarkdown>
                    <ReactMarkdown>{investorProfile.generatedProfile.investmentRecommendations}</ReactMarkdown>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matching">
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="font-headline">Personalized Startup Matching</CardTitle>
              <CardDescription>
                {investorProfile.generatedProfile 
                  ? "Based on your profile, here are some startup matches from our global database." 
                  : "Complete your profile in the 'Investor Profile' tab to see personalized startup matches."
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
                {isFindingStartups && (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="ml-4 text-muted-foreground">Finding matching startups...</p>
                    </div>
                )}
                {!isFindingStartups && foundStartups && (
                    <StartupList startups={foundStartups} investorProfile={investorProfile} />
                )}
                 {!isFindingStartups && !foundStartups && investorProfile.generatedProfile && (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">Could not find any matching startups. Try adjusting your profile criteria.</p>
                    </div>
                 )}
                 {!isFindingStartups && !foundStartups && !investorProfile.generatedProfile && (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">Please complete your investor profile to see startup matches.</p>
                    </div>
                 )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analyzer">
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="font-headline">AI Investment Memo Agent</CardTitle>
              <CardDescription>Analyze any startup - from your matches or completely custom. Upload documents, specify the startup name, and our AI will generate a comprehensive investment memo tailored to your criteria.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Investment Criteria Summary - Collapsible at top */}
              {investorProfile.generatedProfile && (
                <Collapsible defaultOpen={true}>
                  <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="pb-3 hover:bg-primary/5 transition-colors cursor-pointer">
                        <CardTitle className="text-base flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <span className="text-xl">🎯</span>
                            Your Investment Criteria
                          </span>
                          <ChevronDown className="h-4 w-4 transition-transform ui-expanded:rotate-180" />
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground">Risk Tolerance</p>
                            <p className="text-sm font-medium">{investorProfile.riskAppetite}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground">Philosophy</p>
                            <p className="text-sm font-medium">{investorProfile.desiredReturns}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground">Investment Size</p>
                            <p className="text-sm font-medium">{investorProfile.investmentAmount} {investorProfile.preferredCurrency}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground">Horizon</p>
                            <p className="text-sm font-medium">{investorProfile.investmentHorizon}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground">Sectors</p>
                            <p className="text-sm font-medium truncate" title={investorProfile.investmentPreferences}>
                              {investorProfile.investmentPreferences}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground">Geography</p>
                            <p className="text-sm font-medium">{investorProfile.country}</p>
                          </div>
                          {investorProfile.investmentStage && (
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-muted-foreground">Stage</p>
                              <p className="text-sm font-medium">{investorProfile.investmentStage}</p>
                            </div>
                          )}
                          {investorProfile.investmentFocus && (
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-muted-foreground">Focus</p>
                              <p className="text-sm font-medium">{investorProfile.investmentFocus}</p>
                            </div>
                          )}
                        </div>
                        {investorProfile.investmentCriteria && (
                          <div className="mt-4 pt-4 border-t border-border/50">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">Specific Criteria:</p>
                            <p className="text-sm leading-relaxed">{investorProfile.investmentCriteria}</p>
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              )}

              <form onDragEnter={handleDrag} className="relative">
                <input type="file" id="pitch-deck-input" accept=".pdf,.txt,.eml,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" onChange={handleChange} multiple aria-label="Upload pitch deck files" />
                <Label 
                  htmlFor="pitch-deck-input"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted transition-colors ${dragActive ? "border-primary" : "border-border"}`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileUp className="w-10 h-10 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PDF, TXT, EML, DOCX, XLSX</p>
                  </div>
                </Label>
                {dragActive && <div className="absolute inset-0" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
              </form>

              {uploadedFiles.length > 0 && (
                <div>
                    <h3 className="mb-2 font-medium">Uploaded Files</h3>
                    <div className="space-y-2">
                        {uploadedFiles.map(file => (
                            <div key={file.name} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm">
                                <span className="truncate">{file.name}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(file.name)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="custom-startup-name">Startup Name</Label>
                <Input 
                  id="custom-startup-name" 
                  placeholder="e.g., TechVision AI, HealthSync, GreenFuture..." 
                  value={customStartupName}
                  onChange={(e) => setCustomStartupName(e.target.value)}
                  className="font-medium"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the name of the startup you're analyzing. This can be any company - from your matched list or a completely new one.
                </p>
              </div>

              <div>
                <Label htmlFor="founder-input">Founder Input (Optional)</Label>
                <Textarea 
                  id="founder-input" 
                  placeholder="Add any direct notes, answers, or context from the founder here..." 
                  rows={4}
                  value={founderInput}
                  onChange={(e) => setFounderInput(e.target.value)} 
                />
              </div>

               {startupOptionsForSelect.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="startup-comparison">Compare with Matched Startups (Optional)</Label>
                   <MultiSelect
                        options={startupOptionsForSelect}
                        selected={selectedStartupsForAnalysis}
                        onChange={setSelectedStartupsForAnalysis}
                        maxSelected={5}
                        className="w-full"
                        placeholder="Select up to 5 startups..."
                    />
                  <p className="text-xs text-muted-foreground">Select up to 5 startups from your matched list for a comparative analysis.</p>
                </div>
              )}

              <Button onClick={handleAnalyze} disabled={isAnalyzing || uploadedFiles.length === 0 || !investorCriteria || !customStartupName.trim()}>
                {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Analysis
              </Button>
              {analyzerError && (
                <Alert variant="destructive">
                  <AlertTitle>Analysis Error</AlertTitle>
                  <AlertDescription>{analyzerError}</AlertDescription>
                </Alert>
              )}
               {analysisResult && (
                  <Card className="bg-muted/50">
                      <CardHeader>
                          <div className="flex justify-between items-start">
                              <div className="flex-1">
                                  <CardTitle className="font-headline text-xl flex items-center gap-2"><BotMessageSquare /> Analysis Complete</CardTitle>
                                  {customStartupName && (
                                    <div className="mt-2 flex items-center gap-2">
                                      <Badge variant="default" className="text-sm">
                                        {customStartupName}
                                      </Badge>
                                    </div>
                                  )}
                                  <CardDescription className="mt-2">Review the generated investment memo below.</CardDescription>
                              </div>
                          </div>
                      </CardHeader>
                      <CardContent>
                          <Tabs value={currentAnalysisTab} onValueChange={setCurrentAnalysisTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="memo">Investment Memo</TabsTrigger>
                                <TabsTrigger value="chat">Q&A Chat</TabsTrigger>
                                <TabsTrigger value="audio">Audio Overview</TabsTrigger>
                                <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                            </TabsList>
                            <TabsContent value="memo" className="mt-4 space-y-6">
                               <div className="flex justify-end">
                                 <ReportDownloads memo={analysisResult.investmentMemo} />
                               </div>
                               
                               {/* Key Highlights Section */}
                               {extractHighlights(analysisResult.investmentMemo).length > 0 && (
                                 <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                                   <CardHeader>
                                     <CardTitle className="text-lg flex items-center gap-2">
                                       <span className="text-2xl">✨</span> 
                                       <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                         Key Highlights
                                       </span>
                                     </CardTitle>
                                     <CardDescription>Quick overview of critical investment factors</CardDescription>
                                   </CardHeader>
                                   <CardContent>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                       {extractHighlights(analysisResult.investmentMemo).map((highlight, idx) => (
                                         <div key={idx} className="group p-5 rounded-xl bg-background border-2 border-border hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-300">
                                           <div className="flex items-start gap-3">
                                             <span className="text-3xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                               {highlight.icon || "💡"}
                                             </span>
                                             <div className="flex-1 space-y-2">
                                               <h4 className={`font-bold text-sm ${highlight.color || 'text-primary'}`}>
                                                 {highlight.title}
                                               </h4>
                                               <p className="text-xs text-muted-foreground leading-relaxed">
                                                 {highlight.text}
                                               </p>
                                             </div>
                                           </div>
                                         </div>
                                       ))}
                                     </div>
                                   </CardContent>
                                 </Card>
                               )}
                               
                               {/* Full Memo */}
                               <Card>
                                 <CardHeader>
                                   <CardTitle className="text-lg">Full Investment Memo</CardTitle>
                                   <CardDescription>Comprehensive analysis and recommendation</CardDescription>
                                 </CardHeader>
                                 <CardContent>
                                   <div className="prose prose-sm max-w-none dark:prose-invert">
                                     <ReactMarkdown>{analysisResult.investmentMemo}</ReactMarkdown>
                                   </div>
                                 </CardContent>
                               </Card>
                            </TabsContent>
                            
                            <TabsContent value="chat" className="mt-4">
                              <Card className="h-[600px] flex flex-col">
                                <CardHeader className="border-b">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <CardTitle className="flex items-center gap-2">
                                        <Bot className="h-5 w-5 text-primary" />
                                        Ask Questions About the Documents
                                      </CardTitle>
                                      <CardDescription>
                                        Chat with AI to get deeper insights from the analyzed startup documents
                                      </CardDescription>
                                    </div>
                                    {chatMessages.length > 0 && (
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => {
                                          setChatMessages([]);
                                          setChatError(null);
                                        }}
                                      >
                                        Clear Chat
                                      </Button>
                                    )}
                                  </div>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col p-0">
                                  {/* Chat Messages Area */}
                                  <ScrollArea className="h-[500px] p-4">
                                    {chatMessages.length === 0 ? (
                                      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-8">
                                        <MessageCircle className="h-16 w-16 text-muted-foreground/50" />
                                        <div className="space-y-2">
                                          <h3 className="font-semibold text-lg">Start a Conversation</h3>
                                          <p className="text-sm text-muted-foreground max-w-md">
                                            Ask questions about the startup's financials, team, market opportunity, risks, or any other aspect of the documents.
                                          </p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-2xl">
                                          <Button variant="outline" size="sm" onClick={() => setChatInput("What are the key risks highlighted in the analysis?")} className="text-left justify-start">
                                            💡 What are the key risks?
                                          </Button>
                                          <Button variant="outline" size="sm" onClick={() => setChatInput("What's the startup's current revenue and growth rate?")} className="text-left justify-start">
                                            📈 Current revenue & growth?
                                          </Button>
                                          <Button variant="outline" size="sm" onClick={() => setChatInput("Who are the founders and what's their background?")} className="text-left justify-start">
                                            👥 Tell me about the founders
                                          </Button>
                                          <Button variant="outline" size="sm" onClick={() => setChatInput("What's the market size and opportunity?")} className="text-left justify-start">
                                            🌍 Market opportunity?
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-4">
                                        {chatMessages.map((msg, idx) => (
                                          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.role === 'assistant' && (
                                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Bot className="h-4 w-4 text-primary" />
                                              </div>
                                            )}
                                            <div className={`max-w-[80%] rounded-lg p-4 ${
                                              msg.role === 'user' 
                                                ? 'bg-primary text-primary-foreground' 
                                                : 'bg-muted'
                                            }`}>
                                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                              {msg.sources && msg.sources.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-border/50">
                                                  <p className="text-xs font-semibold mb-1">Sources:</p>
                                                  <div className="flex flex-wrap gap-1">
                                                    {msg.sources.map((source, sidx) => (
                                                      <Badge key={sidx} variant="outline" className="text-xs">
                                                        {source}
                                                      </Badge>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                            {msg.role === 'user' && (
                                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                                <span className="text-xs font-bold text-primary-foreground">You</span>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                        {isAskingQuestion && (
                                          <div className="flex gap-3 justify-start">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                              <Bot className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                                              <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span className="text-sm text-muted-foreground">Thinking...</span>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </ScrollArea>
                                  
                                  {/* Chat Input Area */}
                                  <div className="border-t p-4">
                                    {chatError && (
                                      <Alert variant="destructive" className="mb-3">
                                        <AlertDescription className="text-xs">{chatError}</AlertDescription>
                                      </Alert>
                                    )}
                                    <div className="flex gap-2">
                                      <Input
                                        placeholder="Ask a question about the startup documents..."
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleAskQuestion();
                                          }
                                        }}
                                        disabled={isAskingQuestion}
                                        className="flex-1"
                                      />
                                      <Button 
                                        onClick={handleAskQuestion} 
                                        disabled={!chatInput.trim() || isAskingQuestion}
                                        size="icon"
                                      >
                                        {isAskingQuestion ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Send className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                      Press Enter to send, Shift+Enter for new line
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            </TabsContent>
                            
                             <TabsContent value="audio" className="mt-4">
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Audio Overview</CardTitle>
                                    <CardDescription>A 2-3 minute audio summary of the investment memo.</CardDescription>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                      {!audioDataUri && (
                                        <div className="flex flex-col items-center gap-4 text-center">
                                          <p className="text-muted-foreground text-sm">Click the button to generate an audio version of the summary.</p>
                                          <Button onClick={handleGenerateAudio} disabled={isGeneratingAudio}>
                                            {isGeneratingAudio && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            <Play className="mr-2 h-4 w-4" />
                                            Generate Audio
                                          </Button>
                                        </div>
                                      )}
                                      {audioDataUri && (
                                        <div className="space-y-4">
                                          <audio controls src={audioDataUri} className="w-full"></audio>
                                           <Button onClick={() => saveAs(audioDataUri, "audio-overview.wav")} variant="outline">
                                            <Download className="mr-2 h-4 w-4" />
                                            Download Audio (.wav)
                                          </Button>
                                        </div>
                                      )}
                                  </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="flashcards" className="mt-4">
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <h3 className="text-lg font-semibold">Study Flashcards</h3>
                                      <p className="text-sm text-muted-foreground">Key terms and definitions from the startup documents</p>
                                    </div>
                                    <Button onClick={downloadFlashcards} variant="outline" size="sm">
                                      <Download className="mr-2 h-3 w-3" />
                                      Download PDF
                                    </Button>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {analysisResult.flashcards.split('\n\n').map((card, index) => {
                                      const [term, def] = card.split('\n');
                                      const termText = term?.replace('Term: ', '');
                                      const defText = def?.replace('Definition: ', '');
                                      
                                      if (!termText || !defText) return null;
                                      
                                      return (
                                        <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-background to-muted/30">
                                          <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                              <Badge variant="secondary" className="text-xs">
                                                #{index + 1}
                                              </Badge>
                                            </div>
                                          </CardHeader>
                                          <CardContent className="space-y-3">
                                            <div className="min-h-[60px]">
                                              <h4 className="font-bold text-base mb-2 text-primary group-hover:text-primary/80 transition-colors">
                                                {termText}
                                              </h4>
                                              <div className="h-px bg-gradient-to-r from-primary/50 to-transparent mb-3"></div>
                                              <p className="text-sm text-muted-foreground leading-relaxed">
                                                {defText}
                                              </p>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      );
                                    })}
                                  </div>
                                  
                                  <div className="text-center pt-4">
                                    <p className="text-xs text-muted-foreground">
                                      {analysisResult.flashcards.split('\n\n').filter(c => c.trim()).length} flashcards generated
                                    </p>
                                  </div>
                                </div>
                            </TabsContent>
                          </Tabs>
                      </CardContent>
                  </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="compliance">
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="font-headline">Compliance &amp; Data Review</CardTitle>
              <CardDescription>
                Assess the startup’s regulatory compliance score and review critical data points based on your location and the AI-generated memo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Button onClick={handleGenerateCompliance} disabled={isGeneratingCompliance || !analysisResult || !analysisResult.investmentMemo}>
                    {isGeneratingCompliance && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Compliance Report
                </Button>

                {complianceError && (
                    <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{complianceError}</AlertDescription>
                    </Alert>
                )}

                {isGeneratingCompliance && (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Analyzing compliance... this may take a moment.</span>
                    </div>
                )}

                {complianceReport && (
                    <Card className="bg-muted/50">
                        <CardHeader>
                            <CardTitle className="font-headline text-xl flex items-center gap-2">
                              <ShieldCheck /> Compliance Report
                              {customStartupName && <Badge variant="outline" className="ml-2">{customStartupName}</Badge>}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="flex items-center justify-between p-3 rounded-lg bg-background mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold">Compliance Score</span>
                                </div>
                                <span className="font-bold text-2xl text-primary">{complianceReport.complianceScore}/100</span>
                            </div>
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                                <ReactMarkdown>{complianceReport.report}</ReactMarkdown>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connect">
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                Connect &amp; Invest
                {customStartupName && <Badge variant="default">{customStartupName}</Badge>}
              </CardTitle>
              <CardDescription>
                You're ready to take the next step. Schedule a meeting with the founder{customStartupName ? ` of ${customStartupName}` : ''} to discuss the opportunity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                   <Label htmlFor="investor-email">Your Email ID</Label>
                   <Input 
                      id="investor-email" 
                      type="email"
                      placeholder="e.g., jane.doe@example.com" 
                      value={investorEmail}
                      onChange={(e) => setInvestorEmail(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="founder-emails">Founder Email(s)</Label>
                   <Textarea 
                      id="founder-emails" 
                      placeholder="Enter founder emails, separated by commas (e.g., founder1@example.com, founder2@example.com)" 
                      value={founderEmails}
                      onChange={(e) => setFounderEmails(e.target.value)} 
                      rows={2}
                    />
                </div>

                <Button onClick={handleScheduleMeeting} disabled={isSchedulingMeeting || !complianceReport || !founderEmails || !investorEmail}>
                    {isSchedulingMeeting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Video className="mr-2 h-4 w-4" />
                    Schedule Meeting with Founder
                </Button>

                {meetingError && (
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{meetingError}</AlertDescription>
                    </Alert>
                )}

                {meetingDetails && (
                    <Alert>
                        <AlertTitle>Meeting Scheduled!</AlertTitle>
                        <AlertDescription className="space-y-4">
                            <p>{meetingDetails.confirmationMessage}</p>
                            <a href={meetingDetails.meetingLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                                <LinkIcon className="h-4 w-4" />
                                <span>Join Google Meet</span>
                            </a>
                        </AlertDescription>
                    </Alert>
                )}
                
                <div className="border-t pt-6 mt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-muted-foreground">Meeting Archive (Coming Soon)</h3>
                    <p className="text-sm text-muted-foreground">After your meeting, transcripts, action items, and salient points for investment decisions will appear here automatically.</p>
                     <div className="p-8 text-center bg-muted/50 rounded-lg">
                        <p className="text-muted-foreground">No meeting data available yet.</p>
                    </div>
                </div>

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    
