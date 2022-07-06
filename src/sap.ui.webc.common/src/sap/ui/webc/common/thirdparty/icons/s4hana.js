sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/s4hana', './v4/s4hana'], function (exports, Theme, s4hana$1, s4hana$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? s4hana$1.pathData : s4hana$2.pathData;
	var s4hana = "s4hana";

	exports.accData = s4hana$1.accData;
	exports.ltr = s4hana$1.ltr;
	exports.default = s4hana;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
