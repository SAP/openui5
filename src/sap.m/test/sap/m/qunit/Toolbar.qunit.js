/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/Toolbar",
	"sap/m/library",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/InvisibleRenderer",
	"sap/m/ToolbarSeparator",
	"sap/m/Button",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/Tokenizer",
	"sap/m/Token",
	"sap/m/Select",
	"sap/m/MultiComboBox",
	"sap/ui/core/Item",
	"sap/m/Title",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Link",
	"sap/m/Text",
	"sap/m/MenuButton",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/m/OverflowToolbarButton",
	"sap/ui/core/Control",
	"sap/ui/events/KeyCodes",
	"sap/m/SearchField",
	"sap/m/ToolbarLayoutData",
	"sap/m/ToolbarRenderer",
	"sap/m/ToolbarSpacer",
	"sap/ui/core/library",
	"sap/ui/core/HTML",
	"sap/base/Log",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/m/Slider",
	"sap/m/RangeSlider",
	"sap/m/ComboBox",
	"sap/m/Breadcrumbs",
	"sap/m/MultiInput"
], function(
	QUtils,
	Toolbar,
	mobileLibrary,
	jQuery,
	InvisibleRenderer,
	ToolbarSeparator,
	Button,
	SegmentedButton,
	SegmentedButtonItem,
	Tokenizer,
	Token,
	Select,
	MultiComboBox,
	Item,
	Title,
	Input,
	Label,
	Link,
	Text,
	MenuButton,
	Menu,
	MenuItem,
	OverflowToolbarButton,
	Control,
	KeyCodes,
	SearchField,
	ToolbarLayoutData,
	ToolbarRenderer,
	ToolbarSpacer,
	coreLibrary,
	HTML,
	Log,
	nextUIUpdate,
	Slider,
	RangeSlider,
	ComboBox,
	Breadcrumbs,
	MultiInput
) {
	"use strict";

	// shortcut for sap.m.ToolbarStyle
	const ToolbarStyle = mobileLibrary.ToolbarStyle;

	// shortcut for sap.m.ToolbarDesign
	const ToolbarDesign = mobileLibrary.ToolbarDesign;

	async function createToolbar(oConfig) {

		// get toolbar config
		oConfig = oConfig || {};
		const oTBConfig = oConfig.Toolbar || {};
		delete oConfig.Toolbar;

		// should place at qunit fixture
		const bShouldRender = (oConfig.render !== false);
		delete oConfig.render;

		// create toolbar
		const oTB = new Toolbar(oTBConfig);

		// add contents

		// render
		if (bShouldRender) {
			oTB.placeAt("qunit-fixture");
			await nextUIUpdate();
		}

		return oTB;
	}

	QUnit.module("Rendering");
	QUnit.test("test rendering and visible property", async function(assert) {
		const oTB = await createToolbar({
			Toolbar : {
				content: [
					new Label({text: "text"})
				]
			}
		});


		assert.strictEqual(oTB.$().length, 1, "Toolbar is in DOM");
		assert.ok(oTB.$().hasClass("sapMTB"), "Toolbar has correct class name");
		oTB.setVisible(false);
		await nextUIUpdate();
		const $ToolbarPlaceHolder = jQuery("#" + InvisibleRenderer.createInvisiblePlaceholderId(oTB));
		assert.strictEqual(oTB.$().length, 0, "Toolbar is no longer in DOM after setting it to invisible");
		assert.strictEqual($ToolbarPlaceHolder.length, 1, "Toolbar placeholder is in DOM after setting it to invisible");
		assert.strictEqual($ToolbarPlaceHolder.css("display"), "none", "Toolbar placeholder should have display none when invisible");

		oTB.destroy();
	});

	QUnit.test("test empty content", async function(assert) {
		const oTB = await createToolbar({Toolbar : {}});
		assert.strictEqual(oTB.$().length, 1, "Bar is in DOM even without any content");
		oTB.destroy();
	});

	QUnit.test("test tooltip", async function(assert) {
		const sTooltip = "tooltip";
		const oTB = await createToolbar({
			Toolbar : {
				tooltip: sTooltip
			}
		});
		assert.strictEqual(oTB.getDomRef().title, sTooltip, "Tooltip is set correctly");
		oTB.destroy();
	});

	QUnit.test("test design property", async function(assert) {
		const oTB = await createToolbar({
			Toolbar : {
				content: [
					new Label({text: "text"})
				]
			}
		});

		assert.strictEqual(ToolbarDesign.Auto, oTB.getDesign(), "Toolbar initially has design property 'Auto'");
		assert.ok(!oTB.$().hasClass("sapMTB-Info-CTX"), "Initially, toolbar has no info context class");
		assert.ok(!oTB.$().hasClass("sapMTB-Transparent-CTX"), "Initially, toolbar has no transparent context class");

		oTB.setDesign(ToolbarDesign.Transparent);
		await nextUIUpdate();
		assert.ok(oTB.$().hasClass("sapMTB-Transparent-CTX"), "Toolbar has transparent context");

		oTB.setDesign(ToolbarDesign.Solid);
		await nextUIUpdate();
		assert.ok(oTB.$().hasClass("sapMTB-Solid-CTX"), "Toolbar has solid context");

		oTB.setDesign(ToolbarDesign.Info);
		await nextUIUpdate();
		assert.ok(oTB.$().hasClass("sapMTB-Info-CTX"), "Toolbar has info context");

		oTB.setDesign(ToolbarDesign.Auto);
		await nextUIUpdate();
		assert.ok(!oTB.$().hasClass("sapMTB-Transparent-CTX"), "Transparent context has been removed again");

		oTB.setDesign(ToolbarDesign.Info, true);
		oTB.invalidate();
		await nextUIUpdate();
		assert.ok(oTB.$().hasClass("sapMTB-Info-CTX"), "Toolbar has now Info design.");
		assert.ok(!oTB.$().hasClass("sapMTB-Transparent-CTX"), "Transparent context is not set");
		assert.strictEqual(ToolbarDesign.Info, oTB.getActiveDesign(), "Active design should be 'Info'");
		assert.strictEqual(ToolbarDesign.Auto, oTB.getDesign(), "But design property is still 'Auto'");

		oTB.destroy();
	});

	QUnit.test("Should add the IBar-CTX if style and tag are set", async function(assert) {
		// Arrange + System under Test
		const oTB = await createToolbar();

		assert.ok(!oTB.$().hasClass("sapMIBar-CTX"), "Toolbar does not have the IBar context");

		// Act
		oTB.applyTagAndContextClassFor("footer");
		await nextUIUpdate();

		// Assert
		assert.ok(oTB.$().hasClass("sapMIBar-CTX"), "Toolbar does have the IBar context");
		assert.ok(oTB.$().hasClass("sapMFooter-CTX"), "Toolbar does have the Footer context");

		//Cleanup
		oTB.destroy();
	});

	QUnit.test("test style property", async function (assert) {
		const oTB = await createToolbar({
			Toolbar: {
				content: [
					new Label({text: "text"})
				]
			}
		});

		assert.equal(oTB.getStyle(), ToolbarStyle.Standard, "The initial ToolbarStyle property value is correct");
		assert.ok(oTB.$().hasClass("sapMTBStandard"), "Initially, toolbar has correct style class");

		//act
		oTB.setStyle(ToolbarStyle.Clear);
		await nextUIUpdate();

		//check
		assert.ok(!oTB.$().hasClass("sapMTBStandard"), "toolbar has correct style class");
		assert.ok(oTB.$().hasClass("sapMTBClear"), "toolbar has correct style class");

		oTB.destroy();
	});

	QUnit.test("test that Toolbar Separator is rendered", async function(assert) {
		const oToolbarSeparator = new ToolbarSeparator();
		const oTB = await createToolbar({
			Toolbar : {
				content : [oToolbarSeparator]
			}
		});

		// Assert
		assert.ok(oToolbarSeparator.$().hasClass("sapMTBSeparator"), "Separator does have the expected CSS class");
		assert.ok(oToolbarSeparator.$().width() > 0, "Separator does have a width");
		assert.ok(oToolbarSeparator.$().height() > 0, "Separator does have a height");

		//Cleanup
		oTB.destroy();
	});

	QUnit.test("test sapMBarChildFirstChild class", async function(assert) {
		const oFirstControl = new Button({ text: "Button1" });
		const oSecondControl = new Button({ text: "Button2" });
		const oTB = await createToolbar({
			Toolbar : {
				content : [oFirstControl, oSecondControl]
			}
		});

		//Assert
		assert.ok(oFirstControl.hasStyleClass("sapMBarChildFirstChild"), "First child has 'sapMBarChildFirstChild' class");
		assert.notOk(oSecondControl.hasStyleClass("sapMBarChildFirstChild"), "Second child does not have 'sapMBarChildFirstChild' class");

		//Act
		oFirstControl.setVisible(false);
		await nextUIUpdate();

		//Assert
		assert.notOk(oFirstControl.hasStyleClass("sapMBarChildFirstChild"), "First child does not have 'sapMBarChildFirstChild' class");
		assert.ok(oSecondControl.hasStyleClass("sapMBarChildFirstChild"), "Second child now has 'sapMBarChildFirstChild' class, as the first one is not visible");

		//Cleanup
		oTB.destroy();
	});

	QUnit.test("should not log warnings when using sap.ui.core.HTML control", async function (assert) {
		// Arrange
		const oLogErrorSpy = sinon.spy(Log, "warning");
		const oHtmlContent = new HTML({
			content: "<span>Example</span>"
		});

		const oToolbar = await createToolbar({
			Toolbar: { content: oHtmlContent }
		});

		// Assert
		if (oLogErrorSpy.callCount === 0) {
			assert.ok(true, 0, "sap.ui.core.HTML control didn't log error for style classes");
		} else {
			oLogErrorSpy.getCalls().forEach((oCall) => {
				assert.ok(oCall.args[0].indexOf("sap.m.Toolbar") === -1, "sap.ui.core.HTML control didn't log error for style classes");
			});
		}

		// Cleanup
		oToolbar.destroy();
		oLogErrorSpy.restore();
	});

	QUnit.module("Accessiblity");

	QUnit.test("getAccessibilityInfo method returns correct children count", async function(assert) {
		const aDefaultContent = [
			new Button({width: "150px"}),
			new Button({width: "150px"})
		];
		const oTB = new Toolbar({
			content : aDefaultContent
		});

		oTB.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(oTB.getAccessibilityInfo().children.length, oTB.getContent().length, "children property of accessibility info object contains correct amount of children");

		oTB.destroy();
	});

	QUnit.module("ARIA");

	QUnit.test("Default ARIA attributes", async function(assert) {
		// Arrange + System under Test
		const oBtn1 = new Button({
			text : "Button Text"
		});
		const oBtn2 = new Button({
			text: "Button Text 2"
		});
		const oTitle = new Title({
			text : "Title text"
		});
		const oTB = new Toolbar({
			content : [oTitle, oBtn1, oBtn2]
		}).applyTagAndContextClassFor("header");
		oTB.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Assert
		assert.equal(oTB.$().attr("role"), "toolbar", "Toolbar has attribute role='toolbar'");
		assert.equal(oTB.$().attr("aria-labelledby"), oTitle.getId(), "Toolbar is labelled by its title by default");
		assert.equal(oTB.$().attr("aria-disabled"), undefined, "Toolbar has no attribute aria-disabled");

		//Act
		oTB.setEnabled(false);
		await nextUIUpdate();

		//Assert
		assert.equal(oTB.$().attr("aria-disabled"), "true", "Toolbar has attribute aria-disabled='true'");
		assert.equal(oBtn1.$().attr("aria-disabled"), undefined, "Toolbar's children have attribute aria-disabled='true'");

		//Cleanup
		oTB.destroy();
	});

	QUnit.test("Default ARIA attributes", async function(assert) {
		const MyTitle = Control.extend("my.Title", {
			metadata : {
				library : "my",
				interfaces : [
					"sap.ui.core.ITitle"
				],
				properties : {
					"text" : "string"
				}
			},
			renderer : {
				apiVersion: 2,
				render: (oRm, oControl) => {
					oRm.openStart("div", oControl).openEnd().text(oControl.getText()).close("div");
				}
			}
		});

		const oMyTitle = new MyTitle({
			text : "Title"
		});
		const oToolbar = new Toolbar({
			content : [
				oMyTitle,
				new Button({
					text: "Btn1"
				}),
				new Button({
					text: "Btn2"
				})
			]
		});

		oToolbar.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.equal(oToolbar.getTitleControl(), oMyTitle, "getTitleControl returns the custom title control");
		assert.equal(oToolbar.getTitleId(), oMyTitle.getId(), "getTitleId returns the custom title control ID");
		assert.equal(oToolbar.$().attr("aria-labelledby"), oMyTitle.getId(), "Toolbar is labelled by the custom title control");

		oMyTitle.setVisible(false);
		oToolbar.invalidate();
		await nextUIUpdate();

		assert.notOk(oToolbar.getTitleControl(), undefined, "getTitleControl does not return the custom title control since it is invisible");
		assert.notOk(oToolbar.getTitleId(), "getTitleId returns empty since the custom title control is invisible");
		assert.notOk(oToolbar.$().attr("aria-labelledby"), "Toolbar is not labelled by the custom invisible title control");

		oToolbar.destroy();
	});

	QUnit.test("Role attribute and aria-labelledby with interactive Controls", async function(assert) {
		// Arrange + System under Test
		const oBtn1 = new Button({
			text : "Button Text"
		});
		const oBtn2 = new Button({
			text: "Button Text 2"
		});
		const oTitle = new Title({
			text : "Title text"
		});
		const oTB = new Toolbar({
			content : [oTitle, oBtn1]
		});
		oTB.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Assert
		assert.strictEqual(oTB.$().attr("role"), undefined,
			"Toolbar does not have 'role' attribute, when there are less than two interactive Controls");
		assert.strictEqual(oTB.$().attr("aria-labelledby"), undefined,
			"Toolbar does not have 'aria-labelledby' attribute, when there are less than two interactive Controls");

		//Act
		oTB.addContent(oBtn2);
		await nextUIUpdate();

		//Assert
		assert.strictEqual(oTB.$().attr("role"), "toolbar",
			"Toolbar has 'role' attribute, when there are at least two interactive Controls");
		assert.strictEqual(oTB.$().attr("aria-labelledby"), oTitle.getId(),
			"Toolbar has 'aria-labelledby' attribute, when there are at least two interactive Controls");

		//Cleanup
		oTB.destroy();
	});

	QUnit.test("Role attribute and aria-labelledby with visible/not visible interactive Controls", async function(assert) {
		// Arrange + System under Test
		const oBtn1 = new Button({
			text : "Button Text"
		});
		const oBtn2 = new Button({
			visible: false,
			text: "Button Text 2"
		});
		const oTitle = new Title({
			text : "Title text"
		});
		const oTB = new Toolbar({
			content : [oTitle, oBtn1, oBtn2]
		});
		oTB.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Assert
		assert.strictEqual(oTB.$().attr("role"), undefined,
			"Toolbar does not have 'role' attribute, when there are less than two interactive Controls");
		assert.strictEqual(oTB.$().attr("aria-labelledby"), undefined,
			"Toolbar does not have 'aria-labelledby' attribute, when there are less than two interactive Controls");

		//Act
		oBtn2.setVisible(true);
		await nextUIUpdate();

		//Assert
		assert.strictEqual(oTB.$().attr("role"), "toolbar",
			"Toolbar has 'role' attribute, when there are at least two interactive Controls");
		assert.strictEqual(oTB.$().attr("aria-labelledby"), oTitle.getId(),
			"Toolbar has 'aria-labelledby' attribute, when there are at least two interactive Controls");

		//Cleanup
		oTB.destroy();
	});

	QUnit.test("_getToolbarInteractiveControlsCount with non interactive Controls", async function(assert) {
		// Arrange + System under Test
		const oTB = new Toolbar({
			content : [new Title(), new Label(), new Text()]
		});
		await nextUIUpdate();

		//Assert
		assert.strictEqual(oTB._getToolbarInteractiveControlsCount(), 0,
			"Title, Label and Text are not interactive Control");

		//Cleanup
		oTB.destroy();
	});

	QUnit.test("_getToolbarInteractiveControlsCount with interactive Controls", async function(assert) {
		// Arrange + System under Test
		const oTB = new Toolbar({
			content : [new Input(), new Link(), new Button()]
		});
		await nextUIUpdate();

		//Assert
		assert.strictEqual(oTB._getToolbarInteractiveControlsCount(), 3,
			"Input, Link and Button are interactive Control");

		//Cleanup
		oTB.destroy();
	});

	QUnit.test("If Toolbar's content is made of only a label aria-labelledby should not be present - internal labels", async function(assert) {
		// Arrange + System under Test
		const oLabel = new Label({
			text : "Toolbar Label"
		});
		const oTB = new Toolbar({
			content : oLabel,
			ariaLabelledBy: oLabel.getId()
		});
		oTB.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Assert
		const oInvisibleText = document.getElementById(oTB.getId() + "-InvisibleText");
		assert.notOk(oInvisibleText, "Invisible text is not rendered in the static area");
		assert.strictEqual(oTB.$().attr("aria-labelledby"), undefined, "Toolbar does not have attribute aria-labelledby - external label");

		oTB.applyTagAndContextClassFor("header");
		await nextUIUpdate();

		//Cleanup
		oLabel.destroy();
		oTB.destroy();
	});

	QUnit.test("If Toolbar's content is made of only a label aria-labelledby should not be present - internal and external labels", async function(assert) {
		// Arrange + System under Test
		const oLabel = new Label({
			text : "Toolbar Label"
		});
		const oTB = new Toolbar({
			content : oLabel,
			ariaLabelledBy: oLabel.getId()
		}).applyTagAndContextClassFor("header");
		oTB.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Assert
		const oInvisibleText = document.getElementById(oTB.getId() + "-InvisibleText");
		assert.notOk(oInvisibleText, "Invisible text is not rendered in the static area");
		assert.strictEqual(oTB.$().attr("aria-labelledby"), undefined, "Toolbar does not have attribute aria-labelledby - external label");

		//Cleanup
		oLabel.destroy();
		oTB.destroy();
	});

	QUnit.test("Active toolbar role", async function(assert) {
		// Arrange
		const oLabel = new Label({
			text : "Toolbar Label"
		});
		const oTB = new Toolbar({
			active: true,
			content : oLabel
		});
		oTB.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.notOk(oTB.$().attr("role") === "button", "Active toolbar should not have role button");

		//Act
		oTB.focus();
		await nextUIUpdate();

		//Assert
		assert.ok(oTB.hasStyleClass("sapMTBFocused"), "Focused class is added to the toolbar container");

		//Cleanup
		oLabel.destroy();
		oTB.destroy();
	});

	QUnit.test("Active toolbar aria-haspopup", async function(assert) {
		// Arrange
		const oToolbar = new Toolbar({
			active: true,
			ariaHasPopup: coreLibrary.aria.HasPopup.Dialog
		});
		oToolbar.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Assert
		assert.equal(oToolbar._getActiveButton().$().attr("aria-haspopup"), coreLibrary.aria.HasPopup.Dialog, "Active toolbar focus element should have correct aria-haspopup");

		// Act
		oToolbar.setActive(false);
		await nextUIUpdate();

		//Assert
		assert.equal(oToolbar._getActiveButton().$().attr("aria-haspopup"), undefined, "Toolbar focus element should not have aria-haspopup if active property is false");

		//Cleanup
		oToolbar.destroy();
	});

	QUnit.test("_setEnableAccessibilty disables and re-enables toolbar role and fastnavgroup", async function(assert) {
		// Arrange
		const oTB = new Toolbar({
			content: [ new Button(),
				new Button() ]
		});
		oTB.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Assert
		assert.strictEqual(oTB.$().attr("role"), "toolbar", "Toolbar has attribute role='toolbar'");
		assert.strictEqual(oTB.$().attr("data-sap-ui-fastnavgroup"), "true", "Toolbar has attribute data-sap-ui-fastnavgroup='true'");

		// Arrange
		oTB._setEnableAccessibilty(false);
		await nextUIUpdate();

		//Assert
		assert.strictEqual(oTB.$().attr("role"), "none", "Toolbar hasn't attribute role");
		assert.strictEqual(oTB.$().attr("data-sap-ui-fastnavgroup"), undefined, "Toolbar hasn't attribute data-sap-ui-fastnavgroup");

		// Clean
		oTB.destroy();
	});

	QUnit.module("Properties");

	QUnit.test("Should be able to add/remove undefined controls", function(assert) {
		// System under Test
		const oToolbar = new Toolbar();

		// Act
		oToolbar.addContent(undefined);
		oToolbar.removeContent(undefined);

		// Assert
		assert.ok(true, "no error occured");

		//Cleanup
		oToolbar.destroy();
	});

	QUnit.module("Statics");

	QUnit.test("controls shoulds return correct original and initial width", function(assert) {
		const isRelativeWidth = Toolbar.isRelativeWidth;
		const oConfig = {
			"" : true,
			"-10%" : true,
			"100%" : true,
			"+1000%" : true,
			"Auto" : true,
			"inHerit" : true,
			"20px" : false,
			"15rem"	: false,
			"0" : false,
			"none" : false
		};

		// check expecteds
		Object.keys(oConfig).forEach(function(sWidth) {
			const bExpected = oConfig[sWidth];
			const bRelative = isRelativeWidth(sWidth);
			const sMessage = JSON.stringify(sWidth) + " is " + (bExpected ? "" : "not") + " relative width";
			assert.strictEqual(bExpected ? bRelative : !bRelative, true, sMessage);
		});

	});

	QUnit.test("controls shoulds return correct original and initial width", function(assert) {
		const getOrigWidth = Toolbar.getOrigWidth;

		// test dummy control has no width
		const oControl = new Control();
		assert.strictEqual(getOrigWidth(oControl.getId()), "", "Control without width property returns empty text");
		assert.strictEqual(getOrigWidth(":)"), "", "Non-Control parameter calls should return empty text");
		oControl.destroy();

		// test a real control's width
		const oSF = new SearchField();
		assert.strictEqual(getOrigWidth(oSF.getId()), "100%", "Default width of the SearchField is 100%");
		oSF.setWidth("100px");
		assert.strictEqual(getOrigWidth(oSF.getId()), oSF.getWidth(), "SearhField's width found correctly via ID");
		oSF.destroy();
	});

	QUnit.test("should detect whether toolbar content is shrinkable or not", async function(assert) {
		// test wrapper
		const testShrinkable = async function(bExpected, sMessage, fnControlClass, oConfig) {
			const sShrinkClass = "shrink";
			const oControl = new fnControlClass(oConfig || {});
			oControl.placeAt("qunit-fixture");
			await nextUIUpdate();

			const bShrink = Toolbar.checkShrinkable(oControl, sShrinkClass);
			const sPrefix = (bExpected) ? "should shrink" : "should not shrink";
			assert.ok(bExpected ? bShrink : !bShrink, sMessage + " " + sPrefix);
			oControl.destroy();
		};

		// bind inital params
		const shouldShrink = testShrinkable.bind(0, true);
		const shouldNotShrink = testShrinkable.bind(0, false);

		// when should shrink
		await shouldShrink("ToolbarSpacer with default properties", ToolbarSpacer, {});
		await shouldShrink("The Button width percent value", Button, {width : "100%"});
		await shouldShrink("SearchField with default properties", SearchField);
		await shouldShrink("Input with default properties", Input);
		await shouldShrink("Label control with default properties", Label);
		await shouldShrink("Link control with default properties", Link);
		await shouldShrink("Text control with default properties", Text);
		await shouldShrink("Text control with maxLines 2", Text, {
			maxLines : 2
		});

		await shouldShrink("Button with shrinkable layoutData", Button, {
			layoutData: new ToolbarLayoutData({
				shrinkable : true
			})
		});

		// when should not shrink
		await shouldNotShrink("Button control width default properties", Button, {});
		await shouldNotShrink("Fixed width ToolbarSpacer", ToolbarSpacer, {width : "200px"});
		await shouldNotShrink("Fixed width Shrinkable text", Text, {width : "5rem"});
		await shouldNotShrink("SearchField with unshrinkable layoutData", SearchField, {
			layoutData: new ToolbarLayoutData({
				shrinkable : false
			})
		});
	});

	QUnit.module("Behaviour");
	QUnit.test("content property change handler should be registered correctly", async function(assert) {
		const oLabel = new Label({text : "text"});
		const oTB = await createToolbar();
		let vRetVal;

		// test inital
		assert.ok(!oLabel.hasListeners("_change"), "Initially content does not have _change event");

		// add content and test
		vRetVal = oTB.addContent(oLabel);
		assert.strictEqual(vRetVal, oTB, "Toolbar#addContent function returns the toolbar instance for method chaining");
		assert.ok(oLabel.hasListeners("_change"), "After new content is added _change event is registered to the control");

		// remove content and test
		vRetVal = oTB.removeContent(oLabel);
		assert.strictEqual(vRetVal, oLabel, "Toolbar#removeContent function returns removed control");
		assert.ok(!oLabel.hasListeners("_change"), "After content is removed _change event is deregistered from the control");

		// insert content and test
		vRetVal = oTB.insertContent(oLabel, 0);
		assert.strictEqual(vRetVal, oTB, "Toolbar#insertContent function returns the toolbar instance for method chaining");
		assert.ok(oLabel.hasListeners("_change"), "After new content is inserted _change event is registered to the control");

		// remove all content and test
		vRetVal = oTB.removeAllContent();
		assert.strictEqual(vRetVal[0], oLabel, "Toolbar#removeAllContent function returns the array of removed controls");
		assert.ok(!oLabel.hasListeners("_change"), "After all content is removed _change event is deregistered from the control too");

		// cleanup
		oLabel.destroy();
		oTB.destroy();
	});

	QUnit.test("when content property is changed toolbar should be informed", async function(assert) {
		const spy = this.spy(Toolbar.prototype, "_onContentPropertyChanged");
		const oLabel = new Label({text : "text"});
		const oTB = await createToolbar({
			Toolbar : {
				content : [oLabel]
			}
		});

		// change property and check spy
		oLabel.setText("x");
		assert.strictEqual(spy.callCount, 1, "Property change is detected");
		oLabel.destroy();
		oTB.destroy();
	});

	QUnit.module("Events");
	QUnit.test("active toolbar should fire press event", async function(assert) {
		const oLabel = new Label({text : "text"});
		const fnPressSpy = this.spy();
		const oTB = await createToolbar({
			Toolbar : {
				active : true,
				content : [oLabel],
				press: fnPressSpy
			}
		});

		QUtils.triggerEvent("tap", oLabel.getDomRef());
		assert.strictEqual(fnPressSpy.callCount, 1, "Tap event from Label is triggered the press event of the active Toolbar");

		QUtils.triggerKeydown(oTB._getActiveButton().getDomRef(), "ENTER");
		assert.strictEqual(fnPressSpy.callCount, 2, "Enter hotkey of the active Toolbar triggered press event");

		//Cleanup
		oLabel.destroy();
		oTB.destroy();
	});

	QUnit.test("active toolbar should fire press event on onkeyup on SPACE key", async function(assert) {
		const oLabel = new Label({text : "text"});
		const fnPressSpy = this.spy();
		const oTB = await createToolbar({
			Toolbar : {
				active : true,
				content : [oLabel],
				press: fnPressSpy
			}
		});

		//act
		QUtils.triggerKeydown(oTB._getActiveButton().getDomRef(), KeyCodes.SPACE);
		//assert
		assert.ok(fnPressSpy.notCalled, "Event is not fired onkeydown with SPACE key");
		//act
		QUtils.triggerKeyup(oTB._getActiveButton().getDomRef(), KeyCodes.SPACE);
		//assert
		assert.ok(fnPressSpy.calledOnce, "Event is fired onkeyup with SPACE key");

		//Cleanup
		oLabel.destroy();
		oTB.destroy();
	});

	QUnit.test("tests left/right arrow key navigation", async function(assert) {
		const oLabel = new Label({text : "text"});
		const oButton = new Button({text : "text"});
		const oMenuButton = new MenuButton({ text : "text", menu : new Menu({items: [new MenuItem({text: "item1"}), new MenuItem({text: "item2"})]}) });
		const oLink = new Link({text : "text"});
		const oTB = await createToolbar({
			Toolbar : {
				content : [oLink, oMenuButton, oLabel, oButton]
			}
		});
		const oArrowRightEvent = new KeyboardEvent("keydown", { code: KeyCodes.ARROW_RIGHT });
		const oArrowLeftEvent = new KeyboardEvent("keydown", { code: KeyCodes.ARROW_LEFT });

		// Focus the first element manually
		oLink.focus();

		oTB._moveFocus("forward", oArrowRightEvent);

		assert.strictEqual(document.activeElement, oMenuButton._getButtonControl().getDomRef(), "The next interactive element inside the toolbar is focused on arrow right");

		oTB._moveFocus("forward", oArrowRightEvent);

		assert.strictEqual(document.activeElement, oButton.getDomRef(), "The next interactive element inside the toolbar is focused on arrow right");

		oTB._moveFocus("backward", oArrowLeftEvent);

		assert.strictEqual(document.activeElement, oMenuButton._getButtonControl().getDomRef(), "The previous interactive element inside the toolbar is focused on arrow left");

		oTB._moveFocus("backward", oArrowLeftEvent);

		assert.strictEqual(document.activeElement, oLink.getDomRef(), "The previous interactive element inside the toolbar is focused on arrow left");

		// Cleanup
		oLabel.destroy();
		oMenuButton.destroy();
		oButton.destroy();
		oLink.destroy();
		oTB.destroy();
	});

	QUnit.test("arrow key navigation reaches wrapper controls whose getParent() skips the toolbar", async function(assert) {
		// A wrapper that implements IToolbarInteractiveControl and owns its inner
		// button via a UI5 aggregation, but whose own getParent() is overridden to
		// return something other than the toolbar (parent-chain mismatch).
		const WrapperControl = Control.extend("demo.WrapperControl", {
			metadata: {
				interfaces: ["sap.m.IToolbarInteractiveControl"],
				aggregations: { _btn: { type: "sap.m.Button", multiple: false, visibility: "hidden" } }
			},
			init: function() {
				this.setAggregation("_btn", new Button({ text: this.getId() }));
			},
			_getToolbarInteractive: function() { return true; },
			getFocusDomRef: function() { return this.getAggregation("_btn").getFocusDomRef(); },
			renderer: {
				apiVersion: 2,
				render: function(oRm, oCtrl) {
					oRm.openStart("div", oCtrl).openEnd();
					oRm.renderControl(oCtrl.getAggregation("_btn"));
					oRm.close("div");
				}
			}
		});

		const oDetachedParent = new Button({ text: "detached" });
		const oLink = new Link({ text: "First" });
		const oWrapper1 = new WrapperControl();
		const oWrapper2 = new WrapperControl();
		const oButton = new Button({ text: "Last" });

		// getParent() on each wrapper bypasses the toolbar, but the inner
		// button's getParent() correctly returns its wrapper via aggregation.
		oWrapper1.getParent = function() { return oDetachedParent; };
		oWrapper1.sParentAggregationName = "dependents";
		oWrapper2.getParent = function() { return oDetachedParent; };
		oWrapper2.sParentAggregationName = "dependents";

		const oTB = await createToolbar({
			Toolbar: { content: [oLink, oWrapper1, oWrapper2, oButton] }
		});

		const oArrowRightEvent = new KeyboardEvent("keydown", { keyCode: KeyCodes.ARROW_RIGHT });
		const oArrowLeftEvent  = new KeyboardEvent("keydown", { keyCode: KeyCodes.ARROW_LEFT });

		// Forward: Link → Wrapper1 → Wrapper2 → Button
		oLink.focus();
		oTB._moveFocus("forward", oArrowRightEvent);
		assert.strictEqual(document.activeElement, oWrapper1.getAggregation("_btn").getDomRef(),
			"Arrow right from Link focuses Wrapper1");

		oTB._moveFocus("forward", oArrowRightEvent);
		assert.strictEqual(document.activeElement, oWrapper2.getAggregation("_btn").getDomRef(),
			"Arrow right from Wrapper1 focuses Wrapper2");

		oTB._moveFocus("forward", oArrowRightEvent);
		assert.strictEqual(document.activeElement, oButton.getDomRef(),
			"Arrow right from Wrapper2 focuses Button");

		// Backward: Button → Wrapper2 → Wrapper1 → Link
		oTB._moveFocus("backward", oArrowLeftEvent);
		assert.strictEqual(document.activeElement, oWrapper2.getAggregation("_btn").getDomRef(),
			"Arrow left from Button focuses Wrapper2");

		oTB._moveFocus("backward", oArrowLeftEvent);
		assert.strictEqual(document.activeElement, oWrapper1.getAggregation("_btn").getDomRef(),
			"Arrow left from Wrapper2 focuses Wrapper1");

		oTB._moveFocus("backward", oArrowLeftEvent);
		assert.strictEqual(document.activeElement, oLink.getDomRef(),
			"Arrow left from Wrapper1 focuses Link");

		// Cleanup
		oDetachedParent.destroy();
		oLink.destroy();
		oWrapper1.destroy();
		oWrapper2.destroy();
		oButton.destroy();
		oTB.destroy();
	});

	QUnit.test("tests up/down arrow key navigation", async function(assert) {
		const oLabel = new Label({text : "text"});
		const oButton = new Button({text : "text"});
		const oLink = new Link({text : "text"});
		const oTB = await createToolbar({
			Toolbar : {
				content : [oLink, oLabel, oButton]
			}
		});
		const oArrowUpEvent = new KeyboardEvent("keydown", { code: KeyCodes.ARROW_UP });
		const oArrowDownEvent = new KeyboardEvent("keydown", { code: KeyCodes.ARROW_DOWN });

		// Focus the first element manually
		oLink.focus();

		oTB._moveFocus("forward", oArrowUpEvent);

		assert.strictEqual(document.activeElement, oButton.getDomRef(), "The next interactive element inside the toolbar is focused on arrow up");

		oTB._moveFocus("backward", oArrowDownEvent);

		assert.strictEqual(document.activeElement, oLink.getDomRef(), "The previous interactive element inside the toolbar is focused on arrow down");

		// Cleanup
		oLabel.destroy();
		oButton.destroy();
		oLink.destroy();
		oTB.destroy();
	});

	QUnit.test("tests up/down arrow key navigation of aggregated control", async function(assert) {
		const SelectWrapper = Control.extend("custom.SelectWrapper", {
				metadata: {
					interfaces: [ "sap.m.IToolbarInteractiveControl" ],
					aggregations: { _select: { type: "sap.m.Select", multiple: false, visibility: "hidden" } }
				},
				init: function () {
					this.setAggregation("_select", new Select({items: [new Item({text: "Item 1"}), new Item({text: "Item 2"})]}));
				},
				_getToolbarInteractive: function() { return true; },
				renderer: {
					apiVersion: 2,
					render: function (oRm, oControl) {
						oRm.openStart("div", oControl);
						oRm.openEnd();
						oRm.renderControl(oControl.getAggregation("_select"));
						oRm.close("div");
					}
				}
			});
		const oSelectWrapper = new SelectWrapper();
		const oSelect = oSelectWrapper.getAggregation("_select");
		const oTB = await createToolbar({
			Toolbar : {
				content : [oSelectWrapper]
			}
		});
		const oArrowUpEvent = new KeyboardEvent("keydown", { keyCode: KeyCodes.ARROW_UP });
		const oArrowDownEvent = new KeyboardEvent("keydown", { keyCode: KeyCodes.ARROW_DOWN });
		const oDefaultBehaviorSpy = sinon.spy(oTB, "_shouldAllowDefaultBehavior");

		// Focus the first element manually
		oSelect.focus();
		oDefaultBehaviorSpy.resetHistory();

		// Act: move forward
		oTB._moveFocus("forward", oArrowUpEvent);

		// Check
		assert.strictEqual(document.activeElement, oSelect.getFocusDomRef(), "The focus is still on the select");
		assert.ok(oDefaultBehaviorSpy.calledOnce, "Default behavior is allowed on arrow up");
		assert.ok(oDefaultBehaviorSpy.returned(true), "Default behavior is allowed on arrow up");
		assert.ok(oDefaultBehaviorSpy.getCall(0).args[1].isA("custom.SelectWrapper"), "The default behavior is called with the correct control type");

		oDefaultBehaviorSpy.resetHistory();

		// Act: move backward
		oTB._moveFocus("backward", oArrowDownEvent);

		// Check
		assert.strictEqual(document.activeElement, oSelect.getFocusDomRef(), "The focus is still on the select");
		assert.ok(oDefaultBehaviorSpy.calledOnce, "Default behavior is allowed on arrow down");
		assert.ok(oDefaultBehaviorSpy.returned(true), "Default behavior is allowed on arrow down");
		assert.ok(oDefaultBehaviorSpy.getCall(0).args[1].isA("custom.SelectWrapper"), "The default behavior is called with the correct control type");

		// Cleanup
		oTB.destroy();
	});

	QUnit.test("tests that arrow key navigation is prevented when modifier keys are pressed", async function(assert) {
		const oLabel = new Label({text : "text"});
		const oButton = new Button({text : "text"});
		const oLink = new Link({text : "text"});
		const oTB = await createToolbar({
			Toolbar : {
				content : [oLink, oLabel, oButton]
			}
		});
		const oMoveFocusSpy = sinon.spy(oTB, "_moveFocus");

		// Focus the first element manually
		oLink.focus();

		// Test with Ctrl + Arrow Right
		const oCtrlArrowRightEvent = new KeyboardEvent("keydown", {
			keyCode: KeyCodes.ARROW_RIGHT,
			ctrlKey: true
		});

		oTB._handleKeyNavigation(oCtrlArrowRightEvent);
		assert.ok(oMoveFocusSpy.notCalled, "Navigation is prevented when Ctrl key is pressed with arrow right");
		assert.strictEqual(document.activeElement, oLink.getDomRef(), "Focus remains on the original element with Ctrl + arrow right");

		oMoveFocusSpy.resetHistory();

		// Test with Alt + Arrow Left
		const oAltArrowLeftEvent = new KeyboardEvent("keydown", {
			keyCode: KeyCodes.ARROW_LEFT,
			altKey: true
		});

		oTB._handleKeyNavigation(oAltArrowLeftEvent);
		assert.ok(oMoveFocusSpy.notCalled, "Navigation is prevented when Alt key is pressed with arrow left");
		assert.strictEqual(document.activeElement, oLink.getDomRef(), "Focus remains on the original element with Alt + arrow left");

		oMoveFocusSpy.resetHistory();

		// Test with Command + Arrow Left
		oTB._handleKeyNavigation(oAltArrowLeftEvent);
		assert.ok(oMoveFocusSpy.notCalled, "Navigation is prevented when Command key is pressed with arrow left");
		assert.strictEqual(document.activeElement, oLink.getDomRef(), "Focus remains on the original element with Command + arrow left");

		oMoveFocusSpy.resetHistory();

		// Cleanup
		oLabel.destroy();
		oButton.destroy();
		oLink.destroy();
		oTB.destroy();
	});

	QUnit.test("_shouldAllowDefaultBehavior on arrow key navigation", async function(assert) {
		assert.expect(40);
		const oSlider      = new Slider({ width: "200px", value: 50 });
		const oRangeSlider = new RangeSlider({ width: "200px", value: 20, value2: 80 });
		const oMultiInput  = new MultiInput({ tokens: [new Token({ text: "T1" }), new Token({ text: "T2" })] });
		const oSelect      = new Select({ items: [new Item({ text: "A", key: "a" }), new Item({ text: "B", key: "b" })] });
		const oComboBox    = new ComboBox({ items: [new Item({ text: "Alpha", key: "alpha" }), new Item({ text: "Beta", key: "beta" })] });
		const oMultiComboBox = new MultiComboBox({ items: [new Item({ text: "Red", key: "red" }), new Item({ text: "Blue", key: "blue" })] });
		const oMenuButton  = new MenuButton({ text: "Menu", menu: new Menu({ items: [new MenuItem({ text: "Item 1" })] }) });
		const oSearchField = new SearchField({ enableSuggestions: true });
		const oTokenizer   = new Tokenizer({ tokens: [new Token({ text: "Token 1" }), new Token({ text: "Token 2" })] });
		const oBreadcrumbs = new Breadcrumbs({ currentLocationText: "Laptops", links: [new Link({ text: "Home", href: "#" })] });

		const oTB = await createToolbar({
			Toolbar: {
				content: [oSlider, oRangeSlider, oMultiInput, oSelect, oComboBox, oMultiComboBox, oMenuButton, oSearchField, oTokenizer, oBreadcrumbs]
			}
		});

		const oLeft  = new KeyboardEvent("keydown", { keyCode: KeyCodes.ARROW_LEFT });
		const oRight = new KeyboardEvent("keydown", { keyCode: KeyCodes.ARROW_RIGHT });
		const oUp    = new KeyboardEvent("keydown", { keyCode: KeyCodes.ARROW_UP });
		const oDown  = new KeyboardEvent("keydown", { keyCode: KeyCodes.ARROW_DOWN });

		// fnCheck(control, name, { left, right, up, down })
		// true  => toolbar must NOT intercept that key (control owns it)
		// false => toolbar may intercept (control doesn't use it)
		function fnCheck(oControl, sName, oExpected) {
			const oDom = oControl.getFocusDomRef();
			[
				{ key: "left",  event: oLeft  },
				{ key: "right", event: oRight },
				{ key: "up",    event: oUp    },
				{ key: "down",  event: oDown  }
			].forEach(function(oArrow) {
				const bResult = oTB._shouldAllowDefaultBehavior(oDom, oControl, oArrow.event);
				assert[oExpected[oArrow.key] ? "ok" : "notOk"](
					bResult,
					sName + ": Arrow" + oArrow.key.charAt(0).toUpperCase() + oArrow.key.slice(1) +
						" should return " + oExpected[oArrow.key]
				);
			});
		}

		// Controls that own all four arrow keys
		fnCheck(oSlider,      "Slider",      { left: true,  right: true,  up: true,  down: true  });
		fnCheck(oRangeSlider, "RangeSlider", { left: true,  right: true,  up: true,  down: true  });
		fnCheck(oMultiInput,  "MultiInput",  { left: true,  right: true,  up: true,  down: true  });

		// Controls that own only Up/Down; Left/Right belong to the toolbar
		fnCheck(oSelect,       "Select",       { left: false, right: false, up: true,  down: true  });
		fnCheck(oComboBox,     "ComboBox",     { left: false, right: false, up: true,  down: true  });
		fnCheck(oMultiComboBox,"MultiComboBox",{ left: false, right: false, up: true,  down: true  });
		fnCheck(oMenuButton,   "MenuButton",   { left: false, right: false, up: true,  down: true  });
		fnCheck(oSearchField,  "SearchField",  { left: false, right: false, up: true,  down: true  });
		fnCheck(oTokenizer,    "Tokenizer",    { left: false, right: false, up: true,  down: true  });
		fnCheck(oBreadcrumbs,  "Breadcrumbs",  { left: false, right: false, up: true,  down: true  });

		oTB.destroy();
	});

	QUnit.test("disabled and invisible controls should be skipped during keyboard navigation", async function(assert) {
		const oButton1 = new Button({text: "Button 1"});
		const oButton2 = new Button({text: "Button 2", enabled: false});
		const oButton3 = new Button({text: "Button 3", visible: false});
		const oButton4 = new Button({text: "Button 4"});
		const oTB = await createToolbar({
			Toolbar: {
				content: [oButton1, oButton2, oButton3, oButton4]
			}
		});

		// Test that all interactive controls are counted for accessibility (including disabled ones)
		const aInteractiveControls = oTB._getToolbarInteractiveControls();
		assert.strictEqual(aInteractiveControls.length, 3, "All visible interactive controls are counted for accessibility");
		assert.notStrictEqual(aInteractiveControls.indexOf(oButton2), -1, "Disabled button is included in interactive controls for accessibility");
		assert.strictEqual(aInteractiveControls.indexOf(oButton3), -1, "Invisible button is not in the interactive controls list");

		// Test that disabled and invisible controls are excluded from navigation
		const aNavigatableControls = oTB._getToolbarNavigatableControls();
		assert.strictEqual(aNavigatableControls.length, 2, "Only enabled and visible controls are navigatable");
		assert.strictEqual(aNavigatableControls.indexOf(oButton2), -1, "Disabled button is not navigatable");
		assert.strictEqual(aNavigatableControls.indexOf(oButton3), -1, "Invisible button is not navigatable");
		assert.notStrictEqual(aNavigatableControls.indexOf(oButton1), -1, "Enabled and visible button is navigatable");

		// Test navigation skips disabled and invisible controls
		oButton1.focus();
		const oArrowRightEvent = new KeyboardEvent("keydown", { keyCode: KeyCodes.ARROW_RIGHT });
		oTB._moveFocus("forward", oArrowRightEvent);
		assert.strictEqual(document.activeElement, oButton4.getDomRef(), "Arrow right skips disabled and invisible buttons and focuses next available button");

		// Cleanup
		oButton1.destroy();
		oButton2.destroy();
		oButton3.destroy();
		oButton4.destroy();
		oTB.destroy();
	});

	QUnit.test("inactive toolbar should not fire press on SPACE key", async function(assert) {
		const oLabel = new Label({text : "text"});
		const fnPressSpy = this.spy();
		const oTB = await createToolbar({
			Toolbar : {
				active : false,
				content : [oLabel],
				press: fnPressSpy
			}
		});

		QUtils.triggerKeydown(oTB.getDomRef(), KeyCodes.SPACE);
		assert.strictEqual(fnPressSpy.callCount, 0, "Event is not fired onkeydown with SPACE key");
		QUtils.triggerKeyup(oTB.getDomRef(), KeyCodes.SPACE);
		assert.strictEqual(fnPressSpy.callCount, 0, "Event is not fired onkeyup with SPACE key");
		//Cleanup
		oLabel.destroy();
		oTB.destroy();
	});

	QUnit.test("inactive toolbar should not fire press event", async function(assert) {
		const oLabel = new Label({text : "text"});
		const fnPressSpy = this.spy();
		const oTB = await createToolbar({
			/* toolbar is inactive by default */
			Toolbar : {
				content : [oLabel],
				press: fnPressSpy
			}
		});

		QUtils.triggerEvent("tap", oLabel.getDomRef());
		assert.strictEqual(fnPressSpy.callCount, 0, "Tap event from Label is not triggered the press event of the inactive Toolbar");

		QUtils.triggerKeydown(oTB.getDomRef(), "ENTER");
		assert.strictEqual(fnPressSpy.callCount, 0, "Enter hotkey is not triggered the press event of the inactive Toolbar");

		//Cleanup
		oLabel.destroy();
		oTB.destroy();
	});

	QUnit.test("ArrowRight from last SegmentedButton segment focuses next toolbar control", async function(assert) {
		const oButtonBefore = new Button({ text: "Before" }),
			oButtonAfter = new Button({ text: "After" }),
			oSB = new SegmentedButton({
				items: [
					new SegmentedButtonItem({ text: "A" }),
					new SegmentedButtonItem({ text: "B" }),
					new SegmentedButtonItem({ text: "C" })
				]
			}),
			oTB = await createToolbar({
				Toolbar: {
					content: [oButtonBefore, oSB, oButtonAfter]
				}
			}),
			aButtons = oSB.getButtons(),
			oLastSegment = aButtons[aButtons.length - 1];

		oLastSegment.focus();
		QUtils.triggerKeydown(oLastSegment.getDomRef(), KeyCodes.ARROW_RIGHT);

		assert.strictEqual(document.activeElement, oButtonAfter.getFocusDomRef(),
			"ArrowRight on last segment focuses the next toolbar control");

		oTB.destroy();
	});

	QUnit.test("ArrowLeft from first SegmentedButton segment focuses previous toolbar control", async function(assert) {
		const oButtonBefore = new Button({ text: "Before" }),
			oButtonAfter = new Button({ text: "After" }),
			oSB = new SegmentedButton({
				items: [
					new SegmentedButtonItem({ text: "A" }),
					new SegmentedButtonItem({ text: "B" }),
					new SegmentedButtonItem({ text: "C" })
				]
			}),
			oTB = await createToolbar({
				Toolbar: {
					content: [oButtonBefore, oSB, oButtonAfter]
				}
			}),
			oFirstSegment = oSB.getButtons()[0];

		oFirstSegment.focus();
		QUtils.triggerKeydown(oFirstSegment.getDomRef(), KeyCodes.ARROW_LEFT);

		assert.strictEqual(document.activeElement, oButtonBefore.getFocusDomRef(),
			"ArrowLeft on first segment focuses the previous toolbar control");

		oTB.destroy();
	});

	QUnit.test("ArrowRight from last Breadcrumbs item focuses next toolbar control", async function(assert) {
		const oButtonBefore = new Button({ text: "Before" }),
			oButtonAfter = new Button({ text: "After" }),
			oLink1 = new Link({ text: "Link1", href: "#" }),
			oLink2 = new Link({ text: "Link2", href: "#" }),
			oBreadcrumbs = new Breadcrumbs({
				links: [oLink1, oLink2],
				currentLocationText: "Current"
			}),
			oTB = await createToolbar({
				Toolbar: {
					content: [oButtonBefore, oBreadcrumbs, oButtonAfter]
				}
			}),
			oCurrentLocationDomRef = oBreadcrumbs.getDomRef("currentText");

		// ArrowRight from the last link moves to the current location inside the breadcrumbs
		oLink2.focus();
		QUtils.triggerKeydown(oLink2.getFocusDomRef(), KeyCodes.ARROW_RIGHT);
		assert.strictEqual(document.activeElement, oCurrentLocationDomRef,
			"ArrowRight on last breadcrumb link focuses the current location");

		// ArrowRight from the current location (border) continues to the next toolbar control
		QUtils.triggerKeydown(oCurrentLocationDomRef, KeyCodes.ARROW_RIGHT);
		assert.strictEqual(document.activeElement, oButtonAfter.getFocusDomRef(),
			"ArrowRight on current location focuses the next toolbar control");

		oTB.destroy();
	});

	QUnit.test("ArrowRight through toolbar with SegmentedButton matches toolbar_kbh sample order", async function(assert) {
		const oStart = new Button({ text: "Start here" }),
			oDisabled1 = new Button({ text: "disabled", enabled: false }),
			oDisabled2 = new Button({ text: "disabled", enabled: false }),
			oWorks = new MenuButton({
				text: "Works",
				buttonMode: "Regular",
				useDefaultActionOnly: false,
				menu: new Menu({
					items: [new MenuItem({ text: "item" })]
				})
			}),
			oSB = new SegmentedButton({
				items: [
					new SegmentedButtonItem({ text: "first" }),
					new SegmentedButtonItem({ text: "2nd" }),
					new SegmentedButtonItem({ text: "3rd" })
				]
			}),
			oComeHere = new Button({ text: "come here" }),
			oTB = await createToolbar({
				Toolbar: {
					content: [
						oStart,
						oDisabled1,
						oDisabled2,
						oWorks,
						new ToolbarSeparator(),
						new OverflowToolbarButton({ icon: "sap-icon://world", enabled: false }),
						oSB,
						oComeHere
					]
				}
			}),
			aSegments = oSB.getButtons(),
			oLastSegment = aSegments[aSegments.length - 1];

		oStart.focus();
		oTB.getDomRef().dispatchEvent(new KeyboardEvent("keydown", {
			keyCode: KeyCodes.ARROW_RIGHT,
			code: "ArrowRight",
			bubbles: true
		}));
		assert.strictEqual(document.activeElement, oWorks._getButtonControl().getDomRef(),
			"ArrowRight from Start here focuses Works MenuButton");

		oLastSegment.focus();
		QUtils.triggerKeydown(oLastSegment.getDomRef(), KeyCodes.ARROW_RIGHT);
		assert.strictEqual(document.activeElement, oComeHere.getFocusDomRef(),
			"ArrowRight from last segment focuses come here");

		oTB.destroy();
	});

	QUnit.test("toolbar should not scroll on focus when tapped", async function(assert) {
		// Arrange
		const oTB = await createToolbar({
			/* toolbar is inactive by default */
			Toolbar : {
				active: true
			}
		});
		const fnFocusSpy = this.spy(oTB, "focus");

		// Act simulate tap with dummy event object
		oTB.ontap({
			srcControl: oTB,
			isMarked: function() { return false; },
			setMarked: function() {}
		});

		// Assert
		assert.ok(fnFocusSpy.calledOnce, "focus called once");
		assert.ok(fnFocusSpy.calledWithExactly({preventScroll: true}), "scroll prevented");

		// Cleanup
		fnFocusSpy.reset();
		oTB.destroy();
	});

	QUnit.test("active toolbar should not fire press when the event is handled by the child control", async function(assert) {
		const oButton = new Button({text : "text"});
		const fnPressSpy = this.spy();
		const oTB = await createToolbar({
			Toolbar : {
				active : true,
				content : [oButton],
				press: fnPressSpy
			}
		});

		QUtils.triggerEvent("tap", oButton.getDomRef());
		assert.strictEqual(fnPressSpy.callCount, 0, "Tap event is handled by Button so press event did not fired from the Toolbar");

		QUtils.triggerKeydown(oButton.getDomRef(), "ENTER");
		assert.strictEqual(fnPressSpy.callCount, 0, "Space hotkey is handled by Button so press event did not fired from the Toolbar");

		QUtils.triggerKeydown(oButton.getDomRef(), "SPACE");
		assert.strictEqual(fnPressSpy.callCount, 0, "Enter hotkey is handled by Button so press event did not fired from the Toolbar");

		//Cleanup
		oButton.destroy();
		oTB.destroy();
	});

	QUnit.module("Shrinkables");
	QUnit.test("Toolbar should not overflow with shrinkable items", async function(assert) {
		const sLongText = new Array(1000).join("text ");

		// test wrapper
		const shouldNotOverflow = async function(sMessage, oConfig) {
			const oTB = await createToolbar(oConfig || {});
			const oDomRef = oTB.getDomRef();
			sMessage += " so Toolbar should not overflow";
			assert.ok(oDomRef.scrollWidth === oDomRef.clientWidth, sMessage + ".");
			oTB.setWidth("500px");
			assert.ok(oDomRef.scrollWidth === oDomRef.clientWidth, sMessage + " even after resize.");
			oTB.destroy();
		};

		// run test
		await shouldNotOverflow("By default, text controls are shrinkable", {
			Toolbar : {
				content: [
					new Label({text : sLongText}),
					new Text({text : sLongText}),
					new Link({text : sLongText})
				]
			}
		});

		await shouldNotOverflow("By default, the controls have percent width are shrinkable", {
			Toolbar : {},
			SearchField : {},	/* default width is 100% */
			Slider : {},		/* default width is 100% */
			DateTimeInput: {},	/* default width is 100% */
			Input : {},			/* default width is 100% */
			Label : {text : sLongText, width: "25%"},
			Button : {text : sLongText, width: "50%"}
		});

		await shouldNotOverflow("More than 100% shrinkable content has to fit", false, {
			Toolbar : {},
			Button : {text : sLongText, width: "500%"},
			Label : {text : sLongText}
		});

		await shouldNotOverflow("controls have shrinkable layout data has to fit", false, {
			Toolbar : {},
			Button : {text : sLongText, layoutData: new ToolbarLayoutData({shrinkable : true})},
			TextArea : {text : sLongText, layoutData: new ToolbarLayoutData({shrinkable : true})}
		});

	});

	QUnit.module("LayoutData");
	QUnit.test("should reapply layout data styles after content is rerendered", async function(assert) {
		const sMinWidth = "100px";
		const oBtn = new Button({
			text : "Button Text",
			layoutData : new ToolbarLayoutData({
				minWidth: sMinWidth
			})
		});
		const oTB = await createToolbar({
			Toolbar : {
				content : oBtn
			}
		});

		// assert
		assert.strictEqual(oBtn.getDomRef().style.minWidth, sMinWidth, "After initial rendering minWidth is applied width layoutData");

		// act
		oBtn.invalidate();
		await nextUIUpdate();

		// assert
		assert.strictEqual(oBtn.getDomRef().style.minWidth, sMinWidth, "After rerender minWidth is still available on the DOM");

		// cleanup
		oBtn.destroy();
		oTB.destroy();
	});

	QUnit.test("should reapply style after layout data is changed", async function(assert) {
		const sInitMinWidth = "100px";
		const sLastMinWidth = "200px";
		const oBtn = new Button({
			text : "Button Text",
			layoutData : new ToolbarLayoutData({
				minWidth: sInitMinWidth
			})
		});
		const oTB = await createToolbar({
			Toolbar : {
				content : oBtn
			}
		});

		// arrange
		const fnRerenderSpy = this.spy(oTB.getRenderer(), "render");

		// assert
		assert.strictEqual(oBtn.getDomRef().style.minWidth, sInitMinWidth, "After initial rendering minWidth is applied according to layoutData");

		// act
		oBtn.getLayoutData().setMinWidth(sLastMinWidth);

		await nextUIUpdate();

		// assert
		assert.strictEqual(oBtn.getDomRef().style.minWidth, sLastMinWidth, "After layout data changes min width is set on the DOM.");
		assert.strictEqual(fnRerenderSpy.callCount, 1, "Toolbar is rerendered because of the layoutData changes.");

		// cleanup
		oBtn.destroy();
		oTB.destroy();
	});

	QUnit.test("setting layout data should apply changes with rerender", async function(assert) {
		const sMinWidth = "100px";
		const oBtn = new Button({
			text : "Button Text"
		});
		const oTB = await createToolbar({
			Toolbar : {
				content : oBtn
			}
		});

		// arrange
		const fnRerenderSpy = this.spy(oTB.getRenderer(), "render");

		// act
		oBtn.setLayoutData(new ToolbarLayoutData({
			minWidth : sMinWidth,
			shrinkable : true
		}));

		await nextUIUpdate();

		// assert
		assert.strictEqual(oBtn.getDomRef().style.minWidth, sMinWidth, "After layout data is set minWidth applied to the DOM.");
		assert.strictEqual(fnRerenderSpy.callCount, 1, "Toolbar is rerendered because of the layoutData set.");

		// cleanup
		oBtn.destroy();
		oTB.destroy();
	});

	QUnit.module("Element Margins");
	QUnit.test("Should add margins to elements in a Toolbar", async function(assert) {
		// Arrange
		const oFirstButton = new Button("first");
		const oMiddleButton = new Button("middle");
		const oLastButton = new Button("last");

		// System under Test + Act
		const oTB = new Toolbar({
			content : [
				oFirstButton,
				new ToolbarSpacer(),
				//spacers around the button makes sure both borders are there
				oMiddleButton,
				new ToolbarSpacer(),
				oLastButton
			]
		});

		// Act + assert
		oTB.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		function assertButton (oButton, oWidth) {
			assert.strictEqual(oButton.$().css("margin-left"), oWidth.left + "px", oButton + " did have the correct left margin");
			assert.strictEqual(oButton.$().css("margin-right"),  oWidth.right + "px", oButton + " did have the correct right margin");
		}

		assertButton(oFirstButton, {
			left: 0,
			right : 0
		});

		assertButton(oMiddleButton, {
			left: 8,
			right : 0
		});

		assertButton(oLastButton, {
			left: 8,
			right : 0
		});

		// Cleanup
		oTB.destroy();
	});

	QUnit.module("Edge cases");

	QUnit.test("Preventing error when focused element is not presented", function(assert) {

		// Arrange
		const oTB = new Toolbar();

		// Act
		const bReturnValue = oTB._shouldAllowDefaultBehavior(null);

		assert.strictEqual(bReturnValue, false, "Error caused by unexisting element being called a method to, is prevented");

		oTB.destroy();
	});

	QUnit.test("KB navigation logic when SegmentedButton with _select aggregation used", async function(assert) {

		// Arrange
		const oTB = await createToolbar();

		const oSB = new SegmentedButton({
			items : [
				new SegmentedButtonItem({
					text: "button 1"
				}),
				new SegmentedButtonItem({
					text: "button 2"
				}),
				new SegmentedButtonItem({
					text: "button 3"
				})
			]
		});

		oTB.addContent(oSB);

		await nextUIUpdate();

		oSB._toSelectMode();

		await nextUIUpdate();

		const oSelect = oSB.getAggregation("_select");


		// Act
		const oDefaultBehaviorSpy = sinon.spy(oTB, "_shouldAllowDefaultBehavior");

		// Act
		oSelect.focus();
		const oArrowDownEvent = new KeyboardEvent("keydown", { code: KeyCodes.ARROW_DOWN });

		oTB._moveFocus("forward", oArrowDownEvent);

		oSelect.focus();
		oSB.setParent(null);
		oTB._moveFocus("forward", oArrowDownEvent);

		// Assert
		assert.strictEqual(oDefaultBehaviorSpy.getCalls()[0].args[1], oSB, "_shouldAllowDefaultBehavior is called with SegmentedButton");
		assert.strictEqual(oDefaultBehaviorSpy.getCalls()[1].args[1], oSB, "_shouldAllowDefaultBehavior is called with SegmentedButton");
	});

	QUnit.module("Active Button Text Content");

	QUnit.test("Active button should receive text content from toolbar", async function(assert) {
		// Arrange
		const oLabel = new Label({text: "Label Text"});
		const oTitle = new Title({text: "Title Text"});
		const oButton = new Button({text: "Button Text"});

		const oToolbar = new Toolbar({
			active: true,
			content: [oLabel, oTitle, oButton]
		});

		oToolbar.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		const oActiveButton = oToolbar._getActiveButton();

		// Assert
		assert.strictEqual(oActiveButton.getText(), "Label Text Title Text Button Text",
			"Active button text should contain concatenated text from all content controls");

		// Cleanup
		oToolbar.destroy();
	});

	QUnit.test("Active button text should be updated when content changes", async function(assert) {
		// Arrange
		const oLabel = new Label({text: "Original Text"});
		const oToolbar = new Toolbar({
			active: true,
			content: [oLabel]
		});

		oToolbar.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oActiveButton = oToolbar._getActiveButton();
		assert.strictEqual(oActiveButton.getText(), "Original Text", "Initial text is correct");

		// Act - Change label text
		oLabel.setText("Updated Text");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oActiveButton.getText(), "Updated Text",
			"Active button text should be updated when content text changes");

		// Cleanup
		oToolbar.destroy();
	});

	QUnit.test("Active button text should be updated when content is added/removed", async function(assert) {
		// Arrange
		const oLabel = new Label({text: "Label Text"});
		const oToolbar = new Toolbar({
			active: true,
			content: [oLabel]
		});

		oToolbar.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oActiveButton = oToolbar._getActiveButton();
		assert.strictEqual(oActiveButton.getText(), "Label Text", "Initial text is correct");

		// Act - Add new content
		const oTitle = new Title({text: "Title Text"});
		oToolbar.addContent(oTitle);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oActiveButton.getText(), "Label Text Title Text",
			"Active button text should be updated when content is added");

		// Act - Remove content
		oToolbar.removeContent(oLabel);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oActiveButton.getText(), "Title Text",
			"Active button text should be updated when content is removed");

		// Cleanup
		oToolbar.destroy();
	});

	QUnit.test("Active button should handle invisible content correctly", async function(assert) {
		// Arrange
		const oVisibleLabel = new Label({text: "Visible Text"});
		const oInvisibleLabel = new Label({text: "Invisible Text", visible: false});

		const oToolbar = new Toolbar({
			active: true,
			content: [oVisibleLabel, oInvisibleLabel]
		});

		oToolbar.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		const oActiveButton = oToolbar._getActiveButton();

		// Assert
		assert.strictEqual(oActiveButton.getText(), "Visible Text",
			"Active button should only include text from visible controls");

		// Act - Make invisible control visible
		oInvisibleLabel.setVisible(true);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oActiveButton.getText(), "Visible Text Invisible Text",
			"Active button text should be updated when control visibility changes");

		// Cleanup
		oToolbar.destroy();
	});

	QUnit.test("Active button text should handle empty content gracefully", async function(assert) {
		// Arrange
		const oToolbar = new Toolbar({
			active: true,
			content: []
		});

		oToolbar.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		const oActiveButton = oToolbar._getActiveButton();

		// Assert
		assert.strictEqual(oActiveButton.getText(), "",
			"Active button should have empty text when toolbar has no content");

		// Cleanup
		oToolbar.destroy();
	});

	QUnit.test("Active button text should handle controls with tooltip when no text available", async function(assert) {
		// Arrange
		const oButton = new Button({tooltip: "Button Tooltip"});

		const oToolbar = new Toolbar({
			active: true,
			content: [oButton]
		});

		oToolbar.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		const oActiveButton = oToolbar._getActiveButton();

		// Assert
		assert.strictEqual(oActiveButton.getText(), "Button Tooltip",
			"Active button should use tooltip text when no other text is available");

		// Cleanup
		oToolbar.destroy();
	});
});
