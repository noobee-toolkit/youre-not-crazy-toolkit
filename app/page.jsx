"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Download,
  RefreshCcw,
  Mic,
  Lock,
  Smile,
  Bell,
  AlertTriangle,
} from "lucide-react";
import jsPDF from "jspdf";

const affirmationGroups = {
  general: [
    "You're not overreacting. Your feelings are real.",
    "Confusion is often the first clue that something isn't right.",
    "You deserve clarity, not chaos.",
    "It’s okay to ask for help. You are not a burden.",
    "The fact that you're questioning things shows strength, not weakness.",
    "You are allowed to change your mind. You are allowed to pause.",
    "You're not too much. You're not too sensitive. You're enough.",
    "Shutting down is a nervous system response. It's not your fault.",
    "Sometimes it’s not poor communication. Sometimes it’s manipulation.",
    "Not everyone deserves access to your vulnerability. Protect it.",
  ],
  boundaries: [
    "You don’t owe everyone an explanation.",
    "Holding a boundary doesn’t make you mean or selfish.",
    "No is a complete sentence.",
  ],
  clarity: [
    "If you have to decode the message, it wasn’t clear.",
    "Mixed signals are still a message: lack of clarity is clarity.",
    "You’re not wrong for wanting directness.",
  ],
  gaslighting: [
    "Repeated invalidation is emotional abuse.",
    "You’re not too sensitive — they’re too dismissive.",
    "If they say ‘you always make it about you’ when you share hurt — that’s projection.",
  ],
};

const reframeWords = {
  crazy: "You’re not crazy — you’re responding to a lot.",
  "too sensitive":
    "You’re not too sensitive — your sensitivity is your strength.",
  sorry: "You don’t need to apologise for existing.",
};

const journalingPrompts = [
  "When did I first feel uncertain about this situation?",
  "What did I need that I didn’t get?",
  "Did I feel dismissed or heard?",
  "Where in my body do I feel this stress?",
  "What would I say to a friend going through the same thing?",
];

const moodOptions = ["😔", "😕", "😐", "🙂", "😄"];

function reframeInput(text) {
  let reframed = [];
  Object.keys(reframeWords).forEach((word) => {
    if (text.toLowerCase().includes(word)) {
      reframed.push(reframeWords[word]);
    }
  });
  return reframed.join(" \n");
}

function generateInsight(text) {
  const wordCount = text.trim().split(/\s+/).length;
  let insight = "";
  if (wordCount > 50) {
    insight += "🧠 You’ve expressed a lot — you’re clearly thinking deeply. \n";
  }
  if (
    text.toLowerCase().includes("confused") ||
    text.toLowerCase().includes("unclear")
  ) {
    insight +=
      "🔍 There’s a theme of seeking clarity. That’s valid and important. \n";
  }
  if (
    text.toLowerCase().includes("manipulate") ||
    text.toLowerCase().includes("gaslight")
  ) {
    insight +=
      "🚨 You’re noticing possible patterns of emotional control. Trust yourself. \n";
  }
  return insight.trim();
}

function downloadPDF(content) {
  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text(content, 10, 10);
  doc.save("validation-journal.pdf");
}

export default function Home() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState(null);
  const [notes, setNotes] = useState("");
  const [showIntro, setShowIntro] = useState(false);
  const [category, setCategory] = useState("general");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [passphrase, setPassphrase] = useState("");
  const [mood, setMood] = useState("");

  useEffect(() => {
    const savedNotes = localStorage.getItem("ync-notes");
    const savedHistory = localStorage.getItem("ync-history");
    if (savedNotes) setNotes(savedNotes);
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem("ync-notes", notes);
    localStorage.setItem("ync-history", JSON.stringify(history));
  }, [notes, history]);

  const handleClick = () => {
    const affirmations = affirmationGroups[category];
    const affirmation =
      affirmations[Math.floor(Math.random() * affirmations.length)];
    const reframedText = reframeInput(input);
    const prompt =
      journalingPrompts[Math.floor(Math.random() * journalingPrompts.length)];
    const insight = generateInsight(input);
    const timestamp = new Date().toLocaleString();
    const newNote = `\n[${timestamp}]\nMood: ${
      mood || "Not set"
    }\nYou said: ${input}\nResponse: ${affirmation}\n${
      reframedText ? "Reframe: " + reframedText : ""
    }\n${insight ? "Insight: " + insight : ""}\nPrompt: ${prompt}\n`;

    setResponse(
      `${affirmation}${reframedText ? "\n\n" + reframedText : ""}${
        insight ? "\n\n" + insight : ""
      }\n\nReflect: ${prompt}`
    );

    setNotes((prev) => prev + newNote);
    setHistory((prev) => [...prev, newNote]);
    setInput("");
    setMood("");
  };

  const handleReset = () => {
    setInput("");
    setResponse(null);
  };

  const handlePassphraseSubmit = () => {
    if (passphrase.trim() !== "") setIsLocked(false);
  };

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-6">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Lock className="w-5 h-5" /> Enter Passphrase
            </h1>
            <Input
              type="password"
              placeholder="Enter to unlock your toolkit"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
            />
            <Button
              onClick={handlePassphraseSubmit}
              disabled={!passphrase.trim()}
            >
              Unlock
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-6">
      <Card className="w-full max-w-xl">
        <CardContent className="space-y-4">
          <h1 className="text-2xl font-bold">You're Not Crazy Toolkit 🧠</h1>
          <div className="text-sm text-muted-foreground">
            <button
              onClick={() => setShowIntro(!showIntro)}
              className="underline text-blue-500"
            >
              {showIntro ? "Hide Intro" : "Why this exists"}
            </button>
            {showIntro && (
              <p className="mt-2">
                This tool was made for those moments where the world feels like
                it’s spinning and you’re left wondering if it’s just you. It’s
                not. Sometimes you just need something that tells you: you’re
                valid. You’re not imagining it. You’re not crazy. You deserve
                peace, and this is a start.
              </p>
            )}
          </div>
          <p className="text-muted-foreground">
            Type what you're feeling or questioning. This space is here to
            validate, not judge.
          </p>
          <Textarea
            placeholder="Write it all here — confusion, doubt, burnout, fear, anything."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="flex gap-2 items-center flex-wrap">
            <select
              className="border rounded-md p-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="general">General</option>
              <option value="boundaries">Boundaries</option>
              <option value="clarity">Clarity</option>
              <option value="gaslighting">Gaslighting</option>
            </select>
            <select
              className="border rounded-md p-2 text-sm"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
            >
              <option value="">Mood</option>
              {moodOptions.map((m, i) => (
                <option key={i} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <Button onClick={handleClick} disabled={!input}>
              Validate me
            </Button>
            <Button onClick={handleReset} variant="outline">
              <RefreshCcw className="w-4 h-4 mr-1" /> Reset
            </Button>
            <Button
              onClick={() => downloadPDF(notes)}
              variant="outline"
              disabled={!notes}
            >
              <Download className="w-4 h-4 mr-1" /> Export PDF
            </Button>
            <Button
              onClick={() => setShowHistory(!showHistory)}
              variant="outline"
              disabled={history.length === 0}
            >
              {showHistory ? "Hide History" : "Show History"}
            </Button>
          </div>
          {response && (
            <div className="bg-green-100 text-green-800 p-4 rounded-xl shadow-inner whitespace-pre-line">
              <strong>You're not alone:</strong> {"\n"}
              {response}
            </div>
          )}
          {showHistory && (
            <div className="mt-4 max-h-60 overflow-y-auto text-sm bg-gray-50 p-4 rounded-md border">
              <h2 className="font-semibold mb-2">Your Reflection History</h2>
              {history.map((entry, index) => (
                <div
                  key={index}
                  className="mb-2 whitespace-pre-wrap border-b pb-2"
                >
                  {entry}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
