import { Download, FileText, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useRef, useState } from 'react';
import jsPDF from 'jspdf';

export function RelocationBlueprint({ content }) {
    const reportRef = useRef();
    const [isExporting, setIsExporting] = useState(false);


    const handleDownload = () => {
        if (!content) return;
        setIsExporting(true);

        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const margin = 20;
            const maxLineWidth = pageWidth - (margin * 2);
            let cursorY = 25;

            // 1. Title
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(22);
            pdf.setTextColor(0, 123, 255); // NexusBlue
            pdf.text("NexusMigrate: Relocation Blueprint", margin, cursorY);
            cursorY += 15;

            // 2. Body Text Parsing
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(11);
            pdf.setTextColor(40, 40, 40);

            // Simple Markdown cleaning: remove #, *, and split into lines
            const cleanContent = content
                .replace(/#/g, '')
                .replace(/\*\*/g, '')
                .split('\n');

            cleanContent.forEach(line => {
                if (line.trim() === "") {
                    cursorY += 5; // Paragraph spacing
                } else {
                    // Wrap text to fit the page width
                    const wrappedText = pdf.splitTextToSize(line.trim(), maxLineWidth);

                    // Check for page overflow
                    if (cursorY + (wrappedText.length * 7) > 280) {
                        pdf.addPage();
                        cursorY = 20;
                    }

                    pdf.text(wrappedText, margin, cursorY);
                    cursorY += (wrappedText.length * 7);
                }
            });

            pdf.save(`NexusMigrate_Blueprint_${Date.now()}.pdf`);
        } catch (error) {
            console.error("PDF Native Export Error:", error);
            alert("Native export failed. Check console.");
        } finally {
            setIsExporting(false);
        }
    };

    if (!content) {
        return (
            <div className="bg-[#F4F7F6] border border-gray-200 rounded-lg p-8 shadow-lg">
                <div className="flex flex-col items-center justify-center h-96 text-center">
                    <FileText className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-xl text-gray-600 mb-2">No Blueprint Generated</h3>
                    <p className="text-gray-500">Deploy the swarm to generate your relocation blueprint</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#0F2642]/50 border border-[#1E3A5F] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[800px] backdrop-blur-md">

            {/* The Header */}
            <div className="bg-[#0F2642] border-b border-[#1E3A5F] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg text-white font-bold tracking-tight">Relocation Blueprint</h3>
                </div>
                <button
                    onClick={handleDownload}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-[#007BFF] text-white rounded-lg hover:bg-[#0066D9] disabled:bg-gray-400 transition-colors duration-200"
                >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    <span className="text-sm">{isExporting ? "Generating..." : "Download PDF"}</span>
                </button>
            </div>

            {/* The Content Area */}
            <div className="p-8 overflow-y-auto custom-scrollbar bg-transparent">
                <div className="prose prose-invert prose-blue max-w-none text-gray-100">
                    <ReactMarkdown>{content}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
}