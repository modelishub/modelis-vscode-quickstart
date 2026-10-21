# Modelis Quickstart

VS Code extension that wires up [Modelis](https://modelishub.com) — an OpenAI-compatible LLM
gateway (one key for ~95 models from OpenAI/Anthropic/Google/DeepSeek/xAI/Qwen; `modelis-auto`
is the standard auto-route) — into your coding agent in under a minute. No npm dependencies;
~170 lines, read it before trusting it.

Built for people migrating provider configs after Roo Code's shutdown (Zoo Code / Cline / Continue).

## Install (Marketplace publish pending — manual install works today)

1. Download [`modelis-quickstart-0.1.1.vsix`](https://github.com/modelishub/modelis-vscode-quickstart/releases/latest)
2. VS Code → Extensions panel → `...` menu → **Install from VSIX**
   (or: `code --install-extension modelis-quickstart-0.1.1.vsix`)

## Commands (Cmd/Ctrl+Shift+P)

| Command | What it does |
|---|---|
| **Modelis: Set API Key** | Stores your key in VS Code's encrypted SecretStorage (never written to settings.json). |
| **Modelis: Show Provider Config for My Tool** | Quick-pick your tool (Cline/Roo/Zoo, Continue, Aider, raw SDK) and a `modelis-auto` tier → get the exact values, one click to copy. |
| **Modelis: Add to Continue Config** | Writes/merges the Modelis entry directly into `~/.continue/config.yaml`, then opens it for you to review. |

## Setup flow

1. Create an account. New accounts get **$1 free credit**: https://modelishub.com/pricing
2. Run **Modelis: Set API Key**, paste it.
3. Run **Modelis: Show Provider Config for My Tool**, paste into your tool's settings.

Every tool uses the same OpenAI-compatible base URL: `https://modelishub.com/v1`
(`Authorization: Bearer`). Card payments go through Creem. Alipay and WeChat go through
Afdian. Both are linked from the pricing page.

## Models

Use the colon form. `modelis-auto` and `modelis-auto:standard` are the same tier.

| Model ID | Tier |
|---|---|
| `modelis-auto` | standard (default) |
| `modelis-auto:basic` | basic |
| `modelis-auto:standard` | standard |
| `modelis-auto:premium` | premium |

## Pricing

A `modelis-auto` call is a fixed price while it stays inside that tier's token limits.
Tokens above those limits are billed per token.

| Tier | Per call, within limits | Included input | Included output |
|---|---|---|---|
| basic | $0.004 | 4,000 | 1,000 |
| standard (`modelis-auto`) | $0.02 | 8,000 | 2,000 |
| premium | $0.05 | 4,000 | 1,000 |

Named models are the upstream price plus 15% at top-up.

## Examples

### Cline / Roo Code / Zoo Code

```
API Provider: OpenAI Compatible
Base URL:     https://modelishub.com/v1
API Key:      <your-modelis-key>
Model ID:     modelis-auto
```

### Continue (`~/.continue/config.yaml`)

```yaml
models:
  - name: Modelis
    provider: openai
    model: modelis-auto
    apiBase: https://modelishub.com/v1
    apiKey: <your-modelis-key>
```

### Aider

```bash
export OPENAI_API_BASE=https://modelishub.com/v1
export OPENAI_API_KEY=<your-modelis-key>
aider --model openai/modelis-auto
```

### OpenAI SDK

```python
from openai import OpenAI
client = OpenAI(base_url="https://modelishub.com/v1", api_key="<your-modelis-key>")
client.chat.completions.create(model="modelis-auto",
    messages=[{"role": "user", "content": "Hello"}])
```

Swap `modelis-auto` for `modelis-auto:basic`, `modelis-auto:standard`, or `modelis-auto:premium`.

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
maintainers — those are just the tools this saves you typing config for. Model names such as
GPT, Claude, Gemini, Grok, Qwen, and DeepSeek are trademarks of their respective owners.

## License

MIT
