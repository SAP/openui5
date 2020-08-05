/*global QUnit */
sap.ui.define([
	"jquery.sap.global",
	"sap/m/FeedContent",
	"sap/ui/core/TooltipBase",
	"sap/m/library"
], function(jQuery, FeedContent, TooltipBase, library) {
	"use strict";

	// shortcut for sap.m.ValueColor
	var ValueColor = library.ValueColor;

	// shortcut for sap.m.Size
	var Size = library.Size;

	QUnit.module("Rendering test - sap.m.FeedContent", {
		beforeEach : function() {
			this.oFeedContent = new FeedContent("feed-cnt", {
				size : Size.M,
				contentText : "@@notify Great outcome of the Presentation today. The new functionality and the new design was well received.",
				subheader : "about 1 minute ago in Computer Market",
				valueColor : ValueColor.Neutral,
				truncateValueTo : 4,
				value : "-888"
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oFeedContent.destroy();
			this.oFeedContent = null;
		}
	});

	QUnit.test("Feed Content rendered.", function(assert) {
		assert.ok(jQuery.sap.domById("feed-cnt"),"FeedContent was rendered successfully");
		assert.ok(jQuery.sap.domById("feed-cnt-content-text"),"Content text was rendered successfully");
		assert.ok(jQuery.sap.domById("feed-cnt-subheader"),"Subheader was rendered successfully");
		assert.ok(jQuery.sap.domById("feed-cnt-value"),"Value was rendered successfully");
	});

	QUnit.module("Functional tests - sap.m.FeedContent", {
		beforeEach : function() {
			this.oFeedContent = new FeedContent({
				size : Size.M,
				valueColor : ValueColor.Neutral,
				truncateValueTo : 4,
				value : "-888"
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oFeedContent.destroy();
			this.oFeedContent = null;
		}
	});

	QUnit.test("Alternative text tests", function(assert) {
		//Act
		var sAltText = this.oFeedContent.getAltText();
		//Assert
		assert.equal(sAltText, "-888", "Alternative text is correct");

		//Arrange
		this.oFeedContent.setSubheader("Subheader");
		//Act
		sAltText = this.oFeedContent.getAltText();
		//Assert
		assert.equal(sAltText, "Subheader\n-888", "Alternative text is correct with subheader");

		//Arrange
		this.oFeedContent.setContentText("Content");
		//Act
		sAltText = this.oFeedContent.getAltText();
		//Assert
		assert.equal(sAltText, "Content\nSubheader\n-888", "Alternative text is correct with content text");
	});

	QUnit.test("Tooltip tests", function(assert) {
		//Arrange
		this.oFeedContent.setTooltip(null);
		//Act
		var sTooltip = this.oFeedContent.getTooltip_AsString();
		//Assert
		assert.deepEqual(sTooltip, "", "No tooltip is correct");

		//Arrange
		this.oFeedContent.setTooltip("Tooltip");
		//Act
		var sTooltip = this.oFeedContent.getTooltip_AsString();
		//Assert
		assert.deepEqual(sTooltip, "Tooltip", "Tooltip is correct");

		//Arrange
		var oTooltip = new TooltipBase({text: "Tooltip"});
		this.oFeedContent.setTooltip(oTooltip);
		//Act
		var sTooltip = this.oFeedContent.getTooltip_AsString();
		//Assert
		assert.deepEqual(sTooltip.getText(), "Tooltip", "Tooltip is an object with a text property containing the correct string"); //TODO
	});

	QUnit.module("Events test", {
		beforeEach : function() {
			this.oFeedContent = new FeedContent({
				size : Size.M,
				valueColor : ValueColor.Neutral,
				truncateValueTo : 4,
				value : "-888"
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oFeedContent.destroy();
			this.oFeedContent = null;
		}
	});

	QUnit.test("Attach events", function(assert) {
		//Arrange
		//Act
		var oFeedContent = this.oFeedContent.attachEvent("hover", fnHoverHandler, this.oFeedContent);
		//Assert
		assert.deepEqual(oFeedContent, this.oFeedContent, "NumericContent returned is equal to initial one");
		assert.equal(hasAttribute("tabindex", this.oFeedContent), false, "Attribute has not been added successfully since press handler was not available");
		assert.equal(this.oFeedContent.$().hasClass("sapMPointer"), false, "Class has not been added successfully since press handler was not available");

		//Arrange
		//Act
		oFeedContent = this.oFeedContent.attachEvent("press", fnPressHandler, this.oFeedContent);
		//Assert
		assert.ok(hasAttribute("tabindex", this.oFeedContent), "Attribute has been added successfully since press handler was available");
		assert.ok(this.oFeedContent.$().hasClass("sapMPointer"), "Class has been added successfully since press handler was available");
	});

	QUnit.test("Detach events.", function(assert) {
		//Arrange
		//Act
		var oFeedContent = this.oFeedContent.detachEvent("press", fnPressHandler, this.oFeedContent);
		//Assert
		assert.deepEqual(oFeedContent, this.oFeedContent, "NumericContentreturned is equal to initial one");
		assert.equal(hasAttribute("tabindex", this.oFeedContent), false, "Attribute not available since press was not defined");
		assert.equal(this.oFeedContent.$().hasClass("sapMPointer"), false, "Class not available since press was not defined");

		//Arrange
		oFeedContent = this.oFeedContent.attachEvent("press", fnPressHandler, this.oFeedContent);
		oFeedContent = this.oFeedContent.attachEvent("hover", fnHoverHandler, this.oFeedContent);
		//Act
		oFeedContent = this.oFeedContent.detachEvent("hover", fnHoverHandler, this.oFeedContent);
		//Assert
		assert.ok(hasAttribute("tabindex", this.oFeedContent), "Attribute still available since hover was unregistered (not press)");
		assert.ok(this.oFeedContent.$().hasClass("sapMPointer"), "Class still available since hover was unregistered (not press)");

		//Arrange
		//Act
		oFeedContent = this.oFeedContent.detachEvent("press", fnPressHandler, this.oFeedContent);
		//Assert
		assert.equal(hasAttribute("tabindex", this.oFeedContent), false, "Attribute has been removed successfully");
		assert.equal(this.oFeedContent.$().hasClass("sapMPointer"), false, "Class has been removed successfully");
	});

	/* --- Helpers --- */

	function fnHoverHandler() {
	}

	function fnPressHandler() {
	}

	function hasAttribute(sAttribute, oCurrentObject) {
		var sAttributeValue = oCurrentObject.$().attr(sAttribute);
		if (typeof sAttributeValue !== typeof undefined && sAttributeValue !== false) {
			return true;
		} else {
			return false;
		}
	}

});