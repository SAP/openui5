sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.domRendered ? block1.call(this, context, tags, suffix) : undefined} `;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-toast-root" role="alert" style="${(0, _LitRenderer.styleMap)(this.styles.root)}" tabindex="${(0, _LitRenderer.ifDefined)(this._tabindex)}" @focusin="${this._onfocusin}" @focusout="${this._onfocusout}" @keydown="${this._onkeydown}" @mouseover="${this._onmouseover}" @mouseleave="${this._onmouseleave}" @transitionend="${this._ontransitionend}"><bdi><slot></slot></bdi></div>`;
  }
  var _default = block0;
  _exports.default = _default;
});