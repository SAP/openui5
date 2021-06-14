sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "positive";
	const pathData = "M32 448V64q0-13 9-22.5T64 32h384q13 0 22.5 9.5T480 64v384q0 14-9.5 23t-22.5 9H64q-14 0-23-9t-9-23zm416 0V64H64v384h384zM128 272v-32h112V128h32v112h112v32H272v112h-32V272H128z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var positive = { pathData };

	return positive;

});
