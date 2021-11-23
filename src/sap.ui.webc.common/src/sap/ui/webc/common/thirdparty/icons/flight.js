sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/flight', './v4/flight'], function (Theme, flight$2, flight$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? flight$1 : flight$2;
	var flight = { pathData };

	return flight;

});
