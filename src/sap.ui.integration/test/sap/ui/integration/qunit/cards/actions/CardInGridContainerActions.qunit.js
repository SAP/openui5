/* global QUnit */

sap.ui.define([
	"sap/f/GridContainer",
	"sap/ui/integration/widgets/Card",
	"./ListItemCardActionsTests"
], function(
	GridContainer,
	Card,
	listItemCardActionsTests
) {
	"use strict";

	const DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Actions in GridContainer", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/",
				action: (oEvent) => {
					oEvent.preventDefault();
				}
			});

			this.oGridContainer = new GridContainer({
				items: [this.oCard]
			});

			this.oGridContainer.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oGridContainer.destroy();
		}
	});

	listItemCardActionsTests();
});
