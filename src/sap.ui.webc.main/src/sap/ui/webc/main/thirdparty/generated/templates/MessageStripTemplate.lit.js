sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(context.classes.root)}" id="${(0, _LitRenderer.ifDefined)(context._id)}" role="note" aria-live="assertive" aria-labelledby="${(0, _LitRenderer.ifDefined)(context._id)}">${!context.hideIcon ? block1(context, tags, suffix) : undefined}<span class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(context.hiddenText)}</span><span class="ui5-message-strip-text"><slot></slot></span>${!context.hideCloseButton ? block4(context, tags, suffix) : undefined}</div>`;
  const block1 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-message-strip-icon-wrapper" aria-hidden="true">${context.iconProvided ? block2(context, tags, suffix) : block3(context, tags, suffix)}</div>`;
  const block2 = (context, tags, suffix) => (0, _LitRenderer.html)`<slot name="icon"></slot>`;
  const block3 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name="${(0, _LitRenderer.ifDefined)(context.standardIconName)}" class="ui5-message-strip-icon"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon name="${(0, _LitRenderer.ifDefined)(context.standardIconName)}" class="ui5-message-strip-icon"></ui5-icon>`;
  const block4 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} icon="decline" design="Transparent" class="ui5-message-strip-close-button" tooltip="${(0, _LitRenderer.ifDefined)(context._closeButtonText)}" @click=${context._closeClick}></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button icon="decline" design="Transparent" class="ui5-message-strip-close-button" tooltip="${(0, _LitRenderer.ifDefined)(context._closeButtonText)}" @click=${context._closeClick}></ui5-button>`;
  var _default = block0;
  _exports.default = _default;
});