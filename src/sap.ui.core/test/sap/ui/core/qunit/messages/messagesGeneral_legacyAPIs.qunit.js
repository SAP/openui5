/*global QUnit */
sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/String",
	"sap/m/Input",
	'sap/ui/qunit/utils/createAndAppendDiv',
	"sap/ui/test/TestUtils"
], function(coreLibrary, JSONModel, TypeInteger, TypeString, Input, createAndAppendDiv, TestUtils) {
	"use strict";

	// create content div
	createAndAppendDiv("content");

	// shortcuts for enums from the sap.ui.core namespace
	var ValueState = coreLibrary.ValueState;

	var oModel;
	var oString, oInteger, oStreet, oZip;

	function createControls() {
		oString = new TypeString(null,{maxLength: 5});
		oInteger = new TypeInteger();

		oZip = new Input({value:{path:'/form/zip', type: oInteger}});
		oStreet = new Input({value:{path:'/form/street', type: oString}});

		oZip.placeAt("content");
		oStreet.placeAt("content");
	}

	function destroyControls() {
		oZip.destroy();
		oStreet.destroy();
	}

	function spyDataState(oControl, fnTest) {
		if (oControl.refreshDataState) {
			var fnRefresh = oControl.refreshDataState;
			oControl.refreshDataState = function(sName, oDataState) {
				Input.prototype.refreshDataState.apply(oControl, arguments);
				fnTest(sName, oDataState);
				oControl.refreshDataState = fnRefresh;
			};
		}
	}

	function initModel() {
		oModel = new JSONModel();
		var oData = {
			form: {
				firstname: "Fritz",
				lastname: "Heiner",
				street: "im",
				nr: 1,
				zip: "12345"
			}
		};
		oModel.setData(oData);
		sap.ui.getCore().setModel(oModel);
		createControls();
	}

	QUnit.module("Messaging  (global handleValidation)", {
		beforeEach : function() {
			initModel();
		},

		afterEach : function() {
			destroyControls();
			oModel.destroy();
			oModel = undefined;
		}
	});

	QUnit.test("parseError", function(assert) {
		var done = assert.async();
		TestUtils.withNormalizedMessages(function() {
			spyDataState(oZip, function(sName, oDataState) {
				assert.ok(oDataState.getMessages().length == 1, 'ParseError Message propagated to control');
				assert.ok(oZip.getValueState() === ValueState.Error, 'Input: ValueState set correctly');
				assert.equal(oZip.getValueStateText(), "EnterInt", 'Input: ValueStateText set correctly');
			});
			oZip.setValue('bbb');
		});
		setTimeout(function() {
			spyDataState(oZip, function(sName, oDataState) {
				assert.ok(oDataState.getMessages().length == 0, 'Validation Message deleted');
				assert.ok(oZip.getValueState() === ValueState.None, 'Input: ValueState set correctly');
				assert.ok(oZip.getValueStateText() === '', 'Input: ValueStateText set correctly');
				done();
			});
			oZip.setValue('123');
		}, this);
	});

	QUnit.test("validationError", function(assert) {
		var done = assert.async();
		TestUtils.withNormalizedMessages(function() {
			spyDataState(oStreet, function(sName, oDataState) {
				assert.ok(oDataState.getMessages().length == 1, 'Validation Message propagated to control');
				assert.ok(oStreet.getValueState() === ValueState.Error, 'Input: ValueState set correctly');
				assert.equal(oStreet.getValueStateText(), "String.MaxLength 5", 'Input: ValueStateText set correctly');
			});
			oStreet.setValue('am Busche');
		});
		setTimeout(function() {
			spyDataState(oStreet, function(sName, oDataState) {
				assert.ok(oDataState.getMessages().length == 0, 'Validation Message deleted');
				assert.ok(oStreet.getValueState() === ValueState.None, 'Input: ValueState set correctly');
				assert.ok(oStreet.getValueStateText() === '', 'Input: ValueStateText set correctly');
				done();
			});
			oStreet.setValue('Busch');
		}, this);
	});

	QUnit.test("validationError - multiple input", function(assert) {
		var done = assert.async();

		TestUtils.withNormalizedMessages(function() {
			spyDataState(oStreet, function(sName, oDataState) {
				assert.ok(oStreet.getValueState() === ValueState.Error, 'Input: ValueState set correctly');
				assert.equal(oStreet.getValueStateText(), "String.MaxLength 5", 'Input: ValueStateText set correctly');
			});
			oStreet.setValue('am Busche');
		});

		setTimeout(function() {
			spyDataState(oStreet, function(sName, oDataState) {
				assert.ok(oStreet.getValueState() === ValueState.None, 'Input: ValueState set correctly');
				assert.ok(oStreet.getValueStateText() === '', 'Input: ValueStateText set correctly');
			});
			oStreet.setValue('Busch');

			setTimeout(function() {
				TestUtils.withNormalizedMessages(function() {
					spyDataState(oStreet, function(sName, oDataState) {
						assert.ok(oStreet.getValueState() === ValueState.Error, 'Input: ValueState set correctly');
						assert.equal(oStreet.getValueStateText(), "String.MaxLength 5", 'Input: ValueStateText set correctly');
					});
					oStreet.setValue('am Busche');
				});

				setTimeout(function() {
					spyDataState(oStreet, function(sName, oDataState) {
						assert.ok(oStreet.getValueState() === ValueState.None, 'Input: ValueState set correctly');
						assert.ok(oStreet.getValueStateText() === '', 'Input: ValueStateText set correctly');
						done();
					});
					oStreet.setValue('Busch');
				}, 0);
			}, 0);
		}, 0);
	});

});
