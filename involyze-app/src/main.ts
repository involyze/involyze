import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import '@fontsource-variable/heebo';

mount(App, {
  target: document.getElementById('app')!,
});
