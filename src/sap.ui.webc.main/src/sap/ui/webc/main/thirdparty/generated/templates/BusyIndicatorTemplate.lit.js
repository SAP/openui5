sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.root)}">${this._isBusy ? block1.call(this, context, tags, suffix) : undefined}<slot></slot>${this._isBusy ? block3.call(this, context, tags, suffix) : undefined}</div>`;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-busy-indicator-busy-area" title="${(0, _LitRenderer.ifDefined)(this.ariaTitle)}" tabindex="0" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuetext="Busy" aria-labelledby="${(0, _LitRenderer.ifDefined)(this.labelId)}" data-sap-focus-ref><div class="ui5-busy-indicator-circles-wrapper"><div class="ui5-busy-indicator-circle circle-animation-0"></div><div class="ui5-busy-indicator-circle circle-animation-1"></div><div class="ui5-busy-indicator-circle circle-animation-2"></div></div>${this.text ? block2.call(this, context, tags, suffix) : undefined}</div>`;
  }
  function block2(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-label", tags, suffix)} id="${(0, _LitRenderer.ifDefined)(this._id)}-label" class="ui5-busy-indicator-text" wrapping-type="Normal">${(0, _LitRenderer.ifDefined)(this.text)}</${(0, _LitRenderer.scopeTag)("ui5-label", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-label id="${(0, _LitRenderer.ifDefined)(this._id)}-label" class="ui5-busy-indicator-text" wrapping-type="Normal">${(0, _LitRenderer.ifDefined)(this.text)}</ui5-label>`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span data-ui5-focus-redirect tabindex="0" @focusin="${this._redirectFocus}"></span>`;
  }
  var _default = block0;
  _exports.default = _default;
});