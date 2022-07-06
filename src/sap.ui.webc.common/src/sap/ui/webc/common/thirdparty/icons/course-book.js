sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/course-book', './v4/course-book'], function (exports, Theme, courseBook$1, courseBook$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? courseBook$1.pathData : courseBook$2.pathData;
	var courseBook = "course-book";

	exports.accData = courseBook$1.accData;
	exports.ltr = courseBook$1.ltr;
	exports.default = courseBook;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
