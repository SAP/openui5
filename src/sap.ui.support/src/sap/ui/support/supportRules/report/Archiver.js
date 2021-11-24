/*!
 * ${copyright}
 */

/**
 * Creates a zip file
 */
sap.ui.define(['sap/base/Log', 'sap/base/util/isPlainObject', 'sap/ui/thirdparty/jszip', 'sap/ui/core/util/File'],
	function (Log, isPlainObject, JSZip, File) {
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
			Log.error("Archiver: No name was given.");
			return false;
		}
		if (!vData) {
			Log.error("Archiver: No data was given.");
			return false;
		}
		if (typeof vData === "string") {
			this._mData[sName] = vData;
			return true;
		} else if (sType) {
			if ((sType === "json" || sType === "har") && (isPlainObject(vData) || Array.isArray(vData))) {
				try {
					this._mData[sName] = JSON.stringify(vData);
					return true;
				} catch (ex) {
					Log.error("Archiver: JSON data could not be serialized for " + sName);
				}
			} else {
				Log.error("Archiver: JSON data could not be serialized for " + sType + ". Either the type is unknown or the data has a wrong format.");
			}
		} else {
			Log.error("Archiver: Data could not be serialized for " + sName + ". Data is is not a string or has a an invalid type.");
			return false;
		}
		return false;
	};

	/**
	 * Downloads a zip file
	 * @public
	 * @param {string} fileName the name of the zip file
	 */
	Archiver.prototype.download = function(fileName) {
		var oZip = new JSZip();

		if (oZip) {
			for (var n in this._mData) {
				oZip.file(n, this._mData[n]);
			}

			var oContent = oZip.generate({
				type : "blob"
			});

			File.save(oContent, fileName, "zip", "application/zip");
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
