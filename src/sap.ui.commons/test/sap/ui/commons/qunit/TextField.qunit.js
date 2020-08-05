/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/library",
	"sap/ui/commons/TextField",
	"sap/ui/core/Control",
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device"
], function(
	createAndAppendDiv,
	coreLibrary,
	TextField,
	Control,
	jQuery,
	Device
) {
	"use strict";

	// shortcut for sap.ui.core.AccessibleRole
	var AccessibleRole = coreLibrary.AccessibleRole;

	// shortcut for sap.ui.core.ImeMode
	var ImeMode = coreLibrary.ImeMode;

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;


	// prepare DOM
	createAndAppendDiv("uiArea1");
	createAndAppendDiv("uiArea2");
	document.body.appendChild(document.createElement("SPAN")).setAttribute("id", "D1");
	document.body.appendChild(document.createElement("SPAN")).setAttribute("id", "D2");
	document.body.appendChild(document.createElement("SPAN")).setAttribute("id", "L1");
	document.body.appendChild(document.createElement("SPAN")).setAttribute("id", "L2");
	createAndAppendDiv("uiArea3");



	var sValue = "Hello",
			sTooltip = "abc",
			oTextDirection = TextDirection.RTL,
			bEnabled = true,
			bEditable = true,
			bVisible = true,
			bRequired = false,
			sWidth = "111px",
			iMaxLength = 15,
			oValueState = ValueState.Success,
			oTextAlign = TextAlign.End,
			oImeMode = ImeMode.Disabled,
			sHelpId = "12345",
			oAccessibleRole = AccessibleRole.Textbox,
			aAriaDescribedBy = ["D1", "D2"],
			aAriaLabelledBy = ["L1", "L2"],
			sChangeMessage = "ruckzuck";

	function changeEventHandler() {
		throw sChangeMessage;
	}

	var oTextField1 = new TextField("t1");
	oTextField1.setValue(sValue);
	oTextField1.setTextDirection(oTextDirection);
	oTextField1.setTooltip(sTooltip);
	oTextField1.setEnabled(bEnabled);
	oTextField1.setEditable(bEditable);
	oTextField1.setVisible(bVisible);
	oTextField1.setRequired(bRequired);
	oTextField1.setWidth(sWidth);
	oTextField1.setMaxLength(iMaxLength);
	oTextField1.setValueState(oValueState);
	oTextField1.setTextAlign(oTextAlign);
	oTextField1.setImeMode(oImeMode);
	oTextField1.setHelpId(sHelpId);
	oTextField1.setAccessibleRole(oAccessibleRole);
	oTextField1.attachChange(changeEventHandler);
	oTextField1.placeAt("uiArea1");

	new TextField("t2", {
		value: sValue,
		textDirection: oTextDirection,
		tooltip: sTooltip,
		enabled: bEnabled,
		editable: bEditable,
		visible: bVisible,
		required: !bRequired,
		width: sWidth,
		maxLength: iMaxLength,
		valueState: ValueState.Error,
		textAlign: oTextAlign,
		imeMode: oImeMode,
		helpId: sHelpId,
		accessibleRole: oAccessibleRole,
		ariaDescribedBy: aAriaDescribedBy,
		ariaLabelledBy: aAriaLabelledBy,
		change: changeEventHandler,
		placeholder: "Hello"
	}).placeAt("uiArea2");

	var oTextField3 = new TextField("t3").placeAt("uiArea3");

	var t1, t2;

	QUnit.module("Basic", {
		beforeEach: function (assert) {
			t1 = sap.ui.getCore().getControl("t1");
			t2 = sap.ui.getCore().getControl("t2");

			t2.setWidth(sWidth);

			sap.ui.getCore().applyChanges();

			assert.ok(t1, "t1 should not be null");
			assert.ok(t2, "t2 should not be null");
		},
		afterEach: function () {
			t1 = null;
			t2 = null;
		}
	});

	// test property accessor methods

	QUnit.test("ValueOk", function (assert) {
		assert.strictEqual(t1.getValue(), sValue, "t1.getValue()");
		assert.strictEqual(t2.getValue(), sValue, "t2.getValue()");
	});

	QUnit.test("TextDirectionOk", function (assert) {
		assert.strictEqual(t1.getTextDirection(), oTextDirection, "t1.getTextDirection()");
		assert.strictEqual(t2.getTextDirection(), oTextDirection, "t2.getTextDirection()");
	});

	QUnit.test("TooltipOk", function (assert) {
		assert.strictEqual(t1.getTooltip(), sTooltip, "t1.getTooltip()");
		assert.strictEqual(t2.getTooltip(), sTooltip, "t2.getTooltip()");
	});

	QUnit.test("EnabledOk", function (assert) {
		assert.strictEqual(t1.getEnabled(), bEnabled, "t1.getEnabled()");
		assert.strictEqual(t2.getEnabled(), bEnabled, "t2.getEnabled()");
	});

	QUnit.test("EditableOk", function (assert) {
		assert.strictEqual(t1.getEditable(), bEditable, "t1.getEditable()");
		assert.strictEqual(t2.getEditable(), bEditable, "t2.getEditable()");
	});

	QUnit.test("VisibleOk", function (assert) {
		assert.strictEqual(t1.getVisible(), bVisible, "t1.getVisible()");
		assert.strictEqual(t2.getVisible(), bVisible, "t2.getVisible()");
	});

	QUnit.test("RequiredOk", function (assert) {
		assert.strictEqual(t1.getRequired(), bRequired, "t1.getRequired()");
		assert.strictEqual(t2.getRequired(), !bRequired, "t2.getRequired()");
	});

	QUnit.test("WidthOk", function (assert) {
		assert.strictEqual(t1.getWidth(), sWidth, "t1.getWidth()");
		assert.strictEqual(t2.getWidth(), sWidth, "t2.getWidth()");
	});

	QUnit.test("MaxLengthOk", function (assert) {
		assert.strictEqual(t1.getMaxLength(), iMaxLength, "t1.getMaxLength()");
		assert.strictEqual(t2.getMaxLength(), iMaxLength, "t2.getMaxLength()");
	});

	QUnit.test("ValueStateOk", function (assert) {
		assert.strictEqual(t1.getValueState(), oValueState, "t1.getValueState()");
		assert.strictEqual(t2.getValueState(), ValueState.Error, "t2.getValueState()");
	});

	QUnit.test("TextAlignOk", function (assert) {
		assert.strictEqual(t1.getTextAlign(), oTextAlign, "t1.getTextAlign()");
		assert.strictEqual(t2.getTextAlign(), oTextAlign, "t2.getTextAlign()");
	});

	QUnit.test("ImeModeOk", function (assert) {
		assert.strictEqual(t1.getImeMode(), oImeMode, "t1.getImeMode()");
		assert.strictEqual(t2.getImeMode(), oImeMode, "t2.getImeMode()");
	});

	QUnit.test("HelpIdOk", function (assert) {
		assert.strictEqual(t1.getHelpId(), sHelpId, "t1.getHelpId()");
		assert.strictEqual(t2.getHelpId(), sHelpId, "t2.getHelpId()");
	});

	QUnit.test("AccessibleRoleOk", function (assert) {
		assert.strictEqual(t1.getAccessibleRole(), oAccessibleRole, "t1.getAccessibleRole()");
		assert.strictEqual(t2.getAccessibleRole(), oAccessibleRole, "t2.getAccessibleRole()");
	});

	QUnit.test("ariaDescribedBy", function (assert) {
		assert.ok(isEmpty(t1.getAriaDescribedBy()), "t1.getAriaDescribedBy()");
		assert.deepEqual(t2.getAriaDescribedBy(), aAriaDescribedBy, "t2.getAriaDescribedBy()");
	});

	QUnit.test("ariaLabelledBy", function (assert) {
		assert.ok(isEmpty(t1.getAriaLabelledBy()), "t1.getAriaLabelledBy()");
		assert.deepEqual(t2.getAriaLabelledBy(), aAriaLabelledBy, "t2.getAriaLabelledBy()");
	});

	// test event handlers

	// TODO: event handler using Event parameters

	QUnit.test("ChangeOk", function (assert) {
		try {
			t1.fireChange();
			assert.ok(false, "exception should have been thrown!");
		} catch (e) {
			assert.strictEqual(e, sChangeMessage, "t1.fireChange()");
		}

		try {
			t2.fireChange();
			assert.ok(false, "exception should have been thrown!");
		} catch (e) {
			assert.strictEqual(e, sChangeMessage, "t2.fireChange()");
		}
	});

	QUnit.test("DetachChangeOk", function (assert) {
		t1.detachChange(changeEventHandler);
		try {
			t1.fireChange();
			assert.ok(true, "No event and thus no exception should be triggered!");
		} catch (e) {
			assert.ok(false, "should not occur");
		}
		// cleanup in order to be independent from order of execution of test-functions (e.g. in FF3 there was an issue)
		t1.attachChange(changeEventHandler);
	});


	// test misc (control interaction, metadata, styles, etc.)

	function isEmpty(oObject) {
		for (var i in oObject) { // eslint-disable-line no-unused-vars
			return false;
		}
		return true;
	}

	QUnit.test("MetadataOk", function (assert) {
		var oMetadata = t1.getMetadata();
		assert.ok(oMetadata, "t1.getMetadata() should not be null");
		assert.ok(oMetadata.getParent(), "t1.getMetadata().getParent() should not be null");
		assert.ok(oMetadata.getParent() === Control.getMetadata());
		assert.strictEqual(oMetadata.getProperties()["value"]["type"], "string");
		assert.ok(isEmpty(oMetadata.getAggregations()));
		var oAssociations = oMetadata.getAssociations();
		assert.strictEqual(oAssociations["ariaDescribedBy"]["type"], "sap.ui.core.Control", "ariaDescribedBy type");
		assert.ok(oAssociations["ariaDescribedBy"]["multiple"], "ariaDescribedBy multiple");
		assert.strictEqual(oAssociations["ariaLabelledBy"]["type"], "sap.ui.core.Control", "ariaLabelledBy type");
		assert.ok(oAssociations["ariaLabelledBy"]["multiple"], "ariaLabelledBy multiple");
	});

	QUnit.test("OffsetWidthOk", function (assert) {
		//test the pixel perfect width of the control
		var oDomRef = window.document.getElementById("t1");
		assert.strictEqual(oDomRef.offsetWidth, parseInt(t1.getWidth()), "t1.offsetWidth == parseInt(t1.getWidth())");
		t2.setWidth("500px");
		sap.ui.getCore().applyChanges();
		oDomRef = window.document.getElementById("t2");
		assert.strictEqual(oDomRef.offsetWidth, 500, "b2.offsetWidth == 500");
	});

	QUnit.test("ARIA", function (assert) {
		var oT1 = jQuery("#t1");
		var oT2 = jQuery("#t2");
		assert.equal(oT2.attr("role"), oAccessibleRole.toLowerCase(), "Role");
		assert.equal(oT2.attr("aria-multiline"), "false", "aria-multiline");
		assert.equal(oT2.attr("aria-autocomplete"), "none", "aria-autocomplete");
		assert.ok(!oT1.attr("aria-invalid"), "aria-invalid not set");
		assert.equal(oT2.attr("aria-invalid"), "true", "aria-invalid");
		assert.equal(oT2.attr("aria-describedby"), "D1 D2", "aria-describesby");
		assert.equal(oT2.attr("aria-labelledby"), "L1 L2", "aria-labelledby");
		assert.ok(!oT1.attr("aria-required"), "aria-required not set");
		assert.equal(oT2.attr("aria-required"), "true", "aria-required");
	});

	QUnit.test("DomRef test", function (assert) {
		assert.equal(oTextField1.getFocusDomRef().id, "t1", "FocusDomRef OK");
		assert.equal(oTextField1.getInputDomRef().id, "t1", "InputDomRef OK");
		assert.equal(oTextField1.getIdForLabel(), "t1", "Label ID OK");
	});

	QUnit.test("Placeholder", function (assert) {
		var oT1 = jQuery("#t1");
		var oT2 = jQuery("#t2");
		var oT3 = jQuery("#t3");
		if (Device.support.input.placeholder) {
			assert.ok(!oT1.attr("placeholder"), "placeholder not set");
			assert.equal(oT2.attr("placeholder"), "Hello", "placeholder set");
		}
		assert.ok(!oT3.attr("placeholder"), "placeholder not set");
		assert.equal(oT3.val(), "", "no placeholder value set on HTML element");
		assert.ok(!oT3.hasClass("sapUiTfPlace"), "placeholder class not set");

		oTextField3.setPlaceholder("Hello");
		sap.ui.getCore().applyChanges();
		oT3 = jQuery("#t3");

		if (Device.support.input.placeholder) {
			assert.equal(oT3.attr("placeholder"), "Hello", "Placeholder set");
			assert.equal(oT3.val(), "", "no placeholder value set on HTML element");
			assert.ok(!oT3.hasClass("sapUiTfPlace"), "placeholder class not set");
		} else {
			assert.ok(!oT3.attr("placeholder"), "placeholder not set");
			assert.equal(oT3.val(), "Hello", "placeholder value set on HTML element");
			assert.ok(oT3.hasClass("sapUiTfPlace"), "placeholder class set");
			oT3.focus();
			assert.equal(oT3.val(), "", "no placeholdervalue set on HTML element if focused");
			assert.ok(!oT3.hasClass("sapUiTfPlace"), "placeholder class not set if focused");
			oT1.focus();
			assert.equal(oT3.val(), "Hello", "value set on HTML element if focuse lost");
			assert.ok(oT3.hasClass("sapUiTfPlace"), "placeholder class set if focus lost");
			oTextField3.setValue("Text");
			assert.equal(oT3.val(), "Text", "value set on HTML element");
			assert.ok(!oT3.hasClass("sapUiTfPlace"), "placeholder class not set if a value is set");
			oTextField3.setValue("");
			assert.equal(oT3.val(), "Hello", "placeholder value set on HTML element if value is empty");
			assert.ok(oT3.hasClass("sapUiTfPlace"), "placeholder class set if value is empty");
		}

	});
	if (Device.browser.internet_explorer) {
		QUnit.test("Paste for IE", function (assert) {
			//Arrange
			var oT1 = sap.ui.getCore().byId("t1"),
				sStringWithLineEndings = "A\r\nB\r\nC\r",
				sStringWithoutLineEndings = "DE F",
				oEvent = {
					clipboardData: {
						getData: function () {
							return sStringWithLineEndings;
						},
						setData: function () {}
					}
				},
				oSetDataSpy = sinon.spy(oEvent.clipboardData, "setData");

			//Act
			oT1.onpaste(oEvent);
			//Assert
			assert.deepEqual(oSetDataSpy.getCall(0).args, ["Text", "A B C"], "onpaste handler should remove all line" +
					" endings from the pasted string");

			//Arrange
			oEvent.clipboardData.getData = function () {
				return sStringWithoutLineEndings;
			};
			oSetDataSpy.reset();

			//Act
			oT1.onpaste(oEvent);

			//Assert
			assert.deepEqual(oSetDataSpy.getCall(0).args, ["Text", sStringWithoutLineEndings], "onpaste handler " +
					"should not modify the pasted string if it does not contain line endings");
		});
	} else {
		QUnit.test("Paste for browsers different than IE", function (assert) {
			assert.ok(!sap.ui.getCore().byId('t1').onpaste, "There should not be any paste handler for non IE browsers.");
		});
	}
});