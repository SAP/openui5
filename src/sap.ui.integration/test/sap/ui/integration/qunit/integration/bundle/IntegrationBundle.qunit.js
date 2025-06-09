/*global QUnit*/

sap.ui.define([
], (
) => {
	"use strict";

	QUnit.module("Integration Bundle", {
		before: function () {
			this.iframe = document.createElement("iframe");
			this.iframe.src = sap.ui.require.toUrl("qunit/integration/bundle/testPage/index.html");
			document.getElementById("qunit-fixture").appendChild(this.iframe);

			const { promise, resolve } = Promise.withResolvers();
			this.iframe.addEventListener("load", resolve, { once: true });

			return promise;
		},
		after: function () {
			this.iframe.remove();
		}
	});

	QUnit.test("Loading declarative list card", function (assert) {
		// Arrange
		const done = assert.async();
		const card = this.iframe.contentDocument.getElementById("card1");

		card.addEventListener("manifestApplied", () => {
			// Assert
			assert.ok(true, "List card manifest is applied");
			assert.notOk(
				this.iframe.contentWindow._integrationExtBundleLoaded,
				`'sap-ui-integration-ext.js' bundle should NOT be loaded for declarative list card.
				All the necessary modules should be included in the 'sap-ui-integration.js' bundle.`
			);

			done();
		});

		// Act
		card.manifest = {
			"sap.app": {
				"id": "sap.ui.integration.qunit.integration.bundle.card1",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Card 1"
				},
				"content": {
					"data": {
						"path": "/items"
					},
					"item": {
						"title": "{name}",
						"description": "{description}",
						"icon": "{icon}"
					}
				},
				"data": {
					"json": {
						"items": [
							{
								"name": "Item 1",
								"description": "Description 1",
								"icon": "sap-icon://accept"
							},
							{
								"name": "Item 2",
								"description": "Description 2",
								"icon": "sap-icon://decline"
							}
						]
					}
				}
			}
		};
	});
});