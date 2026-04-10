import * as vscode from 'vscode';
import { ChatPanel } from './chatPanel';
import { indexWorkspace } from './api';

export function activate(context: vscode.ExtensionContext) {
  console.log('CodebaseGPT is now active!');

  const indexCommand = vscode.commands.registerCommand('innofusion.indexWorkspace', async () => {
    const githubUrl = await vscode.window.showInputBox({
      prompt: "Enter the GitHub URL of this repository to index it",
      placeHolder: "https://github.com/owner/repo"
    });

    if (githubUrl) {
      vscode.window.showInformationMessage(`Indexing ${githubUrl}...`);
      try {
        const result = await indexWorkspace(githubUrl);
        if (result.error) {
          vscode.window.showErrorMessage(`Error: ${result.error}`);
        } else {
          vscode.window.showInformationMessage("Indexing started successfully!");
        }
      } catch (err: any) {
        vscode.window.showErrorMessage(`Failed to index: ${err.message}`);
      }
    }
  });

  const chatCommand = vscode.commands.registerCommand('innofusion.openChat', () => {
    ChatPanel.createOrShow(context.extensionUri);
  });

  context.subscriptions.push(indexCommand, chatCommand);

  // Register the Chat View
  const provider = new ChatViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(ChatViewProvider.viewType, provider)
  );
}

class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'innofusion.chatView';
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data: { command: string; text: string }) => {
      switch (data.command) {
        case 'sendMessage': {
          const { chat } = require('./api');
          try {
            const response = await chat([{ role: 'user', content: data.text }]);
            const result = await response.json();
            webviewView.webview.postMessage({
              command: 'receiveResponse',
              text: result.content
            });
          } catch (err: any) {
            webviewView.webview.postMessage({
              command: 'receiveResponse',
              text: `Error: ${err.message}`
            });
          }
          break;
        }
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'chat.css'));
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'chat.js'));

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <link href="${styleUri}" rel="stylesheet">
      </head>
      <body>
        <div class="header">
          <h1>CodebaseGPT AI</h1>
        </div>
        <div id="chat-container"></div>
        <div class="input-area">
          <input type="text" id="user-input" placeholder="Ask about your code..." />
        </div>
        <script src="${scriptUri}"></script>
      </body>
      </html>
    `;
  }
}

export function deactivate() {}
