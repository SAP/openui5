sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add-coursebook', './v4/add-coursebook'], function (Theme, addCoursebook$2, addCoursebook$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? addCoursebook$1 : addCoursebook$2;
	var addCoursebook = { pathData };

	return addCoursebook;

});
