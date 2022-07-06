sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sound', './v4/sound'], function (exports, Theme, sound$1, sound$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sound$1.pathData : sound$2.pathData;
	var sound = "sound";

	exports.accData = sound$1.accData;
	exports.ltr = sound$1.ltr;
	exports.default = sound;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
