sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/time-overtime', './v4/time-overtime'], function (Theme, timeOvertime$2, timeOvertime$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? timeOvertime$1 : timeOvertime$2;
	var timeOvertime = { pathData };

	return timeOvertime;

});
