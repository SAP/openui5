sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/bed', './v4/bed'], function (Theme, bed$2, bed$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? bed$1 : bed$2;
	var bed = { pathData };

	return bed;

});
