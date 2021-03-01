sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/ifDefined', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (ifDefined, litRender) { 'use strict';

	const block0 = (context) => { return litRender.html`<div class="ui5-block-layer" ?hidden=${context._blockLayerHidden} tabindex="1" style="${litRender.styleMap(context.styles.blockLayer)}" @keydown="${context._preventBlockLayerFocus}" @mousedown="${context._preventBlockLayerFocus}"></div>`; };
	const main = (context, tags, suffix) => {
		litRender.setTags(tags);
		litRender.setSuffix(suffix);
		return block0(context);
	};

	return main;

});
