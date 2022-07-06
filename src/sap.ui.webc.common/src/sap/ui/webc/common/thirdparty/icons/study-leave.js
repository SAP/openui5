sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/study-leave', './v4/study-leave'], function (exports, Theme, studyLeave$1, studyLeave$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? studyLeave$1.pathData : studyLeave$2.pathData;
	var studyLeave = "study-leave";

	exports.accData = studyLeave$1.accData;
	exports.ltr = studyLeave$1.ltr;
	exports.default = studyLeave;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
