sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="ui5-cp-item" style="background-color: ${litRender.ifDefined(context.value)}" value="${litRender.ifDefined(context.value)}" tabindex="${litRender.ifDefined(context._tabIndex)}" role="button" aria-label="${litRender.ifDefined(context.colorLabel)} - ${litRender.ifDefined(context.index)}: ${litRender.ifDefined(context.value)}" title="${litRender.ifDefined(context.colorLabel)} - ${litRender.ifDefined(context.index)}: ${litRender.ifDefined(context.value)}" ?disabled="${context._disabled}"></div>`;

	return block0;

});
