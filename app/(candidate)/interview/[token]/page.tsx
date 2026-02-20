"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Video, VideoOff, Mic, MicOff, ChevronRight, CheckCircle2, 
  Clock, AlertCircle, RefreshCw, Send
} from "lucide-react";
import { toast } from "sonner";

type Question = { id: string; content: string; type: string };
type InterviewData = {
  inviteId: string;
  email: string;
  interviewTitle: string;
  instructions: string | null;
  timeLimitSeconds: number;
  retakesAllowed: number;
  deadlineAt: string | null;
  questions: Question[];
  completedQuestions: string[];
};

type Stage = "loading" | "error" | "intro" | "question" | "review" | "done";

export default function CandidateInterviewPage() {
  const { token } = useParams<{ token: string }>();
  const [stage, setStage] = useState<Stage>("loading");
  const [data, setData] = useState<InterviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [retakesLeft, setRetakesLeft] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load interview data
  useEffect(() => {
    fetch(`/api/invite/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); setStage("error"); return; }
        setData(d);
        setCompleted(new Set(d.completedQuestions));
        setRetakesLeft(d.retakesAllowed);
        setTimeLeft(d.timeLimitSeconds);
        setStage("intro");
      })
      .catch(() => { setError("Failed to load interview"); setStage("error"); });
  }, [token]);

  // Tab-switch proctoring
  useEffect(() => {
    if (stage !== "question") return;
    const handler = () => {
      if (document.hidden) {
        setTabSwitchCount((c) => c + 1);
        logProctorEvent("tab_switch");
        toast.warning("Tab switching detected and logged.");
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [stage]);

  const logProctorEvent = useCallback(async (eventType: string) => {
    if (!data) return;
    await fetch("/api/proctor-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteId: data.inviteId, eventType }),
    });
  }, [data]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      toast.error("Camera/mic access required. Please allow permissions.");
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current || !data) return;
    chunksRef.current = [];
    const mr = new MediaRecorder(streamRef.current, { mimeType: "video/webm" });
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.start(1000);
    mediaRecorderRef.current = mr;
    setIsRecording(true);
    setTimeLeft(data.timeLimitSeconds);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { stopRecording(); return 0; }
        return t - 1;
      });
    }, 1000);
  }, [data]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setStage("review");
  }, []);

  const submitResponse = useCallback(async () => {
    if (!data) return;
    const blob = new Blob(chunksRef.current, { type: "video/webm" });
    const question = data.questions[currentIndex];
    const formData = new FormData();
    formData.append("video", blob, `response-${question.id}.webm`);
    formData.append("inviteId", data.inviteId);
    formData.append("questionId", question.id);

    toast.loading("Uploading your response...");
    try {
      const res = await fetch("/api/invite/submit-response", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      toast.success("Response saved!");
      setCompleted((c) => new Set([...c, question.id]));
      setRetakesLeft(data.retakesAllowed);

      const next = currentIndex + 1;
      if (next >= data.questions.length) {
        await fetch(`/api/invite/${token}/complete`, { method: "POST" });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        setStage("done");
      } else {
        setCurrentIndex(next);
        setStage("question");
      }
    } catch {
      toast.error("Upload failed. Please try again.");
    }
  }, [data, currentIndex, token]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (stage === "loading") return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center"><div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-sm text-muted-foreground">Loading your interview...</p></div>
    </div>
  );

  if (stage === "error") return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="max-w-md w-full text-center p-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Interview Not Available</h2>
        <p className="text-muted-foreground">{error}</p>
      </Card>
    </div>
  );

  if (stage === "done") return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="max-w-md w-full text-center p-8">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">All Done!</h2>
        <p className="text-muted-foreground mb-4">Your responses have been submitted. The hiring team will review them and be in touch.</p>
        <p className="text-sm font-medium text-indigo-600">Thank you, {data?.email}</p>
      </Card>
    </div>
  );

  if (stage === "intro" && data) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-xl">A</div>
          <CardTitle className="text-2xl">{data.interviewTitle}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">{data.questions.length} questions · {Math.round((data.timeLimitSeconds * data.questions.length) / 60)} min estimated</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.instructions && <div className="rounded-lg bg-indigo-50 p-4 text-sm text-indigo-800">{data.instructions}</div>}
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-lg border p-3"><Clock className="h-5 w-5 mx-auto mb-1 text-indigo-600" /><p className="font-medium">{formatTime(data.timeLimitSeconds)}</p><p className="text-xs text-muted-foreground">per question</p></div>
            <div className="rounded-lg border p-3"><RefreshCw className="h-5 w-5 mx-auto mb-1 text-indigo-600" /><p className="font-medium">{data.retakesAllowed}</p><p className="text-xs text-muted-foreground">retakes</p></div>
            <div className="rounded-lg border p-3"><Video className="h-5 w-5 mx-auto mb-1 text-indigo-600" /><p className="font-medium">Video</p><p className="text-xs text-muted-foreground">required</p></div>
          </div>
          <p className="text-xs text-muted-foreground text-center">This interview is proctored. Tab switching and unusual behavior will be logged.</p>
          <Button className="w-full btn-brand-gradient border-0" onClick={async () => { await startCamera(); setStage("question"); }}>
            <Video className="h-4 w-4 mr-2" /> Start Interview
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  if ((stage === "question" || stage === "review") && data) {
    const q = data.questions[currentIndex];
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">A</div>
            <div>
              <p className="text-white font-medium text-sm">{data.interviewTitle}</p>
              <p className="text-slate-400 text-xs">Question {currentIndex + 1} of {data.questions.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {tabSwitchCount > 0 && <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded">{tabSwitchCount} tab switch{tabSwitchCount !== 1 ? "es" : ""} logged</span>}
            {isRecording && <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded"><span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />REC {formatTime(timeLeft)}</span>}
          </div>
        </div>

        {/* Progress */}
        <div className="h-1 bg-slate-700">
          <div className="h-full bg-indigo-500 transition-all" style={{ width: `${((currentIndex) / data.questions.length) * 100}%` }} />
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-0">
          {/* Camera preview */}
          <div className="lg:w-1/2 bg-black flex items-center justify-center relative min-h-64">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            {!streamRef.current && <div className="absolute inset-0 flex items-center justify-center"><VideoOff className="h-12 w-12 text-slate-600" /></div>}
          </div>

          {/* Question + controls */}
          <div className="lg:w-1/2 flex flex-col bg-slate-800 p-6 gap-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">{q.type} Question</span>
              <p className="mt-3 text-white text-lg leading-relaxed">{q.content}</p>
            </div>

            <div className="mt-auto space-y-3">
              {stage === "question" && !isRecording && (
                <Button className="w-full bg-red-600 hover:bg-red-700 border-0 text-white" onClick={startRecording}>
                  <Mic className="h-4 w-4 mr-2" /> Start Recording
                </Button>
              )}
              {stage === "question" && isRecording && (
                <Button className="w-full bg-slate-700 hover:bg-slate-600 border-0 text-white" onClick={stopRecording}>
                  <MicOff className="h-4 w-4 mr-2" /> Stop Recording
                </Button>
              )}
              {stage === "review" && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-400 text-center">Review your answer before submitting.</p>
                  <div className="flex gap-2">
                    {retakesLeft > 0 && (
                      <Button variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => { setRetakesLeft((r) => r - 1); setStage("question"); }}>
                        <RefreshCw className="h-4 w-4 mr-2" /> Retake ({retakesLeft} left)
                      </Button>
                    )}
                    <Button className="flex-1 btn-brand-gradient border-0" onClick={submitResponse}>
                      <Send className="h-4 w-4 mr-2" /> {currentIndex + 1 === data.questions.length ? "Submit All" : "Next Question"}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
