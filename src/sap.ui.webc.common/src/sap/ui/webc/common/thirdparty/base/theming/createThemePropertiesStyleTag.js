sap.ui.define(['../util/createStyleInHead'], function (createStyleInHead) { 'use strict';

	const createThemePropertiesStyleTag = (cssText, packageName) => {
		const styleElement = document.head.querySelector(`style[data-ui5-theme-properties="${packageName}"]`);
		if (styleElement) {
			styleElement.textContent = cssText || "";
		} else {
			const attributes = {
				"data-ui5-theme-properties": packageName,
			};
			createStyleInHead(cssText, attributes);
		}
	};

	return createThemePropertiesStyleTag;

});
