'use client'
import React from 'react'
import { ReactNode } from "react";

function Provider({children}: {children: ReactNode}) {
  return (
    <div>
      {children}
    </div>
  )
}

export default Provider
