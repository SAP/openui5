/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/documentation/sdk/controller/util/ResourceDownloadUtil",
	"sap/ui/documentation/sdk/controller/util/XML2JSONUtils"], function(ResourceDownloadUtil, XML2JSONUtils) {
		"use strict";

		var _fetchPromises = {};
		var _oAppConfig;

		var Loader = {
			fetch: function (sUrl) {

				if (!(sUrl in _fetchPromises)) {
					_fetchPromises[sUrl] = this._fetch(sUrl);
				}
				return _fetchPromises[sUrl];
			},

			_fetch: function(sUrl) {
				return ResourceDownloadUtil.fetch(sUrl).then(function(sContent) {
					return XML2JSONUtils.XML2JSON(sContent, _oAppConfig);
				});
			}
		};

		return {
			getInstance: function(oAppConfig) {
				_oAppConfig = oAppConfig;
				return Loader;
			}
		};
	});