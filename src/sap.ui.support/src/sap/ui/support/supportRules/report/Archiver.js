/*!
 * ${copyright}
 */

/**
 * Creates a zip file
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/thirdparty/jszip', 'sap/ui/core/util/File'],
	function (jQuery, JSZip, File) {
	"use strict";

	/**
	 * The Archiver collects files for zip download
	 */
	var Archiver = function() {
		this._mData = {};
	};

	/**
	 * Adds vData with the name to the data collection. sType json and has will use JSON.stringify
	 */
	Archiver.prototype.add = function(sName, vData, sType) {
		if (!sName) {
			jQuery.sap.log.error("Archiver: No name was given.");
			return false;
		}
		if (!vData) {
			jQuery.sap.log.error("Archiver: No data was given.");
			return false;
		}
		if (typeof vData === "string") {
			this._mData[sName] = vData;
			return true;
		} else if (sType) {
			if ((sType === "json" || sType === "har") && (jQuery.isPlainObject(vData) || jQuery.isArray(vData))) {
				try {
					this._mData[sName] = JSON.stringify(vData);
					return true;
				} catch (ex) {
					jQuery.sap.log.error("Archiver: JSON data could not be serialized for " + sName);
				}
			} else {
				jQuery.sap.log.error("Archiver: JSON data could not be serialized for " + sType + ". Either the type is unknown or the data has a wrong format.");
			}
		} else {
			jQuery.sap.log.error("Archiver: Data could not be serialized for " + sName + ". Data is is not a string or has a an invalid type.");
			return false;
		}
		return false;
	};

	/**
	 * Downloads a zip
	 */
	Archiver.prototype.download = function() {
		var oZip = new JSZip();

		if (oZip) {
			for (var n in this._mData) {
				oZip.file(n, this._mData[n]);
			}

			var oContent = oZip.generate({
				type : "blob"
			});

			File.save(oContent, "SAPUI5TechnicalReport", "zip", "application/zip");
		}
	};

	Archiver.prototype.clear = function() {
		this._mData = {};
		return true;
	};

	Archiver.prototype.hasData = function(sName) {
		if (sName !== undefined) {
			return this._mData.hasOwnProperty(sName);
		}
		return Object.keys(this._mData).length > 0;
	};

	return Archiver;
}, true);
