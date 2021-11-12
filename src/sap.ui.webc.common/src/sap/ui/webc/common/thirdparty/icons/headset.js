sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/headset', './v4/headset'], function (Theme, headset$2, headset$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? headset$1 : headset$2;
	var headset = { pathData };

	return headset;

});
