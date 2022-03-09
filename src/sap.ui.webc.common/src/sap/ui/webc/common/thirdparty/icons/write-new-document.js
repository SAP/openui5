sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/write-new-document', './v4/write-new-document'], function (Theme, writeNewDocument$2, writeNewDocument$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? writeNewDocument$1 : writeNewDocument$2;
	var writeNewDocument = { pathData };

	return writeNewDocument;

});
