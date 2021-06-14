sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-wiz-step-root" role="listitem" tabindex="${ifDefined__default(context.tabIndex)}" aria-current="${ifDefined__default(context.accInfo.ariaCurrent)}" aria-setsize="${ifDefined__default(context.accInfo.ariaSetsize)}" aria-posinset="${ifDefined__default(context.accInfo.ariaPosinset)}" aria-disabled="${ifDefined__default(context.accInfo.ariaDisabled)}" aria-label="${ifDefined__default(context.accInfo.ariaLabel)}" @click="${context._onclick}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" @focusin="${context._onfocusin}"><div class="ui5-wiz-step-main"><div class="ui5-wiz-step-icon-circle">${ context.icon ? block1(context) : block2(context) }</div>${ context.hasTexts ? block3(context) : undefined }</div>${ !context.hideSeparator ? block4() : undefined }</div>`; };
	const block1 = (context) => { return litRender.html`<ui5-icon class="ui5-wiz-step-icon" name="${ifDefined__default(context.icon)}"></ui5-icon>`; };
	const block2 = (context) => { return litRender.html`<span class="ui5-wiz-step-number">${ifDefined__default(context.number)}</span>`; };
	const block3 = (context) => { return litRender.html`<div class="ui5-wiz-step-texts"><div class="ui5-wiz-step-title-text">${ifDefined__default(context.titleText)}</div><div class="ui5-wiz-step-subtitle-text">${ifDefined__default(context.subtitleText)}</div></div>`; };
	const block4 = (context) => { return litRender.html`<div class="ui5-wiz-step-hr"></div>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
