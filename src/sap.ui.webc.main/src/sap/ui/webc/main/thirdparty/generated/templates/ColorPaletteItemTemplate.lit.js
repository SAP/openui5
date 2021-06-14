sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-cp-item" style="background-color: ${ifDefined__default(context.value)}" value="${ifDefined__default(context.value)}" tabindex="${ifDefined__default(context._tabIndex)}" role="button" aria-label="${ifDefined__default(context.colorLabel)} - ${ifDefined__default(context.index)}: ${ifDefined__default(context.value)}" title="${ifDefined__default(context.colorLabel)} - ${ifDefined__default(context.index)}: ${ifDefined__default(context.value)}" ?disabled="${context._disabled}"></div>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
