sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div tabindex="${litRender.ifDefined(context._tabIndex)}" @click="${context._handleSelect}" @focusin="${context._focusin}" @focusout="${context._focusout}" @keydown="${context._keydown}" class="ui5-token--wrapper" role="option" aria-selected="${litRender.ifDefined(context.selected)}"><span class="ui5-token--text">${litRender.ifDefined(context.text)}</span>${ !context.readonly ? block1(context, tags, suffix) : undefined }</div>`;
	const block1 = (context, tags, suffix) => litRender.html`<div class="ui5-token--icon" @click="${context._delete}">${ context.closeIcon.length ? block2() : block3(context, tags, suffix) }</div>`;
	const block2 = (context, tags, suffix) => litRender.html`<slot name="closeIcon"></slot>`;
	const block3 = (context, tags, suffix) => suffix ? litRender.html`<${litRender.scopeTag("ui5-icon", tags, suffix)} name="${litRender.ifDefined(context.iconURI)}" accessible-name="${litRender.ifDefined(context.tokenDeletableText)}" show-tooltip></${litRender.scopeTag("ui5-icon", tags, suffix)}>` : litRender.html`<ui5-icon name="${litRender.ifDefined(context.iconURI)}" accessible-name="${litRender.ifDefined(context.tokenDeletableText)}" show-tooltip></ui5-icon>`;

	return block0;

});
