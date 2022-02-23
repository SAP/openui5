sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/heart-2', './v4/heart-2'], function (Theme, heart2$2, heart2$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? heart2$1 : heart2$2;
	var heart2 = { pathData };

	return heart2;

});
