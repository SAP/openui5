sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-switch-root ${litRender.classMap(context.classes.main)}" role="checkbox" aria-checked="${ifDefined__default(context.checked)}" aria-disabled="${ifDefined__default(context.ariaDisabled)}" aria-labelledby="${ifDefined__default(context._id)}-hiddenText" @click="${context._onclick}" @keyup="${context._onkeyup}" @keydown="${context._onkeydown}" tabindex="${ifDefined__default(context.tabIndex)}" dir="${ifDefined__default(context.effectiveDir)}"><div class="ui5-switch-inner"><div class="ui5-switch-track" part="slider"><div class="ui5-switch-slider">${ context.graphical ? block1() : block2(context) }<span class="ui5-switch-handle" part="handle"></span></div></div></div><input type='checkbox' ?checked="${context.checked}" class="ui5-switch-input" data-sap-no-tab-ref/><span id="${ifDefined__default(context._id)}-hiddenText" class="ui5-hidden-text">${ifDefined__default(context.hiddenText)}</span></div>`; };
	const block1 = (context) => { return litRender.html`<span class="ui5-switch-text ui5-switch-text--on"><ui5-icon name="accept" dir="ltr" class="ui5-switch-icon-on"></ui5-icon></span><span class="ui5-switch-text ui5-switch-text--off"><ui5-icon name="decline" class="ui5-switch-icon-off"></ui5-icon></span>`; };
	const block2 = (context) => { return litRender.html`<span class="ui5-switch-text ui5-switch-text--on" part="text-on">${ifDefined__default(context._textOn)}</span><span class="ui5-switch-text ui5-switch-text--off" part="text-off">${ifDefined__default(context._textOff)}</span>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
