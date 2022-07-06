sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cargo-train', './v4/cargo-train'], function (exports, Theme, cargoTrain$1, cargoTrain$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? cargoTrain$1.pathData : cargoTrain$2.pathData;
	var cargoTrain = "cargo-train";

	exports.accData = cargoTrain$1.accData;
	exports.ltr = cargoTrain$1.ltr;
	exports.default = cargoTrain;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
