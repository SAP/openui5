sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-responsive-popover", tags, suffix)} id="${(0, _LitRenderer.ifDefined)(this._id)}-overflowMenu" horizontal-align="Right" placement-type="Bottom" content-only-on-desktop hide-arrow _hide-header class="ui5-tab-container-responsive-popover"><${(0, _LitRenderer.scopeTag)("ui5-list", tags, suffix)} mode="SingleSelect" separators="None" @ui5-item-click="${(0, _LitRenderer.ifDefined)(this._onOverflowListItemClick)}">${(0, _LitRenderer.repeat)(this._overflowItems, (item, index) => item._id || index, (item, index) => block1.call(this, context, tags, suffix, item, index))}</${(0, _LitRenderer.scopeTag)("ui5-list", tags, suffix)}><div slot="footer" class="ui5-responsive-popover-footer"><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} design="Transparent" @click="${this._closeRespPopover}">${(0, _LitRenderer.ifDefined)(this.popoverCancelButtonText)}</${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}></div></${(0, _LitRenderer.scopeTag)("ui5-responsive-popover", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-responsive-popover id="${(0, _LitRenderer.ifDefined)(this._id)}-overflowMenu" horizontal-align="Right" placement-type="Bottom" content-only-on-desktop hide-arrow _hide-header class="ui5-tab-container-responsive-popover"><ui5-list mode="SingleSelect" separators="None" @ui5-item-click="${(0, _LitRenderer.ifDefined)(this._onOverflowListItemClick)}">${(0, _LitRenderer.repeat)(this._overflowItems, (item, index) => item._id || index, (item, index) => block1.call(this, context, tags, suffix, item, index))}</ui5-list><div slot="footer" class="ui5-responsive-popover-footer"><ui5-button design="Transparent" @click="${this._closeRespPopover}">${(0, _LitRenderer.ifDefined)(this.popoverCancelButtonText)}</ui5-button></div></ui5-responsive-popover>`;
  }
  function block1(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(item.overflowPresentation)}`;
  }
  var _default = block0;
  _exports.default = _default;
});