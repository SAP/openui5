/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/Title",
	"sap/m/library",
	"sap/ui/core/library",
	"sap/m/Toolbar",
	"sap/ui/core/Title"
], function(QUnitUtils, createAndAppendDiv, Title, mobileLibrary, coreLibrary, Toolbar, coreTitle) {
	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	createAndAppendDiv("uiArea");



	QUnit.module("Basics", {
		beforeEach : function() {
			this.title1 = new Title();
			this.title2 = new Title({
				text : "Hello",
				level : TitleLevel.H1,
				titleStyle : TitleLevel.H2,
				width : "50%",
				textAlign : TextAlign.Begin,
				visible : false,
				tooltip : "Tooltip",
				wrapping: true
			});
		},
		afterEach : function() {
			this.title1.destroy();
			this.title2.destroy();
			this.title1 = null;
			this.title2 = null;
		}
	});

	QUnit.test("API Properties", function(assert){
		assert.ok(!this.title1.getText(), "Default property 'text'");
		assert.strictEqual(this.title2.getText(), "Hello", "Custom property 'text'");

		assert.ok(!this.title1.getTooltip(), "Default property 'tooltip'");
		assert.strictEqual(this.title2.getTooltip(), "Tooltip", "Custom property 'tooltip'");

		assert.ok(!this.title1.getWidth(), "Default property 'width'");
		assert.strictEqual(this.title2.getWidth(), "50%", "Custom property 'width'");

		assert.strictEqual(this.title1.getLevel(), TitleLevel.Auto,"Default property 'level'");
		assert.strictEqual(this.title2.getLevel(), TitleLevel.H1, "Custom property 'level'");

		assert.strictEqual(this.title1.getTitleStyle(), TitleLevel.Auto,"Default property 'titleStyle'");
		assert.strictEqual(this.title2.getTitleStyle(), TitleLevel.H2, "Custom property 'titleStyle'");

		assert.strictEqual(this.title1.getTextAlign(), TextAlign.Initial, "Default property 'textAlign'");
		assert.strictEqual(this.title2.getTextAlign(), TextAlign.Begin, "Custom property 'textAlign'");

		assert.ok(this.title1.getVisible(), "Default property 'visible'");
		assert.ok(!this.title2.getVisible(), "Custom property 'visible'");

		assert.ok(!this.title1.getWrapping(), "Default property 'wrapping'");
		assert.ok(this.title2.getWrapping(), "Custom property 'wrapping'");
	});

	QUnit.test("Title should be shrinkable", function(assert){
		assert.ok(this.title1.getMetadata().isInstanceOf("sap.ui.core.IShrinkable"), "Title control implements IShrinkable interface");
	});


	QUnit.module("Rendering", {
		beforeEach : function() {
			this.title = new Title({
				text : "Hello",
				tooltip : "Tooltip"
			});
			this.title.placeAt("uiArea");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.title.destroy();
			this.title = null;
		}
	});


	QUnit.test("When width is not set max-width should apply to control", function(assert){
		assert.ok(this.title.$().hasClass("sapMTitleMaxWidth"), "Title has max width restriction for the trunctation.");
		this.title.setWidth("100%");
		sap.ui.getCore().applyChanges();
		assert.ok(!this.title.$().hasClass("sapMTitleMaxWidth"), "Title has width and does not have max width restriction.");
	});

	QUnit.test("Should render a text", function(assert) {
		assert.strictEqual(this.title.$().text(), "Hello", "Text got rendered");
	});

	QUnit.test("Should render a tooltip", function(assert) {
		assert.strictEqual(this.title.$().attr("title"), "Tooltip", "Tooltip got rendered");
	});

	QUnit.test("Should be selectable", function(assert){
		assert.ok(this.title.$().hasClass("sapUiSelectable"), "Title has class sapUiSelectable.");
	});

	QUnit.test("Wrapping", function(assert){
		this.title.setText("Some very very very very long text");
		this.title.setWidth("100px");
		sap.ui.getCore().applyChanges();
		var iHeight = this.title.$().outerHeight();
		assert.ok(this.title.$().hasClass("sapMTitleNoWrap"), "Title has class sapMTitleNoWrap.");
		this.title.setWrapping(true);
		sap.ui.getCore().applyChanges();
		assert.ok(this.title.$().hasClass("sapMTitleWrap"), "Title has class sapMTitleWrap.");
		assert.ok(this.title.$().outerHeight() >= 3 * iHeight, "Title height increases when wrapping is active");
	});

	QUnit.test("Title wrappingType (Hyphenation)", function(assert){
		var done = assert.async();
		this.title.setText("pneumonoultramicroscopicsilicovolcanoconiosis");
		var iHeight = this.title.$().outerHeight();
		this.title.setWidth("200px");
		this.title.setWrapping(true);
		this.title.setWrappingType(mobileLibrary.WrappingType.Hyphenated);
		sap.ui.getCore().applyChanges();

		setTimeout(function() {
			assert.ok(this.title.$().outerHeight() >= 2 * iHeight, "Tested title is hyphenated.");
			done();
		}.bind(this), 500);
	});

	QUnit.test("TitleStyle correct", function(assert){
		for (var level in TitleLevel) {
			this.title.setTitleStyle(level);
			sap.ui.getCore().applyChanges();
			assert.ok(this.title.$().hasClass("sapMTitleStyle" + level), "Title has correct class for style level " + level);
		}
	});

	QUnit.test("Alignment correct", function(assert){
		for (var align in TextAlign) {
			this.title.setTextAlign(align);
			sap.ui.getCore().applyChanges();
			if (align == TextAlign.Initial) {
				assert.ok(!this.title.$().hasClass("sapMTitleAlignInitial"), "No class for alignment " + align);
			} else {
				assert.ok(this.title.$().hasClass("sapMTitleAlign" + align), "Title has correct class for alignment " + align);
			}
		}
	});

	QUnit.test("Semantic level correct", function(assert){
		var sExpectedTag;

		for (var level in TitleLevel) {
			this.title.setLevel(level);
			sap.ui.getCore().applyChanges();

			if (level === TitleLevel.Auto) {
				sExpectedTag = "DIV";
				assert.strictEqual(this.title.$().attr("role"), "heading", "Role attribute correctly set for level Auto");
			} else {
				sExpectedTag = level.toUpperCase();
				assert.ok(!this.title.$().attr("role"), "No role attribute set for level " + level);
			}

			assert.strictEqual(this.title.getDomRef().tagName.toUpperCase(), sExpectedTag, "Title has correct level " + level);
		}
	});

	QUnit.test("Title in Toolbar", function(assert){
		assert.ok(!this.title.$().hasClass("sapMTitleTB"), "Title has no toolbar class");
		var oToolbar = new Toolbar();
		oToolbar.addContent(this.title);
		oToolbar.placeAt("uiArea");
		sap.ui.getCore().applyChanges();
		assert.ok(this.title.$().hasClass("sapMTitleTB"), "Title has toolbar class");
		this.title = oToolbar; // Correct cleanup in teardown
	});

	QUnit.module("Title Association", {
		beforeEach : function() {
			this.coreTitle = new coreTitle({
				text: "Hello2",
				tooltip : "Tooltip2"
			});
			this.anotherTitle = new coreTitle({
				text: "Hello4",
				tooltip : "Tooltip4"
			});
			this.title = new Title({
				text : "Hello",
				tooltip : "Tooltip",
				title : this.coreTitle
			});
			this.title.placeAt("uiArea");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.title.destroy();
			this.title = null;
			if (this.coreTitle) {
				this.coreTitle.destroy();
				this.coreTitle = null;
			}
		}
	});

	QUnit.test("Should render a text", function(assert) {
		assert.strictEqual(this.title.$().text(), "Hello2", "Text got rendered");
		this.coreTitle.setText("Hello3");
		sap.ui.getCore().applyChanges();
		assert.strictEqual(this.title.$().text(), "Hello3", "Text got rendered");
		this.title.setTitle(this.anotherTitle);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(this.title.$().text(), "Hello4", "Text got rendered");
		this.anotherTitle.destroy();
		this.anotherTitle = null;
		sap.ui.getCore().applyChanges();
		assert.strictEqual(this.title.$().text(), "Hello", "Text got rendered");
	});

	QUnit.test("Should render a tooltip", function(assert) {
		assert.strictEqual(this.title.$().attr("title"), "Tooltip2", "Tooltip got rendered");
		this.coreTitle.setTooltip("Tooltip3");
		sap.ui.getCore().applyChanges();
		assert.strictEqual(this.title.$().attr("title"), "Tooltip3", "Tooltip got rendered");
		this.title.setTitle(this.anotherTitle);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(this.title.$().attr("title"), "Tooltip4", "Tooltip got rendered");
		this.anotherTitle.destroy();
		this.anotherTitle = null;
		sap.ui.getCore().applyChanges();
		assert.strictEqual(this.title.$().attr("title"), "Tooltip", "Tooltip got rendered");
	});

	QUnit.test("Semantic level correct", function(assert){
		var sExpectedTag;

		for (var level in TitleLevel) {
			this.coreTitle.setLevel(level);
			sap.ui.getCore().applyChanges();

			if (level === TitleLevel.Auto) {
				sExpectedTag = "DIV";
				assert.strictEqual(this.title.$().attr("role"), "heading", "Role attribute correctly set for level Auto");
			} else {
				sExpectedTag = level.toUpperCase();
				assert.ok(!this.title.$().attr("role"), "No role attribute set for level " + level);
			}

			assert.strictEqual(this.title.getDomRef().tagName.toUpperCase(), sExpectedTag, "Title has correct level " + level);
		}
	});

	QUnit.module("Accessibility", {
		beforeEach : function() {
			this.title = new Title({
				text : "Hello"
			});
			this.title.placeAt("uiArea");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.title.destroy();
			this.title = null;
		}
	});

	QUnit.test("getAccessibilityInfo", function(assert){
		var oTitle = new Title({text: "Text"});
		assert.ok(!!oTitle.getAccessibilityInfo, "Title has a getAccessibilityInfo function");
		var oInfo = oTitle.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.strictEqual(oInfo.role, "heading", "AriaRole");
		assert.strictEqual(oInfo.type, undefined, "Type");
		assert.strictEqual(oInfo.description, "Text", "Description");
		assert.strictEqual(oInfo.focusable, false, "Focusable");
		assert.strictEqual(oInfo.enabled, undefined, "Enabled");
		assert.strictEqual(oInfo.editable, undefined, "Editable");
		oTitle.setTitle(new coreTitle({
			text: "Text2"
		}));
		oInfo = oTitle.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, "Text2", "Description");
		oTitle.destroy();
	});

	QUnit.test("Aria-level should be set", function(assert){
		assert.strictEqual(this.title.$().attr("aria-level"), "2", "The aria-level of a non semantically states title should be 2 by default");

		this.title.setTitleStyle(TitleLevel.H5);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(this.title.$().attr("aria-level"), "5", "The aria-level should be '5' when 'titleStyle' is set to 'H5'");
	});
});
