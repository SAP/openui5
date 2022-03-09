sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add-folder', './v4/add-folder'], function (Theme, addFolder$2, addFolder$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? addFolder$1 : addFolder$2;
	var addFolder = { pathData };

	return addFolder;

});
