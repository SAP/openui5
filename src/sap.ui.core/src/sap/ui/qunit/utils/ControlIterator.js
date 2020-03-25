/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Core', "sap/base/util/ObjectPath", "sap/base/Log", "sap/ui/VersionInfo"],
		function(oCore, ObjectPath, Log, VersionInfo) {
	"use strict";

	/**
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
	 * @namespace
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.48.0
	 * @alias sap.ui.qunit.utils.ControlIterator
	 */
	var ControlIterator = {};

	var aControlsThatCannotBeRenderedGenerically = [
		"sap.chart.Chart",
		"sap.m.ColumnHeaderPopover",
		"sap.m.FacetFilterItem",
		"sap.m.internal.NumericInput",
		"sap.m.IconTabBarSelectList",
		"sap.m.LightBox",
		"sap.m.Menu",
		"sap.m.NotificationListBase",
		"sap.m.NotificationListItem",
		"sap.m.QuickViewBase",
		"sap.m.QuickViewGroup",
		"sap.m.QuickViewGroupElement",
		"sap.m.TabStripItem",
		"sap.m.TimePickerSlider",
		"sap.m.TimePickerSliders",
		"sap.m.UploadCollectionToolbarPlaceholder",
		"sap.m.Wizard",
		"sap.makit.Chart",
		"sap.me.TabContainer",
		"sap.suite.ui.microchart.InteractiveBarChart",
		"sap.suite.ui.microchart.InteractiveDonutChart",
		"sap.tnt.NavigationList",
		"sap.ui.comp.smartform.Group",
		"sap.ui.comp.smartform.GroupElement",
		"sap.ui.comp.valuehelpdialog.ValueHelpDialog",
		"sap.ui.core.mvc.HTMLView",
		"sap.ui.core.mvc.JSONView",
		"sap.ui.core.mvc.JSView",
		"sap.ui.core.mvc.TemplateView",
		"sap.ui.core.mvc.View",
		"sap.ui.core.mvc.XMLView",
		"sap.ui.core.tmpl.Template",
		"sap.ui.core.UIComponent",
		"sap.ui.core.util.Export",
		"sap.ui.documentation.sdk.controls.BorrowedList",
		"sap.ui.documentation.sdk.controls.LightTable",
		"sap.ui.layout.BlockLayoutRow",
		"sap.ui.layout.form.ResponsiveGridLayoutPanel", // control not for stand alone usage. Only inside ResponsiveGridLayout
		"sap.ui.layout.form.ResponsiveLayoutPanel", // control not for stand alone usage. Only inside ResponsiveLayout
		"sap.ui.richtexteditor.RichTextEditor",
		"sap.ui.richtexteditor.ToolbarWrapper",
		"sap.ui.rta.AddElementsDialog",
		"sap.ui.rta.ContextMenu",
		"sap.ui.suite.TaskCircle",
		"sap.ui.table.ColumnMenu",
		"sap.ui.unified.Menu",
		"sap.ui.ux3.ActionBar",
		"sap.ui.ux3.ExactList.LB",
		"sap.ui.ux3.NotificationBar",
		"sap.uiext.inbox.composite.InboxTaskTitleControl",
		"sap.uiext.inbox.InboxFormattedTextView",
		"sap.uiext.inbox.InboxTaskDetails",
		"sap.uiext.inbox.InboxToggleTextView",
		"sap.uiext.inbox.SubstitutionRulesManager",
		"sap.uxap.AnchorBar",
		"sap.uxap.BlockBase",
		"sap.uxap.BreadCrumbs",
		"sap.uxap.ObjectPageHeader",
		"sap.uxap.ObjectPageSubSection",
		"sap.viz.ui5.controls.common.BaseControl",
		"sap.viz.ui5.controls.VizRangeSlider",
		"sap.viz.ui5.controls.VizTooltip",
		"sap.viz.ui5.core.BaseChart"
	];

	function controlCanBeRendered(sControlName, fnControlClass) {
		if (!controlCanBeInstantiated(sControlName, fnControlClass)) {
			return false;
		}

		// controls which are known not to work standalone - some of them cannot work, some might need to be improved
		if (aControlsThatCannotBeRenderedGenerically.indexOf(sControlName) > -1)  { // known to be untestable
			return false;
		}

		return true;
	}

	var aControlsThatCannotBeInstantiated = [
		"sap.makit.Chart",
		"sap.ui.commons.SearchField", // can be instantiated, but fails before rendering
		"sap.ui.commons.SearchField.CB", // a MESS!
		"sap.ui.commons.SearchFieldCB",
		"sap.ui.commons.Tab",
		"sap.ui.comp.transport.TransportDialog",
		"sap.ui.core.ComponentContainer",
		"sap.ui.core.mvc.HTMLView",
		"sap.ui.core.mvc.JSONView",
		"sap.ui.core.mvc.JSView",
		"sap.ui.core.mvc.TemplateView",
		"sap.ui.core.mvc.View",
		"sap.ui.core.mvc.XMLView",
		"sap.ui.core.XMLComposite",
		"sap.ui.mdc.BaseControl", // should be abstract?
		"sap.ui.mdc.odata.v4.microchart.MicroChart", //The control only runs in views with XML pre-processor. The test can't provide this environment
		"sap.ui.mdc.ValueHelpDialog", //The control only runs in views with XML pre-processor. The test can't provide this environment
		"sap.ui.mdc.XMLComposite", //The control only runs in views with XML pre-processor. The test can't provide this environment
		"sap.ui.rta.AddElementsDialog",
		"sap.ui.rta.ContextMenu"
	];

	function controlCanBeInstantiated(sControlName, fnControlClass) {
		// controls which are known not to work standalone

		if (aControlsThatCannotBeInstantiated.indexOf(sControlName) > -1)  { // known to be not instantiable
			return false;
		}

		if (!fnControlClass) {
			return false;
		}
		var oMetadata = fnControlClass.getMetadata();

		if (oMetadata.isAbstract()) {
			return false;
		}

		return true;
	}

	ControlIterator.aKnownOpenUI5Libraries = [
		"sap.f", "sap.m", "sap.tnt", "sap.ui.codeeditor", "sap.ui.commons", "sap.ui.core",
		"sap.ui.documentation", "sap.ui.dt", "sap.ui.fl", "sap.ui.integration",
		"sap.ui.layout", "sap.ui.rta", "sap.ui.suite", "sap.ui.support", "sap.ui.table",
		"sap.ui.unified", "sap.ui.ux3",	"sap.uxap"
	];

	ControlIterator.aKnownRuntimeLayerLibraries = ControlIterator.aKnownOpenUI5Libraries.concat([
		"sap.chart", "sap.makit", "sap.me", "sap.ndc", "sap.suite.ui.microchart", "sap.ui.comp",
		"sap.ui.generic.app", "sap.ui.generic.template", "sap.ui.mdc", "sap.ui.richtexteditor",
		"sap.viz"]);

	ControlIterator.isKnownRuntimeLayerLibrary = function(sLibName) {
		return ControlIterator.aKnownRuntimeLayerLibraries.indexOf(sLibName) > -1;
	};

	function nop() {
	}

	function alwaysTrue() {
		return true;
	}

	function alwaysFalse() {
		return false;
	}

	function toName(oLibrary) {
		return oLibrary.name;
	}

	function getAllLibraries(fnFilter) {

		fnFilter = fnFilter || alwaysTrue;

		// discover what is available in order to also test other libraries than those loaded in bootstrap
		return VersionInfo.load()
			.then(function(oInfo) {
				return oInfo.libraries.map(toName).filter(fnFilter);
			})
			.then(function(aLibraries) {
				return Promise.all(
					aLibraries.map(function(sLibName) {
						// ignore load errors. This happens for e.g. "themelib_sap_bluecrystal"...
						return oCore.loadLibrary(sLibName, {async: true}).catch(nop);
					})
				);
			})
			.then(function() {
				// get a shallow copy the loaded library metadata
				var mLibraries = oCore.getLoadedLibraries();
				// filter libraries out that have not been requested
				for (var sLibName in mLibraries) {
					if (!fnFilter(sLibName)) {
						delete mLibraries[sLibName];
					}
				}
				return mLibraries;
			});
	}

	/**
	 * Asynchronously loads the module for the class with the given name and returns the export of that module
	 * @param {string} sClassName name of the class to load
	 */
	function loadControlClass(sClassName) {
		var sModuleName = sClassName.replace(/\./g, "/");
		return new Promise(function(resolve, reject) {
			sap.ui.require([sModuleName], function(FNClass) {
				resolve(FNClass);
			}, function(oErr) {
				reject(new Error("failed to load class " + sModuleName + ":" + oErr));
			});
		});
	}

	/**
	 * Creates a filter function for libraries, taking the given parameters into account.
	 *
	 * When a list of libraries is given (<code>aLibrariesToTest</code>), the returned filter
	 * function will match exactly the given libraries (whitelist).
	 * Alternatively, a list of libraries to exclude can be given (<code>aExcludedLibraries</code>,
	 * blacklist) which will then not be matched by the returned filter function. In the case of
	 * the blacklist, the filter is additionally restricted to openui5 and sapui5.runtime libraries
	 * unless <code>bIncludeDistLayer</code> is set to true.
	 *
	 * @param {string[]} [aLibrariesToTest] List of libraries to load
	 * @param {string[]} [aExcludedLibraries] List of libraries to exclude
	 * @param {boolean} [bIncludeDistLayer] whether the list of libraries should be restricted to
	 *            known runtime-layer libraries (superset of the OpenUI5 libraries) or include any
	 *            dist-layer libraries
	 * @returns {function(string):boolean} A filter function for library names
	 */
	function makeLibraryFilter(aLibrariesToTest, aExcludedLibraries, bIncludeDistLayer) {
		if ( aLibrariesToTest ) {
			return function(sLibName) {
				return aLibrariesToTest.indexOf(sLibName) >= 0;
			};
		} else if ( bIncludeDistLayer ) {
			return function(sLibName) {
				return aExcludedLibraries.indexOf(sLibName) < 0;
			};
		}
		return function(sLibName) {
			return aExcludedLibraries.indexOf(sLibName) < 0 &&
				(bIncludeDistLayer || ControlIterator.isKnownRuntimeLayerLibrary(sLibName));
		};
	}

	ControlIterator.loadLibraries = function(vLibraries) {
		if ( vLibraries === "openui5" ) {
			vLibraries = ControlIterator.aKnownOpenUI5Libraries;
		} else if ( vLibraries === "sapui5.runtime" ) {
			vLibraries = ControlIterator.aKnownRuntimeLayerLibraries;
		}

		var fnFilter;
		if ( Array.isArray(vLibraries) ) {
			fnFilter = makeLibraryFilter(vLibraries);
		} else if ( typeof vLibraries === "function" ) {
			fnFilter = vLibraries;
		} else if ( vLibraries == null ) {
			fnFilter = alwaysTrue;
		} else {
			throw new TypeError("unexpected filter " + vLibraries);
		}

		return getAllLibraries(fnFilter);
	};

	function checkLibraries(mLibraries, QUnit) {
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
	}

	/**
	 * Checks whether the control is not among the explicitly excluded controls and is not excluded due to its
	 * rendering/instantiation capabilities.
	 *
	 * The returned promise resolves with an info object describing the control's capabilities when the class
	 * should be included in the iterator or with a falsy value otherwise.
	 *
	 * @param {string} sControlName Qualified name (dot notation) of the control to test
	 * @param {string[]} aControlsToTest List of controls to include in the tests (whitelist)
	 * @param {string[]} aExcludedControls List of controls to exclude from the tests (blacklist)
	 * @param {boolean} bIncludeNonRenderable Whether the iterator should include controls that can't be rendered
	 * @param {boolean} bIncludeNonInstantiable Whether the iterator should include controls that can't be instantiated
	 * @returns Promise<({name:string,class:function,canBeInstantiated:boolean,canBeRendered:boolean}|false)>
	 *             A promise on an info object or <code>false</code> if the class should not be tested
	 */
	var shouldTestControl = function(sControlName, aControlsToTest, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable) {
		if (!sControlName
			|| aControlsToTest.length && aControlsToTest.indexOf(sControlName) < 0  // only test specific controls
			|| aExcludedControls.indexOf(sControlName) >= 0 ) {
			return Promise.resolve(false);
		}

		return loadControlClass(sControlName).then(function(FNControlClass) {
			var oInfo = {
				name: sControlName,
				"class": FNControlClass,
				canBeInstantiated: controlCanBeInstantiated(sControlName, FNControlClass),
				canBeRendered: controlCanBeRendered(sControlName, FNControlClass)
			};

			if (!bIncludeNonInstantiable && !oInfo.canBeInstantiated) {
				return false;
			}

			if (!bIncludeNonRenderable && !oInfo.canBeRendered) {
				return false;
			}

			return oInfo;
		}, alwaysFalse);
	};

	/**
	 * Calls the callback function for all controls in the given array, unless they are explicitly excluded
	 */
	var loopControlsInLibrary = function(aControls, aControlsToTest, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable, fnCallback) {
		return new Promise(function(resolve, reject){
			var iControlCountInLib = 0;

			var loop = function(i) {
				if (i < aControls.length) {

					var sControlName = aControls[i];
					handleControl(sControlName, aControlsToTest, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable, fnCallback).then(function(bCountThisControl){
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

	function handleControl(sControlName, aControlsToTest, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable, fnCallback) {
		return shouldTestControl(sControlName, aControlsToTest, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable)
		.then(function(oControlInfo) {
			if ( oControlInfo ) {
				fnCallback(sControlName, oControlInfo.class, {
					canInstantiate: oControlInfo.canBeInstantiated,
					canRender: oControlInfo.canBeRendered
				});
			}
			return new Promise(function(resolve) {
				// give the UI the chance to be responsive to user interaction and to update information about the currently handled control
				setTimeout(function(){
					resolve(!!oControlInfo);
				}, 0);
			});
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
	 * @param {object.string[]} [mOptions.controlsToTest=undefined] which controls to test, e.g. <code>["sap.m.Button"]</code>. When set, exactly these controls will be tested (IF they are found in the available/tested libraries) and the option excludedControls will be ignored. Otherwise, the module will try to discover all available controls.
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

		var fnDone = mOptions.done || nop;
		var aLibrariesToTest = mOptions.librariesToTest || undefined;
		var aExcludedLibraries = mOptions.excludedLibraries || [];
		var aControlsToTest = mOptions.controlsToTest || [];
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
			assert.ok(mOptions.librariesToTest === undefined || Array.isArray(mOptions.librariesToTest), "The given librariesToTest must be undefined or an array, but is: " + mOptions.librariesToTest);
			assert.ok(mOptions.excludedLibraries === undefined || Array.isArray(mOptions.excludedLibraries), "The given excludedLibraries must be undefined or an array, but is: " + mOptions.excludedLibraries);
			assert.ok(mOptions.excludedControls === undefined || Array.isArray(mOptions.excludedControls), "The given excludedControls must be undefined or an array, but is: " + mOptions.excludedControls);
			assert.ok(mOptions.includeDistLayer === undefined || typeof mOptions.includeDistLayer === "boolean", "The given includeDistLayer must be undefined or a boolean, but is: " + mOptions.includeDistLayer);
			assert.ok(mOptions.includeElements === undefined || typeof mOptions.includeElements === "boolean", "The given includeElements must be undefined or a boolean, but is: " + mOptions.includeElements);
			assert.ok(mOptions.includeNonRenderable === undefined || typeof mOptions.includeNonRenderable === "boolean", "The given includeNonRenderable must be undefined or a boolean, but is: " + mOptions.includeNonRenderable);
			assert.ok(mOptions.includeNonInstantiable === undefined || typeof mOptions.includeNonInstantiable === "boolean", "The given includeNonInstantiable must be undefined or a boolean, but is: " + mOptions.includeNonInstantiable);
			assert.ok(fnDone === undefined || typeof fnDone === "function", "The given done callback must be undefined or a function, but is: " + fnDone);
		});


		// get the libraries we are interested in
		var fnFilter = makeLibraryFilter(aLibrariesToTest, aExcludedLibraries, bIncludeDistLayer);
		return getAllLibraries(fnFilter)
			.then(function(mLibraries) {
				checkLibraries(mLibraries, QUnit);
				return mLibraries;
			})
			.then(function(mLibraries) {
				return loopLibraries(mLibraries, bIncludeElements, aControlsToTest, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable, fnCallback).then(function(aResults){
					fnDone({
						testedControlCount: aResults[0],
						testedLibraryCount: aResults[1]
					});
				});
			});
	}

	function loopLibraries(mLibraries, bIncludeElements, aControlsToTest, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable, fnCallback) {
		return new Promise(function(resolve) {
			// loop over all libs and controls and call the callback for each
			var aLibraryNames = Object.keys(mLibraries),
				iControlCount = 0,
				iLibCount = 0;

			var loop = function(i) {
				if (i < aLibraryNames.length) {
					var sLibName = aLibraryNames[i];

					handleLibrary(mLibraries, sLibName, bIncludeElements, aControlsToTest, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable, fnCallback).then(function(aResult){
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

	function handleLibrary(mLibraries, sLibName, bIncludeElements, aControlsToTest, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable, fnCallback) {
		return new Promise(function(resolve) {
			var oLibrary = mLibraries[sLibName];
			if (!oLibrary) { // in case removed from the map
				resolve([0, false]);
				return;
			}

			// we may need a concatenated array of Controls and Elements
			var aControls = oLibrary.controls;
			if (bIncludeElements) {
				aControls = aControls.concat(oLibrary.elements.slice());
			}

			loopControlsInLibrary(aControls, aControlsToTest, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable, fnCallback).then(function(iAnalyzedControls){
				resolve([iAnalyzedControls, true]);
			});
		});
	}


	return ControlIterator;
}, /* bExport= */true);