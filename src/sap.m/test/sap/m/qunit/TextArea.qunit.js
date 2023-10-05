/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/TextArea",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/m/InputBase",
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Lib",
	// provides jQuery.fn.cursorPos
	"sap/ui/dom/jquery/cursorPos"
], function(
	qutils,
	createAndAppendDiv,
	TextArea,
	Device,
	JSONModel,
	InputBase,
	core,
	coreLibrary,
	jQuery,
	Lib
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	createAndAppendDiv("content");


	QUnit.module("");

	QUnit.test("Should render TextArea correctly", function(assert) {
		var sut = new TextArea(),
			oCounter;
		sut.placeAt("qunit-fixture");
		core.applyChanges();

		// check rendered
		var $container = jQuery("div.sapMTextArea");
		assert.strictEqual($container.length, 1, "Textarea container is rendered");

		var $textarea = jQuery("textarea.sapMTextAreaInner");
		assert.strictEqual($textarea.length, 1, "Textarea is rendered");
		assert.strictEqual($textarea.hasClass("sapMTextAreaWithCounter"), false, "Textarea doesn't have a counter");

		oCounter = sut.getAggregation("_counter");
		assert.strictEqual(oCounter.getVisible(), false, "The counter is not visible");

		// check assigned and focus
		assert.strictEqual(sut._$input[0], $textarea[0], "Textarea set correctly");
		assert.strictEqual(sut._$input[0], sut.getFocusDomRef(), "Textarea is the focus object");

		//Cleanup
		sut.destroy();
	});

	QUnit.test("Should render TextArea correctly when _adjustContainerDimensions is called before the DOM is ready", function(assert) {
		var sut = new TextArea();

		// act
		sut._adjustContainerDimensions();
		sut.placeAt("qunit-fixture");
		core.applyChanges();

		// assert
		assert.ok(sut.getDomRef(), "TextArea rendered");

		//Cleanup
		sut.destroy();
	});

	QUnit.test("Should inherit from InputBase", function(assert) {
		var sut = new TextArea();
		sut.placeAt("qunit-fixture");
		core.applyChanges();

		// check input base classes are assigned
		var $container = jQuery("div.sapMInputBase");
		assert.strictEqual($container.length, 1, "Container has InputBase class");

		var $textarea = jQuery("textarea.sapMInputBaseInner");
		assert.strictEqual($textarea.length, 1, "TextArea has InputBase class");

		// check assigned
		assert.ok(sut instanceof InputBase, "TextArea inherited from InputBase");

		//Cleanup
		sut.destroy();
	});

	QUnit.test("Should configure control and set properties correctly", function(assert) {
		var config = {
				rows : 10,
				cols : 50,
				width : "100px",
				height : "100px",
				maxLength : 100,
				value : "~!@#$%^&*()_+{}:\"|<>?\'\">\n\n<script>alert('xss')<\/script>\n\n"
			},
			setters = {
				rows : 5,
				cols : 20,
				width : "200px",
				height : "200px",
				maxLength : 40,
				value : "\n\n<script>alert('xss')<\/script>\n\n~!@#$%^&*()_+{}:\"|<>?\'\">"
			},
			testprops = function (props) {
				var $outer = sut.$();
				var $textarea = jQuery("textarea");

				assert.equal($textarea.attr("rows"), props.rows, "TextArea has correct max rows : " + props.rows);
				assert.equal($textarea.attr("cols"), props.cols, "TextArea has correct max cols : " + props.cols);
				assert.equal($textarea.attr("maxLength"), props.maxLength, "TextArea has correct max length : " + props.maxLength);
				assert.strictEqual($outer.outerWidth(), parseInt(props.width), "TextArea has correct width : " + props.width);
				assert.strictEqual($outer.outerHeight(), parseInt(props.height), "TextArea has correct height : " + props.height);
				assert.strictEqual($textarea.val(), sut.getValue(), "TextArea has correct value");
			},
			sut = new TextArea(config);

		sut.placeAt("qunit-fixture");
		core.applyChanges();

		// check assigned properties
		testprops(config);

		// check setter functions
		sut.applySettings(setters);
		core.applyChanges();
		testprops(setters);

		//Cleanup
		sut.destroy();
	});

	QUnit.test("Should configure control without it being rendered", function(assert) {
		var oConfig = {
				rows : 10,
				cols : 50,
				width : "100px",
				height : "100px",
				maxLength : 100,
				value : "Initial text value"
			},
			oSetters = {
				rows : 5,
				cols : 20,
				width : "200px",
				height : "200px",
				maxLength : 40,
				value : "Updated text value"
			},
			getAppliedValues = function(oSetters) {
				var mExpectedValue, mActualValue;

				Object.getOwnPropertyNames(oSetters).forEach(function(sKey) {
					var oProperty = TextArea.getMetadata().getProperty(sKey);
					mExpectedValue = oSetters[sKey];
					mActualValue = oProperty.get(oTextArea);

					assert.strictEqual(mActualValue, mExpectedValue, "The correct value is applied for property " + sKey);
					core.applyChanges();
				});
			},
			oTextArea = new TextArea(oConfig);

		core.applyChanges();

		// check setter functions
		oTextArea.applySettings(oSetters);
		core.applyChanges();
		getAppliedValues(oSetters);

		//Cleanup
		oTextArea.destroy();
	});

	QUnit.test("Should react on touchstart/move for INSIDE_SCROLLABLE_WITHOUT_FOCUS behaviour", function(assert) {
		// turn on touch support during this test
		this.stub(Device.support, "touch").value(true);

		// generate events
		var longText = new Array(1000).join("text "),
			sut = new TextArea({
				value : longText
			}),
			tsEvent = jQuery.Event("touchstart", {
				touches : [{
					pageX: 0,
					pageY : 0
				}]
			}),
			tmEvent = jQuery.Event("touchmove", {
				touches : [{
					pageX : 0,
					pageY : 0
				}]
			});

		// stub the behaviour
		this.stub(TextArea.prototype, "_behaviour").value({
			"INSIDE_SCROLLABLE_WITHOUT_FOCUS" : true
		});

		sut.placeAt("qunit-fixture");
		core.applyChanges();
		var $textarea = jQuery("textarea");

		// check touchstart
		sut._onTouchStart(tsEvent);
		assert.ok(tsEvent.isMarked("swipestartHandled"), "Touch start event is marked for swipe handling in case of scrolling");

		// scroll down in text area
		$textarea[0].scrollTop = 1;

		// vertical scrolling : move finger up (scroll down)
		tmEvent.touches[0].pageY -= 1;
		sut._onTouchMove(tmEvent);
		assert.ok(tmEvent.isMarked(), "Touch move event is marked for vertical scrolling");

		// scroll to inital position
		$textarea[0].scrollTop = 0;

		// horizontal scrolling : move finger left (scroll right)
		tmEvent = jQuery.Event("touchmove", {
			touches : [{
				pageX : -1,
				pageY : 0
			}]
		});
		sut._onTouchMove(tmEvent);
		assert.ok(tmEvent.isMarked(), "Touch move event is marked for horizontal scrolling");

		//Cleanup
		sut.destroy();
	});

	QUnit.test("change event should be fired when last known and dom value are not same", function(assert) {

		// system under test
		var sInitValue = "Test";
		var oTA = new TextArea({
			value : sInitValue
		});

		// arrange
		oTA.placeAt("content");
		core.applyChanges();
		var oTADomRef = oTA.getFocusDomRef();
		var fnFireChangeSpy = this.spy(oTA, "fireChange");

		// act
		oTADomRef.focus();
		qutils.triggerKeydown(oTADomRef, "ENTER");

		// assertion
		assert.strictEqual(fnFireChangeSpy.callCount, 0, "Change event is not fired because initial value and dom value are same.");

		// change dom and cursor pos
		qutils.triggerCharacterInput(oTADomRef, "a");

		// act
		qutils.triggerKeydown(oTADomRef, "ENTER");

		// assertion
		assert.strictEqual(fnFireChangeSpy.callCount, 0, "Change event is not fired because enter is not a valid event to fire change event for textarea");

		// reset spy
		fnFireChangeSpy.resetHistory();

		// retest after change event is fired
		oTADomRef.blur();
		this.clock.tick(0);	// when a blur event occurs the "sapfocusleave" is fired async

		// assertion
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "Change event is fired  because last known value and dom value are different");

		// cleanup
		oTA.destroy();
	});

	QUnit.test("Live change event should be fired in case of value is reverted with escape", function(assert) {
		// system under test
		var sInitValue = "Test";
		var oTA = new TextArea({
			value : sInitValue,
			valueLiveUpdate : true
		});

		// arrange
		oTA.placeAt("content");
		core.applyChanges();
		var oTADomRef = oTA.getFocusDomRef();

		// act
		oTADomRef.focus();
		oTA.updateDomValue("Something that is not initial value");
		qutils.triggerEvent("input", oTADomRef);

		var fnLiveChangeSpy = this.spy(oTA, "fireLiveChange");
		qutils.triggerKeydown(oTADomRef, "ESCAPE");

		assert.strictEqual(fnLiveChangeSpy.callCount, 1, "LiveChange event is fired");
		assert.strictEqual(fnLiveChangeSpy.args[0][0].value, sInitValue, "Event is fired with correct parameter value");
		assert.strictEqual(fnLiveChangeSpy.args[0][0].newValue, sInitValue, "Event is fired with correct compatible parameter");
		assert.strictEqual(oTA.getValue(), sInitValue, "Value is reverted to initial");

		// cleanup
		oTA.destroy();
	});

	QUnit.test("valueLiveUpdate", function(assert) {

		var oModel = new JSONModel({value : ""});
		var oTA = new TextArea({
			value : "{/value}"
		});

		// arrange
		oTA.setModel(oModel);
		oTA.placeAt("content");
		core.applyChanges();
		var fnChangeSpy = this.spy(oTA, "fireChange");

		oTA.focus();
		oTA.updateDomValue("a");
		qutils.triggerEvent("input", oTA.getFocusDomRef());
		assert.equal(oModel.getProperty("/value"), "" , "no model value update");
		assert.equal(oTA.getValue(), "a", "getter still returns the current dom value");

		oTA.getFocusDomRef().blur();
		this.clock.tick(0);	// when a blur event occurs the "sapfocusleave" is fired async
		assert.equal(oModel.getProperty("/value"), "a", "model value is updated on blur");
		assert.equal(oTA.getValue(), "a", "getter returns the current dom value");
		assert.equal(fnChangeSpy.callCount, 1 , "change event is fired on blur");

		oTA.setValueLiveUpdate(true);
		fnChangeSpy.resetHistory();

		oTA.focus();
		oTA.updateDomValue("b");
		qutils.triggerEvent("input", oTA.getFocusDomRef());

		assert.equal(oModel.getProperty("/value"), "b", "model value is updated with LiveUpdate");
		assert.equal(oTA.getValue(), "b", "getter returns the current dom value");
		assert.equal(fnChangeSpy.callCount, 0, "no change event is fired");

		// cleanup
		oTA.destroy();
	});

	QUnit.module("Accessibility");
	QUnit.test("DOM aria properties", function(assert) {
		var oTA = new TextArea().placeAt("content");
		core.applyChanges();

		var $TA = jQuery(oTA.getFocusDomRef());
		assert.strictEqual($TA.attr("role"), undefined, "Control role is not set. It causes issues with Jaws");
		assert.strictEqual($TA.attr("aria-multiline"), undefined, "Multiline is not for textarea. It causes issues with Jaws");

		oTA.destroy();
	});

	QUnit.module("Encoding");
	QUnit.test("carriage return should be converted correctly during rendering", function(assert) {
		var sValue = " \ntest\ntest\n\n";
		var oTA = new TextArea({
			value : sValue
		}).placeAt("content");
		core.applyChanges();

		oTA.focus();
		assert.strictEqual(oTA.getValue(), sValue, "API value is correct");
		oTA.destroy();
	});


	QUnit.module("Growing");

	QUnit.test("after setValue the height is adjusted", function(assert) {
		var sLongText = new Array(1000).join("text ");
		var oTA = new TextArea({
			growing: true,
			width: "100%"
		}).placeAt("content");
		core.applyChanges();

		var iInitialHeight = oTA.getFocusDomRef().clientHeight;

		oTA.setValue(sLongText);
		core.applyChanges();
		assert.ok(oTA.getFocusDomRef().clientHeight >= iInitialHeight, "TextArea height is adjusted");
		oTA.destroy();
	});

	QUnit.test("height is adjust on resize event", function(assert) {
		var fnOnResizeSpy,
			sLongText = new Array(1000).join("text "),
			oTA = new TextArea({
			value: sLongText,
			growing: true
		}).placeAt("content");

		oTA._updateOverflow();
		assert.ok(true,  "_updateOverflow is pass successfully when the control is not rendered");

		core.applyChanges();

		fnOnResizeSpy = this.spy(oTA, "_resizeHandler");

		oTA.setWidth("500px");
		this.clock.tick(200);

		assert.ok(oTA._sResizeListenerId, "TextArea has resize handler");
		assert.strictEqual(fnOnResizeSpy.callCount, 1, "The resize handler was called once");
		oTA.destroy();
	});

	QUnit.test("line height", function(assert) {
		var sLongText = new Array(10).join("text "),
			oTA = new TextArea({
				value: sLongText,
				growing: true
			});

		assert.notOk(oTA._getLineHeight(), "_getLineHeight should return null, when there is no dom ref");

		oTA.placeAt('content');
		core.applyChanges();

		assert.ok(!isNaN(oTA._getLineHeight()), "_getLineHeight should be a number");

		oTA.destroy();
	});

	QUnit.test("maxHeight should be defined if maxLines is set", function(assert) {
		var sLongText = new Array(1000).join("text ");
		var oTA = new TextArea({
			value: sLongText,
			growing: true,
			growingMaxLines: 5,
			width: "100%"
		}).placeAt("content");
		core.applyChanges();

		oTA.focus();
		assert.ok(oTA.getFocusDomRef().scrollHeight > oTA.getFocusDomRef().offsetHeight, "There is scroll bar. Whole content is not visible");
		assert.ok(jQuery(oTA.getDomRef('inner')).css("max-height"), "There is a max-height defined");
		oTA.destroy();
	});

	QUnit.test("Grow and shrink properly", function(assert) {
		var sLongText = new Array(1000).join("text ");
		var shortText = "Lorem ipsulum";
		var oTA = new TextArea({
			value: sLongText,
			growing: true,
			growingMaxLines: 5,
			width: "100%"
		}).placeAt("content");
		core.applyChanges();

		var oDOMRef = oTA.getDomRef();
		var oTextAreaDOMRef = oTA.getDomRef('inner');
		var oMirrorDiv = oTA.getDomRef('hidden');
		var initialHeight = oDOMRef.clientHeight;

		//Act
		oTA.setValue(shortText);
		core.applyChanges();

		//Assert
		assert.ok(oMirrorDiv, "A mirror div container should be created");
		assert.strictEqual(oMirrorDiv.innerHTML.replace('&nbsp;', ''), shortText, "The mirror div should have the same text as an inner html");
		assert.strictEqual(oMirrorDiv.clientHeight, oTextAreaDOMRef.clientHeight, "The mirror div should have the same height as the textarea");
		assert.ok(initialHeight > oDOMRef.clientHeight, "TextArea height should have been shrinked properly.");
		assert.ok(oTextAreaDOMRef.clientHeight >= oTextAreaDOMRef.scrollHeight, "Textarea should not have a scroll");

		//Act
		oTA.setValue(sLongText);
		core.applyChanges();

		//Assert
		assert.strictEqual(oMirrorDiv.innerHTML.replace('&nbsp;', ''), sLongText, "The mirror div should have the same text as an inner html");
		assert.strictEqual(oMirrorDiv.clientHeight, oTextAreaDOMRef.clientHeight, "The mirror div should have the same height as the textarea");
		assert.ok(initialHeight === oDOMRef.clientHeight, "TextArea height should have been extended properly.");
		assert.ok(oTextAreaDOMRef.clientHeight < oTextAreaDOMRef.scrollHeight, "TextArea should have a scroll.");

		oTA.destroy();
	});

	QUnit.test("Sync properties: growing + width + cols", function (assert) {
		var oTextArea = new TextArea({
				growing: true,
				cols: 80
			}).placeAt("content");
		core.applyChanges();

		// Assert
		assert.strictEqual(oTextArea.getDomRef("hidden").style.width, "40rem", "Width properly calculated");
		assert.strictEqual(oTextArea.$("hidden").width(), oTextArea.$("hidden").width(), "Hidden and textarea are equally spanned");


		// Act
		oTextArea.setWidth("200px");
		core.applyChanges();

		// Assert
		assert.strictEqual(oTextArea.$().width(), 200, "Width property takes over the cols");
		assert.notEqual(oTextArea.getDomRef("hidden").style.width, "40rem", "Width property takes over the cols");

		// Act
		oTextArea.setWidth(null);
		oTextArea.setGrowing(false);
		core.applyChanges();

		// Assert
		assert.notEqual(oTextArea.$().width(), 200, "TextArea resizes to default dimesnions");
		assert.notOk(oTextArea.getDomRef("hidden"), "The ghost container is gone");
	});

	QUnit.module("Paste");
	QUnit.test("Test the paste at the end of the text", function (assert) {
		// system under test
		var oCounter, oCounterStyle,
				sInitValue = "This is test text. ",
				sPasteText = "Additional text is added",
				oTA = new TextArea({
					value: sInitValue,
					maxLength: 6,
					showExceededText: true
				}),
				oBundle = Lib.getResourceBundleFor("sap.m"),
				sMessageBundleKey = "TEXTAREA_CHARACTERS_EXCEEDED";


		// arrange
		oTA.placeAt("content");
		core.applyChanges();

		oCounter = oTA.$("counter");
		oCounterStyle = window.getComputedStyle(oCounter[0]);
		oTA.onfocusin();

		// assertions
		assert.strictEqual(oCounter.text(), oBundle.getText(sMessageBundleKey, [13]), "the counter content is correct");

		qutils.triggerEvent("paste", oTA.getFocusDomRef(), {
			originalEvent: {
				clipboardData: {
					getData: function () {
						return sPasteText;
					}
				}
			}
		});

		oTA.setValue(oTA.getValue() + sPasteText);
		this.clock.tick(10);
		qutils.triggerEvent("input", oTA);
		core.applyChanges();

		// assertions
		assert.strictEqual(oTA.getValue(), "This is test text. Additional text is added", "The Textarea value is correct");
		assert.strictEqual(jQuery(oTA.getFocusDomRef()).cursorPos(), oTA.getMaxLength(), "The Textarea cursor position content is correct");
		assert.strictEqual(oTA.getFocusDomRef().selectionStart, oTA.getMaxLength(), "The Textarea selection start is correct");
		assert.strictEqual(oTA.getFocusDomRef().selectionEnd, oTA.getValue().length, "The Textarea selection end is correct");
		assert.strictEqual(oTA.getValue(), sInitValue + sPasteText, "The Textarea value is correct");

		assert.strictEqual(oCounterStyle.visibility, "visible", "The counter is visible");
		assert.strictEqual(oCounter.text(), oBundle.getText(sMessageBundleKey, [37]), "The counter content is correct");

		// cleanup
		oTA.destroy();
	});

	QUnit.module("Counter");
	QUnit.test("Test counter behaviour on showExceededText value changed", function (assert) {
		// system under test
		var sInitValue = "This is test text.",
				iMaxLength = 6,
				oCounter,
				oTA = new TextArea({
					value: "",
					maxLength: iMaxLength,
					showExceededText: false
				}),
				oBundle = Lib.getResourceBundleFor("sap.m"),
				sMessageBundleKey = "TEXTAREA_CHARACTERS";

		// arrange
		oTA.setValue(sInitValue);
		oTA.placeAt("content");
		core.applyChanges();
		oTA.onfocusin();

		oCounter = oTA.$("counter");

		// assertions
		assert.strictEqual(oTA.getValue(), sInitValue.substring(0, iMaxLength), "The TextArea value is correct");
		assert.strictEqual(oTA.getMaxLength(), iMaxLength, "The TextArea maxLength property is correctly set to 6");
		assert.strictEqual(oCounter.length, 0, "The counter not defined");

		// arrange
		oTA.setShowExceededText(true);
		core.applyChanges();
		oCounter = oTA.$("counter");

		// assertions
		assert.strictEqual(oTA.getValue(), sInitValue.substring(0, iMaxLength), "The TextArea value is correct");
		assert.strictEqual(oTA.getMaxLength(), 6, "The TextArea maxLength property is correctly set to 0");
		assert.strictEqual(oCounter[0].innerText, oBundle.getText(sMessageBundleKey + "_LEFT", "0"), "The counter is empty");

		//arrange
		oTA.setValue(sInitValue);
		core.applyChanges();
		assert.strictEqual(oTA.getValue(), sInitValue, "The TextArea value is correct");
		assert.strictEqual(oCounter[0].innerText, oBundle.getText(sMessageBundleKey + "_EXCEEDED", 12), "The counter is empty");
		assert.strictEqual(oTA.$("inner")[0].hasAttribute("aria-labelledby"), true, "The TextArea has got an aria-labelledby attribute");
		assert.strictEqual(oTA.$("inner").attr("aria-labelledby"), oCounter[0].id, "The TextArea aria-labelledby attribute is set to counter id correctly");

		// arrange
		oTA.setShowExceededText(false);
		core.applyChanges();

		// assertions
		assert.strictEqual(oTA.getValue(), sInitValue.substring(0, iMaxLength), "The TextArea value is correct");
		assert.strictEqual(oTA.getMaxLength(), iMaxLength, "The TextArea maxLength property is correctly set to 6");
		assert.strictEqual(oTA.getShowExceededText(), false, "The property showExceededText is false");
		assert.strictEqual(oTA.$("inner")[0].hasAttribute("aria-labelledby"), false, "The TextArea haven't got an aria-labelledby attribute");

		// cleanup
		oTA.destroy();
	});

	QUnit.test("valueState with showExceededText = true without binding", function (assert) {
		var sInitValue = "Text",
			iMaxLength = 40,
			sValueState = "Error",
			sInitValue = "Lorem ipsum dolor sit amet, consectetur el",
			oTA = new TextArea({
				value: sInitValue,
				showExceededText: true,
				maxLength: iMaxLength,
				width: "100%",
				valueState: sValueState,
				valueLiveUpdate: true,
				liveChange: function () {
					oTA.setValueState(oTA.getValue().length > oTA.getMaxLength() ? "Error" : "Success");
				}
			});

		// arrange
		oTA.placeAt("content");
		core.applyChanges();

		// assertions
		assert.strictEqual(oTA.getValue(), sInitValue, "The TextArea value is correct");
		assert.strictEqual(oTA.getMaxLength(), iMaxLength, "The TextArea maxLength property is correctly set to 6");
		assert.strictEqual(oTA.getValueState(), sValueState, "valueStat is Error");
		assert.strictEqual(oTA._maxLengthIsExceeded(), true, "max length is exceeded");

		// arrange
		var fnFireLiveChangeSpy = this.spy(oTA, "fireLiveChange");
		oTA.setValue("This is test text.");
		//fireLiveChange not "input" event because in inputBase onInput: for IE the event is marked as invalid on event simulation
		oTA.fireLiveChange();
		core.applyChanges();

		// assertions
		assert.strictEqual(oTA.getValue(), "This is test text.", "The TextArea value is correct");
		assert.strictEqual(oTA.getMaxLength(), iMaxLength, "The TextArea maxLength property is correctly set to 6");
		assert.strictEqual(fnFireLiveChangeSpy.callCount, 1);
		assert.strictEqual(oTA.getValueState(), ValueState.Success, "valueStat is Warning");
		assert.strictEqual(oTA._maxLengthIsExceeded(), false, "max length is not exceeded");

		// cleanup
		oTA.destroy();
	});

	QUnit.test("valueState with showExceededText = true with binding", function (assert) {
		// system under test
		var iMaxLength = 40,
			oTA = new TextArea({
				value: "{/value}",
				showExceededText: true,
				maxLength: iMaxLength,
				width: "100%",
				valueState: "{= ${/value}.length > 40 ? 'Error' : 'Success' }",
				valueLiveUpdate: true,
				liveChange: function () { oTA.setValueState(oTA.getValue().length > oTA.getMaxLength() ? "Error" : "Success");}
			});

		// arrange
		var oData = {
			"value": "Lorem ipsum dolor sit amet, consectetur el"
		};

		var oModel = new JSONModel(oData);
		oTA.setModel(oModel);

		oTA.placeAt("content");
		core.applyChanges();
		//fireLiveChange not "input" event because in inputBase onInput: for IE the event is marked as invalid on event simulation
		oTA.fireLiveChange();

		// assertions
		assert.strictEqual(oTA.getValue(), oData.value, "The TextArea value is correct");
		assert.strictEqual(oTA.getMaxLength(), iMaxLength, "The TextArea maxLength property is correctly set to 6");
		assert.strictEqual(oTA.getValueState(), ValueState.Error, "valueStat is Error");

		// arrange
		oTA.setValue("This is test text.");
		//fireLiveChange not "input" event because in inputBase onInput: for IE the event is marked as invalid on event simulation
		oTA.fireLiveChange();

		// assertions
		assert.strictEqual(oTA.getValue(), "This is test text.", "The TextArea value is correct");
		assert.strictEqual(oTA.getMaxLength(), iMaxLength, "The TextArea maxLength property is correctly set to 6");
		assert.strictEqual(oTA.getValueState(), ValueState.Success, "valueStat is Success");
		assert.strictEqual(oTA._maxLengthIsExceeded(), false, "max length is not exceeded");

		// cleanup
		oTA.destroy();
	});

	QUnit.test("showExceededText = false on phone", function (assert) {
		// system under test
		var oDeviceStub = this.stub(Device, "system").value({
				desktop: false,
				phone: true,
				tablet: false
			});

		// Arrange
		var iMaxLength = 6,
			sInitValue = "This is test text.",
			oTextArea = new TextArea({
				showExceededText: false,
				maxLength: 6,
				width: "100%"
			});

		oTextArea.placeAt("content");
		core.applyChanges();

		var $textarea = jQuery("textarea");

		//Act
		$textarea.val(sInitValue).trigger("input");
		core.applyChanges();

		// Assert
		assert.strictEqual(oTextArea.getValue(), sInitValue.substring(0, iMaxLength), "The TextArea value is correct");
		assert.strictEqual(oTextArea.getMaxLength(), iMaxLength, "The TextArea maxLength property is correctly set to 6");

		// cleanup
		oTextArea.destroy();
		oDeviceStub.restore();
	});

});