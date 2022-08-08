sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* eslint no-unused-vars: 0 */
  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-table-root" @focusin="${context._onfocusin}"><div id="${(0, _LitRenderer.ifDefined)(context._id)}-before" tabindex="0" class="ui5-table-focusarea"></div>${context.busy ? block1(context, tags, suffix) : undefined}<table border="0" cellspacing="0" cellpadding="0" @keydown="${context._onkeydown}" role="table" aria-label="${(0, _LitRenderer.ifDefined)(context.tableAriaLabelText)}"><thead><tr id="${(0, _LitRenderer.ifDefined)(context._columnHeader.id)}" role="row" class="ui5-table-header-row" aria-label="${(0, _LitRenderer.ifDefined)(context.ariaLabelText)}" tabindex="${(0, _LitRenderer.ifDefined)(context._columnHeader._tabIndex)}" @click="${context._onColumnHeaderClick}" @focusin="${context._onColumnHeaderFocused}" @keydown="${context._onColumnHeaderKeydown}">${context.isMultiSelect ? block2(context, tags, suffix) : undefined}${(0, _LitRenderer.repeat)(context.visibleColumns, (item, index) => item._id || index, (item, index) => block3(item, index, context, tags, suffix))}</tr></thead><tbody>${(0, _LitRenderer.repeat)(context.rows, (item, index) => item._id || index, (item, index) => block4(item, index, context, tags, suffix))}${!context.rows.length ? block5(context, tags, suffix) : undefined}${context.growsWithButton ? block7(context, tags, suffix) : undefined}${context.growsOnScroll ? block9(context, tags, suffix) : undefined}</tbody></table><div id="${(0, _LitRenderer.ifDefined)(context._id)}-after" tabindex="0" class="ui5-table-focusarea"></div></div> `;

  const block1 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<div tabindex="-1" class="ui5-table-busy-row"><${(0, _LitRenderer.scopeTag)("ui5-busy-indicator", tags, suffix)} delay="${(0, _LitRenderer.ifDefined)(context.busyDelay)}" class="ui5-table-busy-ind" style="${(0, _LitRenderer.styleMap)(context.styles.busy)}" active size="Medium" data-sap-focus-ref></${(0, _LitRenderer.scopeTag)("ui5-busy-indicator", tags, suffix)}></div>` : (0, _LitRenderer.html)`<div tabindex="-1" class="ui5-table-busy-row"><ui5-busy-indicator delay="${(0, _LitRenderer.ifDefined)(context.busyDelay)}" class="ui5-table-busy-ind" style="${(0, _LitRenderer.styleMap)(context.styles.busy)}" active size="Medium" data-sap-focus-ref></ui5-busy-indicator></div>`;

  const block2 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<th class="ui5-table-select-all-column" role="presentation" aria-hidden="true"><${(0, _LitRenderer.scopeTag)("ui5-checkbox", tags, suffix)} class="ui5-table-select-all-checkbox" ?checked="${context._allRowsSelected}" @ui5-change="${(0, _LitRenderer.ifDefined)(context._selectAll)}" aria-label="${(0, _LitRenderer.ifDefined)(context.ariaLabelSelectAllText)}" tabindex="-1"></${(0, _LitRenderer.scopeTag)("ui5-checkbox", tags, suffix)}></th>` : (0, _LitRenderer.html)`<th class="ui5-table-select-all-column" role="presentation" aria-hidden="true"><ui5-checkbox class="ui5-table-select-all-checkbox" ?checked="${context._allRowsSelected}" @ui5-change="${(0, _LitRenderer.ifDefined)(context._selectAll)}" aria-label="${(0, _LitRenderer.ifDefined)(context.ariaLabelSelectAllText)}" tabindex="-1"></ui5-checkbox></th>`;

  const block3 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`<slot name="${(0, _LitRenderer.ifDefined)(item._individualSlot)}"></slot>`;

  const block4 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`<slot name="${(0, _LitRenderer.ifDefined)(item._individualSlot)}"></slot>`;

  const block5 = (context, tags, suffix) => (0, _LitRenderer.html)`${!context.hideNoData ? block6(context, tags, suffix) : undefined}`;

  const block6 = (context, tags, suffix) => (0, _LitRenderer.html)`<tr class="ui5-table-no-data-row-root" role="row"><td colspan="${(0, _LitRenderer.ifDefined)(context.visibleColumnsCount)}" role="cell"><div class="ui5-table-no-data-row"><span>${(0, _LitRenderer.ifDefined)(context.noDataText)}</span></div></td></tr>`;

  const block7 = (context, tags, suffix) => (0, _LitRenderer.html)`<tr><td colspan="${(0, _LitRenderer.ifDefined)(context.visibleColumnsCount)}"><div growing-button><div id="${(0, _LitRenderer.ifDefined)(context._id)}-growingButton" tabindex="0" role="button" aria-labelledby="${(0, _LitRenderer.ifDefined)(context.loadMoreAriaLabelledBy)}" ?active="${context._loadMoreActive}" @click="${context._onLoadMoreClick}" @keydown="${context._onLoadMoreKeydown}" @keyup="${context._onLoadMoreKeyup}" growing-button-inner><span id="${(0, _LitRenderer.ifDefined)(context._id)}-growingButton-text" growing-button-text>${(0, _LitRenderer.ifDefined)(context._growingButtonText)}</span>${context.growingButtonSubtext ? block8(context, tags, suffix) : undefined}</div></div></td></tr>`;

  const block8 = (context, tags, suffix) => (0, _LitRenderer.html)`<span id="${(0, _LitRenderer.ifDefined)(context._id)}-growingButton-subtext" growing-button-subtext>${(0, _LitRenderer.ifDefined)(context.growingButtonSubtext)}</span>`;

  const block9 = (context, tags, suffix) => (0, _LitRenderer.html)`<tr tabindex="-1" class="ui5-table-end-row"><td tabindex="-1"><span tabindex="-1" aria-hidden="true" class="ui5-table-end-marker"></span></td></tr>`;

  var _default = block0;
  _exports.default = _default;
});