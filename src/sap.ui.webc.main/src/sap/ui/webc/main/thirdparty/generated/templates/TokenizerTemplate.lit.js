sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div dir="${ifDefined__default(context.effectiveDir)}" class="${litRender.classMap(context.classes.wrapper)}"><span id="${ifDefined__default(context._id)}-hiddenText" class="ui5-hidden-text">${ifDefined__default(context.tokenizerLabel)}</span><div class="${litRender.classMap(context.classes.content)}" @ui5-delete="${ifDefined__default(context._tokenDelete)}" @click="${context._click}" @mousedown="${context._onmousedown}" @keydown="${context._onkeydown}" role="listbox" aria-labelledby="${ifDefined__default(context._id)}-hiddenText">${ litRender.repeat(context.tokens, (item, index) => item._id || index, (item, index) => block1(item)) }</div>${ context.showNMore ? block2(context) : undefined }</div>`; };
	const block1 = (item, index, context) => { return litRender.html`<slot name="${ifDefined__default(item._individualSlot)}"></slot>`; };
	const block2 = (context) => { return litRender.html`<span @click="${context._openOverflowPopover}" class="ui5-tokenizer-more-text">${ifDefined__default(context._nMoreText)}</span>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
