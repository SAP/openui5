sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-media-gallery-item-root" tabindex="${(0, _LitRenderer.ifDefined)(this.effectiveTabIndex)}" data-sap-focus-ref @focusout="${this._onfocusout}" @focusin="${this._onfocusin}" @keydown="${this._onkeydown}" @keyup="${this._onkeyup}" role="${(0, _LitRenderer.ifDefined)(this._role)}"><div class="ui5-media-gallery-item-mask-layer"></div><div class="ui5-media-gallery-item-wrapper" style="${(0, _LitRenderer.styleMap)(this.styles.wrapper)}">${this._showBackgroundIcon ? block1.call(this, context, tags, suffix) : undefined}${this._useContent ? block2.call(this, context, tags, suffix) : undefined}${this._useThumbnail ? block3.call(this, context, tags, suffix) : undefined}</div></div>`;
  }
  function block1(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name="background"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon name="background"></ui5-icon>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`<slot></slot>`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)`<slot name="thumbnail"></slot>`;
  }
  var _default = block0;
  _exports.default = _default;
});