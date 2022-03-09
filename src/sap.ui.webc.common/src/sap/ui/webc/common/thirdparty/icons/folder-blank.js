sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/folder-blank', './v4/folder-blank'], function (Theme, folderBlank$2, folderBlank$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? folderBlank$1 : folderBlank$2;
	var folderBlank = { pathData };

	return folderBlank;

});
