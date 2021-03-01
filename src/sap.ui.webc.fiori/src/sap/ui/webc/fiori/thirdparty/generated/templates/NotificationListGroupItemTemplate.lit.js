sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<li class="ui5-nli-group-root ui5-nli-focusable" @focusin="${context._onfocusin}" @focusout="${context._onfocusout}" @keydown="${context._onkeydown}" role="option" tabindex="${ifDefined__default(context._tabIndex)}" dir="${ifDefined__default(context.effectiveDir)}" aria-expanded="${ifDefined__default(context.ariaExpanded)}" aria-labelledby="${ifDefined__default(context.ariaLabelledBy)}" style="list-style-type: none;"><div class="ui5-nli-group-header"><ui5-button icon="navigation-right-arrow" design="Transparent" @click="${context._onBtnToggleClick}" class="ui5-nli-group-toggle-btn" title="${ifDefined__default(context.toggleBtnAccessibleName)}" aria-label="${ifDefined__default(context.toggleBtnAccessibleName)}"></ui5-button>${ context.hasPriority ? block1(context) : undefined }<div id="${ifDefined__default(context._id)}-heading" class="ui5-nli-group-heading" part="heading">${ifDefined__default(context.heading)}</div>${ context.showCounter ? block2(context) : undefined }<div class="ui5-nli-group-divider"></div>${ !context.collapsed ? block3(context) : undefined }${ context.showClose ? block7(context) : undefined }<span id="${ifDefined__default(context._id)}-invisibleText" class="ui5-hidden-text">${ifDefined__default(context.accInvisibleText)}</span></div><ui5-list class="ui5-nli-group-items"><slot></slot></ui5-list>${ context.busy ? block8() : undefined }</li>`; };
	const block1 = (context) => { return litRender.html`<ui5-icon class="ui5-prio-icon ui5-prio-icon--${ifDefined__default(context.priorityIcon)}" name="${ifDefined__default(context.priorityIcon)}"></ui5-icon>`; };
	const block2 = (context) => { return litRender.html`<span class="ui5-nli-group-counter">(${ifDefined__default(context.itemsCount)})</span>`; };
	const block3 = (context) => { return litRender.html`${ context.showOverflow ? block4(context) : block5(context) }`; };
	const block4 = (context) => { return litRender.html`<ui5-button icon="overflow" design="Transparent" @click="${context._onBtnOverflowClick}" class="ui5-nli-overflow-btn" title="${ifDefined__default(context.overflowBtnAccessibleName)}" aria-label="${ifDefined__default(context.overflowBtnAccessibleName)}"></ui5-button>`; };
	const block5 = (context) => { return litRender.html`${ litRender.repeat(context.standardActions, (item, index) => item._id || index, (item, index) => block6(item)) }`; };
	const block6 = (item, index, context) => { return litRender.html`<ui5-button icon="${ifDefined__default(item.icon)}" class="ui5-nli-action" ?disabled="${item.disabled}" design="${ifDefined__default(item.design)}" @click="${item.press}" data-ui5-external-action-item-id="${ifDefined__default(item.refItemid)}">${ifDefined__default(item.text)}</ui5-button>`; };
	const block7 = (context) => { return litRender.html`<ui5-button icon="decline" design="Transparent" @click="${context._onBtnCloseClick}" title="${ifDefined__default(context.closeBtnAccessibleName)}" aria-label="${ifDefined__default(context.closeBtnAccessibleName)}" close-btn></ui5-button>`; };
	const block8 = (context) => { return litRender.html`<ui5-busy-indicator active size="Medium" class="ui5-nli-busy"></ui5-busy-indicator>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
