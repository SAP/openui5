/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/integration/widgets/Card",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery",
	"qunit/testResources/nextCardReadyEvent"
], function (
	Library,
	Card,
	nextUIUpdate,
	jQuery,
	nextCardReadyEvent
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

	QUnit.test("Ready state", async function (assert) {
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		// Arrange
		var oContent = this.oCard.getCardContent();

		// Assert
		assert.ok(oContent.isReady(), "Content is ready");
		assert.notOk(oContent.isLoading(), "The content should not have loading placeholders");
	});

	QUnit.test("Await event - content turns busy and loading placeholders are shown", async function (assert) {
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		// Arrange
		var oContent = this.oCard.getCardContent();

		// Act
		oContent.awaitEvent("someEvent", true);

		// Assert
		assert.notOk(oContent.isReady(), "Content should NOT be ready when event is awaited");
		assert.ok(oContent.isLoading(), "The content should have loading placeholders");
	});

	QUnit.test("Await the same event more than once", async function (assert) {
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

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

		this.oCard.attachEventOnce("manifestApplied", function () {
			this.oCard._contentPromise = deferred.promise();

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

	QUnit.module("Ready state with different data modes");

	QUnit.test("Default data mode, multiple times placeAt", async function (assert) {
		// Arrange
		var oCard = new Card("asd");

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		oCard.setManifest({
			"sap.app": {
				"id": "test.readyState.card"
			},
			"sap.card": {
				"type": "List",
				"data": {
					"json": {}
				},
				"content": {
					"item": {}
				}
			}
		});

		// Act - change the DOM ref
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextCardReadyEvent(oCard);

		assert.ok(true, "_ready event should be called even if the DOM ref of the card changes");
	});

	QUnit.module("Card Ready State");

	QUnit.test("_onReady should be called only once", async function (assert) {
		// Arrange
		const oCard = new Card();
		let oldPromises = [],
			allPromises = [];
		const onReadySpy = sinon.spy();

		oCard.attachEvent("_ready", onReadySpy);

		oCard._initReadyState();
		oldPromises = oCard._aReadyPromises;
		allPromises.concat(oldPromises);
		assert.ok(Array.isArray(oldPromises));
		oCard._clearReadyState();

		oCard._initReadyState();
		assert.notStrictEqual(oldPromises, oCard._aReadyPromises, "Promises array should have changed");
		oldPromises = oCard._aReadyPromises;
		allPromises = allPromises.concat(oldPromises);
		oCard._clearReadyState();

		oCard._initReadyState();
		assert.notStrictEqual(oldPromises, oCard._aReadyPromises, "Promises array should have changed");
		oldPromises = oCard._aReadyPromises;
		allPromises = allPromises.concat(oldPromises);

		// Act
		["_dataReady", "_dataPassedToContent", "_headerReady", "_filterBarReady", "_contentReady", "_paginatorReady"]
		.forEach((e) => oCard.fireEvent(e));

		await Promise.all(allPromises);
		assert.strictEqual(onReadySpy.callCount, 1, "Ready event should be fired only once");

		// Cleanup
		oCard.destroy();
	});

	QUnit.module("Ready State of Card which is NOT Rendered, using 'startManifestProcessing'", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("List card", async function (assert) {
		// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.readyState.card"
			},
			"sap.card": {
				"type": "List",
				"header": {},
				"content": {
					"item": {}
				}
			}
		});
		this.oCard.startManifestProcessing();

		await nextCardReadyEvent(this.oCard);

		// Assert
		assert.ok(true, "Ready event is fired");
	});

	QUnit.test("WebPage card", async function (assert) {
		// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.readyState.card"
			},
			"sap.card": {
				"type": "WebPage",
				"header": {},
				"content": {
					"src": "page.html"
				}
			}
		});
		this.oCard.startManifestProcessing();

		await nextCardReadyEvent(this.oCard);

		// Assert
		assert.ok(true, "Ready event is fired");
	});

	return Library.load("sap.viz").then(function () {
		QUnit.module("Ready state of analytical content", {
			beforeEach: function () {
				this.oCard = new Card({
					manifest: {
						"sap.app": {
							"id": "test.readyState.card"
						},
						"sap.card": {
							"type": "Analytical",
							"content": {
								"chartType": "Line"
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

		QUnit.test("Ready state", async function (assert) {
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);

			// Arrange
			var oContent = this.oCard.getCardContent();

			// Assert
			assert.ok(oContent.isReady(), "Content is ready");
			assert.notOk(oContent.isLoading(), "The content should not have loading placeholders");
		});
	}).catch(function () {
		QUnit.test("Analytical not supported", function (assert) {
			assert.ok(true, "Analytical content type is not available with this distribution.");
		});
	});

});
