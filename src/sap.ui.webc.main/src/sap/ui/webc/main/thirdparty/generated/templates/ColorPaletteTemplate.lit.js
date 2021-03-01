sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ifDefined__default = /*#__PURE__*/_interopDefaultLegacy(ifDefined);

	const block0 = (context) => { return litRender.html`<div class="ui5-cp-root" @click=${context._onclick} @keyup=${context._onkeyup} @keydown=${context._onkeydown}><div class="ui5-cp-item-container" role="region" aria-label="${ifDefined__default(context.colorContainerLabel)}">${ litRender.repeat(context.displayedColors, (item, index) => item._id || index, (item, index) => block1(item)) }</div>${ context._showMoreColors ? block2(context) : undefined }${ context.showRecentColors ? block3(context) : undefined }</div>`; };
	const block1 = (item, index, context) => { return litRender.html`<slot name="${ifDefined__default(item._individualSlot)}"></slot>`; };
	const block2 = (context) => { return litRender.html`<div class="ui5-cp-more-colors-wrapper"><div class="ui5-cp-separator"></div><ui5-button design="Transparent" class="ui5-cp-more-colors" @click="${context._openMoreColorsDialog}">${ifDefined__default(context.colorPaleteMoreColorsText)}</ui5-button></div>`; };
	const block3 = (context) => { return litRender.html`<div class="ui5-cp-separator"></div><div class="ui5-cp-recent-colors-wrapper">${ litRender.repeat(context.recentColors, (item, index) => item._id || index, (item, index) => block4(item)) }</div>`; };
	const block4 = (item, index, context) => { return litRender.html`<ui5-color-palette-item value="${ifDefined__default(item)}"></ui5-color-palette-item>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
