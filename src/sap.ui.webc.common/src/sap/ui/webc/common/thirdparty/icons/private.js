sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/private', './v4/private'], function (exports, Theme, _private$1, _private$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? _private$1.pathData : _private$2.pathData;
	var _private = "private";

	exports.accData = _private$1.accData;
	exports.ltr = _private$1.ltr;
	exports.default = _private;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
