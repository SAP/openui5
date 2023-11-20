sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-popover", tags, suffix)} skip-registry-update _disable-initial-focus prevent-focus-restore hide-arrow class="ui5-valuestatemessage-popover" placement-type="Bottom" horizontal-align="Left"><div slot="header" class="${(0, _LitRenderer.classMap)(this.classes.popoverValueState)}" style="${(0, _LitRenderer.styleMap)(this.styles.popoverHeader)}">${this._valueStateMessageInputIcon ? block1.call(this, context, tags, suffix) : undefined}${this.shouldDisplayDefaultValueStateMessage ? block2.call(this, context, tags, suffix) : block3.call(this, context, tags, suffix)}</div></${(0, _LitRenderer.scopeTag)("ui5-popover", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-popover skip-registry-update _disable-initial-focus prevent-focus-restore hide-arrow class="ui5-valuestatemessage-popover" placement-type="Bottom" horizontal-align="Left"><div slot="header" class="${(0, _LitRenderer.classMap)(this.classes.popoverValueState)}" style="${(0, _LitRenderer.styleMap)(this.styles.popoverHeader)}">${this._valueStateMessageInputIcon ? block1.call(this, context, tags, suffix) : undefined}${this.shouldDisplayDefaultValueStateMessage ? block2.call(this, context, tags, suffix) : block3.call(this, context, tags, suffix)}</div></ui5-popover>`;
  }
  function block1(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-input-value-state-message-icon" name="${(0, _LitRenderer.ifDefined)(this._valueStateMessageInputIcon)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon class="ui5-input-value-state-message-icon" name="${(0, _LitRenderer.ifDefined)(this._valueStateMessageInputIcon)}"></ui5-icon>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(this.valueStateText)}`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.repeat)(this.valueStateMessageText, (item, index) => item._id || index, (item, index) => block4.call(this, context, tags, suffix, item, index))}`;
  }
  function block4(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(item)}`;
  }
  var _default = block0;
  _exports.default = _default;
});