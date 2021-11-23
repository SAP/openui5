sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/filter-facets', './v4/filter-facets'], function (Theme, filterFacets$2, filterFacets$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? filterFacets$1 : filterFacets$2;
	var filterFacets = { pathData };

	return filterFacets;

});
