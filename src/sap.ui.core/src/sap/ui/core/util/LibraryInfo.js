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
	 * @alias sap.ui.core.util.LibraryInfo
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
			
		var sLibraryType = ".library"; 
		
		var aParts = /themelib_(.*)/i.exec(sLibraryName);
		if (aParts != null) {
			sLibraryType = ".theme";
			var sThemeName = aParts[1];
			sUrl = "sap/ui/core/themes/" + sThemeName + "/";	
		}
		
		jQuery.ajax({
			url : sUrl + sLibraryType,
			dataType : "xml",
			error : function(xhr, status, e) {
				jQuery.sap.log.error("failed to load library details from '" + sUrl + sLibraryType + ": " + status + ", " + e);
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
				result.releasenotes = $data.find("releasenotes").attr("url"); // in the appdata section
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
	
	LibraryInfo.prototype._getReleaseNotes = function(sLibraryName, sVersion, fnCallback) {
		this._loadLibraryMetadata(sLibraryName, function(oData){
	
			if (!oData.data) {
				fnCallback({});
				return;
			}
			
			var oVersion = jQuery.sap.Version(sVersion);
			
			var iMajor = oVersion.getMajor();
			var iMinor = oVersion.getMinor();
			var iPatch = oVersion.getPatch();
			
			var $Doc = jQuery(oData.data).find("appData").find("releasenotes");
			var sUrl = $Doc.attr("url");
			
			if (!sUrl) {
				jQuery.sap.log.warning("failed to load release notes for library " + sLibraryName );
				fnCallback({});
				return;
			}
			
			// for SNAPSHOT versions we fallback to the next minor version, e.g.:
			// 1.27.1-SNAPSHOT => 1.28.0
			if (oVersion.getSuffix() === "-SNAPSHOT") {
				if (iMinor % 2 != 0) {
					iMinor = (iMinor + 1);
					iPatch = 0;
				}
				sVersion = iMajor + "." + iMinor + "." + iPatch;
			}
			
			// replace the placeholders for major, minor and patch
			sUrl = sUrl.replace("{major}", iMajor);
			sUrl = sUrl.replace("{minor}", iMinor);
			sUrl = sUrl.replace("{patch}", iPatch);
			
			// if the URL should be resolved against the library the URL
			// is relative to the library root path
			if ($Doc.attr("resolve") == "lib") {
				sUrl = oData.url + sUrl;
			}
			
			// load the changelog/releasenotes
			jQuery.ajax({
				url : sUrl,
				dataType : "json",
				error : function(xhr, status, e) {
					if (status === "parsererror") {
						jQuery.sap.log.error("failed to parse release notes for library '" + sLibraryName + ", " + e);
					} else {
						jQuery.sap.log.warning("failed to load release notes for library '" + sLibraryName + ", " + e);
					}
					fnCallback({});
				},
				success : function(oData, sStatus, oXHR) {
					// in case of a version is specified we return only the content
					// of the specific version instead of the full data of the release notes file.
					fnCallback(oData, sVersion);
				}
			});
			
		});
	};

	return LibraryInfo;

}, /* bExport= */ true);
