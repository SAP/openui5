sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "shelf";
	const pathData = "M467 0c18 0 30 12 30 30v451c0 18-12 30-30 30s-30-12-30-30v-60H76v60c0 18-12 30-30 30s-30-12-30-30V30c0-9 3-15 9-21s12-9 21-9h421zm-30 60H76v120h361V60zM76 360h361V240H76v120zm120-210c-18 0-30-12-30-30s12-30 30-30h120c18 0 30 12 30 30s-12 30-30 30H196zm120 120c18 0 30 12 30 30s-12 30-30 30H196c-18 0-30-12-30-30s12-30 30-30h120z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
