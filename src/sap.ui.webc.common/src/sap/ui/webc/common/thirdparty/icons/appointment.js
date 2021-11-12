sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/appointment', './v4/appointment'], function (Theme, appointment$2, appointment$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? appointment$1 : appointment$2;
	var appointment = { pathData };

	return appointment;

});
