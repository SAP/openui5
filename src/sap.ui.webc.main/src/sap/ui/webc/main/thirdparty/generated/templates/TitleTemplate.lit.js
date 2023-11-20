sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.h1 ? block1.call(this, context, tags, suffix) : undefined}${this.h2 ? block2.call(this, context, tags, suffix) : undefined}${this.h3 ? block3.call(this, context, tags, suffix) : undefined}${this.h4 ? block4.call(this, context, tags, suffix) : undefined}${this.h5 ? block5.call(this, context, tags, suffix) : undefined}${this.h6 ? block6.call(this, context, tags, suffix) : undefined}`;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`<h1 class="ui5-title-root"><span id="${(0, _LitRenderer.ifDefined)(this._id)}-inner"><slot></slot></span></h1>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`<h2 class="ui5-title-root"><span id="${(0, _LitRenderer.ifDefined)(this._id)}-inner"><slot></slot></span></h2>`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)`<h3 class="ui5-title-root"><span id="${(0, _LitRenderer.ifDefined)(this._id)}-inner"><slot></slot></span></h3>`;
  }
  function block4(context, tags, suffix) {
    return (0, _LitRenderer.html)`<h4 class="ui5-title-root"><span id="${(0, _LitRenderer.ifDefined)(this._id)}-inner"><slot></slot></span></h4>`;
  }
  function block5(context, tags, suffix) {
    return (0, _LitRenderer.html)`<h5 class="ui5-title-root"><span id="${(0, _LitRenderer.ifDefined)(this._id)}-inner"><slot></slot></span></h5>`;
  }
  function block6(context, tags, suffix) {
    return (0, _LitRenderer.html)`<h6 class="ui5-title-root"><span id="${(0, _LitRenderer.ifDefined)(this._id)}-inner"><slot></slot></span></h6>`;
  }
  var _default = block0;
  _exports.default = _default;
});