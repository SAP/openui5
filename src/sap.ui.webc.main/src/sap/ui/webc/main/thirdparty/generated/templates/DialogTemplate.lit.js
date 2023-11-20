sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<section style="${(0, _LitRenderer.styleMap)(this.styles.root)}" class="${(0, _LitRenderer.classMap)(this.classes.root)}" role="${(0, _LitRenderer.ifDefined)(this._role)}" aria-modal="${(0, _LitRenderer.ifDefined)(this._ariaModal)}" aria-label="${(0, _LitRenderer.ifDefined)(this._ariaLabel)}" aria-labelledby="${(0, _LitRenderer.ifDefined)(this._ariaLabelledBy)}" @keydown=${this._onkeydown} @focusout=${this._onfocusout} @mouseup=${this._onmouseup} @mousedown=${this._onmousedown}><span class="first-fe" data-ui5-focus-trap tabindex="0" @focusin=${this.forwardToLast}></span>${this._displayHeader ? block1.call(this, context, tags, suffix) : undefined}<div style="${(0, _LitRenderer.styleMap)(this.styles.content)}" class="${(0, _LitRenderer.classMap)(this.classes.content)}"  @scroll="${this._scroll}" part="content"><slot></slot></div>${this.footer.length ? block10.call(this, context, tags, suffix) : undefined}${this._showResizeHandle ? block11.call(this, context, tags, suffix) : undefined}<span class="last-fe" data-ui5-focus-trap tabindex="0" @focusin=${this.forwardToFirst}></span></section> `;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`<header><div class="ui5-popup-header-root" id="ui5-popup-header" role="group" aria-describedby=${(0, _LitRenderer.ifDefined)(this.effectiveAriaDescribedBy)} aria-roledescription=${(0, _LitRenderer.ifDefined)(this.ariaRoleDescriptionHeaderText)} tabindex="${(0, _LitRenderer.ifDefined)(this._headerTabIndex)}" @keydown="${this._onDragOrResizeKeyDown}" @mousedown="${this._onDragMouseDown}" part="header" state="${(0, _LitRenderer.ifDefined)(this.state)}">${this.hasValueState ? block2.call(this, context, tags, suffix) : undefined}${this.header.length ? block3.call(this, context, tags, suffix) : block4.call(this, context, tags, suffix)}${this.resizable ? block5.call(this, context, tags, suffix) : block8.call(this, context, tags, suffix)}</div></header>`;
  }
  function block2(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-dialog-value-state-icon" name="${(0, _LitRenderer.ifDefined)(this._dialogStateIcon)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon class="ui5-dialog-value-state-icon" name="${(0, _LitRenderer.ifDefined)(this._dialogStateIcon)}"></ui5-icon>`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)`<slot name="header"></slot>`;
  }
  function block4(context, tags, suffix) {
    return (0, _LitRenderer.html)`<h1 id="ui5-popup-header-text" class="ui5-popup-header-text">${(0, _LitRenderer.ifDefined)(this.headerText)}</h1>`;
  }
  function block5(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.draggable ? block6.call(this, context, tags, suffix) : block7.call(this, context, tags, suffix)}`;
  }
  function block6(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span id="${(0, _LitRenderer.ifDefined)(this._id)}-descr" aria-hidden="true" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this.ariaDescribedByHeaderTextDraggableAndResizable)}</span>`;
  }
  function block7(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span id="${(0, _LitRenderer.ifDefined)(this._id)}-descr" aria-hidden="true" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this.ariaDescribedByHeaderTextResizable)}</span>`;
  }
  function block8(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.draggable ? block9.call(this, context, tags, suffix) : undefined}`;
  }
  function block9(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span id="${(0, _LitRenderer.ifDefined)(this._id)}-descr" aria-hidden="true" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this.ariaDescribedByHeaderTextDraggable)}</span>`;
  }
  function block10(context, tags, suffix) {
    return (0, _LitRenderer.html)`<footer class="ui5-popup-footer-root" part="footer"><slot name="footer"></slot></footer>`;
  }
  function block11(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name="resize-corner" class="ui5-popup-resize-handle" @mousedown="${this._onResizeMouseDown}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-icon name="resize-corner" class="ui5-popup-resize-handle" @mousedown="${this._onResizeMouseDown}"></ui5-icon>`;
  }
  var _default = block0;
  _exports.default = _default;
});