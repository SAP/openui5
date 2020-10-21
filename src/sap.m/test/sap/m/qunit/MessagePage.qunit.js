/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/IconPool",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessagePage",
	"sap/m/Link",
	"sap/m/Button",
	"sap/ui/core/library"
], function(
	qutils,
	createAndAppendDiv,
	IconPool,
	JSONModel,
	MessagePage,
	Link,
	Button,
	coreLibrary
) {
	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	createAndAppendDiv("content").setAttribute("style", "height:100%;");



	var messagePageId = "testMessagePage";
	var IconPool = sap.ui.core.IconPool;

	function createMessagePage() {
		return new MessagePage(messagePageId,{
			title: "messagePage Title",
			text: "One Line Text",
			showHeader: true,
			showNavButton: true,
			description: "Description",
			icon: IconPool.getIconURI("documents"),
			iconAlt: "My Documents"
		});
	}

	function createMessagePageWithAggregations() {
		return new MessagePage(messagePageId,{
			text: "One Line Text",
			description: "Description",
			customText: new Link({ text: "This is a custom text"}),
			customDescription: new Link({ text: "This is a custom description"}),
			buttons: [
				new Button({text : "OK"}),
				new Button({text : "Cancel"})
			]
		});
	}

	QUnit.module("Basic rendering", {
		beforeEach: function() {
			this.oMessagePage = createMessagePage();
			this.oMessagePage.placeAt('content');
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oMessagePage.destroy();
			this.oMessagePage = null;
		}
	});

	QUnit.test("The control should be rendered", function(assert) {
		// Arrange
		var $oMessagePage = jQuery(".sapMMessagePage").length;

		// Assert
		assert.ok($oMessagePage, "MessagePage is rendered.");
		assert.ok(this.oMessagePage.getAggregation("_internalHeader"), "InternalHeader internal aggregation is set");
	});

	QUnit.test("The inner controls are rendered", function(assert) {
		// Assert
		assert.ok(this.oMessagePage.getDomRef("navButton"), "MessagePage navButton is rendered");
		assert.ok(this.oMessagePage.getDomRef("title"), "MessagePage title is rendered");
		assert.ok(this.oMessagePage.getDomRef("pageIcon"), "MessagePage icon is rendered");
		assert.ok(this.oMessagePage.getDomRef("text"), "MessagePage text is rendered");
		assert.ok(this.oMessagePage.getDomRef("description"), "MessagePage description is rendered");
	});

	QUnit.module("Aggregation rendering", {
		beforeEach: function() {
			this.oMessagePage = createMessagePageWithAggregations();
			this.oMessagePage.placeAt('content');
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oMessagePage.destroy();
			this.oMessagePage = null;
		}
	});

	QUnit.test("The aggregations are rendered", function(assert) {
		// Arrange
		var $customText = this.oMessagePage.$().find(".sapMMessagePageMainText"),
			$customDescription = this.oMessagePage.$().find(".sapMMessagePageDescription"),
			$buttonsWrapper = this.oMessagePage.$().find(".sapMMessagePageButtonsWrapper");

		// Assert
		assert.strictEqual($customText.length, 1, "MessagePage customText is rendered");
		assert.strictEqual($customText[0].tagName, "A", "customText is rendered as a link");
		assert.strictEqual($customDescription.length, 1, "MessagePage customDescription is rendered");
		assert.strictEqual($customDescription[0].tagName, "A", "customDescription is rendered as a link");
		assert.strictEqual($buttonsWrapper.length, 1, "MessagePage buttons are rendered");
		assert.strictEqual($buttonsWrapper.children().length, 2, "Message page has two buttons");
	});

	QUnit.test("Title is rendered only if set", function(assert) {
		// Arrange
		var $title = this.oMessagePage.$("title");

		// Assert init state
		assert.strictEqual(this.oMessagePage.getTitle(), "", "MessagePage is initialized with no title");

		// Assert
		assert.strictEqual($title.length, 0, "MessagePage title is not rendered");

		// Act
		this.oMessagePage.setTitle("Some string");
		sap.ui.getCore().applyChanges();

		$title = this.oMessagePage.$("title");

		// Assert
		assert.strictEqual($title.length, 1, "MessagePage title is rendered");
	});

	QUnit.module("Api tests", {
		beforeEach: function() {
			this.oMessagePage = createMessagePage();
			this.oMessagePage.placeAt('content');
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oMessagePage.destroy();
			this.oMessagePage = null;
		}
	});

	QUnit.test("The control setTitle should render the correct value", function(assert) {
		// Arrange
		var sExpectedValue = "Not default title",
			sActualValue;

		// Act
		this.oMessagePage.setTitle(sExpectedValue);
		sap.ui.getCore().applyChanges();

		// Assert
		sActualValue =  jQuery("#" + messagePageId + " .sapMTitle").text();
		assert.equal(sActualValue, sExpectedValue, "The title is correct");
	});

	QUnit.test("The control setText should set new value", function(assert) {
		// Arrange
		var sExpectedValue = "Not default text",
			sActualValue;

		// Act
		this.oMessagePage.setText(sExpectedValue);
		sap.ui.getCore().applyChanges();

		// Assert
		sActualValue =  jQuery(".sapMMessagePageMainText").text();
		assert.equal(sActualValue, sExpectedValue, "The text is correct");
	});

	QUnit.test("The control setDescription should return new value", function(assert) {
		// Arrange
		var sExpectedValue = "Not default text",
			sActualValue;

		// Act
		this.oMessagePage.setDescription(sExpectedValue);
		sap.ui.getCore().applyChanges();

		// Assert
		sActualValue =  jQuery(".sapMMessagePageDescription").text();

		assert.equal(sActualValue, sExpectedValue, "The text is correct");
	});

	QUnit.test("The control setHeader should be without header", function(assert) {
		// Arrange
		var iActualResult;

		// System under test
		this.oMessagePage.setShowHeader(false);
		sap.ui.getCore().applyChanges();

		iActualResult = jQuery("#" + messagePageId + " .sapMPageHeader").length;
		assert.ok(!iActualResult, "The header is not rendered");
	});


	QUnit.test("setIcon with icon URI", function(assert) {
		// Arrange
		var sNewIcon = IconPool.getIconURI("message-success");

		// Act: runtime change of the current Icon with new one, using standard icon URI.
		// In this case the MessagePage just updates the existing Icon control src.
		this.oMessagePage.setIcon(sNewIcon);

		assert.equal(this.oMessagePage.getIcon(), sNewIcon, "New Icon is set.");
		assert.equal(this.oMessagePage._oIconControl.getSrc(), sNewIcon, "New Icon is set.");
	});

	QUnit.test("setIcon with image URI", function(assert) {
		// Arrange
		var sNewImage = "test.png";

		// Act: runtime change of the current Icon with 'Image' (using none-existing URI).
		// In this case the MessagePage removes and destroys the existing Icon control
		// and creates new one.
		this.oMessagePage.setIcon(sNewImage);
		sap.ui.getCore().applyChanges();

		assert.equal(this.oMessagePage.getIcon(), sNewImage, "New Image is set.");
		assert.equal(this.oMessagePage._oIconControl.getSrc(), sNewImage, "New Icon is set.");
	});

	QUnit.test("Set iconAlt", function(assert) {
		// Assert
		assert.strictEqual(this.oMessagePage._oIconControl.getAlt(), "My Documents", "Alt property of the inner Icon image is properly set");
	});

	QUnit.test("Set textDirection", function(assert) {
		// Act
		this.oMessagePage.setTextDirection(TextDirection.RTL);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.oMessagePage.getDomRef().dir, "rtl", "Text direction is rtl");

		// Act
		this.oMessagePage.setTextDirection(TextDirection.LTR);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.oMessagePage.getDomRef().dir, "ltr", "Text direction is ltr");

		// Act
		this.oMessagePage.setTextDirection(TextDirection.Inherit);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.oMessagePage.getDomRef().dir, "", "Text direction is not set explicitly");
	});

	QUnit.test("Set enableFormattedText", function(assert) {
		// Act
		this.oMessagePage.setEnableFormattedText(true);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(this.oMessagePage.getDomRef("formattedText"), "FormattedText is rendered");
	});

	QUnit.module("Binding properties", {
		beforeEach: function() {
			var oModel = new JSONModel(
				{
					title: "Title",
					text: "text with braces {{}}"
				});
			sap.ui.getCore().setModel(oModel);

			this.oMessagePage = new MessagePage(messagePageId, {
				title: "{/title}",
				text: "{/text}",
				description: "{/text}"
			});

			this.oMessagePage.placeAt('content');
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oMessagePage.destroy();
			this.oMessagePage = null;
		}
	});

	QUnit.test("Braces in binded description and text properties are rendered", function(assert) {
		// Assert
		assert.strictEqual(this.oMessagePage._getText().getText(), "text with braces {{}}",
			"Braces are rendered in text");
		assert.strictEqual(this.oMessagePage._getDescription().getText(), "text with braces {{}}",
			"Braces are rendered in description");
	});

	QUnit.module("Destroying", {
		beforeEach: function() {
			this.oMessagePage = createMessagePage();
			this.oMessagePage.placeAt('content');
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oMessagePage = null;
		}
	});

	QUnit.test("The control destroy should destroy the control and all the inner containers", function(assert) {
		// System under test
		this.oMessagePage.destroy();

		assert.equal(this.oMessagePage._oNavButton, null, "The navButton should be null");
		assert.equal(this.oMessagePage._oIconControl, null, "The iconControl should be null");
	});

	QUnit.module("Aggregations", {
		beforeEach: function() {
			this.oMessagePage = createMessagePageWithAggregations();
			this.oMessagePage.placeAt('content');
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oMessagePage.destroy();
			this.oMessagePage = null;
		}
	});

	/* --------------------------- Accessibility -------------------------------------- */
	QUnit.module("Accessibility", {
		beforeEach: function() {
			this.oMessagePage = createMessagePageWithAggregations();
			this.oMessagePage.placeAt('content');
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oMessagePage.destroy();
			this.oMessagePage = null;
		}
	});

	QUnit.test("ARIA attributes", function(assert) {
		// Arrange
		var $oMessagePage = this.oMessagePage.$(),
			sExpectedRoleDescription = sap.ui.getCore().getLibraryResourceBundle("sap.m")
				.getText(this.oMessagePage.constructor.ARIA_ROLE_DESCRIPTION);

		// Assert
		assert.strictEqual($oMessagePage.attr('aria-roledescription'), sExpectedRoleDescription, "aria-roledescription is set");
	});

});