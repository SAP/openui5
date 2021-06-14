sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', './generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "delete";
	const pathData = "M480 96v33h-32l-32 351q0 32-32 32H128q-32 0-32-32L64 129H32V96h448zM128 480h256l32-351H96zM32 64V32h145l1-5 6-11 14.5-11L224 0h65q15 0 29.5 7.5T336 32h144v32H32zm206 352V191h34v225h-34zm71-2l20-224 33 3-20 224zM150 193l31-3 20 224-31 3z";
	const ltr = false;
	const accData = i18nDefaults.ICON_DELETE;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var _delete = { pathData, accData };

	return _delete;

});
