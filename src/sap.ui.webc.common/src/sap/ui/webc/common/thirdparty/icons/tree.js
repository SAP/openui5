sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "tree";
	const pathData = "M32 384q0-13 9-22.5t23-9.5v-32q0-26 19-45t45-19h112v-64h-80q-14 0-23-9t-9-23V64q0-13 9-22.5t23-9.5h192q13 0 22.5 9.5T384 64v96q0 14-9.5 23t-22.5 9h-80v64h112q26 0 45 19t19 45v32q13 0 22.5 9.5T480 384v64q0 14-9.5 23t-22.5 9h-64q-14 0-23-9t-9-23v-64q0-13 9-22.5t23-9.5h32v-32q0-13-9-22.5t-23-9.5H272v64h16q13 0 22.5 9.5T320 384v64q0 14-9.5 23t-22.5 9h-64q-14 0-23-9t-9-23v-64q0-13 9-22.5t23-9.5h16v-64H128q-14 0-23 9.5T96 320v32h32q13 0 22.5 9.5T160 384v64q0 14-9.5 23t-22.5 9H64q-14 0-23-9t-9-23v-64zM160 64v96h192V64H160zm64 384h64v-64h-64v64zm224 0v-64h-64v64h64zM64 384v64h64v-64H64z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var tree = { pathData };

	return tree;

});
