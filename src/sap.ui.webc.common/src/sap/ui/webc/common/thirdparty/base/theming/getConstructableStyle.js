sap.ui.define(['./getEffectiveStyle', './CustomStyle'], function (getEffectiveStyle, CustomStyle) { 'use strict';

	const constructableStyleMap = new Map();
	CustomStyle.attachCustomCSSChange(tag => {
		constructableStyleMap.delete(`${tag}_normal`);
	});
	const getConstructableStyle = (ElementClass, forStaticArea = false) => {
		const tag = ElementClass.getMetadata().getTag();
		const key = `${tag}_${forStaticArea ? "static" : "normal"}`;
		if (!constructableStyleMap.has(key)) {
			const styleContent = getEffectiveStyle(ElementClass, forStaticArea);
			const style = new CSSStyleSheet();
			style.replaceSync(styleContent);
			constructableStyleMap.set(key, [style]);
		}
		return constructableStyleMap.get(key);
	};

	return getConstructableStyle;

});
