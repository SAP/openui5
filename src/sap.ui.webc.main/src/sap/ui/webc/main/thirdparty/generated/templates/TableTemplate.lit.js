sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-table-root">${ context.busy ? block1(context) : undefined }<table border="0" cellspacing="0" cellpadding="0" @keydown="${context._onkeydown}" role="table"><thead><tr id="${ifDefined__default(context._columnHeader.id)}" role="row" class="ui5-table-header-row" aria-label="${ifDefined__default(context.ariaLabelText)}" tabindex="${ifDefined__default(context._columnHeader._tabIndex)}" style="height: 48px" @click="${context._onColumnHeaderClick}">${ context.isMultiSelect ? block2(context) : undefined }${ litRender.repeat(context.visibleColumns, (item, index) => item._id || index, (item, index) => block3(item)) }</tr></thead><tbody>${ litRender.repeat(context.rows, (item, index) => item._id || index, (item, index) => block4(item)) }${ !context.rows.length ? block5(context) : undefined }${ context.growsWithButton ? block7(context) : undefined }${ context.growsOnScroll ? block9() : undefined }</tbody></table></div>`; };
	const block1 = (context) => { return litRender.html`<div tabindex="-1" class="ui5-table-busy-row"><ui5-busy-indicator class="ui5-table-busy-ind" style="${litRender.styleMap(context.styles.busy)}" active size="Medium"></ui5-busy-indicator></div>`; };
	const block2 = (context) => { return litRender.html`<th class="ui5-table-select-all-column" role="presentation" aria-hidden="true"><ui5-checkbox class="ui5-table-select-all-checkbox" ?checked="${context._allRowsSelected}" @ui5-change="${ifDefined__default(context._selectAll)}" aria-label="${ifDefined__default(context.ariaLabelSelectAllText)}"></ui5-checkbox></th>`; };
	const block3 = (item, index, context) => { return litRender.html`<slot name="${ifDefined__default(item._individualSlot)}"></slot>`; };
	const block4 = (item, index, context) => { return litRender.html`<slot name="${ifDefined__default(item._individualSlot)}"></slot>`; };
	const block5 = (context) => { return litRender.html`${ !context.hideNoData ? block6(context) : undefined }`; };
	const block6 = (context) => { return litRender.html`<tr class="ui5-table-no-data-row-root" role="row"><td colspan="${ifDefined__default(context.visibleColumnsCount)}" role="cell"><div class="ui5-table-no-data-row"><span>${ifDefined__default(context.noDataText)}</span></div></td></tr>`; };
	const block7 = (context) => { return litRender.html`<tr><td colspan="${ifDefined__default(context.visibleColumnsCount)}"><div growing-button><div tabindex="0" role="button" aria-labelledby="${ifDefined__default(context.loadMoreAriaLabelledBy)}" ?active="${context._loadMoreActive}" @click="${context._onLoadMoreClick}" @keydown="${context._onLoadMoreKeydown}" @keyup="${context._onLoadMoreKeyup}" growing-button-inner><span id="${ifDefined__default(context._id)}-growingButton-text" growing-button-text>${ifDefined__default(context._growingButtonText)}</span>${ context.growingButtonSubtext ? block8(context) : undefined }</div></div></td></tr>`; };
	const block8 = (context) => { return litRender.html`<span id="${ifDefined__default(context._id)}-growingButton-subtext" growing-button-subtext>${ifDefined__default(context.growingButtonSubtext)}</span>`; };
	const block9 = (context) => { return litRender.html`<tr tabindex="-1" class="ui5-table-end-row"><td tabindex="-1"><span tabindex="-1" aria-hidden="true" class="ui5-table-end-marker"></span></td></tr>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
