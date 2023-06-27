sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-responsive-popover", tags, suffix)} horizontal-align="Center" placement-type="Bottom" aria-label="${(0, _LitRenderer.ifDefined)(this.actionSheetStepsText)}" class="${(0, _LitRenderer.classMap)(this.classes.popover)}" @ui5-after-close=${(0, _LitRenderer.ifDefined)(this._afterClosePopover)} content-only-on-desktop prevent-focus-restore _hide-header><ul class="ui5-wizard-responsive-popover-list">${(0, _LitRenderer.repeat)(this._groupedTabs, (item, index) => item._id || index, (item, index) => block1.call(this, context, tags, suffix, item, index))}</ul><div slot="footer" class="ui5-responsive-popover-footer"><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} design="Transparent" @click="${this._closeRespPopover}">Cancel</${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}></div></${(0, _LitRenderer.scopeTag)("ui5-responsive-popover", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-responsive-popover horizontal-align="Center" placement-type="Bottom" aria-label="${(0, _LitRenderer.ifDefined)(this.actionSheetStepsText)}" class="${(0, _LitRenderer.classMap)(this.classes.popover)}" @ui5-after-close=${(0, _LitRenderer.ifDefined)(this._afterClosePopover)} content-only-on-desktop prevent-focus-restore _hide-header><ul class="ui5-wizard-responsive-popover-list">${(0, _LitRenderer.repeat)(this._groupedTabs, (item, index) => item._id || index, (item, index) => block1.call(this, context, tags, suffix, item, index))}</ul><div slot="footer" class="ui5-responsive-popover-footer"><ui5-button design="Transparent" @click="${this._closeRespPopover}">Cancel</ui5-button></div></ui5-responsive-popover>`;
  }
  function block1(context, tags, suffix, item, index) {
    return suffix ? (0, _LitRenderer.html)`<li><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} icon="${(0, _LitRenderer.ifDefined)(item.icon)}" ?disabled="${item.disabled}" design="Transparent" data-ui5-header-tab-ref-id="${(0, _LitRenderer.ifDefined)(item.accInfo.ariaPosinset)}" @click="${this._onOverflowStepButtonClick}">${(0, _LitRenderer.ifDefined)(item.titleText)}</${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}></li>` : (0, _LitRenderer.html)`<li><ui5-button icon="${(0, _LitRenderer.ifDefined)(item.icon)}" ?disabled="${item.disabled}" design="Transparent" data-ui5-header-tab-ref-id="${(0, _LitRenderer.ifDefined)(item.accInfo.ariaPosinset)}" @click="${this._onOverflowStepButtonClick}">${(0, _LitRenderer.ifDefined)(item.titleText)}</ui5-button></li>`;
  }
  var _default = block0;
  _exports.default = _default;
});