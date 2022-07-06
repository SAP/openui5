sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/camera', './v4/camera'], function (exports, Theme, camera$1, camera$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? camera$1.pathData : camera$2.pathData;
	var camera = "camera";

	exports.accData = camera$1.accData;
	exports.ltr = camera$1.ltr;
	exports.default = camera;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
