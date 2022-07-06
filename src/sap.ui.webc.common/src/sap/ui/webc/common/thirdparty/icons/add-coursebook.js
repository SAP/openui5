sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add-coursebook', './v4/add-coursebook'], function (exports, Theme, addCoursebook$1, addCoursebook$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? addCoursebook$1.pathData : addCoursebook$2.pathData;
	var addCoursebook = "add-coursebook";

	exports.accData = addCoursebook$1.accData;
	exports.ltr = addCoursebook$1.ltr;
	exports.default = addCoursebook;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
