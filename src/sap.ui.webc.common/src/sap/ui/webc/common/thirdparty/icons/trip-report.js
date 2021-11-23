sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/trip-report', './v4/trip-report'], function (Theme, tripReport$2, tripReport$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? tripReport$1 : tripReport$2;
	var tripReport = { pathData };

	return tripReport;

});
