sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.root)}" @focusin="${this._onfocusin}" @keydown="${this._onkeydown}" @ui5-_press=${(0, _LitRenderer.ifDefined)(this.onItemPress)} @ui5-close=${(0, _LitRenderer.ifDefined)(this.onItemClose)} @ui5-toggle=${(0, _LitRenderer.ifDefined)(this.onItemToggle)} @ui5-_focused=${(0, _LitRenderer.ifDefined)(this.onItemFocused)} @ui5-_forward-after=${(0, _LitRenderer.ifDefined)(this.onForwardAfter)} @ui5-_forward-before=${(0, _LitRenderer.ifDefined)(this.onForwardBefore)} @ui5-_selection-requested=${(0, _LitRenderer.ifDefined)(this.onSelectionRequested)} @ui5-_focus-requested=${(0, _LitRenderer.ifDefined)(this.onFocusRequested)}><div class="ui5-list-scroll-container">${this.header.length ? block1.call(this, context, tags, suffix) : undefined}${this.shouldRenderH1 ? block2.call(this, context, tags, suffix) : undefined}${this.hasData ? block3.call(this, context, tags, suffix) : undefined}<span id="${(0, _LitRenderer.ifDefined)(this._id)}-modeLabel" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this.ariaLabelModeText)}</span><ul id="${(0, _LitRenderer.ifDefined)(this._id)}-listUl" class="ui5-list-ul" role="${(0, _LitRenderer.ifDefined)(this.accessibleRole)}" aria-label="${(0, _LitRenderer.ifDefined)(this.ariaLabelTxt)}" aria-labelledby="${(0, _LitRenderer.ifDefined)(this.ariaLabelledBy)}" aria-roledescription="${(0, _LitRenderer.ifDefined)(this.accessibleRoleDescription)}"><slot></slot>${this.showNoDataText ? block4.call(this, context, tags, suffix) : undefined}</ul>${this.growsWithButton ? block5.call(this, context, tags, suffix) : undefined}${this.footerText ? block6.call(this, context, tags, suffix) : undefined}${this.hasData ? block7.call(this, context, tags, suffix) : undefined}<span tabindex="-1" aria-hidden="true" class="ui5-list-end-marker"></span></div>${this.busy ? block8.call(this, context, tags, suffix) : undefined}</div> `;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`<slot name="header" />`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`<header id="${(0, _LitRenderer.ifDefined)(this.headerID)}" class="ui5-list-header">${(0, _LitRenderer.ifDefined)(this.headerText)}</header>`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(this._id)}-before" tabindex="0" role="none" class="ui5-list-focusarea"></div>`;
  }
  function block4(context, tags, suffix) {
    return (0, _LitRenderer.html)`<li id="${(0, _LitRenderer.ifDefined)(this._id)}-nodata" class="ui5-list-nodata"><div id="${(0, _LitRenderer.ifDefined)(this._id)}-nodata-text" class="ui5-list-nodata-text">${(0, _LitRenderer.ifDefined)(this.noDataText)}</div></li>`;
  }
  function block5(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div growing-button><div tabindex="0" role="button" id="${(0, _LitRenderer.ifDefined)(this._id)}-growing-btn" aria-labelledby="${(0, _LitRenderer.ifDefined)(this._id)}-growingButton-text" ?active="${this._loadMoreActive}" @click="${this._onLoadMoreClick}" @keydown="${this._onLoadMoreKeydown}" @keyup="${this._onLoadMoreKeyup}" @mousedown="${this._onLoadMoreMousedown}" @mouseup="${this._onLoadMoreMouseup}" growing-button-inner><span id="${(0, _LitRenderer.ifDefined)(this._id)}-growingButton-text" growing-button-text>${(0, _LitRenderer.ifDefined)(this._growingButtonText)}</span></div></div>`;
  }
  function block6(context, tags, suffix) {
    return (0, _LitRenderer.html)`<footer id="${(0, _LitRenderer.ifDefined)(this._id)}-footer" class="ui5-list-footer">${(0, _LitRenderer.ifDefined)(this.footerText)}</footer>`;
  }
  function block7(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(this._id)}-after" tabindex="0" role="none" class="ui5-list-focusarea"></div>`;
  }
  function block8(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div class="ui5-list-busy-row"><${(0, _LitRenderer.scopeTag)("ui5-busy-indicator", tags, suffix)} delay="${(0, _LitRenderer.ifDefined)(this.busyDelay)}" active size="Medium" class="ui5-list-busy-ind" style="${(0, _LitRenderer.styleMap)(this.styles.busyInd)}" data-sap-focus-ref></${(0, _LitRenderer.scopeTag)("ui5-busy-indicator", tags, suffix)}></div>` : (0, _LitRenderer.html)`<div class="ui5-list-busy-row"><ui5-busy-indicator delay="${(0, _LitRenderer.ifDefined)(this.busyDelay)}" active size="Medium" class="ui5-list-busy-ind" style="${(0, _LitRenderer.styleMap)(this.styles.busyInd)}" data-sap-focus-ref></ui5-busy-indicator></div>`;
  }
  var _default = block0;
  _exports.default = _default;
});