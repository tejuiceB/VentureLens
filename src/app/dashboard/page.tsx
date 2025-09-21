

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
import { FileUp, Loader2, Trash2, BotMessageSquare, ShieldCheck, Video, Link as LinkIcon, Download, Music, RectangleStack, Play } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { saveAs } from "file-saver";


const currencies = ["INR", "USD", "EUR", "GBP", "JPY", "CAD", "AUD"];
const investmentFocusOptions = ["Seed Stage", "Early Stage", "Growth Stage", "Late Stage", "Pre-IPO", "Buyouts", "Venture Debt"];
const investmentStageOptions = ["Pre-seed", "Seed", "Series A", "Series B", "Series C+", "Growth Equity", "Late Stage"];


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
  const [investorCriteria, setInvestorCriteria] = useState("");
  const [analysisResult, setAnalysisResult] = useState<NotebookLmReportOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzerError, setAnalyzerError] = useState<string | null>(null);
  const [founderInput, setFounderInput] = useState("");
  const [selectedStartupsForAnalysis, setSelectedStartupsForAnalysis] = useState<string[]>([]);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);


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
      
      const input: NotebookLmReportInput = {
          files, 
          investorCriteria, 
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
        
        const startupName = uploadedFiles[0]?.name.split('.')[0] || "the startup";

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
      const startupName = uploadedFiles[0]?.name.split('.')[0] || "the startup";
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
          <TabsTrigger value="analyzer" disabled={!foundStartups}>3. Document Analyzer</TabsTrigger>
          <TabsTrigger value="compliance" disabled={!analysisResult}>4. Compliance</TabsTrigger>
          <TabsTrigger value="connect" disabled={!complianceReport}>5. Connect &amp; Invest</TabsTrigger>
        </TabsList>

        <TabsContent value="profiler">
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="font-headline">Investor Questionnaire</CardTitle>
              <CardDescription>Complete this questionnaire to generate your personalized investment profile. Our AI will use this to tailor its recommendations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
              <CardDescription>Upload documents, add founder input, and our agent will generate a comprehensive investment memo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onDragEnter={handleDrag} className="relative">
                <input type="file" id="pitch-deck-input" accept=".pdf,.txt,.eml,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" onChange={handleChange} multiple />
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

              <div>
                <Label htmlFor="investor-criteria">Your Investment Criteria (auto-filled from your profile)</Label>
                <Textarea 
                  id="investor-criteria" 
                  placeholder="Generate your profile in the 'Investor Profile' tab to auto-fill your criteria, or enter it manually here. e.g., 'Looking for SaaS companies with $1M+ ARR...'" 
                  rows={8}
                  value={investorCriteria}
                  onChange={(e) => setInvestorCriteria(e.target.value)}
                  readOnly
                  className="bg-muted/50"
                />
              </div>
              <Button onClick={handleAnalyze} disabled={isAnalyzing || uploadedFiles.length === 0 || !investorCriteria}>
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
                              <div>
                                  <CardTitle className="font-headline text-xl flex items-center gap-2"><BotMessageSquare /> Analysis Complete</CardTitle>
                                  <CardDescription>Review the generated investment memo below.</CardDescription>
                              </div>
                          </div>
                      </CardHeader>
                      <CardContent>
                          <Tabs value={currentAnalysisTab} onValueChange={setCurrentAnalysisTab} className="w-full">
                            <TabsList>
                                <TabsTrigger value="memo">Investment Memo</TabsTrigger>
                                <TabsTrigger value="audio">Audio Overview</TabsTrigger>
                                <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                            </TabsList>
                            <TabsContent value="memo" className="mt-4">
                               <div className="flex justify-end mb-4">
                                 <ReportDownloads memo={analysisResult.investmentMemo} />
                               </div>
                                <div className="prose prose-sm max-w-none dark:prose-invert">
                                    <ReactMarkdown>{analysisResult.investmentMemo}</ReactMarkdown>
                                </div>
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
                                <Card>
                                   <CardHeader>
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <CardTitle>Flashcards</CardTitle>
                                        <CardDescription>Key terms and definitions from the documents.</CardDescription>
                                      </div>
                                       <Button onClick={downloadFlashcards} variant="outline">
                                          <Download className="mr-2 h-4 w-4" />
                                          Download PDF
                                      </Button>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                      {analysisResult.flashcards.split('\n\n').map((card, index) => {
                                          const [term, def] = card.split('\n');
                                          return (
                                              <div key={index} className="p-3 rounded-md bg-background text-sm">
                                                  <p className="font-bold">{term?.replace('Term: ', '')}</p>
                                                  <p className="text-muted-foreground">{def?.replace('Definition: ', '')}</p>
                                              </div>
                                          );
                                      })}
                                  </CardContent>
                                </Card>
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
                            <CardTitle className="font-headline text-xl flex items-center gap-2"><ShieldCheck /> Compliance Report</CardTitle>
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
              <CardTitle className="font-headline">Connect &amp; Invest</CardTitle>
              <CardDescription>
                You're ready to take the next step. Schedule a meeting with the founder to discuss the opportunity.
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

    

