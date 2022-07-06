sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/hello-world', './v4/hello-world'], function (exports, Theme, helloWorld$1, helloWorld$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? helloWorld$1.pathData : helloWorld$2.pathData;
	var helloWorld = "hello-world";

	exports.accData = helloWorld$1.accData;
	exports.ltr = helloWorld$1.ltr;
	exports.default = helloWorld;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
