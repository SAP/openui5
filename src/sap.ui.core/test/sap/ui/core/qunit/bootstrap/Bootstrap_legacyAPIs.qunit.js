/*global QUnit */
sap.ui.define([], function() {

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

});