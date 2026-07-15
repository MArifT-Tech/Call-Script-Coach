export type Difficulty = "easy" | "medium" | "hard";

export interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  category: string;
  objective: string;
  estimatedMinutes: number;
  hints: string[];
  keyPhrases: string[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: "viewer-login-fail",
    title: "Cannot Log Into PACS Viewer",
    description:
      "A radiologist is unable to log into the PACS viewer workstation and has pending reads to complete.",
    difficulty: "easy",
    category: "Access & Login",
    objective:
      "Diagnose the login failure, restore access to the PACS viewer, and confirm the radiologist can pull and view studies.",
    estimatedMinutes: 6,
    hints: [
      "Greet professionally and verify the user's name, site, and workstation ID",
      "Ask for the exact error message shown on the login screen",
      "Check if the account is locked — verify with AD or PACS admin console",
      "Confirm network connectivity: can they ping the PACS server?",
      "If credentials are correct, check PACS service status on the server",
      "Confirm resolution: have them log in successfully before closing the ticket",
    ],
    keyPhrases: [
      "I understand this is urgent — let me get you into the system as quickly as possible",
      "Can you read me the exact error message on your screen?",
      "Let me check the status of your account in our system",
      "Are you able to access any other network resources right now?",
      "I'll stay on the line while you log in to confirm everything is working",
    ],
  },
  {
    id: "slow-image-loading",
    title: "Images Loading Very Slowly",
    description:
      "A radiologist reports that images are taking 3–5 minutes to load per study, making their workflow impossible.",
    difficulty: "easy",
    category: "Performance",
    objective:
      "Identify the performance bottleneck (network, server load, or workstation) and restore normal image loading speeds.",
    estimatedMinutes: 8,
    hints: [
      "Ask if the issue is specific to one workstation or department-wide",
      "Check bandwidth: run a speed test or ping the PACS server for latency",
      "Check PACS server CPU and RAM utilization via monitoring tools",
      "Verify if the issue is with a specific modality type (CT vs MRI vs CR)",
      "Clear the viewer cache on the workstation as a quick fix",
      "Check if a large batch job or backup is running that may be consuming resources",
    ],
    keyPhrases: [
      "I completely understand — slow loading can bring a radiology workflow to a halt",
      "Is this happening on just your workstation or are others affected too?",
      "Let me check the server load on our end right now",
      "Can you tell me what type of study is loading slowly — CT, MRI, X-ray?",
      "I'm going to run a quick network test to isolate where the delay is coming from",
    ],
  },
  {
    id: "modality-send-fail",
    title: "Modality Unable to Send Images to PACS",
    description:
      "A CT scanner is failing to push completed studies to PACS. The error shows 'Association Rejected' on the modality console.",
    difficulty: "medium",
    category: "Modality Connectivity",
    objective:
      "Diagnose the DICOM association failure, restore the PACS connection on the modality, and verify studies are sending successfully.",
    estimatedMinutes: 12,
    hints: [
      "Ask for the modality type, make/model, and IP address",
      "Confirm the exact error code — 'Association Rejected' usually means AE Title mismatch",
      "Verify the Called AE Title on the modality matches what PACS expects",
      "Check the PACS DICOM configuration: is the modality's IP and AE Title registered?",
      "Test DICOM connectivity using a C-ECHO (Verify) from the modality",
      "If recently changed, check if the modality's IP address has been updated in PACS",
    ],
    keyPhrases: [
      "Can you confirm the AE Title configured on the scanner right now?",
      "Let me check the DICOM settings in our PACS configuration for that modality",
      "Has anything changed recently — any network changes or modality software updates?",
      "I'd like you to run a DICOM Verify or C-ECHO from the scanner — what result do you get?",
      "I'm going to update the AE Title mapping on our end — please try sending a test study",
    ],
  },
  {
    id: "images-not-visible",
    title: "Images Not Visible After Acquisition",
    description:
      "An MRI technologist sent a completed study 30 minutes ago but the radiologist reports the study is not showing in the PACS worklist.",
    difficulty: "medium",
    category: "Modality Connectivity",
    objective:
      "Locate the missing study, identify why it did not arrive in PACS, and either recover it or initiate a resend.",
    estimatedMinutes: 10,
    hints: [
      "Get the patient name, MRN, study date/time, and accession number",
      "Check the PACS incoming DICOM queue for failed or pending transfers",
      "Look at the modality's send log — did it show successful transmission?",
      "Check if the study landed in a different PACS worklist or AE destination",
      "Verify there are no DICOM storage commitment errors",
      "If the study is stuck in queue, manually force-import from the modality or queue",
    ],
    keyPhrases: [
      "Let me pull up the DICOM activity log for that time period right now",
      "Can you give me the patient's MRN and the exact time the study was completed?",
      "I can see the transfer attempt in our log — let me check why it didn't commit",
      "It looks like the study went to the queue but got stuck — I can manually push it through",
      "I'll keep you on the line while I confirm the study appears in your worklist",
    ],
  },
  {
    id: "storage-full",
    title: "PACS Storage Capacity Warning",
    description:
      "An automated alert has triggered: PACS storage is at 92% capacity. New studies are starting to fail to archive.",
    difficulty: "medium",
    category: "Storage & Archive",
    objective:
      "Assess the storage situation, prevent study loss, implement immediate relief measures, and escalate for permanent resolution.",
    estimatedMinutes: 10,
    hints: [
      "Check current storage usage and identify which volumes are nearly full",
      "Identify studies that have already failed to archive — notify clinical staff if any",
      "Trigger migration of older studies to secondary/near-line storage immediately",
      "Suspend any non-critical batch jobs consuming storage temporarily",
      "Coordinate with storage team to expand capacity or add temporary disk",
      "Document all failed archives and ensure they are recovered",
    ],
    keyPhrases: [
      "I've received the storage alert — let me assess the situation immediately",
      "Are you currently seeing any studies failing to save?",
      "I'm initiating a migration of older studies to our near-line archive right now",
      "I need to escalate this to our infrastructure team for an emergency storage expansion",
      "I'll send you a ticket number and updates every 30 minutes until this is resolved",
    ],
  },
  {
    id: "worklist-empty",
    title: "Worklist Not Populating",
    description:
      "Radiologists report their PACS worklist is empty even though the scheduler shows scheduled exams and several have already been completed.",
    difficulty: "medium",
    category: "RIS/PACS Integration",
    objective:
      "Diagnose the RIS-to-PACS worklist integration failure and restore worklist population for clinical operations.",
    estimatedMinutes: 12,
    hints: [
      "Confirm if all radiologists are affected or just specific users",
      "Check the HL7 interface engine — is the RIS sending MWL (Modality Worklist) messages?",
      "Look for HL7 message errors in the interface engine log",
      "Verify the PACS MWL service is running on the PACS server",
      "Check if accession number format has changed in RIS (a common cause)",
      "Restart the MWL service as a temporary measure while investigating root cause",
    ],
    keyPhrases: [
      "Is this affecting all worklists across the department or specific radiologists?",
      "Let me check the HL7 interface engine — this is usually an integration message issue",
      "I can see HL7 messages are failing to parse — there may be a format change in your RIS",
      "I'm going to restart the Modality Worklist service — this should restore population within minutes",
      "Can you confirm orders from the last hour are now showing in your worklist?",
    ],
  },
  {
    id: "pacs-down",
    title: "PACS System Completely Down",
    description:
      "The entire PACS system is unreachable. Radiologists cannot view any studies and the ER is requesting urgent reads.",
    difficulty: "hard",
    category: "System Outage",
    objective:
      "Manage the critical outage, activate downtime procedures, communicate status to clinical staff, and restore PACS service.",
    estimatedMinutes: 18,
    hints: [
      "Stay calm and take immediate ownership — this is a critical patient care situation",
      "Confirm the scope: is it the PACS server, the network, or the viewing application?",
      "Activate downtime procedures: alert radiologists, clinical staff, and management",
      "Escalate immediately to PACS vendor support and your infrastructure team",
      "Check for server crashes, failed services, or storage errors on the PACS server",
      "Provide a status update every 15 minutes to stakeholders until resolution",
      "Document the outage timeline for post-incident review",
    ],
    keyPhrases: [
      "I'm treating this as a critical outage — I'm escalating immediately",
      "Please activate your downtime procedures for reading — I'll keep you updated every 15 minutes",
      "I've engaged our PACS vendor on an emergency call right now",
      "I'm on the server now — I can see the application service has crashed and I'm restarting it",
      "PACS is back online — please confirm you can pull up a study before I close this ticket",
    ],
  },
  {
    id: "cd-import-fail",
    title: "CD/DVD Import Failing",
    description:
      "A clinician is unable to import prior studies from a patient-brought CD. The import wizard fails with a 'DICOM media read error'.",
    difficulty: "medium",
    category: "Import & Migration",
    objective:
      "Successfully import the patient's prior studies from external media into PACS for clinical comparison.",
    estimatedMinutes: 10,
    hints: [
      "Ask what PACS import workstation they are using and the PACS version",
      "Ask if the CD plays in Windows Explorer — confirm the disc is physically readable",
      "Try copying CD contents to local drive first, then import from the folder",
      "Check if the CD is DICOM 3.0 compliant (some older modalities create non-standard media)",
      "Use PACS CD import tool with manual DICOM path selection",
      "As a last resort, use a DICOM viewer to view files locally and re-upload via DICOM send",
    ],
    keyPhrases: [
      "Let's first check if Windows can read the disc at all — can you open it in File Explorer?",
      "Can you copy the contents of the CD to your desktop and try importing from there?",
      "Some older CDs are not standard DICOM — let me check if we can convert it manually",
      "I'll guide you through the manual DICOM import path in our system",
      "Once imported, please confirm the images are visible and correctly matched to the patient",
    ],
  },
  {
    id: "corrupt-study",
    title: "Corrupted or Incomplete Study",
    description:
      "A radiologist reports that a CT chest study is incomplete — only 40 of 800 images are showing in the viewer. The scan was completed 2 hours ago.",
    difficulty: "hard",
    category: "Data Integrity",
    objective:
      "Identify whether the study transfer was incomplete or images are corrupted, and recover the full study for reading.",
    estimatedMinutes: 15,
    hints: [
      "Get the accession number and confirm the image count on the modality vs PACS",
      "Check the DICOM receive log for that accession — how many files were received?",
      "Look for DICOM storage commitment — was it acknowledged by the modality?",
      "Check if images are in the incoming queue or failed storage",
      "Request a re-send from the modality for missing series/images only",
      "If modality data was overwritten, check VNA/archive for a backup copy",
    ],
    keyPhrases: [
      "This is a patient care issue — let me make this my top priority",
      "I need the accession number so I can trace exactly where those images went",
      "I can see only 40 files were received — the modality may have had a transmission error",
      "I'm going to ask the tech to re-send just the missing series from the scanner",
      "Can you confirm the full study is now in your viewer before I close this ticket?",
    ],
  },
  {
    id: "remote-access-pacs",
    title: "Radiologist Cannot Access PACS Remotely",
    description:
      "An on-call radiologist working from home cannot connect to PACS to read urgent overnight studies. VPN connects but PACS viewer won't launch.",
    difficulty: "hard",
    category: "Remote Access",
    objective:
      "Restore remote PACS access for the on-call radiologist so urgent overnight reads can proceed without delay.",
    estimatedMinutes: 14,
    hints: [
      "Confirm VPN is fully connected — split tunnel may be blocking PACS traffic",
      "Check if the radiologist can ping the PACS server IP over VPN",
      "Verify Java/web viewer version compatibility on their home machine",
      "Check firewall rules: DICOM port 104 and HTTPS port 443 must be open over VPN",
      "Try the browser-based thin client viewer as an alternative to the thick client",
      "If all else fails, set up a RDP/Citrix session to a clinical workstation as a temporary solution",
    ],
    keyPhrases: [
      "I know you have urgent reads — let's get this working as fast as possible",
      "Can you confirm you're fully connected to VPN and try pinging our PACS server IP?",
      "Let's try the browser-based viewer as an alternative — I'll send you the link right now",
      "I'm checking our firewall rules for your VPN session right now",
      "As a backup, I can set you up with remote desktop to your reading room workstation",
    ],
  },
];

export const getScenario = (id: string): Scenario | undefined =>
  SCENARIOS.find((s) => s.id === id);
