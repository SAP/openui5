sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`${context.displayValueStateMessagePopover ? block1(context, tags, suffix) : undefined}`;
  const block1 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-popover", tags, suffix)} skip-registry-update prevent-focus-restore hide-arrow _disable-initial-focus class="ui5-valuestatemessage-popover" style="${(0, _LitRenderer.styleMap)(context.styles.valueStateMsgPopover)}" placement-type="Bottom" horizontal-align="${(0, _LitRenderer.ifDefined)(context._valueStatePopoverHorizontalAlign)}"><div slot="header" class="ui5-valuestatemessage-root ${(0, _LitRenderer.classMap)(context.classes.valueStateMsg)}"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-input-value-state-message-icon" name="${(0, _LitRenderer.ifDefined)(context._valueStateMessageIcon)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>${context.hasCustomValueState ? block2(context, tags, suffix) : block4(context, tags, suffix)}</div></${(0, _LitRenderer.scopeTag)("ui5-popover", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-popover skip-registry-update prevent-focus-restore hide-arrow _disable-initial-focus class="ui5-valuestatemessage-popover" style="${(0, _LitRenderer.styleMap)(context.styles.valueStateMsgPopover)}" placement-type="Bottom" horizontal-align="${(0, _LitRenderer.ifDefined)(context._valueStatePopoverHorizontalAlign)}"><div slot="header" class="ui5-valuestatemessage-root ${(0, _LitRenderer.classMap)(context.classes.valueStateMsg)}"><ui5-icon class="ui5-input-value-state-message-icon" name="${(0, _LitRenderer.ifDefined)(context._valueStateMessageIcon)}"></ui5-icon>${context.hasCustomValueState ? block2(context, tags, suffix) : block4(context, tags, suffix)}</div></ui5-popover>`;
  const block2 = (context, tags, suffix) => (0, _LitRenderer.html)`${(0, _LitRenderer.repeat)(context.valueStateMessageText, (item, index) => item._id || index, (item, index) => block3(item, index, context, tags, suffix))}`;
  const block3 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(item)}`;
  const block4 = (context, tags, suffix) => (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(context.valueStateText)}`;
  var _default = block0;
  _exports.default = _default;
});