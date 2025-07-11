"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Languages, ArrowRight, Server } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const languages = [
  { id: "hindi", label: "Hindi", code: "hi", flag: "" },
  { id: "bengali", label: "Bengali", code: "bn", flag: "" },
  { id: "tamil", label: "Tamil", code: "ta", flag: "" },
]

export default function TranslationApp() {
  const [selectedLanguage, setSelectedLanguage] = useState("")
  const [inputText, setInputText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking")

  // Check backend status on component mount
  React.useEffect(() => {
    checkBackendStatus()
  }, [])

  const checkBackendStatus = async () => {
    try {
      const response = await fetch("/api/health")
      if (response.ok) {
        setBackendStatus("online")
      } else {
        setBackendStatus("offline")
      }
    } catch {
      setBackendStatus("offline")
    }
  }

  const handleTranslate = async () => {
    if (!selectedLanguage || !inputText.trim()) {
      setError("Please select a target language and enter English text to translate")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          target_language: selectedLanguage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Translation failed")
      }

      const data = await response.json()
      setTranslatedText(data.translated_text)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to translate text. Please try again.")
      console.error("Translation error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setInputText("")
    setTranslatedText("")
    setSelectedLanguage("")
    setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Languages className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Transliteration Model</h1>
          </div>
          <p className="text-gray-600">
            Translate English text to Hindi, Bengali, or Tamil.
          </p>

          {/* Backend Status Indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <Server className="h-4 w-4" />
            <span className="text-sm">
              Python Backend:
              <span
                className={`ml-1 font-medium ${
                  backendStatus === "online"
                    ? "text-green-600"
                    : backendStatus === "offline"
                      ? "text-red-600"
                      : "text-yellow-600"
                }`}
              >
                {backendStatus === "online" ? "Online" : backendStatus === "offline" ? "Offline" : "Checking..."}
              </span>
            </span>
            {backendStatus === "offline" && (
              <Button variant="outline" size="sm" onClick={checkBackendStatus}>
                Retry
              </Button>
            )}
          </div>
        </div>

        {backendStatus === "offline" && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertDescription className="text-yellow-800">
              Python backend is not running. Please start the Python server on port 8000 to use the translation service.
              <br />
              <code className="text-xs bg-yellow-100 px-1 py-0.5 rounded mt-1 inline-block">
                cd python-backend && python main.py
              </code>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">English Input</CardTitle>
              <CardDescription>Enter English text and select your target language</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="input-text" className="text-sm font-medium mb-2 block">
                  Enter English Text
                </Label>
                <Textarea
                  id="input-text"
                  placeholder="Enter your English text here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Select Target Language</Label>
                <RadioGroup
                  value={selectedLanguage}
                  onValueChange={setSelectedLanguage}
                  className="grid grid-cols-1 gap-2"
                >
                  {languages.map((language) => (
                    <div key={language.id} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={language.id} id={language.id} />
                      <Label htmlFor={language.id} className="cursor-pointer flex items-center gap-2">
                        <span className="text-lg">{language.flag}</span>
                        <span>{language.label}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleTranslate}
                  disabled={isLoading || !selectedLanguage || !inputText.trim() || backendStatus === "offline"}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Translate to{" "}
                      {selectedLanguage ? languages.find((l) => l.id === selectedLanguage)?.label : "Language"}
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                {selectedLanguage ? (
                  <>
                    {languages.find((l) => l.id === selectedLanguage)?.flag}{" "}
                    {languages.find((l) => l.id === selectedLanguage)?.label} Translation
                  </>
                ) : (
                  "Translation Output"
                )}
              </CardTitle>
              <CardDescription>The translated text will appear here</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <div className="min-h-[120px] p-4 border rounded-md bg-gray-50">
                {translatedText ? (
                  <p
                    className="text-gray-900 leading-relaxed text-lg"
                    style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                  >
                    {translatedText}
                  </p>
                ) : (
                  <p className="text-gray-500 italic">
                    {selectedLanguage
                      ? `${languages.find((l) => l.id === selectedLanguage)?.label} translation will appear here...`
                      : "Select a language and enter text to see translation..."}
                  </p>
                )}
              </div>

              {translatedText && (
                <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                  <span>Translated to {languages.find((l) => l.id === selectedLanguage)?.label}</span>
                  <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(translatedText)}>
                    Copy Text
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sample Translations */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Try These Sample Phrases</CardTitle>
            <CardDescription>Click on any phrase to translate it</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                "Hello, how are you?",
                "Thank you very much",
                "Good morning",
                "What is your name?",
                "I am happy to meet you",
                "Have a great day",
                "Please help me",
                "Where is the market?",
                "How much does this cost?",
              ].map((phrase, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-left justify-start h-auto p-3 whitespace-normal bg-transparent"
                  onClick={() => setInputText(phrase)}
                >
                  {phrase}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
