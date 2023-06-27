sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-badge-root"><slot name="icon"></slot>${this.hasText ? block1.call(this, context, tags, suffix) : undefined}<span class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this.badgeDescription)}</span></div>`;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`<label class="ui5-badge-text"><bdi><slot></slot></bdi></label>`;
  }
  var _default = block0;
  _exports.default = _default;
});