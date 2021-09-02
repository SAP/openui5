sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="ui5-progress-indicator-root ${litRender.classMap(context.classes.root)}" dir="${litRender.ifDefined(context.effectiveDir)}" role="progressbar" aria-valuemin="0" aria-valuenow="${litRender.ifDefined(context.validatedValue)}" aria-valuemax="100" aria-valuetext="${litRender.ifDefined(context.valueStateText)}" aria-disabled="${litRender.ifDefined(context._ariaDisabled)}"><div class="ui5-progress-indicator-bar" style="${litRender.styleMap(context.styles.bar)}">${ !context.showValueInRemainingBar ? block1(context, tags, suffix) : undefined }</div><div class="ui5-progress-indicator-remaining-bar">${ context.showValueInRemainingBar ? block4(context, tags, suffix) : undefined }</div></div>`;
	const block1 = (context, tags, suffix) => litRender.html`${ context.showIcon ? block2(context, tags, suffix) : undefined }${ !context.hideValue ? block3(context) : undefined }`;
	const block2 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-icon", tags, suffix)} name="${litRender.ifDefined(context.valueStateIcon)}" class="ui5-progress-indicator-icon"></${litRender.scopeTag("ui5-icon", tags, suffix)}>`;
	const block3 = (context, tags, suffix) => litRender.html`<span class="ui5-progress-indicator-value">${litRender.ifDefined(context.validatedValue)}%</span>`;
	const block4 = (context, tags, suffix) => litRender.html`${ context.showIcon ? block5(context, tags, suffix) : undefined }${ !context.hideValue ? block6(context) : undefined }`;
	const block5 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-icon", tags, suffix)} name="${litRender.ifDefined(context.valueStateIcon)}" class="ui5-progress-indicator-icon"></${litRender.scopeTag("ui5-icon", tags, suffix)}>`;
	const block6 = (context, tags, suffix) => litRender.html`<span class="ui5-progress-indicator-value">${litRender.ifDefined(context.validatedValue)}%</span>`;

	return block0;

});
