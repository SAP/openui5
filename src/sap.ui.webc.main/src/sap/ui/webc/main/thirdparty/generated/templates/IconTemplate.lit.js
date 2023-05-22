sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<svg class="ui5-icon-root" part="root" tabindex="${(0, _LitRenderer.ifDefined)(this._tabIndex)}" dir="${(0, _LitRenderer.ifDefined)(this._dir)}" viewBox="${(0, _LitRenderer.ifDefined)(this.viewBox)}" role="${(0, _LitRenderer.ifDefined)(this.effectiveAccessibleRole)}" focusable="false" preserveAspectRatio="xMidYMid meet" aria-label="${(0, _LitRenderer.ifDefined)(this.effectiveAccessibleName)}" aria-hidden=${(0, _LitRenderer.ifDefined)(this.effectiveAriaHidden)} xmlns="http://www.w3.org/2000/svg" @focusin=${this._onfocusin} @focusout=${this._onfocusout} @keydown=${this._onkeydown} @keyup=${this._onkeyup}>${blockSVG1.call(this, context, tags, suffix)}</svg>`;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.svg)`<title id="${(0, _LitRenderer.ifDefined)(this._id)}-tooltip">${(0, _LitRenderer.ifDefined)(this.effectiveAccessibleName)}</title>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.svg)`${(0, _LitRenderer.ifDefined)(this.customSvg)}`;
  }
  function block3(context, tags, suffix, item, index) {
    return (0, _LitRenderer.svg)`<path d="${(0, _LitRenderer.ifDefined)(item)}"></path>`;
  }
  function blockSVG1(context, tags, suffix) {
    return (0, _LitRenderer.svg)`${this.hasIconTooltip ? block1.call(this, context, tags, suffix) : undefined}<g role="presentation">${this.customSvg ? block2.call(this, context, tags, suffix) : undefined}${(0, _LitRenderer.repeat)(this.pathData, (item, index) => item._id || index, (item, index) => block3.call(this, context, tags, suffix, item, index))}</g>`;
  }
  ;
  var _default = block0;
  _exports.default = _default;
});