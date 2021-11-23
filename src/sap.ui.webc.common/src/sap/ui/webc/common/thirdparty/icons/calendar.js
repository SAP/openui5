sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/calendar', './v4/calendar'], function (Theme, calendar$2, calendar$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? calendar$1 : calendar$2;
	var calendar = { pathData };

	return calendar;

});
