sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<section style="${(0, _LitRenderer.styleMap)(this.styles.root)}" class="${(0, _LitRenderer.classMap)(this.classes.root)}" role="${(0, _LitRenderer.ifDefined)(this._role)}" aria-modal="${(0, _LitRenderer.ifDefined)(this._ariaModal)}" aria-label="${(0, _LitRenderer.ifDefined)(this._ariaLabel)}" aria-labelledby="${(0, _LitRenderer.ifDefined)(this._ariaLabelledBy)}" @keydown=${this._onkeydown} @focusout=${this._onfocusout} @mouseup=${this._onmouseup} @mousedown=${this._onmousedown}><span class="first-fe" data-ui5-focus-trap tabindex="0" @focusin=${this.forwardToLast}></span><div style="${(0, _LitRenderer.styleMap)(this.styles.content)}" class="${(0, _LitRenderer.classMap)(this.classes.content)}"  @scroll="${this._scroll}" part="content"><slot></slot></div><span class="last-fe" data-ui5-focus-trap tabindex="0" @focusin=${this.forwardToFirst}></span></section> `;
  }
  var _default = block0;
  _exports.default = _default;
});