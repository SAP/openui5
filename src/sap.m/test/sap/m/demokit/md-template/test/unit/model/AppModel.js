sap.ui.require(
	[
		"sap/ui/demo/mdtemplate/model/AppModel",
		"sap/m/List",
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/sinon-qunit"
	],
	function (AppModel, List) {
		"use strict";

		QUnit.module("Wait for element binding", {
			setup: function () {
				sinon.config.useFakeTimers = false;
				this.oMdTemplateModel = new AppModel({
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
					getProperty : this.stub().withArgs().returns({})
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
					getProperty : this.stub().withArgs(sModelPath).returns()
				},
				oElementBindingStub = {
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
				bIsFirstGetPropertyCall = true,
				fnAttachDataReceived = this.spy(function (sEventName, fnCallback) {
					fnDataReceivedCallback = fnCallback;
					assert.strictEqual(sEventName, "dataReceived", "Did attach on data received");
				}),
				oModelStub = {
					//Provide data in the model
					getProperty : function () {
						if (bIsFirstGetPropertyCall) {
							bIsFirstGetPropertyCall = false;
							return;
						}
						// Second time this is called simulate data came from the server.
						return {};
					}
				},
				oElementBindingStub = {
					getPath : this.stub().returns(sModelPath),
					getModel : this.stub().returns(oModelStub),
					attachEventOnce : fnAttachDataReceived
				},
				fnRejectSpy = this.spy(),
				fnResolveSpy = this.spy(function (sPath) {
					// Assert
					assert.strictEqual(fnRejectSpy.callCount, 0, "Did not reject");
					assert.strictEqual(sPath, sModelPath, "Did pass the correct path");
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