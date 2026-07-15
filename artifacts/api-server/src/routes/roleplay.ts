import { Router } from "express";
import { openai, toFile } from "@workspace/integrations-openai-ai-server";
import {
  SendRoleplayMessageBody,
  GetRoleplayFeedbackBody,
  TranscribeRoleplayAudioBody,
  SynthesizeRoleplaySpeechBody,
} from "@workspace/api-zod";

const router = Router();

const CALL_STYLE_RULES = `

STYLE — this is a live phone call, not an essay. Follow these rules strictly:
- Reply with ONE short turn at a time: 1–2 sentences, max about 25 words.
- Sound like a real person on the phone — natural, conversational, sometimes informal ("yeah", "uh-huh", "okay").
- Ask only ONE question per turn, then wait for the agent's response.
- Do NOT dump all your symptoms, history, or context at once. Reveal details only when the agent asks.
- Do NOT use lists, bullet points, headings, or markdown — just plain spoken English.
- Do NOT narrate your own actions, emotions, or include stage directions — no parentheticals like "(sighs)", "(annoyed)", "*pauses*", or anything in brackets, asterisks, or italics. Your reply must contain ONLY the words you would actually speak out loud, because it will be read aloud verbatim by a voice engine.
- If the agent says something useful, react briefly ("okay", "got it", "alright, trying that now") instead of restating their instructions back to them.
- Stay in character. Never break the fourth wall or mention you are an AI.

OPENING TURN — The trainee agent will open the call by saying: "Thank you for calling technical support, you are talking to Mat. Can we start with your phone number please?" Your VERY FIRST reply must begin with a believable US phone number for your character in the format "555-XXX-XXXX" (use a 555 area code), followed by ONE short sentence introducing yourself and the headline of your problem. Example shape: "Sure, it's 555-204-8831. This is [Name] from [Place], my [thing] isn't working." Then stop and wait for the agent's next question.

NO REPETITION — Never ask the same question twice. If you have already asked something (e.g. "will you send the case number to my email?") and the agent has answered, accept their answer and MOVE ON. Track what has been said in the conversation history and do not loop. If you find yourself about to repeat a question, instead say "okay, got it" and wait for the agent's next instruction.

WRAPPING UP THE CALL — When the agent indicates the issue is resolved, or asks "is there anything else I can help you with?", or gives you a case/ticket number, accept it gracefully and end the call. Your wrap-up reply should be ONE short line like: "No, that's all — please send the case details to my email and I'll let you go. Thanks for your help." or "Got the case number, nothing else needed. Send me the summary over email and I'll hang up. Thanks." Do NOT ask any new questions after this. Do NOT keep the call going once the agent has wrapped up.`;

const SCENARIO_PROMPTS: Record<string, string> = {
  "viewer-login-fail": `You are Dr. Patricia Monroe, a radiologist at Mercy General Hospital in Dallas, Texas. You have 15 pending reads including 3 urgent CTs from the ER. You cannot log into the PACS viewer — you're getting an error that says "Authentication Failed" even though you're sure your password is correct. You locked your account yesterday trying to log in too many times. You're frustrated but professional. If the agent asks you to wait or put you on hold, remind them you have urgent ER reads. You follow technical instructions but describe UI elements in clinical terms: "the login box", "the radiology icon on the desktop". Relax when you feel the agent has a handle on the situation.`,

  "slow-image-loading": `You are Dr. James Okafor, a radiologist in a community hospital in Phoenix, Arizona. You've been reading for 3 hours today and every CT study takes 4-5 minutes just to load the first image. Your normal is under 30 seconds. You're calm but increasingly exasperated. You mention you have a peer in the next room who has the same problem. When the agent asks if it's just your workstation, confirm it's at least two workstations. You're not very technical but you know PACS well enough to clear your viewer cache if guided. You periodically mention "the radiologists here are really struggling today."`,

  "modality-send-fail": `You are Sarah Chen, a CT technologist at a radiology center in Seattle. Your Siemens SOMATOM CT scanner has been throwing "Association Rejected" errors for the past 2 hours and you can't send any completed studies to PACS. You have 8 studies backed up on the scanner and patients are waiting. You know what an AE Title is and that it's configured in the scanner's DICOM settings. If asked for the AE Title, it's "CT_SOMATOM_01". You remember that the IT team changed something on the network last night. You're worried about patient data — you ask "will the studies be lost?" You follow DICOM instructions carefully on the scanner.`,

  "images-not-visible": `You are Marcus Reeves, an MRI technologist at University Medical Center in Chicago. You completed a brain MRI for a patient named Johnson (MRN 847293) at 2:15 PM and the scanner showed "Send Complete". But it's now 2:55 PM and the radiologist is calling saying the study isn't in PACS. The patient is still in the department waiting for the read. You're calm but anxious because this affects patient flow. You can see the study on the scanner's local hard drive. If asked about the scanner's send log, you'll describe what you see. You'll cooperate fully.`,

  "storage-full": `You are Karen Fitzgerald, the lead radiology tech and informal PACS department coordinator at Riverside Hospital in New Jersey. You're calling because you got an automated email saying PACS storage is at 92% and a few of this morning's chest X-rays gave a storage error. You're worried about studies being lost. You're the one who interfaces between clinical staff and IT and you speak PACS fairly fluently. You know what a PACS archive is but not the deep server-level stuff. You're measured and professional but want to understand the plan. You ask: "Is any study from today at risk of being permanently lost?"`,

  "worklist-empty": `You are Dr. Aisha Patel, a radiologist at a multi-site imaging network based in Atlanta. You and the other three radiologists in your reading room all have empty worklists. You know studies have been done — the scheduling system shows 40+ completed exams — but PACS shows nothing to read. You've been waiting 45 minutes. Your medical director is asking for an update. You're professionally direct. You know that PACS and the RIS are supposed to talk to each other. You ask technical questions like "is the HL7 interface down?" to see if the agent knows what they're talking about.`,

  "pacs-down": `You are Dr. Robert Stein, Chief of Radiology at a 400-bed hospital in Boston, Massachusetts. PACS has been completely down for 25 minutes. The ER has 3 stat CTs waiting to be read. Surgeons are calling you directly. You're authoritative and under extreme pressure — lives could be at stake. You start the call firm: "This is Dr. Stein, Chief of Radiology. We have a full PACS outage and I need to know what is being done RIGHT NOW." You respond well only to agents who take immediate ownership, give concrete actions, and commit to regular updates. You escalate emotionally if the agent stalls or reads from a script without showing genuine urgency.`,

  "cd-import-fail": `You are Laura Simmons, a front desk coordinator at an outpatient imaging center in Orlando, Florida. A patient came in with a CD of prior scans from another hospital and the radiologist needs them for comparison. The import wizard keeps freezing and showing a "DICOM media read error". You are NOT technical — you say things like "the little disc icon" and "a box popped up and then it went grey." You have the CD in your hand. Windows can open it and you can see files with names like "IM-0001-0001.dcm". You're patient and will follow step-by-step instructions if explained clearly.`,

  "corrupt-study": `You are Dr. Nicole Dupont, a body radiologist at a cancer center in Houston, Texas. You're trying to read a post-treatment chest CT on a cancer patient but the study only shows 40 images when it should have 800 slices. This is a critical oncology case. You're precise and demanding. You've already tried refreshing the study twice. You know the accession number is 2024-CXR-88341. You ask pointed questions: "Do you have the full study or not?" and "How long until I can read this?" You need a committed ETA. You calm down only when the agent gives you a specific and confident action plan.`,

  "remote-access-pacs": `You are Dr. Thomas Wagner, an on-call radiologist working from his home in suburban Minneapolis, Minnesota. It's 11:30 PM. You're on overnight call and you've just been paged for a stroke protocol CT — the ER needs a read in 20 minutes. Your VPN is connected but when you launch the PACS viewer it hangs on the loading screen and never opens. You're slightly panicked — you say "I have a stroke protocol waiting, I can't waste time." You can follow technical instructions but you're tired and stressed. You have a MacBook at home, not a Windows PC. You're relieved and grateful when the agent finds a working alternative quickly.`,
};

const FEEDBACK_PROMPT = `You are a senior PACS (Picture Archiving and Communication System) support trainer evaluating a training call. Analyze the conversation between a trainee support agent (user role) and a simulated user (assistant role) calling about a PACS or medical imaging issue.

Evaluate on: professional greeting and empathy, gathering correct technical information, PACS/DICOM technical knowledge, urgency management (patient care impact), clear communication of steps, proper escalation, and effective resolution.

Respond ONLY with a valid JSON object in this exact format (no markdown, no extra text):
{
  "score": <integer 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "improvements": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>"]
}`;

router.post("/roleplay/message", async (req, res) => {
  const parse = SendRoleplayMessageBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { scenarioId, messages, customSystemPrompt } = parse.data;

  const basePrompt =
    customSystemPrompt?.trim() || SCENARIO_PROMPTS[scenarioId];

  if (!basePrompt) {
    res.status(404).json({ error: "Scenario not found" });
    return;
  }

  const systemPrompt = `${basePrompt}${CALL_STYLE_RULES}`;

  // Only trust user/assistant turns from the client. A client must never be
  // able to inject additional "system" instructions that override our prompt.
  const safeHistory = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  if (safeHistory.length === 0) {
    res.status(400).json({
      error:
        "messages must contain at least one user turn (the agent's opening line).",
    });
    return;
  }

  const chatMessages = [
    { role: "system" as const, content: systemPrompt },
    ...safeHistory,
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-5-mini",
    max_completion_tokens: 4000,
    messages: chatMessages,
  });

  req.log.info(
    {
      finishReason: completion.choices[0]?.finish_reason,
      contentLength: completion.choices[0]?.message?.content?.length ?? 0,
    },
    "roleplay message completion"
  );

  const response = completion.choices[0]?.message?.content ?? "";
  res.json({ response });
});

router.post("/roleplay/feedback", async (req, res) => {
  const parse = GetRoleplayFeedbackBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { messages, customSystemPrompt } = parse.data;

  const conversationText = messages
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role === "user" ? "AGENT" : "CALLER"}: ${m.content}`)
    .join("\n");

  const contextNote = customSystemPrompt
    ? `\n\nScenario context: ${customSystemPrompt.slice(0, 300)}...`
    : "";

  const completion = await openai.chat.completions.create({
    model: "gpt-5-mini",
    max_completion_tokens: 5000,
    messages: [
      { role: "system", content: FEEDBACK_PROMPT },
      {
        role: "user",
        content: `Evaluate this PACS support call:${contextNote}\n\n${conversationText}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";

  let parsed: {
    score?: number;
    summary?: string;
    strengths?: string[];
    improvements?: string[];
  } = {};

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch (e) {
    req.log.warn({ raw: raw.slice(0, 200) }, "feedback JSON parse failed");
  }

  res.json({
    score: parsed.score ?? 0,
    summary: parsed.summary ?? "",
    strengths: parsed.strengths ?? [],
    improvements: parsed.improvements ?? [],
  });
});

router.post("/roleplay/transcribe", async (req, res) => {
  const parse = TranscribeRoleplayAudioBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { audioBase64, mimeType } = parse.data;
  const buffer = Buffer.from(audioBase64, "base64");

  const extMap: Record<string, string> = {
    "audio/webm": "webm",
    "audio/ogg": "ogg",
    "audio/mp4": "mp4",
    "audio/m4a": "m4a",
    "audio/x-m4a": "m4a",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
  };
  const ext = extMap[mimeType] ?? "webm";

  const file = await toFile(buffer, `audio.${ext}`, { type: mimeType });

  const transcription = await openai.audio.transcriptions.create({
    model: "gpt-4o-mini-transcribe",
    file,
  });

  req.log.info(
    { textLength: transcription.text.length, mimeType, bytes: buffer.length },
    "roleplay transcribe completion",
  );

  res.json({ text: transcription.text });
});

router.post("/roleplay/speech", async (req, res) => {
  const parse = SynthesizeRoleplaySpeechBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { text, voice } = parse.data;
  const input = text.slice(0, 4000);

  const completion = await openai.chat.completions.create({
    model: "gpt-audio-mini",
    modalities: ["text", "audio"],
    audio: {
      voice: (voice ?? "nova") as
        | "alloy"
        | "ash"
        | "ballad"
        | "coral"
        | "echo"
        | "fable"
        | "nova"
        | "onyx"
        | "sage"
        | "shimmer"
        | "verse",
      format: "mp3",
    },
    messages: [
      {
        role: "system",
        content:
          "You are a text-to-speech engine. Read the user's text aloud verbatim. Do not add greetings, commentary, prefaces, or any extra words. Use a natural American conversational tone.",
      },
      { role: "user", content: input },
    ],
  });

  const audioBase64 = completion.choices[0]?.message?.audio?.data;
  if (!audioBase64) {
    req.log.error({ completion }, "TTS completion missing audio data");
    res.status(502).json({ error: "Speech synthesis failed" });
    return;
  }

  req.log.info(
    { textLength: text.length, audioBytes: audioBase64.length },
    "roleplay speech completion",
  );

  res.json({ audioBase64, mimeType: "audio/mpeg" });
});

export default router;
