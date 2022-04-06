sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="ui5-file-uploader-root" @mouseover="${context._onmouseover}" @mouseout="${context._onmouseout}" @focusin="${context._onfocusin}" @focusout="${context._onfocusout}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" @click="${context._onclick}"><div class="ui5-file-uploader-mask">${ !context.hideInput ? block1(context, tags, suffix) : undefined }<slot></slot></div>${ context._keepInputInShadowDOM ? block2(context) : block3() }</div>`;
	const block1 = (context, tags, suffix) => suffix ? litRender.html`<${litRender.scopeTag("ui5-input", tags, suffix)} value="${litRender.ifDefined(context.value)}" value-state="${litRender.ifDefined(context.valueState)}" placeholder="${litRender.ifDefined(context.placeholder)}" ?disabled="${context.disabled}" tabindex="-1" class="ui5-file-uploader-input"></${litRender.scopeTag("ui5-input", tags, suffix)}>` : litRender.html`<ui5-input value="${litRender.ifDefined(context.value)}" value-state="${litRender.ifDefined(context.valueState)}" placeholder="${litRender.ifDefined(context.placeholder)}" ?disabled="${context.disabled}" tabindex="-1" class="ui5-file-uploader-input"></ui5-input>`;
	const block2 = (context, tags, suffix) => litRender.html`<input type="file" title="${litRender.ifDefined(context.titleText)}" accept="${litRender.ifDefined(context.accept)}" ?multiple="${context.multiple}" ?disabled="${context.disabled}" @change="${context._onChange}" aria-hidden="true" tabindex="-1">`;
	const block3 = (context, tags, suffix) => litRender.html`<slot name="formSupport"></slot>`;

	return block0;

});
