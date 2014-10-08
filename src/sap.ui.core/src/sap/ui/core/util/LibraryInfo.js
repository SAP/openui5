/*!
 * ${copyright}
 */

// Provides class sap.ui.core.util.LibraryInfo
sap.ui.define(['jquery.sap.global', 'sap/ui/base/Object', 'jquery.sap.script'],
	function(jQuery, BaseObject/* , jQuerySap */) {
	"use strict";


	/**
	 * Provides library information.
	 * @class Provides library information.
	 *
	 * @extends sap.ui.base.Object
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @name sap.ui.core.util.LibraryInfo
	 */
	var LibraryInfo = BaseObject.extend("sap.ui.core.util.LibraryInfo", {
		constructor : function() {
			BaseObject.apply(this);
			this._oLibInfos = {};
		},
		
		destroy : function() {
			BaseObject.prototype.destroy.apply(this, arguments);
			this._oLibInfos = {};
		},
		
		getInterface : function() {
			return this;
		}
	});
	
	
	LibraryInfo.prototype._loadLibraryMetadata = function(sLibraryName, fnCallback) {
		sLibraryName = sLibraryName.replace(/\//g, ".");
		
		if (this._oLibInfos[sLibraryName]) {
			jQuery.sap.delayedCall(0, window, fnCallback, [this._oLibInfos[sLibraryName]]);
			return;
		}
		
		var sUrl = jQuery.sap.getModulePath(sLibraryName, '/'),
			that = this;
		
		jQuery.ajax({
			url : sUrl + ".library",
			dataType : "xml",
			error : function(xhr, status, e) {
				jQuery.sap.log.error("failed to load library details from '" + sUrl + ".library': " + status + ", " + e);
				that._oLibInfos[sLibraryName] = {name: sLibraryName, data: null, url: sUrl};
				fnCallback(that._oLibInfos[sLibraryName]);
			},
			success : function(oData, sStatus, oXHR) {
				that._oLibInfos[sLibraryName] = {name: sLibraryName, data: oData, url: sUrl};
				fnCallback(that._oLibInfos[sLibraryName]);
			}
		});
	};
	
	
	LibraryInfo.prototype._getLibraryInfo = function(sLibraryName, fnCallback) {
		this._loadLibraryMetadata(sLibraryName, function(oData){
			var result = {libs: [], library: oData.name, libraryUrl: oData.url};
	
			if (oData.data) {
				var $data = jQuery(oData.data);
				result.vendor = $data.find("vendor").text();
				result.copyright = $data.find("copyright").text();
				result.version = $data.find("version").text();
				result.documentation = $data.find("documentation").text();
			}
			
			fnCallback(result);
		});
	};
	
	
	LibraryInfo.prototype._getThirdPartyInfo = function(sLibraryName, fnCallback) {
		this._loadLibraryMetadata(sLibraryName, function(oData){
			var result = {libs: [], library: oData.name, libraryUrl: oData.url};
	
			if (oData.data) {
				var $Libs = jQuery(oData.data).find("appData").find("thirdparty").children();
				$Libs.each(function(i, o){
					if (o.nodeName === "lib") {
						var $Lib = jQuery(o);
						var $license = $Lib.children("license");
						result.libs.push({
							displayName: $Lib.attr("displayName"),
							homepage: $Lib.attr("homepage"),
							license: {
								url: $license.attr("url"),
								type: $license.attr("type"),
								file: oData.url + $license.attr("file")
							}
						});
					}
				});
			}
			
			fnCallback(result);
		});
	};
	
	
	LibraryInfo.prototype._getDocuIndex = function(sLibraryName, fnCallback) {
		this._loadLibraryMetadata(sLibraryName, function(oData){
			var lib = oData.name,
				libUrl = oData.url,
				result = {"docu": {}, library: lib, libraryUrl: libUrl};
	
			if (!oData.data) {
				fnCallback(result);
				return;
			}
				
			var $Doc = jQuery(oData.data).find("appData").find("documentation");
			var sUrl = $Doc.attr("indexUrl");
			
			if (!sUrl) {
				fnCallback(result);
				return;
			}
				
			if ($Doc.attr("resolve") == "lib") {
				sUrl = oData.url + sUrl;
			}
			
			jQuery.ajax({
				url : sUrl,
				dataType : "json",
				error : function(xhr, status, e) {
					jQuery.sap.log.error("failed to load library docu from '" + sUrl + "': " + status + ", " + e);
					fnCallback(result);
				},
				success : function(oData, sStatus, oXHR) {
					oData.library = lib;
					oData.libraryUrl = libUrl;
					fnCallback(oData);
				}
			});
		});
	};

	return LibraryInfo;

}, /* bExport= */ true);
