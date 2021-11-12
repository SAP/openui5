sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/idea-wall', './v4/idea-wall'], function (Theme, ideaWall$2, ideaWall$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? ideaWall$1 : ideaWall$2;
	var ideaWall = { pathData };

	return ideaWall;

});
