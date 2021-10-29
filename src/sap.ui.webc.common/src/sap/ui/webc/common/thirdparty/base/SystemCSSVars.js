sap.ui.define(['./ManagedStyles', './generated/css/SystemCSSVars.css'], function (ManagedStyles, SystemCSSVars_css) { 'use strict';

	const insertSystemCSSVars = () => {
		if (!ManagedStyles.hasStyle("data-ui5-system-css-vars")) {
			ManagedStyles.createStyle(SystemCSSVars_css, "data-ui5-system-css-vars");
		}
	};

	return insertSystemCSSVars;

});
