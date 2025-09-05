import { currentUser } from '@clerk/nextjs/server';
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from 'next/server';




export async function GET() {
    const clerk = await clerkClient();
const adminUsers = await clerk.users.getUserList({
        limit: 100
      });
      return NextResponse.json(adminUsers);
}