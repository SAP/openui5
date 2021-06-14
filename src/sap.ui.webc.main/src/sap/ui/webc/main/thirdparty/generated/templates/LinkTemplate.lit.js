sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<a class="ui5-link-root" role="link" href="${ifDefined__default(context.parsedRef)}" target="${ifDefined__default(context.target)}" rel="${ifDefined__default(context._rel)}" tabindex="${ifDefined__default(context.tabIndex)}" ?disabled="${context.disabled}" aria-label="${ifDefined__default(context.ariaLabelText)}" @focusin=${context._onfocusin} @click=${context._onclick} @keydown=${context._onkeydown} @keyup=${context._onkeyup}><slot></slot>${ context.hasLinkType ? block1(context) : undefined }</a>`; };
	const block1 = (context) => { return litRender.html`<span class="ui5-hidden-text">${ifDefined__default(context.linkTypeText)}</span>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
