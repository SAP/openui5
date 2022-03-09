sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/lightbulb', './v4/lightbulb'], function (Theme, lightbulb$2, lightbulb$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? lightbulb$1 : lightbulb$2;
	var lightbulb = { pathData };

	return lightbulb;

});
