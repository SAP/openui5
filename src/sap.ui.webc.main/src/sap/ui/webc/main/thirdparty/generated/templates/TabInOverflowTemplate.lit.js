sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<ui5-li-custom id="${ifDefined__default(context._id)}" class="${ifDefined__default(context.overflowClasses)}" type="${ifDefined__default(context.overflowState)}" ?selected="${context.effectiveSelected}" ?disabled="${context.effectiveDisabled}" aria-disabled="${ifDefined__default(context.effectiveDisabled)}" aria-selected="${ifDefined__default(context.effectiveSelected)}" aria-labelledby="${ifDefined__default(context.ariaLabelledBy)}"><div class="ui5-tab-overflow-itemContent">${ context.icon ? block1(context) : undefined }${ifDefined__default(context.text)}${ context.additionalText ? block2(context) : undefined }</div></ui5-li-custom>`; };
	const block1 = (context) => { return litRender.html`<ui5-icon name="${ifDefined__default(context.icon)}"></ui5-icon>`; };
	const block2 = (context) => { return litRender.html` (${ifDefined__default(context.additionalText)}) `; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
