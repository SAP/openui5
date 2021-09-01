sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-popover", tags, suffix)} class="ui5-notification-overflow-popover" placement-type="Bottom" horizontal-align="Right" hide-arrow><div class="ui5-notification-overflow-list">${ litRender.repeat(context.overflowActions, (item, index) => item._id || index, (item, index) => block1(item, index, context, tags, suffix)) }</div></${litRender.scopeTag("ui5-popover", tags, suffix)}>`;
	const block1 = (item, index, context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-button", tags, suffix)} icon="${litRender.ifDefined(item.icon)}" design="Transparent" @click="${item.press}" ?disabled="${item.disabled}" design="${litRender.ifDefined(item.design)}" data-ui5-external-action-item-id="${litRender.ifDefined(item.refItemid)}">${litRender.ifDefined(item.text)}</${litRender.scopeTag("ui5-button", tags, suffix)}>`;

	return block0;

});
