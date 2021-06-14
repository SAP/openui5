sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "add-activity";
	const pathData = "M0 448V64q0-13 9-22.5T32 32h448q13 0 22.5 9.5T512 64v192h-32V64H32v384h192v32H32q-14 0-23-9t-9-23zm288-64h96v-96h32v96h96v32h-96v96h-32v-96h-96v-32zm-16-224h128q16 0 16 16 0 6-4.5 11t-11.5 5H272q-6 0-11-5t-5-11q0-7 5-11.5t11-4.5zM81 181l36 36 71-89 18 18-89 107-53-54zm0 163l36 36 71-88 18 17-89 107-53-53z";
	const ltr = true;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var addActivity = { pathData };

	return addActivity;

});
