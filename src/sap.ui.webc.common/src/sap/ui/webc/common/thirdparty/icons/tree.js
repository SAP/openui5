sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/tree', './v4/tree'], function (exports, Theme, tree$1, tree$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? tree$1.pathData : tree$2.pathData;
	var tree = "tree";

	exports.accData = tree$1.accData;
	exports.ltr = tree$1.ltr;
	exports.default = tree;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
