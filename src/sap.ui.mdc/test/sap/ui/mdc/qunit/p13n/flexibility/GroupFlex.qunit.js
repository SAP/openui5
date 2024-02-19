/* global QUnit */
sap.ui.define([
	"test-resources/sap/ui/mdc/qunit/util/createAppEnvironment", "sap/ui/mdc/flexibility/GroupFlex", "sap/ui/fl/write/api/ChangesWriteAPI", "sap/ui/core/util/reflection/JsControlTreeModifier", "sap/ui/qunit/utils/nextUIUpdate"
], function(createAppEnvironment, GroupFlex, ChangesWriteAPI, JsControlTreeModifier, nextUIUpdate) {
	"use strict";

	const fCreateaddGroupDefinition = function(){
		return {
			"changeType": "addGroup",
			"selector": {
				"id": "comp---view--myTable"
			},
			"content": {
				"key": "Category",
				"index": 0
			}
		};
	};

	const fCreateremoveGroupDefintion = function(){
		return {
			"changeType": "removeGroup",
			"selector": {
				"id": "comp---view--myTable"
			},
			"content": {
				"key": "Category",
				"index": 0
			}
		};
	};

	QUnit.module("change handlers", {
		beforeEach: function() {

			const sTableView = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.mdc" xmlns:mdcTable="sap.ui.mdc.table"><Table id="myTable"></Table></mvc:View>';

			return createAppEnvironment(sTableView, "Table").then(async function(mCreatedApp){
				this.oView = mCreatedApp.view;
				this.oUiComponentContainer = mCreatedApp.container;
				this.oUiComponentContainer.placeAt("qunit-fixture");
				await nextUIUpdate();

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
		const done = assert.async();
		const oContent = fCreateaddGroupDefinition();

		return ChangesWriteAPI.create({
			changeSpecificData: oContent,
			selector: this.oTable
		}).then(function(oChange) {

			this.faddGroup(oChange, this.oTable, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function(){

				const ogroupConditions = this.oTable.getGroupConditions();
				const aGroupings = ogroupConditions.groupLevels;

				assert.equal(aGroupings.length, 1, "one grouping has been created");
				assert.equal(aGroupings[0].key, "Category", "correct grouping has been created");

				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("removeGroup", function(assert) {
		const done = assert.async();
		const oAddContent = fCreateaddGroupDefinition();

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

				let ogroupConditions = this.oTable.getGroupConditions();
				const aGroupings = ogroupConditions.groupLevels;

				assert.equal(aGroupings.length, 1, "one grouping has been created");
				assert.equal(aGroupings[0].key, "Category", "correct grouping has been created");

				//create removeGroup
				const oRemoveContent = fCreateremoveGroupDefintion();
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
		const done = assert.async();
		const oAddContent = fCreateaddGroupDefinition();

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

				let ogroupConditions = this.oTable.getGroupConditions();
				const aGroupings = ogroupConditions.groupLevels;

				assert.equal(aGroupings.length, 1, "one grouping has been created");
				assert.equal(aGroupings[0].key, "Category", "correct grouping has been created");

				//create removeGroup
				const oRemoveContent = {
					changeType: "removeGroup",
					selector: {
						id: "comp---view--myTable"
					},
					content: {
						key: "someNonExistingPropertyName"
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
		const done = assert.async();

		this.oTable.setGroupConditions({
			groupLevels: [
				{
					"key": "Category"
				}
			]
		});

		const oInitialgroupConditions = this.oTable.getGroupConditions();

		//create removeGroup
		const oRemoveContent = fCreateremoveGroupDefintion();
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
				const ogroupConditions = this.oTable.getGroupConditions();
				assert.equal(ogroupConditions.groupLevels.length, 0, "no groupLevels - group has been removed");

				//revert 'removeGroup'
				this.fRevertremoveGroup(oChange, this.oTable, {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				}).then(function(){

					//groupConditions should be similar to the initial state
					const oCurrentgroupConditions = this.oTable.getGroupConditions();
					assert.deepEqual(oCurrentgroupConditions, oInitialgroupConditions, "grouping has been reverted and is available again");

				}.bind(this));

				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("apply and revert 'addGroup'", function(assert) {
		const done = assert.async();

		//create removeGroup
		const oRemoveContent = fCreateaddGroupDefinition();
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
				const ogroupConditions = this.oTable.getGroupConditions();
				assert.equal(ogroupConditions.groupLevels.length, 1, "grouping added");

				//revert 'removeGroup'
				this.fRevertaddGroup(oChange, this.oTable, {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				}).then(function(){

					//'addGroup' reverted --> no groupLevels
					const ogroupConditions = this.oTable.getGroupConditions();
					assert.equal(ogroupConditions.groupLevels.length, 0, "no grouping available - addGroup successfully reverted");

				}.bind(this));

				done();
			}.bind(this));
		}.bind(this));
	});

});
