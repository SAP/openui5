sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} class="ui5-tb-button ui5-tb-item" id="${(0, _LitRenderer.ifDefined)(this.id)}" style="${(0, _LitRenderer.styleMap)(this.styles)}" icon="${(0, _LitRenderer.ifDefined)(this.icon)}" ?icon-end="${this.iconEnd}" tooltip="${(0, _LitRenderer.ifDefined)(this.tooltip)}" accessible-name="${(0, _LitRenderer.ifDefined)(this.accessibleName)}" accessible-name-ref="${(0, _LitRenderer.ifDefined)(this.accessibleNameRef)}" .accessibilityAttributes="${(0, _LitRenderer.ifDefined)(this.accessibilityAttributes)}" design="${(0, _LitRenderer.ifDefined)(this.design)}" ?disabled="${this.disabled}" ?hidden="${this.hidden}" data-ui5-external-action-item-id="${(0, _LitRenderer.ifDefined)(this._id)}" data-ui5-stable="${(0, _LitRenderer.ifDefined)(this.stableDomRef)}" .refItemId="${(0, _LitRenderer.ifDefined)(this._id)}">${(0, _LitRenderer.ifDefined)(this.text)}</${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button class="ui5-tb-button ui5-tb-item" id="${(0, _LitRenderer.ifDefined)(this.id)}" style="${(0, _LitRenderer.styleMap)(this.styles)}" icon="${(0, _LitRenderer.ifDefined)(this.icon)}" ?icon-end="${this.iconEnd}" tooltip="${(0, _LitRenderer.ifDefined)(this.tooltip)}" accessible-name="${(0, _LitRenderer.ifDefined)(this.accessibleName)}" accessible-name-ref="${(0, _LitRenderer.ifDefined)(this.accessibleNameRef)}" .accessibilityAttributes="${(0, _LitRenderer.ifDefined)(this.accessibilityAttributes)}" design="${(0, _LitRenderer.ifDefined)(this.design)}" ?disabled="${this.disabled}" ?hidden="${this.hidden}" data-ui5-external-action-item-id="${(0, _LitRenderer.ifDefined)(this._id)}" data-ui5-stable="${(0, _LitRenderer.ifDefined)(this.stableDomRef)}" .refItemId="${(0, _LitRenderer.ifDefined)(this._id)}">${(0, _LitRenderer.ifDefined)(this.text)}</ui5-button>`;
  }
  var _default = block0;
  _exports.default = _default;
});