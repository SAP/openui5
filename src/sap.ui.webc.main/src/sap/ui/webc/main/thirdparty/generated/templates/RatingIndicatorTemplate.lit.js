sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="ui5-rating-indicator-root" role="slider" aria-roledescription="${litRender.ifDefined(context._ariaRoleDescription)}" aria-valuemin="0" aria-valuenow="${litRender.ifDefined(context.value)}" aria-valuemax="${litRender.ifDefined(context.max)}" aria-orientation="horizontal" aria-disabled="${litRender.ifDefined(context._ariaDisabled)}" aria-readonly="${litRender.ifDefined(context.ariaReadonly)}" tabindex="${litRender.ifDefined(context.tabIndex)}" @focusin="${context._onfocusin}" @focusout="${context._onfocusout}" @click="${context._onclick}" @keydown="${context._onkeydown}" title="${litRender.ifDefined(context.tooltip)}" aria-label="${litRender.ifDefined(context.accessibleName)}"><div class="ui5-rating-indicator-stars-wrapper">${ litRender.repeat(context._stars, (item, index) => item._id || index, (item, index) => block1(item)) }</div></div>`;
	const block1 = (item, index, context, tags, suffix) => litRender.html`${ item.selected ? block2(item) : block3(item) }`;
	const block2 = (item, index, context, tags, suffix) => litRender.html`<div class="ui5-rating-indicator-icon ui5-rating-indicator-active-icon" data-value="${litRender.ifDefined(item.index)}">&#9733;</div>`;
	const block3 = (item, index, context, tags, suffix) => litRender.html`${ item.halfStar ? block4(item) : block5(item) }`;
	const block4 = (item, index, context, tags, suffix) => litRender.html`<div class="ui5-rating-indicator-icon ui5-rating-indicator-half-icon" data-value="${litRender.ifDefined(item.index)}">&#9734;</div>`;
	const block5 = (item, index, context, tags, suffix) => litRender.html`<div class="ui5-rating-indicator-icon" data-value="${litRender.ifDefined(item.index)}">&#9734;</div>`;

	return block0;

});
