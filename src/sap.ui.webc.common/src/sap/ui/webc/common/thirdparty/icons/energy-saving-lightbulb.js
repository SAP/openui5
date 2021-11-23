sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/energy-saving-lightbulb', './v4/energy-saving-lightbulb'], function (Theme, energySavingLightbulb$2, energySavingLightbulb$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? energySavingLightbulb$1 : energySavingLightbulb$2;
	var energySavingLightbulb = { pathData };

	return energySavingLightbulb;

});
