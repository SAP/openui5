sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/business-objects-experience', './v4/business-objects-experience'], function (exports, Theme, businessObjectsExperience$1, businessObjectsExperience$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? businessObjectsExperience$1.pathData : businessObjectsExperience$2.pathData;
	var businessObjectsExperience = "business-objects-experience";

	exports.accData = businessObjectsExperience$1.accData;
	exports.ltr = businessObjectsExperience$1.ltr;
	exports.default = businessObjectsExperience;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
