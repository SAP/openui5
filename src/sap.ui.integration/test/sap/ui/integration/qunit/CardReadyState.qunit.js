/* global QUnit */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/thirdparty/jquery"
], function (
	Card,
	jQuery
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
			this.deferredData = new jQuery.Deferred();
			this.stub(jQuery, "ajax").callsFake(function () {
				return this.deferredData.promise();
			}.bind(this));
			this.oCard = new Card({
				manifest: {
					"sap.app": {
						"id": "test.readyState.card"
					},
					"sap.card": {
						"type": "List",
						"data": {
							"request": {
								"url": "some/url"
							}
						},
						"header": {
							"title": "Title"
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
		// Arrange
		var done = assert.async(2);
		assert.expect(2);
		var deferred = new jQuery.Deferred();

		this.stub(sap.ui.integration.util.ContentFactory.prototype, "create").callsFake(function () {
			return deferred.promise();
		});

		this.oCard.attachEventOnce("manifestApplied", function () {
			this.oCard.attachEventOnce("_headerReady", function () {
				// Assert
				assert.ok(this.oCard.getCardHeader().isReady(), "Header should be ready");
				done();
			}.bind(this));

			this.oCard.attachEventOnce("_dataReady", function () {
				// Assert
				assert.ok(this.oCard._bDataReady, "Card data should be ready regardless of the content");
				done();
			}.bind(this));

			// Act
			this.deferredData.resolve({});
		}.bind(this));

		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

});