sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<li id="${litRender.ifDefined(context._id)}" class="${litRender.ifDefined(context.headerClasses)}" tabindex="${litRender.ifDefined(context._tabIndex)}" role="tab" aria-posinset="${litRender.ifDefined(context._posinset)}" aria-setsize="${litRender.ifDefined(context._setsize)}" aria-controls="ui5-tc-contentItem-${litRender.ifDefined(context._posinset)}" aria-selected="${litRender.ifDefined(context.effectiveSelected)}" aria-disabled="${litRender.ifDefined(context.effectiveDisabled)}" ?disabled="${context.effectiveDisabled}" aria-labelledby="${litRender.ifDefined(context.ariaLabelledBy)}" data-ui5-stable="${litRender.ifDefined(context.stableDomRef)}" style="list-style-type: none;">${ context.icon ? block1(context, tags, suffix) : undefined }<div class="ui5-tab-strip-itemContent">${ !context._isInline ? block2(context) : undefined }${ context.text ? block4(context) : undefined }${ context._isInline ? block5(context) : undefined }</div></li><!-- Additional text --> `;
	const block1 = (context, tags, suffix) => litRender.html`<div class="ui5-tab-strip-item-icon-outer"><${litRender.scopeTag("ui5-icon", tags, suffix)} name="${litRender.ifDefined(context.icon)}" class="ui5-tab-strip-item-icon"></${litRender.scopeTag("ui5-icon", tags, suffix)}></div>`;
	const block2 = (context, tags, suffix) => litRender.html`${ context.additionalText ? block3(context) : undefined }`;
	const block3 = (context, tags, suffix) => litRender.html`<span class="ui5-tab-strip-itemAdditionalText" id="${litRender.ifDefined(context._id)}-additionalText">${litRender.ifDefined(context.additionalText)}</span>`;
	const block4 = (context, tags, suffix) => litRender.html`<span class="ui5-tab-strip-itemText" id="${litRender.ifDefined(context._id)}-text"><span class="${litRender.ifDefined(context.headerSemanticIconClasses)}"></span>${litRender.ifDefined(context.text)}</span>`;
	const block5 = (context, tags, suffix) => litRender.html`${ context.additionalText ? block6(context) : undefined }`;
	const block6 = (context, tags, suffix) => litRender.html`<span class="ui5-tab-strip-itemAdditionalText" id="${litRender.ifDefined(context._id)}-additionalText">${litRender.ifDefined(context.additionalText)}</span>`;

	return block0;

});
