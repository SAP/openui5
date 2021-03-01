sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="${litRender.classMap(context.classes.main)}" dir="${ifDefined__default(context.effectiveDir)}" role="region" aria-label="${ifDefined__default(context.ariaLabelText)}" aria-labelledby="${ifDefined__default(context.ariaLabelledByCard)}">${ context.hasHeader ? block1(context) : undefined }<section role="group" aria-label="${ifDefined__default(context.ariaCardContentLabel)}"><slot></slot></section><span id="${ifDefined__default(context._id)}-desc" class="ui5-hidden-text">${ifDefined__default(context.ariaCardRoleDescription)}</span></div>`; };
	const block1 = (context) => { return litRender.html`<div class="${litRender.classMap(context.classes.header)}" @click="${context._headerClick}" @keydown="${context._headerKeydown}" @keyup="${context._headerKeyup}" role="${ifDefined__default(context.ariaHeaderRole)}" aria-labelledby="${ifDefined__default(context.ariaLabelledByHeader)}" aria-level="${ifDefined__default(context.ariaLevel)}" aria-roledescription="${ifDefined__default(context.ariaCardHeaderRoleDescription)}" tabindex="0">${ context.hasAvatar ? block2(context) : undefined }<div class="ui5-card-header-text">${ context.titleText ? block3(context) : undefined }${ context.subtitleText ? block4(context) : undefined }</div>${ context.hasAction ? block5() : block6(context) }</div>`; };
	const block2 = (context) => { return litRender.html`<div id="${ifDefined__default(context._id)}-avatar" class="ui5-card-avatar" aria-label="${ifDefined__default(context.ariaCardAvatarLabel)}"><slot name="avatar"></slot></div>`; };
	const block3 = (context) => { return litRender.html`<div id="${ifDefined__default(context._id)}-title" class="ui5-card-title" part="title">${ifDefined__default(context.titleText)}</div>`; };
	const block4 = (context) => { return litRender.html`<div id="${ifDefined__default(context._id)}-subtitle" class="ui5-card-subtitle" part="subtitle">${ifDefined__default(context.subtitleText)}</div>`; };
	const block5 = (context) => { return litRender.html`<slot name="action"></slot>`; };
	const block6 = (context) => { return litRender.html`<span id="${ifDefined__default(context._id)}-status" part="status" class="ui5-card-status">${ifDefined__default(context.status)}</span>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
