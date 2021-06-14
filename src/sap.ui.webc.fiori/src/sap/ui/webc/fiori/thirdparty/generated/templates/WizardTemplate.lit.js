sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-wiz-root" aria-label="${ifDefined__default(context.ariaLabelText)}" role="region"><nav class="ui5-wiz-nav" aria-label="${ifDefined__default(context.navAriaLabelText)}" tabindex="-1"><div class="ui5-wiz-nav-list" role="list" aria-label="${ifDefined__default(context.listAriaLabelText)}" aria-controls="${ifDefined__default(context._id)}-wiz-content">${ litRender.repeat(context._stepsInHeader, (item, index) => item._id || index, (item, index) => block1(item, index, context)) }</div></nav><div id="${ifDefined__default(context._id)}-wiz-content" class="ui5-wiz-content" @scroll="${context.onScroll}">${ litRender.repeat(context._steps, (item, index) => item._id || index, (item, index) => block2(item)) }</div></div>`; };
	const block1 = (item, index, context) => { return litRender.html`<ui5-wizard-tab title-text="${ifDefined__default(item.titleText)}" subtitle-text="${ifDefined__default(item.subtitleText)}" icon="${ifDefined__default(item.icon)}" number="${ifDefined__default(item.number)}" ?disabled="${item.disabled}" ?selected="${item.selected}" ?hide-separator="${item.hideSeparator}" ?active-separator="${item.activeSeparator}" ?branching-separator="${item.branchingSeparator}" ._wizardTabAccInfo="${ifDefined__default(item.accInfo)}" data-ui5-content-ref-id="${ifDefined__default(item.refStepId)}" data-ui5-index="${ifDefined__default(item.pos)}" _tab-index="${ifDefined__default(item.tabIndex)}" @ui5-selection-change-requested="${ifDefined__default(context.onSelectionChangeRequested)}" @ui5-focused="${ifDefined__default(context.onStepInHeaderFocused)}" @click="${context._onGroupedTabClick}" style=${ifDefined__default(item.styles)}></ui5-wizard-tab>`; };
	const block2 = (item, index, context) => { return litRender.html`<div class="ui5-wiz-content-item" ?hidden="${item.disabled}" ?selected="${item.selected}" ?stretch="${item.stretch}" data-ui5-content-item-ref-id="${ifDefined__default(item._id)}"><slot name="${ifDefined__default(item._individualSlot)}"></slot></div>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
