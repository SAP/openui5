/* global QUnit, sinon*/
sap.ui.define([
	"sap/ui/core/Core", "sap/ui/mdc/Control", "test-resources/sap/ui/mdc/qunit/util/createAppEnvironment", "./TestChangeHandler", "sap/ui/core/util/reflection/JsControlTreeModifier", "sap/ui/mdc/AggregationBaseDelegate", "sap/ui/fl/write/api/ControlPersonalizationWriteAPI"
], function(Core, MDCControl, createAppEnvironment, TestChangeHandler, JsControlTreeModifier, AggregationBaseDelegate, ControlPersonalizationWriteAPI) {
	"use strict";

	/**
	* The ItemBaseFlex is the central change handler to manage a mdc controls
	* default aggregation (e.g. columns, items, filterItems) and in the following
	* used with a custom control implementation. Control specific tests can be found
	* in TableFlex, ChartFlex & FilterBarFlex
	*/
	var TestClass = MDCControl.extend("sap.ui.mdc.FlexTestControl", {
		metadata: {
			defaultAggregation: "items",
			interfaces: [
				"sap.ui.mdc.IxState"
			],
			aggregations: {
				items: {
					type: "sap.ui.core.Control",
					multiple: true
				}
			}
		},
		initialized: function() {
			return Promise.resolve();
		}
	});

	QUnit.module("Generic Tests", {

		oTestContent: {
			name: "testAggregationControl1"
		},

		beforeEach: function() {

			//Create a new instance of a test control
			this.oFlexTestControl = new TestClass("FlexTestControl", {
				items: [
					new MDCControl("testAggregationControl1"),
					new MDCControl("testAggregationControl2")
				],
				delegate: {
					name: "sap/ui/mdc/AggregationBaseDelegate",
					payload: {}
				}
			});

			var sTestView = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.mdc"></mvc:View>';

			//as the ItembaseFlex is expectign a delegate to handle the add/remove logic, a custom needs to be implemented for this test
			sinon.stub(AggregationBaseDelegate, "addItem").returns(
				Promise.resolve(new MDCControl())
			);

			//Create the app environment for flex related processing
			return createAppEnvironment(sTestView, "ItemBaseFlexTest").then(function(mCreatedApp){
				this.oView = mCreatedApp.view;
				this.oUiComponentContainer = mCreatedApp.container;
				this.oUiComponentContainer.placeAt("qunit-fixture");
				this.oView.addContent(this.oFlexTestControl);

				Core.applyChanges();

				//add
				this.oAddChangeHandler = TestChangeHandler.add.changeHandler;
				this.fApplyAdd = this.oAddChangeHandler.applyChange;
				this.fRevertAdd = this.oAddChangeHandler.revertChange;

				//remove
				this.oRemoveChangeHandler = TestChangeHandler.remove.changeHandler;
				this.fApplyRemove = this.oRemoveChangeHandler.applyChange;
				this.fRevertRemove = this.oRemoveChangeHandler.revertChange;

				//move
				this.oMoveChangeHandler = TestChangeHandler.move.changeHandler;
				this.fApplyMove = this.oMoveChangeHandler.applyChange;
				this.fRevertMove = this.oMoveChangeHandler.revertChange;
			}.bind(this));

		},

		afterEach: function() {
			this.oView.destroy();
			this.oUiComponentContainer.destroy();
			AggregationBaseDelegate.addItem.restore();
			this.oFlexTestControl.destroy();
		}

	});

	QUnit.test("Check _applyAdd --> item should be added", function(assert){

		var done = assert.async();

		//Note: better use ChangesWriteAPI.create, but we can not register change handlers programatically
		var oChange = {
			getChangeType: function() {
				return "add";
			},
			getContent: function() {
				return {
					name: "testAggregationControl3"
				};
			},
			setRevertData: function() {}
		};

		this.fApplyAdd(oChange, this.oFlexTestControl, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		}).then(function(){

			assert.equal(this.oFlexTestControl.getItems().length, 3, "The changehandler resolves and the item has been added");
			done();

		}.bind(this));

	});

	QUnit.test("Check _applyAdd (but the item is already present in the control tree) --> item should not be added", function(assert){

		var done = assert.async();

		//Note: better use ChangesWriteAPI.create, but we can not register change handlers programatically
		var oChange = {
			getChangeType: function() {
				return "add";
			},
			getContent: function() {
				return {
					name: "testAggregationControl1"
				};
			},
			setRevertData: function() {}
		};

		this.fApplyAdd(oChange, this.oFlexTestControl, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		}).finally(function(){

			assert.equal(this.oFlexTestControl.getItems().length, 2, "The changehandler rejects and no additional item has been added");
			done();

		}.bind(this));
	});

	QUnit.test("Check _applyRemove --> item should be removed", function(assert){

		var done = assert.async();

		//Note: better use ChangesWriteAPI.create, but we can not register change handlers programatically
		var oChange = {
			getChangeType: function() {
				return "remove";
			},
			getContent: function() {
				return {
					name: "testAggregationControl1"
				};
			},
			setRevertData: function() {}
		};

		this.fApplyRemove(oChange, this.oFlexTestControl, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		}).then(function(){

			assert.equal(this.oFlexTestControl.getItems().length, 1, "The changehandler resolves and the item has been removed");
			done();

		}.bind(this));

	});

	QUnit.test("Check _applyRemove (but the item has already been removed from the control tree) --> item should be removed", function(assert){

		var done = assert.async();

		//Note: better use ChangesWriteAPI.create, but we can not register change handlers programatically
		var oChange = {
			getChangeType: function() {
				return "remove";
			},
			getContent: function() {
				return {
					name: "testAggregationControl1"
				};
			},
			setRevertData: function() {}
		};

		var oItem = this.oFlexTestControl.removeItem(this.oFlexTestControl.getItems()[0]);

		this.fApplyRemove(oChange, this.oFlexTestControl, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		}).finally(function(){

			assert.equal(this.oFlexTestControl.getItems().length, 1, "The changehandler resolves even though the item was already removed");
			this.oFlexTestControl.addItem(oItem);
			done();

		}.bind(this));

	});

	QUnit.test("Check _applyMove --> item should be moved", function(assert){

		var done = assert.async();

		//Note: better use ChangesWriteAPI.create, but we can not register change handlers programatically
		var oChange = {
			getChangeType: function() {
				return "move";
			},
			getContent: function() {
				return {
					name: "testAggregationControl1",
					index: 1
				};
			},
			setRevertData: function() {}
		};

		this.fApplyMove(oChange, this.oFlexTestControl, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		}).then(function(){

			assert.equal(this.oFlexTestControl.getItems().length, 2, "The changehandler resolves - item amount is unchanged");
			done();

		}.bind(this));

	});

	QUnit.test("Check duplicate add appliance --> react gracefully on second add", function(assert) {
		var done = assert.async();

		//Note: better use ChangesWriteAPI.create, but we can not register change handlers programatically
		var oChange = {
			getChangeType: function() {
				return "add";
			},
			getContent: function() {
				return {
					name: "testAggregationControl4"
				};
			},
			setRevertData: function() {}
		};

		this.fApplyAdd(oChange, this.oFlexTestControl, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		}).then(function(){

			this.fApplyAdd(oChange, this.oFlexTestControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView

				//explicitly check the reject case! --> In case a change handler rejects, the revert is not going to be triggered.
			}).then(undefined, function(){

				assert.equal(this.oFlexTestControl.getItems().length, 3, "The item has only been added once");
				done();

			}.bind(this));

		}.bind(this));
	});

	QUnit.test("Check duplicate remove appliance --> the second appliance should be skipped", function(assert){

		var done = assert.async();

		//Note: better use ChangesWriteAPI.create, but we can not register change handlers programatically
		var oChange = {
			getChangeType: function() {
				return "remove";
			},
			getContent: function() {
				return {
					name: "testAggregationControl2"
				};
			},
			setRevertData: function() {}
		};

		//the first remove should be properly executed
		this.fApplyRemove(oChange, this.oFlexTestControl, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		}).then(function(){

			//the second remove should reject --> no revert should be triggered afterwards
			this.fApplyRemove(oChange, this.oFlexTestControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView

				//explicitly check the reject case! --> In case a change handler rejects, the revert is not going to be triggered.
			}).then(undefined, function(){

				assert.equal(this.oFlexTestControl.getItems().length, 1, "The changehandler resolves even though the item was already removed");
				done();

			}.bind(this));

		}.bind(this));

	});

	QUnit.test("Check _applyMove on removed item --> do nothing and reject to prevent reverts", function(assert){

		var done = assert.async();

		var oRemoveChange = {
			getChangeType: function() {
				return "move";
			},
			getContent: function() {
				return {
					name: "testAggregationControl1"
				};
			},
			setRevertData: function() {}
		};

		var oMoveChange = {
			getChangeType: function() {
				return "move";
			},
			getContent: function() {
				return {
					name: "testAggregationControl1",
					index: 1
				};
			},
			setRevertData: function() {}
		};

		//the first remove should be properly executed
		this.fApplyRemove(oRemoveChange, this.oFlexTestControl, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		}).then(function(){


			this.fApplyMove(oMoveChange, this.oFlexTestControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(undefined, function(){

				assert.equal(this.oFlexTestControl.getItems().length, 1, "The item has not been moved - change rejected to not be reverted");
				done();

			}.bind(this));

		}.bind(this));


	});

});
