sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-tli-root" dir="${(0, _LitRenderer.ifDefined)(this.effectiveDir)}"><div class="${(0, _LitRenderer.classMap)(this.classes.indicator)}"><div class="ui5-tli-icon-outer">${this.icon ? block1.call(this, context, tags, suffix) : block2.call(this, context, tags, suffix)}</div></div><div class="ui5-tli-bubble" tabindex="${(0, _LitRenderer.ifDefined)(this._tabIndex)}" data-sap-focus-ref><div class="ui5-tli-title">${this.name ? block3.call(this, context, tags, suffix) : undefined}<span>${(0, _LitRenderer.ifDefined)(this.titleText)}</span></div><div class="ui5-tli-subtitle">${(0, _LitRenderer.ifDefined)(this.subtitleText)}</div>${this.textContent ? block6.call(this, context, tags, suffix) : undefined}<span class="${(0, _LitRenderer.classMap)(this.classes.bubbleArrowPosition)}"></span></div></div>`;
  }
  function block1(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-tli-icon" name="${(0, _LitRenderer.ifDefined)(this.icon)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon class="ui5-tli-icon" name="${(0, _LitRenderer.ifDefined)(this.icon)}"></ui5-icon>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-tli-dummy-icon-container"></div>`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.nameClickable ? block4.call(this, context, tags, suffix) : block5.call(this, context, tags, suffix)}`;
  }
  function block4(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-link", tags, suffix)} @ui5-click="${(0, _LitRenderer.ifDefined)(this.onNamePress)}" class="ui5-tli-title-name-clickable">${(0, _LitRenderer.ifDefined)(this.name)}&nbsp;</${(0, _LitRenderer.scopeTag)("ui5-link", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-link @ui5-click="${(0, _LitRenderer.ifDefined)(this.onNamePress)}" class="ui5-tli-title-name-clickable">${(0, _LitRenderer.ifDefined)(this.name)}&nbsp;</ui5-link>`;
  }
  function block5(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span class="ui5-tli-title-name">${(0, _LitRenderer.ifDefined)(this.name)}&nbsp;</span>`;
  }
  function block6(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-tli-desc"><slot></slot></div>`;
  }
  var _default = block0;
  _exports.default = _default;
});