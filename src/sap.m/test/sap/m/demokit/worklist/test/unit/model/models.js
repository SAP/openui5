sap.ui.require(
	[
		"sap/ui/demo/worklist/model/models",
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/sinon-qunit"
	],
	function (models) {
		"use strict";

		QUnit.module("createDeviceModel", {
			teardown: function () {
				this.oDeviceModel.destroy();
			}
		});

		function isPhoneTestCase(assert, bIsPhone) {
			// Arrange
			this.stub(sap.ui.Device, "system", { phone : bIsPhone });

			// System under test
			this.oDeviceModel = models.createDeviceModel();

			// Assert
			assert.strictEqual(this.oDeviceModel.getData().system.phone, bIsPhone, "IsPhone property is correct");
		}

		QUnit.test("Should initialize a device model for desktop", function (assert) {
			isPhoneTestCase.call(this, assert, false);
		});

		QUnit.test("Should initialize a device model for phone", function (assert) {
			isPhoneTestCase.call(this, assert, true);
		});

		function isTouchTestCase(assert, bIsTouch) {
			// Arrange
			this.stub(sap.ui.Device, "support", { touch : bIsTouch });

			// System under test
			this.oDeviceModel = models.createDeviceModel();

			// Assert
			assert.strictEqual(this.oDeviceModel.getData().support.touch, bIsTouch, "IsTouch property is correct");
		}

		QUnit.test("Should initialize a device model for non touch devices", function (assert) {
			isTouchTestCase.call(this, assert, false);
		});

		QUnit.test("Should initialize a device model for touch devices", function (assert) {
			isTouchTestCase.call(this, assert, true);
		});

		QUnit.test("The binding mode of the device model should be one way", function (assert) {

			// System under test
			this.oDeviceModel = models.createDeviceModel();

			// Assert
			assert.strictEqual(this.oDeviceModel.getDefaultBindingMode(), "OneWay", "Binding mode is correct");
		});

		QUnit.module("createODataModel", {
			setup : function () {
				this.oODataModel = {};
				this.oDataModelStub = sinon.stub(models, "_createODataModel").returns(this.oODataModel);
			},
			teardown : function () {
				this.oDataModelStub.restore();
			}
		});

		QUnit.test("Should create an ODataModel when only a url is provided", function (assert) {
			// Arrange
			var sUrl = "someUrl",
				oResult;

			// Act
			oResult = models.createODataModel({
				url : sUrl
			});

			// Assert
			assert.strictEqual(oResult, this.oODataModel, "Did return the created instance");
			sinon.assert.calledWith(this.oDataModelStub, sUrl, sinon.match({}));
		});

		QUnit.test("Should create an ODataModel when only a url is provided", function (assert) {
			// Arrange
			var sUrl = "someUrl",
				oResult;

			// Act
			oResult = models.createODataModel({
				url : sUrl
			});

			// Assert
			assert.strictEqual(oResult, this.oODataModel, "Did return the created instance");
			sinon.assert.calledWith(this.oDataModelStub, sUrl, sinon.match({}));
		});

		QUnit.test("Should add url parameters that are present in the url", function (s) {
			// Arrange
			var sUrl = "someUrl",
				sSapServerParameter = "sap-server",
				sNonExistingValue = "nonExistingValue",
				oExpectedConfig = {
					metadataUrlParams: {
						"sap-server" : "someServer"
					}
				},
				getUrlParameterStub = this.stub(),
				sServerValue = oExpectedConfig.metadataUrlParams[sSapServerParameter];

			getUrlParameterStub.withArgs(sSapServerParameter)
				.returns(sServerValue);
			getUrlParameterStub.withArgs(sNonExistingValue)
				.returns(null);

			this.stub(jQuery.sap, "getUriParameters").returns({
				get: getUrlParameterStub
			});

			// Act
			models.createODataModel({
				url : sUrl,
				urlParametersForEveryRequest: [
					"sap-server",
					"nonExistingValue"
				]
			});

			// Assert
			sinon.assert.calledWith(this.oDataModelStub, sUrl + "?" + sSapServerParameter + "=" + sServerValue, sinon.match(oExpectedConfig));
		});

		QUnit.test("Should overwrite existing values when in the url", function () {
			// Arrange
			var sUrl = "someUrl",
				sSapServerParameter = "sap-server",
				oExpectedConfig = {
					metadataUrlParams: {
						"sap-server" : "someServer",
						"static" : "value"
					}
				},
				sServerValue = oExpectedConfig.metadataUrlParams[sSapServerParameter],
				getUrlParameterStub = this.stub();

			getUrlParameterStub.withArgs(sSapServerParameter)
				.returns(sServerValue);

			this.stub(jQuery.sap, "getUriParameters").returns({
				get: getUrlParameterStub
			});

			// Act
			models.createODataModel({
				url: sUrl,
				urlParametersForEveryRequest: [
					"sap-server"
				],
				config: {
					metadataUrlParams: {
						"sap-server" : "anotherServer",
						"static" : "value"
					}
				}
			});

			// Assert
			sinon.assert.calledWith(this.oDataModelStub, sUrl + "?" + sSapServerParameter + "=" + sServerValue, sinon.match(oExpectedConfig));
		});

		QUnit.test("Should add sap-language if a user is logged in the shell", function (assert) {
			// Arrange
			var sUrl = "someUrl",
				oExpectedConfig = {
					metadataUrlParams: {
						"sap-language" : "us"
					}
				},
				getUrlParameterSpy = this.spy();

			// Stub the language
			sap.ushell = {
				Container : {
					getUser: this.stub().returns({
						getLanguage: this.stub().returns(oExpectedConfig.metadataUrlParams["sap-language"])
					})
				}
			};

			this.stub(jQuery.sap, "getUriParameters").returns({
				get: getUrlParameterSpy
			});

			// Act
			models.createODataModel({
				url : sUrl,
				urlParametersForEveryRequest: [
					"sap-language"
				]
			});

			// Assert
			sinon.assert.calledWith(this.oDataModelStub, sUrl, sinon.match(oExpectedConfig));
			assert.strictEqual(getUrlParameterSpy.callCount, 0, "Did not look in the url");

			// Cleanup
			delete sap.ushell;
		});

		QUnit.test("Should add sap-language from the url if the user is not logged on in the shell", function () {
			// Arrange
			var sUrl = "someUrl",
				sLanguageParameter = "sap-language",
				oExpectedConfig = {
					metadataUrlParams: {
						"sap-language" : "us"
					}
				},
				sLanguageValue = oExpectedConfig.metadataUrlParams[sLanguageParameter],
				getUrlParameterStub = this.stub();

			getUrlParameterStub.withArgs(sLanguageParameter)
				.returns(sLanguageValue);

			this.stub(jQuery.sap, "getUriParameters").returns({
				get: getUrlParameterStub
			});

			// Act
			models.createODataModel({
				url : sUrl,
				urlParametersForEveryRequest: [
					sLanguageParameter
				]
			});

			// Assert
			sinon.assert.calledWith(this.oDataModelStub, sUrl + "?" + sLanguageParameter + "=" + sLanguageValue, sinon.match(oExpectedConfig));
		});

		QUnit.module("CreateODataModel - logging");

		QUnit.test("Should log an error if no url is provided", function () {
			// Arrange
			var oErrorStub = this.stub(jQuery.sap.log, "error");

			// Act
			models.createODataModel();

			// Assert
			sinon.assert.calledWith(oErrorStub, sinon.match.string, "sap.ui.demo.worklist.model.models.createODataModel");
		});
});
