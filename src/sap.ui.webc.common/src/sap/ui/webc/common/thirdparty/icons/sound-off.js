sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sound-off', './v4/sound-off'], function (exports, Theme, soundOff$1, soundOff$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? soundOff$1.pathData : soundOff$2.pathData;
	var soundOff = "sound-off";

	exports.accData = soundOff$1.accData;
	exports.ltr = soundOff$1.ltr;
	exports.default = soundOff;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
