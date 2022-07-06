sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/delete', './v4/delete'], function (exports, Theme, _delete$1, _delete$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? _delete$1.pathData : _delete$2.pathData;
	var _delete = "delete";

	exports.accData = _delete$1.accData;
	exports.ltr = _delete$1.ltr;
	exports.default = _delete;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
