sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* eslint no-unused-vars: 0 */
  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<svg class="ui5-icon-root" tabindex="${(0, _LitRenderer.ifDefined)(context.tabIndex)}" dir="${(0, _LitRenderer.ifDefined)(context._dir)}" viewBox="0 0 512 512" role="${(0, _LitRenderer.ifDefined)(context.effectiveAccessibleRole)}" focusable="false" preserveAspectRatio="xMidYMid meet" aria-label="${(0, _LitRenderer.ifDefined)(context.effectiveAccessibleName)}" aria-hidden=${(0, _LitRenderer.ifDefined)(context.effectiveAriaHidden)} xmlns="http://www.w3.org/2000/svg" @focusin=${context._onfocusin} @focusout=${context._onfocusout} @keydown=${context._onkeydown} @keyup=${context._onkeyup} @click=${context._onclick}>${blockSVG1(context, tags, suffix)}</svg>`;

  const block1 = (context, tags, suffix) => (0, _LitRenderer.svg)`<title id="${(0, _LitRenderer.ifDefined)(context._id)}-tooltip">${(0, _LitRenderer.ifDefined)(context.effectiveAccessibleName)}</title>`;

  const blockSVG1 = (context, tags, suffix) => (0, _LitRenderer.svg)`${context.hasIconTooltip ? block1(context, tags, suffix) : undefined}<g role="presentation"><path d="${(0, _LitRenderer.ifDefined)(context.pathData)}"/></g>`;

  var _default = block0;
  _exports.default = _default;
});