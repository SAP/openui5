sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/date-time', './v4/date-time'], function (Theme, dateTime$2, dateTime$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? dateTime$1 : dateTime$2;
	var dateTime = { pathData };

	return dateTime;

});
