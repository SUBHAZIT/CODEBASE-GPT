import { auth } from '@webcontainer/api';

export const initWebContainer = () => {
  auth.init({
    clientId: 'wc_api_team404found.hackathon_347d00a5ee39ddec72129db3ae3e01c9',
    scope: '',
  });
};

export const openInStackBlitz = (repoName: string, files: any[]) => {
  if (!files || files.length === 0) {
    alert("No file contents available to open in IDE. Please wait for indexing to complete.");
    return;
  }

  // Create project payload for StackBlitz POST API
  const project = {
    title: repoName,
    description: `CodebaseGPT export for ${repoName}`,
    template: 'node', // Default to node for modern web projects
    files: files.reduce((acc, file) => {
      // Ensure path doesn't start with / for StackBlitz
      const cleanPath = file.path.startsWith('/') ? file.path.slice(1) : file.path;
      acc[cleanPath] = file.content;
      return acc;
    }, {} as Record<string, string>),
  };

  // Create a hidden form to POST the data
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://stackblitz.com/run';
  form.target = '_blank';

  // Add metadata
  const addInput = (name: string, value: string) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  };

  addInput('project[title]', project.title);
  addInput('project[description]', project.description);
  addInput('project[template]', project.template);

  // Add files
  Object.entries(project.files).forEach(([path, content]) => {
    addInput(`project[files][${path}]`, content as string);
  });

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};
