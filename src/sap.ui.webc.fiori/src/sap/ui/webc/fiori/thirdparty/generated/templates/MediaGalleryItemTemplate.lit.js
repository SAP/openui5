sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* eslint no-unused-vars: 0 */
  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-media-gallery-item-root" tabindex="${(0, _LitRenderer.ifDefined)(context.tabIndex)}" data-sap-focus-ref @focusout="${context._onfocusout}" @focusin="${context._onfocusin}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" role="${(0, _LitRenderer.ifDefined)(context._role)}"><div class="ui5-media-gallery-item-mask-layer"></div><div class="ui5-media-gallery-item-wrapper" style="${(0, _LitRenderer.styleMap)(context.styles.wrapper)}">${context._showBackgroundIcon ? block1(context, tags, suffix) : undefined}${context._useContent ? block2(context, tags, suffix) : undefined}${context._useThumbnail ? block3(context, tags, suffix) : undefined}</div></div>`;

  const block1 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name="background"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon name="background"></ui5-icon>`;

  const block2 = (context, tags, suffix) => (0, _LitRenderer.html)`<slot></slot>`;

  const block3 = (context, tags, suffix) => (0, _LitRenderer.html)`<slot name="thumbnail"></slot>`;

  var _default = block0;
  _exports.default = _default;
});