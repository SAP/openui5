sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/background', './v4/background'], function (Theme, background$2, background$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? background$1 : background$2;
	var background = { pathData };

	return background;

});
