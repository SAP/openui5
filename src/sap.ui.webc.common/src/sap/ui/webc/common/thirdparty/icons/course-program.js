sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/course-program', './v4/course-program'], function (Theme, courseProgram$2, courseProgram$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? courseProgram$1 : courseProgram$2;
	var courseProgram = { pathData };

	return courseProgram;

});
