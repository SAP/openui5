sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/arrow-left', './v4/arrow-left'], function (Theme, arrowLeft$2, arrowLeft$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? arrowLeft$1 : arrowLeft$2;
	var arrowLeft = { pathData };

	return arrowLeft;

});
