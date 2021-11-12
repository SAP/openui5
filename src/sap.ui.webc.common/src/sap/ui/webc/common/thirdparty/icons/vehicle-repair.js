sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/vehicle-repair', './v4/vehicle-repair'], function (Theme, vehicleRepair$2, vehicleRepair$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? vehicleRepair$1 : vehicleRepair$2;
	var vehicleRepair = { pathData };

	return vehicleRepair;

});
