sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cargo-train', './v4/cargo-train'], function (Theme, cargoTrain$2, cargoTrain$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? cargoTrain$1 : cargoTrain$2;
	var cargoTrain = { pathData };

	return cargoTrain;

});
