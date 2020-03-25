/* global sinon, QUnit*/
sap.ui.define([
	'sap/m/Input',
	'sap/ui/model/Model',
	'sap/ui/model/type/Integer',
	'sap/ui/core/message/Message',
	'sap/ui/core/message/MessageManager',
	'sap/ui/core/library',
	'sap/ui/core/ComponentContainer',
	'sap/ui/model/json/JSONModel',
	'sap/ui/core/UIComponent',
	'sap/ui/qunit/utils/createAndAppendDiv'
], function(Input, Model, Integer, Message, MessageManager, library, ComponentContainer, JSONModel, UIComponent, createAndAppendDiv){
	"use strict";

	// create content div
	createAndAppendDiv('content');

	QUnit.module("MessageManager components", {
		before: function(){
			this.spyDataState = function(oControl, fnTest) {
				if (oControl.refreshDataState) {
					var fnRefresh = oControl.refreshDataState;
					oControl.refreshDataState = function(sName, oDataState) {
						Input.prototype.refreshDataState.apply(oControl, arguments);
						fnTest(sName, oDataState);
						oControl.refreshDataState = fnRefresh;
					};
				}
			};

			//create some components for testing
			var oCompCont = new ComponentContainer("CompCont", {
				name: "components",
				id: "myMessageTest1"
			});
			var pCompContRendered = new Promise(function(res, rej){
				oCompCont.addEventDelegate({
					onAfterRendering: function (oEvent) {
						res();
					}
				});
			});

			var oCompContEnabled = new ComponentContainer("CompCont2", {
				name: "components.enabled",
				id: "myMessageTest2",
				handleValidation: true
			});
			var pCompContEnabledRendered = new Promise(function(res, rej){
				oCompContEnabled.addEventDelegate({
					onAfterRendering: function (oEvent) {
						res();
					}
				});
			});

			var oCompContDisabled = new ComponentContainer("CompCont3", {
				name: "components.disabled",
				id: "myMessageTest3",
				handleValidation: true
			});
			var pCompContDisabledRendered = new Promise(function(res, rej){
				oCompContDisabled.addEventDelegate({
					onAfterRendering: function (oEvent) {
						res();
					}
				});
			});


			oCompCont.placeAt("content");
			oCompContEnabled.placeAt("content");
			oCompContDisabled.placeAt("content");

			this.initModel = function() {
				this.oModel = new JSONModel();
				var oData = {
					form: {
						firstname: "Fritz",
						lastname: "Heiner",
						street: "im",
						nr: 1,
						zip: "12345"
					}
				};
				this.oModel.setData(oData);
				sap.ui.getCore().setModel(this.oModel);
			};


			return Promise.all([pCompContRendered, pCompContEnabledRendered, pCompContDisabledRendered]);
		},

		beforeEach : function() {
			this.initModel();
		},

		afterEach : function() {
			this.oModel.destroy();
		}
	});

	QUnit.test("componentEnabled", function (assert) {
		var done = assert.async();

		var oCompZip = sap.ui.getCore().byId("zip_enabled");

		this.spyDataState(oCompZip, function (sName, oDataState) {
			assert.ok(oDataState.getMessages().length == 1, 'Format Message created');
			assert.ok(oCompZip.getValueState() === library.ValueState.Error, 'Input: ValueState set correctly');
			assert.ok(oCompZip.getValueStateText() === 'Enter a value with no more than 5 characters', 'Input: ValueStateText set correctly');
		});
		var oCoreValHandler = function (oEvent) {
			assert.ok(false, "should never be called");
		};
		sap.ui.getCore().attachValidationError(oCoreValHandler);
		oCompZip.setValue('123456');

		setTimeout(function () {
			this.spyDataState(oCompZip, function (sName, oDataState) {
				assert.ok(oDataState.getMessages().length == 0, 'Validation Message deleted');
				assert.ok(oCompZip.getValueState() === library.ValueState.None, 'Input: ValueState set correctly');
				assert.ok(oCompZip.getValueStateText() === '', 'Input: ValueStateText set correctly');
				done();
			});
			oCompZip.setValue('12345');
			sap.ui.getCore().detachValidationError(oCoreValHandler);
		}.bind(this), 0);
	});

	QUnit.test("componentDisabled", function(assert) {
		var oMessageManager = sap.ui.getCore().getMessageManager();
		var oMessageModel = oMessageManager.getMessageModel();
		var oCompZip = sap.ui.getCore().byId("zip_disabled");

		var oValHandler = function(oEvent) {
			if (oEvent.getParameter("dataState").getMessages() && oEvent.getParameter("dataState").getMessages().length > 0) {
				assert.ok(false,"should never be called");
			}
		};
		oCompZip.getBinding("value").attachDataStateChange(oValHandler);
		sap.ui.getCore().attachValidationError(oValHandler);
		oCompZip.setValue('123456');
		assert.ok(jQuery.isPlainObject(oMessageModel.getObject('/')) || oMessageModel.getObject('/').length == 0, 'No Messages in Model');
		sap.ui.getCore().detachValidationError(oValHandler);
	});

	QUnit.test("component handle validation undefined", function(assert) {
		var oMessageManager = sap.ui.getCore().getMessageManager();
		var oMessageModel = oMessageManager.getMessageModel();

		var oCompZip = sap.ui.getCore().byId("zip");
		var oChangeHandler = function(oEvent) {
			if (oEvent.getParameter("dataState").getMessages() && oEvent.getParameter("dataState").getMessages().length > 0) {
				assert.ok(false,"should never be called");
			}
		};
		var oValHandler = function(oEvent) {
			assert.ok(true,oEvent.sId);
			sap.ui.getCore().detachValidationError(oValHandler);
		};
		oCompZip.getBinding("value").attachDataStateChange(oChangeHandler);
		sap.ui.getCore().attachValidationError(oValHandler);
		oCompZip.setValue('123456');
		assert.ok(jQuery.isPlainObject(oMessageModel.getObject('/')) || oMessageModel.getObject('/').length == 0, 'No Messages in Model');
	});

	QUnit.module("Component: handleValidation / registerObject");

	QUnit.test("Metadata: n/a, instance: n/a", function(assert) {
		var sComponentName = "sap.ui.test.handlevalidation.na.na";
		var oMessageManager = sap.ui.getCore().getMessageManager();
		var oRegisterObjectSpy = this.spy(oMessageManager, "registerObject");

		jQuery.sap.declare(sComponentName + ".Component");
		UIComponent.extend(sComponentName + ".Component", {
			metadata: {}
		});

		var oComponent = sap.ui.component({
			name: sComponentName
		});

		sinon.assert.callCount(oRegisterObjectSpy, 0);

		oComponent.destroy();
	});

	QUnit.test("Metadata: n/a, instance: false", function(assert) {
		var sComponentName = "sap.ui.test.handlevalidation.na.false";
		var oMessageManager = sap.ui.getCore().getMessageManager();
		var oRegisterObjectSpy = this.spy(oMessageManager, "registerObject");

		jQuery.sap.declare(sComponentName + ".Component");
		UIComponent.extend(sComponentName + ".Component", {
			metadata: {}
		});

		var oComponent = sap.ui.component({
			name: sComponentName,
			handleValidation: false
		});

		sinon.assert.callCount(oRegisterObjectSpy, 0);

		oComponent.destroy();
	});

	QUnit.test("Metadata: n/a, instance: true", function(assert) {
		var sComponentName = "sap.ui.test.handlevalidation.na.true";
		var oMessageManager = sap.ui.getCore().getMessageManager();
		var oRegisterObjectSpy = this.spy(oMessageManager, "registerObject");

		jQuery.sap.declare(sComponentName + ".Component");
		UIComponent.extend(sComponentName + ".Component", {
			metadata: {}
		});

		var oComponent = sap.ui.component({
			name: sComponentName,
			handleValidation: true
		});

		sinon.assert.callCount(oRegisterObjectSpy, 1);
		sinon.assert.calledWithExactly(oRegisterObjectSpy, oComponent, true);

	});

	QUnit.test("Metadata: false, instance: false", function(assert) {
		var sComponentName = "sap.ui.test.handlevalidation.false.false";
		var oMessageManager = sap.ui.getCore().getMessageManager();
		var oRegisterObjectSpy = this.spy(oMessageManager, "registerObject");

		jQuery.sap.declare(sComponentName + ".Component");
		UIComponent.extend(sComponentName + ".Component", {
			metadata: {
				handleValidation: false
			}
		});

		var oComponent = sap.ui.component({
			name: sComponentName,
			handleValidation: false
		});

		sinon.assert.callCount(oRegisterObjectSpy, 1);
		sinon.assert.calledWithExactly(oRegisterObjectSpy, oComponent, false);

	});

	QUnit.test("Metadata: false, instance: n/a", function(assert) {
		var sComponentName = "sap.ui.test.handlevalidation.false.na";
		var oMessageManager = sap.ui.getCore().getMessageManager();
		var oRegisterObjectSpy = this.spy(oMessageManager, "registerObject");

		jQuery.sap.declare(sComponentName + ".Component");
		UIComponent.extend(sComponentName + ".Component", {
			metadata: {
				handleValidation: false
			}
		});

		var oComponent = sap.ui.component({
			name: sComponentName
		});

		sinon.assert.callCount(oRegisterObjectSpy, 1);
		sinon.assert.calledWithExactly(oRegisterObjectSpy, oComponent, false);

	});

	QUnit.test("Metadata: false, instance: true", function(assert) {
		var sComponentName = "sap.ui.test.handlevalidation.false.true";
		var oMessageManager = sap.ui.getCore().getMessageManager();
		var oRegisterObjectSpy = this.spy(oMessageManager, "registerObject");

		jQuery.sap.declare(sComponentName + ".Component");
		UIComponent.extend(sComponentName + ".Component", {
			metadata: {
				handleValidation: false
			}
		});

		var oComponent = sap.ui.component({
			name: sComponentName,
			handleValidation: true
		});

		sinon.assert.callCount(oRegisterObjectSpy, 1);
		sinon.assert.calledWithExactly(oRegisterObjectSpy, oComponent, false);

	});

	QUnit.test("Metadata: true, instance: true", function(assert) {
		var sComponentName = "sap.ui.test.handlevalidation.true.true";
		var oMessageManager = sap.ui.getCore().getMessageManager();
		var oRegisterObjectSpy = this.spy(oMessageManager, "registerObject");

		jQuery.sap.declare(sComponentName + ".Component");
		UIComponent.extend(sComponentName + ".Component", {
			metadata: {
				handleValidation: true
			}
		});

		var oComponent = sap.ui.component({
			name: sComponentName,
			handleValidation: true
		});

		sinon.assert.callCount(oRegisterObjectSpy, 1);
		sinon.assert.calledWithExactly(oRegisterObjectSpy, oComponent, true);

	});

	QUnit.test("Metadata: true, instance: n/a", function(assert) {
		var sComponentName = "sap.ui.test.handlevalidation.true.na";
		var oMessageManager = sap.ui.getCore().getMessageManager();
		var oRegisterObjectSpy = this.spy(oMessageManager, "registerObject");

		jQuery.sap.declare(sComponentName + ".Component");
		UIComponent.extend(sComponentName + ".Component", {
			metadata: {
				handleValidation: true
			}
		});

		var oComponent = sap.ui.component({
			name: sComponentName
		});

		sinon.assert.callCount(oRegisterObjectSpy, 1);
		sinon.assert.calledWithExactly(oRegisterObjectSpy, oComponent, true);

	});

	QUnit.test("Metadata: true, instance: false", function(assert) {
		var sComponentName = "sap.ui.test.handlevalidation.true.false";
		var oMessageManager = sap.ui.getCore().getMessageManager();
		var oRegisterObjectSpy = this.spy(oMessageManager, "registerObject");

		jQuery.sap.declare(sComponentName + ".Component");
		UIComponent.extend(sComponentName + ".Component", {
			metadata: {
				handleValidation: true
			}
		});

		var oComponent = sap.ui.component({
			name: sComponentName,
			handleValidation: false
		});

		sinon.assert.callCount(oRegisterObjectSpy, 1);
		sinon.assert.calledWithExactly(oRegisterObjectSpy, oComponent, true);

	});

	QUnit.test("Model: checkMessages", function(assert) {
		var oCheckMessagesSpy = sinon.spy(Model.prototype, "checkMessages");
		var oModel = new Model();
		var mMessages = {"foo": {"key1": "value1"}};

		oModel.mMessages = mMessages;
		oModel.setMessages(mMessages);
		assert.equal(oCheckMessagesSpy.callCount, 0, "No changes detected - Skip check messages");

		oModel.setMessages({"foo": {"key2": "value2"}});
		assert.equal(oCheckMessagesSpy.callCount, 1, "Changes detected - Check messages");

		oModel.setMessages();
		assert.equal(oCheckMessagesSpy.callCount, 2, "Changes detected - Check messages");
		assert.deepEqual(oModel.mMessages, {}, "Model messages cleared");
		oCheckMessagesSpy.restore();
	});

	QUnit.test("Model: Refresh with force update", function(assert) {
		var done = assert.async();
		var oModel = new Model();
		var oMessage = new Message({message: "myMessage", type: library.MessageType.Error});
		oModel.setMessages({"/test": oMessage});
		oModel.attachMessageChange(function(oEvent){
			assert.strictEqual(oMessage, oEvent.getParameter("oldMessages")[0]);
			done();
		});
		oModel.refresh(true);
	});

	QUnit.test("MessageManager:register/unregisterObject", function(assert) {
		var oMessageManager = sap.ui.getCore().getMessageManager();
		var oHandlererrorSpy = sinon.spy(MessageManager.prototype, "_handleError");
		var oModel = new JSONModel(
			{
				data: {
					value: 2
				}
			}
		);
		var oInput = new Input(
			{
				value: {
					path: "/dayta/value",
					type: new Integer()
				},
				models: oModel
			}
		);
		oMessageManager.registerObject(oInput);
		oInput.setValue("abc");
		assert.equal(oHandlererrorSpy.callCount, 1, "Changes detected - _handleError");
		oInput.setValue("2");
		oMessageManager.unregisterObject(oInput);
		oInput.setValue("abc");
		assert.equal(oHandlererrorSpy.callCount, 1, "No Changes detected - _handleError");
		oHandlererrorSpy.restore();
	});

});