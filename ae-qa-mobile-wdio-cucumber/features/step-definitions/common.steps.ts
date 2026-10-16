import { Given } from '@wdio/cucumber-framework';
import { browser } from '../../utils/browser';

Given('el usuario navega al sitio de Automation Exercise', async () => {
  // En mobile no se maximiza ventana (la pantalla es fija).
  await browser.url('/');
  await browser.pause(2000);
});