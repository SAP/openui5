sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-responsive-popover", tags, suffix)} id="${litRender.ifDefined(context._id)}-overflowMenu" horizontal-align="Right" placement-type="Bottom" content-only-on-desktop with-padding hide-arrow _hide-header><${litRender.scopeTag("ui5-list", tags, suffix)} @ui5-item-press="${litRender.ifDefined(context._onOverflowListItemSelect)}">${ litRender.repeat(context.items, (item, index) => item._id || index, (item, index) => block1(item)) }</${litRender.scopeTag("ui5-list", tags, suffix)}><div slot="footer" class="ui5-responsive-popover-footer"><${litRender.scopeTag("ui5-button", tags, suffix)} design="Transparent" @click="${context._closeRespPopover}">Cancel</${litRender.scopeTag("ui5-button", tags, suffix)}></div></${litRender.scopeTag("ui5-responsive-popover", tags, suffix)}>`;
	const block1 = (item, index, context, tags, suffix) => litRender.html`${ !item.isSeparator ? block2(item) : undefined }`;
	const block2 = (item, index, context, tags, suffix) => litRender.html`${litRender.ifDefined(item.overflowPresentation)}`;

	return block0;

});
