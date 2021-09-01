sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="ui5-mp-root" role="grid" aria-readonly="false" aria-multiselectable="false" @keydown=${context._onkeydown} @keyup=${context._onkeyup} @click=${context._selectMonth} @focusin=${context._onfocusin}>${ litRender.repeat(context._months, (item, index) => item._id || index, (item, index) => block1(item)) }</div>`;
	const block1 = (item, index, context, tags, suffix) => litRender.html`<div class="ui5-mp-quarter">${ litRender.repeat(item, (item, index) => item._id || index, (item, index) => block2(item)) }</div>`;
	const block2 = (item, index, context, tags, suffix) => litRender.html`<div data-sap-timestamp=${litRender.ifDefined(item.timestamp)} tabindex=${litRender.ifDefined(item._tabIndex)} ?data-sap-focus-ref="${item.focusRef}" class="${litRender.ifDefined(item.classes)}" role="gridcell" aria-selected="${litRender.ifDefined(item.ariaSelected)}">${litRender.ifDefined(item.name)}</div>`;

	return block0;

});
