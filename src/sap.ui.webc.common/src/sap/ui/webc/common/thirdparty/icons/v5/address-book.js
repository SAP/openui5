sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "address-book";
	const pathData = "M409 51c44 0 77 33 77 76v307c0 43-33 77-77 77H103c-44 0-77-34-77-77V127c0-43 33-76 77-76h25V25c0-15 11-25 26-25s26 10 26 25v26h153V25c0-15 10-25 25-25 16 0 26 10 26 25v26h25zm26 383V127c0-15-10-25-26-25h-25v25c0 16-10 26-26 26-15 0-25-10-25-26v-25H180v25c0 16-11 26-26 26s-26-10-26-26v-25h-25c-15 0-26 10-26 25v307c0 15 11 25 26 25h306c16 0 26-10 26-25zM312 306c41 0 72 33 72 72v5c0 15-10 25-26 25H154c-15 0-26-10-26-25v-5c0-39 31-72 72-72h112zm-56-153c28 0 51 23 51 51s-23 51-51 51-51-23-51-51 23-51 51-51z";
	const ltr = true;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
