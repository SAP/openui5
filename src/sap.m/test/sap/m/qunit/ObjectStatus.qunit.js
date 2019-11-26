/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/IconPool",
	"sap/m/ObjectStatus",
	"jquery.sap.global",
	"sap/ui/core/library",
	"sap/ui/core/ValueStateSupport",
	"sap/ui/events/jquery/EventExtension",
	"jquery.sap.keycodes"
], function(
	qutils,
	createAndAppendDiv,
	IconPool,
	ObjectStatus,
	jQuery,
	coreLibrary,
	ValueStateSupport,
	EventExtension
) {
	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	createAndAppendDiv("objectStatuses");


	var eventHandler = function (oEvent) {
		assert.ok(true, "press event for status was fired");
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

		assert.notEqual(jQuery.sap.domById("os1"), null, "Object Status #1 should be rendered.");
		assert.notEqual(jQuery.sap.domById("os2"), null, "Object Status #2 should be rendered.");
		assert.notEqual(jQuery.sap.domById("os3"), null, "Object Status #3 should be rendered.");
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
		sap.ui.getCore().applyChanges();

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
			oRenderSpy,
			oResult,
			oConstructor = { text : "not empty text"};

		// System under Test
		var oObjectStatus = new ObjectStatus(oConstructor).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oResult = oObjectStatus.setText(sTextToSet);
		sap.ui.getCore().applyChanges();

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
			oRenderSpy,
			oResult,
			oConstructor = { text : "not empty text"};

		// System under Test
		var oObjectStatus = new ObjectStatus(oConstructor).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oResult = oObjectStatus.setText(iNumberToSet);
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

		// Act
		oResult = oObjectStatus.setTitle(sTextToSet);
		sap.ui.getCore().applyChanges();

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
			oConstructor = { title : "not empty text"};

		// System under Test
		var oObjectStatus = new ObjectStatus(oConstructor).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oResult = oObjectStatus.setTitle(iNumberToSet);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oResult, oObjectStatus, "Should be able to chain");
		assert.ok(!/.*<script>.*/.test(oObjectStatus.$().children(".sapMObjStatusTitle").html()), "Did not contain a unescaped script tag");
		assert.strictEqual(oObjectStatus.$().children(".sapMObjStatusTitle").text(), oObjectStatus.getTitle() + ":", "Did contain a :");
		assert.strictEqual(oObjectStatus.getTitle(), sTitleToExpect, "Did set the number as a string as a value");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("if the new text is empty", function(assert) {
		// Arrange
		var sTextToSet = "  ",
			oResult,
			oConstructor = { text : "not empty text"};

		// System under Test
		var oObjectStatus = new ObjectStatus(oConstructor).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oResult = oObjectStatus.setText(sTextToSet);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(!oObjectStatus.$().children(".sapMObjStatusText").length, "Did not render the text span");
		assert.strictEqual(oObjectStatus.getText(), sTextToSet, "Did set the value");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("if the new title is empty", function(assert) {
		// Arrange
		var sTitleToSet = "  ",
			oResult,
			oConstructor = { title : "not empty text"};

		// System under Test
		var oObjectStatus = new ObjectStatus(oConstructor).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oResult = oObjectStatus.setTitle(sTitleToSet);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(!oObjectStatus.$().children(".sapMObjStatusTitle").length, "Did not render the title span");
		assert.strictEqual(oObjectStatus.getTitle(), sTitleToSet, "Did set the value");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("if the new text is undefined", function(assert) {
		// Arrange
		var sTextToSet,
			oResult,
			oConstructor = { text : "not empty text"};

		// System under Test
		var oObjectStatus = new ObjectStatus(oConstructor).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oResult = oObjectStatus.setText(sTextToSet);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(!oObjectStatus.$().children(".sapMObjStatusText").length, "Did not render the text span");
		assert.strictEqual(oObjectStatus.getText(), "", "Did set the default value");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("if the new title is undefined", function(assert) {
		// Arrange
		var sTitleToSet,
			oResult,
			oConstructor = { title : "not empty text"};

		// System under Test
		var oObjectStatus = new ObjectStatus(oConstructor).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oResult = oObjectStatus.setTitle(sTitleToSet);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(!oObjectStatus.$().children(".sapMObjStatusTitle").length, "Did not render the title span");
		assert.strictEqual(oObjectStatus.getTitle(), "", "Did set the default value");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("Should rerender if the text was empty before", function(assert) {
		// Arrange
		var sTextToSet = "not empty text",
			oResult,
			oConstructor = { text : ""};

		// System under Test
		var oObjectStatus = new ObjectStatus(oConstructor).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oResult = oObjectStatus.setText(sTextToSet);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(oObjectStatus.$().children(".sapMObjStatusText").length, "Did render the text span");
		assert.strictEqual(oObjectStatus.getText(), sTextToSet, "Did set the value");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("Should rerender if the title was empty before", function(assert) {
		// Arrange
		var sTitleToSet = "not empty text",
			oResult,
			oConstructor = { title : ""};

		// System under Test
		var oObjectStatus = new ObjectStatus(oConstructor).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oResult = oObjectStatus.setTitle(sTitleToSet);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(oObjectStatus.$().children(".sapMObjStatusTitle").length, "Did render the title span");
		assert.strictEqual(oObjectStatus.getTitle(), sTitleToSet, "Did set the value");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("Should display titles with special characters correctly", function(assert) {
		// Arrange
		var sTitleToSet = "Account blocked - Blocked for payment",
			oResult,
			oConstructor = { title : "not empty text"};

		// System under Test
		var oObjectStatus = new ObjectStatus(oConstructor).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oResult = oObjectStatus.setTitle(sTitleToSet);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oObjectStatus.getTitle(), sTitleToSet, "Did set the value");
		assert.ok(/.*Account blocked - Blocked for payment:.*/.test(oObjectStatus.$().children(".sapMObjStatusTitle").html()), "Did display dashed string correctly");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("Should display texts with special characters correctly", function(assert) {
		// Arrange
		var sTextToSet = "Account blocked - Blocked for payment",
			oResult,
			oConstructor = { text : "not empty text"};

		// System under Test
		var oObjectStatus = new ObjectStatus(oConstructor).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oResult = oObjectStatus.setText(sTextToSet);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oObjectStatus.getText(), sTextToSet, "Did set the value");
		assert.ok(/.*Account blocked - Blocked for payment.*/.test(oObjectStatus.$().children(".sapMObjStatusText").html()), "Did display dashed string correctly");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("Should display titles with special characters correctly", function(assert) {
		// Arrange
		var sTitleToSet = "Account blocked - Blocked for payment",
			oResult,
			oConstructor = { title : "not empty text"};

		// System under Test
		var oObjectStatus = new ObjectStatus(oConstructor).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oResult = oObjectStatus.setTitle(sTitleToSet);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oObjectStatus.getTitle(), sTitleToSet, "Did set the value");
		assert.ok(/.*Account blocked - Blocked for payment:.*/.test(oObjectStatus.$().children(".sapMObjStatusTitle").html()), "Did display dashed string correctly");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("setState", function(assert) {
		// Arrange
		var oObjectStatus = new ObjectStatus({text: "test", state: "Warning"});


		oObjectStatus.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oObjectStatus.getState(), "Warning", "correct state is set");

		// Act
		oObjectStatus.setState("Indication02");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oObjectStatus.getState(), "Indication02", "correct state is set");

		// Act
		oObjectStatus.setState(null);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oObjectStatus.getState(), "None", "state 'None' is set by default if null is given");

		try {
			// Act
			oObjectStatus.setState("noSuchState");
			sap.ui.getCore().applyChanges();
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
		var oObjectStatus = new ObjectStatus({text: "Success object status", state: ValueState.Success}),
			oCore = sap.ui.getCore();

		oObjectStatus.placeAt("qunit-fixture");
		oCore.applyChanges();

		//Act
		assert.strictEqual(oObjectStatus.$().attr("aria-roledescription"), oCore.getLibraryResourceBundle("sap.m").getText("OBJECT_STATUS"),
			"Custom control name is in aria-roledescription");
		assert.ok(oObjectStatus.$().attr("aria-describedby"), "aria-describedby attribute is present");
		assert.notOk(oObjectStatus.$().children(":last-child").attr("aria-hidden"), "hidden element doesn't have aria-hidden attribute");

		//Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("getAccessibilityInfo", function(assert) {
		var oControl = new ObjectStatus({text: "Text", title: "Title", tooltip: "Tooltip"}),
			sCustomControlName = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("OBJECT_STATUS");

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

		// Assert
		assert.equal(oObjectStatus.$().attr("role"), "group", "Inactive ObjectStatus has group role");

		// Cleanup
		oObjectStatus.destroy();
	});

	QUnit.test("Hidden state element invisibility class", function (assert) {
		// Arrange
		var oObjectStatus = new ObjectStatus("os", {
			text: "Something",
			state: ValueState.Error
		});

		oObjectStatus.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(oObjectStatus.$().find("#ossapSRH").hasClass("sapUiPseudoInvisibleText"),
			"Hidden state element has the pseudo invisibility class");

		assert.notOk(jQuery("#ossapSRH").hasClass("sapUiInvisibleText"),
			"Hidden state element doesn't have the pure invisible text class");

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
			sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

		assert.expect(0);
		qutils.triggerEvent("tap", this.oActiveStat.$().children()[0]);//click on a title should not fire event
	});


	QUnit.test("ObjectStatus marks the Event on touchstart", function(assert) {
		// Arrange
		var oEvent = new jQuery.Event();

		// Act
		this.oActiveStat.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

		var oPressSpy = sinon.spy(ObjectStatus.prototype, "firePress");
		sap.ui.test.qunit.triggerKeydown(oObjectStatus.getFocusDomRef(), jQuery.sap.KeyCodes.ENTER);

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
		sap.ui.getCore().applyChanges();

		var oPressSpy = sinon.spy(ObjectStatus.prototype, "firePress");
		sap.ui.test.qunit.triggerKeydown(oObjectStatus.getFocusDomRef(), jQuery.sap.KeyCodes.SPACE);

		assert.strictEqual(oPressSpy.callCount, 1, "Space is pressed, press event was fired");

		// Clean up
		ObjectStatus.prototype.firePress.restore();
		oObjectStatus.destroy();
	});
});