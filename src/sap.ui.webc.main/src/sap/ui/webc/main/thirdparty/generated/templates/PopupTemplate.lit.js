sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<section style="${(0, _LitRenderer.styleMap)(context.styles.root)}" class="${(0, _LitRenderer.classMap)(context.classes.root)}" role="dialog" aria-modal="${(0, _LitRenderer.ifDefined)(context._ariaModal)}" aria-label="${(0, _LitRenderer.ifDefined)(context._ariaLabel)}" aria-labelledby="${(0, _LitRenderer.ifDefined)(context._ariaLabelledBy)}" @keydown=${context._onkeydown} @focusout=${context._onfocusout} @mouseup=${context._onmouseup} @mousedown=${context._onmousedown}><span class="first-fe" data-ui5-focus-trap tabindex="0" @focusin=${context.forwardToLast}></span><div style="${(0, _LitRenderer.styleMap)(context.styles.content)}" class="${(0, _LitRenderer.classMap)(context.classes.content)}"  @scroll="${context._scroll}" part="content"><slot></slot></div><span class="last-fe" data-ui5-focus-trap tabindex="0" @focusin=${context.forwardToFirst}></span></section> `;
  var _default = block0;
  _exports.default = _default;
});