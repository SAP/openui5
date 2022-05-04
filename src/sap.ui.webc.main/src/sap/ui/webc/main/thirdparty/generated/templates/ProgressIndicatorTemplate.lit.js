sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="ui5-progress-indicator-root ${litRender.classMap(context.classes.root)}" role="progressbar" aria-valuemin="0" aria-valuenow="${litRender.ifDefined(context.validatedValue)}" aria-valuemax="100" aria-valuetext="${litRender.ifDefined(context.valueStateText)}" aria-disabled="${litRender.ifDefined(context._ariaDisabled)}"><div class="ui5-progress-indicator-bar" style="${litRender.styleMap(context.styles.bar)}">${ !context.showValueInRemainingBar ? block1(context, tags, suffix) : undefined }</div><div class="ui5-progress-indicator-remaining-bar">${ context.showValueInRemainingBar ? block6(context, tags, suffix) : undefined }</div></div>`;
	const block1 = (context, tags, suffix) => litRender.html`${ context.showIcon ? block2(context, tags, suffix) : undefined }${ !context.hideValue ? block3(context) : undefined }`;
	const block2 = (context, tags, suffix) => suffix ? litRender.html`<${litRender.scopeTag("ui5-icon", tags, suffix)} name="${litRender.ifDefined(context.valueStateIcon)}" class="ui5-progress-indicator-icon"></${litRender.scopeTag("ui5-icon", tags, suffix)}>` : litRender.html`<ui5-icon name="${litRender.ifDefined(context.valueStateIcon)}" class="ui5-progress-indicator-icon"></ui5-icon>`;
	const block3 = (context, tags, suffix) => litRender.html`<span class="ui5-progress-indicator-value">${ context.displayValue ? block4(context) : block5(context) }</span>`;
	const block4 = (context, tags, suffix) => litRender.html`${litRender.ifDefined(context.displayValue)}`;
	const block5 = (context, tags, suffix) => litRender.html`${litRender.ifDefined(context.validatedValue)}% `;
	const block6 = (context, tags, suffix) => litRender.html`${ context.showIcon ? block7(context, tags, suffix) : undefined }${ !context.hideValue ? block8(context) : undefined }`;
	const block7 = (context, tags, suffix) => suffix ? litRender.html`<${litRender.scopeTag("ui5-icon", tags, suffix)} name="${litRender.ifDefined(context.valueStateIcon)}" class="ui5-progress-indicator-icon"></${litRender.scopeTag("ui5-icon", tags, suffix)}>` : litRender.html`<ui5-icon name="${litRender.ifDefined(context.valueStateIcon)}" class="ui5-progress-indicator-icon"></ui5-icon>`;
	const block8 = (context, tags, suffix) => litRender.html`<span class="ui5-progress-indicator-value">${ context.displayValue ? block9(context) : block10(context) }</span>`;
	const block9 = (context, tags, suffix) => litRender.html`${litRender.ifDefined(context.displayValue)}`;
	const block10 = (context, tags, suffix) => litRender.html`${litRender.ifDefined(context.validatedValue)}% `;

	return block0;

});
