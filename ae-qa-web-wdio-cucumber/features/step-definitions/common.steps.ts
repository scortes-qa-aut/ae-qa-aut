import { Given } from '@wdio/cucumber-framework';
import { browser } from '../../utils/browser';

Given('el usuario navega al sitio de Automation Exercise', async () => {
  await browser.url('/');
  await browser.maximizeWindow();
});