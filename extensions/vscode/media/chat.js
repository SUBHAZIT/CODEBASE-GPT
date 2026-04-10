const vscode = acquireVsCodeApi();
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');

userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && userInput.value.trim()) {
    const text = userInput.value.trim();
    addMessage(text, 'user');
    userInput.value = '';
    
    // Send message to extension
    vscode.postMessage({
      command: 'sendMessage',
      text: text
    });
  }
});

function addMessage(text, role) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.textContent = text;
  chatContainer.appendChild(div);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

window.addEventListener('message', (event) => {
  const message = event.data;
  switch (message.command) {
    case 'receiveResponse':
      addMessage(message.text, 'ai');
      break;
  }
});
