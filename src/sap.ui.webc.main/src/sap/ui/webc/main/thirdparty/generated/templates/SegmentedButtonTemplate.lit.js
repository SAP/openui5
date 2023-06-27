sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<ul @click="${this._onclick}" @mousedown="${this._onmousedown}" @keydown="${this._onkeydown}" @keyup="${this._onkeyup}" @focusin="${this._onfocusin}" class="ui5-segmented-button-root" role="listbox" aria-multiselectable="true" aria-describedby="${(0, _LitRenderer.ifDefined)(this._id)}-invisibleText" aria-roledescription=${(0, _LitRenderer.ifDefined)(this.ariaDescription)} aria-label=${(0, _LitRenderer.ifDefined)(this.accessibleName)}><slot></slot><span id="${(0, _LitRenderer.ifDefined)(this._id)}-invisibleText" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this.ariaDescribedBy)}</span></ul>`;
  }
  var _default = block0;
  _exports.default = _default;
});