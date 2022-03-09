sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/meal', './v4/meal'], function (Theme, meal$2, meal$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? meal$1 : meal$2;
	var meal = { pathData };

	return meal;

});
