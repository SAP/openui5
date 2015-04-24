sap.ui.require(
	[
		"sap/ui/demo/masterdetail/model/promise",
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/sinon-qunit"
	],
	function (promise) {
		"use strict";

		QUnit.module("Wait for element binding", {
			setup: function () {
				sinon.config.useFakeTimers = false;
				this.sModelPath = "modelPath";
				this.oElementBindingStub = {
					getPath : sinon.stub().returns(this.sModelPath),
					getModel : function () {
						return this.oModelStub;
					}.bind(this)
				};
			},
			teardown: function () {
				sinon.config.useFakeTimers = true;
			}
		});

		QUnit.test("Should immediately resolve the promise, if there is data in the model", function (assert) {
			// Arrange
			var done = assert.async(),
				fnRejectSpy = sinon.spy();
			this.oModelStub = {
				//Provide data in the model
				getProperty : sinon.stub().withArgs().returns({})
			};

			// Act
			promise.whenThereIsDataForTheElementBinding(this.oElementBindingStub).then(function (sPath) {
				// Assert
				assert.strictEqual(fnRejectSpy.callCount, 0, "Did not reject");
				assert.strictEqual(sPath, this.sModelPath, "Dis pass the correct path");

				done();
			}.bind(this), fnRejectSpy);
		});

		QUnit.test("Should reject the promise, if there is no data in the model", function (assert) {
			// Arrange
			var done = assert.async(),
				fnDataReceivedCallback,
				fnAttachDataReceived = sinon.spy(function (sEventName, fnCallback) {
					fnDataReceivedCallback = fnCallback;
					assert.strictEqual(sEventName, "dataReceived", "Did attach on data received");
				}),
				fnResolveSpy = sinon.spy(),
				fnRejectSpy = sinon.spy(function () {
					// Assert
					assert.strictEqual(fnResolveSpy.callCount, 0, "Did not resolve");

					done();
				});

			this.oModelStub = {
				//Don't provide data
				getProperty : sinon.stub().withArgs(this.sModelPath).returns()
			};

			this.oElementBindingStub.attachEventOnce = fnAttachDataReceived;

			// Act
			promise.whenThereIsDataForTheElementBinding(this.oElementBindingStub).then(fnResolveSpy, fnRejectSpy);

			setTimeout(function () {

				assert.strictEqual(fnRejectSpy.callCount, 0, "Did not reject yet");
				fnDataReceivedCallback();

			}, 0);
		});

		QUnit.test("Should resolve the promise, if there is data on the server", function (assert) {
			// Arrange
			var done = assert.async(),
				fnDataReceivedCallback,
				bIsFirstGetPropertyCall = true,
				fnAttachDataReceived = sinon.spy(function (sEventName, fnCallback) {
					fnDataReceivedCallback = fnCallback;
					assert.strictEqual(sEventName, "dataReceived", "Did attach on data received");
				}),
				fnRejectSpy = sinon.spy(),
				fnResolveSpy = sinon.spy(function (sPath) {
					// Assert
					assert.strictEqual(fnRejectSpy.callCount, 0, "Did not reject");
					assert.strictEqual(sPath, this.sModelPath, "Did pass the correct path");

					done();
				});

			this.oModelStub = {
				//Provide data in the model
				getProperty : function () {
					if (bIsFirstGetPropertyCall) {
						bIsFirstGetPropertyCall = false;
						return undefined;
					}
					// Second time this is called simulate data came from the server.
					return {};
				}
			};
			this.oElementBindingStub.attachEventOnce = fnAttachDataReceived;

			// Act
			promise.whenThereIsDataForTheElementBinding(this.oElementBindingStub).then(fnResolveSpy.bind(this), fnRejectSpy);

			setTimeout(function () {

				assert.strictEqual(fnResolveSpy.callCount, 0, "Did not resolve yet");
				fnDataReceivedCallback();

			}, 0);
		});
	});
