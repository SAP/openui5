/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/IconPool",
	"sap/m/ObjectStatus",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/library",
	"sap/ui/core/ValueStateSupport",
	"sap/m/Panel",
	"sap/m/library",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Core",
	"sap/ui/events/jquery/EventExtension" // side effect: provides jQuery.event.prototype.getMark
], function(
	qutils,
	createAndAppendDiv,
	IconPool,
	ObjectStatus,
	jQuery,
	coreLibrary,
	ValueStateSupport,
	Panel,
	mobileLibrary,
	KeyCodes,
	oCore
) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.TextDirection
	var EmptyIndicatorMode = mobileLibrary.EmptyIndicatorMode;

	// shortcut for library resource bundle
	var oRb = oCore.getLibraryResourceBundle("sap.m");

	createAndAppendDiv("objectStatuses");


	var eventHandler = function (oEvent) {
		QUnit.assert.ok(true, "press event for status was fired");
	};

	var os1 = new ObjectStatus("os1",{
		text : "    Contract #D1234567890     "
		});

	var os2 = new ObjectStatus("os2",{
		icon: IconPool.getIconURI("inbox")
		});

	var os3 = new ObjectStatus("os3",{
		text : "Update by Mary Smith",
		icon: IconPool.getIconURI("inbox")
		});


	os1.placeAt("objectStatuses");
	os2.placeAt("objectStatuses");
	os3.placeAt("objectStatuses");

	QUnit.module("Rendering All Fields");

	QUnit.test("StatusRendered", function(assert) {

		assert.notEqual(document.getElementById("os1"), null, "Object Status #1 should be rendered.");
		assert.notEqual(document.getElementById("os2"), null, "Object Status #2 should be rendered.");
		assert.notEqual(document.getElementById("os3"), null, "Object Status #3 should be rendered.");
	});

	QUnit.test("IconOnly Class Rendered", function(assert) {
		// Assert
		var $objectStatus = os2.$("statusIcon");

		assert.ok($objectStatus.hasClass("sapMObjStatusIconOnly"), "ObjectStatus that has only icon has the correct class set.");

	});

	QUnit.test("render a placeholder if _isEmpty", function(assert) {
		//arrange
		var oOS = new ObjectStatus(),
			$OS;

		//act
		oOS.placeAt("qunit-fixture");
		oCore.applyChanges();

		$OS = jQuery("#" + oOS.getId());

		//assert
		assert.equal($OS.length, 1, "rendered even though it is empty");
		assert.equal($OS.eq(0).css("display"), "none", "not visible because it is empty");

		//clean
		oOS.destroy();
	});

	/******************************************************************/

	QUnit.module("Internal API");


	var os4 = new ObjectStatus("os4",{
		text : " \n \n  \t  \t",
		icon: " \n \n  \t  \t"
		});

	var os5 = new ObjectStatus("os5",{
		text : " \n \n  \t  \t"
		});

	var os6 = new ObjectStatus("os6",{
		icon: " \n \n  \t  \t"
		});

	var os7 = new ObjectStatus("os7",{
		text : "Update by Mary Smith",
		icon: IconPool.getIconURI("inbox"),
		visible: false
		});

	QUnit.test("TestIsEmpty", function(assert) {

		assert.ok(!os1._isEmpty(), "Object Status #1 is not empty");
		assert.ok(!os2._isEmpty(), "Object Status #2 is not empty");
		assert.ok(!os3._isEmpty(), "Object Status #3 is not empty");
		assert.ok(os4._isEmpty(), "Object Status #4 is empty");
		assert.ok(os5._isEmpty(), "Object Status #5 is empty");
		assert.ok(os6._isEmpty(), "Object Status #6 is empty");
		assert.ok(os7.$().length == 0, "Object Status #7 is not rendered");
	});

	QUnit.module("changing properties");

	QUnit.test("ObjectStatus if the text is changed", function(assert) {
		// Arrange
		var sTextToSet = "<script>alert(\"HAACKED\");<\/script>",
			oResult,
			oConstructor = { text : "not empty text"};

		// System under Test
		var oObjectStatus = new ObjectStatus(oConstructor).placeAt("qunit-fixture");
		oCore.applyChanges();

		// Act
		oResult = oObjectStatus.setText(sTextToSet);
		oCore.applyChanges();

		// Assert
		assert.strictEqual(oResult, oObjectStatus, "Should be able to chain");
		assert.ok(!/.*<script>.*/.test(oObjectStatus.$().children(".sapMObjStatusText").html()), "Did not contain a unescaped script tag");
		assert.strictEqual(oObjectStatus.getText(), sTextToSet, "Did set the non encoded string as value");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("ObjectStatus if the text is a number", function(assert) {
		// Arrange
		var iNumberToSet = 5,
			sTextToExpect = "5",
			oResult,
			oConstructor = { text : "not empty text"};

		// System under Test
		var oObjectStatus = new ObjectStatus(oConstructor).placeAt("qunit-fixture");
		oCore.applyChanges();

		// Act
		oResult = oObjectStatus.setText(iNumberToSet);
		oCore.applyChanges();

		// Assert
		assert.strictEqual(oResult, oObjectStatus, "Should be able to chain");
		assert.strictEqual(oObjectStatus.getText(), sTextToExpect, "Did set the number as a string as a value");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("ObjectStatus title is changed", function(assert) {
		// Arrange
		var sTextToSet = "<script>alert(\"HAACKED\");<\/script>",
			oResult,
			oConstructor = { title : "not empty text"};

		// System under Test
		var oObjectStatus = new ObjectStatus(oConstructor).placeAt("qunit-fixture");
		oCore.applyChanges();

		// Act
		oResult = oObjectStatus.setTitle(sTextToSet);
		oCore.applyChanges();

		// Assert
		assert.strictEqual(oResult, oObjectStatus, "Should be able to chain");

		assert.ok(!/.*<script>.*/.test(oObjectStatus.$().children(".sapMObjStatusTitle").html()), "Did not contain a unescaped script tag");

		var sDisplayedTitle = oObjectStatus.$().children(".sapMObjStatusTitle").text();
		assert.ok(sDisplayedTitle.indexOf(":", sDisplayedTitle.length - 1) , "Did contain a :");
		assert.strictEqual(oObjectStatus.getTitle(), sTextToSet, "Did set the non encoded string as value");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("ObjectStatus if the title is a number", function(assert) {
		// Arrange
		var iNumberToSet = 5,
			sTitleToExpect = "5",
			oResult,
			oConstructor = { title : "not empty text"},
			oObjectStatus,
			$Title;

		// System under Test
		oObjectStatus = new ObjectStatus(oConstructor).placeAt("qunit-fixture");
		oCore.applyChanges();

		// Act
		oResult = oObjectStatus.setTitle(iNumberToSet);
		oCore.applyChanges();
		$Title = oObjectStatus.$().children(".sapMObjStatusTitle");

		// Assert
		assert.strictEqual(oResult, oObjectStatus, "Should be able to chain");
		assert.notOk(/.*<script>.*/.test($Title.html()), "Did not contain a unescaped script tag");
		assert.strictEqual($Title.attr("data-colon"), ":", "Did have an attribute containing a :");

		// OR is used here because of buggy behaviour of the Firefox browser, where it seems
		// getComputedStyle() cannot resolve properly the value of the 'content' property
		// and retuns the declaration instead of the value
		assert.ok((window.getComputedStyle($Title[0], ':after').getPropertyValue('content') === '":"'
			|| window.getComputedStyle($Title[0], ':after').getPropertyValue('content') === "attr(data-colon)"), "Did contain a :");

		assert.strictEqual(oObjectStatus.getTitle(), sTitleToExpect, "Did set the number as a string as a value");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("if the new text is empty", function(assert) {
		// Arrange
		var sTextToSet = "  ",
			oConstructor = { text : "not empty text"};

		// System under Test
		var oObjectStatus = new ObjectStatus(oConstructor).placeAt("qunit-fixture");
		oCore.applyChanges();

		// Act
		oObjectStatus.setText(sTextToSet);
		oCore.applyChanges();

		// Assert
		assert.ok(!oObjectStatus.$().children(".sapMObjStatusText").length, "Did not render the text span");
		assert.strictEqual(oObjectStatus.getText(), sTextToSet, "Did set the value");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("if the new title is empty", function(assert) {
		// Arrange
		var sTitleToSet = "  ",
			oConstructor = { title : "not empty text"};

		// System under Test
		var oObjectStatus = new ObjectStatus(oConstructor).placeAt("qunit-fixture");
		oCore.applyChanges();

		// Act
		oObjectStatus.setTitle(sTitleToSet);
		oCore.applyChanges();

		// Assert
		assert.ok(!oObjectStatus.$().children(".sapMObjStatusTitle").length, "Did not render the title span");
		assert.strictEqual(oObjectStatus.getTitle(), sTitleToSet, "Did set the value");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("if the new text is undefined", function(assert) {
		// Arrange
		var sTextToSet,
			oConstructor = { text : "not empty text"};

		// System under Test
		var oObjectStatus = new ObjectStatus(oConstructor).placeAt("qunit-fixture");
		oCore.applyChanges();

		// Act
		oObjectStatus.setText(sTextToSet);
		oCore.applyChanges();

		// Assert
		assert.ok(!oObjectStatus.$().children(".sapMObjStatusText").length, "Did not render the text span");
		assert.strictEqual(oObjectStatus.getText(), "", "Did set the default value");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("if the new title is undefined", function(assert) {
		// Arrange
		var sTitleToSet,
			oConstructor = { title : "not empty text"};

		// System under Test
		var oObjectStatus = new ObjectStatus(oConstructor).placeAt("qunit-fixture");
		oCore.applyChanges();

		// Act
		oObjectStatus.setTitle(sTitleToSet);
		oCore.applyChanges();

		// Assert
		assert.ok(!oObjectStatus.$().children(".sapMObjStatusTitle").length, "Did not render the title span");
		assert.strictEqual(oObjectStatus.getTitle(), "", "Did set the default value");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("Should rerender if the text was empty before", function(assert) {
		// Arrange
		var sTextToSet = "not empty text",
			oConstructor = { text : ""};

		// System under Test
		var oObjectStatus = new ObjectStatus(oConstructor).placeAt("qunit-fixture");
		oCore.applyChanges();

		// Act
		oObjectStatus.setText(sTextToSet);
		oCore.applyChanges();

		// Assert
		assert.ok(oObjectStatus.$().children(".sapMObjStatusText").length, "Did render the text span");
		assert.strictEqual(oObjectStatus.getText(), sTextToSet, "Did set the value");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("Should rerender if the title was empty before", function(assert) {
		// Arrange
		var sTitleToSet = "not empty text",
			oConstructor = { title : ""};

		// System under Test
		var oObjectStatus = new ObjectStatus(oConstructor).placeAt("qunit-fixture");
		oCore.applyChanges();

		// Act
		oObjectStatus.setTitle(sTitleToSet);
		oCore.applyChanges();

		// Assert
		assert.ok(oObjectStatus.$().children(".sapMObjStatusTitle").length, "Did render the title span");
		assert.strictEqual(oObjectStatus.getTitle(), sTitleToSet, "Did set the value");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("Should display titles with special characters correctly", function(assert) {
		// Arrange
		var sTitleToSet = "Account blocked - Blocked for payment",
			oConstructor = { title : "not empty text"};

		// System under Test
		var oObjectStatus = new ObjectStatus(oConstructor).placeAt("qunit-fixture");
		oCore.applyChanges();

		// Act
		oObjectStatus.setTitle(sTitleToSet);
		oCore.applyChanges();

		// Assert
		assert.strictEqual(oObjectStatus.getTitle(), sTitleToSet, "Did set the value");
		assert.ok(/.*Account blocked - Blocked for payment.*/.test(oObjectStatus.$().children(".sapMObjStatusTitle").html()), "Did display dashed string correctly");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("Should display texts with special characters correctly", function(assert) {
		// Arrange
		var sTextToSet = "Account blocked - Blocked for payment",
			oConstructor = { text : "not empty text"};

		// System under Test
		var oObjectStatus = new ObjectStatus(oConstructor).placeAt("qunit-fixture");
		oCore.applyChanges();

		// Act
		oObjectStatus.setText(sTextToSet);
		oCore.applyChanges();

		// Assert
		assert.strictEqual(oObjectStatus.getText(), sTextToSet, "Did set the value");
		assert.ok(/.*Account blocked - Blocked for payment.*/.test(oObjectStatus.$().children(".sapMObjStatusText").html()), "Did display dashed string correctly");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("Should display titles with special characters correctly", function(assert) {
		// Arrange
		var sTitleToSet = "Account blocked - Blocked for payment",
			oConstructor = { title : "not empty text"};

		// System under Test
		var oObjectStatus = new ObjectStatus(oConstructor).placeAt("qunit-fixture");
		oCore.applyChanges();

		// Act
		oObjectStatus.setTitle(sTitleToSet);
		oCore.applyChanges();

		// Assert
		assert.strictEqual(oObjectStatus.getTitle(), sTitleToSet, "Did set the value");
		assert.ok(/.*Account blocked - Blocked for payment.*/.test(oObjectStatus.$().children(".sapMObjStatusTitle").html()), "Did display dashed string correctly");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("setState", function(assert) {
		// Arrange
		var oObjectStatus = new ObjectStatus({text: "test", state: "Warning"});


		oObjectStatus.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		assert.strictEqual(oObjectStatus.getState(), "Warning", "correct state is set");

		// Act
		oObjectStatus.setState("Indication02");
		oCore.applyChanges();

		// Assert
		assert.strictEqual(oObjectStatus.getState(), "Indication02", "correct state is set");

		// Act
		oObjectStatus.setState(null);
		oCore.applyChanges();

		// Assert
		assert.strictEqual(oObjectStatus.getState(), "None", "state 'None' is set by default if null is given");

		try {
			// Act
			oObjectStatus.setState("noSuchState");
			oCore.applyChanges();
		} catch (err) {
			// Assert
			assert.ok(true, "Error is thrown:" + err);
		}

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.module("Screen reader ARIA support");

	QUnit.test("General ARIA attributes", function (assert) {
		//Arrange
		var oObjectStatus = new ObjectStatus({text: "Success object status", state: ValueState.Success});

		oObjectStatus.placeAt("qunit-fixture");
		oCore.applyChanges();

		//Act
		assert.strictEqual(oObjectStatus.$().attr("aria-roledescription"), oCore.getLibraryResourceBundle("sap.m").getText("OBJECT_STATUS"),
			"Custom control name is in aria-roledescription");
		assert.notOk(oObjectStatus.$().children(":last-child").attr("aria-hidden"), "hidden element doesn't have aria-hidden attribute");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("getAccessibilityInfo", function(assert) {
		var oControl = new ObjectStatus({text: "Text", title: "Title", tooltip: "Tooltip"}),
			sCustomControlName = oCore.getLibraryResourceBundle("sap.m").getText("OBJECT_STATUS");

		assert.ok(!!oControl.getAccessibilityInfo, "ObjectStatus has a getAccessibilityInfo function");

		var oInfo = oControl.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.strictEqual(oInfo.role, undefined, "AriaRole");
		assert.strictEqual(oInfo.type, undefined, "Type");
		assert.strictEqual(oInfo.description, "Title Text  Tooltip " + sCustomControlName, "Description");
		assert.strictEqual(oInfo.focusable, undefined, "Focusable");
		assert.strictEqual(oInfo.enabled, undefined, "Enabled");
		assert.strictEqual(oInfo.editable, undefined, "Editable");

		oControl.setState("Warning");
		oControl.setTitle("");
		oInfo = oControl.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, "Text " + ValueStateSupport.getAdditionalText(oControl.getState()) + " " +
			oControl.getTooltip() + " " + sCustomControlName, "Description");

		oControl.setText("").setTitle("").setTooltip("").setState("None");
		oInfo = oControl.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, "", "Description is empty if no text, title, tooltip or state are provided");

		oControl.destroy();
	});

	QUnit.test("Active ObjectStatus specific ARIA", function(assert) {
		// Arrange
		var oObjectStatus = new ObjectStatus({
			title: "Title",
			text: "Contract #D1234567890",
			active: true
		});

		oObjectStatus.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		assert.equal(oObjectStatus.$().attr("role"), "button", "Active ObjectStatus has button role");

		// Clean up
		oObjectStatus.destroy();
	});

	QUnit.test("Inactive ObjectStatus specific ARIA", function (assert) {
		// Arrange
		var oObjectStatus = new ObjectStatus({
			title: "Title",
			text: "Contract #D1234567890"
		});

		oObjectStatus.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		assert.equal(oObjectStatus.$().attr("role"), "group", "Inactive ObjectStatus has group role");

		// Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("State element is being referenced", function (assert) {
		// Arrange
		var sId = "os",
			oObjectStatus = new ObjectStatus(sId, {
			text: "Something"
		});

		oObjectStatus.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		assert.notOk(document.getElementById(sId + "-state"), "Hidden state text element has not been created");

		// Act
		oObjectStatus.setState(ValueState.Error);
		oCore.applyChanges();

		// Assert
		assert.ok(document.getElementById(sId + "-state"), "Hidden state text element has been created");
		assert.strictEqual(document.getElementById(sId + "-state").innerHTML, oObjectStatus._getStateText(ValueState.Error),
			"The value of the hidden state text element is proper");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("Tooltip and aria-describedby", function (assert) {
		// Arrange
		var sId = "os",
			oObjectStatus = new ObjectStatus(sId, {
				title: "Something",
				tooltip: "Good"
			}).placeAt("qunit-fixture");

		oCore.applyChanges();

		// Assert
		assert.notOk(document.getElementById(sId + "-tooltip"), "Hidden tooltip text element has not been created");

		// Act
		oObjectStatus.addAriaDescribedBy("boo");
		oCore.applyChanges();

		// Assert
		assert.ok(document.getElementById(sId + "-tooltip"), "Hidden tooltip text element has been created");
		assert.strictEqual(document.getElementById(sId + "-tooltip").innerHTML, "Good",
			"The value of the hidden tooltip text element is correct");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("Internal icon ARIA for icon-only ObjectStatus", function (assert) {
		// Arrange
		var oCore = sap.ui.getCore(),
			oObjectStatus = new ObjectStatus({
				icon: "sap-icon://status-inactive"
			}),
			$oInternalIcon;

		oObjectStatus.placeAt("qunit-fixture");
		oCore.applyChanges();

		$oInternalIcon = oObjectStatus._oImageControl.$();

		// Assert
		assert.strictEqual($oInternalIcon.attr("role"), "img", "Icon isn't decorative in icon-only ObjectStatus");
		assert.strictEqual($oInternalIcon.attr("aria-label"), oCore.getLibraryResourceBundle("sap.m").getText("OBJECT_STATUS_ICON"),
			"Icon has alternative text in icon-only ObjectStatus");

		// Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("Internal icon ARIA for non-icon-only ObjectStatus", function (assert) {
		// Arrange
		var oObjectStatus = new ObjectStatus({
				icon: "sap-icon://status-inactive",
				text: "Something"
			}),
			$oInternalIcon;

		oObjectStatus.placeAt("qunit-fixture");
		oCore.applyChanges();

		$oInternalIcon = oObjectStatus._oImageControl.$();

		// Assert
		assert.strictEqual($oInternalIcon.attr("role"), "presentation", "Icon is decorative in non-icon-only ObjectStatus");
		assert.notOk($oInternalIcon.attr("aria-label"), "Icon doesn't have alternative text in non-icon-only ObjectStatus");

		// Cleanup
		oObjectStatus.destroy();
	});

	QUnit.module("textDirection");

	QUnit.test("Title and Text has dir set to LTR when Inherit", function (assert) {
		//Arange
		var oObjectStatus = new ObjectStatus({title: "Staus", text: "Success object"});
		oObjectStatus.placeAt("qunit-fixture");
		oCore.applyChanges();

		//Act
		assert.equal(oObjectStatus.$("title").attr("dir"), "ltr", "When the textDirection has the Inherit value, for the title is set LTR when on LTR page");
		assert.equal(oObjectStatus.$("text").attr("dir"), "ltr", "When the textDirection has the Inherit value, for the text is set LTR when on LTR page");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("Title and Text has dir set to RTL when textDirection=RTL", function (assert) {
		//Arange
		var oObjectStatus = new ObjectStatus({title: "Staus", text: "Success object", textDirection: TextDirection.RTL});
		oObjectStatus.placeAt("qunit-fixture");
		oCore.applyChanges();

		//Act
		assert.equal(oObjectStatus.$("title").attr("dir"), "rtl", "When textDirection=RTL, for the title is set also RTL");
		assert.equal(oObjectStatus.$("text").attr("dir"), "rtl", "When textDirection=RTL, for the text is set also RTL");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.module("Active status", {
		beforeEach: function () {
			this.oActiveStat = new ObjectStatus("oStatus", {
				title: "Title",
				text: "Contract #D1234567890",
				icon: "sap-icon://alert",
				active: true
			});
		},
		afterEach: function () {
			this.oActiveStat.destroy();
		}
	});


	QUnit.test("Active status has 'sapMObjStatusActive' class and icon and text are encapsulated in one span", function(assert) {
		this.oActiveStat.placeAt("qunit-fixture");
		oCore.applyChanges();

		// assertions
		assert.ok(this.oActiveStat.$().hasClass("sapMObjStatusActive"), "Active status has sapMObjStatusActive class.");
		assert.ok(this.oActiveStat.$().children(1).hasClass("sapMObjStatusLink"), "The span that holds Icon and Text has class sapMObjStatusLink.");
		assert.strictEqual(this.oActiveStat.$().children().length, 2, "sapMObjStatusLink span has two children");
		assert.strictEqual(this.oActiveStat.$().find(".sapMObjStatusIcon").length, 1, "The icon span has class sapMObjStatusIcon.");
		assert.strictEqual(this.oActiveStat.$().find(".sapMObjStatusText").length, 1, "The text span has class sapMObjStatusText.");
	});

	QUnit.test("Active status with empty icon and text", function(assert) {
		this.oActiveStat.setText("");
		this.oActiveStat.setIcon("");
		this.oActiveStat.placeAt("qunit-fixture");
		oCore.applyChanges();

		// assertions
		assert.ok(!this.oActiveStat.$().hasClass("sapMObjStatusActive"), "Active class is not set when there is no icon and text.");
		assert.ok(!this.oActiveStat.$().children().hasClass("sapMObjStatusLink"), "There is no class sapMObjStatusLink.");
	});

	QUnit.module("Private function _isClickable", {
		beforeEach: function () {
			this.oActiveStat = new ObjectStatus("oStatus", {
				title: "Title",
				text: "Contract #D1234567890",
				icon: "sap-icon://alert",
				active: true
			});
			this.oActiveStat.placeAt("qunit-fixture");
			oCore.applyChanges();

			this.oStub = sinon.stub(ObjectStatus.prototype, "_isActive");
		},
		afterEach: function () {
			this.oStub.restore();

			this.oActiveStat.destroy();
		}
	});

	QUnit.test("When _isActive is true and target click is on text", function(assert) {
		// Arrange
		var oEvent = new jQuery.Event();

		this.oStub.withArgs().returns(true);
		oEvent.target = this.oActiveStat.$().find(".sapMObjStatusText")[0];

		// Act
		assert.ok(this.oActiveStat._isClickable(oEvent), "The 'Status' is clickable");
	});

	QUnit.test("When _isActive is true and target click is on the wrapper of the icon", function(assert) {
		// Arrange
		var oEvent = new jQuery.Event();

		this.oStub.withArgs().returns(true);
		oEvent.target = this.oActiveStat.$().find(".sapMObjStatusIcon")[0];

		// Act
		assert.ok(this.oActiveStat._isClickable(oEvent), "The 'Status' is clickable");
	});

	QUnit.test("When _isActive is true and target click is on icon", function(assert) {
		// Arrange
		var oEvent = new jQuery.Event();

		this.oStub.withArgs().returns(true);
		oEvent.target = this.oActiveStat.$().find(".sapUiIcon")[0];

		// Act
		assert.ok(this.oActiveStat._isClickable(oEvent), "The 'Status' is clickable");
	});


	QUnit.test("When _isActive is true and target click is on wrapper IconText", function(assert) {
		// Arrange
		var oEvent = new jQuery.Event();

		this.oStub.withArgs().returns(true);
		oEvent.target = this.oActiveStat.$().children()[1];

		// Act
		assert.ok(this.oActiveStat._isClickable(oEvent), "The 'Status' is clickable");
	});

	QUnit.test("When _isActive is false", function(assert) {
		// Arrange
		var oEvent = new jQuery.Event();

		this.oStub.withArgs().returns(false);
		oEvent.target = this.oActiveStat.$().find(".sapMObjStatusText")[0];

		// Act
		assert.ok(!this.oActiveStat._isClickable(oEvent), "The 'Status' is not clickable");
	});


	QUnit.module("Events", {
		beforeEach: function () {
			this.oActiveStat = new ObjectStatus("oStatus", {
				title: "Title",
				icon: "sap-icon://alert",
				text: "Contract #D1234567890",
				active: true,
				press: eventHandler
			});
		},
		afterEach: function () {
			this.oActiveStat.destroy();
		}
	});

	QUnit.test("press active ObjectStatus with text and icon", function(assert) {
		// Act
		this.oActiveStat.placeAt("qunit-fixture");
		oCore.applyChanges();

		assert.expect(3);
		qutils.triggerEvent("tap", this.oActiveStat.$().children()[1]); // click on a wrapper IconText span, should fire event
		qutils.triggerEvent("tap", this.oActiveStat.$().find(".sapMObjStatusText")); //should fire event
		qutils.triggerEvent("tap", this.oActiveStat.$().find(".sapMObjStatusIcon")); //should fire event
		qutils.triggerEvent("tap", this.oActiveStat.$().children()[0]);//click on a title should not fire event
	});

	QUnit.test("press title of active ObjectStatus with no text and icon should not fire event", function(assert) {
		this.oActiveStat.setText("");
		this.oActiveStat.setIcon("");

		// Act
		this.oActiveStat.placeAt("qunit-fixture");
		oCore.applyChanges();

		assert.expect(0);
		qutils.triggerEvent("tap", this.oActiveStat.$().children()[0]);//click on a title should not fire event
	});


	QUnit.test("ObjectStatus marks the Event on touchstart", function(assert) {
		// Arrange
		var oEvent = new jQuery.Event();

		// Act
		this.oActiveStat.placeAt("qunit-fixture");
		oCore.applyChanges();

		oEvent.target = this.oActiveStat.$().find(".sapMObjStatusText")[0];
		this.oActiveStat.ontouchstart(oEvent);

		assert.strictEqual(oEvent.getMark(), true, "Event was marked so the parent control will know that it will be handled by the ObjectStatus");
	});

	QUnit.module("Keyboard handling");

	QUnit.test("Enter", function(assert) {

		// Arrange
		var oObjectStatus = new ObjectStatus({
			title: "Title",
			text: "Contract #D1234567890",
			active: true
		});

		// Act
		oObjectStatus.placeAt("qunit-fixture");
		oCore.applyChanges();

		var oPressSpy = sinon.spy(ObjectStatus.prototype, "firePress");
		qutils.triggerKeydown(oObjectStatus.getFocusDomRef(), KeyCodes.ENTER);

		assert.strictEqual(oPressSpy.callCount, 1, "Enter is pressed, press event was fired");

		// Clean up
		ObjectStatus.prototype.firePress.restore();
		oObjectStatus.destroy();
	});

	QUnit.test("Space", function(assert) {

		// Arrange
		var oObjectStatus = new ObjectStatus({
			title: "Title",
			text: "Contract #D1234567890",
			active: true
		});

		// Act
		oObjectStatus.placeAt("qunit-fixture");
		oCore.applyChanges();

		var oPressSpy = sinon.spy(ObjectStatus.prototype, "firePress");
		qutils.triggerKeydown(oObjectStatus.getFocusDomRef(), KeyCodes.SPACE);

		assert.strictEqual(oPressSpy.callCount, 1, "Space is pressed, press event was fired");

		// Clean up
		ObjectStatus.prototype.firePress.restore();
		oObjectStatus.destroy();
	});

	QUnit.module("EmptyIndicator", {
		beforeEach : function() {
			this.oText = new ObjectStatus({
				text: "",
				emptyIndicatorMode: EmptyIndicatorMode.On
			});

			this.oTextEmptyAuto = new ObjectStatus({
				text: "",
				emptyIndicatorMode: EmptyIndicatorMode.Auto
			});

			this.oTextEmptyAutoNoClass = new ObjectStatus({
				text: "",
				emptyIndicatorMode: EmptyIndicatorMode.Auto
			});

			this.oPanel = new Panel({
				content: this.oTextEmptyAuto
			}).addStyleClass("sapMShowEmpty-CTX");

			this.oPanel1 = new Panel({
				content: this.oTextEmptyAutoNoClass
			});

			this.oText.placeAt("qunit-fixture");
			this.oPanel.placeAt("qunit-fixture");
			this.oPanel1.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach : function() {
			this.oText.destroy();
			this.oTextEmptyAuto.destroy();
			this.oTextEmptyAutoNoClass.destroy();
			this.oPanel.destroy();
			this.oPanel1.destroy();
		}
	});

	QUnit.test("Indicator should be rendered", function(assert) {
		var oSpan = this.oText.getDomRef().childNodes[0];
		assert.strictEqual(oSpan.firstElementChild.textContent, oRb.getText("EMPTY_INDICATOR"), "Empty indicator is rendered");
		assert.strictEqual(oSpan.firstElementChild.getAttribute("aria-hidden"), "true", "Accessibility attribute is set");
		assert.strictEqual(oSpan.lastElementChild.textContent, oRb.getText("EMPTY_INDICATOR_TEXT"), "Accessibility text is added");
	});

	QUnit.test("Indicator should not be rendered when text is not empty", function(assert) {
		//Arrange
		this.oText.setText("test");
		oCore.applyChanges();

		//Assert
		assert.strictEqual(this.oText.getDomRef().childNodes[0].textContent, "test", "Empty indicator is not rendered");
	});

	QUnit.test("Indicator should not be rendered when property is set to off", function(assert) {
		//Arrange
		this.oText.setEmptyIndicatorMode(EmptyIndicatorMode.Off);
		oCore.applyChanges();
		//Assert
		assert.strictEqual(this.oText.getDomRef().textContent, "", "Empty indicator is not rendered");
	});

	QUnit.test("Indicator should be rendered, when sapMShowEmpty-CTX is added to parent", function(assert) {
		//Assert
		var oSpan = this.oTextEmptyAuto.getDomRef().childNodes[0];
		assert.strictEqual(oSpan.firstElementChild.textContent, oRb.getText("EMPTY_INDICATOR"), "Empty indicator is rendered");
		assert.strictEqual(oSpan.firstElementChild.getAttribute("aria-hidden"), "true", "Accessibility attribute is set");
		assert.strictEqual(oSpan.lastElementChild.textContent, oRb.getText("EMPTY_INDICATOR_TEXT"), "Accessibility text is added");
	});

	QUnit.test("Indicator should not be rendered when text is available", function(assert) {
		//Arrange
		this.oTextEmptyAuto.setText("test");
		oCore.applyChanges();

		//Assert
		assert.strictEqual(this.oTextEmptyAuto.getDomRef().childNodes[0].textContent, "test", "Empty indicator is not rendered");
	});

	QUnit.test("Indicator should be rendered when 'sapMShowEmpty-CTX' is added", function(assert) {
		var oSpan = this.oTextEmptyAutoNoClass.getDomRef().childNodes[0];
		//Assert
		assert.strictEqual(window.getComputedStyle(oSpan)["display"], "none", "Empty indicator is not rendered");
		//Arrange
		this.oPanel1.addStyleClass("sapMShowEmpty-CTX");
		oCore.applyChanges();

		//Assert
		assert.strictEqual(window.getComputedStyle(oSpan)["display"], "inline-block", "Empty indicator is rendered");
	});

	QUnit.test("Indicator should not be rendered when property is set to off and there is a text", function(assert) {
		//Arrange
		this.oText.setEmptyIndicatorMode(EmptyIndicatorMode.Off);
		this.oText.setText("test");
		oCore.applyChanges();

		//Assert
		assert.strictEqual(this.oText.getDomRef().childNodes[0].textContent, "test", "Empty indicator is not rendered");
	});
});