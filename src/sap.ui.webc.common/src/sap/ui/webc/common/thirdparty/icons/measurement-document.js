sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/measurement-document', './v4/measurement-document'], function (Theme, measurementDocument$2, measurementDocument$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? measurementDocument$1 : measurementDocument$2;
	var measurementDocument = { pathData };

	return measurementDocument;

});
