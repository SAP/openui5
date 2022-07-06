sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/decline', './v4/decline'], function (exports, Theme, decline$1, decline$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? decline$1.pathData : decline$2.pathData;
	var decline = "decline";

	exports.accData = decline$1.accData;
	exports.ltr = decline$1.ltr;
	exports.default = decline;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
