sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/heating-cooling', './v4/heating-cooling'], function (Theme, heatingCooling$2, heatingCooling$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? heatingCooling$1 : heatingCooling$2;
	var heatingCooling = { pathData };

	return heatingCooling;

});
