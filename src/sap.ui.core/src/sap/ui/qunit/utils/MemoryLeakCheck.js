/*!
 * ${copyright}
 */

/*global QUnit*/

sap.ui.define([ 'jquery.sap.global', 'sap/ui/core/Core', 'sap/ui/base/Object', 'sap/ui/core/Control' ],
		function(jQuery, Core, BaseObject, Control) {
	"use strict";

	jQuery.sap.require("sap.ui.qunit.qunit-css");
	jQuery.sap.require("sap.ui.thirdparty.qunit");
	jQuery.sap.require("sap.ui.qunit.qunit-junit");
	jQuery.sap.require("sap.ui.qunit.qunit-coverage");

	QUnit.config.reorder = false;   // make sure results are consistent/stable and the "statistics" test in the end is actually run in the end



	/**
	 * <code>sap.ui.qunit.utils.MemoryLeakCheck</code> is a utility for finding controls that leak references to other controls. See the <code>checkControl</code> method for usage instructions.
	 *
	 * @namespace
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.48.0
	 * @alias sap.ui.qunit.utils.MemoryLeakCheck
	 */
	var MemoryLeakCheck = {};


	// get access to the real core object to access the control list
	sap.ui.getCore().registerPlugin({
		startPlugin : function(oRealCore) {
			MemoryLeakCheck.oCore = oRealCore;
		},
		stopPlugin : function() {
			MemoryLeakCheck.oCore = undefined;
		}
	});


	// gets the map of all currently registered controls from the Core
	function getAllAliveControls() {
		return jQuery.extend({}, MemoryLeakCheck.oCore.mElements);
	}


	// tries to fill all control properties with string values (hoping this might trigger more leaks)
	var fillControlProperties = function(oControl) {
		var mProperties = oControl.getMetadata().getAllProperties();

		for (var sPropertyName in mProperties) {
			var oProperty = mProperties[sPropertyName];
			try {
				if (oControl[oProperty._sGetter]() === oProperty.getDefaultValue()) { // if no value has been set yet by the control factory  TODO: use "isPropertyInitial", once available
					oControl[oProperty._sMutator]("dummyValueForMemLeakTest"); // just try a string for everything now, TODO: check type
				}
			} catch (e) {
				// type check error, ignore (we stupidly always try with a string, even if the property has a different type)
			}
		}
		if (!oControl.getTooltip()) {
			oControl.setTooltip("test"); // seems not to be a property...
		}
	};


	// Creates and renders two instances of the given control and asserts that the second instance does not leak any controls after destruction.
	// Has some special logic to ignore or work around problems where certain controls do not work standalone.
	var _checkControl = function(sControlName, fnControlFactory, fnSomeAdditionalFunction, bControlCannotRender) {

		QUnit.test("Control " + sControlName + " should not have any memory leaks", function(assert) {
			var oControl1 = fnControlFactory();

			assert.ok(oControl1, "calling fnControlFactory() should return something (a control)");
			assert.ok(oControl1 instanceof Control, "calling fnControlFactory() should return something that is really instanceof sap.ui.core.Control");

			// check whether this control can be rendered
			if (oControl1.placeAt && !bControlCannotRender) {

				try {
					oControl1.getMetadata().getRenderer();
				} catch (e) {
					// control didn't say it has problems with rendering!
					assert.ok(false, "Error: control does not have a renderer. If this is known, please set the 'bControlCannotRender' flag when calling MemoryLeakCheck.checkControl");
				}
			}

			// Render Control Instance 1 - some control types statically create something for re-use across all instances

			fillControlProperties(oControl1);

			if (oControl1.placeAt && !bControlCannotRender) {
				try {
					oControl1.placeAt("qunit-fixture");
					sap.ui.getCore().applyChanges();

				} catch (e) {
					// control didn't say it has problems with rendering!
					assert.ok(false, "Error: control has a renderer, but could not be rendered. If this is known, please set the 'bControlCannotRender' flag when calling MemoryLeakCheck.checkControl");
					throw e;
				}
			}

			if (fnSomeAdditionalFunction) {
				fnSomeAdditionalFunction(oControl1);
				sap.ui.getCore().applyChanges();
			}

			oControl1.destroy();
			sap.ui.getCore().applyChanges();


			// Render Control Instance 2 - any new controls leaked?

			var mPreElements = getAllAliveControls(), oControl2 = fnControlFactory();

			fillControlProperties(oControl2);

			if (oControl2.placeAt && !bControlCannotRender) {
				oControl2.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();

				oControl2.rerender(); // just re-render again - this finds problems
				sap.ui.getCore().applyChanges();
			}

			if (fnSomeAdditionalFunction) {
				fnSomeAdditionalFunction(oControl2);
				sap.ui.getCore().applyChanges();
			}

			// check what's left after destruction

			oControl2.destroy();
			sap.ui.getCore().applyChanges();
			var mPostElements = getAllAliveControls();

			// controls left over by second instance are real leaks that will grow proportionally to instance count => ERROR
			detectEqualElementsInControlList(assert, mPostElements, mPreElements, "Memory leak check should not find any leftover controls after creating two instances and rendering twice" + (fnSomeAdditionalFunction ? "\n(and calling fnSomeAdditionalFunction)" : ""));

			// controls left over by first instance are either real leaks or one-time static leaks, which we accept
		});
	};


	// asserts that both given maps have the same entries
	var detectEqualElementsInControlList = function(assert, mActual, mExpected, sMessage) {
		var aUnexpectedElements = [];

		for (var sId in mActual) {
			if (!mExpected[sId]) {
				aUnexpectedElements.push(mActual[sId]);
			}
		}

		// enrich with helpful info to more easily identify the leaked control
		for (var i = 0; i < aUnexpectedElements.length; i++) {
			if (typeof aUnexpectedElements[i].getText === "function") {
				aUnexpectedElements[i] += " (text: '" + aUnexpectedElements[i].getText() + "')";
			}
		}

		sMessage = sMessage + (aUnexpectedElements.length > 0 ? ". LEFTOVERS: " + aUnexpectedElements.join(", ") : "");
		assert.equal(aUnexpectedElements.length, 0, sMessage);
	};


	/**
	 * This function creates a new QUnit module, runs some tests for memory leaks and then destroys all existing controls. Use it to test the control created in
	 * the factory function fnControlFactory (first parameter) for any other control instances it might leak. The test needs to be run within a normal QUnit
	 * test page (including e.g. a "qunit-fixture" element for rendering).
	 *
	 * Usage example: <code>
	 * sap.ui.qunit.utils.MemoryLeakCheck.checkControl(
	 *    function() {
	 *       return new my.Square();
	 *    }, function(oControl) {
	 *       oControl.onclick();
	 *    }
	 * );
	 * </code>
	 *
	 * @param {string} sControlName the name of the control to test, or whatever should be displayed as test name
	 * @param {function} fnControlFactory a function that returns a control instance which should be checked for leaking controls; this function will be called at least twice and needs to return a new control instance every time
	 * @param {function} [fnSomeAdditionalFunction] a function that should be called after the control has been rendered; any memory leaks caused within this function will be also detected
	 * @param {boolean} [bControlCannotRender] should only be set if for some reason the tested control cannot be rendered and this fact is accepted. The test will then only instantiate the control.
	 *
	 * @public
	 */
	MemoryLeakCheck.checkControl = function(sControlName, fnControlFactory, fnSomeAdditionalFunction, bControlCannotRender) {
		// sControlName could be derived from the control instance later, but we want to use the control name for module setup BEFORE the control factory is called, so we need it separately

		if (typeof sControlName !== "string") { // sControlName parameter was added to the API later, so inofficially it is optional for compatibility reasons -> shift parameters
			bControlCannotRender = fnSomeAdditionalFunction;
			fnSomeAdditionalFunction = fnControlFactory;
			fnControlFactory = sControlName;
			sControlName = "[some control, id: " + Math.random() + " - please update your test to also pass the control name]";
		}

		if (fnSomeAdditionalFunction === true || fnSomeAdditionalFunction === false) { // no additional function given - shift parameters
			bControlCannotRender = fnSomeAdditionalFunction;
			fnSomeAdditionalFunction = undefined;
		}

		// QUnit Setup

		var mOriginalElements;
		QUnit.module("MemoryLeakCheck.checkControl: " + sControlName, {
			beforeEach: function() { // not needed before EACH, because there is only one test creating controls right now, but 1.) "before" is never called and 2.) there might be more later.
				mOriginalElements = getAllAliveControls();
			},
			afterEach: function() {
				for (var sId in MemoryLeakCheck.oCore.mElements) {
					if (!mOriginalElements[sId]) {
						var oControl = sap.ui.getCore().byId(sId);
						oControl.destroy();
					}
				}
			}
		});

		// sanity check to make sure this is actually testing something
		QUnit.test("MemoryLeakCheck.checkControl(fnControlFactory) should receive a control factory", function(assert) {
			assert.equal(typeof fnControlFactory, "function", "MemoryLeakCheck should have received a control factory");
			assert.ok(document.getElementById("qunit-fixture"), "the test page HTML should contain an element with ID 'qunit-fixture'");
		});

		_checkControl(sControlName, fnControlFactory, fnSomeAdditionalFunction, bControlCannotRender);
	};

	return MemoryLeakCheck;
}, /* bExport= */true);
