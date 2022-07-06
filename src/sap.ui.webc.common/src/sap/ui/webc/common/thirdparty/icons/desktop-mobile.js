sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/desktop-mobile', './v4/desktop-mobile'], function (exports, Theme, desktopMobile$1, desktopMobile$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? desktopMobile$1.pathData : desktopMobile$2.pathData;
	var desktopMobile = "desktop-mobile";

	exports.accData = desktopMobile$1.accData;
	exports.ltr = desktopMobile$1.ltr;
	exports.default = desktopMobile;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
