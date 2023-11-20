/*global QUnit */
sap.ui.define([
	"sap/base/Log",
	"sap/base/util/each",
	"sap/ui/qunit/utils/ControlIterator",
	"sap/ui/base/DataType",
	"sap/ui/core/Core",
	"sap/m/Text"
], function (Log, each, ControlIterator, DataType, oCore, Text) {
	"use strict";

	// disable require.js to avoid issues with thirdparty
	sap.ui.loader.config({
		map: {
			"*": {
				"sap/ui/thirdparty/require": "test-resources/sap/ui/core/qunit/generic/helper/_emptyModule"
			}
		}
	});

	function noop() {}

	var NO_CREATE = 1;
	var NOT_A_MODULE = 2;
	var NO_DESTROY = {failsOnDestroy: true};

	// Exclude libraries - we need this to exclude libraries that will not be tested at this point in time
	var mLibraryConstraints = {
		/*
		 * openui5
		 */
		"sap.ui.core": {
			elements: {
				/**
				 * @deprecated since 1.56
				 */
				"sap.ui.core.XMLComposite" : NO_CREATE, // needs constructor arguments
				/**
				 * @deprecated since 1.108
				 */
				"sap.ui.core.mvc.HTMLView" : NO_CREATE, // needs constructor arguments
				/**
				 * @deprecated since 1.120
				 */
				"sap.ui.core.mvc.JSONView" : NO_CREATE, // needs constructor arguments
				/**
				 * @deprecated since 1.90
				 */
				"sap.ui.core.mvc.JSView" : NO_CREATE, // needs constructor arguments
				/**
				 * @deprecated since 1.56
				 */
				"sap.ui.core.mvc.TemplateView" : NO_CREATE, // needs constructor arguments
				"sap.ui.core.mvc.View": NO_CREATE, // needs constructor arguments
				"sap.ui.core.mvc.XMLView": NO_CREATE, // needs constructor arguments
				"sap.ui.core.mvc.XMLAfterRenderingNotifier": NOT_A_MODULE, // not a module of its own
				"sap.ui.core._StashedControl": NOT_A_MODULE // not a module of its own
			}
		},
		"sap.m": {
			elements: {
				"sap.m._overflowToolbarHelpers.OverflowToolbarAssociativePopover": NOT_A_MODULE, // not a module of its own
				"sap.m.internal.NumericInput": NOT_A_MODULE, // not a module of its own
				"sap.m.internal.ObjectMarkerCustomLink": NOT_A_MODULE, // not a module of its own
				"sap.m.internal.ObjectMarkerCustomText": NOT_A_MODULE, // not a module of its own
				"sap.m.TablePopin": NOT_A_MODULE,  // not a module of its own,
				"sap.m.PlanningCalendarHeader": {exclude:["actions"]}, // implementation of 'actions' is broken
				"sap.m.SinglePlanningCalendar": NO_DESTROY
			}
		},
		"sap.uxap": {
			elements: {
				"sap.uxap.BlockBase": NO_CREATE // needs constructor arguments (maybe should be abstract?)
			}
		},
		"sap.ui.fl": {
			elements: {
				"sap.ui.fl.util.ManagedObjectModel": { exclude: ["data", "name", "object"] } // setters throw when called after initialization
			}
		},
		"sap.ui.unified": {
			elements: {
				"sap.ui.unified._ColorPickerBox": NOT_A_MODULE
			}
		},

		/*
		 * sapui5.runtime
		 */
		"sap.chart": {
			"sap.chart.Chart": { exclude: ["data"] }  // generically logs deprecation warning, no return
		},
		"sap.me": {
			elements:{
				"sap.me.OverlapCalendar": { exclude: ["startDate"] } // setter for setStartDate fails on default value
			}
		},
		"sap.suite.ui.microchart": {
			elements: {
				"sap.suite.ui.microchart.StackedBarMicroChartBar": { exclude: ["value"] }// setter for value fails on default value
			}
		},
		"sap.ui.comp": {
			elements:{
				"sap.ui.comp.smartmicrochart.SmartMicroChart": { exclude: ["chartType"] }, // getter for getChartType fails for empty constructor
				"sap.ui.comp.smartvariants.SmartVariantManagementAdapter": { exclude: ["selectionPresentationVariants"] } // setter for property selectionPresentationVariants fails for default value "false"
			}
		},
		"sap.ui.export": {
			elements: {}
		},
		"sap.ui.mdc": {
			elements:{
				"sap.ui.mdc.XMLComposite": NO_CREATE, // abstract?
				"sap.ui.mdc.base.filterbar.FilterBar": { exclude: ["setMetadataDelegate"] }, // setMetadataDelegate fails
				"sap.ui.mdc.Table": { exclude: ["content", "rowAction"], failsOnDestroy: true }, // mutators for content are disabled, setRowAction fails
				"sap.ui.mdc.TableOld": NO_CREATE, // fails to instantiate
				"sap.ui.mdc.odata.v4.microchart.MicroChart": NO_CREATE // templating error due to missing dependency to v4 AnnotationHelper
			}
		},
		"sap.viz": {
			elements:{
				"sap.viz.ui5.data.FlattenedDataset": {exclude: ["data"] }, // generically logs deprecation warning, no return
				"sap.viz.ui5.controls.VizFrame": {exclude: ["legendVisible"] } // getLegendVisible fails for empty ctor
			}
		},
		// deprecated or internal libs - fully excluded
		"sap.uiext.inbox": {
		},
		"sap.service.visualization": {
		},
		"sap.makit": {
		},
		"sap.ui.composite": {
		},
		"sap.ui.dev": {
		},
		"sap.ui.dev2": {
		},

		/*
		 * Other repositories
		 */
		"sap.suite.ui.commons": {
			elements: {}
		},
		"sap.apf": {
		},
		"sap.ca.scfld.md": {
		},
		"sap.ca.ui": {
		},
		"sap.collaboration": {
		},
		"sap.gantt": {
		},
		"sap.gantt.config": {
		},
		"sap.landvisz": {
		},
		"sap.ovp": {
		},
		"sap.portal.ui5": {
		},
		"sap.rules.ui": {
		},
		"sap.suite.ui.generic.template": {
		},
		"sap.ui.vbm": {
		},
		"sap.ui.vtm": {
		},
		"sap.ui.vk": {
		},
		"sap.fiori": {
		},
		"sap.ushell": {
		},
		"sap.diagram": {
		},
		"sap.zen.crosstab": {
		},
		"sap.zen.dsh": {
		},
		"sap.zen.commons": {
		},
		"sap.fe": {
		},
		"sap.fileviewer": {
		}
	};

	/**
	 * Asynchronously loads the module for the class with the given name and returns the export of that module
	 * @param {string} sClassName name of the class to load
	 */
	function loadClass(sClassName) {
		var sModuleName = sClassName.replace(/\./g, "/");
		return new Promise(function(resolve, reject) {
			sap.ui.require([sModuleName], function(FNClass) {
				resolve(FNClass);
			}, function(oErr) {
				reject(new Error("failed to load class " + sModuleName + ":" + oErr));
			});
		});
	}

	var mTestedAbstractClasses = Object.create(null);

	function hasUntestedAbstractBaseClass(oClass, assert) {
		var oMetadata = oClass.getMetadata();
		while ( oMetadata ) {
			if ( oMetadata.isAbstract() && !mTestedAbstractClasses[oMetadata.getName()] ) {
				mTestedAbstractClasses[oMetadata.getName()] = oClass.getMetadata().getName();
				assert.ok(true, "forcing all methods to be tested to cover methods of " + oMetadata.getName());
				return true;
			}
			oMetadata = oMetadata.getParent();
		}
		return false;
	}

	function createAggregatedElement(sAggregationType) {
		if ( sAggregationType === "sap.ui.core.Control" ) {
			return new Text();
		} else if ( DataType.isInterfaceType(sAggregationType) ) {
			return null;
		}
		return loadClass(sAggregationType)
			.then(function(fnAggregatedClass) {
				return new fnAggregatedClass();
			}, function() {
				return null;
			});
	}

	/**
	 * Creates assertions for all setters of the given class.
	 *
	 * To avoid redundant checks of inherited base class methods in subclasses, only methods are tested
	 * that either have been attached to the instance itself or directly to the prototype of the instance.
	 * This ensures that when a subclass overrides a method locally, the local method also will be tested.
	 *
	 * Abstract base classes are skipped as they often can't be instantiated. To test their 'own' methods, too,
	 * such abstract classes are remembered and the first non-abstract subclass will test all its methods
	 * including the inherited ones, not only its own methods.
	 *
	 * @param {function} oClass class to be tested
	 * @param {function} assert QUnit assert
	 * @param {object} oClassConstraints
	 */
	function assertAllSettersForClass(oClass, assert, oClassConstraints) {
		var oMetadata = oClass.getMetadata(),
			sClassName = oMetadata.getName(),
			oControl;

		// Abstract classes should not be tested on their own
		if (oMetadata.isAbstract()) {
			assert.ok(true, "Abstract class '" + sClassName + "' skipped");
			return;
		}

		var aExcludedSettings = oClassConstraints && Array.isArray(oClassConstraints.exclude) ? oClassConstraints.exclude : [];

		var bForceTest4AllMethods = hasUntestedAbstractBaseClass(oClass, assert);

		try {
			oControl = new oClass();
		} catch (e) {
			assert.ok(false, "Failed to instantiate a '" + sClassName + "' with default settings: " + (e.message || e));
			return;
		}


		var pChain = Promise.resolve();
		var iOwnSettings = 0;

		function hasOwnMethod(obj, name) {
			return Object.hasOwn(obj, name)
				|| Object.hasOwn(oClass.prototype, name)
				|| bForceTest4AllMethods;
		}

		function checkOwnMethod(sMethodName, args, sArgs) {
			if ( hasOwnMethod(oControl, sMethodName) ) {
				iOwnSettings++;
				try {
					assert.ok(
						oControl[sMethodName].apply(oControl, args) === oControl,
						sMethodName + "(" + sArgs + ")" + " should always return <this>");
				} catch (e) {
					// we can't distinguish between expected and unexpected errors here, so we log only
					assert.ok(true,
						sMethodName + "(" + sArgs + ")" + " shouldn't throw an exception");
				}
			}
		}

		each(oMetadata.getAllProperties(), function(sPropertyName, oProperty) {

			if ( aExcludedSettings.indexOf(sPropertyName) >= 0 ) {
				assert.ok(true, "ignore property '" + sPropertyName + "'");
				return;
			}

			if ( hasOwnMethod(oControl, oProperty._sMutator) ) {

				iOwnSettings++;

				// Get the value of the property
				var oValue = oProperty.get(oControl);

				// Assert
				try {
					assert.ok(
						oControl === oProperty.set(oControl, oValue),
						oProperty._sMutator + "(...) should always return <this>");
				} catch (e) {
					// If the setter fails we have a special scenario where date may be required
					// but as there is no type "date" in our metadata API we need to identify it here
					// and provide a JavaScript Date so we can test the setter
					var sName = oProperty.name;
					var bDateInName = sName.indexOf("Date", sName.length - 4) !== -1 || sName.substring(0, 4) === "date";
					if ((sName === "date" || bDateInName) && oProperty.type === "object") {
						assert.ok(
							oControl === oProperty.set(oControl, new Date()),
							oProperty._sMutator + "({js date}) should always return <this>");
					} else {
						// If the setter fails for some reason called with the value from get collected before that
						// we need to fail with a meaningful error.
						assert.ok(false,
							oProperty._sMutator + "(" + oValue + ") fails when called " +
							"with value received from get with exception: " + e);
					}
				}
			}
		});

		each(oMetadata.getAllAggregations(), function(sAggregationName, oAggregation) {

			if ( aExcludedSettings.indexOf(sAggregationName) >= 0 ) {
				assert.ok(true, "ignore aggregation '" + sAggregationName + "'");
				return;
			}

			pChain = pChain.then(function() {
				return createAggregatedElement(oAggregation.type);
			}).then(function(oElement) {
				checkOwnMethod(oAggregation._sMutator, [null], "null");
				if ( oElement ) {
					checkOwnMethod(oAggregation._sMutator, [oElement], "elem");
				}
				if ( oAggregation.multiple ) {
					checkOwnMethod(oAggregation._sInsertMutator, [null], "null");
					if ( oElement ) {
						checkOwnMethod(oAggregation._sInsertMutator, [oElement], "elem");
					}
				}
				checkOwnMethod(oAggregation._sDestructor, [], "");
				if ( oElement && !oElement.bIsDestroyed ) {
					try {
						oElement.destroy();
					} catch (e) {
						// ignore
					}
				}
			});

		});

		each(oMetadata.getAllAssociations(), function(sAssociationName, oAssociation) {
			if ( aExcludedSettings.indexOf(sAssociationName) >= 0 ) {
				assert.ok(true, "ignore aggregation '" + sAssociationName + "'");
				return;
			}
			checkOwnMethod(oAssociation._sMutator, [null], "null");
			checkOwnMethod(oAssociation._sMutator, ["dummy"], "ref");
		});

		each(oMetadata.getAllEvents(), function(sEventName, oEvent) {
			if ( aExcludedSettings.indexOf(sEventName) >= 0 ) {
				assert.ok(true, "ignore aggregation '" + sEventName + "'");
				return;
			}
			checkOwnMethod(oEvent._sMutator, [noop], "listener");
			checkOwnMethod(oEvent._sDetachMutator, [noop], "listener");
		});

		pChain = pChain.then(function() {
			try {
				oControl.destroy();
			} catch (e) {
				// ignore errors during destroy if control is known to have issues there
				assert.ok(oClassConstraints && oClassConstraints.failsOnDestroy,
					"failed to destroy '" + oControl + "'" + (oClassConstraints && oClassConstraints.failsOnDestroy ? " (ignored)" : ""));
			}
			if (iOwnSettings === 0 ) {
				assert.ok(true, "no own settings");
			}
		});

		return pChain;
	}

	/*
	 * A Library is eligible for this test when it either is not mentioned in the constraints
	 * or when it is mentioned with a set of constraints for selected controls/elements.
	 */
	function isValidLibrary(sLibName) {
		return (
			!mLibraryConstraints.hasOwnProperty(sLibName)
			|| mLibraryConstraints[sLibName].elements );
	}

	return ControlIterator.loadLibraries(isValidLibrary).then(function(oLibraries) {

		// Create tests for all loaded libraries
		Object.keys(oLibraries).forEach(function(sLibName) {

			var oLibrary = oLibraries[sLibName],
				oLibConstraints = mLibraryConstraints.hasOwnProperty(sLibName) ? mLibraryConstraints[sLibName] : null,
				oAllElementConstraints = oLibConstraints && oLibConstraints.elements;

			if ( oLibConstraints == null || oAllElementConstraints ) {

				// Mind here we need a concatenated copy of the original array`s!!!
				var aClasses = oLibrary.controls.concat(oLibrary.elements);

				QUnit.module("Library " + sLibName);
				if ( aClasses.length === 0 ) {
					QUnit.test("empty lib", function(assert) {
						assert.expect(0);
						return;
					});
				}

				aClasses.forEach(function(sClassName) {
					var sCaption = sClassName.startsWith(sLibName) ? sClassName.slice(sLibName.length) : sClassName;
					var oClassConstraints = oAllElementConstraints && oAllElementConstraints[sClassName];

					if ( oClassConstraints === NOT_A_MODULE || oClassConstraints === NO_CREATE ) {
						QUnit.skip(sCaption, function(assert) {});
						//assert.ok(true, "Ignore class '" + sClassName + "' as it is not a module of its own");
						return;
					}

					QUnit.test(sCaption, function(assert) {

						return loadClass(sClassName)
							.then(function(FNClass) {
								return assertAllSettersForClass(FNClass, assert, oClassConstraints);
							})
							.catch(function(err) {
								assert.ok(false, "failed to check class '" + sClassName + "':" + (err.message || err));
							});
					});
				});

			}

		});

	});

});
