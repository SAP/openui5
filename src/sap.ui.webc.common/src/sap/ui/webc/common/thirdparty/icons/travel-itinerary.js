sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/travel-itinerary', './v4/travel-itinerary'], function (Theme, travelItinerary$2, travelItinerary$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? travelItinerary$1 : travelItinerary$2;
	var travelItinerary = { pathData };

	return travelItinerary;

});
