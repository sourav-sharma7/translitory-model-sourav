import { type NextRequest, NextResponse } from "next/server"

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, target_language } = body

    // Validate input
    if (!text || !target_language) {
      return NextResponse.json({ error: "Text and target language are required" }, { status: 400 })
    }

    // Forward request to Python backend
    const pythonResponse = await fetch(`${PYTHON_BACKEND_URL}/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        target_language: target_language,
      }),
    })

    if (!pythonResponse.ok) {
      const errorData = await pythonResponse.json()
      return NextResponse.json(
        { error: errorData.detail || "Translation service unavailable" },
        { status: pythonResponse.status },
      )
    }

    const translationData = await pythonResponse.json()
    return NextResponse.json(translationData)
  } catch (error) {
    console.error("Translation API error:", error)

    // Check if it's a connection error to Python backend
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        { error: "Python backend is not available. Please ensure the Python server is running on port 8000." },
        { status: 503 },
      )
    }

    return NextResponse.json({ error: "Internal server error during translation" }, { status: 500 })
  }
}
