sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-yp-root" role="grid" aria-roledescription="${(0, _LitRenderer.ifDefined)(this.roleDescription)}" aria-readonly="false" aria-multiselectable="false" @keydown=${this._onkeydown} @keyup=${this._onkeyup} @click=${this._selectYear}>${(0, _LitRenderer.repeat)(this._years, (item, index) => item._id || index, (item, index) => block1.call(this, context, tags, suffix, item, index))}</div>`;
  }
  function block1(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<div class="ui5-yp-interval-container">${(0, _LitRenderer.repeat)(item, (item, index) => item._id || index, (item, index) => block2.call(this, context, tags, suffix, item, index))}</div>`;
  }
  function block2(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<div data-sap-timestamp="${(0, _LitRenderer.ifDefined)(item.timestamp)}" tabindex="${(0, _LitRenderer.ifDefined)(item._tabIndex)}" ?data-sap-focus-ref="${item.focusRef}" class="${(0, _LitRenderer.ifDefined)(item.classes)}" role="gridcell" aria-selected="${(0, _LitRenderer.ifDefined)(item.ariaSelected)}"><span>${(0, _LitRenderer.ifDefined)(item.year)}</span>${item.yearInSecType ? block3.call(this, context, tags, suffix, item, index) : undefined}</div>`;
  }
  function block3(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<span class="ui5-yp-item-sec-type">${(0, _LitRenderer.ifDefined)(item.yearInSecType)}</span>`;
  }
  var _default = block0;
  _exports.default = _default;
});