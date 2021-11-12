sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cancel-maintenance', './v4/cancel-maintenance'], function (Theme, cancelMaintenance$2, cancelMaintenance$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? cancelMaintenance$1 : cancelMaintenance$2;
	var cancelMaintenance = { pathData };

	return cancelMaintenance;

});
