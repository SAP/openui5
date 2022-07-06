sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (exports, Icons) { 'use strict';

	const name = "strikethrough";
	const pathData = "M64 64V32h384v32H288v160h-64V64H64zM32 272q0-16 16-16h416q16 0 16 16t-16 16H48q-16 0-16-16zm192 48h64v160h-64V320z";
	const ltr = false;
	const accData = null;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var strikethrough = "strikethrough";

	exports.accData = accData;
	exports.default = strikethrough;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
