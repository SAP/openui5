/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/ObjectAttribute",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"jquery.sap.global",
	"sap/m/ObjectHeader",
	"sap/m/ObjectListItem",
	"sap/ui/events/KeyCodes",
	"sap/ui/Device",
	"sap/m/Link",
	"sap/ui/core/library",
	"jquery.sap.keycodes"
], function(
	qutils,
	createAndAppendDiv,
	ObjectAttribute,
	Table,
	Column,
	ColumnListItem,
	jQuery,
	ObjectHeader,
	ObjectListItem,
	KeyCodes,
	Device,
	Link,
	coreLibrary
) {
	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	createAndAppendDiv("objectAttributes");
	createAndAppendDiv("objectAttributesWrap");



	var eventHandler = function (oEvent) {
		assert.ok(true, "press event for attribute was fired");
	};

	var eventHandlerForTableRow = function (oEvent) {
		assert.ok(true, "press event for table was fired");
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

		assert.notEqual(jQuery.sap.domById("oa1"), null, "Object attribute #1 should be rendered.");
		assert.notEqual(jQuery.sap.domById("oa2"), null, "Object attribute #2 should be rendered.");
		assert.notEqual(jQuery.sap.domById("oa3"), null, "Object attribute #3 should be rendered.");
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
		sap.ui.getCore().applyChanges();

		assert.equal(oObjectAttribute.$().attr("role"), "link", "Active ObjectAttribute has link role.");

		// Clean up
		oObjectAttribute.destroy();

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

		sap.ui.getCore().applyChanges();

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

		sap.ui.getCore().applyChanges();

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

		sap.ui.getCore().applyChanges();

		// assertions

		assert.ok(oAttr.mAggregations._textControl.$().hasClass("sapMTextNoWrap"), "sapMTextNoWrap class is present.");
		if (!Device.browser.internet_explorer) {
			assert.equal(oAttr.mAggregations._textControl.getMaxLines(),1,"Max lines should be 1");
		}

		//Cleanup
		oObjectListItem.destroy();

		setTimeout( function() {
			done();
		}, 500);
	});

	QUnit.test("Text aggregation has multiLine set to undefined", function(assert) {

		// Prepare
		var oAttr = new ObjectAttribute({
			title: "Title",
			text: "text",
			active: false
		});

		oAttr.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

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

	QUnit.test("Aggregation sap.m.Link", function(assert) {

		// arrange
		var oAttr = new ObjectAttribute("attr", {
				text: "Joe Smith",
				customContent: new Link("alink", {text: "this is sap.m.Link"})
			}),
			oLink;

		oAttr.placeAt("objectAttributesWrap");

		sap.ui.getCore().applyChanges();

		oLink = oAttr.$().children().children();

		// assertions
		assert.ok(oLink.hasClass("sapMLnk"), "The active attribute is rendered as sap.m.Link when the aggregation attributeLink is set.");
		assert.equal(oLink.attr("tabindex"), -1, "The tabindex of the Link is set ot -1.");
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
		sap.ui.getCore().applyChanges();

		// assertions
		assert.equal(oAttr.$().attr("role"), "link", "ObjectAttribute with active=true has link role.");
		assert.ok(oAttr.$().hasClass("sapMObjectAttributeActive"), "sapMObjectAttributeActive class is presented.");

		// arrange
		oAttr.setActive(false);

		// assertions
		assert.equal(oAttr.$().attr("role"), "link", "ObjectAttribute with active=false has link role.");
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
		sap.ui.getCore().applyChanges();

		// action
		oAttr.invalidate();
		sap.ui.getCore().applyChanges();

		// assertions
		assert.equal(oAttr.getAggregation('customContent').getText(), sExpected, "Text of the ObjectAttribute should be " + sExpected);

		// cleanup
		oAttr.destroy();
	});

	QUnit.test("When customContent is sap.m.Link it overrides its function _getTabindex", function (assert) {
		// arrange
		var oAttr = new ObjectAttribute({
			title: "AttributeTitle",
			customContent: new Link({ text: "LinkText" })
		});

		// assertions
		assert.equal(oAttr.getAggregation('customContent')._getTabindex(), "-1", "Tabindex of the Link should be -1");

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
		assert.expect(3);
		qutils.triggerEvent("tap", oa1.$().children()[2]); //click on the link part of the OA should fire event
		qutils.triggerEvent("tap", oa2.$().children()[0]); //we dont't have title on this one, so 0 is the link part and should fire event
		qutils.triggerEvent("tap", oa3.$().children()[0]); //we dont't have title on this one, so 0 is the link part and should fire event

		qutils.triggerEvent("tap", oa1.$().children()[0]); //click on the title part of the OA should not fire event
		qutils.triggerEvent("tap", oa1.$().children()[1]); //click on the "dots" part of the OA should not fire event
		qutils.triggerEvent("tap", oa4.getId()); //should not fire event
		qutils.triggerEvent("tap", oa5.getId()); //should not fire event
		qutils.triggerEvent("tap", oa6.getId()); //should not fire event
	});

	QUnit.test("Test table row is not clickable when ObjectAttribute is active", function(assert) {
		assert.expect(1);
		qutils.triggerEvent("tap", oa7.$().children()[0]);
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
		sap.ui.getCore().applyChanges();

		var oPressSpy = sinon.spy(ObjectAttribute.prototype, "firePress");
		sap.ui.test.qunit.triggerKeydown(oObjectAttribute.getFocusDomRef(), KeyCodes.ENTER);

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
		sap.ui.getCore().applyChanges();

		var oPressSpy = sinon.spy(ObjectAttribute.prototype, "firePress");
		sap.ui.test.qunit.triggerKeyup(oObjectAttribute.getFocusDomRef(), KeyCodes.SPACE);

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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

		sap.ui.getCore().applyChanges();

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

		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

		// assertions
		assert.ok(!this.oActiveAttr.$().hasClass("sapMObjectAttributeActive"), "sapMObjectAttributeActive class is not presented.");
		assert.ok(!this.oActiveAttr.$().is('[role]'), "Active ObjectAttribute with no text does not have link role.");
	});

	QUnit.module("Other");
	QUnit.test("Empty ObjectAttribute will render a parent div", function (assert) {
		// Arrange
		var oAttr = new ObjectAttribute();

		// Act
		oAttr.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.ok(oAttr.getDomRef(), "Object attribute should have its container element rendered");
	});

	QUnit.test("Object attribute do not throw expection when a special regex symbol for regex is used in the title", function (assert) {
		// Arrange
		var oAttr = new ObjectAttribute();
		var oGetTitleStub = this.stub(oAttr, "getTitle", function () {
			return "\".*+?^${}()|[]\\";
		});

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
		sap.ui.getCore().applyChanges();

		// Assert
		assert.equal(oAttr.$().find(".sapMText").text(), ".*+: text", "Title is correct");

		// Clean up
		oAttr.destroy();
	});
});
