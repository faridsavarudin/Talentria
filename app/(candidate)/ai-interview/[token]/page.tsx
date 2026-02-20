"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  CheckCircle2,
  AlertCircle,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Stage =
  | "loading"
  | "error"
  | "intro"
  | "camera_check"
  | "ai_speaking"
  | "candidate_thinking"
  | "candidate_speaking"
  | "processing"
  | "completed";

type TranscriptEntry = {
  role: "user" | "assistant";
  content: string;
  questionIndex: number;
};

type AIEvaluation = {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendation: "advance" | "hold" | "reject";
};

type SessionData = {
  id: string;
  inviteToken: string;
  status: string;
  totalQuestions: number;
  currentQuestion: number;
  candidateName: string | null;
  isDemo?: boolean;
  demoQuestions?: string[];
};

// ─────────────────────────────────────────────
// Waveform animation component
// ─────────────────────────────────────────────

function AIWaveform({ active }: { active: boolean }) {
  const bars = [0.4, 0.7, 1, 0.75, 0.5];
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {bars.map((scale, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full bg-indigo-400"
          style={{
            height: active ? `${Math.round(scale * 40)}px` : "8px",
            animation: active
              ? `aiBarPulse ${0.6 + i * 0.15}s ease-in-out infinite alternate`
              : "none",
            transition: "height 0.3s ease",
          }}
        />
      ))}
      <style>{`
        @keyframes aiBarPulse {
          0% { transform: scaleY(0.5); opacity: 0.7; }
          100% { transform: scaleY(1.4); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────
// TTS helper
// ─────────────────────────────────────────────

function speakText(text: string, onEnd: () => void): SpeechSynthesisUtterance {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  const setVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find(
        (v) =>
          v.name.includes("Samantha") ||
          v.name.includes("Google US English") ||
          v.name.includes("Alex") ||
          (v.lang === "en-US" && !v.name.includes("Google"))
      ) ||
      voices.find((v) => v.lang === "en-US") ||
      voices[0];
    if (preferred) utterance.voice = preferred;
  };

  if (window.speechSynthesis.getVoices().length > 0) {
    setVoice();
  } else {
    window.speechSynthesis.onvoiceschanged = setVoice;
  }

  utterance.onend = onEnd;
  utterance.onerror = onEnd; // advance even on TTS error
  window.speechSynthesis.speak(utterance);
  return utterance;
}

// ─────────────────────────────────────────────
// Speech Recognition type shim
// ─────────────────────────────────────────────

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function AIInterviewPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [stage, setStage] = useState<Stage>("loading");
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Interview state
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentAIMessage, setCurrentAIMessage] = useState("");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [countdown, setCountdown] = useState(3);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [evaluation, setEvaluation] = useState<AIEvaluation | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [startedAt] = useState<Date>(new Date());

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const conversationHistoryRef = useRef<TranscriptEntry[]>([]);
  // Mirror live/final transcript in refs for synchronous reads
  const finalTranscriptRef = useRef("");
  const liveTranscriptRef = useRef("");

  // Keep conversation history ref in sync
  useEffect(() => {
    conversationHistoryRef.current = transcript;
  }, [transcript]);

  // Assign camera stream to video element once it renders into the DOM
  useEffect(() => {
    if (videoRef.current && streamRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [stage]);

  // ── Load session ──────────────────────────────────────────

  useEffect(() => {
    // Demo mode: token starts with "demo"
    if (token === "demo" || token.startsWith("demo-")) {
      const demoSession: SessionData = {
        id: "demo",
        inviteToken: token,
        status: "pending",
        totalQuestions: 4,
        currentQuestion: 0,
        candidateName: null,
        isDemo: true,
        demoQuestions: [
          "Tell me about yourself and your professional background.",
          "Describe a challenging project you worked on. What was your role and how did you handle it?",
          "How do you handle working under pressure or tight deadlines?",
          "Where do you see yourself in 5 years and what are your career goals?",
        ],
      };
      setSessionData(demoSession);
      setStage("intro");
      return;
    }

    fetch(`/api/ai-interview/${token}`)
      .then((r) => r.json())
      .then((d: { error?: string } & SessionData) => {
        if (d.error) {
          setError(d.error);
          setStage("error");
          return;
        }
        if (d.status === "completed") {
          setError("This interview session has already been completed.");
          setStage("error");
          return;
        }
        setSessionData(d);
        setStage("intro");
      })
      .catch(() => {
        setError("Failed to load interview session.");
        setStage("error");
      });
  }, [token]);

  // ── Elapsed timer ─────────────────────────────────────────

  useEffect(() => {
    if (
      stage === "ai_speaking" ||
      stage === "candidate_thinking" ||
      stage === "candidate_speaking" ||
      stage === "processing"
    ) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage]);

  // ── Camera setup ──────────────────────────────────────────

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      toast.error("Camera and microphone access is required for this interview.");
      throw new Error("Camera permission denied");
    }
  }, []);

  // ── Speech recognition ────────────────────────────────────

  const initRecognition = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = typeof window !== "undefined" ? (window as any) : null;
    const SR = w ? (w.SpeechRecognition ?? w.webkitSpeechRecognition) : null;

    if (!SR) {
      setSpeechSupported(false);
      return null;
    }

    const rec = new SR() as SpeechRecognitionInstance;
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    return rec;
  }, []);

  const startSpeechRecognition = useCallback(() => {
    const rec = initRecognition();
    if (!rec) return;

    setLiveTranscript("");
    setFinalTranscript("");

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) {
        setFinalTranscript((prev) => {
          const next = prev + final;
          finalTranscriptRef.current = next;
          return next;
        });
      }
      liveTranscriptRef.current = interim;
      setLiveTranscript(interim);
    };

    rec.onerror = () => {
      // Silently continue — user may still type
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {
      // Recognition already started in some browsers
    }
  }, [initRecognition]);

  const stopSpeechRecognition = useCallback((): string => {
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    // Read from refs for a synchronous, reliable capture
    const captured = (finalTranscriptRef.current + " " + liveTranscriptRef.current).trim();
    // Clear state
    setFinalTranscript("");
    setLiveTranscript("");
    finalTranscriptRef.current = "";
    liveTranscriptRef.current = "";
    return captured;
  }, []);

  // ── AI message flow ───────────────────────────────────────

  const speakAndAdvance = useCallback(
    (message: string, onDone: () => void) => {
      setCurrentAIMessage(message);
      setStage("ai_speaking");
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        speakText(message, onDone);
      } else {
        // If TTS not available, pause briefly then advance
        setTimeout(onDone, 3000);
      }
    },
    []
  );

  const startCountdownThenRecord = useCallback(() => {
    setStage("candidate_thinking");
    setCountdown(3);

    let count = 3;
    countdownRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        setStage("candidate_speaking");
        startSpeechRecognition();
      }
    }, 1000);
  }, [startSpeechRecognition]);

  const sendAnswerToAI = useCallback(
    async (answerText: string) => {
      if (!sessionData) return;
      setStage("processing");

      // Append candidate answer to transcript
      const newEntry: TranscriptEntry = {
        role: "user",
        content: answerText || "(no answer provided)",
        questionIndex,
      };
      const updatedTranscript = [...conversationHistoryRef.current, newEntry];
      setTranscript(updatedTranscript);

      try {
        const endpoint = sessionData.isDemo
          ? null
          : `/api/ai-interview/${token}/message`;

        let nextMessage: string;
        let isLastQuestion: boolean;

        if (sessionData.isDemo && sessionData.demoQuestions) {
          // Demo mode: use hardcoded questions, no API call for questions
          const nextIndex = questionIndex + 1;
          isLastQuestion = nextIndex >= sessionData.totalQuestions;
          if (isLastQuestion) {
            nextMessage =
              "Thank you so much for your answers! That concludes our practice interview. You did great — let's take a look at how you performed.";
          } else {
            nextMessage = sessionData.demoQuestions[nextIndex];
          }
          // Small delay to simulate thinking
          await new Promise((resolve) => setTimeout(resolve, 800));
        } else {
          const res = await fetch(endpoint!, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: sessionData.id,
              transcript: answerText || "(no answer provided)",
              questionIndex,
              totalQuestions: sessionData.totalQuestions,
              conversationHistory: updatedTranscript.map((e) => ({
                role: e.role,
                content: e.content,
              })),
            }),
          });

          if (!res.ok) {
            throw new Error("Failed to get next question from AI");
          }

          const data = (await res.json()) as {
            nextMessage: string;
            isLastQuestion: boolean;
            questionIndex: number;
          };
          nextMessage = data.nextMessage;
          isLastQuestion = data.isLastQuestion;
        }

        // Add AI message to transcript
        const aiEntry: TranscriptEntry = {
          role: "assistant",
          content: nextMessage,
          questionIndex: questionIndex + 1,
        };
        const fullTranscript = [...updatedTranscript, aiEntry];
        setTranscript(fullTranscript);

        const nextQIndex = questionIndex + 1;
        setQuestionIndex(nextQIndex);

        if (isLastQuestion) {
          // Speak closing, then complete
          speakAndAdvance(nextMessage, async () => {
            await completeInterview(fullTranscript);
          });
        } else {
          // Speak next question, then start recording
          speakAndAdvance(nextMessage, startCountdownThenRecord);
        }
      } catch {
        toast.error("Connection error. Please try again.");
        setStage("candidate_speaking");
        startSpeechRecognition();
      }
    },
    [sessionData, questionIndex, token, speakAndAdvance, startCountdownThenRecord, startSpeechRecognition]
  );

  const completeInterview = useCallback(
    async (fullTranscript: TranscriptEntry[]) => {
      setStage("processing");

      try {
        let evalResult: AIEvaluation;

        if (sessionData?.isDemo) {
          // Demo: call complete API with session ID "demo" (no DB persist)
          // or do client-side evaluation via API
          const res = await fetch(`/api/ai-interview/demo/complete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: "demo",
              transcript: fullTranscript,
              startedAt: startedAt.toISOString(),
            }),
          });

          if (res.ok) {
            const data = (await res.json()) as { evaluation: AIEvaluation };
            evalResult = data.evaluation;
          } else {
            evalResult = {
              overallScore: 3,
              summary: "Practice interview completed successfully.",
              strengths: ["Good communication", "Clear responses"],
              improvements: ["Provide more specific examples"],
              recommendation: "advance",
            };
          }
        } else {
          const res = await fetch(`/api/ai-interview/${token}/complete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: sessionData?.id,
              transcript: fullTranscript,
              startedAt: startedAt.toISOString(),
            }),
          });

          if (!res.ok) {
            throw new Error("Failed to complete interview");
          }

          const data = (await res.json()) as { evaluation: AIEvaluation };
          evalResult = data.evaluation;
        }

        // Stop camera
        streamRef.current?.getTracks().forEach((t) => t.stop());

        // Store in sessionStorage for demo results page
        if (sessionData?.isDemo) {
          sessionStorage.setItem(
            "demoEvaluation",
            JSON.stringify({ evaluation: evalResult, transcript: fullTranscript })
          );
        }

        setEvaluation(evalResult);
        setStage("completed");
      } catch {
        toast.error("Failed to save interview results. Please try again.");
        setStage("candidate_speaking");
      }
    },
    [sessionData, token, startedAt]
  );

  // ── User actions ──────────────────────────────────────────

  const handleStartInterview = useCallback(async () => {
    setStage("camera_check");
    try {
      await startCamera();
    } catch {
      setStage("intro");
      return;
    }

    // First question
    if (!sessionData) return;

    const firstQuestion = sessionData.isDemo
      ? sessionData.demoQuestions?.[0] ??
        "Tell me about yourself and your background."
      : null;

    let openingMessage: string;

    if (sessionData.isDemo) {
      openingMessage =
        "Welcome! I'm your AI interviewer today. " + (firstQuestion ?? "");
      // Add AI message to transcript
      const aiEntry: TranscriptEntry = {
        role: "assistant",
        content: openingMessage,
        questionIndex: 0,
      };
      setTranscript([aiEntry]);
      setCurrentAIMessage(openingMessage);
      speakAndAdvance(openingMessage, startCountdownThenRecord);
    } else {
      openingMessage =
        "Welcome to your interview! I'm your AI interviewer. Let's get started. Tell me about yourself and your professional background.";
      const aiEntry: TranscriptEntry = {
        role: "assistant",
        content: openingMessage,
        questionIndex: 0,
      };
      setTranscript([aiEntry]);
      speakAndAdvance(openingMessage, startCountdownThenRecord);
    }
  }, [sessionData, startCamera, speakAndAdvance, startCountdownThenRecord]);

  const handleDoneAnswering = useCallback(() => {
    // stopSpeechRecognition reads from refs — synchronously reliable
    let captured = stopSpeechRecognition();
    window.speechSynthesis?.cancel();

    if (!captured && !speechSupported) {
      // No speech and no typed text
      captured = "(no answer provided)";
    }

    sendAnswerToAI(captured);
  }, [stopSpeechRecognition, speechSupported, sendAnswerToAI]);

  const handleTextInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      finalTranscriptRef.current = e.target.value;
      setFinalTranscript(e.target.value);
    },
    []
  );

  // ── Format helpers ─────────────────────────────────────────

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const totalQ = sessionData?.totalQuestions ?? 4;
  const progress = Math.min((questionIndex / totalQ) * 100, 100);

  // ──────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────

  if (stage === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading your interview...</p>
        </div>
      </div>
    );
  }

  if (stage === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <Card className="max-w-md w-full bg-slate-800 border-slate-700 text-center p-8">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            Interview Not Available
          </h2>
          <p className="text-slate-400">{error}</p>
        </Card>
      </div>
    );
  }

  if (stage === "completed" && evaluation) {
    const scoreColor =
      evaluation.overallScore >= 4
        ? "text-emerald-400"
        : evaluation.overallScore >= 3
        ? "text-amber-400"
        : "text-red-400";

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="max-w-2xl w-full space-y-4">
          <div className="text-center mb-6">
            <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto mb-3" />
            <h2 className="text-3xl font-bold text-white">
              Interview Complete
            </h2>
            <p className="text-slate-400 mt-1">
              Duration: {formatTime(elapsedSeconds)}
            </p>
          </div>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  AI Evaluation
                </h3>
                <span className={`text-3xl font-bold ${scoreColor}`}>
                  {evaluation.overallScore}/5
                </span>
              </div>
              <p className="text-slate-300 text-sm mb-4">{evaluation.summary}</p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                    Strengths
                  </p>
                  <ul className="space-y-1">
                    {evaluation.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-emerald-400 mt-0.5">+</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
                    Areas to Improve
                  </p>
                  <ul className="space-y-1">
                    {evaluation.improvements.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-amber-400 mt-0.5">-</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700">
                <span className="text-xs text-slate-500 uppercase tracking-wider">
                  Recommendation:{" "}
                </span>
                <span
                  className={`text-sm font-semibold capitalize ${
                    evaluation.recommendation === "advance"
                      ? "text-emerald-400"
                      : evaluation.recommendation === "hold"
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}
                >
                  {evaluation.recommendation}
                </span>
              </div>
            </CardContent>
          </Card>

          {sessionData?.isDemo && (
            <div className="text-center pt-2">
              <p className="text-slate-400 text-sm mb-3">
                Want to see how candidates compare on your team?
              </p>
              <a
                href="/register"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
              >
                Sign up free — no credit card required
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (stage === "intro") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center space-y-6">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Volume2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {sessionData?.isDemo ? "AI Practice Interview" : "AI Video Interview"}
              </h1>
              <p className="text-slate-400 mt-2 text-sm leading-relaxed">
                {sessionData?.isDemo
                  ? "No signup required. Experience a real AI interview in your browser."
                  : "Your AI interviewer will speak questions aloud. Answer verbally and the AI will listen."}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              {[
                { icon: "mic", label: "Speak your answers" },
                { icon: "headphones", label: "AI asks questions" },
                { icon: "bar", label: `${totalQ} questions` },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg bg-slate-700 p-3 text-xs text-slate-300"
                >
                  {item.label}
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-indigo-900/40 border border-indigo-700/50 p-4 text-sm text-indigo-300 text-left">
              <p className="font-semibold mb-1">Before you start:</p>
              <ul className="space-y-1 text-xs">
                <li>- Allow camera and microphone access when prompted</li>
                <li>- Speak clearly into your microphone</li>
                <li>- Find a quiet environment</li>
                <li>- Use Chrome or Edge for best speech recognition</li>
              </ul>
            </div>

            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-500 border-0 text-white font-semibold h-11"
              onClick={handleStartInterview}
            >
              <Video className="h-4 w-4 mr-2" />
              Start Interview
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stage === "camera_check") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Setting up camera and microphone...</p>
        </div>
      </div>
    );
  }

  // ── Main interview stages ────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <div>
            <p className="text-white font-medium text-sm">
              {sessionData?.isDemo ? "AI Practice Interview" : "AI Interview"}
            </p>
            <p className="text-slate-400 text-xs">
              Question {Math.min(questionIndex + 1, totalQ)} of {totalQ}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {stage === "candidate_speaking" && (
            <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              REC
            </span>
          )}
          <span className="text-xs text-slate-400 font-mono">
            {formatTime(elapsedSeconds)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-700">
        <div
          className="h-full bg-indigo-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left: camera preview */}
        <div className="lg:w-1/2 bg-black flex items-center justify-center relative min-h-48 lg:min-h-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {!streamRef.current && (
            <div className="absolute inset-0 flex items-center justify-center">
              <VideoOff className="h-12 w-12 text-slate-600" />
            </div>
          )}
          {/* Small overlay label */}
          <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
            You
          </div>
        </div>

        {/* Right: AI interviewer + controls */}
        <div className="lg:w-1/2 flex flex-col bg-slate-800 p-4 sm:p-6 gap-4">
          {/* AI section */}
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-4">
            {/* AI avatar circle */}
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-2xl font-bold text-white">AI</span>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              AI Interviewer
            </p>

            {/* Waveform */}
            <AIWaveform active={stage === "ai_speaking"} />

            {/* Current AI message */}
            {currentAIMessage && (
              <div className="max-w-sm">
                <p className="text-white text-sm leading-relaxed">
                  {currentAIMessage}
                </p>
              </div>
            )}

            {/* Stage-specific UI */}
            {stage === "candidate_thinking" && (
              <div className="mt-4">
                <div className="h-16 w-16 rounded-full border-4 border-indigo-500 flex items-center justify-center mx-auto">
                  <span className="text-3xl font-bold text-indigo-400">
                    {countdown}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mt-2">
                  Get ready to answer...
                </p>
              </div>
            )}

            {stage === "processing" && (
              <div className="flex items-center gap-2 mt-2">
                <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-slate-400">AI is thinking...</span>
              </div>
            )}
          </div>

          {/* Transcript / input area */}
          <div className="space-y-3">
            {/* Live transcript display */}
            {(stage === "candidate_speaking" || stage === "processing") && (
              <div className="bg-slate-700 rounded-lg p-3 min-h-20 max-h-32 overflow-y-auto">
                <p className="text-xs text-slate-400 mb-1">Your answer:</p>
                {speechSupported ? (
                  <p className="text-sm text-white">
                    {finalTranscript}
                    {liveTranscript && (
                      <span className="text-slate-400 italic"> {liveTranscript}</span>
                    )}
                    {!finalTranscript && !liveTranscript && (
                      <span className="text-slate-500 italic">
                        Listening... speak now
                      </span>
                    )}
                  </p>
                ) : (
                  <textarea
                    className="w-full bg-transparent text-sm text-white resize-none outline-none placeholder:text-slate-500"
                    placeholder="Speech recognition not available. Type your answer here..."
                    rows={3}
                    value={finalTranscript}
                    onChange={handleTextInput}
                  />
                )}
              </div>
            )}

            {/* Control buttons */}
            <div className="flex gap-2">
              {stage === "candidate_speaking" && (
                <>
                  {!speechSupported && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded flex-1">
                      <MicOff className="h-3 w-3" />
                      Type your answer above
                    </div>
                  )}
                  {speechSupported && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded flex-1">
                      <Mic className="h-3 w-3" />
                      Listening...
                    </div>
                  )}
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-500 border-0 text-white text-sm"
                    onClick={handleDoneAnswering}
                  >
                    Done Answering
                  </Button>
                </>
              )}

              {stage === "ai_speaking" && (
                <div className="flex items-center gap-2 w-full">
                  <Volume2 className="h-4 w-4 text-indigo-400 shrink-0" />
                  <p className="text-xs text-slate-400">
                    AI is speaking — listen carefully...
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-slate-400 hover:text-white text-xs"
                    onClick={startCountdownThenRecord}
                  >
                    Skip
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
