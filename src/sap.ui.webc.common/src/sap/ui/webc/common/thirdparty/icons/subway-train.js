sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/subway-train', './v4/subway-train'], function (exports, Theme, subwayTrain$1, subwayTrain$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? subwayTrain$1.pathData : subwayTrain$2.pathData;
	var subwayTrain = "subway-train";

	exports.accData = subwayTrain$1.accData;
	exports.ltr = subwayTrain$1.ltr;
	exports.default = subwayTrain;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
