sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/learning-assistant', './v4/learning-assistant'], function (exports, Theme, learningAssistant$1, learningAssistant$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? learningAssistant$1.pathData : learningAssistant$2.pathData;
	var learningAssistant = "learning-assistant";

	exports.accData = learningAssistant$1.accData;
	exports.ltr = learningAssistant$1.ltr;
	exports.default = learningAssistant;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
