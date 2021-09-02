sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`${ context.targetSrc ? block1(context, tags, suffix) : block5(context, tags, suffix) }`;
	const block1 = (context, tags, suffix) => litRender.html`<a class="ui5-product-switch-item-root" data-sap-focus-ref @focusout="${context._onfocusout}" @focusin="${context._onfocusin}" @mousedown="${context._onmousedown}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" tabindex=${litRender.ifDefined(context._tabIndex)} href="${litRender.ifDefined(context.targetSrc)}" target="${litRender.ifDefined(context.target)}">${ context.icon ? block2(context, tags, suffix) : undefined }<span class="ui5-product-switch-item-text-content">${ context.titleText ? block3(context) : undefined }${ context.subtitleText ? block4(context) : undefined }</span></a>`;
	const block2 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-icon", tags, suffix)} class="ui5-product-switch-item-icon" name="${litRender.ifDefined(context.icon)}"></${litRender.scopeTag("ui5-icon", tags, suffix)}>`;
	const block3 = (context, tags, suffix) => litRender.html`<span class="ui5-product-switch-item-title">${litRender.ifDefined(context.titleText)}</span>`;
	const block4 = (context, tags, suffix) => litRender.html`<span class="ui5-product-switch-item-subtitle">${litRender.ifDefined(context.subtitleText)}</span>`;
	const block5 = (context, tags, suffix) => litRender.html`<div role="listitem" class="ui5-product-switch-item-root" data-sap-focus-ref @focusout="${context._onfocusout}" @focusin="${context._onfocusin}" @mousedown="${context._onmousedown}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" tabindex=${litRender.ifDefined(context._tabIndex)}>${ context.icon ? block6(context, tags, suffix) : undefined }<span class="ui5-product-switch-item-text-content">${ context.titleText ? block7(context) : undefined }${ context.subtitleText ? block8(context) : undefined }</span></div>`;
	const block6 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-icon", tags, suffix)} class="ui5-product-switch-item-icon" name="${litRender.ifDefined(context.icon)}"></${litRender.scopeTag("ui5-icon", tags, suffix)}>`;
	const block7 = (context, tags, suffix) => litRender.html`<span class="ui5-product-switch-item-title">${litRender.ifDefined(context.titleText)}</span>`;
	const block8 = (context, tags, suffix) => litRender.html`<span class="ui5-product-switch-item-subtitle">${litRender.ifDefined(context.subtitleText)}</span>`;

	return block0;

});
