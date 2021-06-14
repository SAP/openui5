sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<section style="${litRender.styleMap(context.styles.root)}" class="${litRender.classMap(context.classes.root)}" role="dialog" aria-modal="${ifDefined__default(context._ariaModal)}" aria-label="${ifDefined__default(context._ariaLabel)}" aria-labelledby="${ifDefined__default(context._ariaLabelledBy)}" dir="${ifDefined__default(context.effectiveDir)}" tabindex="-1" @keydown=${context._onkeydown} @focusout=${context._onfocusout}><span class="first-fe" data-ui5-focus-trap tabindex="0" @focusin=${context.forwardToLast}></span><div style="${litRender.styleMap(context.styles.content)}" class="${litRender.classMap(context.classes.content)}"  @scroll="${context._scroll}"><slot></slot></div><span class="last-fe" data-ui5-focus-trap tabindex="0" @focusin=${context.forwardToFirst}></span></section> `; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
