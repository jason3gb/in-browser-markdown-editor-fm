import {DocStore} from "./model";
import {DocStoreViewModel} from "./viewModel";

const docStore = new DocStore();
const docStoreViewModel = new DocStoreViewModel(docStore);


export function editorLoader() {

  // add all listeners
  const editorArea = document.getElementById('markdown-editor');
  editorArea.addEventListener('input', () => {
    docStoreViewModel.updatePreview().catch(error => console.error('Error updating preview:', error));
  });

  // Add
  const addDocBtn = document.querySelector('.sidebar-operations .new-doc-button');
  addDocBtn.addEventListener('click', () => {
    docStoreViewModel.addNewDocument();
  });

  // Delete
  const deleteConfirmBtn = document.getElementById('confirm-delete');
  deleteConfirmBtn.addEventListener('click', () => {
    docStoreViewModel.deleteCurrentDoc();
  });

  const deleteDocBtn = document.getElementById('delete-icon');
  deleteDocBtn.addEventListener('click', () => {
    docStoreViewModel.showDeleteConfirmationModal();
  });

  const deleteConfirmationModal = document.getElementById('delete-confirmation-modal');
  deleteConfirmationModal.addEventListener('click', (event) => {
    // Check if the click is outside the modal content
    if (event.target === deleteConfirmationModal) {
      docStoreViewModel.hideDeleteConfirmationModal();
    }
  });

  // Save
  const saveDocBtn = document.querySelector('.editor-navbar .save-btn');
  saveDocBtn.addEventListener('click', () => {
    docStoreViewModel.saveCurrentDoc();
  });

  // Change Doc Name
  const currentDocNameInput = document.getElementById('current-doc-name');
  currentDocNameInput.addEventListener('keydown', (event) => {
    docStoreViewModel.onCurrentDocNameInputKeyDown(event);
  });

// Function to remove the class that disables hover effects
  currentDocNameInput.addEventListener('blur', (event) => {
    docStoreViewModel.onCurrentDocNameInputBlur(event);
  });

  // preview
  const previewIconBtns = document.querySelectorAll('.preview-icon');
  previewIconBtns.forEach(btn => {
    btn.addEventListener('click', (event) => {
      docStoreViewModel.togglePreview();
    });
  });

  // initial setup
  document.addEventListener('DOMContentLoaded', () => {
    docStoreViewModel.initializeFromLocalStorage();
  });
}
