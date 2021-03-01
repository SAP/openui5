sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "email-read";
	const pathData = "M512 143v337q0 13-9.5 22.5T480 512H32q-14 0-23-9.5T0 480V143L254 0zm-48 337L256 326 48 480h416zM328 294l152-135L255 37 32 159l151 135-17 18L32 191v273l223-170 225 168V192L347 312z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var emailRead = { pathData };

	return emailRead;

});
