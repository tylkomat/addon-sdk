/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const XUL = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';

/**
 * Creates a XUL `browser` element in a privileged document.
 * @params {nsIDOMDocument} document
 * @params {String} options.type
 *    By default is 'content' for possible values see:
 *    https://developer.mozilla.org/en/XUL/iframe#a-browser.type
 * @params {String} options.uri
 *    URI of the document to be loaded into created frame.
 * @params {Boolean} options.remote
 *    If `true` separate process will be used for this frame, also in such
 *    case all the following options are ignored.
 * @params {Boolean} options.allowAuth
 *    Whether to allow auth dialogs. Defaults to `false`.
 * @params {Boolean} options.allowJavascript
 *    Whether to allow Javascript execution. Defaults to `false`.
 * @params {Boolean} options.allowPlugins
 *    Whether to allow plugin execution. Defaults to `false`.
 */
function create(document, options) {
  options = options || {};
  let remote = 'remote' in options && options.remote === true;

  let frame = document.createElementNS(XUL, 'browser');
  // Type="content" is mandatory to enable stuff here:
  // http://mxr.mozilla.org/mozilla-central/source/content/base/src/nsFrameLoader.cpp#1776
  frame.setAttribute('type', options.type || 'content');
  frame.setAttribute('src', options.uri || 'about:blank');

  // Load in separate process if `options.remote` is `true`.
  // http://mxr.mozilla.org/mozilla-central/source/content/base/src/nsFrameLoader.cpp#1347
  if (remote) {
    // We remove XBL binding to avoid execution of code that is not going to
    // work because browser has no docShell attribute in remote mode
    // (for example)
    frame.setAttribute('style', '-moz-binding: none;');
    frame.setAttribute('remote', 'true');
  }

  document.documentElement.appendChild(frame);

  // If browser is remote it won't have a `docShell`.
  if (!remote) {
    let docShell = frame.docShell;
    docShell.allowAuth = options.allowAuth || false;
    docShell.allowJavascript = options.allowJavascript || false;
    docShell.allowPlugins = options.allowPlugins || false;
  }

  return frame;
}
exports.create = create;
