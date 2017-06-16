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

			this.mAddFieldParameters = {
				"requiredLibraries" : {
	                "sap.ui.comp": {
	                    "minVersion": "1.48",
	                    "lazy": "false"
	                }
	            },
				"context" : "AddFieldContext",
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

	QUnit.test('when adding the change handlers to the mediator...', function(assert) {

		ChangeHandlerMediator.addChangeHandler(this.sAddFieldChangeHandler, this.mAddFieldParameters);
		ChangeHandlerMediator.addChangeHandler(this.sAddColumnChangeHandler, this.mAddColumnParameters);

		assert.equal(ChangeHandlerMediator.getChangeHandler(this.sAddFieldChangeHandler).parameters.requiredLibraries["sap.ui.comp"].minVersion,
			"1.48", "then the required library for addField is retrieved");

		assert.equal(ChangeHandlerMediator.getChangeHandler(this.sAddColumnChangeHandler).parameters.create().label,
			"testLabel", "then the 'create' method in addColumn is retrieved and can be executed");

		ChangeHandlerMediator.addChangeHandler(this.sAddColumnChangeHandler, this.mUpdatedAddColumnParameters);

		assert.equal(ChangeHandlerMediator._aChangeHandlers.length, 2, "then an entry with the same name can't exist twice in the array");
		assert.equal(ChangeHandlerMediator.getChangeHandler(this.sAddColumnChangeHandler).parameters.create().label,
			"newTestLabel", "and the addColumn change handler value is updated when trying to insert it twice in the array");
	});

});