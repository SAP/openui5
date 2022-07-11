sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* eslint no-unused-vars: 0 */
  const block0 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-responsive-popover", tags, suffix)} horizontal-align="Center" placement-type="Bottom" aria-label="${(0, _LitRenderer.ifDefined)(context.actionSheetStepsText)}" class="${(0, _LitRenderer.classMap)(context.classes.popover)}" @ui5-after-close=${(0, _LitRenderer.ifDefined)(context._afterClosePopover)} content-only-on-desktop prevent-focus-restore _hide-header><ul class="ui5-wizard-responsive-popover-list">${(0, _LitRenderer.repeat)(context._groupedTabs, (item, index) => item._id || index, (item, index) => block1(item, index, context, tags, suffix))}</ul><div slot="footer" class="ui5-responsive-popover-footer"><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} design="Transparent" @click="${context._closeRespPopover}">Cancel</${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}></div></${(0, _LitRenderer.scopeTag)("ui5-responsive-popover", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-responsive-popover horizontal-align="Center" placement-type="Bottom" aria-label="${(0, _LitRenderer.ifDefined)(context.actionSheetStepsText)}" class="${(0, _LitRenderer.classMap)(context.classes.popover)}" @ui5-after-close=${(0, _LitRenderer.ifDefined)(context._afterClosePopover)} content-only-on-desktop prevent-focus-restore _hide-header><ul class="ui5-wizard-responsive-popover-list">${(0, _LitRenderer.repeat)(context._groupedTabs, (item, index) => item._id || index, (item, index) => block1(item, index, context, tags, suffix))}</ul><div slot="footer" class="ui5-responsive-popover-footer"><ui5-button design="Transparent" @click="${context._closeRespPopover}">Cancel</ui5-button></div></ui5-responsive-popover>`;

  const block1 = (item, index, context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<li><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} icon="${(0, _LitRenderer.ifDefined)(item.icon)}" ?disabled="${item.disabled}" design="Transparent" data-ui5-header-tab-ref-id="${(0, _LitRenderer.ifDefined)(item.accInfo.ariaPosinset)}" @click="${context._onOverflowStepButtonClick}">${(0, _LitRenderer.ifDefined)(item.titleText)}</${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}></li>` : (0, _LitRenderer.html)`<li><ui5-button icon="${(0, _LitRenderer.ifDefined)(item.icon)}" ?disabled="${item.disabled}" design="Transparent" data-ui5-header-tab-ref-id="${(0, _LitRenderer.ifDefined)(item.accInfo.ariaPosinset)}" @click="${context._onOverflowStepButtonClick}">${(0, _LitRenderer.ifDefined)(item.titleText)}</ui5-button></li>`;

  var _default = block0;
  _exports.default = _default;
});