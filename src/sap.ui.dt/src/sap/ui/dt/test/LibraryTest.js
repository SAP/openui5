/*!
 * ${copyright}
 */
// Provides class sap.ui.dt.test.LibraryTest.
sap.ui.define(['sap/ui/model/resource/ResourceModel', 'sap/ui/model/json/JSONModel', 'jquery.sap.global'
], function(ResourceModel, JSONModel, jQuery) {
	"use strict";
	var aDesigntimeElements = [],
		aModels = [],
		mBundles = {},
		sLibrary;
	function hasText(sKey, oBundle) {
		return oBundle.hasText(sKey) || oBundle.getText(sKey, [], true) !== null;
	}
	var LibraryTest = function(sTestLibrary, QUnit) {
		//switching off autostart needs to be done in the individual test files before the LibraryTest.js is loaded.
		//QUnit.config.autostart = false;
		var oPromise = new Promise(function(resolve) {
			sap.ui.getCore().loadLibraries([sTestLibrary]).then(function() {
				var oLibrary = sap.ui.getCore().getLoadedLibraries()[sTestLibrary],
					aElements = oLibrary.controls.concat(oLibrary.elements);
				sLibrary = sTestLibrary;
				sap.ui.require(aElements.map(function(s) {
					return jQuery.sap.getResourceName(s,"");
				}), function() {
					//all controls are loaded, now all libs are loaded
					var mLazyLibraries = sap.ui.getCore().getLoadedLibraries();
					try {
						var oRuntimeResourceModel = new ResourceModel({
								bundleUrl: sap.ui.resource(sTestLibrary, "messagebundle.properties"),
								bundleLocale:"en"
							}),
							oDesigntimeResourceModel = new ResourceModel({
								bundleUrl: sap.ui.resource(sTestLibrary + ".designtime", "messagebundle.properties"),
								bundleLocale:"en"
							});
						mBundles.runtime = oRuntimeResourceModel.getResourceBundle();
						mBundles.designtime = oDesigntimeResourceModel.getResourceBundle();
						Object.keys(mLazyLibraries).forEach(function(sLib) {
							if (sTestLibrary !== sLib) {
								oRuntimeResourceModel.enhance({
									bundleUrl: sap.ui.resource(sLib, "messagebundle.properties"),
									bundleLocale:"en"
								});
								oDesigntimeResourceModel.enhance({
									bundleUrl: sap.ui.resource(sLib + ".designtime", "messagebundle.properties"),
									bundleLocale:"en"
								});
							}
						});
					} catch (e) {
						/*eslint-disable no-empty*/
					}
					var aDesigntimePromises = [],
						aControlMetadata = [];
					for (var i = 0; i < arguments.length; i++) {
						if (arguments[i].getMetadata()._oDesignTime) {
							aDesigntimePromises.push(arguments[i].getMetadata().loadDesignTime());
							aControlMetadata.push(arguments[i].getMetadata());
						}
					}
					Promise.all(aDesigntimePromises).then(function (aElements) {
						var i = 0;
						aDesigntimeElements = aElements;
						aModels = aDesigntimeElements.map(function(o) {
							var oModel = new JSONModel(o);
							oModel._oControlMetadata = aControlMetadata[i];
							i++;
							return oModel;
						});
						addTests(QUnit);
						QUnit.start();
						resolve();
					});
				});
			});
		});
		return oPromise;
	};
	var mModelChecks = {
		"/" : {
			optional: false,
			check: function (assert, oObject, sControlName) {
				assert.strictEqual(typeof oObject, "object", sControlName + " is an object");
			}
		},
		"/designtimeModule" : {
			optional: false,
			check: function (assert, sString, sControlName) {
				assert.strictEqual(typeof sString, "string", sControlName + " defines /designtimeModule : " + sString);
			}
		},
		"/actions" : {
			optional: true,
			check: function (assert, mActions, sControlName) {
				Object.keys(mActions).forEach(function(sAction) {
					if (mActions[sAction].changeType) {
						assert.strictEqual(typeof mActions[sAction].changeType, "string", sControlName + " defines " + sAction + " with changetype:" + mActions[sAction].changeType);
					} else {
						if (typeof mActions[sAction] === "string") {
							assert.strictEqual(typeof mActions[sAction], "string", sControlName + " defines " + sAction + " as string");
						} else {
							assert.strictEqual(typeof mActions[sAction], "function", sControlName + " defines " + sAction + " as function");
						}
					}
				});
			}
		},
		"/name" : {
			optional: true,
			check: function (assert, mEntry, sControlName) {
				//name can be a string like this "{name}"
				//TODO: be more strict here
				if (typeof mEntry === "string" && mEntry.indexOf("{") === 0 && mEntry.indexOf("}") == mEntry.length - 1) {
					return true;
				}
				//checking name.plural and name.singular if any
				var aKeys = ["singular", "plural"];
				aKeys.forEach(function (sKey) {
					if (typeof mEntry[sKey] === "function") {
						//special handling for old function definitions
						assert.strictEqual(typeof mEntry[sKey], "function", sControlName + " defines mandatory entry /name/" + sKey);
					} else {
						//normally it is defined as string
						assert.strictEqual(typeof mEntry[sKey], "string", sControlName + " defines mandatory entry /name/" + sKey);
					}
				});
				aKeys.forEach(function (sKey) {
					var bDTFound = false;
					//special handling for old function definitions
					if (typeof mEntry[sKey] === "function") {
						assert.strictEqual(typeof mEntry[sKey], "function", sControlName + " defines function for translation of entry /name/" + sKey);
						assert.strictEqual(typeof mEntry[sKey](), "string", "Assuming that " + sKey + " with " + mEntry[sKey].toString() + " returns a translation at runtime");
						return;
					}
					//proceed normally with a translation key
					if (mEntry[sKey].toUpperCase() !== mEntry[sKey]) {
						//TODO:this should be enabled before a release of the new design time data
						assert.ok(true, "Assuming that " + sKey + " with " + mEntry[sKey] + " needs currently no translation");
						return;
					}
					//name/singular
					if (mBundles.designtime) {
						bDTFound = hasText(mEntry[sKey], mBundles.designtime);
						assert.strictEqual(bDTFound, true, mEntry[sKey] + " found in designtime message bundle");
					}
					if (mBundles.runtime) {
						if (bDTFound) {
							assert.strictEqual(hasText(mEntry[sKey], mBundles.runtime), false, mEntry[sKey] + " found in runtime message bundle and designtime message bundle, please delete the entry from the runtime message bundle (messagebundle.properties + messagebundle_en.properties)");
						} else {
							assert.strictEqual(hasText(mEntry[sKey], mBundles.runtime), true, mEntry[sKey] + " found in runtime message bundle only, consider to move this text to the designtime message bundle");
						}
					}
				});
			}
		},
		"/palette" : {
			optional: true,
			check: function (assert, mEntry, sControlName) {
				var aValidGroups = ["ACTION", "DISPLAY", "LAYOUT", "LIST", "INPUT", "CONTAINER", "CHART", "TILE", "DIALOG"];
				assert.strictEqual(typeof mEntry, "object", sControlName + " defines optional entry /palette/");
				assert.strictEqual(aValidGroups.indexOf(mEntry.group) > -1, true, "palette entry defines valid group " + mEntry.group);
				if (mEntry.icons) { //icons in palette optional
					Object.keys(mEntry.icons).forEach(function(sKey) {
						var sIcon = mEntry.icons[sKey];
						assert.strictEqual(typeof sIcon, "string", "palette/icons/" + sKey + " entry defines icon path " + sIcon);
						var oResult = jQuery.sap.sjax({
							url: jQuery.sap.getResourcePath(sIcon, "")
						});
						assert.ok(oResult.status === "success", "File " + sIcon + " does exist. Check entry palette/icons/" + sKey);
						if (sIcon.indexOf(".svg") === sIcon.length - 4) {
							assert.ok(oResult.data.documentElement && oResult.data.documentElement.tagName === "svg", "File " + sIcon + " starts with a svg node");
						}
					});
				}
			}
		},
		"/templates" : {
			optional: true,
			check: function (assert, mEntry, sControlName) {
				if (mEntry.create) { //icons in palette optional
					var sCreateTemplate = mEntry.create;
					assert.strictEqual(typeof sCreateTemplate, "string", "templates/create entry defines fragment path to " + sCreateTemplate);
					var oData = jQuery.sap.sjax({url: jQuery.sap.getResourcePath(sCreateTemplate,"")});
					assert.ok(oData.data.documentElement && oData.data.documentElement.localName === "FragmentDefinition", "File " + sCreateTemplate + " exists and starts with a FragmentDefinition node");
					/*
					var oControl = sap.ui.xmlfragment({
						fragmentContent: oData.data.documentElement,
						oController: this
					});
					*/
					//check the controls type
					//assert.strictEqual((oControl instanceof jQuery.sap.getObject(sControlName)) ||  , true, sCreateTemplate + " created a control with the right type " + sControlName + "/" + oControl.getMetadata().getName());
				}
			}
		}
	};
	function addTests(QUnit) {
		QUnit.asyncTest("Checking library.designtime.js", function(assert) {
			var oLibrary = sap.ui.getCore().getLoadedLibraries()[sLibrary];
			if (oLibrary.designtime) {
				sap.ui.require([oLibrary.designtime], function(o) {
					assert.ok(o !== null, oLibrary.designtime + " loaded successfully");
					QUnit.start();
				});
			} else {
				assert.ok(true, "No library.designtime.js " + sLibrary);
				QUnit.start();
			}
		});
		QUnit.test("Checking loaded designtime data", function(assert) {
			aDesigntimeElements.forEach(function(oDTData) {
				assert.strictEqual(oDTData != null, true, "Designtime data found and loaded successful");
				assert.strictEqual(typeof oDTData,"object", "Designtime data returned an object");
			});
		});
		aModels.forEach(function(oModel) {
			var oControlMetadata = oModel._oControlMetadata,
				sControlName = oControlMetadata.getName();
			QUnit.test(sControlName + ": Checking entries in designtime data", function(assert) {
				Object.keys(mModelChecks).forEach(function(sPath) {
					var oCheck = mModelChecks[sPath];
					var vValue = oModel.getProperty(sPath);
					if (vValue === undefined && !oCheck.optional) {
						assert.equal(false, true, sControlName + " does not define mandatory entry " + sPath);
					} else if (vValue !== undefined && oCheck.optional) {
						assert.equal(true, true, sControlName + " does define optional entry " + sPath);
						oCheck.check(assert, vValue, sControlName);
					} else if (vValue !== undefined && !oCheck.optional) {
						assert.equal(true, true, sControlName + " does define mandatory entry " + sPath);
						oCheck.check(assert, vValue, sControlName);
					}
				});
			});
		});
	}
	return LibraryTest;
}, true);
