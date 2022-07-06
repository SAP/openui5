sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/exit-full-screen', './v4/exit-full-screen'], function (exports, Theme, exitFullScreen$1, exitFullScreen$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? exitFullScreen$1.pathData : exitFullScreen$2.pathData;
	var exitFullScreen = "exit-full-screen";

	exports.accData = exitFullScreen$1.accData;
	exports.ltr = exitFullScreen$1.ltr;
	exports.default = exitFullScreen;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
