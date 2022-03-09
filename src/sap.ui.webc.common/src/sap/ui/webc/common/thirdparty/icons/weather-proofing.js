sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/weather-proofing', './v4/weather-proofing'], function (Theme, weatherProofing$2, weatherProofing$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? weatherProofing$1 : weatherProofing$2;
	var weatherProofing = { pathData };

	return weatherProofing;

});
