/*!
 * ${copyright}
 */

sap.ui.define([ 'jquery.sap.global', 'sap/ui/core/Core', 'sap/ui/base/Object', 'sap/ui/core/Control' ],
		function(jQuery, Core, BaseObject, Control) {
	"use strict";

	/**
	 * @namespace
	 * <code>sap.ui.qunit.utils.ControlIterator</code> is a utility for collecting all available controls across libraries in order to e.g. run tests on each of them.
	 *
	 * It is used by calling the static <code>run</code> function with a callback function as parameter. This function will be called for each control
	 * (and provide control name and class and more information about the control as arguments), so a test could be executed for this control.
	 *
	 * The second parameter of the <code>run</code> function can be used to configure several options, e.g. to define a hard-coded list of control libraries
	 * to test (otherwise all available libraries are discovered), to exclude certain controls or libraries, to state whether sap.ui.core.Elements should
	 * also be tested, etc.
	 * Check the documentation of the <code>run</code> function parameters to understand which Controls/Elements are used by default and which ones are excluded.
	 *
	 * The <code>run</code> function does NOT execute synchronously! In case a QUnit test function is written that embeds a call to <code>run</code>
	 * (as opposed to creating a test function inside each callback), this test function needs to be asynchronous and needs to use the <code>done</code>
	 * callback option (called when all control tests have been executed) to call <code>done()</code> (the function returned by <code>assert.async()</code>).
	 *
	 * Usage example:
	 * <code>
	 * QUnit.config.autostart = false;
	 *
	 * sap.ui.require(["sap/ui/qunit/utils/ControlIterator"], function(ControlIterator) {
	 *
	 *    ControlIterator.run(function(sControlName, oControlClass, oInfo) { // loop over all controls
	 *
	 *       QUnit.test("Testing control " + sControlName, function(assert) { // create one test per control
	 *          assert.ok(true, sControlName + " would be tested now");
	 *          // e.g. create a control instance:  oControl = new oControlClass()
	 *       });
	 *
	 *    },{
	 *       librariesToTest: ["sap.ui.someLibrary"], // optionally limit the test scope or do other settings
	 *       done: function(oResult) {
	 *          // do something when the above function has been executed for all controls (here: all control tests have been created)
	 *
	 *          QUnit.start(); // tell QUnit that all tests have now been created (due to autostart=false)
	 *       }
	 *    });
	 *
	 * });
	 * </code>
	 *
	 * This module is independent from QUnit, so it could be used for other purposes than unit tests.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.48.0
	 * @alias sap.ui.qunit.utils.ControlIterator
	 */
	var ControlIterator = {};

	ControlIterator._aControlsThatCannotBeRenderedGenerically = [  // exposed, so it can be tested
		"sap.ui.comp.smartform.Group",
		"sap.ui.comp.smartform.GroupElement",
		"sap.ui.core.UIComponent",
		"sap.ui.core.mvc.HTMLView",
		"sap.ui.core.mvc.JSONView",
		"sap.ui.core.mvc.JSView",
		"sap.ui.core.mvc.XMLView",
		"sap.ui.core.mvc.TemplateView",
		"sap.ui.core.mvc.View",
		"sap.ui.core.tmpl.Template",
		"sap.ui.commons.Menu",
		"sap.m.FacetFilterItem",
		"sap.m.LightBox",
		"sap.m.Menu",
		"sap.m.NotificationListItem",
		"sap.m.NotificationListBase",
		"sap.m.internal.NumericInput",
		"sap.m.QuickViewBase",
		"sap.m.QuickViewGroup",
		"sap.m.QuickViewGroupElement",
		"sap.m.TabStripItem",
		"sap.m.TimePickerSlider",
		"sap.m.TimePickerSliders",
		"sap.m.UploadCollectionToolbarPlaceholder",
		"sap.m.Wizard",
		"sap.tnt.NavigationList",
		"sap.ui.demokit.IndexLayout._Tile",
		"sap.ui.layout.BlockLayoutRow",
		"sap.ui.richtexteditor.RichTextEditor",
		"sap.ui.richtexteditor.ToolbarWrapper",
		"sap.ui.suite.TaskCircle",
		"sap.ui.table.AnalyticalColumnMenu",
		"sap.ui.table.ColumnMenu",
		"sap.ui.unified.Menu",
		"sap.ui.ux3.ActionBar",
		"sap.ui.ux3.ExactList.LB",
		"sap.ui.ux3.NotificationBar",
		"sap.ui.rta.ContextMenu",
		"sap.ui.rta.AddElementsDialog",
		"sap.ui.comp.valuehelpdialog.ValueHelpDialog",
		"sap.chart.Chart",
		"sap.makit.Chart",
		"sap.me.TabContainer",
		"sap.suite.ui.microchart.InteractiveBarChart",
		"sap.suite.ui.microchart.InteractiveDonutChart",
		"sap.uxap.AnchorBar",
		"sap.uxap.BlockBase",
		"sap.uxap.BreadCrumbs",
		"sap.uxap.ObjectPageHeader",
		"sap.uxap.ObjectPageSubSection",
		"sap.uiext.inbox.SubstitutionRulesManager",
		"sap.uiext.inbox.composite.InboxTaskTitleControl",
		"sap.uiext.inbox.InboxFormattedTextView",
		"sap.uiext.inbox.InboxToggleTextView",
		"sap.uiext.inbox.InboxTaskDetails",
		"sap.viz.ui5.controls.common.BaseControl",
		"sap.viz.ui5.controls.VizRangeSlider",
		"sap.viz.ui5.core.BaseChart",
		"sap.viz.ui5.controls.VizTooltip"
	];

	ControlIterator.controlCanBeRendered = function(sControlName) {
		if (!ControlIterator.controlCanBeInstantiated(sControlName)) {
			return false;
		}

		// controls which are known not to work standalone - some of them cannot work, some might need to be improved
		if (ControlIterator._aControlsThatCannotBeRenderedGenerically.indexOf(sControlName) > -1)  { // known to be untestable
			return false;
		}

		return true;
	};


	ControlIterator.controlCanBeInstantiated = function(sControlName) {
		// controls which are known not to work standalone

		if ([
			"sap.ui.codeeditor.CodeEditor",
			"sap.ui.demokit.IndexLayout._Tile",
			"sap.ui.commons.SearchField", // can be instantiated, but fails before rendering
			"sap.ui.commons.SearchField.CB", // a MESS!
			"sap.ui.commons.SearchFieldCB",
			"sap.ui.commons.Tab",
			"sap.ui.comp.transport.TransportDialog",
			"sap.ui.core.ComponentContainer",
			"sap.ui.core.mvc.View",
			"sap.ui.core.mvc.XMLView",
			"sap.ui.core.XMLComposite",
			"sap.ui.core.mvc.JSView",
			"sap.ui.core.mvc.JSONView",
			"sap.ui.core.mvc.HTMLView",
			"sap.ui.core.mvc.TemplateView",
			"sap.ui.mdc.FilterBar", //The control only runs in views with XML pre-processor. The test can't provide this environment
			"sap.ui.mdc.Table", //The control only runs in views with XML pre-processor. The test can't provide this environment
			"sap.ui.mdc.Field", //The control only runs in views with XML pre-processor. The test can't provide this environment
			"sap.makit.Chart",
			"sap.ui.rta.AddElementsDialog",
			"sap.ui.rta.ContextMenu"
		].indexOf(sControlName) > -1)  { // known to be not instantiable
			return false;
		}

		var oControlClass = jQuery.sap.getObject(sControlName);
		if (!oControlClass) {
			return false;
		}
		var oMetadata = oControlClass.getMetadata();

		if (oMetadata.isAbstract()) {
			return false;
		}

		return true;
	};


	var aKnownRuntimeLayerLibraries = ["sap.ui.core","sap.chart","sap.f","sap.m","sap.makit","sap.me","sap.ndc",
		   "sap.suite.ui.microchart","sap.tnt","sap.ui.codeeditor","sap.ui.commons","sap.ui.comp","sap.ui.dt",
		   "sap.ui.fl","sap.ui.generic.app","sap.ui.generic.template","sap.ui.layout","sap.ui.mdc",
		   "sap.ui.richtexteditor","sap.ui.rta","sap.ui.suite","sap.ui.table",
		   "sap.ui.unified","sap.ui.ux3","sap.uxap","sap.viz"];

	var isKnownRuntimeLayerLibrary = function(sLibName) {
		if (aKnownRuntimeLayerLibraries.indexOf(sLibName) > -1) {
			return true;
		} else {
			return false;
		}
	};


	/**
	 * Returns a map with all libraries found, depending on the given arguments
	 *
	 * @param {Array} aExcludedLibraries the list of libraries to exclude
	 * @param {boolean} bIncludeDistLayer whether the list of libraries should be restricted to known runtime-layer libraries (superset of the OpenUI5 libraries) or include any dist-layer libraries
	 * @returns a map of library infos
	 */
	function getAllLibraries(aExcludedLibraries, bIncludeDistLayer) {
		var mLibraries = sap.ui.getCore().getLoadedLibraries(),
			sInfoLibName,
			bNewLibrary,
			oInfo,
			i;

		// discover what is available in order to also test other libraries than those loaded in bootstrap
		oInfo = sap.ui.getVersionInfo();
		for (i = 0; i < oInfo.libraries.length; i++) {
			sInfoLibName = oInfo.libraries[i].name;
			if (jQuery.inArray(sInfoLibName, aExcludedLibraries) === -1 && !mLibraries[sInfoLibName]) {
				jQuery.sap.log.info("Libary '" + sInfoLibName + "' is not loaded!");
				try {
					sap.ui.getCore().loadLibrary(sInfoLibName);
					bNewLibrary = true;
				} catch (e) {
					// not a control lib? This happens for e.g. "themelib_sap_bluecrystal"...
				}
			}
		}

		// Renew the libraries object if new libraries are added
		if (bNewLibrary) {
			mLibraries = sap.ui.getCore().getLoadedLibraries();
		}

		// excluded libraries should even be excluded when already loaded initially
		aExcludedLibraries.forEach(function(sLibraryName) {
			mLibraries[sLibraryName] = undefined;
		});

		// ignore dist-layer libraries if requested
		if (!bIncludeDistLayer) {
			for (var sLibName in mLibraries) {
				if (!isKnownRuntimeLayerLibrary(sLibName)) {
					mLibraries[sLibName] = undefined;
				}
			}
		}

		return mLibraries;
	}


	/**
	 * Returns a map with library infos for the requested libraries
	 *
	 * @param {Array} aLibrariesToTest list of libraries to load
	 * @returns a map of library infos
	 */
	function getRequestedLibraries(aLibrariesToTest) {
		var mLibraries = sap.ui.getCore().getLoadedLibraries(),
			bNewLibrary,
			i;

		// make sure the explicitly requested libraries are there
		for (i = 0; i < aLibrariesToTest.length; i++) {
			if (!mLibraries[aLibrariesToTest[i]]) {
				sap.ui.getCore().loadLibrary(aLibrariesToTest[i]); // no try-catch, as this library was explicitly requested
				bNewLibrary = true;
			}
		}

		if (bNewLibrary) {
			mLibraries = sap.ui.getCore().getLoadedLibraries();
		}

		for (var sLibraryName in mLibraries) {
			if (aLibrariesToTest.indexOf(sLibraryName) === -1) {
				mLibraries[sLibraryName] = undefined;
			}
		}

		return mLibraries;
	}


	/**
	 * Returns a map of libraries - either exactly those requested in aLibrariesToTest, if defined, or all discoverable libraries
	 * under the given conditions.
	 */
	var getLibraries = function(aLibrariesToTest, aExcludedLibraries, bIncludeDistLayer, QUnit) {
		var mLibraries = aLibrariesToTest ?
				getRequestedLibraries(aLibrariesToTest)
				:
				getAllLibraries(aExcludedLibraries, bIncludeDistLayer);

		QUnit.test("Should load at least one library and some controls", function(assert) {
			assert.expect(2);

			var bLibFound = false;

			for (var sLibName in mLibraries) {
				if (mLibraries[sLibName]) {
					if (!bLibFound) {
						assert.ok(mLibraries[sLibName], "Should have loaded at least one library");
						bLibFound = true;
					}
					var iControls = mLibraries[sLibName].controls ? mLibraries[sLibName].controls.length : 0;
					if (iControls > 0) {
						assert.ok(iControls > 0, "Should find at least 10 controls in a library");
						break;
					}
				}
			}
		});

		return mLibraries;
	};

	/**
	 * Returns true if the control is not among the explicitly excluded controls and is not excluded due to its rendering/instantiation capabilities.
	 */
	var shouldTestControl = function(sControlName, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable) {
		if (!sControlName) {
			return false;
		}

		if (aExcludedControls.indexOf(sControlName) > -1) {
			return false;
		}

		if (!bIncludeNonRenderable && !ControlIterator.controlCanBeRendered(sControlName)) {
			return false;
		}

		if (!bIncludeNonInstantiable && !ControlIterator.controlCanBeInstantiated(sControlName)) {
			return false;
		}

		return true;
	};

	/**
	 * Calls the callback function for all controls in the given array, unless they are explicitly excluded
	 */
	var loopControlsInLibrary = function(aControls, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable, fnCallback) {
		return new Promise(function(resolve, reject){
			var iControlCountInLib = 0;

			var loop = function(i) {
				if (i < aControls.length) {

					var sControlName = aControls[i];
					handleControl(sControlName, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable, fnCallback).then(function(bCountThisControl){
						if (bCountThisControl) {
							iControlCountInLib++;
						}
						loop(i + 1);
					});
				} else {
					resolve(iControlCountInLib);
				}
			};

			loop(0);
		});
	};

	function handleControl(sControlName, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable, fnCallback) {
		return new Promise(function(resolve){
			var bCountThisControl = false;

			if (shouldTestControl(sControlName, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable)) {
				bCountThisControl = true;
				var oControlClass = jQuery.sap.getObject(sControlName);

				fnCallback(sControlName, oControlClass, {
					canInstantiate: ControlIterator.controlCanBeInstantiated(sControlName),
					canRender: ControlIterator.controlCanBeRendered(sControlName)
				});
			}

			window.setTimeout(function(){resolve(bCountThisControl);}, 0); // give the UI the chance to be responsive to user interaction and to update information about the currently handled control
		});
	}


	/**
	 * Triggers the ControlIterator to collect all Controls (considering the given options) and then call the <code>fnCallback</code> function for each one.
	 * This function executes asynchronously.
	 *
	 * @param {function} fnCallback function(sControlName, oControlClass, oInfo) called for every single control.
	 * Arguments passed into the callback function are: the control name, the control class and an object with further information about the control.
	 * This object has the following boolean flags: canRender, canInstantiate, which describe if the control can be instantiated/rendered (some cannot).
	 *
	 * @param {object} [mOptions] optional settings for the test run
	 * @param {object.string[]} [mOptions.librariesToTest] which control libraries to test, e.g. <code>["sap.ui.core"]</code>. When set, exactly these libraries will be tested and the options excludedLibraries and includeDistLayer will be ignored. Otherwise, the module will try to discover all available libraries.
	 * @param {object.string[]} [mOptions.excludedLibraries=undefined] which control libraries to exclude from testing, e.g. <code>["sap.ui.core"]</code>. Only used when librariesToTest is not set.
	 * @param {object.string[]} [mOptions.excludedControls=undefined] which controls to exclude from testing, e.g. <code>["sap.m.Button"]</code>.
	 * @param {object.boolean} [mOptions.includeDistLayer=false] whether to include dist-layer libraries in the test. Only used when librariesToTest is not set.
	 * @param {object.boolean} [mOptions.includeElements=false] whether to include all entities inheriting from sap.ui.core.Element in the test. Otherwise only those inheriting from sap.ui.core.Controls are tested.
	 * @param {object.boolean} [mOptions.includeNonRenderable=true] whether to include entities that cannot be generically rendered (some controls fail when they are not configured in a specific way).
	 * @param {object.boolean} [mOptions.includeNonInstantiable=false] whether to include entities that cannot be generically instantiated.
	 * @param {object.object} [mOptions.qunit=undefined] optionally, the QUnit object can be given here, so this module can do some internal sanity checks.
	 * @param {object.function} [mOptions.done] the callback function to call once all tests have been executed. This function receives an object as sole argument with the following properties: testedControlCount, testedLibraryCount
	 *
	 * @since 1.48.0
	 * @public
	 */
	ControlIterator.run = function(fnCallback, mOptions) {
		window.setTimeout(function() { // fake async because sync loading libraries might not be possible in the future
			_run(fnCallback, mOptions);
		}, 1);
	};


	/**
	 * Called by run() with a 1:1 parameter forwarding
	 */
	function _run(fnCallback, mOptions) {
		if (!mOptions) {
			mOptions = {};
		}

		var fnDone = mOptions.done || function(){};
		var aLibrariesToTest = mOptions.librariesToTest || undefined;
		var aExcludedLibraries = mOptions.excludedLibraries || [];
		var aExcludedControls = mOptions.excludedControls || [];
		var bIncludeDistLayer = (mOptions.includeDistLayer !== undefined) ? mOptions.includeDistLayer : false;
		var bIncludeElements = (mOptions.includeElements !== undefined) ? mOptions.includeElements : false;
		var bIncludeNonRenderable = (mOptions.includeNonRenderable !== undefined) ? mOptions.includeNonRenderable : true;
		var bIncludeNonInstantiable = (mOptions.includeNonInstantiable !== undefined) ? mOptions.includeNonInstantiable : false;

		var QUnit = mOptions.qunit;
		if (QUnit) { // verify it's good
			QUnit.test("Checking the given QUnit object", function(assert) {
				assert.ok(true, "The given QUnit should be able to assert");
			});
		} else { // otherwise create a mock QUnit that can be used for assert.ok() only
			var nop = function(){};
			var assert = {
				ok: function(bCondition, sText) {
					if (!bCondition) {
						throw new Error(sText);
					}
				},
				expect: nop
			};
			QUnit = {
				module: nop,
				test: function (text, fnCallback) {
					fnCallback(assert);
				}
			};
		}

		// check given parameters
		QUnit.test("Checking the given options", function(assert) {
			assert.ok(mOptions.librariesToTest === undefined || jQuery.isArray(mOptions.librariesToTest), "The given librariesToTest must be undefined or an array, but is: " + mOptions.librariesToTest);
			assert.ok(mOptions.excludedLibraries === undefined || jQuery.isArray(mOptions.excludedLibraries), "The given excludedLibraries must be undefined or an array, but is: " + mOptions.excludedLibraries);
			assert.ok(mOptions.excludedControls === undefined || jQuery.isArray(mOptions.excludedControls), "The given excludedControls must be undefined or an array, but is: " + mOptions.excludedControls);
			assert.ok(mOptions.includeDistLayer === undefined || typeof mOptions.includeDistLayer === "boolean", "The given includeDistLayer must be undefined or a boolean, but is: " + mOptions.includeDistLayer);
			assert.ok(mOptions.includeElements === undefined || typeof mOptions.includeElements === "boolean", "The given includeElements must be undefined or a boolean, but is: " + mOptions.includeElements);
			assert.ok(mOptions.includeNonRenderable === undefined || typeof mOptions.includeNonRenderable === "boolean", "The given includeNonRenderable must be undefined or a boolean, but is: " + mOptions.includeNonRenderable);
			assert.ok(mOptions.includeNonInstantiable === undefined || typeof mOptions.includeNonInstantiable === "boolean", "The given includeNonInstantiable must be undefined or a boolean, but is: " + mOptions.includeNonInstantiable);
			assert.ok(fnDone === undefined || typeof fnDone === "function", "The given done callback must be undefined or a function, but is: " + fnDone);
		});


		// get the libraries we are interested in
		var mLibraries = getLibraries(aLibrariesToTest, aExcludedLibraries, bIncludeDistLayer, QUnit);

		loopLibraries(mLibraries, bIncludeElements, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable, fnCallback).then(function(aResults){
			fnDone({
				testedControlCount: aResults[0],
				testedLibraryCount: aResults[1]
			});
		});
	}

	function loopLibraries(mLibraries, bIncludeElements, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable, fnCallback) {
		return new Promise(function(resolve) {
			// loop over all libs and controls and call the callback for each
			var iControlCount = 0,
				iLibCount = 0;

			var aLibraryNames = [];
			for (var sLibName in mLibraries) {
				aLibraryNames.push(sLibName);
			}

			var loop = function(i) {
				if (i < aLibraryNames.length) {
					var sLibName = aLibraryNames[i];

					handleLibrary(mLibraries, sLibName, bIncludeElements, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable, fnCallback).then(function(aResult){
						iControlCount += aResult[0];
						if (aResult[1]) {
							iLibCount++;
						}
						loop(i + 1);
					});
				} else {
					resolve([iControlCount, iLibCount]);
				}
			};

			loop(0);
		});
	}

	function handleLibrary(mLibraries, sLibName, bIncludeElements, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable, fnCallback) {
		return new Promise(function(resolve) {
			var oLibrary = mLibraries[sLibName];
			if (!oLibrary) { // in case removed from the map
				resolve([0, false]);
			}

			// we may need a concatenated array of Controls and Elements
			var aControls = oLibrary.controls;
			if (bIncludeElements) {
				aControls = aControls.concat(oLibrary.elements.slice());
			}

			loopControlsInLibrary(aControls, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable, fnCallback).then(function(iAnalyzedControls){
				resolve([iAnalyzedControls, true]);
			});
		});
	}


	return ControlIterator;
}, /* bExport= */true);
