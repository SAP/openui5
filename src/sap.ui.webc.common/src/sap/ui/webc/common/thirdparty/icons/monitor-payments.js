sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/monitor-payments', './v4/monitor-payments'], function (Theme, monitorPayments$2, monitorPayments$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? monitorPayments$1 : monitorPayments$2;
	var monitorPayments = { pathData };

	return monitorPayments;

});
