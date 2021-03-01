sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-progress-indicator-root ${litRender.classMap(context.classes.root)}" dir="${ifDefined__default(context.effectiveDir)}" role="progressbar" aria-valuemin="0" aria-valuenow="${ifDefined__default(context.validatedValue)}" aria-valuemax="100" aria-valuetext="${ifDefined__default(context.valueStateText)}" aria-disabled="${ifDefined__default(context._ariaDisabled)}"><div class="ui5-progress-indicator-bar" style="${litRender.styleMap(context.styles.bar)}">${ !context.showValueInRemainingBar ? block1(context) : undefined }</div><div class="ui5-progress-indicator-remaining-bar">${ context.showValueInRemainingBar ? block4(context) : undefined }</div></div>`; };
	const block1 = (context) => { return litRender.html`${ context.showIcon ? block2(context) : undefined }${ !context.hideValue ? block3(context) : undefined }`; };
	const block2 = (context) => { return litRender.html`<ui5-icon name="${ifDefined__default(context.valueStateIcon)}" class="ui5-progress-indicator-icon"></ui5-icon>`; };
	const block3 = (context) => { return litRender.html`<span class="ui5-progress-indicator-value">${ifDefined__default(context.validatedValue)}%</span>`; };
	const block4 = (context) => { return litRender.html`${ context.showIcon ? block5(context) : undefined }${ !context.hideValue ? block6(context) : undefined }`; };
	const block5 = (context) => { return litRender.html`<ui5-icon name="${ifDefined__default(context.valueStateIcon)}" class="ui5-progress-indicator-icon"></ui5-icon>`; };
	const block6 = (context) => { return litRender.html`<span class="ui5-progress-indicator-value">${ifDefined__default(context.validatedValue)}%</span>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
