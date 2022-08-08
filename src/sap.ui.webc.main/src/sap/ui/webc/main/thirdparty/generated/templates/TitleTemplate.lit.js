sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* eslint no-unused-vars: 0 */
  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`${context.h1 ? block1(context, tags, suffix) : undefined}${context.h2 ? block2(context, tags, suffix) : undefined}${context.h3 ? block3(context, tags, suffix) : undefined}${context.h4 ? block4(context, tags, suffix) : undefined}${context.h5 ? block5(context, tags, suffix) : undefined}${context.h6 ? block6(context, tags, suffix) : undefined}`;

  const block1 = (context, tags, suffix) => (0, _LitRenderer.html)`<h1 class="ui5-title-root"><span id="${(0, _LitRenderer.ifDefined)(context._id)}-inner"><slot></slot></span></h1>`;

  const block2 = (context, tags, suffix) => (0, _LitRenderer.html)`<h2 class="ui5-title-root"><span id="${(0, _LitRenderer.ifDefined)(context._id)}-inner"><slot></slot></span></h2>`;

  const block3 = (context, tags, suffix) => (0, _LitRenderer.html)`<h3 class="ui5-title-root"><span id="${(0, _LitRenderer.ifDefined)(context._id)}-inner"><slot></slot></span></h3>`;

  const block4 = (context, tags, suffix) => (0, _LitRenderer.html)`<h4 class="ui5-title-root"><span id="${(0, _LitRenderer.ifDefined)(context._id)}-inner"><slot></slot></span></h4>`;

  const block5 = (context, tags, suffix) => (0, _LitRenderer.html)`<h5 class="ui5-title-root"><span id="${(0, _LitRenderer.ifDefined)(context._id)}-inner"><slot></slot></span></h5>`;

  const block6 = (context, tags, suffix) => (0, _LitRenderer.html)`<h6 class="ui5-title-root"><span id="${(0, _LitRenderer.ifDefined)(context._id)}-inner"><slot></slot></span></h6>`;

  var _default = block0;
  _exports.default = _default;
});