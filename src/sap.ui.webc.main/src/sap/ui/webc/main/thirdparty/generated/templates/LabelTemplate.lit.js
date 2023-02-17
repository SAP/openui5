sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<label class="ui5-label-root" @click=${context._onclick} for="${(0, _LitRenderer.ifDefined)(context.for)}"><span class="${(0, _LitRenderer.classMap)(context.classes.textWrapper)}"><bdi id="${(0, _LitRenderer.ifDefined)(context._id)}-bdi"><slot></slot></bdi></span><span aria-hidden="true" class="ui5-label-required-colon"></span></label>`;
  var _default = block0;
  _exports.default = _default;
});