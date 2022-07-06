/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/ObjectAttribute",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/ObjectHeader",
	"sap/m/ObjectListItem",
	"sap/m/library",
	"sap/ui/events/KeyCodes",
	"sap/m/Link",
	"sap/m/Text",
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"sap/ui/events/KeyCodes"
], function(
	qutils,
	createAndAppendDiv,
	ObjectAttribute,
	Table,
	Column,
	ColumnListItem,
	ObjectHeader,
	ObjectListItem,
	mobileLibrary,
	KeyCodes,
	Link,
	Text,
	oCore,
	coreLibrary
) {
	"use strict";

	// shortcut for sap.m.EmptyIndicatorMode and sap.ui.core.TextDirection
	var EmptyIndicatorMode = mobileLibrary.EmptyIndicatorMode,
		TextDirection = coreLibrary.TextDirection;

	// shortcut for library resource bundle
	var oRb = oCore.getLibraryResourceBundle("sap.m");

	createAndAppendDiv("objectAttributes");
	createAndAppendDiv("objectAttributesWrap");



	var eventHandler = function (oEvent) {
		QUnit.assert.ok(true, "press event for attribute was fired");
	};

	var eventHandlerForTableRow = function (oEvent) {
		QUnit.assert.ok(true, "press event for table was fired");
	};

	var oa1 = new ObjectAttribute("oa1", {
		title: "Title",
		text: "Contract #D1234567890",
		active: true,
		press: eventHandler
		});

	var oa2 = new ObjectAttribute("oa2", {
		text: "Created by John Doe",
		active: true,
		press: eventHandler
		});

	var oa3 = new ObjectAttribute("oa3", {
		text: "Update by Mary Smith",
		active: true,
		press: eventHandler
		});

	var oa4 = new ObjectAttribute("oa4", {
		text : "",
		press: eventHandler
		});

	var oa5 = new ObjectAttribute("oa5", {
		press: eventHandler
	});

	var oa6 = new ObjectAttribute("oa6", {
		text: "    \n \n \t\n \t   ",
		press: eventHandler
		});

	var oa7 = new ObjectAttribute("oa7", {
		text: "Joe Smith",
		active: true,
		press: eventHandler
		});

	var oTable = new Table("table",{
					inset : false,
					showUnread : true,
					headerText : "Personal Info",
					columns : [
						new Column({
						styleClass : "key",
						vAlign : "Middle",
						width : "35%",
						hAlign : "Right"
						})
					],
					items : [
						new ColumnListItem("table-item", {
							cells : [ oa7 ],
							press : eventHandlerForTableRow,
							type : "Navigation",
							unread : false
						})
					]
	});

	oa1.placeAt("objectAttributes");
	oa2.placeAt("objectAttributes");
	oa3.placeAt("objectAttributes");
	oTable.placeAt("objectAttributes");

	QUnit.module("Rendering All Fields");

	QUnit.test("AttributesRendered", function(assert) {

		assert.notEqual(document.getElementById("oa1"), null, "Object attribute #1 should be rendered.");
		assert.notEqual(document.getElementById("oa2"), null, "Object attribute #2 should be rendered.");
		assert.notEqual(document.getElementById("oa3"), null, "Object attribute #3 should be rendered.");
	});

	QUnit.test("Screen reader", function(assert) {

		// Arrange
		var oObjectAttribute = new ObjectAttribute({
			title: "Title",
			text: "Contract #D1234567890",
			active: true
		});

		// System under Test
		oObjectAttribute.placeAt("qunit-fixture");
		oCore.applyChanges();

		assert.equal(
			oObjectAttribute.getDomRef().querySelector(".sapMObjectAttributeText").getAttribute("role"),
			"link",
			"Active ObjectAttribute text has link role."
		);

		// Clean up
		oObjectAttribute.destroy();

	});

	QUnit.test("In french language there is an extra space before each colon", function(assert) {
		var sOriginalLanguage = oCore.getConfiguration().getLanguage(),
			oObjectAttribute;

		// Arrange
		oCore.getConfiguration().setLanguage("fr");

		// Act
		oObjectAttribute = new ObjectAttribute({
			title: "Title",
			text: "Contract #D1234567890"
		}).placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		assert.equal(oObjectAttribute.$().text(), "Title : Contract #D1234567890", "The output text of the control is correct.");

		// Clean up
		oObjectAttribute.destroy();

		oCore.getConfiguration().setLanguage(sOriginalLanguage);
	});

	QUnit.test("Text-only ObjectAttribute renders correctly", function(assert) {
		// arrange, act
		var oAttr = new ObjectAttribute({
			text: "dummy"
		}).placeAt("qunit-fixture");
		oCore.applyChanges();

		// assert
		assert.equal(oAttr.getDomRef().innerText, "dummy", "has the text rendered");

		// clean
		oAttr.destroy();
	});

	QUnit.module("Attributes Wrapping");

	QUnit.test("Attributes Wrapping in ObjectHeader", function(assert) {

		// arrange
		var oAttr = new ObjectAttribute("oOA1", {title: "Test",
			text:"ObjectHeader wrapping"}),
			oObjectHeader = new ObjectHeader("oOH1", {
				attributes : [oAttr]
			});

		oObjectHeader.placeAt("objectAttributesWrap");

		oCore.applyChanges();

		// assertions
		assert.ok(oAttr.$().hasClass("sapMObjectAttributeDiv"), "sapMObjectAttributeDiv class is present.");
		assert.ok(oAttr.$("title").hasClass("sapMObjectAttributeTitle"), "The title span has class sapMObjectAttributeTitle.");
		assert.ok(oAttr.$("colon").hasClass("sapMObjectAttributeColon"), "The colon span has class sapMObjectAttributeColon.");
		assert.ok(oAttr.$("text").hasClass("sapMObjectAttributeText"), "The text span has class sapMObjectAttributeText.");

		//Cleanup
		oObjectHeader.destroy();
	});

	QUnit.test("Attributes Wrapping in Responsive ObjectHeader", function(assert) {

		// arrange
		var oAttr = new ObjectAttribute("oOA2", {
			title: "Test",
			text:"Responsive ObjectHeader wrapping"
		});

		var oObjectHeader = new ObjectHeader("oOH2", {
			attributes : [oAttr],
			responsive : true
		});
		oObjectHeader.placeAt("objectAttributesWrap");

		oCore.applyChanges();

		// assertions
		assert.ok(oAttr.$("title").hasClass("sapMObjectAttributeTitle"), "The title span is rendered.");
		assert.ok(oAttr.$("colon").hasClass("sapMObjectAttributeColon"), "The colon span is rendered.");
		assert.ok(oAttr.$("text").hasClass("sapMObjectAttributeText"), "The text span is rendered.");

		//Cleanup
		oObjectHeader.destroy();
	});

	QUnit.test("Attributes Wrapping in ObjectListItem", function(assert) {
		var done = assert.async();

		// arrange
		var oAttr = new ObjectAttribute("oOA3", {text:"Responsive ObjectListItem wrapping test"});
		var oObjectListItem = new ObjectListItem("oOL3", {
			attributes : [oAttr]
		});
		oObjectListItem.placeAt("objectAttributesWrap");

		oCore.applyChanges();

		// assertions

		assert.ok(oAttr.mAggregations._textControl.$().hasClass("sapMTextNoWrap"), "sapMTextNoWrap class is present.");

		assert.equal(oAttr.mAggregations._textControl.getMaxLines(),1,"Max lines should be 1");

		//Cleanup
		oObjectListItem.destroy();

		setTimeout( function() {
			done();
		}, 500);
	});

	QUnit.test("Attributes widths in active ObjectListItem", function(assert) {
		// arrange
		var oAttr1 = new ObjectAttribute({
				active: true,
				text: "Text Only"
			}),
			oAttr2 = new ObjectAttribute({
				active: true,
				title: "Title Only"
			}),
			oAttr3 = new ObjectAttribute({
				active: true,
				title: "Title",
				text: "Text"
			}),
			oAttr4 = new ObjectAttribute({
				active: true,
				title: "",
				text: ""
			}),
			oObjectListItem = new ObjectListItem({
				attributes : [oAttr1, oAttr2, oAttr3, oAttr4]
			});

		oObjectListItem.placeAt("objectAttributesWrap");

		oCore.applyChanges();

		// assertions
		assert.ok(oAttr1.$().hasClass("sapMObjectAttributeTextOnly"), "sapMObjectAttributeTextOnly class is present in case of text-only ObjectAttribute.");
		assert.ok(!oAttr2.$().hasClass("sapMObjectAttributeTextOnly"), "sapMObjectAttributeTextOnly class is not present in case of titie-only ObjectAttribute.");
		assert.ok(!oAttr3.$().hasClass("sapMObjectAttributeTextOnly"), "sapMObjectAttributeTextOnly class is not present in case of ObjectAttribute with text and title.");
		assert.ok(!oAttr4.$().hasClass("sapMObjectAttributeTextOnly"), "sapMObjectAttributeTextOnly class is not present in case of ObjectAttribute without text and title.");

		//Cleanup
		oObjectListItem.destroy();

	});

	QUnit.test("Text aggregation has multiLine set to undefined", function(assert) {

		// Prepare
		var oAttr = new ObjectAttribute({
			title: "Title",
			text: "text",
			active: false
		});

		oAttr.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		assert.notOk(oAttr.getAggregation("_textControl").getMaxLines(), "multiLine property is corretly set to undefined.");

		// Clean up
		oAttr.destroy();

	});
	/******************************************************************/

	QUnit.module("Aggregation customContent");

	QUnit.test('customContent null', function (assert) {
		// arrange
		var oAttr = new ObjectAttribute("attr", {
				text: "Joe Smith"
			});

		try {
			oAttr.setCustomContent(null);
			assert.equal(1, 1, "The control doesn't throw error when the added customContent is null");
		} catch (e) {
			assert.equal(1, 0, "Throws an error " + e.stack);
		}

		// destroy
		oAttr.destroy();
	});

	QUnit.test("customContent with sap.m.Text and EmptyIndicatorMode is on", function(assert) {
		// arrange
		var oAttr = new ObjectAttribute({
			title:'Object Attribute without text',
			customContent : new Text({
				emptyIndicatorMode : EmptyIndicatorMode.On
			})
		}),
		sExpected = oRb.getText("EMPTY_INDICATOR") + oRb.getText("EMPTY_INDICATOR_TEXT");

		oAttr.placeAt("qunit-fixture");
		oCore.applyChanges();
		var sResult = document.getElementsByClassName("sapMEmptyIndicator")[0].firstElementChild.innerText +
		document.getElementsByClassName("sapMEmptyIndicator")[0].lastElementChild.innerText;

		//assertions
		assert.equal(sResult, sExpected, "The EmptyIndicator are rendered");

		//Cleanup
		oAttr.destroy();
	});

	QUnit.test("Aggregation sap.m.Link", function(assert) {

		// arrange
		var oAttr = new ObjectAttribute("attr", {
				text: "Joe Smith",
				customContent: new Link("alink", {text: "this is sap.m.Link"})
			}),
			oLink;

		oAttr.placeAt("objectAttributesWrap");

		oCore.applyChanges();

		oLink = oAttr.$().children().children();

		// assertions
		assert.ok(oLink.hasClass("sapMLnk"), "The active attribute is rendered as sap.m.Link when the aggregation attributeLink is set.");
		assert.equal(oLink.attr("tabindex"), 0, "Link is focusable by default");
		assert.equal(oLink[0].textContent, "this is sap.m.Link", "Text is the link test not the given from the text property.");

		//Cleanup
		oAttr.destroy();
	});

	QUnit.test("ObjectAttribute with CustomContent sap.m.Link should be rendered as active and with role link omitting the active property", function(assert) {
		// arrange
		var oAttr = new ObjectAttribute("attr", {
			title: "Test",
			active: true,
			customContent: new Link("alink", {text: "LinkText"})
		});

		oAttr.placeAt("objectAttributesWrap");
		oCore.applyChanges();

		// assertions
		assert.ok(oAttr.$().hasClass("sapMObjectAttributeActive"), "sapMObjectAttributeActive class is presented.");

		// arrange
		oAttr.setActive(false);

		// assertions
		assert.ok(oAttr.$().hasClass("sapMObjectAttributeActive"), "sapMObjectAttributeActive class is presented.");

		//Cleanup
		oAttr.destroy();
	});

	//BCP: 1780440634
	QUnit.test("ObjectAttribute does not append the title multiple times when customControl aggregation and title are used and reredering of the ObjectAttribute occurs", function (assert) {
		// arrange
		var oAttr = new ObjectAttribute({
			title: "AttributeTitle",
			customContent: new Link({ text: "LinkText" })
		}),
			sExpected = "LinkText";
		oAttr.placeAt("qunit-fixture");
		oCore.applyChanges();

		// action
		oAttr.invalidate();
		oCore.applyChanges();

		// assertions
		assert.equal(oAttr.getAggregation('customContent').getText(), sExpected, "Text of the ObjectAttribute should be " + sExpected);

		// cleanup
		oAttr.destroy();
	});

	/******************************************************************/

	QUnit.module("Internal API");

	QUnit.test("TestIsEmpty", function(assert) {

		assert.ok(!oa1._isEmpty(), "Object attribute #1 is not empty");
		assert.ok(!oa2._isEmpty(), "Object attribute #2 is not empty");
		assert.ok(!oa3._isEmpty(), "Object attribute #3 is not empty");
		assert.ok(oa4._isEmpty(), "Object attribute #4 is empty");
		assert.ok(oa5._isEmpty(), "Object attribute #5 is empty");
		assert.ok(oa6._isEmpty(), "Object attribute #6 is empty");
	});

	/******************************************************************/

	QUnit.module("Events");

	QUnit.test("TestTap", function(assert) {
		assert.expect(2);
		qutils.triggerEvent("tap", oa1.getDomRef().querySelector(".sapMObjectAttributeText")); //click on the link part of the OA should fire event
		qutils.triggerEvent("tap", oa1.getDomRef().querySelector(".sapMObjectAttributeText > bdi")); //click on the text element of the link part of the OA should fire event

		qutils.triggerEvent("tap", oa1.getDomRef().querySelector(".sapMObjectAttributeTitle")); //click on the title part of the OA should not fire event
		qutils.triggerEvent("tap", oa1.getDomRef().querySelector(".sapMObjectAttributeColon")); //click on the "dots" part of the OA should not fire event
		qutils.triggerEvent("tap", oa4.getId()); //should not fire event
		qutils.triggerEvent("tap", oa5.getId()); //should not fire event
		qutils.triggerEvent("tap", oa6.getId()); //should not fire event
	});

	QUnit.test("Test table row is not clickable when ObjectAttribute is active", function(assert) {
		assert.expect(1);
		qutils.triggerEvent("tap", oa7.getDomRef().querySelector(".sapMObjectAttributeText"));
		qutils.triggerEvent("tap", "table-item");
	});

	QUnit.test("Test table row is clickable when ObjectAttribute is not active", function(assert) {
		var done = assert.async();
		assert.expect(3);
		oa7.setActive(false);
		qutils.triggerEvent("tap", oa7.$().children()[0]);
		setTimeout( function() {
			done();
		}, 500);
	});

	QUnit.test("Press event fired, when active attribute is set to 'true'", function(assert) {
		// prepare
		var oObjectAttribute = new ObjectAttribute({
				active: true,
				text: "test"
			}),
			oFakeEvent = {
				target: {
					parentElement: {
						id:  oObjectAttribute.getId() + "-text"
					}
				}
			},
			oFirePressSpy = this.spy(oObjectAttribute, "firePress");

		// act
		oObjectAttribute.ontap(oFakeEvent);

		// assert
		assert.ok(oFirePressSpy.calledOnce, "firePress event is called once");

		// cleanup
		oObjectAttribute.destroy();
		oFirePressSpy.restore();
	});

	QUnit.module("Keyboard handling");

	QUnit.test("Enter", function(assert) {

		// Arrange
		var oObjectAttribute = new ObjectAttribute({
			title: "Title",
			text: "Contract #D1234567890",
			active: true
		});

		// System under Test
		oObjectAttribute.placeAt("qunit-fixture");
		oCore.applyChanges();

		var oPressSpy = sinon.spy(ObjectAttribute.prototype, "firePress");
		qutils.triggerKeydown(oObjectAttribute.getFocusDomRef(), KeyCodes.ENTER);

		assert.strictEqual(oPressSpy.callCount, 1, "Enter is pressed, press event was fired");

		// Clean up
		ObjectAttribute.prototype.firePress.restore();
		oObjectAttribute.destroy();
	});

	QUnit.test("Space", function(assert) {

		// Arrange
		var oObjectAttribute = new ObjectAttribute({
			title: "Title",
			text: "Contract #D1234567890",
			active: true
		});

		// System under Test
		oObjectAttribute.placeAt("qunit-fixture");
		oCore.applyChanges();

		var oPressSpy = sinon.spy(ObjectAttribute.prototype, "firePress");
		qutils.triggerKeyup(oObjectAttribute.getFocusDomRef(), KeyCodes.SPACE);

		assert.strictEqual(oPressSpy.callCount, 1, "Space is pressed, press event was fired");

		// Clean up
		ObjectAttribute.prototype.firePress.restore();
		oObjectAttribute.destroy();
	});

	QUnit.test("Space prevent scrolling", function (assert) {
		// Arrange
		var oObjectAttribute = new ObjectAttribute({title: "Test"}),
			oEvent = { preventDefault: this.spy() };

		// Act
		oObjectAttribute.onsapspace(oEvent);

		// Assert
		assert.equal(oEvent.preventDefault.callCount, 1, "preventDefault is called to prevent scrolling");

		// Cleanup
		oObjectAttribute.destroy();
	});

	QUnit.module("rtl support");
	QUnit.test("Render text with the opposite direction", function(assert) {
		// Arrange
		var oObjectAttribute = new ObjectAttribute({
			title: "a",
			text: "1 2",
			textDirection: TextDirection.RTL
		});

		// System under Test
		oObjectAttribute.placeAt("qunit-fixture");
		oCore.applyChanges();

		assert.equal(oObjectAttribute.$().find('.sapMText').text(), "a: \u200f1 2\u200f", "Numbers are read backwards.");

		// Clean up
		oObjectAttribute.destroy();
	});

	QUnit.module("Active attribute", {
		beforeEach: function () {
			this.oActiveAttr = new ObjectAttribute("oAAtt", {
				title: "Title",
				text: "Contract #D1234567890",
				active: true
			});
		},
		afterEach: function () {
			this.oActiveAttr.destroy();
		}
	});


	QUnit.test("Standalone active attribute is rendered in separate spans", function(assert) {
		this.oActiveAttr.placeAt("qunit-fixture");
		oCore.applyChanges();

		// assertions
		assert.ok(this.oActiveAttr.$().hasClass("sapMObjectAttributeDiv"), "sapMObjectAttributeDiv class is present.");
		assert.ok(this.oActiveAttr.$("title").hasClass("sapMObjectAttributeTitle"), "The title span has class sapMObjectAttributeTitle.");
		assert.ok(this.oActiveAttr.$("colon").hasClass("sapMObjectAttributeColon"), "The colon span has class sapMObjectAttributeColon.");
		assert.ok(this.oActiveAttr.$("text").hasClass("sapMObjectAttributeText"), "The text span has class sapMObjectAttributeText.");
	});

	QUnit.test("Active attribute inside ObjectListItem is rendered in separate spans", function(assert) {
		var oObjectListItem = new ObjectListItem("oOL4", {
			attributes : [this.oActiveAttr]
		});

		oObjectListItem.placeAt("qunit-fixture");

		oCore.applyChanges();

		// assertions
		assert.ok(this.oActiveAttr.$().hasClass("sapMObjectAttributeDiv"), "sapMObjectAttributeDiv class is present.");
		assert.ok(this.oActiveAttr.$("title").hasClass("sapMObjectAttributeTitle"), "The title span has class sapMObjectAttributeTitle.");
		assert.ok(this.oActiveAttr.$("colon").hasClass("sapMObjectAttributeColon"), "The colon span has class sapMObjectAttributeColon.");
		assert.ok(this.oActiveAttr.$("text").hasClass("sapMObjectAttributeText"), "The text span has class sapMObjectAttributeText.");

		// Clean up
		oObjectListItem.destroy();
	});

	QUnit.test("Active attribute inside static ObjectHeader is rendered in separate spans", function(assert) {
		var oObjectHeaderS = new ObjectHeader({
			attributes : [this.oActiveAttr]
		});
		oObjectHeaderS.placeAt("qunit-fixture");

		oCore.applyChanges();

		// assertions
		assert.ok(this.oActiveAttr.$().hasClass("sapMObjectAttributeDiv"), "sapMObjectAttributeDiv class is present.");
		assert.ok(this.oActiveAttr.$("title").hasClass("sapMObjectAttributeTitle"), "The title span has class sapMObjectAttributeTitle.");
		assert.ok(this.oActiveAttr.$("colon").hasClass("sapMObjectAttributeColon"), "The colon span has class sapMObjectAttributeColon.");
		assert.ok(this.oActiveAttr.$("text").hasClass("sapMObjectAttributeText"), "The text span has class sapMObjectAttributeText.");

		// Clean up
		oObjectHeaderS.destroy();
	});

	QUnit.test("Standalone active attribute with no text set", function(assert) {
		this.oActiveAttr.setText("");
		this.oActiveAttr.placeAt("qunit-fixture");
		oCore.applyChanges();

		// assertions
		assert.ok(!this.oActiveAttr.$().hasClass("sapMObjectAttributeActive"), "sapMObjectAttributeActive class is not presented.");
		assert.ok(!this.oActiveAttr.$().is('[role]'), "Active ObjectAttribute with no text does not have link role.");
	});

	QUnit.module("Accessibility");

	QUnit.test("Aggregation sap.m.Link", function(assert) {

		// arrange
		// shortcut for sap.ui.core.aria.HasPopup
		var AriaHasPopup = coreLibrary.aria.HasPopup,
			oAttr1 = new ObjectAttribute({
				title: "Title",
				text: "text",
				customContent: [
					new Link({text: "this is sap.m.Link"})
				],
				ariaHasPopup: AriaHasPopup.Dialog
			}),
			oAttr2 = new ObjectAttribute({
				title: "Title",
				active: true,
				text: "Active text",
				ariaHasPopup: AriaHasPopup.Dialog
			});

		oAttr1.placeAt("qunit-fixture");
		oAttr2.placeAt("qunit-fixture");
		oCore.applyChanges();

		// assertions
		assert.equal(
			oAttr1.getDomRef().querySelector(".sapMLnk").getAttribute("aria-haspopup"),
			oAttr1.getAriaHasPopup().toLowerCase(),
			"Aria-haspopup attribute properly rendered"
		);

		assert.ok(
			oAttr1.getDomRef().querySelector(".sapMLnk").getAttribute("aria-labelledby").includes(oAttr1.getId() + "-title"),
			"Link control is referenced with the control title"
		);

		assert.equal(
			oAttr2.getDomRef().querySelector(".sapMObjectAttributeText").getAttribute("aria-haspopup"),
			oAttr2.getAriaHasPopup().toLowerCase(),
			"Aria-haspopup attribute properly rendered"
		);

		assert.strictEqual(
			oAttr2.getDomRef().querySelector(".sapMObjectAttributeText").getAttribute("aria-label"),
			"Title Active text",
			"Active text is properly labelled"
		);

		//Cleanup
		oAttr1.destroy();
		oAttr2.destroy();
	});

	QUnit.test("Inactive ObjectHeader's text span has proper attributes", function(assert) {
		// prepare
		var oObjectAttribute = new ObjectAttribute({
				text: "inactive"
			}),
			oObjectHeader = new ObjectHeader({
				attributes: [oObjectAttribute]
			}),
			oObjectAttributeTextDomRef;

		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		oObjectAttributeTextDomRef = oObjectAttribute.getDomRef().querySelector(".sapMObjectAttributeText");

		// assert
		assert.notOk(oObjectAttributeTextDomRef.getAttribute("role"), "The text span doesn't have a link role.");
		assert.notOk(oObjectAttributeTextDomRef.getAttribute("tabindex"), "The text span isn't focusable.");

		// clean
		oObjectHeader.destroy();
	});


	QUnit.module("Other");
	QUnit.test("Empty ObjectAttribute will render a parent div", function (assert) {
		// Arrange
		var oAttr = new ObjectAttribute();

		// Act
		oAttr.placeAt("qunit-fixture");
		oCore.applyChanges();

		assert.ok(oAttr.getDomRef(), "Object attribute should have its container element rendered");
	});

	QUnit.test("Object attribute do not throw exception when a special regex symbol for regex is used in the title", function (assert) {
		// Arrange
		var oAttr = new ObjectAttribute();
		this.stub(oAttr, "getTitle").returns("\".*+?^${}()|[]\\");

		// Act
		oAttr._getUpdatedTextControl();

		// Assert
		assert.ok(true, "Exception is not thrown");

		// Clean up
		oAttr.destroy();
	});

	QUnit.test("Object attribute does not prepend special symbols with backslash", function (assert) {
		// Arrange
		var oAttr = new ObjectAttribute({ title: ".*+", text: "text" });

		// Act
		oAttr.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		assert.equal(oAttr.$().find(".sapMText").text(), ".*+: text", "Title is correct");

		// Clean up
		oAttr.destroy();
	});

	QUnit.test("rendered title is correct after custom content change", function (assert) {
		// Arrange
		var oText = new Text({
			text: "2"
		}), oAttr = new ObjectAttribute({
			title: "1",
			customContent: oText
		});

		oAttr.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Act
		oText.setText("3");
		oCore.applyChanges();

		// Assert
		assert.equal(oAttr.$().find(".sapMText").text(), "1: 3", "Title is correct");

		// Clean up
		oAttr.destroy();
	});
});
