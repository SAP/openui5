sap.ui.define(function () { 'use strict';

	var systemCSSVars = {
		packageName: "@ui5/webcomponents-base",
		fileName: "SystemCSSVars.css",
		content: `:root{--_ui5_content_density:cozy}.sapUiSizeCompact,.ui5-content-density-compact,[data-ui5-compact-size]{--_ui5_content_density:compact}[dir=rtl]{--_ui5_dir:rtl}[dir=ltr]{--_ui5_dir:ltr}`
	};

	return systemCSSVars;

});
