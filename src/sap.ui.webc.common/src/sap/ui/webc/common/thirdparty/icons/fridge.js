sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/fridge', './v4/fridge'], function (Theme, fridge$2, fridge$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? fridge$1 : fridge$2;
	var fridge = { pathData };

	return fridge;

});
