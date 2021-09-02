sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div dir="${litRender.ifDefined(context.effectiveDir)}" class="${litRender.classMap(context.classes.wrapper)}"><span id="${litRender.ifDefined(context._id)}-hiddenText" class="ui5-hidden-text">${litRender.ifDefined(context.tokenizerLabel)}</span><div class="${litRender.classMap(context.classes.content)}" @ui5-delete="${litRender.ifDefined(context._tokenDelete)}" @click="${context._click}" @mousedown="${context._onmousedown}" @keydown="${context._onkeydown}" role="listbox" aria-labelledby="${litRender.ifDefined(context._id)}-hiddenText">${ litRender.repeat(context.tokens, (item, index) => item._id || index, (item, index) => block1(item)) }</div>${ context.showNMore ? block2(context) : undefined }</div>`;
	const block1 = (item, index, context, tags, suffix) => litRender.html`<slot name="${litRender.ifDefined(item._individualSlot)}"></slot>`;
	const block2 = (context, tags, suffix) => litRender.html`<span @click="${context._openOverflowPopover}" class="ui5-tokenizer-more-text">${litRender.ifDefined(context._nMoreText)}</span>`;

	return block0;

});
