sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/timesheet', './v4/timesheet'], function (Theme, timesheet$2, timesheet$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? timesheet$1 : timesheet$2;
	var timesheet = { pathData };

	return timesheet;

});
