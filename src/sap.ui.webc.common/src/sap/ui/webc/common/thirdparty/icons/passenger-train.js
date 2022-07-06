sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/passenger-train', './v4/passenger-train'], function (exports, Theme, passengerTrain$1, passengerTrain$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? passengerTrain$1.pathData : passengerTrain$2.pathData;
	var passengerTrain = "passenger-train";

	exports.accData = passengerTrain$1.accData;
	exports.ltr = passengerTrain$1.ltr;
	exports.default = passengerTrain;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
