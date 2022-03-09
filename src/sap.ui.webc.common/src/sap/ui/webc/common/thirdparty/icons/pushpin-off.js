sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/pushpin-off', './v4/pushpin-off'], function (Theme, pushpinOff$2, pushpinOff$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? pushpinOff$1 : pushpinOff$2;
	var pushpinOff = { pathData };

	return pushpinOff;

});
