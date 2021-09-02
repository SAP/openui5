sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-responsive-popover", tags, suffix)} vertical-align="Top"><${litRender.scopeTag("ui5-list", tags, suffix)} mode="None" @ui5-item-click="${litRender.ifDefined(context.handleListItemClick)}"><${litRender.scopeTag("ui5-li", tags, suffix)} ?selected="${context._popoverContent.mainItemSelected}" .associatedItem="${litRender.ifDefined(context._popoverContent.mainItem)}">${litRender.ifDefined(context._popoverContent.mainItem.text)}</${litRender.scopeTag("ui5-li", tags, suffix)}>${ litRender.repeat(context._popoverContent.subItems, (item, index) => item._id || index, (item, index) => block1(item, index, context, tags, suffix)) }</${litRender.scopeTag("ui5-list", tags, suffix)}></${litRender.scopeTag("ui5-responsive-popover", tags, suffix)}>`;
	const block1 = (item, index, context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-li", tags, suffix)} ?selected="${item.selected}" .associatedItem="${litRender.ifDefined(item)}">${litRender.ifDefined(item.text)}</${litRender.scopeTag("ui5-li", tags, suffix)}>`;

	return block0;

});
