/*!
 * ${copyright}
 */

(function (root, factory) {
	"use strict";
	if (typeof self.sap?.ui?.define === 'function') {
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
			var sOrigin,
				oUri = URI(sPath),
				sVersionPrefixPath = this.getResourcesVersion();
			if (oUri && oUri.is("absolute")) {
				return sPath;
			}
			sOrigin = this.getConfig();

			return sOrigin + sVersionPrefixPath + this._formatPath(sPath);
		},
		getHasProxy: function () {
			return new window.URLSearchParams(window.location.search).get('sap-ui-xx-unifiedResources') != null ||
				window["sap-ui-unified-resources"];
		},
		getResourcesVersion: function() {
			return this.getHasProxy() && window.sessionStorage.getItem("versionPrefixPath") || "";
		},
		getConfig: function() {
			return self['sap-ui-documentation-config'] && self['sap-ui-documentation-config'].demoKitResourceOrigin || ".";
		},
		getResourceOrigin: function() {
			return this.getConfig().replace("/sapui5", "").replace("/openui5", "");
		},
		_formatPath: function(sPath) {
			sPath = sPath.replace(/^\.\//, '/');

			if (!sPath.match(/^\//)) {
				sPath = "/" + sPath;
			}
			return sPath;
		},
		isInternal: function (oVersionInfo) {
			return (/internal/i.test(oVersionInfo.name) || (self['sap-ui-documentation-config'] && self['sap-ui-documentation-config'].visibility === "internal")) || false;
		}
	};

	return ResourcesUtil;
}));

