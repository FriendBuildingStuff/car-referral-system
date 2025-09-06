"use client"

import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts"
import React, { useState, useEffect } from "react";

// Define interfaces for our data types
interface AwardedData {
  month: string;
  awarded: number;
}

interface EarningsData {
  month: string;
  earnings: number;
}

interface CombinedData {
  month: string;
  awarded: number;
  earnings: number;
}

function CombinedChart() {
    const [data, setData] = useState<CombinedData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch combined data for both awarded and earnings
        Promise.all([
          fetch('/api/chart-data?type=awarded').then((response) => response.json()),
          fetch('/api/chart-data?type=earnings').then((response) => response.json()),
        ])
          .then(([awardedData, earningsData]: [AwardedData[], EarningsData[]]) => {
            // Add null checks to prevent errors
            const safeAwardedData = awardedData || [];
            const safeEarningsData = earningsData || [];
            
            const combinedData: CombinedData[] = safeAwardedData.map((item) => {
              const earningsItem = safeEarningsData.find((e) => e.month === item.month);
              return {
            ...item,
            earnings: earningsItem ? earningsItem.earnings : 0,
              };
            });
            setData(combinedData);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching combined data:", error);
            setError("Failed to load chart data");
            setLoading(false);
            // Set empty array on error to prevent crashes
            setData([]);
          });
    }, []);

    if (loading) {
        return <div className="p-4">Loading chart...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="w-full h-96 p-4">
            <h2 className="text-lg font-semibold mb-4">Awarded & Earnings</h2>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        dataKey="month" 
                        tickFormatter={(value) => String(value).slice(0, 3)}
                    />
                    <Bar dataKey="earnings" fill="#10b981" />
                    <Bar dataKey="awarded" fill="#f59e0b" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default function Page(){
     return (
        <div className="flex flex-col space-y-4">
            <CombinedChart />
        </div>
      )
}