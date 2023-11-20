sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<ul part="native-li" tabindex="${(0, _LitRenderer.ifDefined)(this._tabIndex)}" class="ui5-ghli-root ${(0, _LitRenderer.classMap)(this.classes.main)}" @focusin="${this._onfocusin}" @focusout="${this._onfocusout}" @keydown="${this._onkeydown}" aria-label="${(0, _LitRenderer.ifDefined)(this.ariaLabelText)}" aria-roledescription="${(0, _LitRenderer.ifDefined)(this.groupHeaderText)}" role="group"><div id="${(0, _LitRenderer.ifDefined)(this._id)}-content" class="ui5-li-content"><span class="ui5-ghli-title"><slot></slot></span></div></ul>`;
  }
  var _default = block0;
  _exports.default = _default;
});