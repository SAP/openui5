sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* eslint no-unused-vars: 0 */
  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-progress-indicator-root ${(0, _LitRenderer.classMap)(context.classes.root)}" role="progressbar" aria-valuemin="0" aria-valuenow="${(0, _LitRenderer.ifDefined)(context.validatedValue)}" aria-valuemax="100" aria-valuetext="${(0, _LitRenderer.ifDefined)(context.valueStateText)}" aria-disabled="${(0, _LitRenderer.ifDefined)(context._ariaDisabled)}"><div class="ui5-progress-indicator-bar" style="${(0, _LitRenderer.styleMap)(context.styles.bar)}">${!context.showValueInRemainingBar ? block1(context, tags, suffix) : undefined}</div><div class="ui5-progress-indicator-remaining-bar">${context.showValueInRemainingBar ? block6(context, tags, suffix) : undefined}</div></div>`;

  const block1 = (context, tags, suffix) => (0, _LitRenderer.html)`${context.showIcon ? block2(context, tags, suffix) : undefined}${!context.hideValue ? block3(context, tags, suffix) : undefined}`;

  const block2 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name="${(0, _LitRenderer.ifDefined)(context.valueStateIcon)}" class="ui5-progress-indicator-icon"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon name="${(0, _LitRenderer.ifDefined)(context.valueStateIcon)}" class="ui5-progress-indicator-icon"></ui5-icon>`;

  const block3 = (context, tags, suffix) => (0, _LitRenderer.html)`<span class="ui5-progress-indicator-value">${context.displayValue ? block4(context, tags, suffix) : block5(context, tags, suffix)}</span>`;

  const block4 = (context, tags, suffix) => (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(context.displayValue)}`;

  const block5 = (context, tags, suffix) => (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(context.validatedValue)}% `;

  const block6 = (context, tags, suffix) => (0, _LitRenderer.html)`${context.showIcon ? block7(context, tags, suffix) : undefined}${!context.hideValue ? block8(context, tags, suffix) : undefined}`;

  const block7 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name="${(0, _LitRenderer.ifDefined)(context.valueStateIcon)}" class="ui5-progress-indicator-icon"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon name="${(0, _LitRenderer.ifDefined)(context.valueStateIcon)}" class="ui5-progress-indicator-icon"></ui5-icon>`;

  const block8 = (context, tags, suffix) => (0, _LitRenderer.html)`<span class="ui5-progress-indicator-value">${context.displayValue ? block9(context, tags, suffix) : block10(context, tags, suffix)}</span>`;

  const block9 = (context, tags, suffix) => (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(context.displayValue)}`;

  const block10 = (context, tags, suffix) => (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(context.validatedValue)}% `;

  var _default = block0;
  _exports.default = _default;
});