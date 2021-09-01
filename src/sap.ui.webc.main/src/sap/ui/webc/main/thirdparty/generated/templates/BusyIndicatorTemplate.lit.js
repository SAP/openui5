sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="${litRender.classMap(context.classes.root)}">${ context._isBusy ? block1(context, tags, suffix) : undefined }<slot></slot>${ context.active ? block3(context) : undefined }</div>`;
	const block1 = (context, tags, suffix) => litRender.html`<div class="ui5-busy-indicator-busy-area" title="${litRender.ifDefined(context.ariaTitle)}" tabindex="0" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuetext="Busy" aria-labelledby="${litRender.ifDefined(context.labelId)}"><div class="ui5-busy-indicator-circles-wrapper"><div class="ui5-busy-indicator-circle circle-animation-0"></div><div class="ui5-busy-indicator-circle circle-animation-1"></div><div class="ui5-busy-indicator-circle circle-animation-2"></div></div>${ context.text ? block2(context, tags, suffix) : undefined }</div>`;
	const block2 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-label", tags, suffix)} id="${litRender.ifDefined(context._id)}-label" class="ui5-busy-indicator-text">${litRender.ifDefined(context.text)}</${litRender.scopeTag("ui5-label", tags, suffix)}>`;
	const block3 = (context, tags, suffix) => litRender.html`<span data-ui5-focus-redirect tabindex="0" @focusin="${context._redirectFocus}"></span>`;

	return block0;

});
