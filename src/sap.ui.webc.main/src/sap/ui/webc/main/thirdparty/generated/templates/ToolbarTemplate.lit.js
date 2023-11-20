sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.items)}" role="${(0, _LitRenderer.ifDefined)(this.accInfo.root.role)}" aria-label="${(0, _LitRenderer.ifDefined)(this.accInfo.root.accessibleName)}">${(0, _LitRenderer.repeat)(this.standardItems, (item, index) => item._id || index, (item, index) => block1.call(this, context, tags, suffix, item, index))}<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} aria-hidden="${(0, _LitRenderer.ifDefined)(this.hideOverflowButton)}" icon="overflow" design="Transparent" class="${(0, _LitRenderer.classMap)(this.classes.overflowButton)}" tooltip="${(0, _LitRenderer.ifDefined)(this.accInfo.overflowButton.tooltip)}" accessible-name="${(0, _LitRenderer.ifDefined)(this.accInfo.overflowButton.accessibleName)}" .accessibilityAttributes=${(0, _LitRenderer.ifDefined)(this.accInfo.overflowButton.accessibilityAttributes)}></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}></div>` : (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.items)}" role="${(0, _LitRenderer.ifDefined)(this.accInfo.root.role)}" aria-label="${(0, _LitRenderer.ifDefined)(this.accInfo.root.accessibleName)}">${(0, _LitRenderer.repeat)(this.standardItems, (item, index) => item._id || index, (item, index) => block1.call(this, context, tags, suffix, item, index))}<ui5-button aria-hidden="${(0, _LitRenderer.ifDefined)(this.hideOverflowButton)}" icon="overflow" design="Transparent" class="${(0, _LitRenderer.classMap)(this.classes.overflowButton)}" tooltip="${(0, _LitRenderer.ifDefined)(this.accInfo.overflowButton.tooltip)}" accessible-name="${(0, _LitRenderer.ifDefined)(this.accInfo.overflowButton.accessibleName)}" .accessibilityAttributes=${(0, _LitRenderer.ifDefined)(this.accInfo.overflowButton.accessibilityAttributes)}></ui5-button></div>`;
  }
  function block1(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(item.toolbarTemplate)}`;
  }
  var _default = block0;
  _exports.default = _default;
});