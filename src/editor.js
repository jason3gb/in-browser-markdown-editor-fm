import _ from "lodash";

import {marked} from "marked";
import {v4 as uuidv4} from "uuid";

import {defaultMarkdownText} from "./defaultMarkdown";
import hidePreviewIcon from './assets/icon-hide-preview.svg';
import showPreviewIcon from './assets/icon-show-preview.svg';

const NON_EXISTENT_DOC_ID = 'NON_EXISTENT_DOC_ID';

class Doc {
  constructor(id, createdAt, name, content) {
    this.id = id;
    this.createdAt = createdAt;
    this.name = name;
    this.content = content;
  }
}

class DocStore {
  constructor() {
    this.currentDocID = '';
    this.docMap = new Map();
  }

  getCurrentDoc() {
    return this.docMap.get(this.currentDocID);
  }

  addDoc(doc) {
    // Assuming each doc has an 'id' property
    this.docMap.set(doc.id, doc);
    this.setCurrentDoc(doc.id);
  }

  setCurrentDoc(docID) {
    this.currentDocID = docID;
  }

  updateCurrentDocName(newName) {
    let doc = this.docMap.get(this.currentDocID);
    if (doc) {
      // Assuming 'content' is a property of Doc objects
      doc.name = newName;
      this.docMap.set(this.currentDocID, doc); // Update the Map entry
    }
  }

  updateCurrentDocContent(newContent) {
    let doc = this.docMap.get(this.currentDocID);
    if (doc) {
      // Assuming 'content' is a property of Doc objects
      doc.content = newContent;
      this.docMap.set(this.currentDocID, doc); // Update the Map entry
    }
  }

  persistDocMap() {
    // save to local storage
    localStorage.setItem('markdown-data', JSON.stringify(Array.from(this.docMap.values())));
  }

  // If you need to remove a document
  removeDoc(docID) {
    this.docMap.delete(docID);

    // get the last doc_id in the map
    if (this.docMap.size > 0) {
      let lastDocID = Array.from(this.docMap.keys()).pop();
      this.setCurrentDoc(lastDocID);
    } else {
      this.setCurrentDoc(NON_EXISTENT_DOC_ID);
    }
  }

  isEmpty() {
    return this.docMap.size === 0;
  }

  loadDocMap(data) {
    if (data) {
      this.docMap = new Map(data.map(doc => [doc.id, doc]));
    }

    this.currentDocID = data[0].id;
  }

  renderMyDocList() {
    const docsContainer = document.querySelector('.my-docs');
    docsContainer.innerHTML = ''; // Clear existing content

    this.docMap.forEach(doc => {
      const docItem = new DocItem(doc);
      docItem.appendTo(docsContainer);
    });

    this.highlightCurrentDoc();
  }

  changeCurrentDoc(newDocID) {
    this.removeHighlightDoc(this.currentDocID);
    this.setCurrentDoc(newDocID);
    this.highlightCurrentDoc();
  }

  removeHighlightDoc(docID) {
    if (this.isEmpty() || this.currentDocID === NON_EXISTENT_DOC_ID) {
      return;
    }

    const docItem = document.getElementById(`doc-${this.currentDocID}`);
    docItem.style.backgroundColor = 'transparent';
  }

  highlightCurrentDoc() {
    if (this.isEmpty() || this.currentDocID === NON_EXISTENT_DOC_ID) {
      return;
    }

    const docItem = document.getElementById(`doc-${this.currentDocID}`);
    docItem.style.backgroundColor = '#35393F';
  }
}

const docStore = new DocStore();

class DocItem {
  constructor(doc) {
    this.doc = doc;
    this.element = this.createElement();
  }

  createElement() {
    const div = document.createElement('div');
    div.id = `doc-${this.doc.id}`;
    div.className = 'my-doc-item';
    div.innerHTML = `
      <span class="doc-icon"></span>
      <div class="doc-name">
        <span class="doc-name-title">Document Name</span>
        <span class="doc-name-text">${this.doc.name}</span>
      </div>
    `;

    // Add an event listener to the element
    div.addEventListener('click', () => {
      this.handleClick()
    });

    return div;
  }

  handleClick() {
    console.log('Document clicked:', this.doc.id);

    // Additional click handling logic here
    docStore.changeCurrentDoc(this.doc.id);

    updateEditor();
  }

  // Method to append the element to a parent
  appendTo(parent) {
    parent.appendChild(this.element);
  }
}

// Function to render all documents
function loadDocMapFromLocalStorage() {
  const localData = JSON.parse(localStorage.getItem('markdown-data'));

  try {
    docStore.loadDocMap(localData);
  } catch (e) {
    console.error('load doc error:', e);

    let defaultDoc = new Doc(uuidv4(), new Date().toISOString(), 'untitled-document.md', defaultMarkdownText);

    docStore.addDoc(defaultDoc);
    docStore.setCurrentDoc(defaultDoc.id);

    // save to local storage
    docStore.persistDocMap();
  }
}

function updateEditor() {
  // update editor
  const docNameInput = document.getElementById('current-doc-name');
  const editorArea = document.getElementById('markdown-editor');
  if (!docStore.isEmpty()) {
    let currentDoc = docStore.getCurrentDoc();
    editorArea.value = currentDoc.content;
    docNameInput.value = currentDoc.name;
  } else {
    editorArea.value = '';
    docNameInput.value = '';
  }

  // update preview
  updatePreview().catch(error => console.error('Error updating preview:', error));
}

async function updatePreview() {
  const editorArea = document.getElementById('markdown-editor');
  const previewArea = document.getElementById('markdown-preview');

  const markdownText = editorArea.value;

  try {
    const html = await marked.parse(markdownText);
    previewArea.innerHTML = html;
  } catch (error) {
    console.error('Error parsing markdown');
    previewArea.innerHTML = '<p>Error parsing markdown</p>';
  }
}

export function editorLoader() {

  // define all the selectors
  const editorArea = document.getElementById('markdown-editor');

  // add all listeners
  editorArea.addEventListener('input', () => {
    updatePreview().catch(error => console.error('Error updating preview:', error));
  });

  // Add
  let onAdd = () => {
    let newDoc = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      name: 'untitled-document.md',
      content: '',
    };

    docStore.addDoc(newDoc);

    // save to local storage
    docStore.persistDocMap();

    // render my-doc list
    docStore.renderMyDocList();

    // render editor
    updateEditor();

    // focus on the new doc
    const docNameInput = document.getElementById('current-doc-name');
    docNameInput.focus();
  }

  const addDocBtn = document.querySelector('.sidebar-operations .new-doc-button');
  addDocBtn.addEventListener('click', onAdd);

  // Delete
  let onDelete = () => {
    docStore.removeDoc(docStore.currentDocID);

    // save to local storage
    docStore.persistDocMap();

    // render my-doc list
    docStore.renderMyDocList();

    // render editor
    updateEditor();
  };

  const deleteDocBtn = document.getElementById('delete-icon');
  deleteDocBtn.addEventListener('click', onDelete);

  // Save
  let onSave = () => {
    docStore.updateCurrentDocContent(editorArea.value);

    // save to local storage
    docStore.persistDocMap();
  };
  const saveDocBtn = document.querySelector('.editor-navbar .save-btn');
  saveDocBtn.addEventListener('click', onSave);

  // Change Doc Name
  let onDocNameChange = (newDocName) => {
    if (docStore.isEmpty()) {
      return;
    }

    let currentDoc = docStore.getCurrentDoc();
    if (newDocName === currentDoc.name) {
      return;
    }

    docStore.updateCurrentDocName(newDocName);
    docStore.persistDocMap();

    console.log('Doc name updated:', newDocName);
  };

  const currentDocNameInput = document.getElementById('current-doc-name');
  currentDocNameInput.addEventListener('keydown', (event) => {
    // Check if either 'Enter' or 'Escape' key was pressed
    if (event.key !== 'Enter' && event.key !== 'Escape') {
      return;
    }

    event.preventDefault();

    if (event.key === 'Enter') {
      onDocNameChange(event.target.value);
    } else if (event.key === 'Escape') {
      // reset the value
      if (docStore.getCurrentDoc()) {
        event.target.value = docStore.getCurrentDoc().name;
      } else {
        event.target.value = '';
      }
    }

    event.target.dataset.fromKeyDownEvent = 'true';
    event.target.blur();
  });

  currentDocNameInput.addEventListener('blur', (event) => {
    if (event.target.dataset.fromKeyDownEvent === 'true') {
      // Clear the data attribute and exit the function early
      delete event.target.dataset.fromKeyDownEvent;
      return;
    }

    onDocNameChange(event.target.value);
  });

  // preview
  let onPreviewClick = (hidePreview) => {
    const markdownSection = document.querySelector('.markdown-section');
    const previewIcon = document.querySelector('#preview-icon>.icon');

    if (hidePreview) {
      previewIcon.style.webkitMask = `url(${hidePreviewIcon}) no-repeat center / contain`;
      previewIcon.style.mask = `url(${hidePreviewIcon}) no-repeat center / contain`;

      markdownSection.style.display = 'none';
    } else {
      previewIcon.style.webkitMask = `url(${showPreviewIcon}) no-repeat center / contain`;
      previewIcon.style.mask = `url(${showPreviewIcon}) no-repeat center / contain`;

      markdownSection.style.display = 'flex';
    }
  }

  let hidePreview = false;
  const previewIconBtn = document.getElementById('preview-icon');
  previewIconBtn.addEventListener('click', () => {
    hidePreview = !hidePreview;
    onPreviewClick(hidePreview);
  });

  // initial setup
  document.addEventListener('DOMContentLoaded', () => {
    // load data
    loadDocMapFromLocalStorage();

    // render my-doc list
    docStore.renderMyDocList();


    updateEditor();
  });
}
