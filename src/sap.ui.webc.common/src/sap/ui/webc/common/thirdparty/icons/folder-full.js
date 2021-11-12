sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/folder-full', './v4/folder-full'], function (Theme, folderFull$2, folderFull$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? folderFull$1 : folderFull$2;
	var folderFull = { pathData };

	return folderFull;

});
