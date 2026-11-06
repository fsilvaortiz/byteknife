import '@byteknife/core/styles/fonts.css';
import '@byteknife/core/styles/tokens.css';
import '@byteknife/core/styles/base.css';
import '@byteknife/core/styles/app.css';
import './desktop.css';
import { render } from 'preact';
import App from './App';
import { keepNavigationInside } from './links';

keepNavigationInside(document);
render(<App />, document.getElementById('root')!);
