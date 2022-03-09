sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/write-new', './v4/write-new'], function (Theme, writeNew$2, writeNew$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? writeNew$1 : writeNew$2;
	var writeNew = { pathData };

	return writeNew;

});
