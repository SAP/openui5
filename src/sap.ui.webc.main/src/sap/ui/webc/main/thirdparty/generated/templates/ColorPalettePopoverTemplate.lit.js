sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-responsive-popover", tags, suffix)} hide-arrow content-only-on-desktop placement-type="Bottom"><div slot="header" class="ui5-cp-header"><${litRender.scopeTag("ui5-title", tags, suffix)} class="ui5-cp-title">${litRender.ifDefined(context._colorPaletteTitle)}</${litRender.scopeTag("ui5-title", tags, suffix)}></div><div><${litRender.scopeTag("ui5-color-palette", tags, suffix)} ?show-more-colors="${context.showMoreColors}" ?show-recent-colors="${context.showRecentColors}" ?show-default-color="${context.defaultColor}" default-color="${litRender.ifDefined(context.defaultColor)}" popup-mode @item-click="${context.onSelectedColor}">${ litRender.repeat(context.colorPaletteColors, (item, index) => item._id || index, (item, index) => block1(item)) }</${litRender.scopeTag("ui5-color-palette", tags, suffix)}></div><div slot="footer" class="ui5-cp-footer"><${litRender.scopeTag("ui5-button", tags, suffix)} design="Transparent" @click="${context.closePopover}">${litRender.ifDefined(context._cancelButtonLabel)}</${litRender.scopeTag("ui5-button", tags, suffix)}></div></${litRender.scopeTag("ui5-responsive-popover", tags, suffix)}>`;
	const block1 = (item, index, context, tags, suffix) => litRender.html`<slot name="${litRender.ifDefined(item._individualSlot)}"></slot>`;

	return block0;

});
