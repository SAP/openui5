sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-select", tags, suffix)} class="ui5-tb-item" style="${(0, _LitRenderer.styleMap)(this.styles)}" data-ui5-external-action-item-id="${(0, _LitRenderer.ifDefined)(this._id)}" value-state="${(0, _LitRenderer.ifDefined)(this.valueState)}" ?disabled="${this.disabled}" accessible-name="${(0, _LitRenderer.ifDefined)(this.accessibleName)}" accessible-name-ref="${(0, _LitRenderer.ifDefined)(this.accessibleNameRef)}">${(0, _LitRenderer.repeat)(this.options, (item, index) => item._id || index, (item, index) => block1.call(this, context, tags, suffix, item, index))}</${(0, _LitRenderer.scopeTag)("ui5-select", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-select class="ui5-tb-item" style="${(0, _LitRenderer.styleMap)(this.styles)}" data-ui5-external-action-item-id="${(0, _LitRenderer.ifDefined)(this._id)}" value-state="${(0, _LitRenderer.ifDefined)(this.valueState)}" ?disabled="${this.disabled}" accessible-name="${(0, _LitRenderer.ifDefined)(this.accessibleName)}" accessible-name-ref="${(0, _LitRenderer.ifDefined)(this.accessibleNameRef)}">${(0, _LitRenderer.repeat)(this.options, (item, index) => item._id || index, (item, index) => block1.call(this, context, tags, suffix, item, index))}</ui5-select>`;
  }
  function block1(context, tags, suffix, item, index) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-option", tags, suffix)} ?selected="${item.selected}" data-ui5-external-action-item-index="${index}">${(0, _LitRenderer.ifDefined)(item.textContent)}</${(0, _LitRenderer.scopeTag)("ui5-option", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-option ?selected="${item.selected}" data-ui5-external-action-item-index="${index}">${(0, _LitRenderer.ifDefined)(item.textContent)}</ui5-option>`;
  }
  var _default = block0;
  _exports.default = _default;
});