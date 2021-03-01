sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "heading1";
	const pathData = "M0 400V80q0-16 16-16h8q16 0 16 16v144h176V80q0-16 16-16h8q16 0 16 16v320q0 16-16 16h-8q-16 0-16-16V256H40v144q0 16-16 16h-8q-16 0-16-16zm352-133l64-43h32v224h64v32H352v-32h56V266l-56 38v-37z";
	const ltr = true;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var heading1 = { pathData };

	return heading1;

});
