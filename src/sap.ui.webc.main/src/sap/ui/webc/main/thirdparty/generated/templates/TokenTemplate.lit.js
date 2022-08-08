sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* eslint no-unused-vars: 0 */
  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div tabindex="${(0, _LitRenderer.ifDefined)(context._tabIndex)}" @click="${context._handleSelect}" @focusin="${context._focusin}" @focusout="${context._focusout}" @keydown="${context._keydown}" class="ui5-token--wrapper" role="option" aria-selected="${(0, _LitRenderer.ifDefined)(context.selected)}"><span class="ui5-token--text">${(0, _LitRenderer.ifDefined)(context.text)}</span>${!context.readonly ? block1(context, tags, suffix) : undefined}</div>`;

  const block1 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-token--icon" @click="${context._delete}">${context.closeIcon.length ? block2(context, tags, suffix) : block3(context, tags, suffix)}</div>`;

  const block2 = (context, tags, suffix) => (0, _LitRenderer.html)`<slot name="closeIcon"></slot>`;

  const block3 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name="${(0, _LitRenderer.ifDefined)(context.iconURI)}" accessible-name="${(0, _LitRenderer.ifDefined)(context.tokenDeletableText)}" show-tooltip></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon name="${(0, _LitRenderer.ifDefined)(context.iconURI)}" accessible-name="${(0, _LitRenderer.ifDefined)(context.tokenDeletableText)}" show-tooltip></ui5-icon>`;

  var _default = block0;
  _exports.default = _default;
});