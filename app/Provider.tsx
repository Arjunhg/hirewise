'use client'
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import React, { useEffect } from 'react'
import { ReactNode } from "react";

function Provider({children}: {children: ReactNode}) {

  const CreateUser = useMutation(api.users.CreateNewUser);

  const { user } = useUser();

  useEffect(() => {
    user && CreateNewUser();
  }, [user])

  const CreateNewUser = async () => {
    if(user){
        const result = await CreateUser({
          email: user?.primaryEmailAddress?.emailAddress || '',
          imageUrl: user?.imageUrl || '',
          name: user?.fullName || ''
        })

        console.log(result);
    }
  }

  return (
    <div>
      {children}
    </div>
  )
}

export default Provider
