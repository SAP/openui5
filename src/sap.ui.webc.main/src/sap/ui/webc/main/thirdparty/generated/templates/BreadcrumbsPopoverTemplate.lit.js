sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-responsive-popover", tags, suffix)} hide-arrow content-only-on-desktop placement-type="Bottom" horizontal-align="Left" with-padding _hide-header @keydown="${context._onkeydown}"><${litRender.scopeTag("ui5-list", tags, suffix)} mode="SingleSelectAuto" separators="None" @ui5-item-press="${litRender.ifDefined(context._onOverflowListItemSelect)}">${ litRender.repeat(context._overflowItemsData, (item, index) => item._id || index, (item, index) => block1(item, index, context, tags, suffix)) }</${litRender.scopeTag("ui5-list", tags, suffix)}><div slot="footer" class="ui5-breadcrumbs-popover-footer"><${litRender.scopeTag("ui5-button", tags, suffix)} design="Transparent" @click="${context._closeRespPopover}">${litRender.ifDefined(context._cancelButtonText)}</${litRender.scopeTag("ui5-button", tags, suffix)}></div></${litRender.scopeTag("ui5-responsive-popover", tags, suffix)}>`;
	const block1 = (item, index, context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-li", tags, suffix)} id="${litRender.ifDefined(item._id)}-li" accessible-name="${litRender.ifDefined(item.accessibleName)}" data-ui5-stable="${litRender.ifDefined(item.stableDomRef)}">${litRender.ifDefined(item.textContent)}</${litRender.scopeTag("ui5-li", tags, suffix)}>`;

	return block0;

});
