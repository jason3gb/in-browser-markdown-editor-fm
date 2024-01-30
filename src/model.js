import {NON_EXISTENT_DOC_ID} from "./util";

export class Doc {
  constructor(id, createdAt, name, content) {
    this.id = id;
    this.createdAt = createdAt;
    this.name = name;
    this.content = content;
  }
}


export class DocStore {
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
}


