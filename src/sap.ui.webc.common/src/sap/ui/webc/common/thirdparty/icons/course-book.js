sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/course-book', './v4/course-book'], function (Theme, courseBook$2, courseBook$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? courseBook$1 : courseBook$2;
	var courseBook = { pathData };

	return courseBook;

});
