sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/comment', './v4/comment'], function (Theme, comment$2, comment$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? comment$1 : comment$2;
	var comment = { pathData };

	return comment;

});
