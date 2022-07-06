sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/question-mark', './v4/question-mark'], function (exports, Theme, questionMark$1, questionMark$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? questionMark$1.pathData : questionMark$2.pathData;
	var questionMark = "question-mark";

	exports.accData = questionMark$1.accData;
	exports.ltr = questionMark$1.ltr;
	exports.default = questionMark;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
