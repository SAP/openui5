sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="ui5-cp-root" @click=${context._onclick} @keyup=${context._onkeyup} @keydown=${context._onkeydown}><div class="ui5-cp-item-container" role="region" aria-label="${litRender.ifDefined(context.colorContainerLabel)}">${ litRender.repeat(context.displayedColors, (item, index) => item._id || index, (item, index) => block1(item)) }</div>${ context._showMoreColors ? block2(context, tags, suffix) : undefined }${ context.showRecentColors ? block3(context, tags, suffix) : undefined }</div>`;
	const block1 = (item, index, context, tags, suffix) => litRender.html`<slot name="${litRender.ifDefined(item._individualSlot)}"></slot>`;
	const block2 = (context, tags, suffix) => litRender.html`<div class="ui5-cp-more-colors-wrapper"><div class="ui5-cp-separator"></div><${litRender.scopeTag("ui5-button", tags, suffix)} design="Transparent" class="ui5-cp-more-colors" @click="${context._openMoreColorsDialog}">${litRender.ifDefined(context.colorPaleteMoreColorsText)}</${litRender.scopeTag("ui5-button", tags, suffix)}></div>`;
	const block3 = (context, tags, suffix) => litRender.html`<div class="ui5-cp-separator"></div><div class="ui5-cp-recent-colors-wrapper">${ litRender.repeat(context.recentColors, (item, index) => item._id || index, (item, index) => block4(item, index, context, tags, suffix)) }</div>`;
	const block4 = (item, index, context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-color-palette-item", tags, suffix)} value="${litRender.ifDefined(item)}"></${litRender.scopeTag("ui5-color-palette-item", tags, suffix)}>`;

	return block0;

});
