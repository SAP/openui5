sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add-photo', './v4/add-photo'], function (exports, Theme, addPhoto$1, addPhoto$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? addPhoto$1.pathData : addPhoto$2.pathData;
	var addPhoto = "add-photo";

	exports.accData = addPhoto$1.accData;
	exports.ltr = addPhoto$1.ltr;
	exports.default = addPhoto;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
