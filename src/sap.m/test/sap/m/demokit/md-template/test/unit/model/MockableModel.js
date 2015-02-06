sap.ui.require(
	[
		"sap/ui/demo/mdtemplate/model/MockableModel",
		"sap/m/List",
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/sinon-qunit"
	],
	function(MockableModel, List) {
		"use strict";

		QUnit.module("mock server tests", {
			setup: function () {
				sinon.config.useFakeTimers = false;
				this.oList =  new List();
				this.oList.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();
			},
			teardown: function () {
				sinon.config.useFakeTimers = true;
				this.oMdTemplateModel.destroy();
				this.oList.destroy();
			}
		});

		QUnit.asyncTest("Should start up the mock server", function (assert) {
			// Arrange
			this.stub(jQuery.sap, "getUriParameters", function () {
				return {
					get: function (sURIParameter) {
						// mock server test
						if (sURIParameter === "responderOn") {
							return "true";
						}
						return "1000";
					}
				};
			});
			this.oMdTemplateModel = new MockableModel({
				serviceUrl: "../../../../../foo/",
				dataFolderName: "md_template"
			});

			this.oList.attachUpdateFinished(function (fnResolve) {
				// Assert
				assert.strictEqual(this.oList.getItems().length, 9, "The list shows the expected amount of products");

				QUnit.start();
			}, this);


			// Act
			this.oList.setModel(this.oMdTemplateModel);
			this.oList.bindItems({
				path : "/Objects",
				template :  new sap.m.StandardListItem({
					title: "{Name}"
				})
			});
		});

		QUnit.module("Wait for element binding", {
			setup: function () {
				sinon.config.useFakeTimers = false;
				this.oMdTemplateModel = new MockableModel({
					serviceUrl: "../../../../../foo/",
					dataFolderName: "md_template"
				});
			},
			teardown: function () {
				sinon.config.useFakeTimers = true;
				this.oMdTemplateModel.destroy();
			}
		});

		QUnit.asyncTest("Should immediately resolve the promise, if there is data in the model", function (assert) {
			// Arrange
			var sModelPath = "modelPath",
				oModelStub = {
					//Provide data in the model
					getData : this.stub().withArgs().returns({})
				},
				oElementBindingStub = {
					isInitial : this.stub().returns(false),
					getPath : this.stub().returns(sModelPath),
					getModel : this.stub().returns(oModelStub)
				},
				fnRejectSpy = this.spy();

			// Act
			this.oMdTemplateModel.whenThereIsDataForTheElementBinding(oElementBindingStub).then(function (sPath) {
				// Assert
				assert.strictEqual(fnRejectSpy.callCount, 0, "Did not reject");
				assert.strictEqual(sPath, sModelPath, "Dis pass the correct path");
				QUnit.start();
			}, fnRejectSpy);
		});

		QUnit.asyncTest("Should reject the promise, if there is no data in the model", function (assert) {
			// Arrange
			var sModelPath = "modelPath",
				fnDataReceivedCallback,
				fnAttachDataReceived = this.spy(function (sEventName, fnCallback) {
					fnDataReceivedCallback = fnCallback;
					assert.strictEqual(sEventName, "dataReceived", "Did attach on data received");
				}),
				oModelStub = {
					//Don't provide data
					getData : this.stub().withArgs(sModelPath).returns()
				},
				oElementBindingStub = {
					isInitial : this.stub().returns(true),
					getPath : this.stub().returns(sModelPath),
					getModel : this.stub().returns(oModelStub),
					attachEventOnce : fnAttachDataReceived
				},
				fnRejectSpy = this.spy(function () {
					// Assert
					assert.strictEqual(fnResolveSpy.callCount, 0, "Did not resolve");
					QUnit.start();
				}),
				fnResolveSpy = this.spy();

			// Act
			this.oMdTemplateModel.whenThereIsDataForTheElementBinding(oElementBindingStub).then(fnResolveSpy, fnRejectSpy);

			setTimeout(function () {

				assert.strictEqual(fnRejectSpy.callCount, 0, "Did not reject yet");
				fnDataReceivedCallback();

			}, 0);
		});

		QUnit.asyncTest("Should resolve the promise, if there is data on the server", function (assert) {
			// Arrange
			var sModelPath = "modelPath",
				fnDataReceivedCallback,
				fnAttachDataReceived = this.spy(function (sEventName, fnCallback) {
					fnDataReceivedCallback = fnCallback;
					assert.strictEqual(sEventName, "dataReceived", "Did attach on data received");
				}),
				oModelStub = {
					//Provide data in the model
					getData : this.stub().withArgs().returns({})
				},
				oElementBindingStub = {
					isInitial : this.stub().returns(true),
					getPath : this.stub().returns(sModelPath),
					getModel : this.stub().returns(oModelStub),
					attachEventOnce : fnAttachDataReceived
				},
				fnRejectSpy = this.spy(),
				fnResolveSpy = this.spy(function (sPath) {
					// Assert
					assert.strictEqual(fnRejectSpy.callCount, 0, "Did not reject");
					assert.strictEqual(sPath, sModelPath, "Dis pass the correct path");
					QUnit.start();
				});

			// Act
			this.oMdTemplateModel.whenThereIsDataForTheElementBinding(oElementBindingStub).then(fnResolveSpy, fnRejectSpy);

			setTimeout(function () {

				assert.strictEqual(fnResolveSpy.callCount, 0, "Did not resolve yet");
				fnDataReceivedCallback();

			}, 0);
		});
	}
);