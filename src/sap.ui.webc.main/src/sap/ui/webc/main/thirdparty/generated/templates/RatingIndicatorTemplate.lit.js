sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-rating-indicator-root" role="slider" aria-roledescription="${ifDefined__default(context._ariaRoleDescription)}" aria-valuemin="0" aria-valuenow="${ifDefined__default(context.value)}" aria-valuemax="${ifDefined__default(context.maxValue)}" aria-orientation="horizontal" aria-disabled="${ifDefined__default(context._ariaDisabled)}" aria-readonly="${ifDefined__default(context.ariaReadonly)}" tabindex="${ifDefined__default(context.tabIndex)}" @focusin="${context._onfocusin}" @focusout="${context._onfocusout}" @click="${context._onclick}" @keydown="${context._onkeydown}" title="${ifDefined__default(context.tooltip)}" aria-label="${ifDefined__default(context.ariaLabel)}"><div class="ui5-rating-indicator-stars-wrapper">${ litRender.repeat(context._stars, (item, index) => item._id || index, (item, index) => block1(item)) }</div></div>`; };
	const block1 = (item, index, context) => { return litRender.html`${ item.selected ? block2(item) : block3(item) }`; };
	const block2 = (item, index, context) => { return litRender.html`<div class="ui5-rating-indicator-icon ui5-rating-indicator-active-icon" data-value="${ifDefined__default(item.index)}">&#9733;</div>`; };
	const block3 = (item, index, context) => { return litRender.html`${ item.halfStar ? block4(item) : block5(item) }`; };
	const block4 = (item, index, context) => { return litRender.html`<div class="ui5-rating-indicator-icon ui5-rating-indicator-half-icon" data-value="${ifDefined__default(item.index)}">&#9734;</div>`; };
	const block5 = (item, index, context) => { return litRender.html`<div class="ui5-rating-indicator-icon" data-value="${ifDefined__default(item.index)}">&#9734;</div>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
