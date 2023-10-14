sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-popover", tags, suffix)} class="ui5-overflow-popover" placement-type="Bottom" horizontal-align="Right" @ui5-after-close="${(0, _LitRenderer.ifDefined)(this.onOverflowPopoverClosed)}" @ui5-after-open="${(0, _LitRenderer.ifDefined)(this.onOverflowPopoverOpened)}" hide-arrow><div class="ui5-overflow-list ${(0, _LitRenderer.classMap)(this.classes.overflow)}">${(0, _LitRenderer.repeat)(this.overflowItems, (item, index) => item._id || index, (item, index) => block1.call(this, context, tags, suffix, item, index))}</div></${(0, _LitRenderer.scopeTag)("ui5-popover", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-popover class="ui5-overflow-popover" placement-type="Bottom" horizontal-align="Right" @ui5-after-close="${(0, _LitRenderer.ifDefined)(this.onOverflowPopoverClosed)}" @ui5-after-open="${(0, _LitRenderer.ifDefined)(this.onOverflowPopoverOpened)}" hide-arrow><div class="ui5-overflow-list ${(0, _LitRenderer.classMap)(this.classes.overflow)}">${(0, _LitRenderer.repeat)(this.overflowItems, (item, index) => item._id || index, (item, index) => block1.call(this, context, tags, suffix, item, index))}</div></ui5-popover>`;
  }
  function block1(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(item.toolbarPopoverTemplate)}`;
  }
  var _default = block0;
  _exports.default = _default;
});