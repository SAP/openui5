sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-avatar-root" tabindex="${ifDefined__default(context.tabindex)}" data-sap-focus-ref @keyup=${context._onkeyup} @keydown=${context._onkeydown} @focusout=${context._onfocusout} @focusin=${context._onfocusin} @click=${context._onclick} role="${ifDefined__default(context._role)}" aria-haspopup="${ifDefined__default(context._ariaHasPopup)}">${ context.image ? block1(context) : block2(context) }</div>`; };
	const block1 = (context) => { return litRender.html`<span class="ui5-avatar-img" style="${litRender.styleMap(context.styles.img)}" role="img" aria-label="${ifDefined__default(context.accessibleNameText)}"></span>`; };
	const block2 = (context) => { return litRender.html`${ context.icon ? block3(context) : block4(context) }`; };
	const block3 = (context) => { return litRender.html`<ui5-icon class="ui5-avatar-icon" name="${ifDefined__default(context.icon)}" accessible-name="${ifDefined__default(context.accessibleNameText)}"></ui5-icon>`; };
	const block4 = (context) => { return litRender.html`${ context.initials ? block5(context) : undefined }`; };
	const block5 = (context) => { return litRender.html`<span class="ui5-avatar-initials">${ifDefined__default(context.validInitials)}</span>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
