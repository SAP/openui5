/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/Toolbar",
	"sap/m/library",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/InvisibleRenderer",
	"sap/m/ToolbarSeparator",
	"sap/m/Button",
	"sap/m/Title",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Link",
	"sap/m/Text",
	"sap/ui/core/Control",
	"sap/ui/events/KeyCodes",
	"sap/m/SearchField",
	"sap/m/ToolbarLayoutData",
	"sap/m/ToolbarRenderer",
	"sap/m/ToolbarSpacer",
	"sap/ui/core/library",
	"sap/ui/core/HTML",
	"sap/base/Log"
], function(
	QUtils,
	Toolbar,
	mobileLibrary,
	nextUIUpdate,
	jQuery,
	InvisibleRenderer,
	ToolbarSeparator,
	Button,
	Title,
	Input,
	Label,
	Link,
	Text,
	Control,
	KeyCodes,
	SearchField,
	ToolbarLayoutData,
	ToolbarRenderer,
	ToolbarSpacer,
	coreLibrary,
	HTML,
	Log
) {
	"use strict";

	// shortcut for sap.m.ToolbarStyle
	var ToolbarStyle = mobileLibrary.ToolbarStyle;

	// shortcut for sap.m.ToolbarDesign
	var ToolbarDesign = mobileLibrary.ToolbarDesign;

	function createToolbar(oConfig) {

		// get toolbar config
		oConfig = oConfig || {};
		var oTBConfig = oConfig.Toolbar || {};
		delete oConfig.Toolbar;

		// should place at qunit fixture
		var bShouldRender = (oConfig.render !== false);
		delete oConfig.render;

		// create toolbar
		var oTB = new Toolbar(oTBConfig);

		// add contents

		// render
		if (bShouldRender) {
			oTB.placeAt("qunit-fixture");
			nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
		}

		return oTB;
	}

	QUnit.module("Rendering");
	QUnit.test("test rendering and visible property", async function(assert) {
		var oTB = createToolbar({
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
		var $ToolbarPlaceHolder = jQuery("#" + InvisibleRenderer.createInvisiblePlaceholderId(oTB));
		assert.strictEqual(oTB.$().length, 0, "Toolbar is no longer in DOM after setting it to invisible");
		assert.strictEqual($ToolbarPlaceHolder.length, 1, "Toolbar placeholder is in DOM after setting it to invisible");
		assert.strictEqual($ToolbarPlaceHolder.css("display"), "none", "Toolbar placeholder should have display none when invisible");

		oTB.destroy();
	});

	QUnit.test("test empty content", function(assert) {
		var oTB = createToolbar({Toolbar : {}});
		assert.strictEqual(oTB.$().length, 1, "Bar is in DOM even without any content");
		oTB.destroy();
	});

	QUnit.test("test tooltip", function(assert) {
		var sTooltip = "tooltip";
		var oTB = createToolbar({
			Toolbar : {
				tooltip: sTooltip
			}
		});
		assert.strictEqual(oTB.getDomRef().title, sTooltip, "Tooltip is set correctly");
		oTB.destroy();
	});

	QUnit.test("test design property", async function(assert) {
		var oTB = createToolbar({
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
		var oTB = createToolbar();

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

	QUnit.test("test style property", async function(assert) {
		var oTB = createToolbar({
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

	QUnit.test("test that Toolbar Separator is rendered", function(assert) {
		var oToolbarSeparator = new ToolbarSeparator();
		var oTB = createToolbar({
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
		var oFirstControl = new Button({ text: "Button1" }),
			oSecondControl = new Button({ text: "Button2" }),
			oTB = createToolbar({
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

	QUnit.test("should not log warnings when using sap.ui.core.HTML control", function (assert) {
		// Arrange
		var oLogErrorSpy = sinon.spy(Log, "warning");
		var oHtmlContent = new HTML({
			content: "<span>Example</span>"
		});

		var oToolbar = createToolbar({
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

	QUnit.test("getAccessibilityInfo method", async function(assert) {
		var aDefaultContent = [
			new Button({width: "150px"}),
			new Button({width: "150px"})
		],
		oTB = new Toolbar({
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
		var oBtn1 = new Button({
			text : "Button Text"
		}),
		oBtn2 = new Button({
			text: "Button Text 2"
		}),
		oTitle = new Title({
			text : "Title text"
		}),
		oTB = new Toolbar({
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

	QUnit.test("Role attribute and aria-labelledby with interactive Controls", async function(assert) {
		// Arrange + System under Test
		var oBtn1 = new Button({
			text : "Button Text"
		}),
		oBtn2 = new Button({
			text: "Button Text 2"
		}),
		oTitle = new Title({
			text : "Title text"
		}),
		oTB = new Toolbar({
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
		var oBtn1 = new Button({
			text : "Button Text"
		}),
		oBtn2 = new Button({
			visible: false,
			text: "Button Text 2"
		}),
		oTitle = new Title({
			text : "Title text"
		}),
		oTB = new Toolbar({
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
		var oTB = new Toolbar({
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
		var oTB = new Toolbar({
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
		var oLabel = new Label({
			text : "Toolbar Label"
		});
		var oTB = new Toolbar({
			content : oLabel,
			ariaLabelledBy: oLabel.getId()
		});
		oTB.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Assert
		var oInvisibleText = document.getElementById(oTB.getId() + "-InvisibleText");
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
		var oLabel = new Label({
			text : "Toolbar Label"
		});
		var oTB = new Toolbar({
			content : oLabel,
			ariaLabelledBy: oLabel.getId()
		}).applyTagAndContextClassFor("header");
		oTB.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Assert
		var oInvisibleText = document.getElementById(oTB.getId() + "-InvisibleText");
		assert.notOk(oInvisibleText, "Invisible text is not rendered in the static area");
		assert.strictEqual(oTB.$().attr("aria-labelledby"), undefined, "Toolbar does not have attribute aria-labelledby - external label");

		//Cleanup
		oLabel.destroy();
		oTB.destroy();
	});

	QUnit.test("Active toolbar role", async function(assert) {
		var fnDone = assert.async(),

		// Arrange
		oLabel = new Label({
			text : "Toolbar Label"
		});
		var oTB = new Toolbar({
			active: true,
			content : oLabel
		});
		oTB.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.notOk(oTB.$().attr("role") === "button", "Active toolbar should not have role button");

		//Act
		oTB.focus();
		setTimeout(function(){
			//Assert
			assert.ok(oTB.hasStyleClass("sapMTBFocused"), "Focused class is added to the toolbar container");
			fnDone();
		});
		//Cleanup
		oLabel.destroy();
		oTB.destroy();
	});

	QUnit.test("Active toolbar aria-haspopup", async function(assert) {
		// Arrange
		var oToolbar = new Toolbar({
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

	QUnit.test("_setEnableAccessibilty", async function(assert) {
		// Arrange
		var oTB = new Toolbar({
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
		var oToolbar = new Toolbar();

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
		var isRelativeWidth = Toolbar.isRelativeWidth;
		var oConfig = {
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
			var bExpected = oConfig[sWidth];
			var bRelative = isRelativeWidth(sWidth);
			var sMessage = JSON.stringify(sWidth) + " is " + (bExpected ? "" : "not") + " relative width";
			assert.strictEqual(bExpected ? bRelative : !bRelative, true, sMessage);
		});

	});

	QUnit.test("controls shoulds return correct original and initial width", function(assert) {
		var getOrigWidth = Toolbar.getOrigWidth;

		// test dummy control has no width
		var oControl = new Control();
		assert.strictEqual(getOrigWidth(oControl.getId()), "", "Control without width property returns empty text");
		assert.strictEqual(getOrigWidth(":)"), "", "Non-Control parameter calls should return empty text");
		oControl.destroy();

		// test a real control's width
		var oSF = new SearchField();
		assert.strictEqual(getOrigWidth(oSF.getId()), "100%", "Default width of the SearchField is 100%");
		oSF.setWidth("100px");
		assert.strictEqual(getOrigWidth(oSF.getId()), oSF.getWidth(), "SearhField's width found correctly via ID");
		oSF.destroy();
	});

	QUnit.test("should detect whether toolbar content is shrinkable or not", function(assert) {
		// test wrapper
		var testShrinkable = function(bExpected, sMessage, fnControlClass, oConfig) {
			var sShrinkClass = "shrink";
			var oControl = new fnControlClass(oConfig || {});
			oControl.placeAt("qunit-fixture");
			nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;

			var bShrink = Toolbar.checkShrinkable(oControl, sShrinkClass);
			var sPrefix = (bExpected) ? "should shrink" : "should not shrink";
			assert.ok(bExpected ? bShrink : !bShrink, sMessage + " " + sPrefix);
			oControl.destroy();
		};

		// bind inital params
		var shouldShrink = testShrinkable.bind(0, true);
		var shouldNotShrink = testShrinkable.bind(0, false);

		// when should shrink
		shouldShrink("ToolbarSpacer with default properties", ToolbarSpacer, {});
		shouldShrink("The Button width percent value", Button, {width : "100%"});
		shouldShrink("SearchField with default properties", SearchField);
		shouldShrink("Input with default properties", Input);
		shouldShrink("Label control with default properties", Label);
		shouldShrink("Link control with default properties", Link);
		shouldShrink("Text control with default properties", Text);
		shouldShrink("Text control with maxLines 2", Text, {
			maxLines : 2
		});

		shouldShrink("Button with shrinkable layoutData", Button, {
			layoutData: new ToolbarLayoutData({
				shrinkable : true
			})
		});

		// when should not shrink
		shouldNotShrink("Button control width default properties", Button, {});
		shouldNotShrink("Fixed width ToolbarSpacer", ToolbarSpacer, {width : "200px"});
		shouldNotShrink("Fixed width Shrinkable text", Text, {width : "5rem"});
		shouldNotShrink("SearchField with unshrinkable layoutData", SearchField, {
			layoutData: new ToolbarLayoutData({
				shrinkable : false
			})
		});
	});

	QUnit.module("Behaviour");
	QUnit.test("content property change handler should be registered correctly", function(assert) {
		var oLabel = new Label({text : "text"});
		var oTB = createToolbar();
		var vRetVal;

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

	QUnit.test("when content property is changed toolbar should be informed", function(assert) {
		var spy = this.spy(Toolbar.prototype, "_onContentPropertyChanged");
		var oLabel = new Label({text : "text"});
		var oTB = createToolbar({
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
	QUnit.test("active toolbar should fire press event", function(assert) {
		var oLabel = new Label({text : "text"});
		var fnPressSpy = this.spy();
		var oTB = createToolbar({
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

	QUnit.test("active toolbar should fire press event on onkeyup on SPACE key", function(assert) {
		var oLabel = new Label({text : "text"}),
			fnPressSpy = this.spy(),
			oTB = createToolbar({
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

	QUnit.test("tests left/right arrow key navigation", function(assert) {
		var oLabel = new Label({text : "text"}),
			oButton = new Button({text : "text"}),
			oLink = new Link({text : "text"}),
			oTB = createToolbar({
				Toolbar : {
					content : [oLink, oLabel, oButton]
				}
			}),
			oArrowRightEvent = new KeyboardEvent("keydown", { code: KeyCodes.ARROW_RIGHT }),
			oArrowLeftEvent = new KeyboardEvent("keydown", { code: KeyCodes.ARROW_LEFT });

		// Focus the first element manually
		oLink.focus();

		oTB._moveFocus("forward", oArrowRightEvent);

		assert.strictEqual(document.activeElement, oButton.getDomRef(), "The next interactive element inside the toolbar is focused on arrow right");

		oTB._moveFocus("backward", oArrowLeftEvent);

		assert.strictEqual(document.activeElement, oLink.getDomRef(), "The previous interactive element inside the toolbar is focused on arrow left");

		// Cleanup
		oLabel.destroy();
		oButton.destroy();
		oLink.destroy();
		oTB.destroy();
	});

	QUnit.test("tests up/down arrow key navigation", function(assert) {
		var oLabel = new Label({text : "text"}),
			oButton = new Button({text : "text"}),
			oLink = new Link({text : "text"}),
			oTB = createToolbar({
				Toolbar : {
					content : [oLink, oLabel, oButton]
				}
			}),
			oArrowUpEvent = new KeyboardEvent("keydown", { code: KeyCodes.ARROW_UP }),
			oArrowDownEvent = new KeyboardEvent("keydown", { code: KeyCodes.ARROW_DOWN });

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

	QUnit.test("inactive toolbar should not fire press on SPACE key", function(assert) {
		var oLabel = new Label({text : "text"});
		var fnPressSpy = this.spy();
		var oTB = createToolbar({
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

	QUnit.test("inactive toolbar should not fire press event", function(assert) {
		var oLabel = new Label({text : "text"});
		var fnPressSpy = this.spy();
		var oTB = createToolbar({
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

	QUnit.test("toolbar should not scroll on focus when tapped", function(assert) {
		// Arrange
		var oTB = createToolbar({
			/* toolbar is inactive by default */
			Toolbar : {
				active: true
			}
		});
		var fnFocusSpy = this.spy(oTB, "focus");

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

	QUnit.test("active toolbar should not fire press when the event is handled by the child control", function(assert) {
		var oButton = new Button({text : "text"});
		var fnPressSpy = this.spy();
		var oTB = createToolbar({
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
	QUnit.test("Toolbar should not overflow with shrinkable items", function(assert) {
		var sLongText = new Array(1000).join("text ");

		// test wrapper
		var shouldNotOverflow = function(sMessage, oConfig) {
			var oTB = createToolbar(oConfig || {});
			var oDomRef = oTB.getDomRef();
			sMessage += " so Toolbar should not overflow";
			assert.ok(oDomRef.scrollWidth === oDomRef.clientWidth, sMessage + ".");
			oTB.setWidth("500px");
			assert.ok(oDomRef.scrollWidth === oDomRef.clientWidth, sMessage + " even after resize.");
			oTB.destroy();
		};

		// run test
		shouldNotOverflow("By default, text controls are shrinkable", {
			Toolbar : {
				content: [
					new Label({text : sLongText}),
					new Text({text : sLongText}),
					new Link({text : sLongText})
				]
			}
		});

		shouldNotOverflow("By default, the controls have percent width are shrinkable", {
			Toolbar : {},
			SearchField : {},	/* default width is 100% */
			Slider : {},		/* default width is 100% */
			DateTimeInput: {},	/* default width is 100% */
			Input : {},			/* default width is 100% */
			Label : {text : sLongText, width: "25%"},
			Button : {text : sLongText, width: "50%"}
		});

		shouldNotOverflow("More than 100% shrinkable content has to fit", false, {
			Toolbar : {},
			Button : {text : sLongText, width: "500%"},
			Label : {text : sLongText}
		});

		shouldNotOverflow("controls have shrinkable layout data has to fit", false, {
			Toolbar : {},
			Button : {text : sLongText, layoutData: new ToolbarLayoutData({shrinkable : true})},
			TextArea : {text : sLongText, layoutData: new ToolbarLayoutData({shrinkable : true})}
		});

	});

	QUnit.module("LayoutData");
	QUnit.test("should reapply layout data styles after content is rerendered", async function(assert) {
		var sMinWidth = "100px";
		var oBtn = new Button({
			text : "Button Text",
			layoutData : new ToolbarLayoutData({
				minWidth: sMinWidth
			})
		});
		var oTB = createToolbar({
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
		var sInitMinWidth = "100px";
		var sLastMinWidth = "200px";
		var oBtn = new Button({
			text : "Button Text",
			layoutData : new ToolbarLayoutData({
				minWidth: sInitMinWidth
			})
		});
		var oTB = createToolbar({
			Toolbar : {
				content : oBtn
			}
		});

		// arrange
		var fnRerenderSpy = this.spy(oTB.getRenderer(), "render");

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
		var sMinWidth = "100px";
		var oBtn = new Button({
			text : "Button Text"
		});
		var oTB = createToolbar({
			Toolbar : {
				content : oBtn
			}
		});

		// arrange
		var fnRerenderSpy = this.spy(oTB.getRenderer(), "render");

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
		var oFirstButton = new Button("first"),
			oMiddleButton = new Button("middle"),
			oLastButton = new Button("last");

		// System under Test + Act
		var oTB = new Toolbar({
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
});