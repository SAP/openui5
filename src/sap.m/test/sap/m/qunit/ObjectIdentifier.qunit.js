/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/ObjectIdentifier",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/IconPool",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/library",
	"sap/ui/model/json/JSONModel",
	"sap/m/Table",
	"sap/m/Text",
	"sap/m/Link",
	"sap/m/Column",
	"sap/m/Label",
	"sap/m/ColumnListItem",
	"sap/m/ObjectIdentifierRenderer",
	"sap/m/Panel",
	"sap/m/library",
	"sap/ui/events/KeyCodes"
], function(
	Element,
	Library,
	qutils,
	createAndAppendDiv,
	ObjectIdentifier,
	nextUIUpdate,
	jQuery,
	IconPool,
	ManagedObject,
	coreLibrary,
	JSONModel,
	Table,
	Text,
	Link,
	Column,
	Label,
	ColumnListItem,
	ObjectIdentifierRenderer,
	Panel,
	mobileLibrary,
	KeyCodes
) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.TextDirection
	var EmptyIndicatorMode = mobileLibrary.EmptyIndicatorMode;

	// shortcut for library resource bundle
	var oRb = Library.getResourceBundleFor("sap.m");

	createAndAppendDiv("content");



	/***********************************************************************************************************************/
	QUnit.module("Control Lifecycle");

	QUnit.test("Render", function(assert) {

		//SUT
		var sTitle = "My Title";
		var sText = "My Text";
		var sut = new ObjectIdentifier({
			title : sTitle,
			text : sText,
			visible : true
		});

		//Act
		sut.placeAt("content");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//Assert
		assert.ok(sut.getDomRef(), "ObjectIdentifier should be rendered.");

		var childrenTitle = jQuery("#" + sut.getId() + "-title").children();
		var childrenText = jQuery("#" + sut.getId() + "-text").children();
		assert.equal(jQuery(childrenTitle[0]).text(), sTitle, "Title is rendered.");
		assert.equal(jQuery(childrenText[0]).text(), sText, "Text is rendered.");

		//Cleanup
		sut.destroy();
	});

	QUnit.test("NotVisible", function(assert) {
		//SUT
		var sut = new ObjectIdentifier("NotVisible");
		sut.setVisible(false);

		//Act
		sut.placeAt("content");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//Assert
		assert.equal(jQuery("#NotVisible").get(0), undefined, "ObjectIdentifier is not being rendered.");

		//Cleanup
		sut.destroy();

	});

	/***********************************************************************************************************************/
	QUnit.module("Internals");

	QUnit.test("Icon Getters", function(assert) {

		//SUT
		var sTitle = "My Title";
		var sText = "My Text";
		var sut = new ObjectIdentifier({
			title : sTitle,
			text : sText,
			badgeNotes : true,
			badgePeople : true,
			badgeAttachments : true
		});

		//Assert
		assert.equal(sut._getAttachmentsIcon().getSrc(), IconPool.getIconURI("attachment"),
				"Attachments icon is returned.");
		assert.equal(sut._getNotesIcon().getSrc(), IconPool.getIconURI("notes"), "Notes icon is returned.");
		assert.equal(sut._getPeopleIcon().getSrc(), IconPool.getIconURI("group"), "People icon is returned.");

		//Cleanup
		sut.destroy();
	});

	QUnit.test("setTitle escaping, chaining", function(assert) {
		// Arrange
		var sTextToSet = "<script>alert(\"HAACKED\");<\/script>",
			oResult,
			oConstructor = { title : "not empty text"};

		// System under Test
		var oObjectIdentifier = new ObjectIdentifier(oConstructor).placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		oResult = oObjectIdentifier.setTitle(sTextToSet);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.strictEqual(oResult, oObjectIdentifier, "Should be able to chain");
		assert.ok(!/.*<script>.*/.test(oObjectIdentifier.$().find(".sapMObjectIdentifierTitle").html()), "Did not contain an unescaped script tag");
		assert.strictEqual(oObjectIdentifier.getTitle(), sTextToSet, "Did set the non encoded string as value");

		//Cleanup
		oObjectIdentifier.destroy();
	});

	QUnit.test("setTitleControl test", function(assert) {
		// Arrange
		var oControlToSet = new Link();

		// System under Test
		var oObjectIdentifier = new ObjectIdentifier().placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		oObjectIdentifier.setTitleControl(oControlToSet);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.strictEqual(oObjectIdentifier.getTitleControl(), oControlToSet, "sap.m.Link is set as control");

		//Cleanup
		oObjectIdentifier.destroy();
	});

	QUnit.skip("ObjectIdentifier title should be escaped upon creation", function(assert) {
		// Arrange
		var oEscapeSpy = this.spy(ManagedObject, "escapeSettingsValue"),
			oObjectIdentifier = new ObjectIdentifier({
			title: "Evil { string"
		}).placeAt("qunit-fixture");

		// Assert
		assert.strictEqual(oEscapeSpy.callCount, 1, "escaped was called once for the setted Title");

		//Cleanup
		oObjectIdentifier.destroy();
	});

	QUnit.skip("ObjectIdentifier text should be escaped upon creation", function(assert) {
		// Arrange
		var oEscapeSpy = this.spy(ManagedObject, "escapeSettingsValue"),
			oObjectIdentifier = new ObjectIdentifier({
			text: "Evil { string"
		}).placeAt("qunit-fixture");

		// Assert
		assert.strictEqual(oEscapeSpy.callCount, 1, "escaped was called once for the setted Text");

		//Cleanup
		oObjectIdentifier.destroy();
	});

	QUnit.test("setText chaning, escaping", function(assert) {
		// Arrange
		var sTextToSet = "<script>alert(\"HAACKED\");<\/script>",
			oResult,
			oConstructor = { text : "not empty text"};

		// System under Test
		var oObjectIdentifier = new ObjectIdentifier(oConstructor).placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		oResult = oObjectIdentifier.setText(sTextToSet);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.strictEqual(oResult, oObjectIdentifier, "Should be able to chain");
		assert.ok(!/.*<script>.*/.test(oObjectIdentifier.$().children(".sapMObjectIdentifierText").html()), "Did not contain an unescaped script tag");
		assert.strictEqual(oObjectIdentifier.getText(), sTextToSet, "Did set the non encoded string as value");
		assert.notEqual(oObjectIdentifier.$("text").children(0).css("display"), "none", "The text control is visible");

		//Cleanup
		oObjectIdentifier.destroy();
	});

	QUnit.test("The title control should not exist if the title is empty", function(assert) {

		//Arrange
		var oObjectIdentifier = new ObjectIdentifier();

		//System under test
		oObjectIdentifier.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//Assert
		assert.strictEqual(oObjectIdentifier.$("title").children().length, 0, "The title does not exist");

		//Cleanup
		oObjectIdentifier.destroy();
	});

	// BCP: 1870179646
	QUnit.test("The title control should be visible if the title is changed back and forth to active", function(assert) {
		//Arrange
		var oObjectIdentifier = new ObjectIdentifier({
			title: "Title"
		});

		//System under test
		oObjectIdentifier.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		oObjectIdentifier.setTitleActive(true);
		//Assert
		assert.ok(oObjectIdentifier.$("title").children(0).length, "The title control is visible after setting title from non-active to active");

		// Act
		oObjectIdentifier.setTitleActive(false);
		//Assert
		assert.ok(oObjectIdentifier.$("title").children(0).length, "The title control is visible after setting title from active to non-active");

		//Cleanup
		oObjectIdentifier.destroy();
	});

	QUnit.test("The text control should be invisible if the text is empty", function(assert) {

		//Arrange
		var oObjectIdentifier = new ObjectIdentifier({
			title : "Title"
		});

		//System under test
		oObjectIdentifier.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//Assert
		assert.equal(oObjectIdentifier.$("text").children().length, 0, "The text control does not exist");

		//Cleanup
		oObjectIdentifier.destroy();
	});

	QUnit.test("The text control should be visible if the text is not empty", function(assert) {

		//Arrange
		var oObjectIdentifier = new ObjectIdentifier({
			title : "Title",
			text : "Text"
		});

		//System under test
		oObjectIdentifier.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//Assert
		assert.notEqual(oObjectIdentifier.$("text").children(0).css("display"), "none", "The text control is visible");
		assert.ok(oObjectIdentifier.$(oObjectIdentifier.getId() + '-txt'), "The text control can be found by id");

		//Cleanup
		oObjectIdentifier.destroy();
	});

	QUnit.module("API");

	QUnit.test("default values", function(assert) {

		// arrange
		var oObjectIdentifier = new ObjectIdentifier(),
			oObjectIdentifierTitleControl = oObjectIdentifier._getTitleControl(),
			oObjectIdentifierTitleText = oObjectIdentifier.getTitle(),
			oObjectIdentifierTextControl = oObjectIdentifier._getTextControl(),
			oObjectIdentifierTextControlText = oObjectIdentifierTextControl.getText();

		// assertions for title
		assert.strictEqual(oObjectIdentifier.getTitleActive(), false, 'Default value for titleActive is false');
		assert.ok(oObjectIdentifierTitleControl === oObjectIdentifier.getAggregation("_titleControl"), 'The title control is present and properly assigned to its private aggregation');
		assert.ok(oObjectIdentifierTitleControl instanceof Text, 'The default type of title control is correct');
		assert.strictEqual(oObjectIdentifierTitleText.length === 0, true, 'The title text is empty');
		// assertions for text
		assert.ok(oObjectIdentifierTextControl === oObjectIdentifier.getAggregation("_textControl"), 'The text control is present and properly assigned to its private aggregation');
		assert.ok(oObjectIdentifierTextControlText.length === 0, 'The text of ObjectIdentifier\'s text is empty');

		// cleanup
		oObjectIdentifier.destroy();
	});

	QUnit.test("setTitleActive()", function(assert) {

		// arrange
		var oObjectIdentifier = new ObjectIdentifier({
			id: "oId",
			title: 'Test title',
			titleActive: true
		});
		oObjectIdentifier.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assertions
		assert.equal(oObjectIdentifier.getTitleActive(), true, "The ObjectIdentifier's title should be active");
		assert.equal(oObjectIdentifier.$('title').children(0).hasClass("sapMLnk"), true, "A Link control should be rendered inside the title");
		assert.ok(oObjectIdentifier.$(oObjectIdentifier.getId() + '-link'), "A Link control can be found by id");

		// cleanup
		oObjectIdentifier.destroy();
	});

	QUnit.test("Setting textDirection to RTL", function(assert) {
		// arrange
		var oObjectIdentifier = new ObjectIdentifier({
			title: 'Test title',
			titleActive: true,
			text: 'Some text',
			textDirection: TextDirection.RTL

		});
		oObjectIdentifier.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		var sTextDir = oObjectIdentifier.getAggregation("_textControl").getTextDirection();
		assert.equal(sTextDir, "RTL", "Control has 'dir' property set to right-to-left");

		// Clean up
		oObjectIdentifier.destroy();
	});

	QUnit.test("Setting textDirection to LTR", function(assert) {
		// arrange
		var oObjectIdentifier = new ObjectIdentifier({
			title: 'Test title',
			titleActive: true,
			text: 'Some text',
			textDirection: TextDirection.LTR

		});
		oObjectIdentifier.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		var sTextDir = oObjectIdentifier.getAggregation("_textControl").getTextDirection();
		assert.equal(sTextDir, "LTR", "Control has 'dir' property set to left-to-right");

		// Clean up
		oObjectIdentifier.destroy();
	});


	QUnit.module("Keyboard handling");

	function checkKeyboardEventhandling(sTestName, oOptions, bKeyDown) {
		QUnit.test(sTestName, function(assert) {
			// arrange
			var oObjectIdentifier = new ObjectIdentifier({
				titleActive: true,
				title: "Title example",
				text: "Text example"
			});

			oObjectIdentifier.placeAt("qunit-fixture");
			nextUIUpdate.runSync()/*fake timer is used in module*/;

				// act
			var fnFireSelectSpy = this.spy(oObjectIdentifier, "fireTitlePress");
			if (bKeyDown) {
				qutils.triggerKeydown(oObjectIdentifier.$('title').children()[0], oOptions.keyCode);
			} else {
				qutils.triggerKeyup(oObjectIdentifier.$('title').children()[0], oOptions.keyCode);
			}

			this.clock.tick(1);

			// assertions
			assert.strictEqual(fnFireSelectSpy.callCount, 1, "Event should be fired");

			// cleanup
			 oObjectIdentifier.destroy();

		});
	}

	checkKeyboardEventhandling("Firing ENTER event", {
		keyCode : KeyCodes.ENTER
	}, true);

	checkKeyboardEventhandling("Firing SPACE event", {
		keyCode : KeyCodes.SPACE
	});

	QUnit.module("Event testing");

	QUnit.test("ObjectIdentifier titlePress Event", function(assert) {

		// arrange
		var oObjectIdentifier1 = new ObjectIdentifier({
			titleActive: true,
			title: "Title example"
		});
		var oObjectIdentifier2 = new ObjectIdentifier();

		oObjectIdentifier1.placeAt("qunit-fixture");
		oObjectIdentifier2.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// act
		var fnFireSelectSpy1 = this.spy(oObjectIdentifier1, "fireTitlePress");
		var fnFireSelectSpy2 = this.spy(oObjectIdentifier2, "fireTitlePress");
		qutils.triggerKeydown(oObjectIdentifier1.$('title').children()[0], KeyCodes.ENTER);
		qutils.triggerKeydown(oObjectIdentifier2.$('title').children()[0], KeyCodes.ENTER);
		this.clock.tick(1);

		// assertions
		assert.strictEqual(fnFireSelectSpy1.callCount, 1, "Event should be fired once");
		assert.strictEqual(fnFireSelectSpy2.callCount, 0, "Event should not be fired, ObjectIdentifier's titleActive property is false");

		// cleanup
		oObjectIdentifier1.destroy();
		oObjectIdentifier2.destroy();
	});

	/***********************************************************************************************************************/
	QUnit.module("Styles");

	QUnit.test("Should add separator class if title added at runtime", function(assert) {

		// arrange
		var oObjectIdentifier = new ObjectIdentifier({ text: "not empty text"}).placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// act
		oObjectIdentifier.setTitle("not empty title");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.equal(oObjectIdentifier.$().children(".sapMObjectIdentifierText").hasClass("sapMObjectIdentifierTextBellow"), true, "Should have separator class");

		//Cleanup
		oObjectIdentifier.destroy();
	});

	QUnit.test("Should add separator class if text added at runtime", function(assert) {

		// arrange
		var oObjectIdentifier = new ObjectIdentifier({ title: "not empty title"}).placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// act
		oObjectIdentifier.setText("not empty text");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.equal(oObjectIdentifier.$().children(".sapMObjectIdentifierText").hasClass("sapMObjectIdentifierTextBellow"), true, "Should have separator class");

		//Cleanup
		oObjectIdentifier.destroy();
	});

	QUnit.test("Should remove separator class if title removed at runtime", function(assert) {

		// arrange
		var oObjectIdentifier = new ObjectIdentifier({ title : "not empty title",
															  text: "not empty text"}).placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// act
		oObjectIdentifier.setTitle("");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.equal(oObjectIdentifier.$().children(".sapMObjectIdentifierText").hasClass("sapMObjectIdentifierTextBellow"), false, "Should have separator class");

		//Cleanup
		oObjectIdentifier.destroy();
	});

	QUnit.test("Should remove separator class if text removed at runtime", function(assert) {

		// arrange
		var oObjectIdentifier = new ObjectIdentifier({ title : "not empty title",
															  text: "not empty text"}).placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// act
		oObjectIdentifier.setText("");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.equal(oObjectIdentifier.$().children(".sapMObjectIdentifierText").hasClass("sapMObjectIdentifierTextBellow"), false, "Should have separator class");

		//Cleanup
		oObjectIdentifier.destroy();
	});

	QUnit.test("Should have separator class if both title and text nonempty initially", function(assert) {

		// arrange
		var oObjectIdentifier = new ObjectIdentifier({ title : "not empty title",
															  text: "not empty text"}).placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.ok(oObjectIdentifier.$().children(".sapMObjectIdentifierText").hasClass("sapMObjectIdentifierTextBellow"), "Should have separator class");

		//Cleanup
		oObjectIdentifier.destroy();
	});

	QUnit.test("Should have no separator class if title is empty initially", function(assert) {

		// System under Test
		var oObjectIdentifier = new ObjectIdentifier({ text: "not empty text"}).placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.equal(oObjectIdentifier.$().children(".sapMObjectIdentifierText").hasClass("sapMObjectIdentifierTextBellow"), false, "Should have no separator class");

		//Cleanup
		oObjectIdentifier.destroy();
	});

	QUnit.test("Should have no separator class if text is empty initially", function(assert) {

		// System under Test
		var oObjectIdentifier = new ObjectIdentifier({ title: "not empty title"}).placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.equal(oObjectIdentifier.$().children(".sapMObjectIdentifierText").hasClass("sapMObjectIdentifierTextBellow"), false, "Should have no separator class");

		//Cleanup
		oObjectIdentifier.destroy();
	});

	QUnit.test("Should not display top row when there is no title (assuming there are also no deprecated badges)", function(assert) {
		//Arrange
		var sut = new ObjectIdentifier({
			text: "test text"
		});
		sut.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//Assert
		assert.equal(sut.$().find(".sapMObjectIdentifierTopRow").css("display"), "none", "top row is hidden");

		//Act
		sut.setTitle('test title');
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//Assert
		assert.ok(sut.$().find(".sapMObjectIdentifierTopRow").is(":visible"), "top row is visible");

		//Act
		sut.setTitle('');
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//Assert
		assert.equal(sut.$().find(".sapMObjectIdentifierTopRow").css("display"), "none", "top row is hidden");

		//Cleanup
		sut.destroy();
	});

	QUnit.module("Databinding");

	QUnit.test("Model sets titleActive = true", function(assert) {

		//Arrange
		var oModel = new JSONModel({
			"text": "Title Active",
			"titleActive" : true
		});

		var oObjectIdentifier = new ObjectIdentifier({
			title : "{/text}",
			text : "Model sets true",
			titleActive : "{/titleActive}"
		});

		//System under test
		oObjectIdentifier.setModel(oModel);
		oObjectIdentifier.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//Assert
		assert.ok(oObjectIdentifier.getTitleActive(), "The ObjectIdentifier's title should be active");
		assert.ok(oObjectIdentifier.$("title").children(0).hasClass("sapMLnk"), "A Link control should be rendered inside the title");
		assert.equal(oObjectIdentifier.getTitle(), oObjectIdentifier.$("title").find(".sapMLnkText").html(), "The title text is rendered");

		//Cleanup
		oObjectIdentifier.destroy();
		oModel.destroy();

	});

	QUnit.test("Model sets titleActive = false", function(assert) {

		//Arrange
		var oModel = new JSONModel({
			"text": "Title Not Active",
			"titleActive" : false
		});

		var oObjectIdentifier = new ObjectIdentifier({
			title : "{/text}",
			text : "Model sets false",
			titleActive : "{/titleActive}"
		});

		//System under test
		oObjectIdentifier.setModel(oModel);
		oObjectIdentifier.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//Assert
		assert.ok(!oObjectIdentifier.getTitleActive(), "The ObjectIdentifier's title should not be active");
		assert.ok(oObjectIdentifier.$("title").children(0).hasClass("sapMText"), "A Text control should be rendered inside the title");
		assert.equal(oObjectIdentifier.$("title").children(0)[0].textContent, oObjectIdentifier.getTitle(), "The title text is rendered");

		//Cleanup
		oObjectIdentifier.destroy();
		oModel.destroy();
	});

	QUnit.test("Formatter sets titleActive = true", function(assert) {

		//Arrange
		var oModel = new JSONModel({
			"text": "Title Active",
			"formatterString" : "active"
		});

		var oObjectIdentifier = new ObjectIdentifier({
			title : "{/text}",
			text : "Model sets true",
			titleActive : {
				path: "/formatterString",
				formatter: function(e) {
					return (e == "active") ? true : false;
				}
			}
		});

		//System under test
		oObjectIdentifier.setModel(oModel);
		oObjectIdentifier.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//Assert
		assert.ok(oObjectIdentifier.getTitleActive(), "The ObjectIdentifier's title should be active");
		assert.ok(oObjectIdentifier.$("title").children(0).hasClass("sapMLnk"), "A Link control should be rendered inside the title");
		assert.equal(oObjectIdentifier.$("title").children(0)[0].textContent, oObjectIdentifier.getTitle(), "The title text is rendered");

		//Cleanup
		oObjectIdentifier.destroy();
		oModel.destroy();
	});

	QUnit.test("Formatter sets titleActive = false", function(assert) {

		//Arrange
		var oModel = new JSONModel({
			"text": "Title Active",
			"formatterString" : "notActive"
		});

		var oObjectIdentifier = new ObjectIdentifier({
			title : "{/text}",
			text : "Model sets true",
			titleActive : {
				path: "/formatterString",
				formatter: function(e) {
					return (e == "active") ? true : false;
				}
			}
		});

		//System under test
		oObjectIdentifier.setModel(oModel);
		oObjectIdentifier.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//Assert
		assert.ok(!oObjectIdentifier.getTitleActive(), "The ObjectIdentifier's title should not be active");
		assert.ok(oObjectIdentifier.$("title").children(0).hasClass("sapMText"), "A Text control should be rendered inside the title");
		assert.equal(oObjectIdentifier.$("title").children(0)[0].textContent, oObjectIdentifier.getTitle(), "The title text is rendered");

		//Cleanup
		oObjectIdentifier.destroy();
		oModel.destroy();
	});

	QUnit.test("Binding a table cell item after table column has been destroyed", function(assert) {

		//Arrange
		var oTable = new Table({
			columns: [
				new Column({
					header: new Label({
						text: "Label1"
					})
				}),
				new Column({
					header: new Label({
						text: "Label2"
					})
				})
			],
			items: [
				new ColumnListItem("item", {
					cells: [
						new ObjectIdentifier({
							title: "title1",
							text: "text1"
						}),
						new ObjectIdentifier({
							title: "title2",
							text: "text2"
						})
					]
				})
			]
		});

		var oModel = new JSONModel({
			items:[
				{ "title": "New Title" }
			]
		});

		//System under test
		oTable.setModel(oModel);
		oTable.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//Act
		var oColumn = oTable.getColumns()[0];
		oTable.removeColumn(0);
		oColumn.destroy();

		oTable.removeItem(0);

		var oItemTemplate = Element.getElementById('item');
		oItemTemplate.getCells()[0].bindProperty('title', {
			path:'title'
		});

		oTable.bindAggregation('items', {
			path:'/items',
			template: oItemTemplate
		});
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//Assert
		assert.equal(oTable.getColumns().length, 1, "The table has just one column");

		//Cleanup
		oTable.destroy();
		oModel.destroy();
	});

	QUnit.test("Rendered just once when databound in a table", function(assert) {
		var oSut, oTable, oModel, oTemplate, oRenderSpy;

		//Arrange
		oSut = new ObjectIdentifier({
			title : "{Name}",
			titleActive : "{active}"
		});

		var aColumns = [
			new Column({
				header : new Label({
					text : "Product"
				})
			})
		];

		oRenderSpy = sinon.spy(ObjectIdentifierRenderer, "render");

		oTemplate = new ColumnListItem({
			cells : [ oSut ]
		});

		oTable = new Table({
			columns : aColumns
		});
		oModel = new JSONModel({
			"ProductCollection": [
				{
					"active": true,
					"ProductId": "1239102",
					"Name": "Power Projector 4713"
				}]});
		oTable.setModel(oModel);
		oTable.bindItems("/ProductCollection", oTemplate);
		oTable.placeAt("qunit-fixture");

		//Act
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//Assert
		assert.equal(oRenderSpy.callCount, 1, "The ObjectIdentifierRenderer.render does no invalidate the control");

		//Cleanup
		oTable.destroy();
		oRenderSpy.restore();
	});


	QUnit.module("ARIA");

	QUnit.test("Setting ariaLabelledBy", function(assert) {

		//SUT
		var sTitle = "My Title",
			sText = "My Text",
			sLabelId = new Label({text: "column name"}).getId(),
			sut = new ObjectIdentifier("sut", {
				title : sTitle,
				titleActive: true,
				text : sText
			}),
			sut2 = new ObjectIdentifier("sut1", {
				title : sTitle,
				titleActive: true,
				text : sText,
				ariaLabelledBy: sLabelId
			});

		//Act
		sut.placeAt("content");
		sut2.placeAt("content");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		sut.addAssociation("ariaLabelledBy", sLabelId);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//Assert
		assert.ok(sut.$("title").children(0).attr("aria-labelledby").indexOf(sLabelId) !== -1, "Correct ariaLabeldBy is set on after rendering of the control");
		assert.ok(sut.$("title").children(0).attr("aria-labelledby").indexOf("sut-text") !== -1, "text id is presented in aria-labelledby of the control");
		assert.ok(sut2.$("title").children(0).attr("aria-labelledby").indexOf(sLabelId) !== -1, "Correct ariaLabeldBy is set on creating of the control");
		assert.ok(sut2.$("title").children(0).attr("aria-labelledby").indexOf("sut1-text") !== -1, "text id is presented in aria-labelledby of the control");

		//Cleanup
		sut.destroy();
		sut2.destroy();
	});

	QUnit.test("ariaLabelledBy propery propaged to the anchor tag", function(assert) {
		// Prepare
		var sLabelId = "label",
			oLabel = new Label(sLabelId, {
				text: "label text"
			}),
			oOI = new ObjectIdentifier({
				text: "identifier text",
				title: "identifier title",
				ariaLabelledBy: [sLabelId]
			});

		oLabel.placeAt("qunit-fixture");
		oOI.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		oOI.setTitleActive(true);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.ok(oOI.getDomRef().querySelector(".sapMLnk").getAttribute("aria-labelledby").indexOf(sLabelId) !== -1, "Correct ariaLabeldBy is set on after rendering of the control");

		// Clean
		oLabel.destroy();
		oOI.destroy();
	});

	QUnit.test("function getAccessibilityInfo", function(assert) {

		//SUT
		var oLinkInfo,
			oTextInfo,
			sTitle = "My Title",
			sText = "My Text",
			activeObjectIdentifier = new ObjectIdentifier({
				title : sTitle,
				titleActive: true,
				text : sText
			}),
			inactiveObjectIdentifier = new ObjectIdentifier({
				title : sTitle,
				titleActive: false,
				text : sText
			});

		//Act
		oLinkInfo = activeObjectIdentifier.getAccessibilityInfo();
		oTextInfo = inactiveObjectIdentifier.getAccessibilityInfo();

		//Assert
		assert.equal(oLinkInfo.description, sTitle + " " + sText, "Description for active ObjectIdentifier is correct");
		assert.equal(oLinkInfo.type, ObjectIdentifier.OI_ARIA_ROLE + " Link", "Type for active ObjectIdentifier is correct");

		assert.equal(oTextInfo.description, sTitle + " " + sText, "Description for none active ObjectIdentifier is correct");
		assert.equal(oTextInfo.type, ObjectIdentifier.OI_ARIA_ROLE, "Type for none active ObjectIdentifier is correct");

		//Cleanup
		activeObjectIdentifier.destroy();
		inactiveObjectIdentifier.destroy();
	});

	QUnit.test("ariaLabelledBy references placement", function(assert) {
		// Prepare
		var oLabel = new Label({ text: "The label" }),
			oObjectIdentifier = new ObjectIdentifier({
				title: "Some title",
				titleActive: true,
				ariaLabelledBy: oLabel
			}),
			oInternalLink;

		oLabel.placeAt("qunit-fixture");
		oObjectIdentifier.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		oInternalLink = oObjectIdentifier.getAggregation("_titleControl");
		assert.ok(oObjectIdentifier.getAriaLabelledBy().length > 0, "The label is added in ObjectIdentifier's ariaLabelledBy");
		assert.ok(oInternalLink.getAriaLabelledBy().length > 0, "The label is propagated to the internal link");

		assert.notOk(oObjectIdentifier.$().attr("aria-labelledby"), "There is no aria-labelledby on the root element");
		assert.ok(oInternalLink.$().attr("aria-labelledby"), "The aria-labelledby is placed on the internal link instead");

		// Cleanup
		oLabel.destroy();
		oObjectIdentifier.destroy();
	});

	QUnit.module("EmptyIndicator", {
		beforeEach : function() {
			this.oText = new ObjectIdentifier({
				text: "",
				emptyIndicatorMode: EmptyIndicatorMode.On
			});

			this.oTextEmptyAuto = new ObjectIdentifier({
				text: "",
				emptyIndicatorMode: EmptyIndicatorMode.Auto
			});

			this.oTextEmptyAutoNoClass = new ObjectIdentifier({
				text: "",
				emptyIndicatorMode: EmptyIndicatorMode.Auto
			});

			this.oPanel = new Panel({
				content: this.oTextEmptyAuto
			}).addStyleClass("sapMShowEmpty-CTX");

			this.oPanel1 = new Panel({
				content: this.oTextEmptyAutoNoClass
			});

			this.oText.placeAt("content");
			this.oPanel.placeAt("content");
			this.oPanel1.placeAt("content");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
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
		var oSpan = this.oText.getDomRef().childNodes[1];
		assert.strictEqual(oSpan.firstElementChild.textContent, oRb.getText("EMPTY_INDICATOR"), "Empty indicator is rendered");
		assert.strictEqual(oSpan.firstElementChild.getAttribute("aria-hidden"), "true", "Accessibility attribute is set");
		assert.strictEqual(oSpan.lastElementChild.textContent, oRb.getText("EMPTY_INDICATOR_TEXT"), "Accessibility text is added");
	});

	QUnit.test("Indicator should not be rendered when text is not empty", function(assert) {
		//Arrange
		this.oText.setText("test");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//Assert
		assert.strictEqual(this.oText.getDomRef().childNodes[1].textContent, "test", "Empty indicator is not rendered");
	});

	QUnit.test("Indicator should not be rendered when property is set to off", function(assert) {
		//Arrange
		this.oText.setEmptyIndicatorMode(EmptyIndicatorMode.Off);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//Assert
		assert.strictEqual(this.oText.getDomRef().childNodes[1].textContent, "", "Empty indicator is not rendered");
	});

	QUnit.test("Indicator should be rendered, when sapMShowEmpty-CTX is added to parent", function(assert) {
		//Assert
		var oSpan = this.oTextEmptyAuto.getDomRef().childNodes[1];
		assert.strictEqual(oSpan.firstElementChild.textContent, oRb.getText("EMPTY_INDICATOR"), "Empty indicator is rendered");
		assert.strictEqual(oSpan.firstElementChild.getAttribute("aria-hidden"), "true", "Accessibility attribute is set");
		assert.strictEqual(oSpan.lastElementChild.textContent, oRb.getText("EMPTY_INDICATOR_TEXT"), "Accessibility text is added");
	});

	QUnit.test("Indicator should not be rendered when text is available", function(assert) {
		//Arrange
		this.oTextEmptyAuto.setText("test");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//Assert
		assert.strictEqual(this.oTextEmptyAuto.getDomRef().childNodes[1].textContent, "test", "Empty indicator is not rendered");
	});

	QUnit.test("Indicator should be rendered when 'sapMShowEmpty-CTX' is added", function(assert) {
		var oSpan = this.oTextEmptyAutoNoClass.getDomRef().childNodes[1];
		//Assert
		assert.strictEqual(window.getComputedStyle(oSpan)["display"], "none", "Empty indicator is not rendered");
		//Arrange
		this.oPanel1.addStyleClass("sapMShowEmpty-CTX");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//Assert
		assert.strictEqual(window.getComputedStyle(oSpan)["display"], "inline-block", "Empty indicator is rendered");
	});

	QUnit.test("Indicator should not be rendered when property is set to off and there is a text", function(assert) {
		//Arrange
		this.oText.setEmptyIndicatorMode(EmptyIndicatorMode.Off);
		this.oText.setText("test");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//Assert
		assert.strictEqual(this.oText.getDomRef().childNodes[1].textContent, "test", "Empty indicator is not rendered");
	});
});