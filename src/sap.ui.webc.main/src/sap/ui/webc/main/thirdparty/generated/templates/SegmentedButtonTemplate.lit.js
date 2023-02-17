sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<ul @click="${context._onclick}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" @focusin="${context._onfocusin}" class="ui5-segmented-button-root" role="listbox" aria-multiselectable="true" aria-describedby="${(0, _LitRenderer.ifDefined)(context._id)}-invisibleText" aria-roledescription=${(0, _LitRenderer.ifDefined)(context.ariaDescription)} aria-label=${(0, _LitRenderer.ifDefined)(context.accessibleName)}><slot></slot><span id="${(0, _LitRenderer.ifDefined)(context._id)}-invisibleText" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(context.ariaDescribedBy)}</span></ul>`;
  var _default = block0;
  _exports.default = _default;
});