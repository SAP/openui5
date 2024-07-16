/*global QUnit, sinon */
sap.ui.define([
	"sap/m/NewsContent",
	"sap/m/MessageToast",
	"sap/ui/core/TooltipBase",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(NewsContent, MessageToast, TooltipBase, nextUIUpdate) {
	"use strict";


	QUnit.module("Basic rendering", {
		beforeEach : async function() {
			this.oNewsContent = new NewsContent("news-cnt", {
				contentText : "SAP Unveils Powerful New Player Comparison Tool Exclusively on NFL.com",
				subheader : "August 21, 2013",
				tooltip : "Test tooltip",
				press : function() {
					MessageToast.show("The news content is pressed.");
				}
			});
			this.oNewsContent.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach : function() {
			this.oNewsContent.destroy();
		}
	});

	QUnit.test("News Content rendered.", async function(assert) {
		// Arrange
		var oSpy = sinon.spy(this.oNewsContent, "_setPointerOnContentText");
		// Act
		this.oNewsContent.invalidate();
		await nextUIUpdate();
		// Assert
		assert.ok(document.getElementById("news-cnt"), "NewsContent was rendered successfully");
		assert.ok(document.getElementById("news-cnt-content-text"), "Content text was rendered successfully");
		assert.ok(document.getElementById("news-cnt-subheader"), "Subheader was rendered successfully");
		assert.equal(oSpy.callCount, 1, "During rendering _setPointerOnContentText has been called");
	});

	QUnit.test("HTML ContentText", async function(assert) {
		//Act
		this.oNewsContent.setContentText("My <u>new</u> Text");
		await nextUIUpdate();
		//Assert
		assert.equal(this.oNewsContent.getProperty("contentText"), "My <u>new</u> Text", "ContentText text has HTML");
		assert.equal(this.oNewsContent._oContentText.getHtmlText(), "My <u>new</u> Text", "Inner text has HTML");
		assert.equal(document.getElementById("news-cnt-content-text").innerHTML, "My <u style=\"position: static !important;\">new</u> Text", "Inner text is parsed in DOM");
	});

	QUnit.test("HTML Subheader", async function(assert) {
		//Act
		this.oNewsContent.setSubheader("My <u>new</u> Text");
		await nextUIUpdate();
		//Assert
		assert.equal(this.oNewsContent.getProperty("subheader"), "My <u>new</u> Text", "Subheader text has HTML");
		assert.equal(this.oNewsContent._oSubHeaderText.getHtmlText(), "My <u>new</u> Text", "Inner text has HTML");
		assert.equal(document.getElementById("news-cnt-subheader-text").innerHTML, "My <u style=\"position: static !important;\">new</u> Text", "Inner text is parsed in DOM");
	});

	QUnit.module("Functional tests", {
		beforeEach : async function() {
			this.oNewsContent = new NewsContent({
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach : function () {
			this.oNewsContent.destroy();
			this.oNewsContent = null;
		}
	});

	QUnit.test("Setter method 'setSubheader'", function(assert) {
		//Act
		var oResult = this.oNewsContent.setSubheader("My new Text");
		//Assert
		assert.deepEqual(oResult, this.oNewsContent, "Instance is returned");
		assert.equal(this.oNewsContent.getProperty("subheader"), "My new Text", "Control property updated");
		assert.equal(this.oNewsContent._oSubHeaderText.getHtmlText(), "My new Text", "Inner control property updated");
	});

	QUnit.test("Setter method 'setContentText'", function(assert) {
		//Act
		var oResult = this.oNewsContent.setContentText("My new Text");
		//Assert
		assert.deepEqual(oResult, this.oNewsContent, "Instance is returned");
		assert.equal(this.oNewsContent.getProperty("contentText"), "My new Text", "Control property updated");
		assert.equal(this.oNewsContent._oContentText.getHtmlText(), "My new Text", "Inner control property updated");
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
		beforeEach : async function() {
			this.oNewsContent = new NewsContent({
				contentText : "SAP Unveils Powerful New Player Comparison Tool Exclusively on NFL.com",
				subheader : "August 21, 2013",
				tooltip : "Test tooltip"
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
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
		if (typeof sAttributeValue !== "undefined" && sAttributeValue !== false) {
			return true;
		} else {
			return false;
		}
	}

});