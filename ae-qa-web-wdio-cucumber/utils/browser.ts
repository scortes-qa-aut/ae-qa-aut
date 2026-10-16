import { browser as wdioBrowser } from '@wdio/globals';

/**
 * El tipo Browser de @wdio/globals en WDIO 9 no expone todos los métodos
 * estándar (url, maximizeWindow, takeScreenshot, getPageSource, etc.).
 * Este helper reexporta el browser real con tipo amplio para evitar
 * repetir `as any` en cada archivo.
 *
 * Si en el futuro WDIO arregla los tipos, solo hay que modificar este archivo.
 */
export const browser = wdioBrowser as any;