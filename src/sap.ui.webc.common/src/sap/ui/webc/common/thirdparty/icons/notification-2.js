sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/notification-2', './v4/notification-2'], function (exports, Theme, notification2$1, notification2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? notification2$1.pathData : notification2$2.pathData;
	var notification2 = "notification-2";

	exports.accData = notification2$1.accData;
	exports.ltr = notification2$1.ltr;
	exports.default = notification2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
