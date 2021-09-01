sap.ui.define(['./renderer/executeTemplate', './theming/getConstructableStyle', './theming/getEffectiveStyle', './isLegacyBrowser'], function (executeTemplate, getConstructableStyle, getEffectiveStyle, isLegacyBrowser) { 'use strict';

	const updateShadowRoot = (element, forStaticArea = false) => {
		let styleToPrepend;
		const template = forStaticArea ? "staticAreaTemplate" : "template";
		const shadowRoot = forStaticArea ? element.staticAreaItem.shadowRoot : element.shadowRoot;
		const renderResult = executeTemplate(element.constructor[template], element);
		if (document.adoptedStyleSheets) {
			shadowRoot.adoptedStyleSheets = getConstructableStyle(element.constructor, forStaticArea);
		} else if (!isLegacyBrowser()) {
			styleToPrepend = getEffectiveStyle(element.constructor, forStaticArea);
		}
		element.constructor.render(renderResult, shadowRoot, styleToPrepend, { host: element });
	};

	return updateShadowRoot;

});
