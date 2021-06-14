sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<svg class="ui5-icon-root" tabindex="${ifDefined__default(context.tabIndex)}" dir="${ifDefined__default(context._dir)}" viewBox="0 0 512 512" role="${ifDefined__default(context.role)}" focusable="false" preserveAspectRatio="xMidYMid meet" aria-label="${ifDefined__default(context.effectiveAccessibleName)}" xmlns="http://www.w3.org/2000/svg" @focusin=${context._onfocusin} @focusout=${context._onfocusout} @keydown=${context._onkeydown} @keyup=${context._onkeyup} @click=${context._onclick}>${blockSVG1(context)}</svg>`; };
	const block1 = (context) => { return litRender.svg`<title id="${ifDefined__default(context._id)}-tooltip">${ifDefined__default(context.effectiveAccessibleName)}</title>`; };
	const blockSVG1 = (context) => {return litRender.svg`${ context.hasIconTooltip ? block1(context) : undefined }<g role="presentation"><path d="${ifDefined__default(context.pathData)}"/></g>`};
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
