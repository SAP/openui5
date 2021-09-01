sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="ui5-wiz-step-root" role="listitem" tabindex="${litRender.ifDefined(context.tabIndex)}" aria-current="${litRender.ifDefined(context.accInfo.ariaCurrent)}" aria-setsize="${litRender.ifDefined(context.accInfo.ariaSetsize)}" aria-posinset="${litRender.ifDefined(context.accInfo.ariaPosinset)}" aria-disabled="${litRender.ifDefined(context.accInfo.ariaDisabled)}" aria-label="${litRender.ifDefined(context.accInfo.ariaLabel)}" @click="${context._onclick}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" @focusin="${context._onfocusin}"><div class="ui5-wiz-step-main"><div class="ui5-wiz-step-icon-circle">${ context.icon ? block1(context, tags, suffix) : block2(context) }</div>${ context.hasTexts ? block3(context) : undefined }</div>${ !context.hideSeparator ? block4() : undefined }</div>`;
	const block1 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-icon", tags, suffix)} class="ui5-wiz-step-icon" name="${litRender.ifDefined(context.icon)}"></${litRender.scopeTag("ui5-icon", tags, suffix)}>`;
	const block2 = (context, tags, suffix) => litRender.html`<span class="ui5-wiz-step-number">${litRender.ifDefined(context.number)}</span>`;
	const block3 = (context, tags, suffix) => litRender.html`<div class="ui5-wiz-step-texts"><div class="ui5-wiz-step-title-text">${litRender.ifDefined(context.titleText)}</div><div class="ui5-wiz-step-subtitle-text">${litRender.ifDefined(context.subtitleText)}</div></div>`;
	const block4 = (context, tags, suffix) => litRender.html`<div class="ui5-wiz-step-hr"></div>`;

	return block0;

});
