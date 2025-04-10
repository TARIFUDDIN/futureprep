import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req) {
    try {
        // Parse the request body
        const body = await req.json();
        const { subId } = body;

        console.log("Received subscription ID to cancel:", subId);

        // Validate subscription ID
        if (!subId) {
            return NextResponse.json(
                { error: "Subscription ID is required" }, 
                { status: 400 }
            );
        }

        // Initialize Razorpay instance
        const instance = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_LIVE_KEY || '',
            key_secret: process.env.RAZORPAY_SECRET_KEY || ''
        });

        try {
            // Attempt to fetch subscription details first
            // This helps verify if it's a valid subscription
            const subscriptionDetails = await instance.subscriptions.fetch(subId);
            console.log("Subscription details:", subscriptionDetails);
        } catch (fetchError) {
            console.error("Subscription fetch error:", fetchError);
            
            // Additional logging to understand the error
            return NextResponse.json(
                { 
                    error: "Invalid subscription ID",
                    details: fetchError instanceof Error ? {
                        message: fetchError.message,
                        name: fetchError.name,
                        stack: fetchError.stack
                    } : String(fetchError)
                }, 
                { status: 400 }
            );
        }

        // Attempt to cancel subscription
        const result = await instance.subscriptions.cancel(subId);

        return NextResponse.json({ 
            success: true, 
            message: "Subscription canceled successfully",
            result 
        });

    } catch (error) {
        console.error("Subscription Cancellation Error:", error);

        // More detailed error handling
        return NextResponse.json(
            { 
                error: "Failed to cancel subscription", 
                details: error instanceof Error ? {
                    message: error.message,
                    name: error.name,
                    stack: error.stack
                } : String(error)
            }, 
            { status: 500 }
        );
    }
}