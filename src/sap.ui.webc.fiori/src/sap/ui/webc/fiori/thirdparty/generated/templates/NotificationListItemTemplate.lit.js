sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<li class="ui5-nli-root ui5-nli-focusable" @focusin="${context._onfocusin}" @focusout="${context._onfocusout}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" @click="${context._onclick}" role="option" tabindex="${ifDefined__default(context._tabIndex)}" dir="${ifDefined__default(context.effectiveDir)}" aria-labelledby="${ifDefined__default(context.ariaLabelledBy)}" style="list-style-type: none;"><div class="ui5-nli-actions">${ context.showOverflow ? block1(context) : block2(context) }${ context.showClose ? block4(context) : undefined }</div><div class="ui5-nli-content ${litRender.classMap(context.classes.content)}"><div class="ui5-nli-heading-wrapper">${ context.hasPriority ? block5(context) : undefined }<div id="${ifDefined__default(context._id)}-heading" class="ui5-nli-heading" part="heading">${ifDefined__default(context.heading)}</div></div>${ context.hasDesc ? block6(context) : undefined }<div id="${ifDefined__default(context._id)}-footer" class="ui5-nli-footer">${ litRender.repeat(context.footerItems, (item, index) => item._id || index, (item, index) => block7(item)) }<ui5-link class="ui5-nli-footer-showMore" ?hidden="${context.hideShowMore}" @click="${context._onShowMoreClick}" aria-hidden="true" href="#"  showMore-btn>${ifDefined__default(context.showMoreText)}</ui5-link></div><span id="${ifDefined__default(context._id)}-invisibleText" class="ui5-hidden-text">${ifDefined__default(context.accInvisibleText)}</span></div><div class="ui5-nli-avatar"><slot name="avatar"></slot></div>${ context.busy ? block9() : undefined }</li>`; };
	const block1 = (context) => { return litRender.html`<ui5-button icon="overflow" design="Transparent" @click="${context._onBtnOverflowClick}" class="ui5-nli-overflow-btn" title="${ifDefined__default(context.overflowBtnAccessibleName)}" aria-label="${ifDefined__default(context.overflowBtnAccessibleName)}"></ui5-button>`; };
	const block2 = (context) => { return litRender.html`${ litRender.repeat(context.standardActions, (item, index) => item._id || index, (item, index) => block3(item)) }`; };
	const block3 = (item, index, context) => { return litRender.html`<ui5-button icon="${ifDefined__default(item.icon)}" class="ui5-nli-action" @click="${item.press}" ?disabled="${item.disabled}" design="${ifDefined__default(item.design)}" data-ui5-external-action-item-id="${ifDefined__default(item.refItemid)}">${ifDefined__default(item.text)}</ui5-button>`; };
	const block4 = (context) => { return litRender.html`<ui5-button icon="decline" design="Transparent" @click="${context._onBtnCloseClick}" title="${ifDefined__default(context.closeBtnAccessibleName)}" aria-label="${ifDefined__default(context.closeBtnAccessibleName)}" close-btn></ui5-button>`; };
	const block5 = (context) => { return litRender.html`<ui5-icon class="ui5-prio-icon ui5-prio-icon--${ifDefined__default(context.priorityIcon)}" name="${ifDefined__default(context.priorityIcon)}"></ui5-icon>`; };
	const block6 = (context) => { return litRender.html`<div id="${ifDefined__default(context._id)}-description" class="ui5-nli-description"><slot></slot></div>`; };
	const block7 = (item, index, context) => { return litRender.html`<slot name="${ifDefined__default(item.slotName)}"></slot>${ item.showDivider ? block8() : undefined }`; };
	const block8 = (item, index, context) => { return litRender.html`<div class="ui5-nli-footer-divider"></div>`; };
	const block9 = (context) => { return litRender.html`<ui5-busy-indicator active size="Medium" class="ui5-nli-busy"></ui5-busy-indicator>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
