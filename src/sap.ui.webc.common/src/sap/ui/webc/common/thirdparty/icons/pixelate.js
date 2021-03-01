sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "pixelate";
	const pathData = "M96 352H32v-64h64v-64H32V64q0-13 9-22.5T64 32h384q14 0 23 9.5t9 22.5v160h-64v64h64v64h-64v64h64v32q0 14-9 23t-23 9h-32v-64h-64v64h-64v-64h-64v64h-64v-64H96v64H64q-14 0-23-9t-9-23v-32h64v-64zm64 0v64h64v-64h64v64h64v-64h64v-64h-64v-64h64v-64h-64v64h-64v-64h-64v64h-64v-64H96v64h64v64H96v64h64zm0-64h64v-64h64v64h64v64h-64v-64h-64v64h-64v-64z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pixelate = { pathData };

	return pixelate;

});
