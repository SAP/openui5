sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/database', './v4/database'], function (exports, Theme, database$1, database$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? database$1.pathData : database$2.pathData;
	var database = "database";

	exports.accData = database$1.accData;
	exports.ltr = database$1.ltr;
	exports.default = database;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
