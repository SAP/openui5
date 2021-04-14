/* global QUnit */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/util/RequestDataProvider"
], function (
	Card,
	RequestDataProvider
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Ready state of content", {
		beforeEach: function () {
			this.oCard = new Card({
				manifest: {
					"sap.app": {
						"id": "test.readyState.card"
					},
					"sap.card": {
						"type": "List",
						"content": {
							"item": { }
						}
					}
				}
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Await event - content turns busy and loading placeholders are shown", function (assert) {
		var done = assert.async();

		this.oCard.attachEventOnce("_ready", function () {
			// Arrange
			var oContent = this.oCard.getCardContent();

			// Act
			oContent.awaitEvent("someEvent", true);

			// Assert
			assert.notOk(oContent.isReady(), "Content should NOT be ready when event is awaited");
			assert.ok(oContent.isLoading(), "The content should have loading placeholders");

			done();
		}.bind(this));

		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Await the same event more than once", function (assert) {
		var done = assert.async();

		this.oCard.attachEventOnce("_ready", function () {
			// Arrange
			var oContent = this.oCard.getCardContent(),
				oAttachEventSpy = this.spy(oContent, "attachEventOnce");

			// Act
			oContent.awaitEvent("someEvent");
			oContent.awaitEvent("someEvent");
			oContent.awaitEvent("someEvent");

			// Assert
			assert.ok(oContent.isLoading(), "The content should have loading placeholders");
			assert.strictEqual(oContent._oAwaitedEvents.size, 1, "1 event should be counted for busy state");
			assert.strictEqual(oAttachEventSpy.callCount, 1, "Shouldn't attach listener to the same event more than once");

			done();
		}.bind(this));

		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.module("Card with data", {
		beforeEach: function () {
			var oData = {
				title: "Hello World"
			};
			this._fnRequestStub = this.stub(RequestDataProvider.prototype, "getData").resolves(oData);
			this.oCard = new Card({
				manifest: {
					"sap.app": {
						"id": "test.readyState.card"
					},
					"sap.card": {
						"type": "List",
						"data": {
							"request": {

							}
						},
						"content": {
							"item": { }
						}
					}
				}
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Card data is loaded, but content is still not", function (assert) {
		var done = assert.async();

		this.oCard.attachEventOnce("_ready", function () {
			// Arrange
			var oContent = this.oCard.getCardContent();
			oContent.awaitEvent("someSlowEvent", true);

			// Act
			this.oCard.getModel().fireEvent("change");

			// Assert
			assert.notOk(this.oCard.getCardHeader().isLoading(), "Header shouldn't be loading after data request of card is complete");
			assert.ok(oContent.isLoading(), "Content should still be loading after data request of card is complete");

			// Act
			oContent.fireEvent("someSlowEvent");
			assert.notOk(oContent.isLoading(), "Content should NOT be loading anymore when its internal events are complete");

			done();
		}.bind(this));

		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

});