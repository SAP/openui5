sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/car-rental', './v4/car-rental'], function (Theme, carRental$2, carRental$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? carRental$1 : carRental$2;
	var carRental = { pathData };

	return carRental;

});
