sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-radio-root ${litRender.classMap(context.classes.main)}" role="radio" aria-checked="${ifDefined__default(context.selected)}" aria-readonly="${ifDefined__default(context.ariaReadonly)}" aria-disabled="${ifDefined__default(context.ariaDisabled)}" aria-labelledby="${ifDefined__default(context.ariaLabelledBy)}" aria-describedby="${ifDefined__default(context.ariaDescribedBy)}" tabindex="${ifDefined__default(context.tabIndex)}" dir="${ifDefined__default(context.effectiveDir)}" @click="${context._onclick}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}"><div class='ui5-radio-inner ${litRender.classMap(context.classes.inner)}'><svg class="ui5-radio-svg" focusable="false" aria-hidden="true">${blockSVG1()}</svg><input type='radio' ?checked="${context.selected}" ?readonly="${context.readonly}" ?disabled="${context.disabled}" name="${ifDefined__default(context.name)}" data-sap-no-tab-ref/></div>${ context.text ? block1(context) : undefined }${ context.hasValueState ? block2(context) : undefined }</div>`; };
	const block1 = (context) => { return litRender.html`<ui5-label id="${ifDefined__default(context._id)}-label" class="ui5-radio-label" for="${ifDefined__default(context._id)}" wrapping-type="${ifDefined__default(context._wrappingType)}">${ifDefined__default(context.text)}</ui5-label>`; };
	const block2 = (context) => { return litRender.html`<span id="${ifDefined__default(context._id)}-descr" class="ui5-hidden-text">${ifDefined__default(context.valueStateText)}</span>`; };
	const blockSVG1 = (context) => {return litRender.svg`<circle class="ui5-radio-svg-outer" cx="50%" cy="50%" r="50%" /><circle class="ui5-radio-svg-inner" cx="50%" cy="50%" r="22%" />`};
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
