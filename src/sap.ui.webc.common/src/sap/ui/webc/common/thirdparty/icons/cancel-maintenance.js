sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cancel-maintenance', './v4/cancel-maintenance'], function (exports, Theme, cancelMaintenance$1, cancelMaintenance$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? cancelMaintenance$1.pathData : cancelMaintenance$2.pathData;
	var cancelMaintenance = "cancel-maintenance";

	exports.accData = cancelMaintenance$1.accData;
	exports.ltr = cancelMaintenance$1.ltr;
	exports.default = cancelMaintenance;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
