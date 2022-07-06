sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/filter-facets', './v4/filter-facets'], function (exports, Theme, filterFacets$1, filterFacets$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? filterFacets$1.pathData : filterFacets$2.pathData;
	var filterFacets = "filter-facets";

	exports.accData = filterFacets$1.accData;
	exports.ltr = filterFacets$1.ltr;
	exports.default = filterFacets;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
