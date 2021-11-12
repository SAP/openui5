sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/nutrition-activity', './v4/nutrition-activity'], function (Theme, nutritionActivity$2, nutritionActivity$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? nutritionActivity$1 : nutritionActivity$2;
	var nutritionActivity = { pathData };

	return nutritionActivity;

});
