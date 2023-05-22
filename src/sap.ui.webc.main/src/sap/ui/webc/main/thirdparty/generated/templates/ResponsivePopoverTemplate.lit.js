sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this._isPhone ? block1.call(this, context, tags, suffix) : block7.call(this, context, tags, suffix)}`;
  }
  function block1(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-dialog", tags, suffix)} accessible-name=${(0, _LitRenderer.ifDefined)(this.accessibleName)} accessible-name-ref=${(0, _LitRenderer.ifDefined)(this.accessibleNameRef)} accessible-role=${(0, _LitRenderer.ifDefined)(this.accessibleRole)} stretch _disable-initial-focus @ui5-before-open="${(0, _LitRenderer.ifDefined)(this._beforeDialogOpen)}" @ui5-after-open="${(0, _LitRenderer.ifDefined)(this._propagateDialogEvent)}" @ui5-before-close="${(0, _LitRenderer.ifDefined)(this._propagateDialogEvent)}" @ui5-after-close="${(0, _LitRenderer.ifDefined)(this._afterDialogClose)}" exportparts="content, header, footer">${!this._hideHeader ? block2.call(this, context, tags, suffix) : undefined}<slot></slot><slot slot="footer" name="footer"></slot></${(0, _LitRenderer.scopeTag)("ui5-dialog", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-dialog accessible-name=${(0, _LitRenderer.ifDefined)(this.accessibleName)} accessible-name-ref=${(0, _LitRenderer.ifDefined)(this.accessibleNameRef)} accessible-role=${(0, _LitRenderer.ifDefined)(this.accessibleRole)} stretch _disable-initial-focus @ui5-before-open="${(0, _LitRenderer.ifDefined)(this._beforeDialogOpen)}" @ui5-after-open="${(0, _LitRenderer.ifDefined)(this._propagateDialogEvent)}" @ui5-before-close="${(0, _LitRenderer.ifDefined)(this._propagateDialogEvent)}" @ui5-after-close="${(0, _LitRenderer.ifDefined)(this._afterDialogClose)}" exportparts="content, header, footer">${!this._hideHeader ? block2.call(this, context, tags, suffix) : undefined}<slot></slot><slot slot="footer" name="footer"></slot></ui5-dialog>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.header.length ? block3.call(this, context, tags, suffix) : block4.call(this, context, tags, suffix)}`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)`<slot slot="header" name="header"></slot>`;
  }
  function block4(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.header)}" slot="header">${this.headerText ? block5.call(this, context, tags, suffix) : undefined}${!this._hideCloseButton ? block6.call(this, context, tags, suffix) : undefined}</div>`;
  }
  function block5(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-title", tags, suffix)} level="H2" class="ui5-popup-header-text ui5-responsive-popover-header-text">${(0, _LitRenderer.ifDefined)(this.headerText)}</${(0, _LitRenderer.scopeTag)("ui5-title", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-title level="H2" class="ui5-popup-header-text ui5-responsive-popover-header-text">${(0, _LitRenderer.ifDefined)(this.headerText)}</ui5-title>`;
  }
  function block6(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} icon="decline" design="Transparent" aria-label="${(0, _LitRenderer.ifDefined)(this._closeDialogAriaLabel)}" @click="${this.close}"></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button icon="decline" design="Transparent" aria-label="${(0, _LitRenderer.ifDefined)(this._closeDialogAriaLabel)}" @click="${this.close}"></ui5-button>`;
  }
  function block7(context, tags, suffix) {
    return (0, _LitRenderer.html)`<section style="${(0, _LitRenderer.styleMap)(this.styles.root)}" class="${(0, _LitRenderer.classMap)(this.classes.root)}" role="${(0, _LitRenderer.ifDefined)(this._role)}" aria-modal="${(0, _LitRenderer.ifDefined)(this._ariaModal)}" aria-label="${(0, _LitRenderer.ifDefined)(this._ariaLabel)}" aria-labelledby="${(0, _LitRenderer.ifDefined)(this._ariaLabelledBy)}" @keydown=${this._onkeydown} @focusout=${this._onfocusout} @mouseup=${this._onmouseup} @mousedown=${this._onmousedown}><span class="first-fe" data-ui5-focus-trap tabindex="0" @focusin=${this.forwardToLast}></span><span class="ui5-popover-arrow" style="${(0, _LitRenderer.styleMap)(this.styles.arrow)}"></span>${this._displayHeader ? block8.call(this, context, tags, suffix) : undefined}<div style="${(0, _LitRenderer.styleMap)(this.styles.content)}" class="${(0, _LitRenderer.classMap)(this.classes.content)}"  @scroll="${this._scroll}" part="content"><slot></slot></div>${this._displayFooter ? block11.call(this, context, tags, suffix) : undefined}<span class="last-fe" data-ui5-focus-trap tabindex="0" @focusin=${this.forwardToFirst}></span></section>`;
  }
  function block8(context, tags, suffix) {
    return (0, _LitRenderer.html)`<header class="ui5-popup-header-root" id="ui5-popup-header" part="header">${this.header.length ? block9.call(this, context, tags, suffix) : block10.call(this, context, tags, suffix)}</header>`;
  }
  function block9(context, tags, suffix) {
    return (0, _LitRenderer.html)`<slot name="header"></slot>`;
  }
  function block10(context, tags, suffix) {
    return (0, _LitRenderer.html)`<h1 class="ui5-popup-header-text">${(0, _LitRenderer.ifDefined)(this.headerText)}</h1>`;
  }
  function block11(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.footer.length ? block12.call(this, context, tags, suffix) : undefined}`;
  }
  function block12(context, tags, suffix) {
    return (0, _LitRenderer.html)`<footer class="ui5-popup-footer-root" part="footer"><slot name="footer"></slot></footer>`;
  }
  var _default = block0;
  _exports.default = _default;
});