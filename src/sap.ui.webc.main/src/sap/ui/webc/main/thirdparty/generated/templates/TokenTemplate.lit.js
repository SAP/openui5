sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div tabindex="${ifDefined__default(context._tabIndex)}" @click="${context._handleSelect}" @keydown="${context._keydown}" class="ui5-token--wrapper" dir="${ifDefined__default(context.effectiveDir)}" role="option" aria-selected="${ifDefined__default(context.selected)}"><span class="ui5-token--text">${ifDefined__default(context.text)}</span>${ !context.readonly ? block1(context) : undefined }</div>`; };
	const block1 = (context) => { return litRender.html`<div class="ui5-token--icon" @click="${context._delete}">${ context.closeIcon.length ? block2() : block3(context) }</div>`; };
	const block2 = (context) => { return litRender.html`<slot name="closeIcon"></slot>`; };
	const block3 = (context) => { return litRender.html`<ui5-icon name="${ifDefined__default(context.iconURI)}" accessible-name="${ifDefined__default(context.tokenDeletableText)}" show-tooltip></ui5-icon>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
