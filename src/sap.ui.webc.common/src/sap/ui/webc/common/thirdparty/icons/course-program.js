sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/course-program', './v4/course-program'], function (exports, Theme, courseProgram$1, courseProgram$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? courseProgram$1.pathData : courseProgram$2.pathData;
	var courseProgram = "course-program";

	exports.accData = courseProgram$1.accData;
	exports.ltr = courseProgram$1.ltr;
	exports.default = courseProgram;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
