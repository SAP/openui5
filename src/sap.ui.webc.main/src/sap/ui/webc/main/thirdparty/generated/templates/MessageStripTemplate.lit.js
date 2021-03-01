sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="${litRender.classMap(context.classes.root)}" id="${ifDefined__default(context._id)}" role="note" dir="${ifDefined__default(context.effectiveDir)}" aria-live="assertive" aria-labelledby="${ifDefined__default(context._id)}">${ !context.hideIcon ? block1(context) : undefined }<span class="ui5-hidden-text">${ifDefined__default(context.hiddenText)}</span><span class="ui5-messagestrip-text"><slot></slot></span>${ !context.hideCloseButton ? block4(context) : undefined }</div>`; };
	const block1 = (context) => { return litRender.html`<div class="ui5-messagestrip-icon-wrapper" aria-hidden="true">${ context.iconProvided ? block2() : block3(context) }</div>`; };
	const block2 = (context) => { return litRender.html`<slot name="icon"></slot>`; };
	const block3 = (context) => { return litRender.html`<ui5-icon name="${ifDefined__default(context.standardIconName)}" class="ui5-messagestrip-icon"></ui5-icon>`; };
	const block4 = (context) => { return litRender.html`<ui5-button icon="decline" design="Transparent" class="ui5-messagestrip-close-button" title="${ifDefined__default(context._closeButtonText)}" @click=${context._closeClick}></ui5-button>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
