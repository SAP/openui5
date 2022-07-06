sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/play', './v4/play'], function (exports, Theme, play$1, play$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? play$1.pathData : play$2.pathData;
	var play = "play";

	exports.accData = play$1.accData;
	exports.ltr = play$1.ltr;
	exports.default = play;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
