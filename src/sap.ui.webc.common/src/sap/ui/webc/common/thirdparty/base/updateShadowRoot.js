sap.ui.define(['./renderer/executeTemplate', './theming/getConstructableStyle', './theming/getEffectiveStyle', './theming/getEffectiveLinksHrefs', './CSP'], function (executeTemplate, getConstructableStyle, getEffectiveStyle, getEffectiveLinksHrefs, CSP) { 'use strict';

	const updateShadowRoot = (element, forStaticArea = false) => {
		let styleStrOrHrefsArr;
		const template = forStaticArea ? "staticAreaTemplate" : "template";
		const shadowRoot = forStaticArea ? element.staticAreaItem.shadowRoot : element.shadowRoot;
		const renderResult = executeTemplate(element.constructor[template], element);
		if (CSP.shouldUseLinks()) {
			styleStrOrHrefsArr = getEffectiveLinksHrefs(element.constructor, forStaticArea);
		} else if (document.adoptedStyleSheets) {
			shadowRoot.adoptedStyleSheets = getConstructableStyle(element.constructor, forStaticArea);
		} else {
			styleStrOrHrefsArr = getEffectiveStyle(element.constructor, forStaticArea);
		}
		element.constructor.render(renderResult, shadowRoot, styleStrOrHrefsArr, forStaticArea, { host: element });
	};

	return updateShadowRoot;

});
