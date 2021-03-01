sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<tr class="ui5-table-row-root" tabindex="${ifDefined__default(context._tabIndex)}" @focusin="${context._onfocusin}" @click="${context._onrowclick}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" @mouseup="${context._onmouseup}" @touchstart="${context._ontouchstart}" @touchend="${context._ontouchend}" aria-label="${ifDefined__default(context.ariaLabelText)}" aria-selected="${ifDefined__default(context.selected)}" data-sap-focus-ref part="row" role="row">${ context.isMultiSelect ? block1(context) : undefined }${ context.shouldPopin ? block2(context) : block4(context) }</tr>${ context.shouldPopin ? block6(context) : undefined } `; };
	const block1 = (context) => { return litRender.html`<td class="ui5-table-multi-select-cell" aria-hidden="true" role="presentation"><ui5-checkbox class="ui5-multi-select-checkbox" ?checked="${context.selected}" aria-label="${ifDefined__default(context.ariaLabelRowSelection)}" @ui5-change="${ifDefined__default(context._handleSelection)}"></ui5-checkbox></td>`; };
	const block2 = (context) => { return litRender.html`${ litRender.repeat(context.visibleCells, (item, index) => item._id || index, (item, index) => block3(item)) }`; };
	const block3 = (item, index, context) => { return litRender.html`<slot name="${ifDefined__default(item._individualSlot)}"></slot>`; };
	const block4 = (context) => { return litRender.html`${ litRender.repeat(context.cells, (item, index) => item._id || index, (item, index) => block5(item)) }`; };
	const block5 = (item, index, context) => { return litRender.html`<slot name="${ifDefined__default(item._individualSlot)}"></slot>`; };
	const block6 = (context) => { return litRender.html`${ litRender.repeat(context.popinCells, (item, index) => item._id || index, (item, index) => block7(item, index, context)) }`; };
	const block7 = (item, index, context) => { return litRender.html`<tr part="popin-row" role="row" class="${ifDefined__default(item.classes)}" @click="${context._onrowclick}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}"><td colspan="${ifDefined__default(context.visibleCellsCount)}" role="cell">${ item.popinText ? block8(item) : undefined }<div><slot name="${ifDefined__default(item.cell._individualSlot)}"></slot></div></td></tr>`; };
	const block8 = (item, index, context) => { return litRender.html`<span class="ui5-table-row-popin-title">${ifDefined__default(item.popinText)}:</span>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
