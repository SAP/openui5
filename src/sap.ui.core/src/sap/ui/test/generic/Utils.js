/*!
 * ${copyright}
 */

/* globals QUnit */
sap.ui.define([
	"sap/base/util/ObjectPath",
	"sap/ui/base/DataType",
	"sap/ui/core/Lib",
	"sap/ui/test/generic/GenericTestCollection",
	"require"
 ], function(ObjectPath, DataType, Lib, GenericTestCollection, require) {
	"use strict";

	/**
	 * @typedef {object} sap.ui.test.generic.ClassInfo
	 * @property {string} className The class name
	 * @property {sap.ui.core.Control|sap.ui.core.Element} [fnClass=undefined] The loaded class
	 * @property {Error} [error=undefined] The error that might occur
	 *
	 * @private
	 **/

	/**
	 * @namespace sap.ui.test.generic.Utils
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */
	var Utils = {
		/**
		 * @param  {string} sClassName The class name which should be loaded
		 * @param  {string} sContainingModuleName Name of the module that contains the class. If not given, it is assumed that a module with the same name as the class (dots replaced by slashes) exports the class.
		 * When given, the module is loaded and the class is retrieved via its global name
		 * @return {Promise<sap.ui.test.generic.ClassInfo>} Returns a promise resolving with a <code>sap.ui.test.generic.ClassInfo</code> object.
		 */
		loadClass: function(sClassName, sContainingModuleName) {
			return new Promise(function(resolve) {
				var sModuleName = sContainingModuleName ? sContainingModuleName : sClassName.replace(/\./g, "/");
				require([sModuleName], function(Class) {
					if (sContainingModuleName) {
						Class = ObjectPath.get(sClassName);
					}
					resolve({
						className: sClassName,
						fnClass: Class,
						error: undefined
					});

				}, function(err) {
					var Class = ObjectPath.get(sClassName);
					resolve({
						className: sClassName,
						fnClass: Class,
						error: err
					});
				});
			});
		},

		/**
		 * Loads all control classes for the given library.
		 *
		 * @param  {object} [mTestParams] Test specific parameters
		 * @param  {string} [mTestParams.library] The library name
		 * @param  {sap.ui.test.generic.GenericTestCollection.ObjectCapabilities} [mTestParams.objectCapabilities] The capabilities of the controls
		 * @param  {object} [mOptions] Object that holds further configs.
		 * @param  {boolean} [mOptions.includeElements=false] Whether the library's elements should be considered as well.
		 * @return {Promise<sap.ui.test.generic.ClassInfo[]>} Returns a promise resolving with an array of <code>sap.ui.test.generic.ClassInfo</code> objects.
		 */
		loadAllControls: function(mTestParams, mOptions) {
			var sLibName = mTestParams.library;
			var mCapabilities = mTestParams.objectCapabilities || {};
			var aLoadedElementsAndControls = [];

			mOptions = mOptions || {};

			var aLoadClassPromises = [];

			var loadControls = function () {
				return Lib.load(sLibName).then(function (library) {
					var aClasses = library ? library.controls : [];

					if (mOptions.includeElements) {
						aClasses = aClasses.concat(library.elements);
					}

					aClasses = aClasses.filter(function (sControlName) {
						// Check if there are new controls or elements available in library after the previous loading
						return !aLoadedElementsAndControls.includes(sControlName);
					});

					if (aClasses.length > 0) {
						aClasses.forEach(function(sClass) {
							var sModuleName = mCapabilities[sClass] && mCapabilities[sClass].moduleName;

							aLoadClassPromises.push(Utils.loadClass(sClass, sModuleName));
							aLoadedElementsAndControls.push(sClass);
						});
						return Promise.all(aLoadClassPromises).then(loadControls);
					}
					return Promise.all(aLoadClassPromises);
				});
			};

			return loadControls().then(function (aClassInfo) {
				var i;
				var aClassInfoError = aClassInfo.filter(function (oClassInfo) {
					return oClassInfo.error !== undefined;
				});

				aClassInfo = aClassInfo.filter(function (oClassInfo) {
					return !!oClassInfo.fnClass;
				});

				if (aClassInfoError.length) {
					QUnit.test("Controls only available in global namespace", function (assert) {
						for (i = 0; i < aClassInfoError.length; i++) {
							assert.ok(false, aClassInfoError[i].className + " seems to be only available using global namespace." +
								" If the class exists, but is not a module of its own, then specify the module that contains the class within the testsuite config.");
						}
					});
				}
				return aClassInfo;
			});
		},

		/**
		 * Create a control or element based on the given object capabilities
		 *
		 * @param {sap.ui.core.Control|sap.ui.core.Element} Class The control or element class to instantiate
		 * @param {sap.ui.test.generic.GenericTestCollection.ObjectCapabilities} oObjectCapabilities The capabilities of the correspodning control
		 * @param {map} mSettings Settings which should be used to create the control or element
		 * @return {sap.ui.core.Control|sap.ui.core.Element} Instance of the control or element
		 */
		createControlOrElement: function (Class, oObjectCapabilities, mSettings) {
			if (oObjectCapabilities && oObjectCapabilities.create) {
				return oObjectCapabilities.create(Class, mSettings);
			} else {
				return new Class(mSettings);
			}

		},

		/**
		 * Tries to fill all control properties with string values
		 *
		 * @param {sap.ui.core.Control} oControl The control whose properties get filled
		 * @param {sap.ui.test.generic.GenericTestCollection.ObjectCapabilities} oObjectCapabilities The capabilities of the corresponding control
		 */
		 fillControlProperties: function(oControl, oObjectCapabilities) {
			var mProperties = oControl.getMetadata().getAllProperties(),
				mPropertyCapabilities = oObjectCapabilities && oObjectCapabilities.properties || {},
				vValueToSet = "test"; // just try a string as default, with some frequently happening exceptions

			for (var sPropertyName in mProperties) {
				var oProperty = mProperties[sPropertyName],
					sPropertyCapability;

				// Check if property should be skipped because of known issues or if a specific value should be used for setting the property
				if (mPropertyCapabilities[sPropertyName]) {
					if (GenericTestCollection.ExcludeReason.hasOwnProperty(mPropertyCapabilities[sPropertyName])) {
						sPropertyCapability = mPropertyCapabilities[sPropertyName];
					} else {
						vValueToSet = mPropertyCapabilities[sPropertyName];
					}
				}

				if (sPropertyCapability !== GenericTestCollection.ExcludeReason.NotChangeableAfterInit &&
					sPropertyCapability !== GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings &&
					sPropertyCapability !== GenericTestCollection.ExcludeReason.OnlyChangeableViaBinding) {
					try {
						const oType = DataType.getType(oProperty.type);
						vValueToSet = oType?.getDefaultValue();
						if (oProperty.type === "int") {
							vValueToSet = 100;
						}
						oControl[oProperty._sMutator](vValueToSet);
					} catch (e) {
						// type check error, ignore
						// QUnit.assert.ok(true, "INFO: Failed to fill property: '" + sPropertyName + "' to control '" + oControl.getMetadata().getName() + "'");
					}
				}
			}
			try {
				oControl.setTooltip("test"); // seems not to be a property...
			} catch (error) {
				// This case currently only happens in sap.ui.webc libraries
				// They can't handle a string as tooltip properly therefore
				// setting tooltip on these controls fails
				// Adding this try catch here instead of exception in order
				// to avoid an entry for each of the controls in the
				// corresponding config files
				// The libraries where not tested before the introduction
				// of the new generic tests for libraries. Therefore the
				// issue was not 'visible' before
				QUnit.assert.ok(true, "WARNING: setTooltip is not able to handle strings");
			}
		},

		fillControlAggregations: function(oControl, mObjectCapabilities) {
			var oMetadata = oControl.getMetadata(),
				oObjectCapabilities = mObjectCapabilities[oMetadata.getName()],
				mAggregations = oMetadata.getAggregations();
			return Promise.all(
				Object.values(mAggregations).map(function(oAggregation) {
					var sAggregationType = oAggregation.type;

					// Specific handling for frequently used abstract and interface classes
					switch (oAggregation.type) {
						case "sap.ui.core.Control":
							// Use sap.m.Text in case aggregation is of type sap.ui.core.Control
							sAggregationType = "sap.m.Text";
							break;
						case "sap.ui.core.Element":
							// Use sap.ui.core.Icon in case aggregation is of type sap.ui.core.Element
							sAggregationType = "sap.ui.core.Icon";
							break;
						case "sap.ui.core.Toolbar":
							// Toolbar is interface - Special treatment because of legacy coding in old
							// DuplicateIdCheck qunit
							sAggregationType = "sap.m.Toolbar";
							break;
						default:
							sAggregationType = oAggregation.type;
							break;
					}

					// Check if aggregation should be skipped because of known issues or if a specific control should be used for the aggregation
					if (oObjectCapabilities && oObjectCapabilities.aggregations && oObjectCapabilities.aggregations[oAggregation.name]) {
						if (GenericTestCollection.ExcludeReason.hasOwnProperty(oObjectCapabilities.aggregations[oAggregation.name])) {
							var sAggregationCapability = oObjectCapabilities.aggregations[oAggregation.name];

							if (sAggregationCapability === GenericTestCollection.ExcludeReason.NotChangeableAfterInit ||
								sAggregationCapability === GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings) {
								return Promise.resolve(undefined); // Skip this aggregation because it can't be added generically
							}
						} else {
							sAggregationType = oObjectCapabilities.aggregations[oAggregation.name];
						}
					}
					var sModuleName = mObjectCapabilities[sAggregationType] && mObjectCapabilities[sAggregationType].moduleName ? mObjectCapabilities[sAggregationType].moduleName : undefined;

					if (DataType.isInterfaceType(sAggregationType)) {
						return Promise.resolve(undefined); // Can't handle interface types generically
					}
					return Utils.loadClass(sAggregationType, sModuleName).then(function(oClassInfo) {
						var oElement;

						if (!oClassInfo.fnClass) {
							QUnit.assert.ok(false, "No class of type " + sAggregationType + " for aggregation '" + oAggregation.name + "' of " + oControl + " could be loaded. Does this class exist? Is it properly implemented?");
							return;
						}

						if (oClassInfo.fnClass.getMetadata().isAbstract() ) {
							// we also shouldn't instantiate abstract classes
							return;

						} else {
							// A specific Control or Element type. Try to add a working instance.
							oElement = new oClassInfo.fnClass();
						}

						// In case we were able to instantiate a suitable Element, add it into the aggregation.
						if (oElement) {
							oControl[oAggregation._sMutator](oElement);
						}

						return oElement;
					}).catch(function () {
						// error while creating or adding a child element: not a problem, just reducing test coverage a bit
						// QUnit.assert.ok(true, "INFO: Failed to add aggregation '" + oAggregation.name + "' of type '" + oAggregation.type + "' to control '" + oControl.getMetadata().getName() + "'");
					});
				})
			);
		}
	};

	return Utils;
});