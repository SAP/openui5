/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/ContextMenuSupport",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery"
], function(ContextMenuSupport, Control, Element, QUnitUtils, nextUIUpdate, jQuery) {
	"use strict";

	var MyControl = Control.extend("my.lib.MyControl", {
		metadata : {
			aggregations: { content: {type: "sap.ui.core.Control", multiple: false} }
		},

		renderer : {
			apiVersion: 2,
			render: function(oRenderManager, oControl) {
				oRenderManager.openStart("span", oControl).openEnd();
				oRenderManager.renderControl(oControl.getContent());
				oRenderManager.close("span");
			}
		}
	});

	var MyMenuControl = Control.extend("my.lib.MyMenuControl", {
		metadata : {
			interfaces: [
				"sap.ui.core.IContextMenu"
			],
			aggregations: { content: {type: "sap.ui.core.Control", multiple: false} }
		},

		renderer : {
			apiVersion: 2,
			render: function(oRenderManager, oControl) {
				oRenderManager.openStart("span").openEnd().close("span");
			}
		}
	});
	MyMenuControl.prototype.openAsContextMenu = function(){};

	ContextMenuSupport.apply(MyControl.prototype);


	QUnit.module("ContextMenuSupport", {
		beforeEach: function() {
			this.myControl = new MyControl("myControl");
			this.myMenuControl = new MyMenuControl("myMenu");

			this.myControl.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function() {
			this.myControl.destroy();
			this.myMenuControl.destroy();
		}
	});

	QUnit.test('Control has the new methods', function(assert) {
		assert.ok(this.myControl.setContextMenu, "Should have a setter for ContextMenu");
		assert.ok(this.myControl.getContextMenu, "Should have a getter for ContextMenu");
	});

	QUnit.test('setContextMenu twice should open the second menu', function(assert) {
		var oOpenStub = sinon.stub(MyMenuControl.prototype, "openAsContextMenu"),
			oSecondMenuControl = this.myMenuControl.clone();

		this.myControl.setContextMenu(this.myMenuControl);
		this.myControl.setContextMenu(oSecondMenuControl);
		QUnitUtils.triggerMouseEvent(this.myControl.getDomRef(), "contextmenu");

		assert.notOk(oOpenStub.calledOn(this.myMenuControl), "first menu should not be opened");
		assert.ok(oOpenStub.calledOn(oSecondMenuControl), "second menu should be opened");

		oOpenStub.restore();
		oSecondMenuControl.destroy();
	});

	QUnit.test("setContextMenu with null should remove the Context Menu", function(assert) {
		var oOpenStub = sinon.stub(MyMenuControl.prototype, "openAsContextMenu");

		this.myControl.setContextMenu(this.myMenuControl);
		this.myControl.setContextMenu(null);

		QUnitUtils.triggerMouseEvent(this.myControl.getDomRef(), "contextmenu");

		assert.notOk(oOpenStub.calledOn(this.myMenuControl), "first menu should not be opened");

		oOpenStub.restore();
	});

	QUnit.test("addEventDelegate should be called", function(assert) {
		var oAddEventDelegateStub = sinon.stub(MyControl.prototype, "addEventDelegate");

		this.myControl.setContextMenu(this.myMenuControl);

		assert.ok(oAddEventDelegateStub.called, "Delegate should be added");

		oAddEventDelegateStub.restore();
	});

	QUnit.test("addEventDelegate should not be called", function(assert) {
		var oFakeMenu = { "fake": "object" },
			oAddEventDelegateStub = sinon.stub(MyControl.prototype, "addEventDelegate");

		this.myControl.setContextMenu(oFakeMenu);

		assert.notOk(oAddEventDelegateStub.called, "Delegate should not be added");

		oAddEventDelegateStub.restore();
		oFakeMenu = null;
	});

	QUnit.test("addEventDelegate should not be called on elements that do not implement IContextMenu", function(assert) {
		var MyElement = Element.extend("my.lib.MyElement", {
			metadata : {}
		});

		ContextMenuSupport.apply(MyElement.prototype);

		var oElement = new MyElement("oElement");

		assert.notOk(oElement.setContextMenu, "Should not have a setter for ContextMenu");
		assert.notOk(oElement.getContextMenu, "Should not have a getter for ContextMenu");

		oElement.destroy();
	});

	QUnit.test("oncontextmenu should open ContextMenu", function(assert) {
		var oFakeEvent = jQuery.Event("oncontextmenu", { srcControl:  this.myControl }),
			oOpenStub = sinon.stub(MyMenuControl.prototype, "openAsContextMenu");

		this.myControl.setContextMenu(this.myMenuControl);
		QUnitUtils.triggerMouseEvent(this.myControl.getDomRef(), "contextmenu");

		assert.ok(oOpenStub.called, "open should be called");

		delete oFakeEvent.srcControl;
		oFakeEvent = null;
		oOpenStub.restore();
	});

	QUnit.test("getContextMenu should return the ContextMenu", function(assert) {
		this.myControl.setContextMenu(this.myMenuControl);

		assert.strictEqual(this.myControl.getContextMenu(), this.myMenuControl, "ContextMenu should be returned");
	});
});
