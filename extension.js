// Modelis Quickstart — zero-dependency VS Code extension.
// Helps builders wire the Modelis LLM gateway (one key -> ~95 models from
// OpenAI/Anthropic/Google/DeepSeek/xAI/Qwen, OpenAI-compatible) into
// Cline / Roo Code / Zoo Code / Continue / Aider.
//
// No npm dependencies: only Node builtins + the `vscode` module supplied by the extension host.
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');

const SECRET_KEY = 'modelis.apiKey';
const LEGACY_SECRET_KEY = 'modelis.rapidApiKey';
const SIGNUP_URL = 'https://modelishub.com/pricing';
const BASE_URL = 'https://modelishub.com/v1';
const KEY_PLACEHOLDER = '<your-modelis-key>';

const TOOLS = [
  { label: 'Cline / Roo Code / Zoo Code (VS Code)', id: 'cline' },
  { label: 'Continue', id: 'continue' },
  { label: 'Aider', id: 'aider' },
  { label: 'Any OpenAI SDK (Python/JS)', id: 'sdk' },
];

// modelis-auto is the standard tier. Valid ids are the four colon-form
// entries below; modelis-auto and modelis-auto:standard are the same tier.
const MODELS = [
  { label: 'modelis-auto', description: 'standard (default) — $0.02 within 8k in / 2k out, then per token', id: 'modelis-auto' },
  { label: 'modelis-auto:basic', description: '$0.004 within 4k in / 1k out, then per token', id: 'modelis-auto:basic' },
  { label: 'modelis-auto:standard', description: 'same as modelis-auto — $0.02 within 8k in / 2k out, then per token', id: 'modelis-auto:standard' },
  { label: 'modelis-auto:premium', description: '$0.05 within 4k in / 1k out, then per token', id: 'modelis-auto:premium' },
];

function configFor(toolId, key, model) {
  const k = key || KEY_PLACEHOLDER;
  const modelId = model || 'modelis-auto';
  switch (toolId) {
    case 'cline':
      return [
        'API Provider: OpenAI Compatible',
        `Base URL:     ${BASE_URL}`,
        `API Key:      ${k}`,
        `Model ID:     ${modelId}`,
      ].join('\n');
    case 'continue':
      return [
        'models:',
        '  - name: Modelis',
        '    provider: openai',
        `    model: ${modelId}`,
        `    apiBase: ${BASE_URL}`,
        `    apiKey: ${k}`,
      ].join('\n');
    case 'aider':
      return [
        `export OPENAI_API_BASE=${BASE_URL}`,
        `export OPENAI_API_KEY=${k}`,
        `aider --model openai/${modelId}`,
      ].join('\n');
    default:
      return [
        'from openai import OpenAI',
        `client = OpenAI(base_url="${BASE_URL}", api_key="${k}")`,
        `client.chat.completions.create(model="${modelId}",`,
        '    messages=[{"role": "user", "content": "Hello"}])',
      ].join('\n');
  }
}

/** @param {vscode.ExtensionContext} context */
async function readKey(context) {
  const current = await context.secrets.get(SECRET_KEY);
  if (current) return current;
  return context.secrets.get(LEGACY_SECRET_KEY);
}

/** @param {vscode.ExtensionContext} context */
async function writeKey(context, key) {
  await context.secrets.store(SECRET_KEY, key);
  try {
    await context.secrets.delete(LEGACY_SECRET_KEY);
  } catch {
    // Older hosts, or a key that was never stored under the legacy name.
  }
}

/** @param {vscode.ExtensionContext} context */
function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('modelis.setApiKey', async () => {
      const existing = await readKey(context);
      const key = await vscode.window.showInputBox({
        prompt: 'Paste your Modelis API key (new accounts include $1 free credit)',
        password: true,
        ignoreFocusOut: true,
        value: existing || '',
        placeHolder: 'Modelis API key',
      });
      if (!key) return;
      await writeKey(context, key);
      vscode.window.showInformationMessage('Modelis: API key saved.');
    }),

    vscode.commands.registerCommand('modelis.showConfig', async () => {
      const pick = await vscode.window.showQuickPick(TOOLS, {
        placeHolder: 'Which tool are you configuring?',
      });
      if (!pick) return;

      const modelPick = await vscode.window.showQuickPick(MODELS, {
        placeHolder: 'Which modelis-auto tier? (modelis-auto = standard)',
      });
      if (!modelPick) return;

      let key = await readKey(context);
      if (!key) {
        const open = 'Get a key ($1 free credit)';
        const choice = await vscode.window.showInformationMessage(
          'No Modelis key saved yet. Showing config with a placeholder — run "Modelis: Set API Key" once you have one.',
          open
        );
        if (choice === open) vscode.env.openExternal(vscode.Uri.parse(SIGNUP_URL));
      }

      const text = configFor(pick.id, key, modelPick.id);
      const copy = 'Copy to clipboard';
      const choice = await vscode.window.showInformationMessage(text, { modal: true }, copy);
      if (choice === copy) {
        await vscode.env.clipboard.writeText(text);
        vscode.window.showInformationMessage('Modelis: config copied to clipboard.');
      }
    }),

    vscode.commands.registerCommand('modelis.writeContinueConfig', async () => {
      const key = (await readKey(context)) || KEY_PLACEHOLDER;
      const dir = path.join(os.homedir(), '.continue');
      const file = path.join(dir, 'config.yaml');
      const entry = configFor('continue', key, 'modelis-auto');

      try {
        fs.mkdirSync(dir, { recursive: true });
        if (!fs.existsSync(file)) {
          fs.writeFileSync(file, entry + '\n', 'utf8');
        } else {
          const current = fs.readFileSync(file, 'utf8');
          if (current.includes('name: Modelis')) {
            vscode.window.showInformationMessage('Modelis: already present in ~/.continue/config.yaml — opening it.');
          } else if (/^models:\s*$/m.test(current)) {
            const updated = current.replace(/^models:\s*$/m, entry);
            fs.writeFileSync(file, updated, 'utf8');
          } else {
            fs.writeFileSync(file, current.trimEnd() + '\n\n' + entry + '\n', 'utf8');
          }
        }
        const doc = await vscode.workspace.openTextDocument(file);
        await vscode.window.showTextDocument(doc);
        vscode.window.showInformationMessage('Modelis: review the inserted entry, then save.');
      } catch (err) {
        vscode.window.showErrorMessage(`Modelis: couldn't write ${file} — ${err.message}`);
      }
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate, configFor, MODELS, BASE_URL };
