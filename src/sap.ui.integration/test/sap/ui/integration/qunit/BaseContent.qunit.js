/* global QUnit */

sap.ui.define([
	"sap/m/Text",
	"sap/ui/integration/cards/BaseContent",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core"
],
	function (
		Text,
		BaseContent,
		jquery,
		Core
	) {
		"use strict";

		var DOM_RENDER_LOCATION = "qunit-fixture";

		QUnit.module("Compact min height", {
			beforeEach: function () {
				this.oText = new Text();
			},
			afterEach: function () {
				this.oText.destroy();
				this.oText = null;
				jquery("html").removeClass("sapUiSizeCompact");
			}
		});

		QUnit.test("List card - min height in compact mode", function (assert) {

			//Arrange
			jquery("html").addClass("sapUiSizeCompact");
			this.oText.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			var sType = "ListContent",
				oConfiguration = {maxItems: 7, item: {
					icon:{}
				}};

			//Assert
			assert.equal(BaseContent.getMinHeight(sType, oConfiguration, this.oText), "14rem", "Min height in compact must be 14rem" );

		});

		QUnit.test("List card - min height in compact mode no icon or description", function (assert) {

			//Arrange
			jquery("html").addClass("sapUiSizeCompact");
			this.oText.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			var sType = "ListContent",
				oConfiguration = {maxItems: 7, item: {}};

			//Assert
			assert.equal(BaseContent.getMinHeight(sType, oConfiguration, this.oText), "14rem", "Min height in compact must be 14rem" );

		});

		QUnit.test("List card - min height in compact mode with icon or description", function (assert) {

			//Arrange
			jquery("html").addClass("sapUiSizeCompact");
			this.oText.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			var sType = "ListContent",
				oConfiguration = {maxItems: 7, item: {
					description: {}
				}};

			//Assert
			assert.equal(BaseContent.getMinHeight(sType, oConfiguration, this.oText), "35rem", "Min height in compact must be 35rem" );

		});

		QUnit.test("Table card - min height in compact mode", function (assert) {

			//Arrange
			jquery("html").addClass("sapUiSizeCompact");
			this.oText.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			var sType = "TableContent",
				oConfiguration = {maxItems: 7, item: {}};

			//Assert
			assert.equal(BaseContent.getMinHeight(sType, oConfiguration, this.oText), "16rem", "Min height in compact must be 16rem" );

		});

		QUnit.test("TimeLine card - min height in compact mode", function (assert) {

			//Arrange
			jquery("html").addClass("sapUiSizeCompact");
			this.oText.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			var sType = "TimelineContent",
				oConfiguration = {maxItems: 7, item: {}};

			//Assert
			assert.equal(BaseContent.getMinHeight(sType, oConfiguration, this.oText), "28rem", "Min height in compact must be 28rem" );

		});

		QUnit.module("Cozy min height", {
			beforeEach: function () {
				this.oText = new Text();
			},
			afterEach: function () {
				this.oText.destroy();
				this.oText = null;
			}
		});

		QUnit.test("List card - min height in cozy mode", function (assert) {

			//Arrange
			var sType = "ListContent",
				oConfiguration = {maxItems: 7, item: {
					icon:{}
				}};

			//Assert
			assert.equal(BaseContent.getMinHeight(sType, oConfiguration, this.oText), "19.25rem", "Min height in cozy must be 19.25rem" );

		});

		QUnit.test("List card  - min height in cozy mode no icon or description", function (assert) {

			//Arrange
			var sType = "ListContent",
				oConfiguration = {maxItems: 7, item: {}};

			//Assert
			assert.equal(BaseContent.getMinHeight(sType, oConfiguration, this.oText), "19.25rem", "Min height in cozy must be 19.25rem" );

		});

		QUnit.test("List card - min height in cozy mode with icon or description", function (assert) {

			//Arrange
			var sType = "ListContent",
				oConfiguration = {maxItems: 7, item: {
					description: {}
				}};

			//Assert
			assert.equal(BaseContent.getMinHeight(sType, oConfiguration, this.oText), "35rem", "Min height in cozy must be 35rem" );

		});

		QUnit.test("Table card  - min height in cozy mode", function (assert) {

			//Arrange
			var sType = "TableContent",
				oConfiguration = {maxItems: 7, item: {}};

			//Assert
			assert.equal(BaseContent.getMinHeight(sType, oConfiguration, this.oText), "22rem", "Min height in cozy must be 22rem" );

		});

		QUnit.test("TimeLine card  - min height in cozy mode", function (assert) {

			//Arrange
			var sType = "TimelineContent",
				oConfiguration = {maxItems: 7, item: {}};

			//Assert
			assert.equal(BaseContent.getMinHeight(sType, oConfiguration, this.oText), "35rem", "Min height in cozy must be 35rem" );

		});

	}
);
