sap.ui.define(['./util/createStyleInHead', './FeaturesRegistry'], function (createStyleInHead, FeaturesRegistry) { 'use strict';

	const font72RegularWoff = `https://ui5.sap.com/sdk/resources/sap/ui/core/themes/sap_fiori_3/fonts/72-Regular.woff?ui5-webcomponents`;
	const font72RegularWoff2 = `https://ui5.sap.com/sdk/resources/sap/ui/core/themes/sap_fiori_3/fonts/72-Regular.woff2?ui5-webcomponents`;
	const font72RegularFullWoff = `https://ui5.sap.com/sdk/resources/sap/ui/core/themes/sap_fiori_3/fonts/72-Regular-full.woff?ui5-webcomponents`;
	const font72RegularFullWoff2 = `https://ui5.sap.com/sdk/resources/sap/ui/core/themes/sap_fiori_3/fonts/72-Regular-full.woff2?ui5-webcomponents`;
	const font72BoldWoff = `https://ui5.sap.com/sdk/resources/sap/ui/core/themes/sap_fiori_3/fonts/72-Bold.woff?ui5-webcomponents`;
	const font72BoldWoff2 = `https://ui5.sap.com/sdk/resources/sap/ui/core/themes/sap_fiori_3/fonts/72-Bold.woff2?ui5-webcomponents`;
	const font72BoldFullWoff = `https://ui5.sap.com/sdk/resources/sap/ui/core/themes/sap_fiori_3/fonts/72-Bold-full.woff?ui5-webcomponents`;
	const font72BoldFullWoff2 = `https://ui5.sap.com/sdk/resources/sap/ui/core/themes/sap_fiori_3/fonts/72-Bold-full.woff2?ui5-webcomponents`;
	const fontFaceCSS = `
	@font-face {
		font-family: "72";
		font-style: normal;
		font-weight: 400;
		src: local("72"),
			url(${font72RegularWoff2}) format("woff2"),
			url(${font72RegularWoff}) format("woff");
	}
	
	@font-face {
		font-family: "72full";
		font-style: normal;
		font-weight: 400;
		src: local('72-full'),
			url(${font72RegularFullWoff2}) format("woff2"),
			url(${font72RegularFullWoff}) format("woff");
		
	}
	
	@font-face {
		font-family: "72";
		font-style: normal;
		font-weight: 700;
		src: local('72-Bold'),
			url(${font72BoldWoff2}) format("woff2"),
			url(${font72BoldWoff}) format("woff");
	}
	
	@font-face {
		font-family: "72full";
		font-style: normal;
		font-weight: 700;
		src: local('72-Bold-full'),
			url(${font72BoldFullWoff2}) format("woff2"),
			url(${font72BoldFullWoff}) format("woff");
	}
`;
	const overrideFontFaceCSS = `
	@font-face {
		font-family: '72override';
		unicode-range: U+0102-0103, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EB7, U+1EB8-1EC7, U+1EC8-1ECB, U+1ECC-1EE3, U+1EE4-1EF1, U+1EF4-1EF7;
		src: local('Arial'), local('Helvetica'), local('sans-serif');
	}
`;
	const insertFontFace = () => {
		const OpenUI5Support = FeaturesRegistry.getFeature("OpenUI5Support");
		if (!OpenUI5Support || !OpenUI5Support.isLoaded()) {
			insertMainFontFace();
		}
		insertOverrideFontFace();
	};
	const insertMainFontFace = () => {
		if (!document.querySelector(`head>style[data-ui5-font-face]`)) {
			createStyleInHead(fontFaceCSS, { "data-ui5-font-face": "" });
		}
	};
	const insertOverrideFontFace = () => {
		if (!document.querySelector(`head>style[data-ui5-font-face-override]`)) {
			createStyleInHead(overrideFontFaceCSS, { "data-ui5-font-face-override": "" });
		}
	};

	return insertFontFace;

});
