/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/fl/changeHandler/ChangeHandlerMediator'
],
function(
	ChangeHandlerMediator
) {
	'use strict';
	QUnit.start();

	QUnit.module('Given some Change Handlers with parameters...', {
		beforeEach: function(assert) {

			this.sAddFieldChangeHandler = "addField";
			this.sAddColumnChangeHandler = "addColumn";
			this.sModel = "ODataV2";

			this.mAddFieldParameters = {
				"requiredLibraries" : {
					"sap.ui.comp": {
						"minVersion": "1.48",
						"lazy": "false"
					}
				},
				"appContext" : "AddFieldContext",
				"create" : function() {
					return {
						"label" : {},
						"control" : {}
					};
				}
			};

			this.mAddColumnParameters = {
				"requiredLibraries" : {},
				"create" : function() {
					return {
						"label" : "testLabel",
						"control" : {}
					};
				}
			};

			this.mUpdatedAddColumnParameters = {
				"requiredLibraries" : {},
				"create" : function() {
					return {
						"label" : "newTestLabel",
						"control" : {}
					};
				}
			};

		},

		afterEach: function() {
		}
	});

	QUnit.test('when adding change handlers to the mediator...', function(assert) {

		assert.throws(function(){
			ChangeHandlerMediator.addChangeHandler(this.sAddFieldChangeHandler, this.mAddFieldParameters);
		}, /requires/, "then an incomplete change handler entry cannot be added");
		ChangeHandlerMediator.addChangeHandler(this.sAddFieldChangeHandler, this.sModel, this.mAddFieldParameters);
		ChangeHandlerMediator.addChangeHandler(this.sAddColumnChangeHandler, this.sModel, this.mAddColumnParameters);

		assert.equal(ChangeHandlerMediator.getChangeHandler(
			this.sAddFieldChangeHandler, this.sModel).parameters.requiredLibraries["sap.ui.comp"].minVersion,
			"1.48", "then the required library for addField is retrieved");

		assert.equal(ChangeHandlerMediator.getChangeHandler(this.sAddColumnChangeHandler, this.sModel).parameters.create().label,
			"testLabel", "then the 'create' method in addColumn is retrieved and can be executed");

		assert.throws(function(){
			ChangeHandlerMediator.addChangeHandler(this.sAddColumnChangeHandler, this.sModel, this.mUpdatedAddColumnParameters);
		}, /already exists/, "then a change handler cannot be registered twice");

	});

});