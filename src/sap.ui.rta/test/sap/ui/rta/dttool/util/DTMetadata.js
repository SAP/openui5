/*!
 * ${copyright}
 */
// Provides the Design Time Metadata for the sap.m.Button control
sap.ui.define([
	"sap/base/Log"
], function (
	Log
) {
	"use strict";
	var DTMetadata = function() {
	};
	var oCore = sap.ui.getCore();
	var mLibraryData = {};
	var mLibraryRuntimeData = {};
		/**
		 * Loads designtime metadata for the given libraries
		 * The core needs to be loaded before this call
		 * @param {string[]} aLibraryNames List of library names to be loaded
		 * @returns {Promise} promise that resolves after all design time data for the libraries is ready
		 * @private
		 */
	DTMetadata.loadLibraries = function(aLibraryNames) {
		var that = this;
		var oPromise = new Promise(function(resolve) {
				//load all core libs async
			oCore.loadLibraries(aLibraryNames).then(function() {
				Promise.all(
						//array of promises for the libs
						aLibraryNames.map(function(sLibraryName) {
							return that.loadLibrary(sLibraryName);
						})
					).then(function() {
						resolve(mLibraryData);
					});
			});
		});
		return oPromise;
	};
		/**
		 * Loads designtime metadata for the given library
		 * @param {string} sLibraryName the library name
		 * @returns {Promise} promise that resolves after all design time data for the library is loaded
		 * @protected
		 */
	DTMetadata.loadLibrary = function(sLibraryName) {
		var that = this;
		var oLibraryPromise = new Promise(function(fnResolve) {
			var sURL = sap.ui.resource(sLibraryName + ".designtime", 'messagebundle.properties');
			var oLib = oCore.getLoadedLibraries()[sLibraryName];
			if (mLibraryData[sLibraryName]) {
				return fnResolve(mLibraryData[sLibraryName]);
			}

			jQuery.sap.resources({url : sURL, async: true})

				.then(function(oResourceBundle) {
					var aPromises = [];
					mLibraryData[sLibraryName] = {
						resourceBundle : oResourceBundle,
						name: sLibraryName
					};

					var sControlName;

					for (var i0 = 0; i0 < oLib.controls.length; i0++) {
						sControlName = oLib.controls[i0];
						if (mLibraryData[sLibraryName][sControlName]) {
							continue;
						}
						aPromises.push(that.loadElement(sControlName, sLibraryName));
					}
					for (var i1 = 0; i1 < oLib.elements.length; i1++) {
						sControlName = oLib.elements[i1];
						if (mLibraryData[sLibraryName][sControlName]) {
							continue;
						}
						aPromises.push(that.loadElement(sControlName, sLibraryName));
					}
					return aPromises;
				})

				.then(function(aPromises) {
					return Promise.all(aPromises).then(function(aData) {
						//enhance and register all control design time data
						aData.forEach(function (oData) {
							if (oData) {
								registerDTData(sLibraryName, oData);
							}
						});
						//after all designtime data for real controls is created the virtual controls can be processed
						if (oLib.designtime) {
							sap.ui.require([oLib.designtime], function(oLibData) {
								//pure design time interfaces for existing controls
								if (oLibData.controls) {
									oLibData.controls.forEach(function (oData) {
										if (oData) {
											oData = jQuery.extend(true, {}, mLibraryData[sLibraryName][oData.is], oData);
											oData.designtimeModule = jQuery.sap.getResourceName(oData.className, ".designtime");
											registerDTData(sLibraryName, oData);
										}
									});
								}
								if (oLibData.elements) {
									oLibData.elements.forEach(function (oData) {
										if (oData) {
											oData = jQuery.extend(true, {}, mLibraryData[sLibraryName][oData.is], oData);
											oData.designtimeModule = jQuery.sap.getResourceName(oData.className, ".designtime");
											registerDTData(sLibraryName, oData);
										}
									});
								}
								that.enrichAPIDoc(mLibraryData[sLibraryName]);
								fnResolve(mLibraryData[sLibraryName]);
							}, function(ex) {
								Log.error("Designtime data for cannot be loaded", ex);
								fnResolve(null);
							});
						} else {
							that.enrichAPIDoc(mLibraryData[sLibraryName]);
							fnResolve(mLibraryData[sLibraryName]);
						}
					});
				});
		});
		return oLibraryPromise;
	};
	DTMetadata.enrichAPIDoc = function (oLibData) {
		var oAPI = oLibData.apiJSON;
		if (!oAPI || !oAPI.symbols || oAPI.symbols.length === 0) {
			return;
		}
			//create a map for the classes, enums
		var mControlAPIJson = {};
		var mEnumsAPIJson = {};
		oAPI.symbols.filter(function(oEntry) {
			if (oEntry.kind === "class" && oLibData[oEntry.name]) {
				mControlAPIJson[oEntry.name] = oEntry;
			}
			if (oEntry.kind === "enum") {
				mEnumsAPIJson[oEntry.name] = oEntry;
			}
		});
		for (var n in oLibData) {
			var oEntry = mControlAPIJson[n];
			var oDTEntry = this.getRuntimeData(oLibData.name, n);
			if (oEntry && oDTEntry) {
					//description
				if (oEntry.description) {
					oLibData[n].descriptions = oLibData[n].descriptions || { "short":"", "long":""};
					oLibData[n].descriptions.long = oLibData[n].descriptions.long || oEntry.description;
					oLibData[n].descriptions.short = oLibData[n].descriptions.short || oEntry.description;
				}
			}
		}
	};
	DTMetadata.getRuntimeData = function(sLib, sName, oData) {
		if (mLibraryRuntimeData[sLib] && mLibraryRuntimeData[sLib][sName]) {
			mLibraryRuntimeData[sLib] = mLibraryRuntimeData[sLib] || {};
			if (mLibraryRuntimeData[sLib][sName] && mLibraryRuntimeData[sLib][sName].is) {
				return mLibraryData[sLib][oData.is];
			}
			return mLibraryRuntimeData[sLib][sName];
		}
	};
		/**
		 * Loads the elements design time data
		 */
	DTMetadata.loadElement = function(sName) {
		var that = this;
		var oPromise = new Promise(function(resolve) {
			sap.ui.require([sName.replace(/\./g, "/")], function(oControlClass) {
				//module path from name
				if (oControlClass && oControlClass.getMetadata() && (oControlClass.getMetadata().getStereotype() === "control" || oControlClass.getMetadata().getStereotype() === "element")) {
					var oMetadata = oControlClass.getMetadata();
					if (oMetadata.isAbstract()) {
						jQuery.sap.log.debug("Abstract class not available in design time " + oMetadata.getName());
						resolve(null);
					}
					// load the library designtime.json
					oMetadata.loadDesignTime().then(function(oDTData) {
						var oData = that.exportDTRuntimeData(oMetadata);
						mLibraryRuntimeData[oData.library] = mLibraryRuntimeData[oData.library] || {};
						mLibraryRuntimeData[oData.library][sName] = jQuery.extend(true, {}, oData);
						//do not extent the class name and displayName for derived classes
						if (oDTData.className !== oData.className) {
							oDTData.className = oData.className;
							oDTData.displayName = oData.displayName;
						}
						resolve(jQuery.extend(true, oData, oDTData));
					});
				}
			}, function() {
				jQuery.sap.log.debug("Designtime data for " + sName + " cannot be loaded");
				resolve(null);
			});
		});
		return oPromise;
	};
	DTMetadata.exportDTRuntimeData = function(oMetadata) {
		var sClassName = oMetadata.getName();
		var sName = splitCamelCase(sClassName.substring(sClassName.lastIndexOf(".") + 1));
		var oData = {
			className: sClassName,
			"abstract": oMetadata.isAbstract(),
			library: oMetadata.getLibraryName(),
			stereotype: oMetadata.getStereotype(),
			designtime: !!oMetadata._oDesignTime,
			displayName: {
				singular: sName,
				plural: sName.substring(sName.length - 1) !== "s" ? sName + "s" : sName
			},
			actions: {
			},
			properties: {},
			aggregations: {},
			associations: {},
			events: {}
		};
		var mAllRuntimeSettings = oMetadata.getAllSettings();
		for (var n in mAllRuntimeSettings) {
			var oSetting = mAllRuntimeSettings[n];
			if (oSetting._iKind === 0) {
				oData.properties[oSetting.name] = {};
				var oProperty = oData.properties[oSetting.name];
				oProperty.name = oSetting.name;
				oProperty.type = oSetting.type;
				oProperty.group = oSetting.group || "Misc";
				oProperty.defaultValue = oSetting.defaultValue;
				oProperty.categories = [oProperty.group];
				oProperty.visibility = oSetting.visibility || "public";
				oProperty.bindable = !!oSetting.bindable || false;
				oProperty.writable = "always";
				oProperty.selector = oSetting.selector;
				oProperty.ignore = false;
				oProperty.deprecated = oSetting.deprecated;
				oProperty.ignore = oSetting.deprecated || oSetting.visibility === "hidden";
				oProperty.displayName = splitCamelCase(oSetting.name.substring(0, 1).toUpperCase() + oSetting.name.substring(1));
			}
			if (oSetting._iKind === 1 || oSetting._iKind === 2) {
				oData.aggregations[oSetting.name] = {};
				var oAggr = oData.aggregations[oSetting.name];
				oAggr.name = oSetting.name;
				oAggr.group = oSetting.group || "Misc";
				oAggr.type = oSetting.type;
				oAggr.altTypes = oSetting.altTypes;
				oAggr.multiple = oSetting.multiple;
				oAggr.categories = [oAggr.group];
				oAggr.visibility = oSetting.visibility || "public";
				oAggr.bindable = !!oSetting.bindable || false;
				oAggr.selector = oSetting.selector;
				oAggr.writable = "always";
				oAggr.deprecated = oSetting.deprecated;
				oAggr.ignore = oSetting.deprecated || oSetting.visibility === "hidden";
				oAggr.displayName = splitCamelCase(oSetting.name.substring(0, 1).toUpperCase() + oSetting.name.substring(1));
			}
			if (oSetting._iKind === 3 || oSetting._iKind === 4) {
				oData.associations[oSetting.name] = {};
				var oAsso = oData.associations[oSetting.name];
				oAsso.name = oSetting.name;
				oAsso.group = oSetting.group || "Misc";
				oAsso.type = oSetting.type;
				oAsso.multiple = oSetting.multiple;
				oAsso.categories = [oAsso.group];
				oAsso.visibility = oSetting.visibility || "public";
				oAsso.bindable = !!oSetting.bindable || false;
				oAsso.deprecated = oSetting.deprecated;
				oAsso.ignore = oSetting.deprecated || oSetting.visibility === "hidden";
				oAsso.displayName = splitCamelCase(oSetting.name.substring(0, 1).toUpperCase() + oSetting.name.substring(1));
			}
			if (oSetting._iKind === 5) {
				oData.events[oSetting.name] = {};
				var oEvent = oData.events[oSetting.name];
				oEvent.name = oSetting.name;
				oEvent.ignore = oSetting.deprecated || oSetting.visibility === "hidden";
				oEvent.deprecated = oSetting.deprecated;
				oEvent.displayName = splitCamelCase(oSetting.name.substring(0, 1).toUpperCase() + oSetting.name.substring(1));
			}
		}
		return oData;
	};
	function registerDTData(sLibraryName, oData) {
		createLists(oData);
		translate(oData, sLibraryName);
		mLibraryData[sLibraryName][oData.className] = oData;
	}
	function splitCamelCase(sName) {
		if (typeof sName === "string") {
			return sName.replace(/([A-Z])([a-z])/g, ' $1$2').trim();
		}
		return "";
	}
	function createLists(oData) {
		if (!oData) {
			return;
		}
		["properties", "aggregations", "associations", "events"].forEach(function(sPropertyName) {
			oData[sPropertyName + "List"] = (
					oData[sPropertyName]
					&& Object.keys(oData[sPropertyName]).map(function(sKey) {
						return oData[sPropertyName][sKey];
					})
					) || [];
		});
	}
	DTMetadata.createLists = createLists;
	function translate(oData, sLibrary) {
		if (!sLibrary) {
			sLibrary = oData.library;
		}
		var oBundle = mLibraryData[sLibrary] && mLibraryData[sLibrary].resourceBundle;
		if (!oBundle) {
			return;
		}
		for (var n in oData) {
			if (Array.isArray(oData[n])) {
				for (var i = 0; i < oData[n].length; i++) {
					translate(oData[n][i], sLibrary);
				}
			} else if (typeof oData[n] === "object") {
				translate(oData[n], sLibrary);
			} else if (typeof oData[n] === "string") {
				if (oData[n].indexOf("i18n>") === 0) {
					var sKey = oData[n].substring(5);
					if (oBundle.hasText(sKey)) {
						oData[n] = oBundle.getText(sKey);
					} else {
						delete oData[n];
					}
				}
			}
		}
	}
	DTMetadata.translate = translate;
	return DTMetadata;
}, /* bExport= */ true);
