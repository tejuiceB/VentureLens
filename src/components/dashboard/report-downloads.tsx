
"use client";

import { useState } from "react";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, Loader2 } from "lucide-react";
import { generateDocxReport } from "@/ai/flows/generate-docx-report";

interface ReportDownloadsProps {
  memo: string | null;
}

export function ReportDownloads({ memo }: ReportDownloadsProps) {
  const [isDownloading, setIsDownloading] = useState<"pdf" | "word" | null>(null);

  const generateHtmlFromMemo = (memoData: string): string => {
    // A simple markdown to html conversion
    let html = memoData
      .replace(/### (.*)/g, '<h2>$1</h2>')
      .replace(/## (.*)/g, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*)\*/g, '<em>$1</em>')
      .replace(/- (.*)/g, '<li>$1</li>')
      .replace(/\n/g, '<br/>');
    return `<h1>Investment Memo</h1>${html}`;
  };

  const handleDownloadPdf = async () => {
    if (!memo) return;
    setIsDownloading("pdf");

    try {
      const memoContainer = document.createElement("div");
      memoContainer.innerHTML = generateHtmlFromMemo(memo);
      memoContainer.style.width = '800px';
      memoContainer.style.padding = '20px';
      memoContainer.style.background = 'white';
      memoContainer.style.color = 'black';
      document.body.appendChild(memoContainer);

      const canvas = await html2canvas(memoContainer, {
          scale: 2,
          useCORS: true,
      });

      document.body.removeChild(memoContainer);
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save("investment-memo.pdf");

    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDownloadWord = async () => {
    if (!memo) return;
    setIsDownloading("word");
    try {
        const htmlString = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Investment Memo</title>
            </head>
            <body>
                ${generateHtmlFromMemo(memo)}
            </body>
            </html>
        `;

        const { docxBase64 } = await generateDocxReport({ htmlContent: htmlString });
        
        const byteCharacters = atob(docxBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});

        saveAs(blob, "investment-memo.docx");

    } catch (error) {
        console.error("Error generating DOCX:", error);
    } finally {
        setIsDownloading(null);
    }
  };

  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={!memo || !!isDownloading}>
                {isDownloading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Download className="mr-2 h-4 w-4" />
                )}
                Download
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem onClick={handleDownloadPdf} disabled={!!isDownloading}>
                {isDownloading === 'pdf' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Download as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadWord} disabled={!!isDownloading}>
                 {isDownloading === 'word' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Download as Word
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  );
}

    