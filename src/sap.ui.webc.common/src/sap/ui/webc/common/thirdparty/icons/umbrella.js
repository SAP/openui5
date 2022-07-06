sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/umbrella', './v4/umbrella'], function (exports, Theme, umbrella$1, umbrella$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? umbrella$1.pathData : umbrella$2.pathData;
	var umbrella = "umbrella";

	exports.accData = umbrella$1.accData;
	exports.ltr = umbrella$1.ltr;
	exports.default = umbrella;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
