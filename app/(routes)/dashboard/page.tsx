'use client';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs'
import React, { useState } from 'react'
import EmptyState from './EmptyState';
import { Plus } from 'lucide-react';
import CreateInterviewDialog from '../_components/CreateInterviewDialog';

function Dashboard() {

    const { user } = useUser();
    const [interviewList, setInterviewList] = useState([]);

    console.log(setInterviewList);

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-8 sm:px-6 lg:px-8 xl:px-12 max-w-7xl'>
        
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-8">
          <div className="space-y-1">
            <p className='text-sm sm:text-base text-muted-foreground font-medium'>
              My Dashboard
            </p>
            <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground'>
              Welcome back, {user?.fullName || 'User'}
            </h1>
          </div>

          <CreateInterviewDialog/>
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          {interviewList.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Interview cards */}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
