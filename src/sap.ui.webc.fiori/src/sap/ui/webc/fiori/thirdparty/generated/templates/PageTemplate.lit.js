sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-page-root"><header class="ui5-page-header-root" id="ui5-page-header"><slot name="header"></slot></header><section part="content" class="ui5-page-content-root" style="${(0, _LitRenderer.styleMap)(this.styles.content)}"><slot></slot></section><footer class="ui5-page-footer-root" style="${(0, _LitRenderer.styleMap)(this.styles.footer)}"><slot name="footer"></slot></footer></div>`;
  }
  var _default = block0;
  _exports.default = _default;
});