sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "delete";
	const pathData = "M205 205c15 0 26 10 26 26v153c0 15-11 26-26 26s-25-11-25-26V231c0-16 10-26 25-26zm102 0c16 0 26 10 26 26v153c0 15-10 26-26 26-15 0-25-11-25-26V231c0-16 10-26 25-26zm154-102c15 0 25 10 25 26 0 15-10 25-25 25h-26v281c0 44-33 77-77 77H154c-43 0-77-33-77-77V154H52c-16 0-26-10-26-25 0-16 10-26 26-26h76V77c0-43 34-76 77-76h102c44 0 77 33 77 76v26h77zM180 77v26h153V77c0-15-10-25-26-25H205c-15 0-25 10-25 25zm204 358V154H128v281c0 16 11 26 26 26h204c16 0 26-10 26-26z";
	const ltr = false;
	const accData = i18nDefaults.ICON_DELETE;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
