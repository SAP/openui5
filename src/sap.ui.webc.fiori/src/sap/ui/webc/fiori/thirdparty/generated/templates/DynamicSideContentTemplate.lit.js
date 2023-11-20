sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-dsc-root" style="${(0, _LitRenderer.styleMap)(this.styles.root)}">${this._isSideContentFirst ? block1.call(this, context, tags, suffix) : block2.call(this, context, tags, suffix)}</div> `;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`<aside role="complementary" aria-label="${(0, _LitRenderer.ifDefined)(this.accInfo.label)}" class="${(0, _LitRenderer.classMap)(this.classes.side)}" style="${(0, _LitRenderer.styleMap)(this.styles.side)}"><slot name="sideContent"></slot></aside><div class="${(0, _LitRenderer.classMap)(this.classes.main)}" style="${(0, _LitRenderer.styleMap)(this.styles.main)}"><slot></slot></div>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.main)}" style="${(0, _LitRenderer.styleMap)(this.styles.main)}"><slot></slot></div><aside role="complementary" aria-label="${(0, _LitRenderer.ifDefined)(this.accInfo.label)}" class="${(0, _LitRenderer.classMap)(this.classes.side)}" style="${(0, _LitRenderer.styleMap)(this.styles.side)}"><slot name="sideContent"></slot></aside>`;
  }
  var _default = block0;
  _exports.default = _default;
});