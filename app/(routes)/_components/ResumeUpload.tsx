"use client";
import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { onInputChangeType } from "@/types/Types";

const ResumeUpload = ({ onInputChange }: { onInputChange: onInputChangeType }) => {

    const [files, setFiles] = useState<File[]>([]);
    const handleFileUpload = (files: File[]) => {
        setFiles(files);
        console.log(files);
        // Update form data with the first file
        if (files.length > 0) {
            onInputChange('resume', files[0]);
        }
    };

  return (
    <div className="w-full">
        <div className="space-y-2 mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
                Upload Resume
            </h3>
            <p className="text-sm text-muted-foreground">
                Upload your resume in PDF format to help generate relevant interview questions.
            </p>
        </div>
        
        <div className="w-full mx-auto min-h-64 sm:min-h-80 border border-dashed border-border bg-card rounded-lg hover:border-primary/50 transition-colors duration-200">
            <FileUpload onChange={handleFileUpload} />
        </div>
    </div>
  )
}

export default ResumeUpload
