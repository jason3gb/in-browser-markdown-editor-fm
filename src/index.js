// Import assets and styles
import "./styles/main.scss";
import images from './imageLoader'
import {defaultMarkdownText} from "./defaultMarkdown";

// Import other modules
import {themeLoader} from './theme';
themeLoader();

import {toolbarLoader} from "./toolbar";
toolbarLoader();

import {editorLoader} from "./editor";
editorLoader()
