sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<svg class="ui5-icon-root" tabindex="${litRender.ifDefined(context.tabIndex)}" dir="${litRender.ifDefined(context._dir)}" viewBox="0 0 512 512" role="${litRender.ifDefined(context.effectiveAccessibleRole)}" focusable="false" preserveAspectRatio="xMidYMid meet" aria-label="${litRender.ifDefined(context.effectiveAccessibleName)}" aria-hidden=${litRender.ifDefined(context.effectiveAriaHidden)} xmlns="http://www.w3.org/2000/svg" @focusin=${context._onfocusin} @focusout=${context._onfocusout} @keydown=${context._onkeydown} @keyup=${context._onkeyup} @click=${context._onclick}>${blockSVG1(context)}</svg>`;
	const block1 = (context, tags, suffix) => litRender.svg`<title id="${litRender.ifDefined(context._id)}-tooltip">${litRender.ifDefined(context.effectiveAccessibleName)}</title>`;
	const blockSVG1 = (context, tags, suffix) => litRender.svg`${ context.hasIconTooltip ? block1(context) : undefined }<g role="presentation"><path d="${litRender.ifDefined(context.pathData)}"/></g>`;

	return block0;

});
