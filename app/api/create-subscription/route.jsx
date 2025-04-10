import { NextRequest } from "next/server";
import Razorpay from "razorpay";

export async function POST(req) {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_LIVE_KEY,
      key_secret: process.env.RAZORPAY_SECRET_KEY
    });
    
    const result = await instance.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID,
      customer_notify: 1,
      quantity: 1,
      total_count: 12,
      addons: [],
      notes: {
        key1: "value3",
        key2: "value2"
      }
    });
    
    return Response.json(result);
  } catch (error) {
    console.error("Razorpay API error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}