/*!
 * ${copyright}
 */

// Provides a simple search feature
sap.ui.define([],
	function() {
		"use strict";

		// this module helps with getting a full URL using the
		// predefined resource origin, i.e. the location of
		// resources used in Demo Kit

		var ResourcesUtil = {
			/**
			 *
			 * @param {string} sPath Relative path to resources
			 */
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