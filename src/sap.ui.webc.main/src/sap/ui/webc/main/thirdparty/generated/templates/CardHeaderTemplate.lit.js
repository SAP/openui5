sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="${litRender.classMap(context.classes)}" @click="${context._headerClick}" @keydown="${context._headerKeydown}" @keyup="${context._headerKeyup}" role="${litRender.ifDefined(context.ariaHeaderRole)}" aria-labelledby="${litRender.ifDefined(context.ariaLabelledByHeader)}" aria-level="${litRender.ifDefined(context.ariaLevel)}" aria-roledescription="${litRender.ifDefined(context.ariaCardHeaderRoleDescription)}" tabindex="0" id="${litRender.ifDefined(context._id)}--header">${ context.hasAvatar ? block1(context) : undefined }<div class="ui5-card-header-text">${ context.titleText ? block2(context) : undefined }${ context.subtitleText ? block3(context) : undefined }</div>${ context.hasAction ? block4() : block5(context) }</div>`;
	const block1 = (context, tags, suffix) => litRender.html`<div id="${litRender.ifDefined(context._id)}-avatar" class="ui5-card-header-avatar" aria-label="${litRender.ifDefined(context.ariaCardAvatarLabel)}"><slot name="avatar"></slot></div>`;
	const block2 = (context, tags, suffix) => litRender.html`<div id="${litRender.ifDefined(context._id)}-title" class="ui5-card-header-title" part="title">${litRender.ifDefined(context.titleText)}</div>`;
	const block3 = (context, tags, suffix) => litRender.html`<div id="${litRender.ifDefined(context._id)}-subtitle" class="ui5-card-header-subtitle" part="subtitle">${litRender.ifDefined(context.subtitleText)}</div>`;
	const block4 = (context, tags, suffix) => litRender.html`<slot name="action"></slot>`;
	const block5 = (context, tags, suffix) => litRender.html`<span id="${litRender.ifDefined(context._id)}-status" part="status" class="ui5-card-header-status">${litRender.ifDefined(context.status)}</span>`;

	return block0;

});
