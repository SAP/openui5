sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/mileage', './v4/mileage'], function (Theme, mileage$2, mileage$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? mileage$1 : mileage$2;
	var mileage = { pathData };

	return mileage;

});
