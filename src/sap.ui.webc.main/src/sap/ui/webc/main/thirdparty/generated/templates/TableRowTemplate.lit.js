sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<tr class="ui5-table-row-root" tabindex="${(0, _LitRenderer.ifDefined)(this._tabIndex)}" @focusin="${this._onfocusin}" @focusout="${this._onfocusout}" @click="${this._onrowclick}" @keydown="${this._onkeydown}" @keyup="${this._onkeyup}" @mouseup="${this._onmouseup}" @touchstart="${this._ontouchstart}" @touchend="${this._ontouchend}" aria-label="${(0, _LitRenderer.ifDefined)(this.ariaLabelText)}" aria-selected="${(0, _LitRenderer.ifDefined)(this.selected)}" aria-current="${(0, _LitRenderer.ifDefined)(this._ariaCurrent)}" data-sap-focus-ref part="row">${this.isMultiSelect ? block1.call(this, context, tags, suffix) : undefined}${this.shouldPopin ? block2.call(this, context, tags, suffix) : block4.call(this, context, tags, suffix)}<td class="ui5-table-row-navigated" aria-hidden="true"><div class="ui5-table-div-navigated"></div></td></tr>${this.shouldPopin ? block6.call(this, context, tags, suffix) : undefined} `;
  }
  function block1(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<td class="ui5-table-multi-select-cell" aria-hidden="true" role="presentation"><${(0, _LitRenderer.scopeTag)("ui5-checkbox", tags, suffix)} class="ui5-multi-select-checkbox" ?checked="${this.selected}" aria-label="${(0, _LitRenderer.ifDefined)(this.ariaLabelRowSelection)}" @ui5-change="${(0, _LitRenderer.ifDefined)(this._handleSelection)}" tabindex="-1"></${(0, _LitRenderer.scopeTag)("ui5-checkbox", tags, suffix)}></td>` : (0, _LitRenderer.html)`<td class="ui5-table-multi-select-cell" aria-hidden="true" role="presentation"><ui5-checkbox class="ui5-multi-select-checkbox" ?checked="${this.selected}" aria-label="${(0, _LitRenderer.ifDefined)(this.ariaLabelRowSelection)}" @ui5-change="${(0, _LitRenderer.ifDefined)(this._handleSelection)}" tabindex="-1"></ui5-checkbox></td>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.repeat)(this.visibleCells, (item, index) => item._id || index, (item, index) => block3.call(this, context, tags, suffix, item, index))}`;
  }
  function block3(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<slot name="${(0, _LitRenderer.ifDefined)(item._individualSlot)}"></slot>`;
  }
  function block4(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.repeat)(this.cells, (item, index) => item._id || index, (item, index) => block5.call(this, context, tags, suffix, item, index))}`;
  }
  function block5(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<slot name="${(0, _LitRenderer.ifDefined)(item._individualSlot)}"></slot>`;
  }
  function block6(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.repeat)(this.popinCells, (item, index) => item._id || index, (item, index) => block7.call(this, context, tags, suffix, item, index))}`;
  }
  function block7(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<tr part="popin-row" class="${(0, _LitRenderer.ifDefined)(item.classes)}" @click="${this._onrowclick}" @keydown="${this._onkeydown}" @keyup="${this._onkeyup}"><td colspan="${(0, _LitRenderer.ifDefined)(this.visibleCellsCount)}" role="cell">${item.popinDisplayInline ? block8.call(this, context, tags, suffix, item, index) : block10.call(this, context, tags, suffix, item, index)}</td><td class="ui5-table-row-navigated" aria-hidden="true"><div class="ui5-table-div-navigated"></div></td></tr>`;
  }
  function block8(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<div class="ui5-table-display-inline-container">${item.popinText ? block9.call(this, context, tags, suffix, item, index) : undefined}<span class="ui5-table-cell-display-inline"><slot name="${(0, _LitRenderer.ifDefined)(item.cell._individualSlot)}"></slot></span></div>`;
  }
  function block9(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<span class="ui5-table-row-popin-title">${(0, _LitRenderer.ifDefined)(item.popinText)}:</span>`;
  }
  function block10(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${item.popinText ? block11.call(this, context, tags, suffix, item, index) : undefined}<div><slot name="${(0, _LitRenderer.ifDefined)(item.cell._individualSlot)}"></slot></div>`;
  }
  function block11(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<span class="ui5-table-row-popin-title">${(0, _LitRenderer.ifDefined)(item.popinText)}:</span>`;
  }
  var _default = block0;
  _exports.default = _default;
});