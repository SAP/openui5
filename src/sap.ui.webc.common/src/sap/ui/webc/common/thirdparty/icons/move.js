sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/move', './v4/move'], function (exports, Theme, move$1, move$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? move$1.pathData : move$2.pathData;
	var move = "move";

	exports.accData = move$1.accData;
	exports.ltr = move$1.ltr;
	exports.default = move;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
