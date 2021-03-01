sap.ui.define(['./CustomStyle', './getStylesString'], function (CustomStyle, getStylesString) { 'use strict';

	const effectiveStyleMap = new Map();
	CustomStyle.attachCustomCSSChange(tag => {
		effectiveStyleMap.delete(`${tag}_normal`);
	});
	const getEffectiveStyle = (ElementClass, forStaticArea = false) => {
		const tag = ElementClass.getMetadata().getTag();
		const key = `${tag}_${forStaticArea ? "static" : "normal"}`;
		if (!effectiveStyleMap.has(key)) {
			let effectiveStyle;
			if (forStaticArea) {
				effectiveStyle = getStylesString(ElementClass.staticAreaStyles);
			} else {
				const customStyle = CustomStyle.getCustomCSS(tag) || "";
				const builtInStyles = getStylesString(ElementClass.styles);
				effectiveStyle = `${builtInStyles} ${customStyle}`;
			}
			effectiveStyleMap.set(key, effectiveStyle);
		}
		return effectiveStyleMap.get(key);
	};

	return getEffectiveStyle;

});
