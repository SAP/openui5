sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/command-line-interfaces', './v4/command-line-interfaces'], function (exports, Theme, commandLineInterfaces$1, commandLineInterfaces$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? commandLineInterfaces$1.pathData : commandLineInterfaces$2.pathData;
	var commandLineInterfaces = "command-line-interfaces";

	exports.accData = commandLineInterfaces$1.accData;
	exports.ltr = commandLineInterfaces$1.ltr;
	exports.default = commandLineInterfaces;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
