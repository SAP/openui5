/*global QUnit */

sap.ui.define([
	"sap/ui/unified/calendar/Header",
	"sap/ui/core/Core"
], function(Header, oCore) {
	"use strict";

	QUnit.module("Rendering", function (hooks) {
		hooks.beforeEach(function () {
			this.oHeader = new Header();

			this.oHeader.placeAt("qunit-fixture");
			oCore.applyChanges();
		});
		hooks.afterEach(function () {
			this.oHeader.destroy();
			this.oHeader = null;
		});

		QUnit.module("DOM", function () {
			QUnit.test("Header tag should have sapUiCalHead CSS class", function (assert) {
				// assert
				assert.equal(this.oHeader.$().hasClass("sapUiCalHead"), true, "sapUiCalHead CSS class should present");
			});
		});

		QUnit.module("Helper methods", function (hooks) {
			hooks.beforeEach(function () {
				this.oRenderer = this.oHeader.getRenderer();
			});
			hooks.afterEach(function () {
				this.oRenderer = null;
			});

			QUnit.module("getVisibleButton()", function () {
				QUnit.test("should return false if no public or private method with the provided index is defined on the Header", function (assert) {
					// arrange
					var oHead = this.oHeader;

					// act & assert
					assert.equal(this.oRenderer.getVisibleButton(oHead, 5), false, "no _getVisibleButton5 or getVisibleButton5 exits");
				});

				QUnit.test("should return the value from the public method with the provided index if it is defined on the Header", function (assert) {
					// arrange
					var bResult,
						bExpectedValue = true,
						oHead = { getVisibleButton2: this.stub().returns(bExpectedValue), _getVisibleButton2: this.spy() };

					// act
					bResult = this.oRenderer.getVisibleButton(oHead, 2);

					// assert
					assert.equal(oHead.getVisibleButton2.callCount, 1, "getVisibleButton2 should be called once");
					assert.equal(oHead._getVisibleButton2.callCount, 0, "_getVisibleButton2 should not be called");
					assert.equal(bResult, bExpectedValue, "getVisibleButton should return " + bExpectedValue);
				});

				QUnit.test("should return the value from the private method with the provided index if public is not defined on the Header", function (assert) {
					// arrange
					var bResult,
						bExpectedValue = true,
						oHead = { _getVisibleButton2: this.stub().returns(bExpectedValue) };

					// act
					bResult = this.oRenderer.getVisibleButton(oHead, 2);

					// assert
					assert.equal(oHead._getVisibleButton2.callCount, 1, "_getVisibleButton2 should be called once");
					assert.equal(bResult, bExpectedValue, "getVisibleButton should return " + bExpectedValue);
				});
			});

			QUnit.module("getAriaLabelButton()", function () {
				QUnit.test("should return undefined if no public or private method with the provided index is defined on the Header", function (assert) {
					// arrange
					var oHead = this.oHeader;

					// act & assert
					assert.equal(this.oRenderer.getAriaLabelButton(oHead, 5), undefined, "no _getAriaLabelButton5 or getAriaLabelButton5 exits");
				});

				QUnit.test("should return the value from the public method with the provided index if it is defined on the Header", function (assert) {
					// arrange
					var sResult,
						sExpectedValue = "Aria Label",
						oHead = { getAriaLabelButton2: this.stub().returns(sExpectedValue), _getAriaLabelButton2: this.spy() };

					// act
					sResult = this.oRenderer.getAriaLabelButton(oHead, 2);

					// assert
					assert.equal(oHead.getAriaLabelButton2.callCount, 1, "getAriaLabelButton2 should be called once");
					assert.equal(oHead._getAriaLabelButton2.callCount, 0, "_getAriaLabelButton2 should not be called");
					assert.equal(sResult, sExpectedValue, "getAriaLabelButton should return " + sExpectedValue);
				});

				QUnit.test("should return the value from the private method with the provided index if public is not defined on the Header", function (assert) {
					// arrange
					var sResult,
						sExpectedValue = "Aria Label",
						oHead = { _getAriaLabelButton2: this.stub().returns(sExpectedValue) };

					// act
					sResult = this.oRenderer.getAriaLabelButton(oHead, 2);

					// assert
					assert.equal(oHead._getAriaLabelButton2.callCount, 1, "_getAriaLabelButton2 should be called once");
					assert.equal(sResult, sExpectedValue, "getAriaLabelButton should return " + sExpectedValue);
				});
			});

			QUnit.module("getTextButton()", function () {
				QUnit.test("should return undefined if no public or private method with the provided index is defined on the Header", function (assert) {
					// arrange
					var oHead = this.oHeader;

					// act & assert
					assert.equal(this.oRenderer.getTextButton(oHead, 5), undefined, "no _getTextButton5 or getTextButton5 exits");
				});

				QUnit.test("should return the value from the public method with the provided index if it is defined on the Header", function (assert) {
					// arrange
					var sResult,
							sExpectedValue = "Aria Label",
							oHead = { getTextButton2: this.stub().returns(sExpectedValue), _getTextButton2: this.spy() };

					// act
					sResult = this.oRenderer.getTextButton(oHead, 2);

					// assert
					assert.equal(oHead.getTextButton2.callCount, 1, "getTextButton2 should be called once");
					assert.equal(oHead._getTextButton2.callCount, 0, "_getTextButton2 should not be called");
					assert.equal(sResult, sExpectedValue, "getTextButton should return " + sExpectedValue);
				});

				QUnit.test("should return the value from the private method with the provided index if public is not defined on the Header", function (assert) {
					// arrange
					var sResult,
							sExpectedValue = "Aria Label",
							oHead = { _getTextButton2: this.stub().returns(sExpectedValue) };

					// act
					sResult = this.oRenderer.getTextButton(oHead, 2);

					// assert
					assert.equal(oHead._getTextButton2.callCount, 1, "_getTextButton2 should be called once");
					assert.equal(sResult, sExpectedValue, "getTextButton should return " + sExpectedValue);
				});
			});

			QUnit.module("getAdditionalTextButton()", function () {
				QUnit.test("should return undefined if no public or private method with the provided index is defined on the Header", function (assert) {
					// arrange
					var oHead = this.oHeader;

					// act & assert
					assert.equal(this.oRenderer.getAdditionalTextButton(oHead, 5), undefined, "no _getAdditionalTextButton5 or getAdditionalTextButton5 exits");
				});

				QUnit.test("should return the value from the public method with the provided index if it is defined on the Header", function (assert) {
					// arrange
					var sResult,
							sExpectedValue = "Aria Label",
							oHead = { getAdditionalTextButton2: this.stub().returns(sExpectedValue), _getAdditionalTextButton2: this.spy() };

					// act
					sResult = this.oRenderer.getAdditionalTextButton(oHead, 2);

					// assert
					assert.equal(oHead.getAdditionalTextButton2.callCount, 1, "getAdditionalTextButton2 should be called once");
					assert.equal(oHead._getAdditionalTextButton2.callCount, 0, "_getAdditionalTextButton2 should not be called");
					assert.equal(sResult, sExpectedValue, "getAdditionalTextButton should return " + sExpectedValue);
				});

				QUnit.test("should return the value from the private method with the provided index if public is not defined on the Header", function (assert) {
					// arrange
					var sResult,
							sExpectedValue = "Aria Label",
							oHead = { _getAdditionalTextButton2: this.stub().returns(sExpectedValue) };

					// act
					sResult = this.oRenderer.getAdditionalTextButton(oHead, 2);

					// assert
					assert.equal(oHead._getAdditionalTextButton2.callCount, 1, "_getAdditionalTextButton2 should be called once");
					assert.equal(sResult, sExpectedValue, "getAdditionalTextButton should return " + sExpectedValue);
				});
			});

			// Fake test to have a root module with at least one test, otherwise qunit-2 will fail
			QUnit.test("Helper methods module starts", function (assert) {
				assert.ok(true, "assert ok");
			});
		});

		QUnit.test("visibleCurrentDateButton", function (assert) {
			var oHeader = this.oHeader,
				sHeaderId = "#" + oHeader.getId() + "-today";

			// assert
			assert.notOk(oHeader.getDomRef().querySelector(sHeaderId), "button is not rendered");

			// act
			oHeader.setVisibleCurrentDateButton(true);
			oCore.applyChanges();

			// assert
			assert.ok(oHeader.getDomRef().querySelector(sHeaderId), "button is rendered");
		});

		// Fake test to have a root module with at least one test, otherwise qunit-2 will fail
		QUnit.test("Rendering module starts", function (assert) {
			assert.ok(true, "assert ok");
		});
	});

	QUnit.module("Private API", function (hooks) {
		hooks.beforeEach(function () {
			this.oHeader = new Header();

			this.oHeader.placeAt("qunit-fixture");
			oCore.applyChanges();
		});
		hooks.afterEach(function () {
			this.oHeader.destroy();
			this.oHeader = null;
		});

		QUnit.module("_set- and _getVisibleButton", function () {
			QUnit.test("_setVisibleButton3 should set inner property and invalidate the control", function (assert) {
				// arrange
				var bExpectedValue = true,
					oInvalidateSpy = this.spy(this.oHeader, "invalidate");

				// act
				this.oHeader._setVisibleButton3(bExpectedValue);

				// assert
				assert.equal(this.oHeader._visibleButton3, bExpectedValue, "visibleButton3 property should be set properly");
				assert.equal(oInvalidateSpy.callCount, 1, "invalidate should be called once");

				// cleanup
				oInvalidateSpy.restore();
			});

			QUnit.test("_getVisibleButton3 should get the value from inner property", function (assert) {
				// arrange
				var bExpectedValue = true;
				this.oHeader._visibleButton3 = bExpectedValue;

				// act & assert
				assert.equal(this.oHeader._getVisibleButton3(), bExpectedValue, "_getVisibleButton3 should return the inner value property");
			});

			QUnit.test("_setVisibleButton4 should set inner property and invalidate the control", function (assert) {
				// arrange
				var bExpectedValue = true,
					oInvalidateSpy = this.spy(this.oHeader, "invalidate");

				// act
				this.oHeader._setVisibleButton4(bExpectedValue);

				// assert
				assert.equal(this.oHeader._visibleButton4, bExpectedValue, "visibleButton4 property should be set properly");
				assert.equal(oInvalidateSpy.callCount, 1, "invalidate should be called once");

				// cleanup
				oInvalidateSpy.restore();
			});

			QUnit.test("_getVisibleButton4 should get the value from inner property", function (assert) {
				// arrange
				var bExpectedValue = true;
				this.oHeader._visibleButton4 = bExpectedValue;

				// act & assert
				assert.equal(this.oHeader._getVisibleButton4(), bExpectedValue, "_getVisibleButton4 should return the inner value property");
			});
		});

		QUnit.module("_set- and _getTextButton", function () {
			QUnit.test("_setTextButton3 should set property and change the text of the DOM element", function (assert) {
				this.oHeader._setVisibleButton3(true);
				// arrange
				var sExpectedText = "Expected text",
					oInvalidateSpy = this.spy(this.oHeader, "invalidate");

				// act
				this.oHeader._setTextButton3(sExpectedText);
				oCore.applyChanges();

				// assert
				assert.equal(this.oHeader._textButton3, sExpectedText, "inner property should be set properly");
				assert.equal(this.oHeader.$("B3").text(), sExpectedText, "The DOM should be properly updated");
				assert.equal(oInvalidateSpy.callCount, 0, "invalidate should not be called");

				// cleanup
				oInvalidateSpy.restore();
			});

			QUnit.test("_getTextButton3 should get the value from inner property", function (assert) {
				// arrange
				var bExpectedValue = true;
				this.oHeader._textButton3 = bExpectedValue;

				// act & assert
				assert.equal(this.oHeader._getTextButton3(), bExpectedValue, "_getTextButton3 should return the inner value property");
			});

			QUnit.test("_setTextButton4 should set property and change the text of the DOM element", function (assert) {
				this.oHeader._setVisibleButton4(true);
				// arrange
				var sExpectedText = "Expected text",
					oInvalidateSpy = this.spy(this.oHeader, "invalidate");

				// act
				this.oHeader._setTextButton4(sExpectedText);
				oCore.applyChanges();

				// assert
				assert.equal(this.oHeader._textButton4, sExpectedText, "inner property should be set properly");
				assert.equal(this.oHeader.$("B4").text(), sExpectedText, "The DOM should be properly updated");
				assert.equal(oInvalidateSpy.callCount, 0, "invalidate should not be called");

				// cleanup
				oInvalidateSpy.restore();
			});

			QUnit.test("_getTextButton4 should get the value from inner property", function (assert) {
				// arrange
				var bExpectedValue = true;
				this.oHeader._textButton4 = bExpectedValue;

				// act & assert
				assert.equal(this.oHeader._getTextButton4(), bExpectedValue, "_getTextButton4 should return the inner value property");
			});
		});

		QUnit.module("_set- and _getAriaLabelButton", function () {
			QUnit.test("_setAriaLabelButton3 should set property and change the aria-label of the DOM element", function (assert) {
				this.oHeader._setVisibleButton3(true);
				// arrange
				var sExpectedText = "Expected text",
					oInvalidateSpy = this.spy(this.oHeader, "invalidate");

				// act
				this.oHeader._setAriaLabelButton3(sExpectedText);
				oCore.applyChanges();

				// assert
				assert.equal(this.oHeader._ariaLabelButton3, sExpectedText, "inner property should be set properly");
				assert.equal(this.oHeader.$("B3").attr("aria-label"), sExpectedText, "The DOM should be properly updated");
				assert.equal(oInvalidateSpy.callCount, 0, "invalidate should not be called");

				// cleanup
				oInvalidateSpy.restore();
			});

			QUnit.test("_getAriaLabelButton3 should get the value from inner property", function (assert) {
				// arrange
				var bExpectedValue = true;
				this.oHeader._ariaLabelButton3 = bExpectedValue;

				// act & assert
				assert.equal(this.oHeader._getAriaLabelButton3(), bExpectedValue, "_getAriaLabelButton3 should return the inner value property");
			});

			QUnit.test("_setAriaLabelButton4 should set property and change the aria-label of the DOM element", function (assert) {
				this.oHeader._setVisibleButton4(true);
				// arrange
				var sExpectedText = "Expected text",
					oInvalidateSpy = this.spy(this.oHeader, "invalidate");

				// act
				this.oHeader._setAriaLabelButton4(sExpectedText);
				oCore.applyChanges();

				// assert
				assert.equal(this.oHeader._ariaLabelButton4, sExpectedText, "inner property should be set properly");
				assert.equal(this.oHeader.$("B4").attr("aria-label"), sExpectedText, "The DOM should be properly updated");
				assert.equal(oInvalidateSpy.callCount, 0, "invalidate should not be called");

				// cleanup
				oInvalidateSpy.restore();
			});

			QUnit.test("_getAriaLabelButton4 should get the value from inner property", function (assert) {
				// arrange
				var bExpectedValue = true;
				this.oHeader._ariaLabelButton4 = bExpectedValue;

				// act & assert
				assert.equal(this.oHeader._getAriaLabelButton4(), bExpectedValue, "_getAriaLabelButton4 should return the inner value property");
			});
		});

		// Fake test to have a root module with at least one test, otherwise qunit-2 will fail
		QUnit.test("Private API module starts", function (assert) {
			assert.ok(true, "assert ok");
		});
	});
});
