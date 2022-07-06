sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/measurement-document', './v4/measurement-document'], function (exports, Theme, measurementDocument$1, measurementDocument$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? measurementDocument$1.pathData : measurementDocument$2.pathData;
	var measurementDocument = "measurement-document";

	exports.accData = measurementDocument$1.accData;
	exports.ltr = measurementDocument$1.ltr;
	exports.default = measurementDocument;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
