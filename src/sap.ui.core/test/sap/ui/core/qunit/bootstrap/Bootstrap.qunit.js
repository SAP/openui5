/*global QUnit */
sap.ui.define([

], function() {

	"use strict";

	/**
	 * Tests whether basic classes are available that together can be considered the SAPUI5 Core
	 */
	QUnit.test("BasicClassesAvailable", function(assert) {
		assert.notStrictEqual(sap.ui.base, undefined, "package sap.ui.base must exist");
		assert.notStrictEqual(sap.ui.base.Object, undefined, "class sap.ui.base.Object must exist");
		assert.notStrictEqual(sap.ui.base.EventProvider, undefined, "class sap.ui.base.EventProvider must exist");
		assert.notStrictEqual(sap.ui.base.Interface, undefined, "class sap.ui.base.Interface must exist");
		assert.notStrictEqual(sap.ui.core, undefined, "package sap.ui.core must exist");
		assert.notStrictEqual(sap.ui.core.Core, undefined, "class sap.ui.core.Core must exist");
		assert.notStrictEqual(sap.ui.core.Element, undefined, "class sap.ui.core.Element must exist");
		assert.notStrictEqual(sap.ui.core.Control, undefined, "class sap.ui.core.Control must exist");
		assert.notStrictEqual(sap.ui.core.UIArea, undefined, "class sap.ui.core.UIArea must exist");
		assert.notStrictEqual(sap.ui.core.RenderManager, undefined, "class sap.ui.core.RenderManager must exist");
	});

	QUnit.test("CoreAvailable", function(assert) {
		assert.ok(typeof sap.ui.getCore == "function", "function sap.ui.getCore must be defined");
		assert.notStrictEqual(sap.ui.getCore(), null, "calling sap.ui.getCore() must not return null");
		assert.ok(sap.ui.getCore() instanceof sap.ui.base.Interface, "calling sap.ui.getCore() must deliver the Core interface");
		checkPublicMethods(assert, sap.ui.getCore(), sap.ui.core.Core);
	});

	QUnit.test("GetRenderManager", function(assert) {
		var oCore = sap.ui.getCore();

		var aCommonMethods = ["renderControl", "cleanupControlWithoutRendering"];

		var aStringRendererMethods = ["write", "writeEscaped", "writeAcceleratorKey", "writeControlData", "writeElementData",
			"writeAttribute", "writeAttributeEscaped", "addClass", "writeClasses", "addStyle", "writeStyles",
			"writeAccessibilityState", "writeIcon", "translate", "getConfiguration", "getHTML"];

		var aDomRendererMethods = ["openStart", "openEnd", "close", "voidStart", "voidEnd", "text", "attr", "class", "style",
			"accessibilityState", "icon", "unsafeHtml"];

		var aNonRendererFunctions = ["render", "flush", "destroy"];

		var aInterfaceMethods = aCommonMethods.concat(aStringRendererMethods, aDomRendererMethods, aNonRendererFunctions);

		assert.notStrictEqual(oCore.getRenderManager, undefined, "function getRenderManager on sap.ui.core.Core instance must be defined");
		assert.ok(typeof oCore.getRenderManager() === 'object', "calling getRenderManager on Core instance must deliver the RenderManager interface");
		checkMethods(assert, oCore.getRenderManager(), aInterfaceMethods);
	});

	QUnit.test("GetConfiguration", function(assert) {
		var oCore = sap.ui.getCore();
		assert.notStrictEqual(oCore.getConfiguration, undefined, "function getConfiguration on sap.ui.core.Core instance must be defined");
		assert.ok(oCore.getConfiguration() instanceof sap.ui.base.Interface, "calling getConfiguration on Core instance must deliver the Configuration interface");
		checkPublicMethods(assert, oCore.getConfiguration(), sap.ui.core.Configuration);
	});


	// #####################################################################
	// Convenience
	// #####################################################################

	function checkMethods(assert, oObject, aMethodNames) {
		var i;

		for ( i = 0; i < aMethodNames.length; i++ ) {
			assert.ok(oObject[aMethodNames[i]] !== undefined, "expected interface method should actually exist: " + aMethodNames[i]);
		}

		for ( i in oObject ) {
			assert.ok(aMethodNames.indexOf(i) >= 0, "actual method should be part of expected interface: " + i);
		}

	}

	function checkPublicMethods(assert, /**sap.ui.base.Object*/oObject, /**function*/ fnClass) {
		return checkMethods(assert, oObject, fnClass.getMetadata().getAllPublicMethods());
	}

});