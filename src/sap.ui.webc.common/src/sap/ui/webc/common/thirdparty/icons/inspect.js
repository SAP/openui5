sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "inspect";
	const pathData = "M480 32H160v320h320V32zM352 448h32v32q0 14-9 23t-23 9H32q-14 0-23-9t-9-23V160q0-13 9-23 9-9 23-9h32v32H32v320h320v-32zm32-352q14 0 23 9t9 23v143q0 17-16 18-5-2-10-6.5t-5-10.5V152L254 284q-5 5-12 5t-12-4q-10-14 0-24l133-132H240q-5 0-9.5-5t-6.5-10q0-17 16-18h144zm96-96q14 0 23 9 9 10 9 23v320q0 14-9 23t-23 9H160q-14 0-23-9t-9-23V32q0-13 9-23 9-9 23-9h320z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var inspect = { pathData };

	return inspect;

});
