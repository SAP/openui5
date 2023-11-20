sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.root)}" role="region" aria-label="${(0, _LitRenderer.ifDefined)(this._getAriaLabel)}">${this._hasHeader ? block1.call(this, context, tags, suffix) : undefined}<div role="group" aria-label="${(0, _LitRenderer.ifDefined)(this._ariaCardContentLabel)}"><slot></slot></div></div>`;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-card-header-root"><slot name="header"></slot></div>`;
  }
  var _default = block0;
  _exports.default = _default;
});