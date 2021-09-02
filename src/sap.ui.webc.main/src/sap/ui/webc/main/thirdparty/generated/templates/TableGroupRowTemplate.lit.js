sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<tr class="ui5-table-group-row-root" part="group-row" role="row" aria-label=${litRender.ifDefined(context.ariaLabelText)} tabindex="${litRender.ifDefined(context._tabIndex)}" dir="${litRender.ifDefined(context.effectiveDir)}"><td colspan=${litRender.ifDefined(context.colSpan)}><slot></slot></td></tr>`;

	return block0;

});
