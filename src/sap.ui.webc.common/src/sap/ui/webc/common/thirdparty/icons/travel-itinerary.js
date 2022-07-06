sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/travel-itinerary', './v4/travel-itinerary'], function (exports, Theme, travelItinerary$1, travelItinerary$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? travelItinerary$1.pathData : travelItinerary$2.pathData;
	var travelItinerary = "travel-itinerary";

	exports.accData = travelItinerary$1.accData;
	exports.ltr = travelItinerary$1.ltr;
	exports.default = travelItinerary;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
