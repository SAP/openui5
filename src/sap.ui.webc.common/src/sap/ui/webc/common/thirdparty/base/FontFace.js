sap.ui.define(['./ManagedStyles', './FeaturesRegistry', './generated/css/FontFace.css', './generated/css/OverrideFontFace.css'], function (ManagedStyles, FeaturesRegistry, FontFace_css, OverrideFontFace_css) { 'use strict';

	const insertFontFace = () => {
		const OpenUI5Support = FeaturesRegistry.getFeature("OpenUI5Support");
		if (!OpenUI5Support || !OpenUI5Support.isLoaded()) {
			insertMainFontFace();
		}
		insertOverrideFontFace();
	};
	const insertMainFontFace = () => {
		if (!ManagedStyles.hasStyle("data-ui5-font-face")) {
			ManagedStyles.createStyle(FontFace_css, "data-ui5-font-face");
		}
	};
	const insertOverrideFontFace = () => {
		if (!ManagedStyles.hasStyle("data-ui5-font-face-override")) {
			ManagedStyles.createStyle(OverrideFontFace_css, "data-ui5-font-face-override");
		}
	};

	return insertFontFace;

});
