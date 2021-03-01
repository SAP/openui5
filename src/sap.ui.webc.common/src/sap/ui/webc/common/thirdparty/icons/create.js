sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "create";
	const pathData = "M0 128L128 0h192v32H160v96q0 14-9 23t-23 9H32v320h321V288h31v192q0 14-8.5 23t-22.5 9H33q-14 0-23.5-9T0 480V128zm304-32h80l24-75 25 75h79l-64 47 24 75-64-46-64 46 24-75zM96 336q0-7 5-11.5t11-4.5h160q16 0 16 16 0 6-4.5 11t-11.5 5H112q-6 0-11-5t-5-11zm0 64q0-7 5-11.5t11-4.5h160q16 0 16 16 0 6-4.5 11t-11.5 5H112q-6 0-11-5t-5-11z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var create = { pathData };

	return create;

});
