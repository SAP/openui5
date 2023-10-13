sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} icon="${(0, _LitRenderer.ifDefined)(this.icon)}" ?icon-end="${this.iconEnd}" accessible-name="${(0, _LitRenderer.ifDefined)(this.accessibleName)}" accessible-name-ref="${(0, _LitRenderer.ifDefined)(this.accessibleNameRef)}" .accessibilityAttributes="${(0, _LitRenderer.ifDefined)(this.accessibilityAttributes)}" tooltip="${(0, _LitRenderer.ifDefined)(this.tooltip)}" design="${(0, _LitRenderer.ifDefined)(this.design)}" ?disabled="${this.disabled}" ?hidden="${this.hidden}" class="ui5-tb-popover-button ui5-tb-popover-item" data-ui5-external-action-item-id="${(0, _LitRenderer.ifDefined)(this._id)}" data-ui5-stable="${(0, _LitRenderer.ifDefined)(this.stableDomRef)}">${(0, _LitRenderer.ifDefined)(this.text)}</${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button icon="${(0, _LitRenderer.ifDefined)(this.icon)}" ?icon-end="${this.iconEnd}" accessible-name="${(0, _LitRenderer.ifDefined)(this.accessibleName)}" accessible-name-ref="${(0, _LitRenderer.ifDefined)(this.accessibleNameRef)}" .accessibilityAttributes="${(0, _LitRenderer.ifDefined)(this.accessibilityAttributes)}" tooltip="${(0, _LitRenderer.ifDefined)(this.tooltip)}" design="${(0, _LitRenderer.ifDefined)(this.design)}" ?disabled="${this.disabled}" ?hidden="${this.hidden}" class="ui5-tb-popover-button ui5-tb-popover-item" data-ui5-external-action-item-id="${(0, _LitRenderer.ifDefined)(this._id)}" data-ui5-stable="${(0, _LitRenderer.ifDefined)(this.stableDomRef)}">${(0, _LitRenderer.ifDefined)(this.text)}</ui5-button>`;
  }
  var _default = block0;
  _exports.default = _default;
});