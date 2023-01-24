/* global QUnit */
sap.ui.define([
	"test-resources/sap/ui/mdc/qunit/util/createAppEnvironment", "sap/ui/mdc/flexibility/GroupFlex", "sap/ui/fl/write/api/ChangesWriteAPI", "sap/ui/core/util/reflection/JsControlTreeModifier", "sap/ui/core/Core"
], function(createAppEnvironment, GroupFlex, ChangesWriteAPI, JsControlTreeModifier, oCore) {
	"use strict";

	var fCreateaddGroupDefinition = function(){
		return {
			"changeType": "addGroup",
			"selector": {
				"id": "comp---view--myTable"
			},
			"content": {
				"name": "Category",
				"index": 0
			}
		};
	};

	var fCreateremoveGroupDefintion = function(){
		return {
			"changeType": "removeGroup",
			"selector": {
				"id": "comp---view--myTable"
			},
			"content": {
				"name": "Category",
				"index": 0
			}
		};
	};

	QUnit.module("change handlers", {
		beforeEach: function() {

			var sTableView = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.mdc" xmlns:mdcTable="sap.ui.mdc.table"><Table id="myTable"></Table></mvc:View>';

			return createAppEnvironment(sTableView, "Table").then(function(mCreatedApp){
				this.oView = mCreatedApp.view;
				this.oUiComponentContainer = mCreatedApp.container;
				this.oUiComponentContainer.placeAt("qunit-fixture");
				oCore.applyChanges();

				this.oTable = this.oView.byId('myTable');

				//addGroup
				this.faddGroup = GroupFlex.addGroup.changeHandler.applyChange;
				this.fRevertaddGroup = GroupFlex.addGroup.changeHandler.revertChange;

				//removeGroup
				this.fremoveGroup = GroupFlex.removeGroup.changeHandler.applyChange;
				this.fRevertremoveGroup = GroupFlex.removeGroup.changeHandler.revertChange;
			}.bind(this));
		},
		afterEach: function() {
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test("addGroup", function(assert) {
		var done = assert.async();
		var oContent = fCreateaddGroupDefinition();

		return ChangesWriteAPI.create({
			changeSpecificData: oContent,
			selector: this.oTable
		}).then(function(oChange) {

			this.faddGroup(oChange, this.oTable, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function(){

				var ogroupConditions = this.oTable.getGroupConditions();
				var aGroupings = ogroupConditions.groupLevels;

				assert.equal(aGroupings.length, 1, "one grouping has been created");
				assert.equal(aGroupings[0].name, "Category", "correct grouping has been created");

				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("removeGroup", function(assert) {
		var done = assert.async();
		var oAddContent = fCreateaddGroupDefinition();

		//create addGroup
		return ChangesWriteAPI.create({
			changeSpecificData: oAddContent,
			selector: this.oTable
		}).then(function(oChange) {

			this.faddGroup(oChange, this.oTable, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function(){

				var ogroupConditions = this.oTable.getGroupConditions();
				var aGroupings = ogroupConditions.groupLevels;

				assert.equal(aGroupings.length, 1, "one grouping has been created");
				assert.equal(aGroupings[0].name, "Category", "correct grouping has been created");

				//create removeGroup
				var oRemoveContent = fCreateremoveGroupDefintion();
				return ChangesWriteAPI.create({
					changeSpecificData: oRemoveContent,
					selector: this.oTable
				}).then(function(oChange) {

					this.fremoveGroup(oChange, this.oTable, {
						modifier: JsControlTreeModifier,
						appComponent: this.oUiComponent,
						view: this.oView
					}).then(function(){

						ogroupConditions = this.oTable.getGroupConditions();

						assert.equal(ogroupConditions.groupLevels.length, 0, "group conditions contains an empty array");

						done();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("removeGroup (for a grouping that does not exist) with a different existing grouping", function(assert) {
		var done = assert.async();
		var oAddContent = fCreateaddGroupDefinition();

		//create addGroup
		return ChangesWriteAPI.create({
			changeSpecificData: oAddContent,
			selector: this.oTable
		}).then(function(oChange) {

			this.faddGroup(oChange, this.oTable, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function(){

				var ogroupConditions = this.oTable.getGroupConditions();
				var aGroupings = ogroupConditions.groupLevels;

				assert.equal(aGroupings.length, 1, "one grouping has been created");
				assert.equal(aGroupings[0].name, "Category", "correct grouping has been created");

				//create removeGroup
				var oRemoveContent = {
					changeType: "removeGroup",
					selector: {
						id: "comp---view--myTable"
					},
					content: {
						name: "someNonExistingPropertyName"
					}
				};
				return ChangesWriteAPI.create({
					changeSpecificData: oRemoveContent,
					selector: this.oTable
				}).then(function(oChange) {

					this.fremoveGroup(oChange, this.oTable, {
						modifier: JsControlTreeModifier,
						appComponent: this.oUiComponent,
						view: this.oView
					}).finally(function(){

						ogroupConditions = this.oTable.getGroupConditions();

						//Check that the false change has been ignored gracefully, the further appliance and chain of appliance works as expected
						assert.equal(ogroupConditions.groupLevels.length, 1, "group conditions still contains the earlier existing grouping");

						done();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("apply and revert 'removeGroup' with exisiting groupConditions", function(assert) {
		var done = assert.async();

		this.oTable.setGroupConditions({
			groupLevels: [
				{
					"name": "Category"
				}
			]
		});

		var oInitialgroupConditions = this.oTable.getGroupConditions();

		//create removeGroup
		var oRemoveContent = fCreateremoveGroupDefintion();
		return ChangesWriteAPI.create({
			changeSpecificData: oRemoveContent,
			selector: this.oTable
		}).then(function(oChange) {

			//apply 'removeGroup'
			this.fremoveGroup(oChange, this.oTable, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function(){

				//existing group condition removed
				var ogroupConditions = this.oTable.getGroupConditions();
				assert.equal(ogroupConditions.groupLevels.length, 0, "no groupLevels - group has been removed");

				//revert 'removeGroup'
				this.fRevertremoveGroup(oChange, this.oTable, {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				}).then(function(){

					//groupConditions should be similar to the initial state
					var oCurrentgroupConditions = this.oTable.getGroupConditions();
					assert.deepEqual(oCurrentgroupConditions, oInitialgroupConditions, "grouping has been reverted and is available again");

				}.bind(this));

				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("apply and revert 'addGroup'", function(assert) {
		var done = assert.async();

		//create removeGroup
		var oRemoveContent = fCreateaddGroupDefinition();
		return ChangesWriteAPI.create({
			changeSpecificData: oRemoveContent,
			selector: this.oTable
		}).then(function(oChange) {

			//apply 'removeGroup'
			this.faddGroup(oChange, this.oTable, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function(){

				//existing group condition removed
				var ogroupConditions = this.oTable.getGroupConditions();
				assert.equal(ogroupConditions.groupLevels.length, 1, "grouping added");

				//revert 'removeGroup'
				this.fRevertaddGroup(oChange, this.oTable, {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				}).then(function(){

					//'addGroup' reverted --> no groupLevels
					var ogroupConditions = this.oTable.getGroupConditions();
					assert.equal(ogroupConditions.groupLevels.length, 0, "no grouping available - addGroup successfully reverted");

				}.bind(this));

				done();
			}.bind(this));
		}.bind(this));
	});

});
