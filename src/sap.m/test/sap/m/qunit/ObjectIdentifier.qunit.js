/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/ObjectIdentifier",
	"jquery.sap.global",
	"sap/ui/core/IconPool",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/library",
	"sap/ui/model/json/JSONModel",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/Label",
	"sap/m/ColumnListItem",
	"sap/m/ObjectIdentifierRenderer",
	"jquery.sap.keycodes"
], function(
	qutils,
	createAndAppendDiv,
	ObjectIdentifier,
	jQuery,
	IconPool,
	ManagedObject,
	coreLibrary,
	JSONModel,
	Table,
	Column,
	Label,
	ColumnListItem,
	ObjectIdentifierRenderer
) {
	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	var $ = jQuery;

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
			badgeNotes : true,
			badgePeople : true,
			badgeAttachments : true,
			visible : true
		});

		//Act
		sut.placeAt("content");
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(jQuery.sap.domById(sut.getId()), "ObjectIdentifier should be rendered.");

		var childrenTitle = $("#" + sut.getId() + "-title").children();
		var childrenText = $("#" + sut.getId() + "-text").children();
		assert.equal($(childrenTitle[0]).text(), sTitle, "Title is rendered.");
		assert.equal($(childrenTitle[1]).text(), ObjectIdentifier.OI_ARIA_ROLE, "Aria is rendered.");
		assert.equal($(childrenText[0]).text(), sText, "Text is rendered.");

		assert.ok(jQuery.sap.domById(sut.getId() + "-attachments-icon"), "Attachments icon is rendered.");
		assert.ok(jQuery.sap.domById(sut.getId() + "-notes-icon"), "Notes icon is rendered.");
		assert.ok(jQuery.sap.domById(sut.getId() + "-people-icon"), "People icon is rendered.");

		//Cleanup
		sut.destroy();
	});

	QUnit.test("NotVisible", function(assert) {
		//SUT
		var sTitle = "My Title";
		var sText = "My Text";
		var sut = new ObjectIdentifier("NotVisible");
		sut.setVisible(false);

		//Act
		sut.placeAt("content");
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(jQuery("#NotVisible").get(0), undefined, "ObjectIdentifier is not being rendered.");

		//Cleanup
		sut.destroy();

	});

	QUnit.test("Destroy", function(assert) {

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

		//Act
		sut.placeAt("content");
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(jQuery.sap.domById(sut.getId()), "ObjectIdentifier should be rendered.");

		var childrenTitle = $("#" + sut.getId() + "-title").children();
		var childrenText = $("#" + sut.getId() + "-text").children();

		assert.equal($(childrenTitle[0]).text(), sTitle, "Title is rendered.");
		assert.equal($(childrenText[0]).text(), sText, "Text is rendered.");

		assert.ok(jQuery.sap.domById(sut.getId() + "-attachments-icon"), "Attachments icon is rendered.");
		assert.ok(jQuery.sap.domById(sut.getId() + "-notes-icon"), "Notes icon is rendered.");
		assert.ok(jQuery.sap.domById(sut.getId() + "-people-icon"), "People icon is rendered.");

		sut.destroy();

		var sDestroyed = " should be destroyed";
		assert.ok(!sap.ui.getCore().byId(sut.getId() + "-attachments-icon"), "Attachments icon" + sDestroyed);
		assert.ok(!sap.ui.getCore().byId(sut.getId() + "-notes-icon"), "Notes icon" + sDestroyed);
		assert.ok(!sap.ui.getCore().byId(sut.getId() + "-people-icon"), "People icon" + sDestroyed);

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
		sap.ui.getCore().applyChanges();

		// Act
		oResult = oObjectIdentifier.setTitle(sTextToSet);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oResult, oObjectIdentifier, "Should be able to chain");
		assert.ok(!/.*<script>.*/.test(oObjectIdentifier.$().find(".sapMObjectIdentifierTitle").html()), "Did not contain an unescaped script tag");
		assert.strictEqual(oObjectIdentifier.getTitle(), sTextToSet, "Did set the non encoded string as value");

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
		sap.ui.getCore().applyChanges();

		// Act
		oResult = oObjectIdentifier.setText(sTextToSet);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oResult, oObjectIdentifier, "Should be able to chain");
		assert.ok(!/.*<script>.*/.test(oObjectIdentifier.$().children(".sapMObjectIdentifierText").html()), "Did not contain an unescaped script tag");
		assert.strictEqual(oObjectIdentifier.getText(), sTextToSet, "Did set the non encoded string as value");
		assert.notEqual(oObjectIdentifier.$("text").children(0).css("display"), "none", "The text control is visible");

		//Cleanup
		oObjectIdentifier.destroy();
	});

	QUnit.test("The title control should be invisible if the title is empty", function(assert) {

		//Arrange
		var sEmptyTitle = "",
			sDummyTitle = "Dummy title",
			oObjectIdentifier = new ObjectIdentifier();

		//System under test
		oObjectIdentifier.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual($(oObjectIdentifier.$("title").children()[0]).text(), sEmptyTitle, "The title text is empty as expected");
		assert.equal(oObjectIdentifier.$("title").children(0).css("display"), "none", "The title control should not be visible if title is empty initially");

		//Act
		oObjectIdentifier.setTitle(sDummyTitle);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual($(oObjectIdentifier.$("title").children()[0]).text(), sDummyTitle, "The title text is correctly set");
		assert.notEqual(oObjectIdentifier.$("title").children(0).css("display"), "none", "The title control should be visible if title is not empty");

		//Act
		oObjectIdentifier.setTitle(sEmptyTitle);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual($(oObjectIdentifier.$("title").children()[0]).text(), sEmptyTitle, "The title text is empty as expected");
		assert.equal(oObjectIdentifier.$("title").children(0).css("display"), "none", "The title control should not be visible if title is empty");

		//Cleanup
		oObjectIdentifier.destroy();
	});

	QUnit.test("The title control should be visible if the title is not empty", function(assert) {

		//Arrange
		var oObjectIdentifier = new ObjectIdentifier({
			title : "Title"
		});

		//System under test
		oObjectIdentifier.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//Assert
		assert.notEqual(oObjectIdentifier.$("title").children(0).css("display"), "none", "The text control is visible");

		//Cleanup
		oObjectIdentifier.destroy();
	});

	// BCP: 1770511853
	QUnit.test("The title control should be visible if the title is changed from non-empty value to 0", function(assert) {
		//Arrange
		var oObjectIdentifier = new ObjectIdentifier({
			title: "not empty"
		});

		//System under test
		oObjectIdentifier.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oObjectIdentifier.setTitle(0);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.notEqual(oObjectIdentifier.$("title").children(0).css("display"), "none", "The text control is visible");

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(oObjectIdentifier.$("text").children(0).css("display"), "none", "The text control is not visible");

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
		sap.ui.getCore().applyChanges();

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
		assert.ok(oObjectIdentifierTitleControl instanceof sap.m.Text, 'The default type of title control is correct');
		assert.strictEqual(oObjectIdentifierTitleControl.getVisible(), false, 'No title control is visible');
		assert.strictEqual(oObjectIdentifierTitleText.length === 0, true, 'The title text is empty');
		// assertions for text
		assert.ok(oObjectIdentifierTextControl === oObjectIdentifier.getAggregation("_textControl"), 'The text control is present and properly assigned to its private aggregation');
		assert.strictEqual(oObjectIdentifierTextControl.getVisible(), false, 'No text control is visible');
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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

		// Assert
		var sTextDir = oObjectIdentifier.getAggregation("_textControl").getTextDirection();
		assert.equal(sTextDir, "LTR", "Control has 'dir' property set to left-to-right");

		// Clean up
		oObjectIdentifier.destroy();
	});


	QUnit.module("Keyboard handling");

	function checkKeyboardEventhandling(sTestName, oOptions) {
		QUnit.test(sTestName, function(assert) {
			// arrange
			var oObjectIdentifier = new ObjectIdentifier({
				titleActive: true,
				title: "Title example",
				text: "Text example"
			});

			oObjectIdentifier.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

				// act
			var fnFireSelectSpy = this.spy(oObjectIdentifier, "fireTitlePress");
			sap.ui.test.qunit.triggerKeydown(oObjectIdentifier.$('title').children()[0], oOptions.keyCode);
			this.clock.tick(1);

			// assertions
			assert.strictEqual(fnFireSelectSpy.callCount, 1, "Event should be fired");

			// cleanup
			 oObjectIdentifier.destroy();

		});
	}

	checkKeyboardEventhandling("Firing ENTER event", {
		keyCode : jQuery.sap.KeyCodes.ENTER
	});

	checkKeyboardEventhandling("Firing SPACE event", {
		keyCode : jQuery.sap.KeyCodes.SPACE
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
		sap.ui.getCore().applyChanges();

		// act
		var fnFireSelectSpy1 = this.spy(oObjectIdentifier1, "fireTitlePress");
		var fnFireSelectSpy2 = this.spy(oObjectIdentifier2, "fireTitlePress");
		sap.ui.test.qunit.triggerKeydown(oObjectIdentifier1.$('title').children()[0], jQuery.sap.KeyCodes.ENTER);
		sap.ui.test.qunit.triggerKeydown(oObjectIdentifier2.$('title').children()[0], jQuery.sap.KeyCodes.ENTER);
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
		sap.ui.getCore().applyChanges();

		// act
		oObjectIdentifier.setTitle("not empty title");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.equal(oObjectIdentifier.$().children(".sapMObjectIdentifierText").hasClass("sapMObjectIdentifierTextBellow"), true, "Should have separator class");

		//Cleanup
		oObjectIdentifier.destroy();
	});

	QUnit.test("Should add separator class if text added at runtime", function(assert) {

		// arrange
		var oObjectIdentifier = new ObjectIdentifier({ title: "not empty title"}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		oObjectIdentifier.setText("not empty text");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.equal(oObjectIdentifier.$().children(".sapMObjectIdentifierText").hasClass("sapMObjectIdentifierTextBellow"), true, "Should have separator class");

		//Cleanup
		oObjectIdentifier.destroy();
	});

	QUnit.test("Should remove separator class if title removed at runtime", function(assert) {

		// arrange
		var oObjectIdentifier = new ObjectIdentifier({ title : "not empty title",
															  text: "not empty text"}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		oObjectIdentifier.setTitle("");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.equal(oObjectIdentifier.$().children(".sapMObjectIdentifierText").hasClass("sapMObjectIdentifierTextBellow"), false, "Should have separator class");

		//Cleanup
		oObjectIdentifier.destroy();
	});

	QUnit.test("Should remove separator class if text removed at runtime", function(assert) {

		// arrange
		var oObjectIdentifier = new ObjectIdentifier({ title : "not empty title",
															  text: "not empty text"}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		oObjectIdentifier.setText("");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.equal(oObjectIdentifier.$().children(".sapMObjectIdentifierText").hasClass("sapMObjectIdentifierTextBellow"), false, "Should have separator class");

		//Cleanup
		oObjectIdentifier.destroy();
	});

	QUnit.test("Should have separator class if both title and text nonempty initially", function(assert) {

		// arrange
		var oObjectIdentifier = new ObjectIdentifier({ title : "not empty title",
															  text: "not empty text"}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(oObjectIdentifier.$().children(".sapMObjectIdentifierText").hasClass("sapMObjectIdentifierTextBellow"), "Should have separator class");

		//Cleanup
		oObjectIdentifier.destroy();
	});

	QUnit.test("Should have no separator class if title is empty initially", function(assert) {

		// System under Test
		var oObjectIdentifier = new ObjectIdentifier({ text: "not empty text"}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.equal(oObjectIdentifier.$().children(".sapMObjectIdentifierText").hasClass("sapMObjectIdentifierTextBellow"), false, "Should have no separator class");

		//Cleanup
		oObjectIdentifier.destroy();
	});

	QUnit.test("Should have no separator class if text is empty initially", function(assert) {

		// System under Test
		var oObjectIdentifier = new ObjectIdentifier({ title: "not empty title"}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.equal(oObjectIdentifier.$().children(".sapMObjectIdentifierText").hasClass("sapMObjectIdentifierTextBellow"), false, "Should have no separator class");

		//Cleanup
		oObjectIdentifier.destroy();
	});

	QUnit.test("Should not display top row when there aren't badges and title", function(assert) {
		//Arrange
		var sut = new ObjectIdentifier({
			text: "test text"
		});
		sut.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(sut.$().find(".sapMObjectIdentifierTopRow").css("display"), "none", "top row is hidden");

		//Act
		sut.setTitle('test title');
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(sut.$().find(".sapMObjectIdentifierTopRow").attr("style"), undefined, "top row is visible");

		//Act
		sut.setTitle('');
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(sut.$().find(".sapMObjectIdentifierTopRow").css("display"), "none", "top row is hidden");

		//Act
		sut.setBadgeNotes(true);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(sut.$().find(".sapMObjectIdentifierTopRow").attr("style"), undefined, "top row is visible");

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
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(oObjectIdentifier.getTitleActive(), "The ObjectIdentifier's title should be active");
		assert.ok(oObjectIdentifier.$("title").children(0).hasClass("sapMLnk"), "A Link control should be rendered inside the title");
		assert.equal(oObjectIdentifier.getTitle(), oObjectIdentifier.$("title").children(0).html(), "The title text is rendered");

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
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(!oObjectIdentifier.getTitleActive(), "The ObjectIdentifier's title should not be active");
		assert.ok(oObjectIdentifier.$("title").children(0).hasClass("sapMText"), "A Text control should be rendered inside the title");
		assert.equal(oObjectIdentifier.getTitle(), oObjectIdentifier.$("title").children(0).html(), "The title text is rendered");

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
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(oObjectIdentifier.getTitleActive(), "The ObjectIdentifier's title should be active");
		assert.ok(oObjectIdentifier.$("title").children(0).hasClass("sapMLnk"), "A Link control should be rendered inside the title");
		assert.equal(oObjectIdentifier.getTitle(), oObjectIdentifier.$("title").children(0).html(), "The title text is rendered");

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
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(!oObjectIdentifier.getTitleActive(), "The ObjectIdentifier's title should not be active");
		assert.ok(oObjectIdentifier.$("title").children(0).hasClass("sapMText"), "A Text control should be rendered inside the title");
		assert.equal(oObjectIdentifier.getTitle(), oObjectIdentifier.$("title").children(0).html(), "The title text is rendered");

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
		sap.ui.getCore().applyChanges();

		//Act
		var oColumn = oTable.getColumns()[0];
		oTable.removeColumn(0);
		oColumn.destroy();

		oTable.removeItem(0);

		var oItemTemplate = sap.ui.getCore().byId('item');
		oItemTemplate.getCells()[0].bindProperty('title', {
			path:'title'
		});

		oTable.bindAggregation('items', {
			path:'/items',
			template: oItemTemplate
		});
		sap.ui.getCore().applyChanges();

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

		aColumns = [
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
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(oRenderSpy.callCount, 1, "The ObjectIdentifierRenderer.render does no invalidate the control");

		//Cleanup
		oTable.destroy();
		oRenderSpy.restore();
	});


	QUnit.module("ARIA");

	QUnit.test("Seting ariaLabeldBy", function(assert) {

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
		sap.ui.getCore().applyChanges();

		sut.addAssociation("ariaLabelledBy", sLabelId);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(sut.$("title").children(0).attr("aria-labelledby").indexOf(sLabelId) !== -1, "Correct ariaLabeldBy is set on after rendering of the control");
		assert.ok(sut.$("title").children(0).attr("aria-labelledby").indexOf("sut-text") !== -1, "text id is presented in aria-labelledby of the control");
		assert.ok(sut2.$("title").children(0).attr("aria-labelledby").indexOf(sLabelId) !== -1, "Correct ariaLabeldBy is set on creating of the control");
		assert.ok(sut2.$("title").children(0).attr("aria-labelledby").indexOf("sut1-text") !== -1, "text id is presented in aria-labelledby of the control");

		//Cleanup
		sut.destroy();
		sut2.destroy();
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
		sap.ui.getCore().applyChanges();

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
});