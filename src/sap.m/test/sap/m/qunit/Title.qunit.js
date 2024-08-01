/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/Title",
	"sap/m/Link",
	"sap/m/library",
	"sap/ui/core/library",
	"sap/m/Toolbar",
	"sap/ui/core/Title",
	"sap/ui/core/Renderer",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (createAndAppendDiv, Title, Link, mobileLibrary, coreLibrary, Toolbar, coreTitle, Renderer, nextUIUpdate) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

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
		beforeEach : async function() {
			this.title = new Title({
				text : "Hello",
				tooltip : "Tooltip"
			});
			this.title.placeAt("uiArea");
			await nextUIUpdate();
		},
		afterEach : function() {
			this.title.destroy();
			this.title = null;
		}
	});


	QUnit.test("When width is not set max-width should apply to control", async function(assert) {
		assert.ok(this.title.$().hasClass("sapMTitleMaxWidth"), "Title has max width restriction for the trunctation.");
		this.title.setWidth("100%");
		await nextUIUpdate();
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

	QUnit.test("Wrapping", async function(assert) {
		this.title.setText("Some very very very very long text");
		this.title.setWidth("100px");
		await nextUIUpdate();
		this.title.$().css("line-height", "1.2rem");

		var iHeight = this.title.$().outerHeight();

		assert.ok(this.title.$().hasClass("sapMTitleNoWrap"), "Title has class sapMTitleNoWrap.");
		this.title.setWrapping(true);

		await nextUIUpdate();
		this.title.$().css("line-height", "1.2rem");

		assert.ok(this.title.$().hasClass("sapMTitleWrap"), "Title has class sapMTitleWrap.");
		assert.ok(this.title.$().outerHeight() >= 3 * iHeight, "Title height increases when wrapping is active");
	});

	QUnit.test("Title wrappingType (Hyphenation)", async function(assert) {
		var done = assert.async();
		this.title.setText("pneumonoultramicroscopicsilicovolcanoconiosis");
		await nextUIUpdate();
		this.title.$().css("line-height", "1.2rem");
		var iHeight = this.title.$().outerHeight();
		this.title.setWidth("200px");
		this.title.setWrapping(true);
		this.title.setWrappingType(mobileLibrary.WrappingType.Hyphenated);
		await nextUIUpdate();
		this.title.$().css("line-height", "1.2rem");

		var fnIsHyphenated = function () {
			if (this.title.$().outerHeight() >= 2 * iHeight) {
				assert.ok(true, "Tested title is hyphenated.");
				done();
				return true;
			}
			return false;
		}.bind(this);

		setTimeout(function() {
			if (!fnIsHyphenated()) {
				// try again after a while if not yet hyphenatated
				setTimeout(function() {
					if (!fnIsHyphenated()) {
						assert.ok(false);
						done();
					}
				}, 1000);
			}
		}, 500);
	});

	QUnit.test("TitleStyle correct", async function(assert) {
		for (var level in TitleLevel) {
			this.title.setTitleStyle(level);
			await nextUIUpdate();
			assert.ok(this.title.$().hasClass("sapMTitleStyle" + level), "Title has correct class for style level " + level);
		}
	});

	QUnit.test("Text direction correct", async function(assert) {
		var oTitle = this.title,
			sTextDir,
			sExpectedDir;

		for (sTextDir in TextDirection) {
			oTitle.setTextDirection(sTextDir);
			await nextUIUpdate();

			sExpectedDir = sTextDir !== TextDirection.Inherit ? sTextDir.toLowerCase() : "auto";

			assert.strictEqual(oTitle.$("inner").attr("dir"), sExpectedDir, "Title has correct dir property for " + sTextDir);
		}
	});

	QUnit.test("Alignment correct", async function(assert) {
		var oTitle = this.title,
			sTextDir,
			sAlign,
			sExpectedAlign;

		for (sTextDir in TextDirection) {
			for (sAlign in TextAlign) {
				oTitle.setTextDirection(sTextDir);
				oTitle.setTextAlign(sAlign);
				await nextUIUpdate();

				sExpectedAlign = Renderer.getTextAlign(sAlign, sTextDir);

				assert.strictEqual(oTitle.getDomRef().style["text-align"], sExpectedAlign, "Title has correct text-align for alignment " + sAlign + " in direction " + sTextDir);
			}
		}
	});

	QUnit.test("Semantic level correct", async function(assert) {
		var sExpectedTag;

		for (var level in TitleLevel) {
			this.title.setLevel(level);
			await nextUIUpdate();

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

	QUnit.module("Title Association", {
		beforeEach : async function() {
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
			await nextUIUpdate();
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

	QUnit.test("Should render a text", async function(assert) {
		assert.strictEqual(this.title.$().text(), "Hello2", "Text got rendered");
		this.coreTitle.setText("Hello3");
		await nextUIUpdate();
		assert.strictEqual(this.title.$().text(), "Hello3", "Text got rendered");
		this.title.setTitle(this.anotherTitle);
		await nextUIUpdate();
		assert.strictEqual(this.title.$().text(), "Hello4", "Text got rendered");
		this.anotherTitle.destroy();
		this.anotherTitle = null;
		await nextUIUpdate();
		assert.strictEqual(this.title.$().text(), "Hello", "Text got rendered");
	});

	QUnit.test("Should render a tooltip", async function(assert) {
		assert.strictEqual(this.title.$().attr("title"), "Tooltip2", "Tooltip got rendered");
		this.coreTitle.setTooltip("Tooltip3");
		await nextUIUpdate();
		assert.strictEqual(this.title.$().attr("title"), "Tooltip3", "Tooltip got rendered");
		this.title.setTitle(this.anotherTitle);
		await nextUIUpdate();
		assert.strictEqual(this.title.$().attr("title"), "Tooltip4", "Tooltip got rendered");
		this.anotherTitle.destroy();
		this.anotherTitle = null;
		await nextUIUpdate();
		assert.strictEqual(this.title.$().attr("title"), "Tooltip", "Tooltip got rendered");
	});

	QUnit.test("Semantic level correct", async function(assert) {
		var sExpectedTag;

		for (var level in TitleLevel) {
			this.coreTitle.setLevel(level);
			await nextUIUpdate();

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

	QUnit.test("Should skip 'title' association properties if there is a control in 'content' aggregation", async function(assert) {
		var sLevel = TitleLevel.H3,
			sExpectedTag = sLevel;
		this.coreTitle.setLevel(TitleLevel.H1);
		this.title.setLevel(sLevel);
		this.title.setContent(new Link({
			text: "Link Text",
			href: "https://sap.com",
			target: "_blank"
		}));
		await nextUIUpdate();

		assert.notEqual(this.title.$().text(), "Hello2", "Text from the 'title' association wasn't rendered");
		assert.notEqual(this.title.$().attr("title"), "Tooltip2", "Tooltip from the 'title' association wasn't rendered");

		if (sLevel === TitleLevel.Auto) {
			sExpectedTag = "DIV";
			assert.strictEqual(this.title.$().attr("role"), "heading", "Role attribute correctly set for level Auto");
		} else {
			assert.ok(!this.title.$().attr("role"), "No role attribute set for level " + sLevel);
		}

		assert.strictEqual(this.title.getDomRef().tagName.toUpperCase(), sExpectedTag, "Title has correct level (not from 'title' association)" + sLevel);
	});

	QUnit.module("Content Aggregation", {
		beforeEach : async function() {
			this.link = new Link("myLink", {
				text: "Link",
				href: "https://sap.com",
				target: "_blank"
			});
			this.title = new Title({
				text : "Text",
				tooltip : "Tooltip",
				level: TitleLevel.H3,
				content : this.link
			});
			this.title.placeAt("uiArea");
			await nextUIUpdate();
		},
		afterEach : function() {
			this.title.destroy();
			this.title = null;
			this.link.destroy();
			this.link = null;
		}
	});

	QUnit.test("Should render a link instead of text", function(assert) {
		var content = this.title.getDomRef().firstChild,
			childTag = this.title.getDomRef().firstChild && this.title.getDomRef().firstChild.firstChild ? this.title.getDomRef().firstChild.firstChild.tagName : "",
			sLevel = "H3",
			sExpectedTag = sLevel;

		assert.notEqual(content.innerHTML, this.title.getText(), "Title's 'text' wasn't rendered");
		assert.equal(childTag.toUpperCase(), "A", "Link is rendered");
		assert.equal(content.querySelector(".sapMLnkText").textContent, this.link.getText(), "Link's 'text' is rendered instead of the Title's text");
		assert.strictEqual(this.title.getDomRef().tagName.toUpperCase(), sExpectedTag, "Title has correct level" + sLevel);

	});





	QUnit.module("Accessibility", {
		beforeEach : async function() {
			this.title = new Title({
				text : "Hello"
			});
			this.title.placeAt("uiArea");
			await nextUIUpdate();
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

	QUnit.test("Aria-level should be set", async function(assert) {
		assert.strictEqual(this.title.$().attr("aria-level"), "2", "The aria-level of a non semantically states title should be 2 by default");

		this.title.setTitleStyle(TitleLevel.H5);
		await nextUIUpdate();
		assert.strictEqual(this.title.$().attr("aria-level"), "5", "The aria-level should be '5' when 'titleStyle' is set to 'H5'");
	});
});
