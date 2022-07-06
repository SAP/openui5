sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/vehicle-repair', './v4/vehicle-repair'], function (exports, Theme, vehicleRepair$1, vehicleRepair$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? vehicleRepair$1.pathData : vehicleRepair$2.pathData;
	var vehicleRepair = "vehicle-repair";

	exports.accData = vehicleRepair$1.accData;
	exports.ltr = vehicleRepair$1.ltr;
	exports.default = vehicleRepair;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
