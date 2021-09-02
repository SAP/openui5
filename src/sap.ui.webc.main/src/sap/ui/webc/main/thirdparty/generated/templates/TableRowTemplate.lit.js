sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<tr class="ui5-table-row-root" tabindex="${litRender.ifDefined(context._tabIndex)}" @focusin="${context._onfocusin}" @click="${context._onrowclick}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" @mouseup="${context._onmouseup}" @touchstart="${context._ontouchstart}" @touchend="${context._ontouchend}" aria-label="${litRender.ifDefined(context.ariaLabelText)}" aria-selected="${litRender.ifDefined(context.selected)}" data-sap-focus-ref part="row" role="row">${ context.isMultiSelect ? block1(context, tags, suffix) : undefined }${ context.shouldPopin ? block2(context) : block4(context) }</tr>${ context.shouldPopin ? block6(context) : undefined } `;
	const block1 = (context, tags, suffix) => litRender.html`<td class="ui5-table-multi-select-cell" aria-hidden="true" role="presentation"><${litRender.scopeTag("ui5-checkbox", tags, suffix)} class="ui5-multi-select-checkbox" ?checked="${context.selected}" aria-label="${litRender.ifDefined(context.ariaLabelRowSelection)}" @ui5-change="${litRender.ifDefined(context._handleSelection)}"></${litRender.scopeTag("ui5-checkbox", tags, suffix)}></td>`;
	const block2 = (context, tags, suffix) => litRender.html`${ litRender.repeat(context.visibleCells, (item, index) => item._id || index, (item, index) => block3(item)) }`;
	const block3 = (item, index, context, tags, suffix) => litRender.html`<slot name="${litRender.ifDefined(item._individualSlot)}"></slot>`;
	const block4 = (context, tags, suffix) => litRender.html`${ litRender.repeat(context.cells, (item, index) => item._id || index, (item, index) => block5(item)) }`;
	const block5 = (item, index, context, tags, suffix) => litRender.html`<slot name="${litRender.ifDefined(item._individualSlot)}"></slot>`;
	const block6 = (context, tags, suffix) => litRender.html`${ litRender.repeat(context.popinCells, (item, index) => item._id || index, (item, index) => block7(item, index, context)) }`;
	const block7 = (item, index, context, tags, suffix) => litRender.html`<tr part="popin-row" role="row" class="${litRender.ifDefined(item.classes)}" @click="${context._onrowclick}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}"><td colspan="${litRender.ifDefined(context.visibleCellsCount)}" role="cell">${ item.popinText ? block8(item) : undefined }<div><slot name="${litRender.ifDefined(item.cell._individualSlot)}"></slot></div></td></tr>`;
	const block8 = (item, index, context, tags, suffix) => litRender.html`<span class="ui5-table-row-popin-title">${litRender.ifDefined(item.popinText)}:</span>`;

	return block0;

});
