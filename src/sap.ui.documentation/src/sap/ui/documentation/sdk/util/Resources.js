/*!
 * ${copyright}
 */

(function (root, factory) {
	"use strict";
	if (self.sap && self.sap.ui && typeof self.sap.ui.define  === 'function') {
		sap.ui.define(['sap/ui/thirdparty/URI'], factory);
	} else if (typeof self.exports === 'object' && typeof self.exports.nodeName !== 'string') {
		self.exports["ResourcesUtil"] = factory();
	} else {
		root["ResourcesUtil"] = factory();
	}
}(self, function (URI, b) {

	"use strict";

	var ResourcesUtil = {
		/**
		 *
		 * @param {string} sPath Relative path to resources
		 */
		getResourceOriginPath: function (sPath) {
			var oConfig, sOrigin,
				oUri = URI(sPath);
			if (oUri && oUri.is("absolute")) {
				return sPath;
			}
			oConfig = self['sap-ui-documentation-config'];
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
}));

