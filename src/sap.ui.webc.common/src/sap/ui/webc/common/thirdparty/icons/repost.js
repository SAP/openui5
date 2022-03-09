sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/repost', './v4/repost'], function (Theme, repost$2, repost$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? repost$1 : repost$2;
	var repost = { pathData };

	return repost;

});
