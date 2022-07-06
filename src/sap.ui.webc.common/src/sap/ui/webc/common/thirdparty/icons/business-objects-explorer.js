sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/business-objects-explorer', './v4/business-objects-explorer'], function (exports, Theme, businessObjectsExplorer$1, businessObjectsExplorer$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? businessObjectsExplorer$1.pathData : businessObjectsExplorer$2.pathData;
	var businessObjectsExplorer = "business-objects-explorer";

	exports.accData = businessObjectsExplorer$1.accData;
	exports.ltr = businessObjectsExplorer$1.ltr;
	exports.default = businessObjectsExplorer;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
