import _ from "lodash";
import {marked} from 'marked';

// Import assets and styles
import "./styles/main.scss";
import images from './imageLoader'
import {defaultMarkdownText} from "./defaultMarkdown";

// Import other modules
import {themeLoader} from './theme';
themeLoader();

import {toolbarLoader} from "./toolbar";
toolbarLoader();

// Cache DOM elements
const editorArea = document.getElementById('markdown-editor');
const previewArea = document.getElementById('markdown-preview');

editorArea.value = defaultMarkdownText;

// Function to update the preview
async function updatePreview() {
  const markdownText = editorArea.value;

  try {
    const html = await marked.parse(markdownText);
    previewArea.innerHTML = html;
  } catch (error) {
    console.error('Error parsing markdown');
    previewArea.innerHTML = '<p>Error parsing markdown</p>';
  }
}

// Event listener for textarea changes
editorArea.addEventListener('input', () => {
  updatePreview().catch(error => console.error('Error updating preview:', error));
});

// Initial call to update the preview
updatePreview().catch(error => console.error('Error during initial markdown parsing:', error));
