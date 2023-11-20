/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/json/JSONModel"
], function(
	Lib,
	ResourceModel,
	JSONModel
) {
	"use strict";
	var aDesigntimeElements = [];
	var aModels = [];
	var mBundles = {};
	var sLibrary;
	function hasText(sKey, oBundle) {
		return oBundle.hasText(sKey) || oBundle.getText(sKey, [], true) !== undefined;
	}

	/*
	 * Creates unit tests to check the consistency of a library's designtime metadata.
	 *
	 * <code>LibraryTest</code> creates QUnit tests asynchronously. Therefore, a caller must ensure that QUnit
	 * does not start automatically. When the returned promise resolves, all tests have been created and QUnit can
	 * be started. Callers that are executed by the generic test starter can simply return the returned promise
	 * as their module export. The test starter will wait for that promise and start QUnit afterwards.
	 *
	 * @example <caption>Using generic test starter</caption>
	 *
	 *   sap.ui.define(["sap/ui/dt/enablement/libraryTest"], function (libraryTest) {
	 *       "use strict";
	 *       return libraryTest("sap.f");
	 *   });
	 *
	 *
	 * @example <caption>Without test starter</caption>
	 *   QUnit.config.autostart = false;
	 *
	 *   sap.ui.require(["sap/ui/dt/enablement/libraryTest"], function (libraryTest) {
	 *       "use strict";
	 *       libraryValidator("sap.f").then(function() {
	 *           QUnit.start();
	 *       );
	 *   });
	 *
	 */
	var LibraryTest = function(sTestLibrary) {
		return new Promise(function(resolve) {
			Lib.load({name: sTestLibrary}).then(function(oLibrary) {
				var aElements = oLibrary.controls.concat(oLibrary.elements);
				sLibrary = sTestLibrary;
				sap.ui.require(aElements.map(function(s) {
					return s.replace(/\./g, "/");
				}), function(...aArgs) {
					// all controls are loaded, now all libs are loaded
					var mLazyLibraries = Lib.all();
					try {
						var oRuntimeResourceModel = new ResourceModel({
							bundleUrl: sap.ui.require.toUrl(sTestLibrary, "messagebundle.properties"),
							bundleLocale: "en"
						});
						var oDesigntimeResourceModel = new ResourceModel({
							bundleUrl: sap.ui.require.toUrl(`${sTestLibrary}.designtime`, "messagebundle.properties"),
							bundleLocale: "en"
						});
						mBundles.runtime = oRuntimeResourceModel.getResourceBundle();
						mBundles.designtime = oDesigntimeResourceModel.getResourceBundle();
						Object.keys(mLazyLibraries).forEach(function(sLib) {
							if (sTestLibrary !== sLib) {
								oRuntimeResourceModel.enhance({
									bundleUrl: sap.ui.require.toUrl(sLib, "messagebundle.properties"),
									bundleLocale: "en"
								});
								oDesigntimeResourceModel.enhance({
									bundleUrl: sap.ui.require.toUrl(`${sLib}.designtime`, "messagebundle.properties"),
									bundleLocale: "en"
								});
							}
						});
					} catch (e) {
						/* eslint-disable no-empty */
					}
					var aDesigntimePromises = [];
					var aControlMetadata = [];
					for (var i = 0; i < aArgs.length; i++) {
						if (aArgs[i].getMetadata()._oDesignTime) {
							aDesigntimePromises.push(aArgs[i].getMetadata().loadDesignTime());
							aControlMetadata.push(aArgs[i].getMetadata());
						}
					}
					Promise.all(aDesigntimePromises).then(function(aElements) {
						var i = 0;
						aDesigntimeElements = aElements;
						aModels = aDesigntimeElements.map(function(o) {
							var oModel = new JSONModel(o);
							oModel._oControlMetadata = aControlMetadata[i];
							i++;
							return oModel;
						});
						addTests();
						resolve();
					});
				});
			});
		});
	};
	LibraryTest.version = 2.0;
	var mModelChecks = {
		"/": {
			optional: false,
			check(assert, oObject, sControlName) {
				assert.strictEqual(typeof oObject, "object", `${sControlName} is an object`);
			}
		},
		"/designtimeModule": {
			optional: false,
			check(assert, sString, sControlName) {
				assert.strictEqual(typeof sString, "string", `${sControlName} defines /designtimeModule : ${sString}`);
			}
		},
		"/actions": {
			optional: true,
			check(assert, mActions, sControlName) {
				Object.keys(mActions).forEach(function(sAction) {
					if (mActions[sAction].changeType) {
						assert.strictEqual(typeof mActions[sAction].changeType, "string", `${sControlName} defines ${sAction} with changetype:${mActions[sAction].changeType}`);
					} else if (typeof mActions[sAction] === "string") {
						assert.strictEqual(typeof mActions[sAction], "string", `${sControlName} defines ${sAction} as string`);
					} else if (sAction === "settings" && typeof mActions[sAction] === "object") {
						mModelChecks["/actions"].check(assert, mActions[sAction], sControlName);
					} else {
						assert.strictEqual(typeof mActions[sAction], "function", `${sControlName} defines ${sAction} as function`);
					}
				});
			}
		},
		"/name": {
			optional: true,
			check(assert, mEntry, sControlName) {
				// name can be a string like this "{name}"
				if (typeof mEntry === "string" && mEntry.indexOf("{") === 0 && mEntry.indexOf("}") === mEntry.length - 1) {
					return true;
				}
				// checking name.plural and name.singular if any
				var aKeys = ["singular", "plural"];
				aKeys.forEach(function(sKey) {
					if (typeof mEntry[sKey] === "function") {
						// special handling for old function definitions
						assert.strictEqual(typeof mEntry[sKey], "function", `${sControlName} defines mandatory entry /name/${sKey}`);
					} else {
						// normally it is defined as string
						assert.strictEqual(typeof mEntry[sKey], "string", `${sControlName} defines mandatory entry /name/${sKey}`);
					}
				});
				aKeys.forEach(function(sKey) {
					var bDTFound = false;
					// special handling for old function definitions
					if (typeof mEntry[sKey] === "function") {
						assert.strictEqual(typeof mEntry[sKey], "function", `${sControlName} defines function for translation of entry /name/${sKey}`);
						assert.strictEqual(typeof mEntry[sKey](), "string", `Assuming that ${sKey} with ${mEntry[sKey].toString()} returns a translation at runtime`);
						return;
					}
					// proceed normally with a translation key
					if (mEntry[sKey].toUpperCase() !== mEntry[sKey]) {
						assert.ok(true, `Assuming that ${sKey} with ${mEntry[sKey]} needs currently no translation`);
						return;
					}
					// name/singular
					if (mBundles.designtime) {
						bDTFound = hasText(mEntry[sKey], mBundles.designtime);
						assert.strictEqual(bDTFound, true, `${mEntry[sKey]} found in designtime message bundle`);
					}
					if (mBundles.runtime) {
						if (bDTFound) {
							assert.strictEqual(hasText(mEntry[sKey], mBundles.runtime), false, `${mEntry[sKey]} found in runtime message bundle and designtime message bundle, please delete the entry from the runtime message bundle (messagebundle.properties + messagebundle_en.properties)`);
						} else {
							assert.strictEqual(hasText(mEntry[sKey], mBundles.runtime), true, `${mEntry[sKey]} found in runtime message bundle only, consider to move this text to the designtime message bundle`);
						}
					}
				});
				return undefined;
			}
		},
		"/palette": {
			optional: true,
			check(assert, mEntry, sControlName) {
				var aValidGroups = ["ACTION", "DISPLAY", "LAYOUT", "LIST", "INPUT", "CONTAINER", "CHART", "TILE", "DIALOG"];
				assert.strictEqual(typeof mEntry, "object", `${sControlName} defines optional entry /palette/`);
				assert.strictEqual(aValidGroups.indexOf(mEntry.group) > -1, true, `palette entry defines valid group ${mEntry.group}`);
				if (mEntry.icons) { // icons in palette optional
					return Promise.all(Object.keys(mEntry.icons).map(function(sKey) {
						var sIcon = mEntry.icons[sKey];
						assert.strictEqual(typeof sIcon, "string", `palette/icons/${sKey} entry defines icon path ${sIcon}`);

						return new Promise(function(resolve, reject) {
							var xhr = new XMLHttpRequest();
							xhr.open("GET", `${sap.ui.require.toUrl(sIcon)}`, true);
							xhr.onload = function() {
								if (xhr.readyState === 4) {
									if (xhr.status === 200) {
										if (sIcon.indexOf(".svg") === sIcon.length - 4) {
											assert.equal(xhr.responseXML.documentElement && xhr.responseXML.documentElement.tagName, "svg", `File ${sIcon} starts with a svg node`);
										}
										resolve(); // existence is tested by resolving
									} else {
										reject();
									}
								}
							};
							xhr.send();
						});
					}));
				}
				return undefined;
			}
		},
		"/templates": {
			optional: true,
			check(assert, mEntry /* ,sControlName */) {
				if (mEntry.create) { // icons in palette optional
					var sCreateTemplate = mEntry.create;
					assert.strictEqual(typeof sCreateTemplate, "string", `templates/create entry defines fragment path to ${sCreateTemplate}`);
					return new Promise(function(resolve, reject) {
						var xhr = new XMLHttpRequest();
						xhr.open("GET", `${sap.ui.require.toUrl(sCreateTemplate)}`, true);
						xhr.onload = function() {
							if (xhr.readyState === 4) {
								if (xhr.status === 200) {
									assert.ok(xhr.responseXML.documentElement && xhr.responseXML.documentElement.localName === "FragmentDefinition", `File ${sCreateTemplate} exists and starts with a FragmentDefinition node`);
									resolve();
								} else {
									reject();
								}
							}
						};

						xhr.send();
					});
				}
				return undefined;
			}
		}
	};
	function addTests() {
		QUnit.test("Checking library.designtime.js", function(assert) {
			var oLibrary = Lib.all()[sLibrary];
			if (oLibrary.designtime) {
				var done = assert.async();
				sap.ui.require([oLibrary.designtime], function(o) {
					assert.ok(o !== null, `${oLibrary.designtime} loaded successfully`);
					done();
				});
			} else {
				assert.ok(true, `No library.designtime.js ${sLibrary}`);
			}
		});
		QUnit.test("Checking loaded designtime data", function(assert) {
			aDesigntimeElements.forEach(function(oDTData) {
				assert.strictEqual(oDTData !== null, true, "Designtime data found and loaded successful");
				assert.strictEqual(typeof oDTData, "object", "Designtime data returned an object");
			});
		});
		aModels.forEach(function(oModel) {
			var oControlMetadata = oModel._oControlMetadata;
			var sControlName = oControlMetadata.getName();
			QUnit.test(`${sControlName}: Checking entries in designtime data`, function(assert) {
				return Promise.all(Object.keys(mModelChecks).map(function(sPath) {
					var oCheck = mModelChecks[sPath];
					var vValue = oModel.getProperty(sPath);
					if (vValue === undefined && !oCheck.optional) {
						assert.equal(false, true, `${sControlName} does not define mandatory entry ${sPath}`);
						return Promise.resolve();
					} else if (vValue !== undefined && oCheck.optional) {
						assert.equal(true, true, `${sControlName} does define optional entry ${sPath}`);
						return oCheck.check(assert, vValue, sControlName);
					} else if (vValue !== undefined && !oCheck.optional) {
						assert.equal(true, true, `${sControlName} does define mandatory entry ${sPath}`);
						return oCheck.check(assert, vValue, sControlName);
					}
					return undefined;
				}));
			});
		});
	}
	return LibraryTest;
}, true);