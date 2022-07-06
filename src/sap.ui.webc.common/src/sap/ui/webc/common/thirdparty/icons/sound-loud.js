sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sound-loud', './v4/sound-loud'], function (exports, Theme, soundLoud$1, soundLoud$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? soundLoud$1.pathData : soundLoud$2.pathData;
	var soundLoud = "sound-loud";

	exports.accData = soundLoud$1.accData;
	exports.ltr = soundLoud$1.ltr;
	exports.default = soundLoud;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
