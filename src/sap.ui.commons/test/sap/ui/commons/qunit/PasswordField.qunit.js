/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/PasswordField",
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device"
], function(qutils, createAndAppendDiv, PasswordField, jQuery, Device) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3", "uiArea4"]);



	var oPwdFlds = {};

	var initPwdFld = function(idx, bVisible, bEnabled, iMaxLength, iWidth, sValue, sPlaceholder){
		var sId = "oPwdFld" + idx;
		var oPwdFld = new PasswordField(sId);
		if (bVisible != -1) {oPwdFld.setVisible(bVisible);}
		if (bEnabled != -1) {oPwdFld.setEnabled(bEnabled);}
		if (iMaxLength != -1) {oPwdFld.setMaxLength(iMaxLength);}
		if (iWidth != -1) {oPwdFld.setWidth(iWidth);}
		if (sValue != -1) {oPwdFld.setValue(sValue);}
		if (sPlaceholder != -1) {oPwdFld.setPlaceholder(sPlaceholder);}

		sap.ui.setRoot("uiArea" + idx, oPwdFld);
		oPwdFlds[sId] = oPwdFld;
	};

	initPwdFld(1, -1, -1, -1, "100%", -1, -1); // PasswordField with default values
	initPwdFld(2, -1, -1, 12, "300px", "123", -1); // PasswordField with MaxLength 12
	initPwdFld(3, true, true, 8, "300px", "Password", -1); // PasswordField with MaxLength 8
	initPwdFld(4, -1, -1, -1, "15em", -1, "placeholder"); // PasswordField with placeholder



	QUnit.module("Properties");

	QUnit.test("Default Values", function(assert) {
		var oPwdFld = oPwdFlds["oPwdFld1"];
		assert.equal(oPwdFld.getVisible(), true, "Default 'visible':");
		assert.equal(oPwdFld.getEnabled(), true, "Default 'enabled':");
		assert.equal(oPwdFld.getMaxLength(), 0, "Default 'max length':");
		assert.equal(oPwdFld.getWidth(), "100%", "Default 'width':");
		assert.equal(oPwdFld.getValue(), "", "Default 'value':");
	});

	QUnit.test("Properties", function(assert) {
		var oPwdFld = oPwdFlds["oPwdFld2"];
		assert.equal(oPwdFld.getVisible(), true, "Default 'visible':");
		assert.equal(oPwdFld.getEnabled(), true, "Default 'enabled':");
		assert.equal(oPwdFld.getMaxLength(), 12, "Custom 'max length':");
		assert.equal(oPwdFld.getWidth(), "300px", "Custom 'width:");
		assert.equal(oPwdFld.getValue(), "123", "Custom 'value':");
	});

	QUnit.test("Properties", function(assert) {
		var oPwdFld = oPwdFlds["oPwdFld3"];
		assert.equal(oPwdFld.getVisible(), true, "Default 'visible':");
		assert.equal(oPwdFld.getEnabled(), true, "Default 'enabled':");
		assert.equal(oPwdFld.getMaxLength(), 8, "Custom 'max length':");
		assert.equal(oPwdFld.getWidth(), "300px", "Custom 'width:");
		assert.equal(oPwdFld.getValue(), "Password", "Custom 'value':");
	});

	QUnit.test("Password Value", function(assert) {
		// check if password is in HTML
		var oPwdFldDom2 = document.getElementById('oPwdFld2');
		assert.equal(jQuery(oPwdFldDom2).attr("value"),"123","Password");
		assert.equal(jQuery(oPwdFldDom2).attr("type"),"password","Type");
		var oPwdFldDom3 = document.getElementById('oPwdFld3');
		assert.equal(jQuery(oPwdFldDom3).attr("value"),"Password","Password");
		assert.equal(jQuery(oPwdFldDom3).attr("type"),"password","Type");
	});

	QUnit.test("Placeholder", function(assert) {
		var oPwdFld = oPwdFlds["oPwdFld4"];
		var oPwdFldDom = oPwdFld.getDomRef();

		if (Device.support.input.placeholder) {
			assert.equal(jQuery(oPwdFldDom).attr("type"),"password","Type set");
			assert.equal(jQuery(oPwdFldDom).attr("placeholder"),"placeholder","placeholder attribute set");
		} else {
			assert.ok(!jQuery(oPwdFldDom).attr("type"),"no Type set");
			assert.equal(jQuery(oPwdFldDom).val(),"placeholder","placeholder set as value");
		}

		oPwdFld.focus();

		assert.equal(jQuery(oPwdFldDom).attr("type"),"password","Type set if focused");
		if (Device.support.input.placeholder) {
			assert.equal(jQuery(oPwdFldDom).attr("placeholder"),"placeholder","placeholder attribute set if focused");
		} else {
			assert.equal(jQuery(oPwdFldDom).val(),"","placeholder not set as value if focused");
		}

		sap.ui.getCore().byId("oPwdFld1").focus();

		if (Device.support.input.placeholder) {
			assert.equal(jQuery(oPwdFldDom).attr("type"),"password","Type set after focusout");
			assert.equal(jQuery(oPwdFldDom).attr("placeholder"),"placeholder","placeholder attribute set after focusout");
		} else {
			assert.ok(!jQuery(oPwdFldDom).attr("type"),"no Type set after focusout");
			assert.equal(jQuery(oPwdFldDom).val(),"placeholder","placeholder set as value after focusout");
		}

		oPwdFld.focus();
		qutils.triggerCharacterInput(oPwdFld.getId(), "a");
		sap.ui.getCore().byId("oPwdFld1").focus();

		assert.equal(jQuery(oPwdFldDom).attr("type"),"password","Type set after typed something and focusout");
		if (Device.support.input.placeholder) {
			assert.equal(jQuery(oPwdFldDom).attr("placeholder"),"placeholder","placeholder attribute set after typed something and focusout");
		} else {
			assert.equal(jQuery(oPwdFldDom).val(),"a","placeholder not set as value after typed something and focusout");
		}
	});
});