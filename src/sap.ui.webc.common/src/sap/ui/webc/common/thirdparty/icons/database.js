sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/database', './v4/database'], function (Theme, database$2, database$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? database$1 : database$2;
	var database = { pathData };

	return database;

});
