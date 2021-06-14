sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "notification";
	const pathData = "M256 0q-53 0-99.5 20T75 75t-55 81.5T0 256t20 100 55 81.5 81.5 54.5 99.5 20 100-20 81.5-54.5T492 356t20-100-20-99.5T437.5 75 356 20 256 0zm0 480q-46 0-87-17.5t-71.5-48-48-71T32 256q0-46 17.5-87t48-71.5 71.5-48T256 32t87 17.5 71.5 48 48 71.5 17.5 87q0 47-17.5 87.5t-48 71-71.5 48-87 17.5zm38-231q-5 3-1 9l89 89q9 8 0 17l-16 17q-8 4-9 4t-9-4l-89-89q-1-2-4-2-4 0-5 2l-88 89q-6 4-9 4-1 0-9-4l-16-17q-8-9 0-17l88-89q5-5 0-9l-88-89q-8-9 0-17l16-17q4-4 9-4t9 4l88 89q2 2 5 2 2 0 4-2l89-89q4-4 9-4t9 4l16 17q9 8 0 17z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var notification = { pathData };

	return notification;

});
