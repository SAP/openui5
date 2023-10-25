/*global QUnit */
sap.ui.define([
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/DatePicker",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Popover",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/core/UIArea",
	"sap/ui/events/KeyCodes",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(Button, CheckBox, DatePicker, Input, Label, Popover, Control, Element, UIArea, KeyCodes, HorizontalLayout, VerticalLayout, qutils, createAndAppendDiv, nextUIUpdate) {
	"use strict";

	// Prepare a UI
	createAndAppendDiv("content");

	var oVerticalLayout = new VerticalLayout({
		content: [
			new HorizontalLayout({
				content: [
					new Label({text: "Field 0 of group0", labelFor:"input100"}),
					new Input({id:"input100", width:"200px", fieldGroupIds:"group0"})
				]
			}),
			new HorizontalLayout({
				content: [
					new Label({text: "Field 1 of group1", labelFor:"input11"}),
					new Input({id:"input11", width:"200px", fieldGroupIds:"group1"})
				]
			}),
			new HorizontalLayout({
				content: [
					new Label({text: "Field 2 of group1", labelFor:"input12"}),
					new Input({id:"input12", width:"200px", fieldGroupIds:["group1"]})
				]
			}),
			new HorizontalLayout({
				content: [
					new Label({text: "Field 3 of group1", labelFor:"input13"}),
					new Input({id:"input13", width:"200px", fieldGroupIds:["group1"]})
				]
			}),
			new HorizontalLayout({
				content: [
					new Label({text: "Field 1 of group2", labelFor:"input21"}),
					new CheckBox({id:"input21", width:"200px", fieldGroupIds:["group2"]})
				]
			}),


			new HorizontalLayout({
				content: [
					new Label({text: "Field 2 of group2", labelFor:"input22"}),
					new Input({id:"input22", width:"200px", fieldGroupIds:["group2"]})
				]
			}),
			new HorizontalLayout({
				content: [
					new Label({text: "Field 1 with no group", labelFor:"input1"}),
					new Input({id:"input1", width:"200px"})
				]
			}),
			new HorizontalLayout({
				content: [
					new Label({text: "Field 3 of group2", labelFor:"input23"}),
					new Input({id:"input23", width:"200px", fieldGroupIds:["group2"]})
				]
			}),
			new HorizontalLayout({
				content: [
					new Label({text: "Field 1 of group3", labelFor:"input31"}),
					new Input({id:"input31", width:"200px", fieldGroupIds:["group3"]})
				]
			}),
			new HorizontalLayout({
				content: [
					new Label({text: "Field 2 of group3", labelFor:"input32"}),
					new CheckBox({id:"input32", width:"200px", fieldGroupIds:["group3"]})
				]
			}),
			new HorizontalLayout({
				content: [
					new Label({text: "Field 3 of group3", labelFor:"input33"}),
					new CheckBox({id:"input33", width:"200px", fieldGroupIds:["group3"]})
				]
			}),
			new HorizontalLayout({
				content: [
					new Label({text: "Field 4 with group3", labelFor:"input34"}),
					new DatePicker({id:"input34", width:"200px", fieldGroupIds:["group3"]})
				]
			}),
			new HorizontalLayout({
				content: [
					new Label({text: "Field 2 with no group", labelFor:"input2"}),
					new Input({id:"input2", width:"200px"})
				]
			}),
			new HorizontalLayout({
				content: [
					new Label({text: "Field 3 with no group", labelFor:"input3"}),
					new Input({id:"input3", width:"200px"})
				]
			}),
			new HorizontalLayout({
				content: [
					new Label({text: "Field 1 of group4", labelFor:"input41"}),
					new Input({id:"input41", width:"200px", fieldGroupIds:["group4"]})
				]
			}),
			new HorizontalLayout({
				content: [
					new Label({text: "Field 2 of group4", labelFor:"input42"}),
					new CheckBox({id:"input42", width:"200px", fieldGroupIds:["group4"]})
				]
			}),
			new HorizontalLayout({
				content: [
					new Label({text: "Field 3 of group4 Field 1 of group5", labelFor:"input43-51"}),
					new CheckBox({id:"input43-51", width:"200px", fieldGroupIds:["group4", "group5"]})
				]
			}),
			new HorizontalLayout({
				content: [
					new Label({text: "Field 4 of group4 Field 2 of group5 Field 1 of group6", labelFor:"input44-52-61"}),
					new CheckBox({id:"input44-52-61", width:"200px", fieldGroupIds:["group5", "group4", "group6"]})
				]
			}),
			new HorizontalLayout({
				content: [
					new Label({text: "Field 3 of group5", labelFor:"input54"}),
					new CheckBox({id:"input53", width:"200px", fieldGroupIds:["group5"]})
				]
			}),
			new HorizontalLayout({
				content: [
					new Label({text: "Field 4 of group5", labelFor:"input54"}),
					new CheckBox({id:"input54", width:"200px", fieldGroupIds:["group5"]})
				]
			}),
			new HorizontalLayout({
				content: [
					new Label({text: "Field 5 of group5", labelFor:"input55"}),
					new CheckBox({id:"input55", width:"200px", fieldGroupIds:["group5"]})
				]
			}),
			new HorizontalLayout({
				content: [
					new Label({text: "Field 2 of group6", labelFor:"input62"}),
					new CheckBox({id:"input62", width:"200px", fieldGroupIds:["group6"]})
				]
			}),
			new HorizontalLayout({
				content: [
					new Label({text: "Field 3 of group6", labelFor:"input63"}),
					new CheckBox({id:"input63", width:"200px", fieldGroupIds:["group6"]})
				]
			}),
			new HorizontalLayout({
				content: [
					new Label({text: "Field 5 of group6 Field 5 of group4", labelFor:"input32"}),
					new CheckBox({id:"input45-65", width:"200px", fieldGroupIds:["group4", "group6"]})
				]
			})
		]
	}).placeAt("content");

	// Attach handler for testing
	var bPauseEventing = false;
	oVerticalLayout.attachValidateFieldGroup(function(oEvent) {
		if (!bPauseEventing) {
			checkEvent(oEvent);
		}
	});


	// Testing parameters
	var oEnterControl = null,
		sNewGroup = "",
		sCurrentGroup = "";

	// helper to determine the 'relevant' controls for a set of field group names
	function getControlsByFieldGroupId(vFieldGroups) {
		return oVerticalLayout.getControlsByFieldGroupId(vFieldGroups).filter(function(ctrl) {
			return /^input\d+(-\d\d)*$/.test(ctrl.getId());
		});
	}

	// Assert changeGroup events
	function checkEvent(oEvent) {
		if (Array.isArray(sCurrentGroup)) {
			var iFound = 0;
			for (var i = 0; i < sCurrentGroup.length; i++) {
				if (oEvent.mParameters.fieldGroupIds.indexOf(sCurrentGroup[i]) > -1) {
					iFound++;
				}
			}
			QUnit.config.current.assert.equal(oEvent.mParameters.fieldGroupIds.length, iFound, "ValidateFieldGroup groups, event fired for correct group:" + sCurrentGroup);
		}
	}

	function moveFocus(sFieldId, sCurrent, sNew, fnContinue) {
		sCurrentGroup = sCurrent;
		sNewGroup = sNew;

		Element.getElementById(sFieldId).focus();
		setTimeout(function () {
			var a = UIArea._oFieldGroupControl.getFieldGroupIds();
			if (a) {
				if (sNewGroup.length > 0) {
					QUnit.config.current.assert.equal(a.indexOf(sNewGroup) > -1, true, "Focus now on newgroup:" + sNewGroup);
				} else {
					QUnit.config.current.assert.equal(a.length, sNewGroup.length, "Focus now on newgroup: Empty");
				}
			} else {
				QUnit.config.current.assert.ok(true, "Focus now on no group:" + sNewGroup);

			}
			sCurrentGroup = [sNew];
			if (fnContinue) {
				fnContinue();
			}
		}, 1);
	}

	QUnit.module("FieldGroups", {
		before: nextUIUpdate
	});

	QUnit.test("Input with valueHelp", async function(assert) {
		assert.expect(1);
		var done = assert.async();
		var oButton = new Button({text: "Button"});
		var oPopover = new Popover({
			fieldGroupIds: ["MyFieldGroup"],
			showHeader: false,
			showArrow: false,
			content: [oButton]
		});
		var oInput = new Input({
			fieldGroupIds: ["MyFieldGroup"],
			showValueHelp: true,
			width: "200px",
			validateFieldGroup: function(oEvent){
				assert.notOk("No fieldGroupChange should be fired");
			},
			valueHelpRequest: function(oEvent) {
				oPopover.openBy(oEvent.getSource());
			}
		}).placeAt('content');
		await nextUIUpdate();
		qutils.triggerEvent("click", oInput._getValueHelpIcon(), {});
		oPopover.attachAfterOpen(function() {
			assert.strictEqual(oButton.getId(), document.activeElement.id, "focus moved to popover and no fieldgroupchange must happen");
			done();
		});
	});

	QUnit.test("focus not focusable area", function(assert) {
		assert.expect(1);
		var done = assert.async();
		//focus a field and the non focusable content
		var oControl = Element.getElementById("input100");
		oControl.focus();
		oControl.attachValidateFieldGroup(function() {
			assert.ok(true, "fieldgroup validation fired!");
			done();
		});
		setTimeout(function() {
			oControl.getFocusDomRef().blur();
		}, 0);
	});

	QUnit.test("focus field of group 1", function(assert) {
		assert.expect(1);
		var done = assert.async();
		//focus the content area initially
		document.getElementById("content").focus();
		moveFocus("input11", [""], "group1", done);
	});

	QUnit.test("focus field of group 2", function(assert) {
		assert.expect(2);
		var done = assert.async();
		document.getElementById("input11").focus();
		moveFocus("input21", ["group1"], "group2", done);
	});

	QUnit.test("focus field of group 3", function(assert) {
		assert.expect(2);
		var done = assert.async();
		document.getElementById("input21").focus();
		moveFocus("input31", ["group2"], "group3", done);
	});

	QUnit.test("focus field with no group ", function(assert) {
		assert.expect(2);
		var done = assert.async();
		document.getElementById("input31").focus();
		moveFocus("input1", ["group3"], "", done);
	});

	QUnit.test("focus field of group 3 and validate", function(assert) {
		assert.expect(3);
		var done = assert.async();
		document.getElementById("input1").focus();
		moveFocus("input31", [], "group3", function() {

			qutils.triggerKeyEvent("keyup",
					UIArea._oFieldGroupControl.getDomRef(),
					UIArea._oFieldGroupValidationKey.keyCode,
					UIArea._oFieldGroupValidationKey.shiftKey,
					UIArea._oFieldGroupValidationKey.altKey,
					UIArea._oFieldGroupValidationKey.ctrlKey);

			// define a different key combination
			var oStoreKeyCombination = UIArea._oFieldGroupValidationKey;
			UIArea._oFieldGroupValidationKey = {
					keyCode : KeyCodes.F2,
					shiftKey:true,
					altKey:false,
					ctrlKey:true
			};

			qutils.triggerKeyEvent("keyup",
					UIArea._oFieldGroupControl.getDomRef(),
					UIArea._oFieldGroupValidationKey.keyCode,
					UIArea._oFieldGroupValidationKey.shiftKey,
					UIArea._oFieldGroupValidationKey.altKey,
					UIArea._oFieldGroupValidationKey.ctrlKey);

			//reset keycode after test
			UIArea._oFieldGroupValidationKey = oStoreKeyCombination;

			done();
		});
	});

	QUnit.test("change field group id", function(assert) {
		assert.expect(4);
		var done = assert.async();
		sNewGroup = "group4";
		oEnterControl = Element.getElementById("input31");
		oEnterControl.setFieldGroupIds([sNewGroup]);
		assert.equal(oEnterControl.getFieldGroupIds().indexOf(sNewGroup), 0, "FieldGroupId changed to group4");
		sCurrentGroup = [sNewGroup];
		Element.getElementById("input1").focus();
		setTimeout(function() {
			sNewGroup = "group3";
			oEnterControl = Element.getElementById("input31");
			oEnterControl.setFieldGroupIds([sNewGroup]);
			assert.equal(oEnterControl.getFieldGroupIds().indexOf(sNewGroup), 0, "FieldGroupId changed to group3");
			setTimeout(function() {
				oEnterControl.focus();
				sCurrentGroup = ["group3"];
				setTimeout(function() {
					Element.getElementById("input1").focus();
					setTimeout(function() {
						done();
					}, 1);
				}, 1);
			}, 1);
		}, 1);

	});

	QUnit.test("get controls by field group", function(assert) {
		var aGroup;
		assert.expect(18);

		aGroup = getControlsByFieldGroupId("group1");
		assert.equal(aGroup.length, 3, "3 controls in group1");
		aGroup = getControlsByFieldGroupId("group2");
		assert.equal(aGroup.length, 3, "3 controls in group2");
		aGroup = getControlsByFieldGroupId("group3");
		assert.equal(aGroup.length, 4, "4 controls in group3");
		aGroup = getControlsByFieldGroupId([]);
		assert.equal(aGroup.length, 24, "24 controls with no field group");
		aGroup = getControlsByFieldGroupId("");
		assert.equal(aGroup.length, 24, "24 controls with no field group");
		aGroup = getControlsByFieldGroupId();
		assert.equal(aGroup.length, 21, "21 controls with any field groups");
		aGroup = getControlsByFieldGroupId(["group5", "group4", "group6"]);
		assert.equal(aGroup.length, 1, "1 controls with  field groups ['group5', 'group4', 'group6']");
		aGroup = getControlsByFieldGroupId(["group6", "group4", "group5"]);
		assert.equal(aGroup.length, 1, "1 controls with  field groups ['group6', 'group4', 'group5']");
		aGroup = getControlsByFieldGroupId(["group6", "group4"]);
		assert.equal(aGroup.length, 2, "2 controls with  field groups ['group6', 'group4']");
		aGroup = getControlsByFieldGroupId("group6,group4");
		assert.equal(aGroup.length, 2, "2 controls with  field groups 'group6,group4'");

		function byFieldGroupId(vFieldGroups) {
			return Control.getControlsByFieldGroupId(vFieldGroups).filter(function(ctrl) {
				return /^input\d+(-\d\d)*$/.test(ctrl.getId());
			});
		}

		aGroup = byFieldGroupId("group1");
		assert.equal(aGroup.length, 3, "3 controls in group1");
		aGroup = byFieldGroupId("group2");
		assert.equal(aGroup.length, 3, "3 controls in group2");
		aGroup = byFieldGroupId("group3");
		assert.equal(aGroup.length, 4, "4 controls in group3");
		aGroup = byFieldGroupId([]);
		assert.equal(aGroup.length, 24, "24 controls with no field group");
		aGroup = byFieldGroupId();
		assert.equal(aGroup.length, 21, "21 controls with  field groups");
		aGroup = byFieldGroupId(["group5", "group4", "group6"]);
		assert.equal(aGroup.length, 1, "1 controls with  field groups ['group5', 'group4', 'group6']");
		aGroup = byFieldGroupId(["group6", "group4", "group5"]);
		assert.equal(aGroup.length, 1, "1 controls with  field groups ['group6', 'group4', 'group5']");
		aGroup = byFieldGroupId(["group6", "group4"]);
		assert.equal(aGroup.length, 2, "2 controls with  field groups ['group6', 'group4']");

	});

	QUnit.test("Destroy of fields", function(assert) {
		assert.expect(6);
		var oParent = null;
		var done = assert.async();
		document.getElementById("input11").focus();
		oEnterControl = Element.getElementById("input21");
		oParent = oEnterControl.getParent();
		moveFocus("input21", "group1", "group2", function () {
			oEnterControl.destroy();
		});
		setTimeout(function() {
			moveFocus("input31", ["group2"], "group3", function() {
				moveFocus("input11", ["group3"], "group1", function() {
					var aGroup = getControlsByFieldGroupId("group2");
					assert.equal(aGroup.length, 2, "2 controls in group2 input21 were destroyed");
					//adding ading field again
					oParent.addContent(new CheckBox({id:"input21", width:"200px", fieldGroupIds:["group2"]}));
					aGroup = getControlsByFieldGroupId("group2");
					assert.equal(aGroup.length, 3, "3 controls in group2 input21 were added");
					setTimeout(function() {
						document.getElementById("content").focus();
						done();
					}, 1);
				});
			});
		}, 1);
	});


	QUnit.test("Multiple Groups focus field of group 4, group5, group6", function(assert) {
		assert.expect(7);
		var done = assert.async();
		//focus the content area initially
		bPauseEventing = true;
		setTimeout(function() {
			document.getElementById("input43-51").focus();
			setTimeout(function() {
				bPauseEventing = false;
				moveFocus("input41", ["group5"], "group4", function() {
					setTimeout(function() {
						moveFocus("input44-52-61", ["group5"], "group4", function() {
							setTimeout(function() {
								moveFocus("input53", ["group4", "group6"], "group5", function() {
									setTimeout(function() {
										moveFocus("input33", ["group5"], "group3", done);
									}, 1);
								});
							}, 1);
						});
					}, 1);
				});
			}, 1);
		}, 1);
	});

});