import { NextResponse } from "next/server"

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000"

export async function GET() {
  try {
    const response = await fetch(`${PYTHON_BACKEND_URL}/health`, {
      method: "GET",
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({ status: "online", backend: data })
    } else {
      return NextResponse.json({ status: "offline" }, { status: 503 })
    }
  } catch (error) {
      console.error("Backend health check failed:", error);
      return NextResponse.json({ status: "offline", error: "Backend unreachable" }, { status: 503 });  }
}
