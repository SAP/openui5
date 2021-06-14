sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<li id="${ifDefined__default(context._id)}" class="${ifDefined__default(context.headerClasses)}" tabindex="${ifDefined__default(context._tabIndex)}" role="tab" aria-posinset="${ifDefined__default(context._posinset)}" aria-setsize="${ifDefined__default(context._setsize)}" aria-controls="ui5-tc-contentItem-${ifDefined__default(context._posinset)}" aria-selected="${ifDefined__default(context.effectiveSelected)}" aria-disabled="${ifDefined__default(context.effectiveDisabled)}" ?disabled="${context.effectiveDisabled}" aria-labelledby="${ifDefined__default(context.ariaLabelledBy)}" data-ui5-stable="${ifDefined__default(context.stableDomRef)}" style="list-style-type: none;">${ context.icon ? block1(context) : undefined }<div class="ui5-tab-strip-itemContent">${ !context._isInline ? block2(context) : undefined }${ context.text ? block4(context) : undefined }${ context._isInline ? block5(context) : undefined }</div></li><!-- Additional text --> `; };
	const block1 = (context) => { return litRender.html`<div class="ui5-tab-strip-item-icon-outer"><ui5-icon name="${ifDefined__default(context.icon)}" class="ui5-tab-strip-item-icon"></ui5-icon></div>`; };
	const block2 = (context) => { return litRender.html`${ context.additionalText ? block3(context) : undefined }`; };
	const block3 = (context) => { return litRender.html`<span class="ui5-tab-strip-itemAdditionalText" id="${ifDefined__default(context._id)}-additionalText">${ifDefined__default(context.additionalText)}</span>`; };
	const block4 = (context) => { return litRender.html`<span class="ui5-tab-strip-itemText" id="${ifDefined__default(context._id)}-text"><span class="${ifDefined__default(context.headerSemanticIconClasses)}"></span>${ifDefined__default(context.text)}</span>`; };
	const block5 = (context) => { return litRender.html`${ context.additionalText ? block6(context) : undefined }`; };
	const block6 = (context) => { return litRender.html`<span class="ui5-tab-strip-itemAdditionalText" id="${ifDefined__default(context._id)}-additionalText">${ifDefined__default(context.additionalText)}</span>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
