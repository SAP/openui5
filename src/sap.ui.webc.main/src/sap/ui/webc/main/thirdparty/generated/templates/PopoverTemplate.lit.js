sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<section style="${(0, _LitRenderer.styleMap)(this.styles.root)}" class="${(0, _LitRenderer.classMap)(this.classes.root)}" role="${(0, _LitRenderer.ifDefined)(this._role)}" aria-modal="${(0, _LitRenderer.ifDefined)(this._ariaModal)}" aria-label="${(0, _LitRenderer.ifDefined)(this._ariaLabel)}" aria-labelledby="${(0, _LitRenderer.ifDefined)(this._ariaLabelledBy)}" @keydown=${this._onkeydown} @focusout=${this._onfocusout} @mouseup=${this._onmouseup} @mousedown=${this._onmousedown}><span class="first-fe" data-ui5-focus-trap tabindex="0" @focusin=${this.forwardToLast}></span><span class="ui5-popover-arrow" style="${(0, _LitRenderer.styleMap)(this.styles.arrow)}"></span>${this._displayHeader ? block1.call(this, context, tags, suffix) : undefined}<div style="${(0, _LitRenderer.styleMap)(this.styles.content)}" class="${(0, _LitRenderer.classMap)(this.classes.content)}"  @scroll="${this._scroll}" part="content"><slot></slot></div>${this._displayFooter ? block4.call(this, context, tags, suffix) : undefined}<span class="last-fe" data-ui5-focus-trap tabindex="0" @focusin=${this.forwardToFirst}></span></section> `;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`<header class="ui5-popup-header-root" id="ui5-popup-header" part="header">${this.header.length ? block2.call(this, context, tags, suffix) : block3.call(this, context, tags, suffix)}</header>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`<slot name="header"></slot>`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)`<h1 class="ui5-popup-header-text">${(0, _LitRenderer.ifDefined)(this.headerText)}</h1>`;
  }
  function block4(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.footer.length ? block5.call(this, context, tags, suffix) : undefined}`;
  }
  function block5(context, tags, suffix) {
    return (0, _LitRenderer.html)`<footer class="ui5-popup-footer-root" part="footer"><slot name="footer"></slot></footer>`;
  }
  var _default = block0;
  _exports.default = _default;
});