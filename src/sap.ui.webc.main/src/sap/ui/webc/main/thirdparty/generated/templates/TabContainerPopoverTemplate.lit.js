sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-responsive-popover", tags, suffix)} id="${litRender.ifDefined(context._id)}-overflowMenu" horizontal-align="Right" placement-type="Bottom" content-only-on-desktop hide-arrow _hide-header class="ui5-tab-container-responsive-popover"><${litRender.scopeTag("ui5-list", tags, suffix)} mode="SingleSelect" separators="None" @ui5-item-click="${litRender.ifDefined(context._onOverflowListItemClick)}">${ context._endOverflowItems.length ? block1(context) : block3(context) }</${litRender.scopeTag("ui5-list", tags, suffix)}><div slot="footer" class="ui5-responsive-popover-footer"><${litRender.scopeTag("ui5-button", tags, suffix)} design="Transparent" @click="${context._closeRespPopover}">Cancel</${litRender.scopeTag("ui5-button", tags, suffix)}></div></${litRender.scopeTag("ui5-responsive-popover", tags, suffix)}>`;
	const block1 = (context, tags, suffix) => litRender.html`${ litRender.repeat(context._endOverflowItems, (item, index) => item._id || index, (item, index) => block2(item)) }`;
	const block2 = (item, index, context, tags, suffix) => litRender.html`${litRender.ifDefined(item.overflowPresentation)}`;
	const block3 = (context, tags, suffix) => litRender.html`${ litRender.repeat(context._startOverflowItems, (item, index) => item._id || index, (item, index) => block4(item)) }`;
	const block4 = (item, index, context, tags, suffix) => litRender.html`${litRender.ifDefined(item.overflowPresentation)}`;

	return block0;

});
