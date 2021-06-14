sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "contacts";
	const pathData = "M0 384h32v-32H0v-32h32V192H0v-32h32v-32H0V96h32V32q0-14 9.5-23T64 0h384q14 0 23 9t9 23q14 0 23 9t9 23v64q0 14-9 23t-23 9v32q14 0 23 9t9 23v64q0 14-9 23t-23 9v32q14 0 23 9t9 23v64q0 14-9 23t-23 9q0 14-9 23t-23 9H64q-13 0-22.5-9T32 480v-64H0v-32zm96 0v32H64v64h384V32H64v64h32v32H64v32h32v32H64v128h32v32H64v32h32zM384 96v64H160V96h224z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var contacts = { pathData };

	return contacts;

});
