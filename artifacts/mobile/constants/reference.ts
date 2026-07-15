export interface RefEntry {
  label: string;
  value?: string;
  description: string;
  tags?: string[];
}

export interface RefSection {
  id: string;
  title: string;
  icon: string;
  color: string;
  entries: RefEntry[];
}

export const REFERENCE_SECTIONS: RefSection[] = [
  {
    id: "ports",
    title: "Port Numbers",
    icon: "server",
    color: "#2563EB",
    entries: [
      {
        label: "DICOM (Standard)",
        value: "104",
        description:
          "Default unencrypted DICOM port. Used for C-STORE, C-FIND, C-MOVE, C-ECHO between modalities and PACS.",
        tags: ["dicom", "standard", "unencrypted"],
      },
      {
        label: "DICOM TLS (Secure)",
        value: "11112",
        description:
          "Encrypted DICOM over TLS. Used in environments requiring secure transmission (VPN, external connections).",
        tags: ["dicom", "tls", "secure", "encrypted"],
      },
      {
        label: "HL7 MLLP",
        value: "2575",
        description:
          "Minimum Lower Layer Protocol port for HL7 messages between RIS and PACS (worklist, ADT, orders).",
        tags: ["hl7", "mllp", "ris", "worklist", "integration"],
      },
      {
        label: "HTTPS (Web Viewers)",
        value: "443",
        description:
          "Standard HTTPS port for browser-based PACS viewers and web portals.",
        tags: ["https", "web", "viewer", "browser"],
      },
      {
        label: "HTTP (Unencrypted Web)",
        value: "8080",
        description:
          "Common alternate HTTP port for web-based PACS consoles and admin interfaces in internal networks.",
        tags: ["http", "web", "admin"],
      },
      {
        label: "RDP (Remote Desktop)",
        value: "3389",
        description:
          "Windows Remote Desktop Protocol. Used for remote access to PACS workstations.",
        tags: ["rdp", "remote", "windows"],
      },
      {
        label: "WADO-URI / DICOMweb",
        value: "8080 / 443",
        description:
          "DICOMweb standard ports (WADO-URI, WADO-RS, STOW-RS) for web-based DICOM retrieval and storage.",
        tags: ["dicomweb", "wado", "stow", "rest"],
      },
      {
        label: "DICOM TLS (Alternate)",
        value: "2762",
        description:
          "Alternate DICOM TLS port used by some vendors (Sectra, Agfa) in addition to 11112.",
        tags: ["dicom", "tls", "alternate", "sectra", "agfa"],
      },
    ],
  },
  {
    id: "dicom-services",
    title: "DICOM Services (DIMSE)",
    icon: "layers",
    color: "#7C3AED",
    entries: [
      {
        label: "C-ECHO",
        value: "Verify / Ping",
        description:
          "Tests DICOM connectivity between two nodes. Like a network ping but confirms DICOM association. Always start troubleshooting with C-ECHO.",
        tags: ["echo", "verify", "ping", "test", "connectivity"],
      },
      {
        label: "C-STORE",
        value: "Send Images",
        description:
          "Pushes DICOM objects (images) from SCU (sender) to SCP (receiver). Modality → PACS is C-STORE. Also used for modality → printer.",
        tags: ["store", "send", "push", "images", "modality"],
      },
      {
        label: "C-FIND",
        value: "Query",
        description:
          "Searches for studies, series, or images on a remote PACS. Used by worklist queries (MWL C-FIND) and study retrieval workflows.",
        tags: ["find", "query", "search", "worklist", "mwl"],
      },
      {
        label: "C-MOVE",
        value: "Retrieve (Push to 3rd party)",
        description:
          "Retrieves DICOM objects from PACS and sends them to a third destination. Used by radiologist viewers to pull studies.",
        tags: ["move", "retrieve", "pull", "viewer"],
      },
      {
        label: "C-GET",
        value: "Retrieve (Direct)",
        description:
          "Retrieves DICOM objects directly to the requesting node. Alternative to C-MOVE. Used in some thin clients.",
        tags: ["get", "retrieve", "direct"],
      },
      {
        label: "N-ACTION / N-EVENT",
        value: "Storage Commitment",
        description:
          "Storage Commitment SOP: modality asks PACS to confirm it has securely stored the images (N-ACTION). PACS replies with N-EVENT. Critical for modality data deletion workflows.",
        tags: ["commitment", "n-action", "n-event", "storage", "confirmation"],
      },
      {
        label: "Modality Worklist (MWL)",
        value: "C-FIND on Worklist SOP",
        description:
          "Modality queries PACS/RIS for scheduled procedures. Requires MWL SCP running on PACS/broker. Feeds scanner with patient demographics and accession numbers.",
        tags: ["worklist", "mwl", "scheduled", "ris", "demographics"],
      },
      {
        label: "MPPS",
        value: "Modality Performed Procedure Step",
        description:
          "Modality notifies PACS when a procedure starts (IN PROGRESS) and completes (COMPLETED). Used to update RIS order status automatically.",
        tags: ["mpps", "performed", "procedure", "status", "ris"],
      },
    ],
  },
  {
    id: "ae-titles",
    title: "AE Title Guide",
    icon: "tag",
    color: "#059669",
    entries: [
      {
        label: "What is an AE Title?",
        description:
          "Application Entity Title: a unique name (up to 16 characters, case-sensitive, no spaces) identifying a DICOM node. Think of it as a DICOM network address. Both ends of a connection need matching AE Titles.",
        tags: ["ae", "application entity", "basics"],
      },
      {
        label: "Case Sensitivity",
        description:
          "'PACS_SERVER' and 'pacs_server' are DIFFERENT AE Titles. Association Rejected errors are often caused by case mismatches. Always verify the exact string on both ends.",
        tags: ["case", "sensitive", "mismatch", "rejected"],
      },
      {
        label: "Called AE Title",
        description:
          "The AE Title of the destination (e.g., PACS) as configured on the sender (e.g., modality). Must exactly match what the PACS has registered for itself.",
        tags: ["called", "destination", "pacs"],
      },
      {
        label: "Calling AE Title",
        description:
          "The AE Title the sender claims to be (e.g., modality's own AE Title). The PACS uses this to identify and authorize the sender. Must be registered in PACS DICOM device list.",
        tags: ["calling", "source", "modality", "authorization"],
      },
      {
        label: "Common Naming Conventions",
        description:
          "Typical patterns: CT_ROOM1, MRI_SCANNER_01, PACS_MAIN, ARCHIVE_VNA, PRINT_SERVER. Keep names short, descriptive, and consistent across your network.",
        tags: ["naming", "convention", "examples"],
      },
      {
        label: "Max Length & Characters",
        description:
          "AE Titles are maximum 16 characters. Allowed: uppercase letters A-Z, digits 0-9, underscore (_), hyphen (-). No spaces, no lowercase (avoid), no special characters.",
        tags: ["length", "characters", "format", "rules"],
      },
      {
        label: "AE Title Mismatch — Fix",
        description:
          "Step 1: Get the exact Called AE Title from the modality DICOM settings. Step 2: Check PACS DICOM device list for the matching entry. Step 3: Correct the mismatch on the modality or add/update the PACS entry. Step 4: Re-run C-ECHO to verify.",
        tags: ["mismatch", "fix", "troubleshoot", "association rejected"],
      },
    ],
  },
  {
    id: "error-codes",
    title: "Association Error Codes",
    icon: "alert-triangle",
    color: "#DC2626",
    entries: [
      {
        label: "Association Rejected (0x01)",
        value: "Permanent / No Reason",
        description:
          "The remote application refused the connection permanently. Usually means AE Title not recognized. Check Called and Calling AE Titles on both ends.",
        tags: ["rejected", "ae title", "association", "0x01"],
      },
      {
        label: "Calling AE Not Recognized (0x03)",
        value: "Authorization Failure",
        description:
          "PACS does not recognize the sender's AE Title. The modality is not registered in the PACS DICOM device list. Add the modality's IP and AE Title to PACS.",
        tags: ["calling", "not recognized", "authorization", "0x03", "rejected"],
      },
      {
        label: "Called AE Not Recognized (0x07)",
        value: "Wrong Destination",
        description:
          "The destination AE Title on the modality doesn't match any registered PACS AE Title. Correct the Called AE Title on the modality.",
        tags: ["called", "not recognized", "destination", "0x07", "rejected"],
      },
      {
        label: "Association Aborted (0x02)",
        value: "Connection Dropped Mid-Transfer",
        description:
          "Connection was established but then aborted. Causes: network timeout, PACS server crash, storage full. Check PACS logs for the abort reason.",
        tags: ["aborted", "dropped", "timeout", "storage full", "0x02"],
      },
      {
        label: "Application Context Not Supported",
        value: "Version Mismatch",
        description:
          "The DICOM application context is not supported. Typically a major version incompatibility or the connection is not to a DICOM service at all (wrong IP/port).",
        tags: ["application context", "version", "incompatible"],
      },
      {
        label: "C-STORE Status: 0xA700",
        value: "Out of Resources",
        description:
          "PACS refused to store the image because it has run out of storage resources. PACS storage is likely full. Escalate to storage team immediately.",
        tags: ["0xa700", "storage full", "resources", "c-store", "refused"],
      },
      {
        label: "C-STORE Status: 0xA900",
        value: "Data Set Does Not Match SOP Class",
        description:
          "The DICOM data sent doesn't match the declared SOP Class. Often a modality firmware issue or corrupted DICOM header. Try re-exporting from the modality.",
        tags: ["0xa900", "sop class", "mismatch", "c-store", "corrupt"],
      },
      {
        label: "C-STORE Status: 0xC000",
        value: "Cannot Understand",
        description:
          "PACS could not process the DICOM file. Usually a corrupt DICOM dataset or unsupported Transfer Syntax. Check modality export settings.",
        tags: ["0xc000", "cannot understand", "corrupt", "transfer syntax"],
      },
      {
        label: "C-STORE Status: 0x0000",
        value: "Success",
        description:
          "Image stored successfully. If the modality shows this but images don't appear in PACS, check the PACS incoming queue and AE routing rules.",
        tags: ["0x0000", "success", "stored", "complete"],
      },
      {
        label: "C-ECHO Status: 0x0000",
        value: "Verify Success",
        description:
          "DICOM connectivity is confirmed. Both AE Titles match and network connection is open. If C-ECHO passes but C-STORE fails, the issue is likely in storage or routing.",
        tags: ["0x0000", "echo", "success", "connectivity"],
      },
    ],
  },
  {
    id: "hl7",
    title: "HL7 & RIS Integration",
    icon: "git-merge",
    color: "#D97706",
    entries: [
      {
        label: "What is HL7?",
        description:
          "Health Level 7: a messaging standard for exchanging clinical data between systems. RIS sends HL7 messages to PACS for patient demographics, orders, and worklist population.",
        tags: ["hl7", "basics", "standard", "integration"],
      },
      {
        label: "ORM - Order Message",
        value: "RIS → PACS",
        description:
          "HL7 ORM^O01: sent when a radiology order is created in RIS. Creates a scheduled procedure in PACS worklist. Missing ORM = empty worklist.",
        tags: ["orm", "order", "worklist", "scheduled", "ris"],
      },
      {
        label: "ADT - Patient Demographics",
        value: "ADT^A01/A08",
        description:
          "Patient admission, discharge, transfer messages. A01 = admit, A08 = update demographics. Keeps patient info synchronized between RIS, PACS, and EMR.",
        tags: ["adt", "demographics", "patient", "admit", "update"],
      },
      {
        label: "ORU - Results Message",
        value: "PACS → RIS",
        description:
          "HL7 ORU^R01: PACS sends completed radiology reports back to RIS/EMR. Closes the reporting loop.",
        tags: ["oru", "results", "report", "completed"],
      },
      {
        label: "Interface Engine",
        description:
          "Middleware (e.g., Mirth Connect, Rhapsody, Iguana) that routes and transforms HL7 messages between systems. First place to check when worklist is empty.",
        tags: ["interface engine", "mirth", "rhapsody", "middleware", "integration"],
      },
      {
        label: "MLLP Wrapper",
        description:
          "Minimum Lower Layer Protocol: wraps HL7 messages for TCP/IP transmission. Uses start byte 0x0B and end bytes 0x1C 0x0D. Port 2575 by default.",
        tags: ["mllp", "tcp", "wrapper", "protocol"],
      },
      {
        label: "Worklist Empty — Checklist",
        description:
          "1. Is the interface engine running? 2. Are ORM messages being sent by RIS? 3. Is PACS MWL service running? 4. Check HL7 message logs for parse errors. 5. Verify accession number format hasn't changed.",
        tags: ["worklist", "empty", "checklist", "troubleshoot", "mwl"],
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting Flowcharts",
    icon: "git-branch",
    color: "#0891B2",
    entries: [
      {
        label: "Modality Can't Send to PACS",
        description:
          "1. Can you ping PACS server IP from modality? No → Network issue.\n2. Run C-ECHO from modality → Fails? → AE Title mismatch.\n3. C-ECHO passes but C-STORE fails → Check PACS storage space and routing rules.\n4. C-STORE succeeds but images not visible → Check PACS incoming queue and AE routing destination.",
        tags: ["modality", "send", "pacs", "c-store", "association rejected"],
      },
      {
        label: "Worklist Not Populating",
        description:
          "1. Check HL7 interface engine status — is it running?\n2. Verify RIS is sending ORM messages (check interface engine log).\n3. Check PACS MWL service status — restart if needed.\n4. Look for HL7 parse errors (often caused by changed accession number format).\n5. Verify modality is querying the correct MWL SCP AE Title and IP.",
        tags: ["worklist", "mwl", "empty", "hl7", "ris"],
      },
      {
        label: "Images Not Showing After Send",
        description:
          "1. Check modality send log — did it show 'Complete' with 0x0000?\n2. Check PACS incoming queue for pending or failed entries.\n3. Verify PACS routing rules: is the AE destination correct?\n4. Look for storage commitment failures.\n5. If images in queue but not committed — manually trigger commit or re-archive.",
        tags: ["images", "missing", "not showing", "queue", "commitment"],
      },
      {
        label: "PACS Down / Unreachable",
        description:
          "1. Can you ping the PACS server IP? No → Network/firewall issue.\n2. Can you RDP to the PACS server? Yes → Check which services have crashed.\n3. On PACS server: check application service, database service, archive service status.\n4. Restart crashed services in order: Database → Archive → Application.\n5. If server won't respond to RDP → escalate to infrastructure team (possible OS-level crash).",
        tags: ["pacs", "down", "outage", "unreachable", "service", "crash"],
      },
      {
        label: "Remote Viewer Won't Connect",
        description:
          "1. Is VPN connected? Check VPN client shows 'Connected'.\n2. Can user ping PACS server over VPN? No → VPN split tunnel issue.\n3. Try browser-based thin client viewer as alternative.\n4. Check firewall: ports 104, 443, and 8080 must be open over VPN.\n5. If thick client fails only → Java or app version issue on home machine. Try RDP to reading room workstation.",
        tags: ["remote", "viewer", "vpn", "connect", "home", "firewall"],
      },
      {
        label: "CD Import Failing",
        description:
          "1. Can Windows Explorer read the CD? No → Physical disc issue.\n2. Copy CD contents to local drive, then import from folder.\n3. Open the folder — are .dcm files visible? Yes → Manual DICOM path import.\n4. Check if DICOMDIR file is present — PACS needs it for standard import.\n5. No DICOMDIR → Use third-party DICOM viewer to identify files and manually import via DICOM send.",
        tags: ["cd", "import", "dicomdir", "external", "media"],
      },
      {
        label: "Login / Authentication Failed",
        description:
          "1. Is the account locked? Check Active Directory or PACS user management.\n2. Is the PACS application service running? (Users can't log in if app service is down)\n3. Is it all users or just one? All → Service/network issue. One → Account issue.\n4. Check LDAP/AD integration settings if using domain authentication.\n5. Unlock account or reset password via AD admin tools.",
        tags: ["login", "authentication", "locked", "account", "password", "ad"],
      },
    ],
  },
  {
    id: "dicom-concepts",
    title: "Key DICOM Concepts",
    icon: "book-open",
    color: "#BE185D",
    entries: [
      {
        label: "SOP Class",
        description:
          "Service-Object Pair Class: defines what type of DICOM object it is (CT Image, MR Image, Digital X-Ray, etc.) and what operations are allowed. Each SOP Class has a unique UID.",
        tags: ["sop", "class", "uid", "type"],
      },
      {
        label: "Transfer Syntax",
        description:
          "Defines how DICOM data is encoded: byte order, compression. Examples: Explicit VR Little Endian (most common), JPEG 2000 (compressed). Mismatch between sender and receiver causes C-STORE failures.",
        tags: ["transfer syntax", "encoding", "compression", "jpeg", "little endian"],
      },
      {
        label: "DICOM UID",
        description:
          "Unique Identifier: globally unique string identifying a study, series, or instance. Format: 'root.suffix' (e.g., 1.2.840.10008.x.x). Never changes. Used to track and correlate objects across systems.",
        tags: ["uid", "unique", "identifier", "study", "series"],
      },
      {
        label: "SCU vs SCP",
        description:
          "Service Class User (SCU) = initiator/client. Service Class Provider (SCP) = responder/server. Modality is SCU for C-STORE (it initiates sending). PACS is SCP for C-STORE (it receives). Roles switch for C-FIND and C-MOVE.",
        tags: ["scu", "scp", "client", "server", "role"],
      },
      {
        label: "DICOM Association",
        description:
          "A DICOM 'connection' or session. Must be established before any data can be transferred. Association negotiates AE Titles, Transfer Syntaxes, and SOP Classes. If negotiation fails → Association Rejected.",
        tags: ["association", "connection", "session", "negotiation"],
      },
      {
        label: "VNA (Vendor Neutral Archive)",
        description:
          "Long-term image storage system separate from the active PACS. Stores images in standard DICOM format, independent of vendor. Acts as a safety net — check VNA if images are missing from PACS.",
        tags: ["vna", "archive", "long-term", "vendor neutral"],
      },
      {
        label: "PACS Incoming Queue",
        description:
          "Temporary holding area where DICOM images arrive before being committed to permanent storage. Failed commits appear here. Always check the queue when images are 'sent but not visible'.",
        tags: ["queue", "incoming", "commit", "storage", "pending"],
      },
      {
        label: "DICOMweb (WADO/STOW)",
        description:
          "RESTful DICOM standards over HTTP/HTTPS. WADO-RS: retrieve images. STOW-RS: store images. QIDO-RS: query. Used by modern web viewers and mobile clients. No AE Titles needed.",
        tags: ["dicomweb", "wado", "stow", "qido", "rest", "http", "web"],
      },
    ],
  },
];
