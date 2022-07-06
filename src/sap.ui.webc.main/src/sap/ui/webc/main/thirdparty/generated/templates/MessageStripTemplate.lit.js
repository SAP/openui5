sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="${litRender.classMap(context.classes.root)}" id="${litRender.ifDefined(context._id)}" role="note" aria-live="assertive" aria-labelledby="${litRender.ifDefined(context._id)}">${ !context.hideIcon ? block1(context, tags, suffix) : undefined }<span class="ui5-hidden-text">${litRender.ifDefined(context.hiddenText)}</span><span class="ui5-message-strip-text"><slot></slot></span>${ !context.hideCloseButton ? block4(context, tags, suffix) : undefined }</div>`;
	const block1 = (context, tags, suffix) => litRender.html`<div class="ui5-message-strip-icon-wrapper" aria-hidden="true">${ context.iconProvided ? block2() : block3(context, tags, suffix) }</div>`;
	const block2 = (context, tags, suffix) => litRender.html`<slot name="icon"></slot>`;
	const block3 = (context, tags, suffix) => suffix ? litRender.html`<${litRender.scopeTag("ui5-icon", tags, suffix)} name="${litRender.ifDefined(context.standardIconName)}" class="ui5-message-strip-icon"></${litRender.scopeTag("ui5-icon", tags, suffix)}>` : litRender.html`<ui5-icon name="${litRender.ifDefined(context.standardIconName)}" class="ui5-message-strip-icon"></ui5-icon>`;
	const block4 = (context, tags, suffix) => suffix ? litRender.html`<${litRender.scopeTag("ui5-button", tags, suffix)} icon="decline" design="Transparent" class="ui5-message-strip-close-button" tooltip="${litRender.ifDefined(context._closeButtonText)}" @click=${context._closeClick}></${litRender.scopeTag("ui5-button", tags, suffix)}>` : litRender.html`<ui5-button icon="decline" design="Transparent" class="ui5-message-strip-close-button" tooltip="${litRender.ifDefined(context._closeButtonText)}" @click=${context._closeClick}></ui5-button>`;

	return block0;

});
