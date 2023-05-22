sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-timeline-root" @focusin=${this._onfocusin} @keydown=${this._onkeydown}><div class="ui5-timeline-scroll-container"><ul class="ui5-timeline-list" aria-live="polite" aria-label="${(0, _LitRenderer.ifDefined)(this.ariaLabel)}">${(0, _LitRenderer.repeat)(this.items, (item, index) => item._id || index, (item, index) => block1.call(this, context, tags, suffix, item, index))}</ul></div></div>`;
  }
  function block1(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<li class="ui5-timeline-list-item"><slot name="${(0, _LitRenderer.ifDefined)(item._individualSlot)}"></slot></li>`;
  }
  var _default = block0;
  _exports.default = _default;
});