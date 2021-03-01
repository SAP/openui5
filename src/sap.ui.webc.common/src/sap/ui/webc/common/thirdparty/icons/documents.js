sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "documents";
	const pathData = "M448 128H256v64q0 14-9 23-10 9-24 9h-63v256h288V128zM64 416H32V32q0-14 10-23 9-9 22-9h288v32H64v384zM448 96q13 0 23 9 9 9 9 23v352q0 14-9 23t-23 9H160q-14 0-23-9t-9-23V192l96-96h224zm-64 256H224v-32h160v32zm0 64H224v-32h160v32z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var documents = { pathData };

	return documents;

});
