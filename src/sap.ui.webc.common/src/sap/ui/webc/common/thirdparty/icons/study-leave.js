sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/study-leave', './v4/study-leave'], function (Theme, studyLeave$2, studyLeave$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? studyLeave$1 : studyLeave$2;
	var studyLeave = { pathData };

	return studyLeave;

});
