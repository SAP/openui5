sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-table-root" @ui5-selection-requested="${(0, _LitRenderer.ifDefined)(this._handleSelect)}" @ui5-_forward-after="${(0, _LitRenderer.ifDefined)(this._onForwardAfter)}" @ui5-_forward-before="${(0, _LitRenderer.ifDefined)(this._onForwardBefore)}" @focusin="${this._onfocusin}"><div id="${(0, _LitRenderer.ifDefined)(this._id)}-before" tabindex="0" class="ui5-table-focusarea"></div>${this.busy ? block1.call(this, context, tags, suffix) : undefined}<table border="0" cellspacing="0" cellpadding="0" @keydown="${this._onkeydown}" role="table" aria-label="${(0, _LitRenderer.ifDefined)(this.tableAriaLabelText)}"><thead><tr id="${(0, _LitRenderer.ifDefined)(this._columnHeader.id)}" class="ui5-table-header-row" aria-label="${(0, _LitRenderer.ifDefined)(this.ariaLabelText)}" tabindex="${(0, _LitRenderer.ifDefined)(this._columnHeader._tabIndex)}" @click="${this._onColumnHeaderClick}" @focusin="${this._onColumnHeaderFocused}" @keydown="${this._onColumnHeaderKeydown}">${this.isMultiSelect ? block2.call(this, context, tags, suffix) : undefined}${(0, _LitRenderer.repeat)(this.visibleColumns, (item, index) => item._id || index, (item, index) => block4.call(this, context, tags, suffix, item, index))}<th class="ui5-table-header-row-navigated" aria-hidden="true"></th></tr></thead><tbody>${(0, _LitRenderer.repeat)(this.rows, (item, index) => item._id || index, (item, index) => block5.call(this, context, tags, suffix, item, index))}${!this.rows.length ? block6.call(this, context, tags, suffix) : undefined}${this.growsWithButton ? block8.call(this, context, tags, suffix) : undefined}${this.growsOnScroll ? block10.call(this, context, tags, suffix) : undefined}</tbody></table><div id="${(0, _LitRenderer.ifDefined)(this._id)}-after" tabindex="0" class="ui5-table-focusarea"></div></div> `;
  }
  function block1(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div tabindex="-1" class="ui5-table-busy-row"><${(0, _LitRenderer.scopeTag)("ui5-busy-indicator", tags, suffix)} delay="${(0, _LitRenderer.ifDefined)(this.busyDelay)}" class="ui5-table-busy-ind" style="${(0, _LitRenderer.styleMap)(this.styles.busy)}" active size="Medium" data-sap-focus-ref></${(0, _LitRenderer.scopeTag)("ui5-busy-indicator", tags, suffix)}></div>` : (0, _LitRenderer.html)`<div tabindex="-1" class="ui5-table-busy-row"><ui5-busy-indicator delay="${(0, _LitRenderer.ifDefined)(this.busyDelay)}" class="ui5-table-busy-ind" style="${(0, _LitRenderer.styleMap)(this.styles.busy)}" active size="Medium" data-sap-focus-ref></ui5-busy-indicator></div>`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`<th class="ui5-table-select-all-column" role="presentation" aria-hidden="true">${this.rows.length ? block3.call(this, context, tags, suffix) : undefined}</th>`;
  }
  function block3(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-checkbox", tags, suffix)} class="ui5-table-select-all-checkbox" ?checked="${this._allRowsSelected}" @ui5-change="${(0, _LitRenderer.ifDefined)(this._selectAll)}" aria-label="${(0, _LitRenderer.ifDefined)(this.ariaLabelSelectAllText)}" tabindex="-1"></${(0, _LitRenderer.scopeTag)("ui5-checkbox", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-checkbox class="ui5-table-select-all-checkbox" ?checked="${this._allRowsSelected}" @ui5-change="${(0, _LitRenderer.ifDefined)(this._selectAll)}" aria-label="${(0, _LitRenderer.ifDefined)(this.ariaLabelSelectAllText)}" tabindex="-1"></ui5-checkbox>`;
  }
  function block4(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<slot name="${(0, _LitRenderer.ifDefined)(item._individualSlot)}"></slot>`;
  }
  function block5(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<slot name="${(0, _LitRenderer.ifDefined)(item._individualSlot)}"></slot>`;
  }
  function block6(context, tags, suffix) {
    return (0, _LitRenderer.html)`${!this.hideNoData ? block7.call(this, context, tags, suffix) : undefined}`;
  }
  function block7(context, tags, suffix) {
    return (0, _LitRenderer.html)`<tr class="ui5-table-no-data-row-root"><td colspan="${(0, _LitRenderer.ifDefined)(this.visibleColumnsCount)}" role="cell" style="width: 100%"><div class="ui5-table-no-data-row"><span>${(0, _LitRenderer.ifDefined)(this.noDataText)}</span></div></td></tr>`;
  }
  function block8(context, tags, suffix) {
    return (0, _LitRenderer.html)`<tr><td colspan="${(0, _LitRenderer.ifDefined)(this.visibleColumnsCount)}"><div growing-button><div id="${(0, _LitRenderer.ifDefined)(this._id)}-growingButton" tabindex="0" role="button" aria-labelledby="${(0, _LitRenderer.ifDefined)(this.loadMoreAriaLabelledBy)}" ?active="${this._loadMoreActive}" @click="${this._onLoadMoreClick}" @keydown="${this._onLoadMoreKeydown}" @keyup="${this._onLoadMoreKeyup}" growing-button-inner><span id="${(0, _LitRenderer.ifDefined)(this._id)}-growingButton-text" growing-button-text>${(0, _LitRenderer.ifDefined)(this._growingButtonText)}</span>${this.growingButtonSubtext ? block9.call(this, context, tags, suffix) : undefined}</div></div></td></tr>`;
  }
  function block9(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span id="${(0, _LitRenderer.ifDefined)(this._id)}-growingButton-subtext" growing-button-subtext>${(0, _LitRenderer.ifDefined)(this.growingButtonSubtext)}</span>`;
  }
  function block10(context, tags, suffix) {
    return (0, _LitRenderer.html)`<tr tabindex="-1" class="ui5-table-end-row"><td tabindex="-1"><span tabindex="-1" aria-hidden="true" class="ui5-table-end-marker"></span></td></tr>`;
  }
  var _default = block0;
  _exports.default = _default;
});