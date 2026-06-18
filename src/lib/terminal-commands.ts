// ============================================================
// Interactive terminal command parser — easter egg!
// ============================================================

export interface CommandResult {
  command: string;
  output: string[];
  style?: "success" | "error" | "warning" | "info" | "joke" | "neofetch";
  /** Extra data for special renderers (e.g. neofetch system info) */
  meta?: Record<string, string>;
}

// Special sentinel: "clear" returns this so the caller knows to wipe history
export const CLEAR_SENTINEL = "__CLEAR__";

const startTime = Date.now();

function formatUptime(): string {
  const ms = Date.now() - startTime;
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / 60000) % 60;
  const hours = Math.floor(ms / 3600000);
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function getNeofetchMeta(): Record<string, string> {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "unknown";
  const browser = ua.includes("Chrome")
    ? "Chrome"
    : ua.includes("Firefox")
      ? "Firefox"
      : ua.includes("Safari")
        ? "Safari"
        : "Unknown";
  const os = ua.includes("Mac")
    ? "macOS"
    : ua.includes("Windows")
      ? "Windows"
      : ua.includes("Linux")
        ? "Linux"
        : "Unknown OS";

  return {
    os,
    browser,
    shell: "metastrip v3.0",
    uptime: formatUptime(),
    packages: "piexifjs, pdf-lib, jszip",
    privacy: "100% client-side",
    tracking: "none",
    accounts: "0 required",
  };
}

function getManPage(): string[] {
  return [
    "",
    "METASTRIP(1)              Privacy Tools Manual              METASTRIP(1)",
    "",
    "NAME",
    "    metastrip — remove metadata from files, client-side",
    "",
    "SYNOPSIS",
    "    metastrip [--remove-all] [--keep category] file ...",
    "",
    "DESCRIPTION",
    "    Strips EXIF, GPS, author, device, and other metadata from",
    "    images, PDFs, and Office documents. All processing happens",
    "    in your browser. No files are uploaded. No data leaves",
    "    your device. Ever.",
    "",
    "OPTIONS",
    "    --remove-all    strip all metadata categories",
    "    --keep <cat>    preserve a specific category",
    "",
    "USAGE",
    "    Drag files into this terminal. Select categories. Execute.",
    "    Or just type commands for fun. We don't judge.",
    "",
    "BUGS",
    "    If you find one, it's a feature. (email hello@metastrip.app)",
    "",
  ];
}

function getHelp(): string[] {
  return [
    "",
    "available commands:",
    "",
    "  help          show this message",
    "  about         what is metastrip?",
    "  version       show version info",
    "  ls            list supported file types",
    "  pwd           print working directory",
    "  whoami        who are you?",
    "  uptime        how long this tab has been open",
    "  neofetch      system info, the nerdy way",
    "  man metastrip read the manual",
    "  cat privacy   view privacy summary",
    "  echo <text>   echo text back",
    "  clear         clear terminal history",
    "",
    "pro tip: try some other commands... there are easter eggs 🥚",
    "",
  ];
}

export function executeCommand(input: string): CommandResult {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();
  const parts = lower.split(/\s+/);
  const cmd = parts[0];

  // ── Clear (special case) ──
  if (cmd === "clear") {
    return { command: trimmed, output: [CLEAR_SENTINEL], style: "info" };
  }

  // ── Real commands ──
  if (cmd === "help" || cmd === "?") {
    return { command: trimmed, output: getHelp(), style: "info" };
  }

  if (cmd === "about") {
    return {
      command: trimmed,
      output: [
        "",
        "metastrip — privacy-first metadata removal",
        "your files never leave your browser. no servers, no uploads, no tracking.",
        "built in melbourne by an indie dev with a cybersecurity background.",
        "free forever. supported by voluntary tips via ko-fi.",
        "",
      ],
      style: "info",
    };
  }

  if (cmd === "version" || lower === "--version" || lower === "-v") {
    return {
      command: trimmed,
      output: ["metastrip v3.0.0 — client-side metadata removal"],
      style: "info",
    };
  }

  if (cmd === "ls" || cmd === "dir") {
    return {
      command: trimmed,
      output: [
        "",
        "drwxr-xr-x  supported/",
        "  -rw-r--r--  .jpeg",
        "  -rw-r--r--  .jpg",
        "  -rw-r--r--  .png",
        "  -rw-r--r--  .webp",
        "  -rw-r--r--  .pdf",
        "  -rw-r--r--  .docx",
        "  -rw-r--r--  .xlsx",
        "  -rw-r--r--  .pptx",
        "",
        "8 supported formats | batch limit: 20 files",
        "",
      ],
      style: "info",
    };
  }

  if (cmd === "pwd") {
    return { command: trimmed, output: ["/home/anonymous/uploads"], style: "info" };
  }

  if (cmd === "whoami") {
    return {
      command: trimmed,
      output: ["anonymous — no tracking, no accounts, no profiles"],
      style: "success",
    };
  }

  if (cmd === "uptime") {
    return {
      command: trimmed,
      output: [`tab uptime: ${formatUptime()}`],
      style: "info",
    };
  }

  if (cmd === "neofetch" || cmd === "screenfetch" || cmd === "fastfetch") {
    return { command: trimmed, output: [], style: "neofetch", meta: getNeofetchMeta() };
  }

  if (cmd === "man") {
    return { command: trimmed, output: getManPage(), style: "info" };
  }

  if (cmd === "cat") {
    const target = parts.slice(1).join(" ");
    if (target.includes("privacy") || target.includes("policy")) {
      return {
        command: trimmed,
        output: [
          "",
          "# privacy.txt",
          "your files are processed in your browser.",
          "we never see, store, or transmit them.",
          "we don't track individual users.",
          "we collect minimal analytics (posthog, cookieless).",
          "no accounts. no ads. ever.",
          "contact: hello@metastrip.app",
          "",
        ],
        style: "info",
      };
    }
    if (!target) {
      return { command: trimmed, output: ["cat: missing operand. try 'cat privacy'"], style: "error" };
    }
    return { command: trimmed, output: [`cat: ${target}: no such file. try 'cat privacy'`], style: "error" };
  }

  if (cmd === "echo") {
    const text = trimmed.slice(5);
    return { command: trimmed, output: [text || ""], style: "info" };
  }

  // ── Vim/editor jokes ──
  if (cmd === "vim" || cmd === "vi" || cmd === "nvim") {
    return {
      command: trimmed,
      output: [
        "",
        "error: you've entered vim. there is no escape.",
        "just kidding — this is metastrip, not a hostage situation.",
        "(try :q! to exit vim, or just drag some files in)",
        "",
      ],
      style: "joke",
    };
  }

  if (lower === ":q") {
    return {
      command: trimmed,
      output: ["you're not in vim. but we respect the muscle memory."],
      style: "joke",
    };
  }

  if (lower === ":q!" || lower === ":q1") {
    return {
      command: trimmed,
      output: [
        "look, you're not in vim. nobody is forcing you to be here.",
        "drag some files in or type 'help'.",
      ],
      style: "joke",
    };
  }

  if (lower === ":wq" || lower === ":wq!" || lower === ":x") {
    return {
      command: trimmed,
      output: ["saved nothing, quit nothing. this is a metadata stripper, not a text editor."],
      style: "joke",
    };
  }

  if (cmd === "nano") {
    return {
      command: trimmed,
      output: ["nano?? in THIS terminal? we have standards. (jk, type 'help')"],
      style: "joke",
    };
  }

  if (cmd === "emacs") {
    return {
      command: trimmed,
      output: [
        "*opens 47 buffers, plays tetris, sends an email*",
        "just kidding. try 'help'.",
      ],
      style: "joke",
    };
  }

  // ── Other nerdy jokes ──
  if (cmd === "exit" || cmd === "quit" || cmd === "logout") {
    return {
      command: trimmed,
      output: [
        "there is no exit. only metadata removal.",
        "(or just close the tab like a normal person)",
      ],
      style: "joke",
    };
  }

  if (lower.startsWith("rm ")) {
    return {
      command: trimmed,
      output: ["nice try, hackerman. this terminal can only remove metadata, not filesystems."],
      style: "joke",
    };
  }

  if (cmd === "ssh") {
    return {
      command: trimmed,
      output: ["connection refused: metastrip runs locally. there's nowhere to ssh TO."],
      style: "joke",
    };
  }

  if (lower === "git push" || lower === "git commit" || cmd === "git") {
    return {
      command: trimmed,
      output: ["fatal: not a git repository. also this is a metadata stripper."],
      style: "joke",
    };
  }

  if (lower === "npm install" || lower === "npm i" || lower === "yarn" || lower === "pnpm install") {
    return {
      command: trimmed,
      output: [
        "",
        "added 0 packages, removed 847 trackers, audited your privacy",
        "",
        "0 vulnerabilities (because your files never leave your browser)",
        "",
      ],
      style: "joke",
    };
  }

  if (cmd === "python" || cmd === "python3" || cmd === "node") {
    return {
      command: trimmed,
      output: [
        `>>> import metastrip`,
        `>>> metastrip.strip("your_data")`,
        `Traceback: NotImplementedError`,
        `just drag files in, nerd.`,
      ],
      style: "joke",
    };
  }

  if (cmd === "docker") {
    return {
      command: trimmed,
      output: ["cannot connect to docker daemon. have you tried dragging a JPEG instead?"],
      style: "joke",
    };
  }

  if (cmd === "curl" || cmd === "wget") {
    return {
      command: trimmed,
      output: ["error: nice try. your files stay in your browser."],
      style: "joke",
    };
  }

  if (cmd === "sudo") {
    return {
      command: trimmed,
      output: ["permission denied: metastrip doesn't need root. or your data."],
      style: "joke",
    };
  }

  if (lower === "make" || lower === "make install") {
    return {
      command: trimmed,
      output: [
        "make: nothing to be done for 'install'.",
        "metastrip is already running. in your browser. right now.",
      ],
      style: "joke",
    };
  }

  if (cmd === "ping") {
    return {
      command: trimmed,
      output: [
        "PING privacy.metastrip.app: 0 packets transmitted, 0 received",
        "because we don't phone home. ever.",
      ],
      style: "joke",
    };
  }

  if (lower === "apt-get install" || lower.startsWith("brew install") || lower.startsWith("apt ")) {
    return {
      command: trimmed,
      output: ["metastrip is already installed. it's this tab. you're looking at it."],
      style: "joke",
    };
  }

  if (cmd === "top" || cmd === "htop" || cmd === "btop") {
    return {
      command: trimmed,
      output: [
        "",
        "  PID  COMMAND        CPU   MEM   PRIVACY",
        "  1    metastrip      0.1%  low   ██████████ 100%",
        "  2    trackers        —     —    (not found)",
        "  3    analytics      0.0%  min   cookieless",
        "",
      ],
      style: "joke",
    };
  }

  if (cmd === "hack" || lower.includes("hack")) {
    return {
      command: trimmed,
      output: [
        "ACCESS GRANTED ████████████████",
        "just kidding. this is a metadata remover, not mr. robot.",
      ],
      style: "joke",
    };
  }

  if (lower === "hello" || lower === "hi" || lower === "hey") {
    return {
      command: trimmed,
      output: ["hey! 👋 drag some files in or type 'help' to see what I can do."],
      style: "info",
    };
  }

  // ── Unknown command ──
  return {
    command: trimmed,
    output: [`command not found: ${cmd}. type 'help' for available commands.`],
    style: "error",
  };
}
