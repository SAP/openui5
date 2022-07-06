sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/mirrored-task-circle-2', './v4/mirrored-task-circle-2'], function (exports, Theme, mirroredTaskCircle2$1, mirroredTaskCircle2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? mirroredTaskCircle2$1.pathData : mirroredTaskCircle2$2.pathData;
	var mirroredTaskCircle2 = "mirrored-task-circle-2";

	exports.accData = mirroredTaskCircle2$1.accData;
	exports.ltr = mirroredTaskCircle2$1.ltr;
	exports.default = mirroredTaskCircle2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
