sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-avatar-group-root"><div class="ui5-avatar-group-items" @keyup="${context._onkeyup}" @keydown="${context._onkeydown}" @focusin="${context._onfocusin}" tabindex="${ifDefined__default(context._groupTabIndex)}" @click="${context._onClick}" @ui5-click="${ifDefined__default(context._onUI5Click)}" aria-label="${ifDefined__default(context._ariaLabelText)}" role="${ifDefined__default(context._role)}" aria-haspopup="${ifDefined__default(context._containerAriaHasPopup)}"><slot></slot>${ context._customOverflowButton ? block1() : block2(context) }</div></div>`; };
	const block1 = (context) => { return litRender.html`<slot name="overflowButton"></slot>`; };
	const block2 = (context) => { return litRender.html`<ui5-button ._buttonAccInfo="${ifDefined__default(context._overflowButtonAccInfo)}" aria-label="${ifDefined__default(context._overflowButtonAriaLabelText)}" ?hidden="${context._overflowBtnHidden}" ?non-interactive=${context._isGroup} class="ui5-avatar-group-overflow-btn">${ifDefined__default(context._overflowButtonText)}</ui5-button>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
