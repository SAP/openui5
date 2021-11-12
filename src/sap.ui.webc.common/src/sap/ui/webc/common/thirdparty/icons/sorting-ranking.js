sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sorting-ranking', './v4/sorting-ranking'], function (Theme, sortingRanking$2, sortingRanking$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? sortingRanking$1 : sortingRanking$2;
	var sortingRanking = { pathData };

	return sortingRanking;

});
