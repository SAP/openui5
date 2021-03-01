sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "history";
	const pathData = "M256 0q53 0 99.5 20T437 75t55 81.5 20 99.5-20 99.5-55 81.5-81.5 55-99.5 20-100-20-81.5-55T20 355.5 0 256t20-99.5T74.5 75 156 20 256 0zm0 480q46 0 87-17.5t71.5-48 48-71T480 256q0-46-17.5-87t-48-71.5-71.5-48T256 32q-47 0-87.5 17.5t-71 48-48 71.5T32 256q0 47 17.5 87.5t48 71 71 48T256 480zm144-224q6 0 11 4.5t5 11.5-5 11.5-11 4.5H224V144q0-16 16-16 6 0 11 4.5t5 11.5v112h144z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var history = { pathData };

	return history;

});
