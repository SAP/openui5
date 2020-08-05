/*global QUnit, sinon */
sap.ui.define([
	"jquery.sap.global",
	"sap/m/NewsContent",
	"sap/m/MessageToast",
	"sap/ui/core/TooltipBase",
	"sap/m/library"
], function(jQuery, NewsContent, MessageToast, TooltipBase, library) {
	"use strict";


	// shortcut for sap.m.Size
	var Size = library.Size;


	QUnit.module("Basic rendering", {
		beforeEach : function() {
			this.oNewsContent = new NewsContent("news-cnt", {
				size : Size.M,
				contentText : "SAP Unveils Powerful New Player Comparison Tool Exclusively on NFL.com",
				subheader : "August 21, 2013",
				tooltip : "Test tooltip",
				press : function() {
					MessageToast.show("The news content is pressed.");
				}
			});
			this.oNewsContent.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oNewsContent.destroy();
		}
	});

	QUnit.test("News Content rendered.", function(assert) {
		// Arrange
		var oSpy = sinon.spy(this.oNewsContent, "_setPointerOnContentText");
		// Act
		this.oNewsContent.rerender();
		// Assert
		assert.ok(jQuery.sap.domById("news-cnt"), "NewsContent was rendered successfully");
		assert.ok(jQuery.sap.domById("news-cnt-content-text"), "Content text was rendered successfully");
		assert.ok(jQuery.sap.domById("news-cnt-subheader"), "Subheader was rendered successfully");
		assert.equal(oSpy.callCount, 1, "During rendering _setPointerOnContentText has been called");
	});

	QUnit.module("Functional tests", {
		beforeEach : function() {
			this.oNewsContent = new NewsContent({
				size : Size.M
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oNewsContent.destroy();
			this.oNewsContent = null;
		}
	});

	QUnit.test("Setter method 'setContentText'", function(assert) {
		//Act
		var oResult = this.oNewsContent.setContentText("My new Text");
		//Assert
		assert.deepEqual(oResult, this.oNewsContent, "Instance is returned");
		assert.equal(this.oNewsContent.getProperty("contentText"), "My new Text", "Control property updated");
		assert.equal(this.oNewsContent._oContentText.getText(), "My new Text", "Inner control property updated");
	});

	QUnit.test("Alternative text tests", function(assert) {
		//Act
		var sAltText = this.oNewsContent.getAltText();
		//Assert
		assert.equal(sAltText, "", "Alternative text is correct");

		//Arrange
		this.oNewsContent.setSubheader("August 21, 2013");
		//Act
		sAltText = this.oNewsContent.getAltText();
		//Assert
		assert.equal(sAltText, "August 21, 2013", "Alternative text is correct with subheader");

		//Arrange
		this.oNewsContent.setContentText("SAP Unveils Powerful New Player Comparison Tool Exclusively on NFL.com");
		//Act
		sAltText = this.oNewsContent.getAltText();
		//Assert
		assert.equal(sAltText, "SAP Unveils Powerful New Player Comparison Tool Exclusively on NFL.com\nAugust 21, 2013", "Alternative text is correct with content text");
	});

	QUnit.test("Tooltip tests", function(assert) {
		//Arrange
		this.oNewsContent.setTooltip(null);
		//Act
		var sTooltip = this.oNewsContent.getTooltip_AsString();
		//Assert
		assert.deepEqual(sTooltip, "", "No tooltip is correct");

		//Arrange
		this.oNewsContent.setTooltip("Tooltip");
		//Act
		var sTooltip = this.oNewsContent.getTooltip_AsString();
		//Assert
		assert.deepEqual(sTooltip, "Tooltip", "Tooltip is correct");

		//Arrange
		var oTooltip = new TooltipBase({text: "Tooltip"});
		this.oNewsContent.setTooltip(oTooltip);
		//Act
		var sTooltip = this.oNewsContent.getTooltip_AsString();
		//Assert
		assert.deepEqual(sTooltip.getText(), "Tooltip", "Tooltip is an object with a text property containing the correct string"); //TODO
	});

	QUnit.module("Events test", {
		beforeEach : function() {
			this.oNewsContent = new NewsContent({
				size : Size.M,
				contentText : "SAP Unveils Powerful New Player Comparison Tool Exclusively on NFL.com",
				subheader : "August 21, 2013",
				tooltip : "Test tooltip"
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oNewsContent.destroy();
			this.oNewsContent = null;
		}
	});

	QUnit.test("Attach events", function(assert) {
		//Arrange
		//Act
		var oNewsContent = this.oNewsContent.attachEvent("hover", fnHoverHandler, this.oNewsContent);
		//Assert
		assert.deepEqual(oNewsContent, this.oNewsContent, "NumericContent returned is equal to initial one");
		assert.equal(hasAttribute("tabindex", this.oNewsContent), false, "Attribute has not been added successfully since press handler was not available");
		assert.equal(this.oNewsContent.$().hasClass("sapMPointer"), false, "Class has not been added successfully since press handler was not available");

		//Arrange
		//Act
		oNewsContent = this.oNewsContent.attachEvent("press", fnPressHandler, this.oNewsContent);
		//Assert
		assert.ok(hasAttribute("tabindex", this.oNewsContent), "Attribute has been added successfully since press handler was available");
		assert.ok(this.oNewsContent.$().hasClass("sapMPointer"), "Class has been added successfully since press handler was available");
		assert.ok(this.oNewsContent.getAggregation("_contentText").hasStyleClass("sapMPointer"), "Class has been successfully added to the inner sap.m.Text");
	});

	QUnit.test("Detach events.", function(assert) {
		//Arrange
		//Act
		var oNewsContent = this.oNewsContent.detachEvent("press", fnPressHandler, this.oNewsContent);
		//Assert
		assert.deepEqual(oNewsContent, this.oNewsContent, "NumericContentreturned is equal to initial one");
		assert.equal(hasAttribute("tabindex", this.oNewsContent), false, "Attribute not available since press was not defined");
		assert.equal(this.oNewsContent.$().hasClass("sapMPointer"), false, "Class not available since press was not defined");
		assert.notOk(this.oNewsContent.getAggregation("_contentText").hasStyleClass("sapMPointer"), "Class has been successfully removed to the inner sap.m.Text");

		//Arrange
		oNewsContent = this.oNewsContent.attachEvent("press", fnPressHandler, this.oNewsContent);
		oNewsContent = this.oNewsContent.attachEvent("hover", fnHoverHandler, this.oNewsContent);
		//Act
		oNewsContent = this.oNewsContent.detachEvent("hover", fnHoverHandler, this.oNewsContent);
		//Assert
		assert.ok(hasAttribute("tabindex", this.oNewsContent), "Attribute still available since hover was unregistered (not press)");
		assert.ok(this.oNewsContent.$().hasClass("sapMPointer"), "Class still available since hover was unregistered (not press)");

		//Arrange
		//Act
		oNewsContent = this.oNewsContent.detachEvent("press", fnPressHandler, this.oNewsContent);
		//Assert
		assert.equal(hasAttribute("tabindex", this.oNewsContent), false, "Attribute has been removed successfully");
		assert.equal(this.oNewsContent.$().hasClass("sapMPointer"), false, "Class has been removed successfully");
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