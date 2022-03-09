sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/number-sign', './v4/number-sign'], function (Theme, numberSign$2, numberSign$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? numberSign$1 : numberSign$2;
	var numberSign = { pathData };

	return numberSign;

});
