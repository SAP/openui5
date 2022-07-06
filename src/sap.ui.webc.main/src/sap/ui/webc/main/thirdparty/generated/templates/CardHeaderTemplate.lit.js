sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div id="${litRender.ifDefined(context._id)}--header" class="${litRender.classMap(context.classes)}" role="group" aria-roledescription="${litRender.ifDefined(context.ariaRoleDescription)}" @click="${context._click}" @keydown="${context._keydown}" @keyup="${context._keyup}"><div class="ui5-card-header-focusable-element" aria-labelledby="${litRender.ifDefined(context.ariaLabelledBy)}" role="${litRender.ifDefined(context.ariaRoleFocusableElement)}" data-sap-focus-ref tabindex="0">${ context.hasAvatar ? block1(context) : undefined }<div class="ui5-card-header-text"><div class="ui5-card-header-first-line">${ context.titleText ? block2(context) : undefined }${ context.status ? block3(context) : undefined }</div>${ context.subtitleText ? block4(context) : undefined }</div></div>${ context.hasAction ? block5(context) : undefined }</div></div>`;
	const block1 = (context, tags, suffix) => litRender.html`<div id="${litRender.ifDefined(context._id)}-avatar" class="ui5-card-header-avatar" aria-label="${litRender.ifDefined(context.ariaCardAvatarLabel)}"><slot name="avatar"></slot></div>`;
	const block2 = (context, tags, suffix) => litRender.html`<div id="${litRender.ifDefined(context._id)}-title" class="ui5-card-header-title" part="title" aria-role="heading" aria-level="3">${litRender.ifDefined(context.titleText)}</div>`;
	const block3 = (context, tags, suffix) => litRender.html`<div class="ui5-card-header-status"><span id="${litRender.ifDefined(context._id)}-status" part="status" dir="auto">${litRender.ifDefined(context.status)}</span></div>`;
	const block4 = (context, tags, suffix) => litRender.html`<div id="${litRender.ifDefined(context._id)}-subtitle" class="ui5-card-header-subtitle" part="subtitle">${litRender.ifDefined(context.subtitleText)}</div>`;
	const block5 = (context, tags, suffix) => litRender.html`<div class="ui5-card-header-action" @focusin="${context._actionsFocusin}" @focusout="${context._actionsFocusout}"><slot name="action"></slot></div>`;

	return block0;

});
