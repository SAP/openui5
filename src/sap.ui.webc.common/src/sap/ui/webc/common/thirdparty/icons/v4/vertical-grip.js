sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (exports, Icons) { 'use strict';

	const name = "vertical-grip";
	const pathData = "M224 96V32h64v64h-64zm0 128v-64h64v64h-64zm0 128v-64h64v64h-64zm0 128v-64h64v64h-64z";
	const ltr = false;
	const accData = null;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var verticalGrip = "vertical-grip";

	exports.accData = accData;
	exports.default = verticalGrip;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
