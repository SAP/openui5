sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/time-entry-request', './v4/time-entry-request'], function (Theme, timeEntryRequest$2, timeEntryRequest$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? timeEntryRequest$1 : timeEntryRequest$2;
	var timeEntryRequest = { pathData };

	return timeEntryRequest;

});
