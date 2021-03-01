sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="${litRender.classMap(context.classes.root)}">${ context.active ? block1(context) : undefined }<slot></slot>${ context.active ? block3(context) : undefined }</div>`; };
	const block1 = (context) => { return litRender.html`<div class="ui5-busy-indicator-busy-area" title="${ifDefined__default(context.ariaTitle)}" tabindex="0" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuetext="Busy" aria-labelledby="${ifDefined__default(context.labelId)}"><div class="ui5-busy-indicator-circles-wrapper"><div class="ui5-busy-indicator-circle circle-animation-0"></div><div class="ui5-busy-indicator-circle circle-animation-1"></div><div class="ui5-busy-indicator-circle circle-animation-2"></div></div>${ context.text ? block2(context) : undefined }</div>`; };
	const block2 = (context) => { return litRender.html`<ui5-label id="${ifDefined__default(context._id)}-label" class="ui5-busy-indicator-text">${ifDefined__default(context.text)}</ui5-label>`; };
	const block3 = (context) => { return litRender.html`<span data-ui5-focus-redirect tabindex="0" @focusin="${context._redirectFocus}"></span>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
