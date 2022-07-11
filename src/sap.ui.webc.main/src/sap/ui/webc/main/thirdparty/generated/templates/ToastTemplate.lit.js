sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* eslint no-unused-vars: 0 */
  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`${context.domRendered ? block1(context, tags, suffix) : undefined} `;

  const block1 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-toast-root" role="alert" style="${(0, _LitRenderer.styleMap)(context.styles.root)}" @mouseover="${context._onmouseover}" @mouseleave="${context._onmouseleave}" @transitionend="${context._ontransitionend}"><bdi><slot></slot></bdi></div>`;

  var _default = block0;
  _exports.default = _default;
});