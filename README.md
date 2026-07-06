# Modelis Quickstart

VS Code extension that wires up [Modelis](https://modelishub.com) — an OpenAI-compatible LLM
gateway (one key routes to GPT/Claude/Gemini/DeepSeek/Grok/Qwen, flat per-call pricing) — into
your coding agent in under a minute. No npm dependencies; ~150 lines, read it before trusting it.

Built for people migrating provider configs after Roo Code's shutdown (Zoo Code / Cline / Continue).

## Install (Marketplace publish pending — manual install works today)

1. Download [`modelis-quickstart-0.1.0.vsix`](https://github.com/modelishub/modelis-vscode-quickstart/releases/latest)
2. VS Code → Extensions panel → `...` menu → **Install from VSIX**
   (or: `code --install-extension modelis-quickstart-0.1.0.vsix`)

## Commands (Cmd/Ctrl+Shift+P)

| Command | What it does |
|---|---|
| **Modelis: Set RapidAPI Key** | Stores your key in VS Code's encrypted SecretStorage (never written to settings.json). |
| **Modelis: Show Provider Config for My Tool** | Quick-pick your tool (Cline/Roo/Zoo, Continue, Aider, raw SDK) → get the exact values, one click to copy. |
| **Modelis: Start Local Proxy** | Opens a terminal and runs `npx modelis-openai` — bridges Cline's `Authorization: Bearer` to the `X-RapidAPI-Key` header RapidAPI expects. |
| **Modelis: Add to Continue Config** | Writes/merges the Modelis entry directly into `~/.continue/config.yaml`, then opens it for you to review. |

## Setup flow

1. Get a free key (no card): https://modelishub.com/pricing
2. Run **Modelis: Set RapidAPI Key**, paste it.
3. Run **Modelis: Start Local Proxy** (needs Node 18+).
4. Run **Modelis: Show Provider Config for My Tool**, paste into your tool's settings.

## Why a local proxy?

RapidAPI's gateway authenticates with `X-RapidAPI-Key`, but coding agents send the standard OpenAI
`Authorization: Bearer` header. `modelis-openai` (https://github.com/modelishub/modelis-openai) is
a ~120-line, zero-dependency local bridge that rewrites the header and forwards bytes — it does not
log or inspect message content.

## Develop / test locally

No build step (plain CommonJS, no bundler). Open this folder in VS Code and press **F5** to launch
an Extension Development Host with it loaded.

## Package / publish

```bash
npx @vscode/vsce package    # produces modelis-quickstart-x.y.z.vsix
npx @vscode/vsce publish    # requires a Marketplace publisher token
```

## Not affiliated

Independent tool, not affiliated with Roo Code / Zoo Code / Cline / Continue / Aider or their
maintainers — those are just the tools this saves you typing config for.

## License

MIT
