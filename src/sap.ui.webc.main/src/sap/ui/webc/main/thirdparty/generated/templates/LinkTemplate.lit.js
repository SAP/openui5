sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<a class="ui5-link-root" role="${litRender.ifDefined(context.effectiveAccRole)}" href="${litRender.ifDefined(context.parsedRef)}" target="${litRender.ifDefined(context.target)}" rel="${litRender.ifDefined(context._rel)}" tabindex="${litRender.ifDefined(context.tabIndex)}" ?disabled="${context.disabled}" aria-label="${litRender.ifDefined(context.ariaLabelText)}" aria-haspopup="${litRender.ifDefined(context.ariaHaspopup)}" @focusin=${context._onfocusin} @focusout=${context._onfocusout} @click=${context._onclick} @keydown=${context._onkeydown} @keyup=${context._onkeyup}><slot></slot>${ context.hasLinkType ? block1(context) : undefined }</a>`;
	const block1 = (context, tags, suffix) => litRender.html`<span class="ui5-hidden-text">${litRender.ifDefined(context.linkTypeText)}</span>`;

	return block0;

});
