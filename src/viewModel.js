import {marked} from "marked";
import {v4 as uuidv4} from "uuid";

import {Doc} from "./model";
import {defaultMarkdownText} from "./defaultMarkdown";
import {formatDateStr, NON_EXISTENT_DOC_ID} from "./util";

import hidePreviewIcon from "./assets/icon-hide-preview.svg";
import showPreviewIcon from "./assets/icon-show-preview.svg";

export class DocItem {
  constructor(doc, onClickCallback) {
    this.doc = doc;
    this.element = this.createElement();
    this.onClickCallback = onClickCallback;
  }

  createElement() {
    let createdAt = formatDateStr(this.doc.createdAt);
    const div = document.createElement('div');
    div.id = `doc-${this.doc.id}`;
    div.className = 'my-doc-item';
    div.innerHTML = `
      <span class="doc-icon"></span>
      <div class="doc-name">
        <span class="doc-name-title">${createdAt}</span>
        <span class="doc-name-text">${this.doc.name}</span>
      </div>
    `;

    // Add an event listener to the element
    div.addEventListener('click', () => {
      this.handleClick();
    });

    return div;
  }

  handleClick() {
    console.log('Document clicked:', this.doc.id);

    // Additional click handling logic here
    if (this.onClickCallback) {
      this.onClickCallback(this.doc.id);
    }
  }

  // Method to append the element to a parent
  appendTo(parent) {
    parent.appendChild(this.element);
  }
}

export class DocStoreViewModel {
  constructor(docStore) {
    this.docStore = docStore;
    this.docsContainer = document.querySelector('.my-docs');
    this.showPreview = false;
  }

  // editor operations
  saveCurrentDoc() {
    if (this.docStore.isEmpty()) {
      return;
    }

    const editorArea = document.getElementById('markdown-editor');
    this.docStore.updateCurrentDocContent(editorArea.value);

    // save to local storage
    this.docStore.persistDocMap();
  }

  showDeleteConfirmationModal() {
    const deleteModal = document.getElementById('delete-confirmation-modal');
    deleteModal.style.display = 'flex';
  }

  hideDeleteConfirmationModal() {
    const deleteModal = document.getElementById('delete-confirmation-modal');
    deleteModal.style.display = 'none';
  }

  deleteCurrentDoc() {
    try {
      this.docStore.removeDoc(this.docStore.currentDocID);
      this.docStore.persistDocMap();
      this.renderMyDocList();
      this.updateEditor();
    } catch (e) {
      console.error('delete doc error:', e);
    } finally {
      const deleteModal = document.getElementById('delete-confirmation-modal');
      deleteModal.style.display = 'none';
    }
  }

  changeCurrentDocName(newDocName) {
    if (this.docStore.isEmpty()) {
      return;
    }

    let currentDoc = this.docStore.getCurrentDoc();
    if (newDocName === currentDoc.name) {
      return;
    }

    this.docStore.updateCurrentDocName(newDocName);
    this.docStore.persistDocMap();

    const docItem = document.getElementById(`doc-${this.docStore.currentDocID}`);
    docItem.querySelector('.doc-name-text').textContent = newDocName;

    console.log('Doc name updated:', newDocName);
  }

  addNewDocument() {
    let newDoc = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      name: 'untitled-document.md',
      content: '',
    };

    this.docStore.addDoc(newDoc);

    // save to local storage
    this.docStore.persistDocMap();

    // render my-doc list
    this.renderMyDocList();

    // render editor
    this.updateEditor();
  }

  // view methods
  renderMyDocList() {
    this.docsContainer.innerHTML = ''; // Clear existing content

    this.docStore.docMap.forEach(doc => {
      const docItem = new DocItem(doc, (docID) => {
        this.changeCurrentDoc(docID);
        this.updateEditor();
      });
      docItem.appendTo(this.docsContainer);
    });

    this.highlightCurrentDoc();
  }

  async updatePreview() {
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

  updateEditor() {
    // update editor
    const docNameInput = document.getElementById('current-doc-name');
    const editorArea = document.getElementById('markdown-editor');
    if (!this.docStore.isEmpty()) {
      let currentDoc = this.docStore.getCurrentDoc();
      editorArea.value = currentDoc.content;
      docNameInput.value = currentDoc.name;
    } else {
      editorArea.value = '';
      docNameInput.value = '';
    }

    // update preview
    this.updatePreview().catch(error => console.error('Error updating preview:', error))
  }

  changeCurrentDoc(newDocID) {
    this.removeHighlightDoc(this.docStore.currentDocID);
    this.docStore.setCurrentDoc(newDocID);
    this.highlightCurrentDoc();
  }

  removeHighlightDoc(docID) {
    if (this.docStore.isEmpty() || this.docStore.currentDocID === NON_EXISTENT_DOC_ID) {
      return;
    }

    const docItem = document.getElementById(`doc-${docID}`);
    if (docItem) {
      docItem.style.backgroundColor = 'transparent';
    }
  }

  highlightCurrentDoc() {
    if (this.docStore.isEmpty() || this.docStore.currentDocID === NON_EXISTENT_DOC_ID) {
      return;
    }

    const docItem = document.getElementById(`doc-${this.docStore.currentDocID}`);
    if (docItem) {
      docItem.style.backgroundColor = '#35393F';
    }
  }

  togglePreview() {
    this.showPreview = !this.showPreview;

    const markdownSection = document.querySelector('.markdown-section');
    const previewSection = document.querySelector('.preview-section');
    const previewIcons = document.querySelectorAll('.preview-icon .icon');

    const mediaQuery = window.matchMedia('(max-width: 600px)');

    if (this.showPreview) {
      previewIcons.forEach(icon => {
        icon.style.webkitMask = `url(${hidePreviewIcon}) no-repeat center / contain`;
        icon.style.mask = `url(${hidePreviewIcon}) no-repeat center / contain`;
      })

      markdownSection.style.display = 'none';
      if (mediaQuery.matches) {
        previewSection.style.display = 'block';
      }

    } else {
      previewIcons.forEach(icon => {
        icon.style.webkitMask = `url(${showPreviewIcon}) no-repeat center / contain`;
        icon.style.mask = `url(${showPreviewIcon}) no-repeat center / contain`;
      })

      markdownSection.style.display = 'flex';
      if (mediaQuery.matches) {
        previewSection.style.display = 'none';
      }
    }
  }

  onCurrentDocNameInputKeyDown(event) {
    if (event.key !== 'Enter' && event.key !== 'Escape') {
      return;
    }

    event.preventDefault();

    if (event.key === 'Enter') {
      this.changeCurrentDocName(event.target.value);
    } else if (event.key === 'Escape') {
      // reset the value
      if (this.docStore.getCurrentDoc()) {
        event.target.value = this.docStore.getCurrentDoc().name;
      } else {
        event.target.value = '';
      }
    }

    event.target.dataset.fromKeyDownEvent = 'true';
    event.target.blur();
  }

  onCurrentDocNameInputBlur(event) {
    if (event.target.dataset.fromKeyDownEvent === 'true') {
      // Clear the data attribute and exit the function early
      delete event.target.dataset.fromKeyDownEvent;
      return;
    }

    this.changeCurrentDocName(event.target.value);
  }

  loadDocMapFromLocalStorage() {
    let addDefaultData = () => {
      let defaultDoc = new Doc(uuidv4(), new Date().toISOString(), 'untitled-document.md', defaultMarkdownText);
      this.docStore.addDoc(defaultDoc);
      this.docStore.setCurrentDoc(defaultDoc.id);
      // save to local storage
      this.docStore.persistDocMap();
    }

    const localData = JSON.parse(localStorage.getItem('markdown-data'));
    if (!localData || localData.length === 0) {
      addDefaultData();
      return;
    }

    try {
      this.docStore.loadDocMap(localData);
    } catch (e) {
      console.error('load doc error:', e);
      addDefaultData();
    }
  }

  initializeFromLocalStorage() {
    // load data
    this.loadDocMapFromLocalStorage();

    // render my-doc list
    this.renderMyDocList();
    this.updateEditor();
  }
}