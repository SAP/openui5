sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/passenger-train', './v4/passenger-train'], function (Theme, passengerTrain$2, passengerTrain$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? passengerTrain$1 : passengerTrain$2;
	var passengerTrain = { pathData };

	return passengerTrain;

});
