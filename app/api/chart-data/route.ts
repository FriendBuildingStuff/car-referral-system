import { NextResponse } from 'next/server';
import { monthlyAwarded, monthlyEarnings } from '@/app/lib/data-m';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  
  try {
    if (type === 'awarded') {
      const data = await monthlyAwarded();
      // Ensure we always return an array, even if data is null
      return NextResponse.json(data || []);
    } else if (type === 'earnings') {
      const data = await monthlyEarnings();
      // Ensure we always return an array, even if data is null
      return NextResponse.json(data || []);
    } else {
      return NextResponse.json({ error: 'Invalid chart type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

