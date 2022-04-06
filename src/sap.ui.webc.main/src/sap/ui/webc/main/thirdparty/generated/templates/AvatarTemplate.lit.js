sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="ui5-avatar-root" tabindex="${litRender.ifDefined(context.tabindex)}" data-sap-focus-ref @keyup=${context._onkeyup} @keydown=${context._onkeydown} @focusout=${context._onfocusout} @focusin=${context._onfocusin} @click=${context._onclick} role="${litRender.ifDefined(context._role)}" aria-haspopup="${litRender.ifDefined(context._ariaHasPopup)}">${ context.hasImage ? block1() : block2(context, tags, suffix) }</div>`;
	const block1 = (context, tags, suffix) => litRender.html`<slot></slot>`;
	const block2 = (context, tags, suffix) => litRender.html`${ context.icon ? block3(context, tags, suffix) : block4(context) }`;
	const block3 = (context, tags, suffix) => suffix ? litRender.html`<${litRender.scopeTag("ui5-icon", tags, suffix)} class="ui5-avatar-icon" name="${litRender.ifDefined(context.icon)}" accessible-name="${litRender.ifDefined(context.accessibleNameText)}"></${litRender.scopeTag("ui5-icon", tags, suffix)}>` : litRender.html`<ui5-icon class="ui5-avatar-icon" name="${litRender.ifDefined(context.icon)}" accessible-name="${litRender.ifDefined(context.accessibleNameText)}"></ui5-icon>`;
	const block4 = (context, tags, suffix) => litRender.html`${ context.initials ? block5(context) : undefined }`;
	const block5 = (context, tags, suffix) => litRender.html`<span class="ui5-avatar-initials">${litRender.ifDefined(context.validInitials)}</span>`;

	return block0;

});
