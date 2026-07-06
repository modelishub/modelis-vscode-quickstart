// Modelis Quickstart — zero-dependency VS Code extension.
// Helps builders wire the Modelis LLM gateway (one key -> GPT/Claude/Gemini/DeepSeek/Grok/Qwen,
// flat pricing, OpenAI-compatible) into Cline / Roo Code / Zoo Code / Continue / Aider.
//
// No npm dependencies: only Node builtins + the `vscode` module supplied by the extension host.
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');

const SECRET_KEY = 'modelis.rapidApiKey';
const RAPIDAPI_SIGNUP_URL = 'https://rapidapi.com/chenxiao5580/api/modelis-auto-chat';

const TOOLS = [
  { label: 'Cline / Roo Code / Zoo Code (VS Code)', id: 'cline' },
  { label: 'Continue', id: 'continue' },
  { label: 'Aider', id: 'aider' },
  { label: 'Any OpenAI SDK (Python/JS)', id: 'sdk' },
];

function configFor(toolId, key) {
  const k = key || '<your-rapidapi-key>';
  switch (toolId) {
    case 'cline':
      return [
        'API Provider: OpenAI Compatible',
        'Base URL:     http://127.0.0.1:8787/v1',
        `API Key:      ${k}`,
        'Model ID:     modelis-auto',
      ].join('\n');
    case 'continue':
      return [
        'models:',
        '  - name: Modelis',
        '    provider: openai',
        '    model: modelis-auto',
        '    apiBase: http://127.0.0.1:8787/v1',
        `    apiKey: ${k}`,
      ].join('\n');
    case 'aider':
      return [
        'export OPENAI_API_BASE=http://127.0.0.1:8787/v1',
        `export OPENAI_API_KEY=${k}`,
        'aider --model openai/modelis-auto',
      ].join('\n');
    default:
      return [
        'from openai import OpenAI',
        `client = OpenAI(base_url="http://127.0.0.1:8787/v1", api_key="${k}")`,
        'client.chat.completions.create(model="modelis-auto",',
        '    messages=[{"role": "user", "content": "Hello"}])',
      ].join('\n');
  }
}

/** @param {vscode.ExtensionContext} context */
function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('modelis.setApiKey', async () => {
      const existing = await context.secrets.get(SECRET_KEY);
      const key = await vscode.window.showInputBox({
        prompt: 'Paste your Modelis RapidAPI key (get one free, no card)',
        password: true,
        ignoreFocusOut: true,
        value: existing || '',
        placeHolder: 'X-RapidAPI-Key value',
      });
      if (!key) return;
      await context.secrets.store(SECRET_KEY, key);
      vscode.window.showInformationMessage('Modelis: API key saved.');
    }),

    vscode.commands.registerCommand('modelis.showConfig', async () => {
      const pick = await vscode.window.showQuickPick(TOOLS, {
        placeHolder: 'Which tool are you configuring?',
      });
      if (!pick) return;

      let key = await context.secrets.get(SECRET_KEY);
      if (!key) {
        const open = 'Get a free key';
        const choice = await vscode.window.showInformationMessage(
          'No Modelis key saved yet. Showing config with a placeholder — run "Modelis: Set RapidAPI Key" once you have one.',
          open
        );
        if (choice === open) vscode.env.openExternal(vscode.Uri.parse(RAPIDAPI_SIGNUP_URL));
      }

      const text = configFor(pick.id, key);
      const copy = 'Copy to clipboard';
      const choice = await vscode.window.showInformationMessage(text, { modal: true }, copy);
      if (choice === copy) {
        await vscode.env.clipboard.writeText(text);
        vscode.window.showInformationMessage('Modelis: config copied to clipboard.');
      }
    }),

    vscode.commands.registerCommand('modelis.startProxy', async () => {
      const term =
        vscode.window.terminals.find((t) => t.name === 'Modelis Proxy') ||
        vscode.window.createTerminal('Modelis Proxy');
      term.show();
      term.sendText('npx modelis-openai');
      vscode.window.showInformationMessage(
        'Modelis: starting local proxy on http://127.0.0.1:8787 (needs Node 18+). Leave this terminal running.'
      );
    }),

    vscode.commands.registerCommand('modelis.writeContinueConfig', async () => {
      const key = (await context.secrets.get(SECRET_KEY)) || '<your-rapidapi-key>';
      const dir = path.join(os.homedir(), '.continue');
      const file = path.join(dir, 'config.yaml');
      const entry = configFor('continue', key);

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

module.exports = { activate, deactivate };
