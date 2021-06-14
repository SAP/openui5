sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "status-critical";
	const pathData = "M511 450q1 2 1 10t-5.5 14-14.5 6H22q-10 0-16-6t-6-14q0-2 2-10L237 12q7-12 19-12 11 0 19 12zm-89-34L256 117 91 416h331z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var statusCritical = { pathData };

	return statusCritical;

});
