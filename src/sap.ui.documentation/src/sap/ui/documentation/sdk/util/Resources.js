/*!
 * ${copyright}
 */

// Provides a simple search feature
sap.ui.define([],
	function() {
		"use strict";


		var ResourcesUtil = {
			getResourceOriginPath: function (sPath) {
				var oConfig = window['sap-ui-documentation-config'],
					sOrigin = (oConfig && oConfig.demoKitResourceOrigin) || '.';
				return sOrigin + this._formatPath(sPath);
			},
			_formatPath: function(sPath) {
				sPath = sPath.replace(/^\.\//, '/');

				if (!sPath.match(/^\//)) {
					sPath = "/" + sPath;
				}
				return sPath;
			}
		};

		return ResourcesUtil;

	}, /* bExport= */ true);