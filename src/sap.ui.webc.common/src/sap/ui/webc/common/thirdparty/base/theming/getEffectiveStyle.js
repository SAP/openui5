sap.ui.define(['./CustomStyle', './getStylesString', '../FeaturesRegistry'], function (CustomStyle, getStylesString, FeaturesRegistry) { 'use strict';

	const effectiveStyleMap = new Map();
	CustomStyle.attachCustomCSSChange(tag => {
		effectiveStyleMap.delete(`${tag}_normal`);
	});
	const getEffectiveStyle = (ElementClass, forStaticArea = false) => {
		const tag = ElementClass.getMetadata().getTag();
		const key = `${tag}_${forStaticArea ? "static" : "normal"}`;
		const OpenUI5Enablement = FeaturesRegistry.getFeature("OpenUI5Enablement");
		if (!effectiveStyleMap.has(key)) {
			let effectiveStyle;
			let busyIndicatorStyles = "";
			if (OpenUI5Enablement) {
				busyIndicatorStyles = getStylesString(OpenUI5Enablement.getBusyIndicatorStyles());
			}
			if (forStaticArea) {
				effectiveStyle = getStylesString(ElementClass.staticAreaStyles);
			} else {
				const customStyle = CustomStyle.getCustomCSS(tag) || "";
				const builtInStyles = getStylesString(ElementClass.styles);
				effectiveStyle = `${builtInStyles} ${customStyle}`;
			}
			effectiveStyle = `${effectiveStyle} ${busyIndicatorStyles}`;
			effectiveStyleMap.set(key, effectiveStyle);
		}
		return effectiveStyleMap.get(key);
	};

	return getEffectiveStyle;

});
