sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/journey-depart', './v4/journey-depart'], function (exports, Theme, journeyDepart$1, journeyDepart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? journeyDepart$1.pathData : journeyDepart$2.pathData;
	var journeyDepart = "journey-depart";

	exports.accData = journeyDepart$1.accData;
	exports.ltr = journeyDepart$1.ltr;
	exports.default = journeyDepart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
