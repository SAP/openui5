sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/mirrored-task-circle', './v4/mirrored-task-circle'], function (exports, Theme, mirroredTaskCircle$1, mirroredTaskCircle$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? mirroredTaskCircle$1.pathData : mirroredTaskCircle$2.pathData;
	var mirroredTaskCircle = "mirrored-task-circle";

	exports.accData = mirroredTaskCircle$1.accData;
	exports.ltr = mirroredTaskCircle$1.ltr;
	exports.default = mirroredTaskCircle;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
