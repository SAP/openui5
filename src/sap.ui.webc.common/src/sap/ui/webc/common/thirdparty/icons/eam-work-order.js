sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/eam-work-order', './v4/eam-work-order'], function (exports, Theme, eamWorkOrder$1, eamWorkOrder$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? eamWorkOrder$1.pathData : eamWorkOrder$2.pathData;
	var eamWorkOrder = "eam-work-order";

	exports.accData = eamWorkOrder$1.accData;
	exports.ltr = eamWorkOrder$1.ltr;
	exports.default = eamWorkOrder;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
