"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: ((event: Event & { error: string }) => void) | null
  start(): void
  stop(): void
  abort(): void
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[-*+]\s/g, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .trim()
}

export function useSpeech() {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [speechSupported, setSpeechSupported] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setSpeechSupported(!!SpeechRecognition)
  }, [])

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setSpeaking(false)
  }, [])

  const startListening = useCallback(
    (lang?: string) => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) return

      stopSpeaking()

      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = lang || "ne-NP"

      let finalTranscript = ""

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += t
          } else {
            interim += t
          }
        }
        setTranscript(finalTranscript || interim)
      }

      recognition.onend = () => {
        setListening(false)
        recognitionRef.current = null
        if (finalTranscript) {
          setTranscript(finalTranscript)
        }
      }

      recognition.onerror = () => {
        setListening(false)
        recognitionRef.current = null
      }

      recognitionRef.current = recognition
      recognition.start()
      setListening(true)
      setTranscript("")
    },
    [stopSpeaking],
  )

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [])

  const speak = useCallback(
    (text: string, lang?: string) => {
      if (!voiceEnabled || !text.trim()) return
      if (typeof window === "undefined" || !window.speechSynthesis) return

      window.speechSynthesis.cancel()

      const clean = stripMarkdown(text)
      if (!clean) return

      const utterance = new SpeechSynthesisUtterance(clean)
      utterance.lang = lang || "ne-NP"
      utterance.rate = 1
      utterance.pitch = 1

      const voices = window.speechSynthesis.getVoices()
      const preferred = voices.find((v) => v.lang.startsWith("ne"))
      const english = voices.find((v) => v.lang.startsWith("en"))
      if (preferred) {
        utterance.voice = preferred
      } else if (english) {
        utterance.voice = english
      }

      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)

      window.speechSynthesis.speak(utterance)
    },
    [voiceEnabled],
  )

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  return {
    listening,
    transcript,
    speechSupported,
    startListening,
    stopListening,
    setTranscript,
    voiceEnabled,
    setVoiceEnabled,
    speaking,
    speak,
    stopSpeaking,
  }
}
