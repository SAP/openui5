/*global QUnit, sinon */
sap.ui.define([
	"test-resources/sap/ui/core/qunit/odata/data/ODataModelFakeService",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Control",
	"sap/ui/core/Core",
	"sap/ui/core/UIAreaRegistry",
	"sap/ui/model/ContextBinding",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v2/ODataModel"
], function(
	fakeService,
	ManagedObject,
	Control,
	Core,
	UIAreaRegistry,
	ContextBinding,
	JSONModel,
	ODataModel
) {
	"use strict";

	var oContent = document.createElement("div");
	oContent.setAttribute("id", "content");
	document.body.appendChild(oContent);
	var oUIAreas = document.createElement("div");
	oUIAreas.setAttribute("id", "uiAreas");
	document.body.appendChild(oUIAreas);

	var sUri = "http://services.odata.org/V3/Northwind/Northwind.svc/";
	sUri = "/proxy/http/" + sUri.replace("http://","");

	var TestControl = Control.extend("sap.ui.core.TestControl", {
		metadata : {
			// ---- control specific ----
			library : "sap.ui.core",
			properties : {
				value : {type: "string", group: "Appearance", defaultValue: ""},
				other : {type: "string", group: "Appearance", defaultValue: ""}
			},
			aggregations : {
				children : {type : "sap.ui.core.TestControl" }
			}
		},
		renderer : function() {}
	});

	var oModel1 = new JSONModel({
		value : "1"
	});
	var oModel2 = new JSONModel({
		value : "2"
	});
	var oModel3 = new JSONModel({
		value : "3"
	});
	var oModel4 = new JSONModel({
		data: ["0","1","2"]
	});
	var oModel5 = new ODataModel(sUri);

	QUnit.module("Propagation listener", {
		beforeEach : function() {
			var oDiv = document.createElement("div");
			oUIAreas.appendChild(oDiv);
			new Control().placeAt(oDiv).destroy();
			this.uiArea = UIAreaRegistry.get(oDiv.id);

			this.mPropagationInfo = {};

			this.fnChange = function(oEvent) {
				if (this.mPropagationInfo[oEvent.getSource().getId()]) {
					this.mPropagationInfo[oEvent.getSource().getId()]++;
				} else {
					this.mPropagationInfo[oEvent.getSource().getId()] = 1;
				}
			}.bind(this);

			this.uiArea.attachModelContextChange(this.fnChange);
			this.uiArea.setModel(oModel1);
			this.child = new TestControl({
				value : "{/value}"
			});
			this.child.attachModelContextChange(this.fnChange);
			this.ctrl = new TestControl({
				value : "{/value}",
				children : [this.child]
			});
			this.ctrl.attachModelContextChange(this.fnChange);
			this.ctrl.placeAt(this.uiArea.getId());
		},

		afterEach : function() {
			this.uiArea.detachModelContextChange(this.fnChange);
			this.ctrl.destroy();
			this.ctrl = null;
			this.child = null;
			this.uiArea.setModel();
		}
	});

	QUnit.test("add Propagation Listener", function(assert) {
		window.fnPropListener = function(data, object) {
			assert.ok(data, "data passed");
			assert.equal(data.myData, "myData", "data object passed with data");
			assert.ok(object instanceof ManagedObject, "ManagedObject passed");
		}.bind(null,{myData:"myData"});
		var spy = sinon.spy(window, "fnPropListener");
		this.ctrl.addPropagationListener(window.fnPropListener);
		assert.ok(spy.callCount === 2, "Propagation listener called for every control");
		var oChild2 = new TestControl({
			value : "{/value}",
			children : [this.child]
		});
		this.ctrl.addAggregation("children", oChild2);
		assert.ok(spy.callCount === 4, "Propagation listener called for new control and its child");
		window.fnPropListener.restore();
	});

	QUnit.test("remove Propagation Listener", function(assert) {
		window.fnPropListener = function(data, object) {
			assert.ok(data, "data passed");
			assert.equal(data.myData, "myData", "data object passed with data");
			assert.ok(object instanceof ManagedObject, "ManagedObject passed");
		}.bind(null,{myData:"myData"});
		this.ctrl.addPropagationListener(window.fnPropListener);
		var spy = sinon.spy(window, "fnPropListener");
		this.ctrl.removePropagationListener(window.fnPropListener);
		assert.ok(spy.callCount === 0, "Propagation listener not called");
		var oChild2 = new TestControl({
			value : "{/value}",
			children : [this.child]
		});
		this.ctrl.addAggregation("children", oChild2);
		assert.ok(spy.callCount === 0, "Propagation listener not called");
		window.fnPropListener.restore();
	});

	QUnit.test("propagation Listener and models/bindings", function(assert) {
		window.fnPropListener = function(data, object) {}.bind(null,{myData:"myData"});
		this.ctrl.addPropagationListener(window.fnPropListener);
		var spy = sinon.spy(window, "fnPropListener");
		this.ctrl.setModel(oModel2);
		assert.ok(spy.callCount === 0, "Propagation listener not called on setModel");
		this.ctrl.setBindingContext(oModel2.createBindingContext("/value"));
		assert.ok(spy.callCount === 0, "Propagation listener not called on setBindingContext");
		this.ctrl.bindElement("/value");
		assert.ok(spy.callCount === 0, "Propagation listener not called on bindElement");
		window.fnPropListener.restore();
	});

	/**
	 * @deprecated
	 */
	QUnit.module("Model propagation Core", {
		beforeEach : function() {
			var oDiv = document.createElement("div");
			oUIAreas.appendChild(oDiv);
			new Control().placeAt(oDiv).destroy();
			this.uiArea = UIAreaRegistry.get(oDiv.id);

			this.mPropagationInfo = {};

			this.fnChange = function(oEvent) {
				if (this.mPropagationInfo[oEvent.getSource().getId()]) {
					this.mPropagationInfo[oEvent.getSource().getId()]++;
				} else {
					this.mPropagationInfo[oEvent.getSource().getId()] = 1;
				}
			}.bind(this);

			this.uiArea.attachModelContextChange(this.fnChange);
			Core.setModel(oModel1);
			this.child = new TestControl({
				value : "{/value}"
			});
			this.child.attachModelContextChange(this.fnChange);
			this.ctrl = new TestControl({
				value : "{/value}",
				children : [this.child]
			});
			this.ctrl.attachModelContextChange(this.fnChange);
			this.ctrl.placeAt(this.uiArea.getId());
		},

		afterEach : function() {
			this.uiArea.detachModelContextChange(this.fnChange);
			this.ctrl.destroy();
			this.ctrl = null;
			this.child = null;
			Core.setModel();
		}
	});

	/**
	 * @deprecated
	 */
	QUnit.test("Model propagated from Core", function(assert) {
		assert.ok(this.mPropagationInfo[this.uiArea.getId()] === 1, "ModelContextChange event on uiArea");
		assert.ok(this.mPropagationInfo[this.ctrl.getId()] === 1, "ModelContextChange event on ctrl");
		assert.ok(this.mPropagationInfo[this.child.getId()] === 1, "ModelContextChange event on child");
		this.mPropagationInfo = {};

		assert.equal(this.uiArea.getModel(), oModel1, "effective model of UIArea should be from Core");
		assert.equal(this.ctrl.getModel(), oModel1, "effective model of Root Control should be from Core");
		assert.equal(this.child.getModel(), oModel1, "effective model of Nested Control should be from Core");
		assert.equal(this.ctrl.getValue(), "1", "value of Root Control should be inherited from Core model");
		assert.equal(this.child.getValue(), "1", "value of Nested Control should be inherited from Core model");

		// setting the same model again should have no effect
		var oCtrlBindingBefore = this.ctrl.getBinding("value");
		var oChildBindingBefore = this.child.getBinding("value");
		sap.ui.getCore().setModel(oModel1);
		assert.ok(!this.mPropagationInfo[this.uiArea.getId()], "ModelContextChange event not fired on uiArea");
		assert.ok(!this.mPropagationInfo[this.ctrl.getId()], "ModelContextChange event not fired on ctrl");
		assert.ok(!this.mPropagationInfo[this.child.getId()], "ModelContextChange event not fired on child");
		this.mPropagationInfo = {};

		assert.equal(this.uiArea.getModel(), oModel1, "effective model of UIArea still should be from Core");
		assert.equal(this.ctrl.getModel(), oModel1, "effective model of Root Control still should be from Core");
		assert.equal(this.child.getModel(), oModel1, "effective model of Nested Control still should be from Core");
		assert.equal(this.ctrl.getValue(), "1", "value of Root Control still should be inherited from Core model");
		assert.equal(this.child.getValue(), "1", "value of Nested Control still should be inherited from Core model");
		assert.ok(oCtrlBindingBefore === this.ctrl.getBinding("value"), "binding should not have changed");
		assert.ok(oChildBindingBefore === this.child.getBinding("value"), "binding should not have changed");

		// model change in Core should be reflected in UIArea and controls
		sap.ui.getCore().setModel(oModel3);
		assert.ok(this.mPropagationInfo[this.uiArea.getId()] === 1, "ModelContextChange event on uiArea");
		assert.ok(this.mPropagationInfo[this.ctrl.getId()] === 1, "ModelContextChange event on ctrl");
		assert.ok(this.mPropagationInfo[this.child.getId()] === 1, "ModelContextChange event on child");

		assert.equal(this.uiArea.getModel(), oModel3, "new model should have been propagated from Core to UIArea");
		assert.equal(this.ctrl.getModel(), oModel3, "new model should have been propagated from Core to Root Control");
		assert.equal(this.child.getModel(), oModel3, "new model should have been propagated from Core to Nested Control");
		assert.equal(this.ctrl.getValue(), "3", "new value should be inherited from Core model");
		assert.equal(this.child.getValue(), "3", "new value should be inherited from Core model");
		assert.ok(oCtrlBindingBefore !== this.ctrl.getBinding("value"), "binding should have changed");
		assert.ok(oChildBindingBefore !== this.child.getBinding("value"), "binding should have changed");
	});

	QUnit.module("Model propagation", {
		beforeEach : function() {
			var oDiv = document.createElement("div");
			oUIAreas.appendChild(oDiv);
			new Control().placeAt(oDiv).destroy();
			this.uiArea = UIAreaRegistry.get(oDiv.id);

			this.mPropagationInfo = {};

			this.fnChange = function(oEvent) {
				if (this.mPropagationInfo[oEvent.getSource().getId()]) {
					this.mPropagationInfo[oEvent.getSource().getId()]++;
				} else {
					this.mPropagationInfo[oEvent.getSource().getId()] = 1;
				}
			}.bind(this);

			this.uiArea.attachModelContextChange(this.fnChange);
			this.uiArea.setModel(oModel1);
			this.child = new TestControl({
				value : "{/value}"
			});
			this.child.attachModelContextChange(this.fnChange);
			this.ctrl = new TestControl({
				value : "{/value}",
				children : [this.child]
			});
			this.ctrl.attachModelContextChange(this.fnChange);
			this.ctrl.placeAt(this.uiArea.getId());
		},

		afterEach : function() {
			this.uiArea.detachModelContextChange(this.fnChange);
			this.ctrl.destroy();
			this.ctrl = null;
			this.child = null;
			this.uiArea.setModel();
			/**
			 * @deprecated
			 */
			Core.setModel(null);
		}
	});

	QUnit.test("Model propagated from UIArea", function(assert) {
		assert.ok(this.mPropagationInfo[this.uiArea.getId()] === 1, "ModelContextChange event on uiArea");
		assert.ok(this.mPropagationInfo[this.ctrl.getId()] === 1, "ModelContextChange event on ctrl");
		assert.ok(this.mPropagationInfo[this.child.getId()] === 1, "ModelContextChange event on child");
		this.mPropagationInfo = {};

		this.uiArea.setModel(oModel2);
		assert.ok(this.mPropagationInfo[this.uiArea.getId()] === 1, "ModelContextChange event on uiArea");
		assert.ok(this.mPropagationInfo[this.ctrl.getId()] === 1, "ModelContextChange event on ctrl");
		assert.ok(this.mPropagationInfo[this.child.getId()] === 1, "ModelContextChange event on child");
		this.mPropagationInfo = {};

		assert.equal(this.ctrl.getModel(), oModel2, "model should be inherited from UIArea model");
		assert.equal(this.child.getModel(), oModel2, "model should be inherited from UIArea model");
		assert.equal(this.ctrl.getValue(), "2", "value should be inherited from UIArea model");
		assert.equal(this.child.getValue(), "2", "value should be inherited from UIArea model");

		// setting the same model again should have no effect
		var oCtrlBindingBefore = this.ctrl.getBinding("value");
		var oChildBindingBefore = this.child.getBinding("value");
		this.uiArea.setModel(oModel2);
		assert.ok(!this.mPropagationInfo[this.uiArea.getId()], "ModelContextChange event not fired on uiArea");
		assert.ok(!this.mPropagationInfo[this.ctrl.getId()], "ModelContextChange event not fired on ctrl");
		assert.ok(!this.mPropagationInfo[this.child.getId()], "ModelContextChange event not fired on child");

		assert.equal(this.uiArea.getModel(), oModel2, "model should have been propagated from UIArea");
		assert.equal(this.ctrl.getModel(), oModel2, "model should have been propagated from UIArea");
		assert.equal(this.child.getModel(), oModel2, "model should have been propagated from UIArea");
		assert.equal(this.ctrl.getValue(), "2", "value should be inherited from UIArea model");
		assert.equal(this.child.getValue(), "2", "value should be inherited from UIArea model");
		assert.ok(oCtrlBindingBefore === this.ctrl.getBinding("value"), "binding should not have changed");
		assert.ok(oChildBindingBefore === this.child.getBinding("value"), "binding should not have changed");

		/**
		 * @deprecated
		 */
		(() => {
			// model change in Core should not be reflected in UIArea and controls
			Core.setModel(oModel2);
			assert.ok(!this.mPropagationInfo[this.uiArea.getId()], "ModelContextChange event not fired on uiArea");
			assert.ok(!this.mPropagationInfo[this.ctrl.getId()], "ModelContextChange event not fired on ctrl");
			assert.ok(!this.mPropagationInfo[this.child.getId()], "ModelContextChange event not fired on child");

			assert.equal(this.uiArea.getModel(), oModel2, "model should have been propagated from UIArea");
			assert.equal(this.ctrl.getModel(), oModel2, "model should have been propagated from UIArea");
			assert.equal(this.child.getModel(), oModel2, "model should have been propagated from UIArea");
			assert.equal(this.ctrl.getValue(), "2", "value should be inherited from UIArea model");
			assert.equal(this.child.getValue(), "2", "value should be inherited from UIArea model");
			assert.ok(oCtrlBindingBefore === this.ctrl.getBinding("value"), "binding should not have changed");
			assert.ok(oChildBindingBefore === this.child.getBinding("value"), "binding should not have changed");

			// model change in Core should not be reflected in UIArea and controls
			Core.setModel(oModel3);
			assert.ok(this.mPropagationInfo[this.uiArea.getId()] === 1, "ModelContextChange event on uiArea");
			assert.ok(this.mPropagationInfo[this.ctrl.getId()] === 1, "ModelContextChange event on ctrl");
			assert.ok(this.mPropagationInfo[this.child.getId()] === 1, "ModelContextChange event on child");
			this.mPropagationInfo = {};

			assert.equal(this.uiArea.getModel(), oModel2, "model should have been propagated from UIArea");
			assert.equal(this.ctrl.getModel(), oModel2, "model should have been propagated from UIArea");
			assert.equal(this.child.getModel(), oModel2, "model should have been propagated from UIArea");
			assert.equal(this.ctrl.getValue(), "2", "value should be inherited from UIArea model");
			assert.equal(this.child.getValue(), "2", "value should be inherited from UIArea model");
			assert.ok(oCtrlBindingBefore === this.ctrl.getBinding("value"), "binding should not have changed");
			assert.ok(oChildBindingBefore === this.child.getBinding("value"), "binding should not have changed");
			Core.setModel(oModel1);
			assert.ok(this.mPropagationInfo[this.uiArea.getId()] === 1, "ModelContextChange event on uiArea");
			assert.ok(this.mPropagationInfo[this.ctrl.getId()] === 1, "ModelContextChange event on ctrl");
			assert.ok(this.mPropagationInfo[this.child.getId()] === 1, "ModelContextChange event on child");
			this.mPropagationInfo = {};
		})();

		// model change in UIArea should be reflected in UIArea and controls
		this.uiArea.setModel(oModel3);
		assert.ok(this.mPropagationInfo[this.uiArea.getId()] === 1, "ModelContextChange event on uiArea");
		assert.ok(this.mPropagationInfo[this.ctrl.getId()] === 1, "ModelContextChange event on ctrl");
		assert.ok(this.mPropagationInfo[this.child.getId()] === 1, "ModelContextChange event on child");
		this.mPropagationInfo = {};

		assert.equal(this.uiArea.getModel(), oModel3, "model should have been propagated from UIArea");
		assert.equal(this.ctrl.getModel(), oModel3, "model should have been propagated from UIArea");
		assert.equal(this.child.getModel(), oModel3, "model should have been propagated from UIArea");
		assert.equal(this.ctrl.getValue(), "3", "value should be inherited from UIArea model");
		assert.equal(this.child.getValue(), "3", "value should be inherited from UIArea model");
		assert.ok(oCtrlBindingBefore !== this.ctrl.getBinding("value"), "binding should have changed");
		assert.ok(oChildBindingBefore !== this.child.getBinding("value"), "binding should have changed");

		// after removing the model from the UIArea, Core model should be effective again
		/**
		 * @deprecated
		 */
		(() => {
			oCtrlBindingBefore = this.ctrl.getBinding("value");
			oChildBindingBefore = this.child.getBinding("value");
			this.uiArea.setModel();
			assert.ok(this.mPropagationInfo[this.uiArea.getId()] === 1, "ModelContextChange event on uiArea");
			assert.ok(this.mPropagationInfo[this.ctrl.getId()] === 1, "ModelContextChange event on ctrl");
			assert.ok(this.mPropagationInfo[this.child.getId()] === 1, "ModelContextChange event on child");
			this.mPropagationInfo = {};

			assert.equal(this.uiArea.getModel(), oModel1, "model should have been propagated from Core");
			assert.equal(this.ctrl.getModel(), oModel1, "model should have been propagated from Core");
			assert.equal(this.child.getModel(), oModel1, "model should have been propagated from Core");
			assert.equal(this.ctrl.getValue(), "1", "value should be inherited from Core model");
			assert.equal(this.child.getValue(), "1", "value should be inherited from UIArea model");
			assert.ok(oCtrlBindingBefore !== this.ctrl.getBinding("value"), "binding should have changed");
			assert.ok(oChildBindingBefore !== this.child.getBinding("value"), "binding should have changed");
		})();
	});

	QUnit.test("Model propagated from parent", function(assert) {
		assert.ok(this.mPropagationInfo[this.uiArea.getId()] === 1, "ModelContextChange event on uiArea");
		assert.ok(this.mPropagationInfo[this.ctrl.getId()] === 1, "ModelContextChange event on ctrl");
		assert.ok(this.mPropagationInfo[this.child.getId()] === 1, "ModelContextChange event on child");
		this.mPropagationInfo = {};

		this.ctrl.setModel(oModel2);
		assert.ok(!this.mPropagationInfo[this.uiArea.getId()], "ModelContextChange event not fired on uiArea");
		assert.ok(this.mPropagationInfo[this.ctrl.getId()] === 1, "ModelContextChange event on ctrl");
		assert.ok(this.mPropagationInfo[this.child.getId()] === 1, "ModelContextChange event on child");
		this.mPropagationInfo = {};

		assert.equal(this.ctrl.getModel(), oModel2, "model should be inherited from UIArea model");
		assert.equal(this.child.getModel(), oModel2, "model should be inherited from UIArea model");
		assert.equal(this.ctrl.getValue(), "2", "value should be inherited from UIArea model");
		assert.equal(this.child.getValue(), "2", "value should be inherited from UIArea model");

		// setting the same model again should have no effect
		var oCtrlBindingBefore = this.ctrl.getBinding("value");
		var oChildBindingBefore = this.child.getBinding("value");
		this.ctrl.setModel(oModel2);
		assert.ok(!this.mPropagationInfo[this.uiArea.getId()], "ModelContextChange event not fired on uiArea");
		assert.ok(!this.mPropagationInfo[this.ctrl.getId()], "ModelContextChange event not fired on ctrl");
		assert.ok(!this.mPropagationInfo[this.child.getId()], "ModelContextChange event not fired on child");
		this.mPropagationInfo = {};

		assert.equal(this.ctrl.getModel(), oModel2, "model should have been propagated from parent");
		assert.equal(this.child.getModel(), oModel2, "model should have been propagated from parent");
		assert.equal(this.ctrl.getValue(), "2", "value should be inherited from parent model");
		assert.equal(this.child.getValue(), "2", "value should be inherited from parent model");
		assert.ok(oCtrlBindingBefore === this.ctrl.getBinding("value"), "binding should not have changed");
		assert.ok(oChildBindingBefore === this.child.getBinding("value"), "binding should not have changed");

		// model change in UIArea should not be reflected in child
		this.uiArea.setModel(oModel3);
		assert.ok(this.mPropagationInfo[this.uiArea.getId()] === 1, "ModelContextChange event on uiArea");
		assert.ok(this.mPropagationInfo[this.ctrl.getId()] === 1, "ModelContextChange event on ctrl");
		assert.ok(this.mPropagationInfo[this.child.getId()] === 1, "ModelContextChange event on child");
		this.mPropagationInfo = {};

		assert.equal(this.ctrl.getModel(), oModel2, "model should have been propagated from parent");
		assert.equal(this.child.getModel(), oModel2, "model should have been propagated from parent");
		assert.equal(this.ctrl.getValue(), "2", "value should be inherited from parent model");
		assert.equal(this.child.getValue(), "2", "value should be inherited from parent model");
		assert.ok(oCtrlBindingBefore === this.ctrl.getBinding("value"), "binding should not have changed");
		assert.ok(oChildBindingBefore === this.child.getBinding("value"), "binding should not have changed");

		// model change in Core should not be reflected in child
		this.uiArea.setModel(oModel3);
		assert.ok(!this.mPropagationInfo[this.uiArea.getId()], "ModelContextChange event not fired on uiArea");
		assert.ok(!this.mPropagationInfo[this.ctrl.getId()], "ModelContextChange event not fired on ctrl");
		assert.ok(!this.mPropagationInfo[this.child.getId()], "ModelContextChange event not fired on child");
		this.mPropagationInfo = {};

		assert.equal(this.ctrl.getModel(), oModel2, "model should have been propagated from parent");
		assert.equal(this.child.getModel(), oModel2, "model should have been propagated from parent");
		assert.equal(this.ctrl.getValue(), "2", "value should be inherited from parent model");
		assert.equal(this.child.getValue(), "2", "value should be inherited from parent model");
		assert.ok(oCtrlBindingBefore === this.ctrl.getBinding("value"), "binding should not have changed");
		assert.ok(oChildBindingBefore === this.child.getBinding("value"), "binding should not have changed");

		// model change in parent should be reflected in child
		this.ctrl.setModel(oModel3);
		assert.ok(!this.mPropagationInfo[this.uiArea.getId()], "ModelContextChange event not fired on uiArea");
		assert.ok(this.mPropagationInfo[this.ctrl.getId()] === 1, "ModelContextChange event fired on ctrl");
		assert.ok(this.mPropagationInfo[this.child.getId()] === 1, "ModelContextChange event fired on child");
		this.mPropagationInfo = {};

		assert.equal(this.ctrl.getModel(), oModel3, "model should have been propagated from parent");
		assert.equal(this.child.getModel(), oModel3, "model should have been propagated from parent");
		assert.equal(this.ctrl.getValue(), "3", "value should be inherited from parent model");
		assert.equal(this.child.getValue(), "3", "value should be inherited from parent model");
		assert.ok(oCtrlBindingBefore !== this.ctrl.getBinding("value"), "binding should have changed");
		assert.ok(oChildBindingBefore !== this.child.getBinding("value"), "binding should have changed");

		// after removing the model from the parent, UIArea model should be effective again
		oCtrlBindingBefore = this.ctrl.getBinding("value");
		oChildBindingBefore = this.child.getBinding("value");
		this.ctrl.setModel();
		assert.ok(!this.mPropagationInfo[this.uiArea.getId()], "ModelContextChange event not fired on uiArea");
		assert.ok(this.mPropagationInfo[this.ctrl.getId()] === 1, "ModelContextChange event fired on ctrl");
		assert.ok(this.mPropagationInfo[this.child.getId()] === 1, "ModelContextChange event fired on child");
		this.mPropagationInfo = {};

		assert.equal(this.ctrl.getModel(), oModel3, "model should have been propagated from UIArea");
		assert.equal(this.child.getModel(), oModel3, "model should have been propagated from UIArea");
		assert.equal(this.ctrl.getValue(), "3", "value should be inherited from UIArea model");
		assert.equal(this.child.getValue(), "3", "value should be inherited from UIArea model");
		assert.ok(oCtrlBindingBefore === this.ctrl.getBinding("value"), "binding should not have changed");
		assert.ok(oChildBindingBefore === this.child.getBinding("value"), "binding should not have changed");
	});

	QUnit.test("Model propagated from UIArea", function(assert){
		assert.ok(this.mPropagationInfo[this.uiArea.getId()] === 1, "ModelContextChange event on uiArea");
		assert.ok(this.mPropagationInfo[this.ctrl.getId()] === 1, "ModelContextChange event on ctrl");
		assert.ok(this.mPropagationInfo[this.child.getId()] === 1, "ModelContextChange event on child");
		this.mPropagationInfo = {};

		this.ctrl.setModel(oModel2);
		assert.ok(!this.mPropagationInfo[this.uiArea.getId()], "ModelContextChange event not fired on uiArea");
		assert.ok(this.mPropagationInfo[this.ctrl.getId()] === 1, "ModelContextChange event on ctrl");
		assert.ok(this.mPropagationInfo[this.child.getId()] === 1, "ModelContextChange event on child");
		this.mPropagationInfo = {};

		assert.equal(this.ctrl.getValue(), "2", "value should not be inherited from core model ");
	});

	QUnit.test("override core model", function(assert){
		assert.ok(this.mPropagationInfo[this.uiArea.getId()] === 1, "ModelContextChange event on uiArea");
		assert.ok(this.mPropagationInfo[this.ctrl.getId()] === 1, "ModelContextChange event on ctrl");
		assert.ok(this.mPropagationInfo[this.child.getId()] === 1, "ModelContextChange event on child");
		this.mPropagationInfo = {};

		this.ctrl.setModel(oModel2);
		assert.ok(!this.mPropagationInfo[this.uiArea.getId()], "ModelContextChange event not fired on uiArea");
		assert.ok(this.mPropagationInfo[this.ctrl.getId()] === 1, "ModelContextChange event on ctrl");
		assert.ok(this.mPropagationInfo[this.child.getId()] === 1, "ModelContextChange event on child");
		this.mPropagationInfo = {};

		var oBindingBefore = this.ctrl.getBinding("value");
		this.uiArea.setModel(oModel3);
		assert.ok(this.mPropagationInfo[this.uiArea.getId()] === 1, "ModelContextChange event on uiArea");
		assert.ok(this.mPropagationInfo[this.ctrl.getId()] === 1, "ModelContextChange event on ctrl");
		assert.ok(this.mPropagationInfo[this.child.getId()] === 1, "ModelContextChange event on child");
		this.mPropagationInfo = {};

		var oBindingAfter = this.ctrl.getBinding("value");
		assert.equal(this.ctrl.getValue(), "2", "value still should not be inherited from core model ");
		assert.ok(oBindingBefore === oBindingAfter, "binding should not change as it is not affected");
	});

	QUnit.test("remove content from uiArea: no models set", function(assert){
		var done = assert.async();
		this.uiArea.setModel();
		this.mPropagationInfo = {};

		var content = this.uiArea.removeAllContent();
		assert.ok(!this.mPropagationInfo[this.uiArea.getId()], "ModelContextChange event not fired on uiArea");
		assert.ok(!this.mPropagationInfo[this.ctrl.getId()], "ModelContextChange event not fired on ctrl");
		assert.ok(!this.mPropagationInfo[this.child.getId()], "ModelContextChange event not fired on child");
		this.mPropagationInfo = {};

		assert.ok(!this.ctrl.getModel(), "no model set on ctrl");
		assert.ok(!this.child.getModel(), "no model set on child");
		assert.ok(!this.uiArea.getModel(), "no model set on uiArea");

		this.uiArea.setModel(oModel3);
		assert.ok(this.mPropagationInfo[this.uiArea.getId()] === 1, "ModelContextChange event on uiArea");
		assert.ok(!this.mPropagationInfo[this.ctrl.getId()], "ModelContextChange event not fired on ctrl");
		assert.ok(!this.mPropagationInfo[this.child.getId()], "ModelContextChange event not fired on child");
		this.mPropagationInfo = {};

		this.uiArea.addContent(content[0]);
		assert.ok(!this.mPropagationInfo[this.uiArea.getId()], "ModelContextChange event not fired on uiArea");
		assert.ok(this.mPropagationInfo[this.ctrl.getId()] === 1, "ModelContextChange event on ctrl");
		assert.ok(this.mPropagationInfo[this.child.getId()] === 1, "ModelContextChange event on child");
		this.mPropagationInfo = {};

		assert.equal(this.ctrl.getModel(), oModel3, "model should have been propagated from UIArea");
		assert.equal(this.child.getModel(), oModel3, "model should have been propagated from control");
		assert.equal(this.uiArea.getModel(), oModel3, "model should have been propagated from core");

		this.ctrl.removeAllChildren();
		assert.ok(!this.mPropagationInfo[this.uiArea.getId()], "ModelContextChange event not fired on uiArea");
		assert.ok(!this.mPropagationInfo[this.ctrl.getId()], "ModelContextChange event not fired on ctrl");
		assert.ok(!this.mPropagationInfo[this.child.getId()], "ModelContextChange event not fire on child - should happen async");
		this.mPropagationInfo = {};
		setTimeout(function() {
			assert.ok(!this.mPropagationInfo[this.uiArea.getId()], "ModelContextChange event not fired on uiArea");
			assert.ok(!this.mPropagationInfo[this.ctrl.getId()], "ModelContextChange event not fired on ctrl");
			assert.ok(this.mPropagationInfo[this.child.getId()] === 1, "ModelContextChange event on child - should happen async");
			done();
		}.bind(this),0);
	});

	QUnit.test("remove content from uiArea: model set", function(assert){

		this.uiArea.removeContent();
		assert.ok(this.mPropagationInfo[this.uiArea.getId()] === 1, "ModelContextChange event on uiArea");
		assert.ok(this.mPropagationInfo[this.ctrl.getId()] === 1, "ModelContextChange event on ctrl");
		assert.ok(this.mPropagationInfo[this.child.getId()] === 1, "ModelContextChange event on child");
		this.mPropagationInfo = {};
	});

	QUnit.test("Move child / remove child: async setParent null propagation", function(assert) {
		var done = assert.async();
		//remove from parent
		var moveCtrl = this.uiArea.removeContent(this.ctrl);

		// check for expected modifications: not yet propagated
		assert.ok(this.child.getParent() != null, "parent shouldn't be null");
		assert.ok(this.ctrl.getParent() == null, "parent should be null");
		assert.ok(this.child.getModel() != null, "child should have a default model");
		assert.ok(this.ctrl.getModel() == null, "ctrl should have no model");
		assert.ok(this.child.getBinding("value") != null, "child should have a binding for the default model");
		assert.ok(this.child.oPropagatedProperties !== this.ctrl.oPropagatedProperties, "child should no longer inherit propagatedProperties 1:1 from ctrl");
		assert.ok(this.ctrl.oPropagatedProperties === ManagedObject._oEmptyPropagatedProperties, "ctrl has no propagated properties");

		//simulate a move by sync adding the control again
		this.uiArea.addContent(moveCtrl);

		setTimeout(function() {
			// check for expected modifications
			assert.ok(this.child.getParent() != null, "parent shouldn't be null");
			assert.ok(this.ctrl.getParent() != null, "parent shouldn't be null");
			assert.ok(this.child.getModel() != null, "child should have a default model");
			assert.ok(this.ctrl.getModel() != null, "ctrl should have a default model");
			assert.ok(this.child.getBinding("value") != null, "child should have a binding for the default model");
			assert.ok(this.child.oPropagatedProperties === this.ctrl.oPropagatedProperties, "child should no longer inherit propagatedProperties 1:1 from ctrl");

			// remove from parent - no move
			this.uiArea.removeContent(this.ctrl);
			// check for expected modifications: not yet propagated
			assert.ok(this.child.getParent() != null, "parent shouldn't be null");
			assert.ok(this.ctrl.getParent() == null, "parent should be null");
			assert.ok(this.child.getModel() != null, "child should have a default model");
			assert.ok(this.ctrl.getModel() == null, "ctrl should have no model");
			assert.ok(this.child.getBinding("value") != null, "child should have a binding for the default model");
			assert.ok(this.child.oPropagatedProperties !== this.ctrl.oPropagatedProperties, "child should no longer inherit propagatedProperties 1:1 from ctrl");
			assert.ok(this.ctrl.oPropagatedProperties === ManagedObject._oEmptyPropagatedProperties, "ctrl has no propagated properties");

			setTimeout(function() {
				// check for expected modifications: async propagation done
				assert.ok(this.ctrl.getParent() == null, "parent should be null");
				assert.ok(this.child.getModel() == null, "child shouldn't have a default model");
				assert.ok(this.ctrl.getModel() == null, "ctrl shouldn't have a default model");
				assert.ok(this.child.getBinding("value") == null, "child shouldn't have a binding for the default model");
				assert.ok(this.child.oPropagatedProperties === ManagedObject._oEmptyPropagatedProperties, "child should no longer inherit propagatedProperties 1:1 from ctrl");
				assert.ok(this.ctrl.oPropagatedProperties === ManagedObject._oEmptyPropagatedProperties, "ctrl should no longer inherit propagatedProperties 1:1 from ctrl");
				done();
			}.bind(this), 0);
		}.bind(this), 0);
	});

	QUnit.module("More Complex Updates", {
		beforeEach : function() {
			new Control().placeAt("content").destroy();
			this.uiArea = UIAreaRegistry.get("content");
			this.uiArea.setModel(oModel1);
			this.child = new TestControl({
				value : { parts : [ "/value", "m2>/value" ], formatter : function(a,b) { return a + ":" + b; } },
				other : "{m2>/value}"
			});
			this.ctrl = new TestControl({
				value : { parts : [ "m2>/value", "/value" ], formatter : function(a,b) { return a + ":" + b; } },
				other : "{/value}",
				children : [this.child]
			});
			this.ctrl.placeAt("content");
		},

		afterEach : function() {
			this.uiArea.setModel(null, "m2");
			this.ctrl.destroy();
			this.ctrl = null;
			this.child = null;
		}
	});

	QUnit.test("incomplete binding context", function(assert){
		assert.ok(!!this.ctrl.getBindingInfo("value"), "control should have binding info for 'value'");
		assert.ok(!this.ctrl.getBinding("value"), "control must not have a binding for 'value'");
		assert.ok(!!this.ctrl.getBindingInfo("other"), "control should have binding info for 'other'");
		assert.ok(!!this.ctrl.getBinding("other"), "control should have a binding for 'other'");
		assert.ok(!!this.child.getBindingInfo("value"), "child should have binding info");
		assert.ok(!this.child.getBinding("value"), "child must not have a binding for 'value'");
		assert.ok(!!this.child.getBindingInfo("other"), "child should have binding info for 'other'");
		assert.ok(!this.child.getBinding("other"), "child must not have a binding for 'other'");
		this.uiArea.setModel(oModel2, "m2");
		assert.ok(!!this.ctrl.getBinding("value"), "control now should have a binding");
		assert.ok(!!this.ctrl.getBinding("other"), "control now should have a binding");
		assert.ok(!!this.child.getBinding("value"), "child now should have a binding");
		assert.ok(!!this.child.getBinding("other"), "child now should have a binding");
		this.uiArea.setModel(null);
		assert.ok(!this.ctrl.getBinding("value"), "control should no longer have a binding for 'value'");
		assert.ok(!this.ctrl.getBinding("other"), "control should no longer have a binding for 'other'");
		assert.ok(!this.child.getBinding("value"), "child should no longer have a binding for 'value'");
		assert.ok(!!this.child.getBinding("other"), "child still should have a binding for 'other'");
		this.ctrl.setModel(oModel1);
		assert.ok(!!this.ctrl.getBinding("value"), "control now should have a binding");
		assert.ok(!!this.ctrl.getBinding("other"), "control now should have a binding");
		assert.ok(!!this.child.getBinding("value"), "child now should have a binding");
		assert.ok(!!this.child.getBinding("other"), "child now should have a binding");
	});

	QUnit.test("Multiple References to Same Model", function(assert) {

		// default model and m2 are set to the same model instance
		this.uiArea.setModel(oModel1, "m2");
		// bindings should be complete now
		assert.ok(!!this.ctrl.getBindingInfo("value"), "control should have binding info for 'value'");
		assert.ok(!!this.ctrl.getBinding("value"), "control should have a binding for 'value'");
		assert.ok(!!this.ctrl.getBindingInfo("other"), "control should have binding info for 'other'");
		assert.ok(!!this.ctrl.getBinding("other"), "control should have a binding for 'other'");
		assert.ok(!!this.child.getBindingInfo("value"), "child should have binding info for 'value'");
		assert.ok(!!this.child.getBinding("value"), "child should have a binding for 'value'");
		assert.ok(!!this.child.getBindingInfo("other"), "child should have binding info for 'other'");
		assert.ok(!!this.child.getBinding("other"), "child should have a binding for 'other'");

		// now remove one instance (the named one)
		this.uiArea.setModel(null, "m2");

		// only bindings that used m2 must be invalidated
		assert.ok(!this.ctrl.getBinding("value"), "control must not have a binding for 'value'");
		assert.ok(!!this.ctrl.getBinding("other"), "control still should have a binding for 'other");
		assert.ok(!this.child.getBinding("value"), "child must not have a binding for 'value'");
		assert.ok(!this.child.getBinding("other"), "child must not have a binding for 'other'");
	});

	QUnit.test("Remove from Parent", function(assert) {
		//check preconditions
		assert.equal(this.ctrl.getModel(), oModel1, "ctrl should inherit model1 from Core");
		assert.equal(this.child.getModel(), oModel1, "child should inherit model1 from ctrl");
		assert.ok(this.child.oPropagatedProperties === this.ctrl.oPropagatedProperties, "child should inherit propagatedProperties 1:1 from ctrl");

		// now remove from parent
		this.ctrl.removeChild(this.child);

		// check for expected modifications
		assert.ok(this.child.getParent() == null, "parent should be null");
		assert.ok(this.child.getModel() == null, "child shouldn't have a default model");
		assert.ok(this.child.getBinding("value") == null, "child shouldn't have a binding for the default model");
		assert.ok(this.child.oPropagatedProperties !== this.ctrl.oPropagatedProperties, "child should no longer inherit propagatedProperties 1:1 from ctrl");
	});

	QUnit.test("Changing Parent", function(assert) {
		var oNewParent = new TestControl({
			value : { parts : [ "m2>/value", "/value" ], formatter : function(a,b) { return a + ":" + b; } },
			other : "{/value}"
		});
		oNewParent.setModel(oModel2);

		//check preconditions
		assert.equal(this.ctrl.getModel(), oModel1, "ctrl should inherit model1 from Core");
		assert.equal(this.child.getModel(), oModel1, "child should inherit model1 from ctrl");
		assert.ok(this.child.oPropagatedProperties === this.ctrl.oPropagatedProperties, "child should inherit propagatedProperties 1:1 from ctrl");

		// now modify parent
		oNewParent.addChild(this.child);

		// check for expected modifications
		assert.ok(this.child.getParent() === oNewParent, "parent should have changed");
		assert.equal(this.child.getModel(), oModel2, "child should inherit model1 from newParent");
		assert.ok(this.ctrl.getModel() === oModel1, "ctrl still should inherit model from Core");
		assert.ok(this.child.oPropagatedProperties !== this.ctrl.oPropagatedProperties, "child should no longer inherit propagatedProperties 1:1 from ctrl");
	});

	QUnit.module("Context Binding", {
		beforeEach : function() {
			this.mPropagationInfo = {};
			this.fnChange = function(oEvent) {
				if (this.mPropagationInfo[oEvent.getSource().getId()]) {
					this.mPropagationInfo[oEvent.getSource().getId()]++;
				 } else {
					 this.mPropagationInfo[oEvent.getSource().getId()] = 1;
				 }
			}.bind(this);
			new Control().placeAt("content").destroy();
			this.uiArea =  UIAreaRegistry.get("content");
			this.uiArea.attachModelContextChange(this.fnChange);

			this.uiArea.setModel(oModel4);

			this.child = new TestControl({
				value : "{}"
			});
			this.child.attachModelContextChange(this.fnChange);
			this.ctrl = new TestControl({
				value : "{}",
				children : [this.child]
			});
			this.ctrl.attachModelContextChange(this.fnChange);
			this.ctrl.placeAt("content");
		},

		afterEach : function() {
			this.uiArea.setModel(null);
			this.ctrl.destroy();
			this.ctrl = null;
			this.child = null;
		}
	});
/*
	QUnit.test("Binding/Model types", function(assert) {
		var done = assert.async();
		oModel5.metadataLoaded().then(function(){
			var child = new TestControl({
				objectBindings: "Suppliers(1)",
				value: "{CompanyName}"

			});
			var ctrl = new TestControl({
				children : [child]
			});
			var spy = sinon.spy(oModel5, "read");
			ctrl.setModel(oModel4);
			child.setModel(oModel5);
			assert.ok(!child.getValue(), "Value should not be resolved");
			var oJSONContext = oModel4.createBindingContext("/");
			child.setBindingContext(oJSONContext);
			assert.ok(spy.callCount === 0, "no request should be sent");
			oModel5.read.restore();
			done();
		});
	});
*/
	QUnit.test("Binding/Model types 2", function(assert) {
		var done = assert.async();
		oModel5.metadataLoaded().then(function(){
			var ctrl3 = new TestControl({
				objectBindings: "Suppliers(1)",
				value: "{CompanyName}"
			});
			var ctrl2 = new TestControl({
				models: oModel5,
				children: [ctrl3]
			});
			var ctrl = new TestControl({
				children : [ctrl2]
			});

			var spy = sinon.spy(oModel5, "read");
			ctrl.setModel(oModel4);
			assert.ok(!ctrl3.getValue(), "Value should not be resolved");
			var oJSONContext = oModel4.createBindingContext("/");
			ctrl.setBindingContext(oJSONContext);
			assert.ok(spy.callCount === 0, "no request should be sent");
			oModel5.read.restore();
			done();
		});
	});

	QUnit.test("Context binding instance", function(assert) {
		this.mPropagationInfo = {};
		this.ctrl.bindElement("/data");
		assert.ok(!this.mPropagationInfo[this.uiArea.getId()], "ModelContextChange event not fired on uiArea");
		assert.ok(this.mPropagationInfo[this.ctrl.getId()] === 1, "ModelContextChange event fired on ctrl");
		assert.ok(this.mPropagationInfo[this.child.getId()] === 1, "ModelContextChange event fired on child");
		this.mPropagationInfo = {};

		assert.ok(this.ctrl.getElementBinding() instanceof ContextBinding, "ContextBinding should exist");
		assert.ok(this.child.getBindingContext() === this.ctrl.getBindingContext(), "Context should be propagated");
		assert.ok(this.child.getBindingContext().getPath() === "/data", "Context path should be '/data'");

		this.ctrl.unbindElement();
		assert.ok(!this.mPropagationInfo[this.uiArea.getId()], "ModelContextChange event not fired on uiArea");
		assert.ok(this.mPropagationInfo[this.ctrl.getId()] === 1, "ModelContextChange event fired on ctrl");
		assert.ok(this.mPropagationInfo[this.child.getId()] === 1, "ModelContextChange event fired on child");
		this.mPropagationInfo = {};

		assert.ok(!this.ctrl.getElementBinding(), "ContextBinding should be deleted");
		assert.ok(!this.ctrl.getBindingContext(), "No binding context should exist");
		assert.ok(!this.child.getBindingContext(), "No binding context should exist");

		this.ctrl.bindElement("/nodata");
		assert.ok(!this.mPropagationInfo[this.uiArea.getId()], "ModelContextChange event not fired on uiArea");
		assert.ok(this.mPropagationInfo[this.ctrl.getId()] === 1, "ModelContextChange event fired on ctrl");
		assert.ok(this.mPropagationInfo[this.child.getId()] === 1, "ModelContextChange event fired on child");
		this.mPropagationInfo = {};

		assert.ok(this.child.getBindingContext().getPath() === "/nodata", "Context path should be '/nodata'");
		this.ctrl.bindElement("/data");
		assert.ok(!this.mPropagationInfo[this.uiArea.getId()], "ModelContextChange event not fired on uiArea");
		assert.ok(this.mPropagationInfo[this.ctrl.getId()] === 1, "ModelContextChange event fired on ctrl");
		assert.ok(this.mPropagationInfo[this.child.getId()] === 1, "ModelContextChange event fired on child");
		this.mPropagationInfo = {};

		assert.ok(this.child.getBindingContext().getPath() === "/data", "Context path should be '/data'");
	});
	QUnit.test("Context binding values", function(assert) {
		this.ctrl.bindElement("/data/0/");
		assert.ok(this.child.getValue() === "0", "Value should be resolved");
		this.ctrl.bindElement("/data/2/");
		assert.ok(this.child.getValue() === "2", "Value should be resolved");
		this.ctrl.unbindElement();
		assert.ok(!this.child.getValue(), "Value should be cleared");
	});
});