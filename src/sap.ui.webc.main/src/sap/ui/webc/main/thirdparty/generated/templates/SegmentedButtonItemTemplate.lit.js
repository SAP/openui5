sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<li role="option" aria-roledescription="${(0, _LitRenderer.ifDefined)(context.ariaDescription)}" aria-posinset="${(0, _LitRenderer.ifDefined)(context.posInSet)}" aria-setsize="${(0, _LitRenderer.ifDefined)(context.sizeOfSet)}" aria-selected="${(0, _LitRenderer.ifDefined)(context.pressed)}" class="ui5-button-root" aria-disabled="${(0, _LitRenderer.ifDefined)(context.disabled)}" data-sap-focus-ref  @focusout=${context._onfocusout} @focusin=${context._onfocusin} @click=${context._onclick} @mousedown=${context._onmousedown} @mouseup=${context._onmouseup} @keydown=${context._onkeydown} @keyup=${context._onkeyup} @touchstart="${context._ontouchstart}" @touchend="${context._ontouchend}" tabindex=${(0, _LitRenderer.ifDefined)(context.tabIndexValue)} aria-label="${(0, _LitRenderer.ifDefined)(context.ariaLabelText)}" title="${(0, _LitRenderer.ifDefined)(context.tooltip)}">${context.icon ? block1(context, tags, suffix) : undefined}<span id="${(0, _LitRenderer.ifDefined)(context._id)}-content" class="ui5-button-text"><bdi><slot></slot></bdi></span></li> `;
  const block1 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-button-icon" name="${(0, _LitRenderer.ifDefined)(context.icon)}" part="icon" ?show-tooltip=${context.showIconTooltip}></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon class="ui5-button-icon" name="${(0, _LitRenderer.ifDefined)(context.icon)}" part="icon" ?show-tooltip=${context.showIconTooltip}></ui5-icon>`;
  var _default = block0;
  _exports.default = _default;
});