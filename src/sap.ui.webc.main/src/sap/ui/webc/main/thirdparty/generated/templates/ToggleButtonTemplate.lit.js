sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<button type="button" class="ui5-button-root" ?disabled="${context.disabled}" data-sap-focus-ref  aria-pressed="${ifDefined__default(context.pressed)}"  dir="${ifDefined__default(context.effectiveDir)}" @focusout=${context._onfocusout} @focusin=${context._onfocusin} @click=${context._onclick} @mousedown=${context._onmousedown} @mouseup=${context._onmouseup} @keydown=${context._onkeydown} @keyup=${context._onkeyup} @touchstart="${context._ontouchstart}" @touchend="${context._ontouchend}" tabindex=${ifDefined__default(context.tabIndexValue)} aria-expanded="${ifDefined__default(context.accInfo.ariaExpanded)}" aria-controls="${ifDefined__default(context.accInfo.ariaControls)}" aria-haspopup="${ifDefined__default(context.accInfo.ariaHaspopup)}" aria-label="${ifDefined__default(context.ariaLabelText)}" title="${ifDefined__default(context.accInfo.title)}" part="button">${ context.icon ? block1(context) : undefined }<span id="${ifDefined__default(context._id)}-content" class="ui5-button-text"><bdi><slot></slot></bdi></span>${ context.hasButtonType ? block2(context) : undefined }</button> `; };
	const block1 = (context) => { return litRender.html`<ui5-icon class="ui5-button-icon" name="${ifDefined__default(context.icon)}" part="icon" ?show-tooltip=${context.showIconTooltip}></ui5-icon>`; };
	const block2 = (context) => { return litRender.html`<span class="ui5-hidden-text">${ifDefined__default(context.buttonTypeText)}</span>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
