sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-progress-indicator-root ${(0, _LitRenderer.classMap)(this.classes.root)}" role="progressbar" aria-valuemin="0" aria-valuenow="${(0, _LitRenderer.ifDefined)(this.validatedValue)}" aria-valuemax="100" aria-valuetext="${(0, _LitRenderer.ifDefined)(this.valueStateText)}" aria-disabled="${(0, _LitRenderer.ifDefined)(this._ariaDisabled)}" aria-label="${(0, _LitRenderer.ifDefined)(this.accessibleName)}"><div class="ui5-progress-indicator-bar" style="${(0, _LitRenderer.styleMap)(this.styles.bar)}">${!this.showValueInRemainingBar ? block1.call(this, context, tags, suffix) : undefined}</div><div class="ui5-progress-indicator-remaining-bar">${this.showValueInRemainingBar ? block6.call(this, context, tags, suffix) : undefined}</div></div>`;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.showIcon ? block2.call(this, context, tags, suffix) : undefined}${!this.hideValue ? block3.call(this, context, tags, suffix) : undefined}`;
  }
  function block2(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name="${(0, _LitRenderer.ifDefined)(this.valueStateIcon)}" class="ui5-progress-indicator-icon"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon name="${(0, _LitRenderer.ifDefined)(this.valueStateIcon)}" class="ui5-progress-indicator-icon"></ui5-icon>`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span class="ui5-progress-indicator-value">${this.displayValue ? block4.call(this, context, tags, suffix) : block5.call(this, context, tags, suffix)}</span>`;
  }
  function block4(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(this.displayValue)}`;
  }
  function block5(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(this.validatedValue)}% `;
  }
  function block6(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.showIcon ? block7.call(this, context, tags, suffix) : undefined}${!this.hideValue ? block8.call(this, context, tags, suffix) : undefined}`;
  }
  function block7(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name="${(0, _LitRenderer.ifDefined)(this.valueStateIcon)}" class="ui5-progress-indicator-icon"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon name="${(0, _LitRenderer.ifDefined)(this.valueStateIcon)}" class="ui5-progress-indicator-icon"></ui5-icon>`;
  }
  function block8(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span class="ui5-progress-indicator-value">${this.displayValue ? block9.call(this, context, tags, suffix) : block10.call(this, context, tags, suffix)}</span>`;
  }
  function block9(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(this.displayValue)}`;
  }
  function block10(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(this.validatedValue)}% `;
  }
  var _default = block0;
  _exports.default = _default;
});