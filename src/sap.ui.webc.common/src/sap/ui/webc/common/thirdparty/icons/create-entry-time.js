sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/create-entry-time', './v4/create-entry-time'], function (Theme, createEntryTime$2, createEntryTime$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? createEntryTime$1 : createEntryTime$2;
	var createEntryTime = { pathData };

	return createEntryTime;

});
