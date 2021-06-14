sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-checkbox-root ${litRender.classMap(context.classes.main)}" role="checkbox" aria-checked="${ifDefined__default(context.ariaChecked)}" aria-readonly="${ifDefined__default(context.ariaReadonly)}" aria-disabled="${ifDefined__default(context.ariaDisabled)}" aria-label="${ifDefined__default(context.ariaLabelText)}" aria-labelledby="${ifDefined__default(context.ariaLabelledBy)}" aria-describedby="${ifDefined__default(context.ariaDescribedBy)}" tabindex="${ifDefined__default(context.tabIndex)}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" @click="${context._onclick}" dir="${ifDefined__default(context.effectiveDir)}"><div id="${ifDefined__default(context._id)}-CbBg" class="ui5-checkbox-inner">${ context.isCompletelyChecked ? block1() : undefined }<input id="${ifDefined__default(context._id)}-CB" type='checkbox' ?checked="${context.checked}" ?readonly="${context.readonly}" ?disabled="${context.disabled}" aria-hidden="true" data-sap-no-tab-ref /></div>${ context._label.text ? block2(context) : undefined }${ context.hasValueState ? block3(context) : undefined }<slot name="formSupport"></slot></div>`; };
	const block1 = (context) => { return litRender.html`<ui5-icon name="accept" class="ui5-checkbox-icon"></ui5-icon>`; };
	const block2 = (context) => { return litRender.html`<ui5-label id="${ifDefined__default(context._id)}-label" class="ui5-checkbox-label" wrapping-type="${ifDefined__default(context._label.wrappingType)}">${ifDefined__default(context._label.text)}</ui5-label>`; };
	const block3 = (context) => { return litRender.html`<span id="${ifDefined__default(context._id)}-descr" class="ui5-hidden-text">${ifDefined__default(context.valueStateText)}</span>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
