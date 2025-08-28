import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import ResumeUpload from './ResumeUpload'
import JobDescription from './JobDescription'
import { DialogClose } from '@radix-ui/react-dialog'
import { FormDataType } from '@/types/Types'

const CreateInterviewDialog = () => {

    const [formData, setFormData] = useState<FormDataType>({
        resume: null,
        jobTitle: "",
        jobDescription: ""
    });
    console.log(formData);

    const onHandleInputChange = (field: keyof FormDataType, value: string | File | null | undefined) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button 
                    size="lg" 
                    className="flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 mb-8 cursor-pointer"
                >
                    <Plus size={20} />
                    Create Your First Interview
                </Button>
            </DialogTrigger>
            <DialogContent className='w-full max-w-4xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
                        Create New Interview
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base text-muted-foreground">
                        Please provide the following details to set up your interview.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                    <Tabs defaultValue="resume-upload" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger 
                                value="resume-upload" 
                                className="text-xs sm:text-sm font-medium"
                            >
                                Resume Upload
                            </TabsTrigger>
                            <TabsTrigger 
                                value="job-description" 
                                className="text-xs sm:text-sm font-medium"
                            >
                                Job Description
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="resume-upload" className="space-y-4">
                            <ResumeUpload onInputChange={onHandleInputChange} />
                        </TabsContent>
                        <TabsContent value="job-description" className="space-y-4">
                            <JobDescription onInputChange={onHandleInputChange}/>
                        </TabsContent>
                    </Tabs>
                </div>

                <DialogFooter className='flex flex-col sm:flex-row gap-3 pt-4'>
                    <DialogClose asChild>
                        <Button variant="outline" className="w-full sm:w-auto">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button className="w-full sm:w-auto">
                        Create Interview
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateInterviewDialog
