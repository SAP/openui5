sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/journey-change', './v4/journey-change'], function (exports, Theme, journeyChange$1, journeyChange$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? journeyChange$1.pathData : journeyChange$2.pathData;
	var journeyChange = "journey-change";

	exports.accData = journeyChange$1.accData;
	exports.ltr = journeyChange$1.ltr;
	exports.default = journeyChange;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
