/*global QUnit */
sap.ui.define([
	"sap/ui/core/UIArea",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/commons/layout/MatrixLayout",
	"sap/ui/commons/CheckBox",
	"sap/ui/commons/DatePicker",
	"sap/ui/commons/Label",
	"sap/ui/commons/TextField",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/QUnitUtils"
], function(UIArea, VerticalLayout, MatrixLayout, CheckBox, DatePicker, Label, TextField, KeyCodes, qutils) {
	"use strict";

	// Prepare a UI
	var oDIV = document.createElement("div");
	oDIV.id = "content";
	document.body.appendChild(oDIV);

	var oVerticalLayout = new VerticalLayout();

	var oMatrixLayout = new MatrixLayout({width:"500px"});
	oMatrixLayout.setLayoutFixed(false);

	oMatrixLayout.createRow(
			new Label({text: "Field 1 of group1",labelFor:"field11"}),
			new TextField({id:"field11",width:"200px", fieldGroupIds:"group1"})
	);
	oMatrixLayout.createRow(
			new Label({text: "Field 2 of group1",labelFor:"field12"}),
			new TextField({id:"field12",width:"200px", fieldGroupIds:["group1"]})
	);
	oMatrixLayout.createRow(
			new Label({text: "Field 3 of group1",labelFor:"field13"}),
			new TextField({id:"field13",width:"200px", fieldGroupIds:["group1"]})
	);
	oMatrixLayout.createRow(
			new Label({text: "Field 1 of group2",labelFor:"field21"}),
			new CheckBox({id:"field21",width:"200px", fieldGroupIds:["group2"]})
	);
	oVerticalLayout.addContent(oMatrixLayout);

	oMatrixLayout = new MatrixLayout({width:"500px"});
	oMatrixLayout.setLayoutFixed(false);
	oMatrixLayout.createRow(
			new Label({text: "Field 2 of group2",labelFor:"field22"}),
			new TextField({id:"field22",width:"200px", fieldGroupIds:["group2"]})
	);
	oMatrixLayout.createRow(
			new Label({text: "Field 1 with no group",labelFor:"field1"}),
			new TextField({id:"field1",width:"200px"})
	);
	oMatrixLayout.createRow(
			new Label({text: "Field 3 of group2",labelFor:"field23"}),
			new TextField({id:"field23",width:"200px", fieldGroupIds:["group2"]})
	);
	oMatrixLayout.createRow(
			new Label({text: "Field 1 of group3",labelFor:"field31"}),
			new TextField({id:"field31",width:"200px", fieldGroupIds:["group3"]})
	);
	oMatrixLayout.createRow(
			new Label({text: "Field 2 of group3",labelFor:"field32"}),
			new CheckBox({id:"field32",width:"200px", fieldGroupIds:["group3"]})
	);
	oMatrixLayout.createRow(
			new Label({text: "Field 3 of group3",labelFor:"field33"}),
			new CheckBox({id:"field33",width:"200px", fieldGroupIds:["group3"]})
	);
	oMatrixLayout.createRow(
			new Label({text: "Field 4 with group3",labelFor:"field34"}),
			new DatePicker({id:"field34",width:"200px",fieldGroupIds:["group3"]})
	);
	oMatrixLayout.createRow(
			new Label({text: "Field 2 with no group",labelFor:"field2"}),
			new TextField({id:"field2",width:"200px"})
	);
	oMatrixLayout.createRow(
			new Label({text: "Field 3 with no group",labelFor:"field3"}),
			new TextField({id:"field3",width:"200px"})
	);
	oMatrixLayout.createRow(
			new Label({text: "Field 1 of group4",labelFor:"field41"}),
			new TextField({id:"field41",width:"200px", fieldGroupIds:["group4"]})
	);
	oMatrixLayout.createRow(
			new Label({text: "Field 2 of group4",labelFor:"field42"}),
			new CheckBox({id:"field42",width:"200px", fieldGroupIds:["group4"]})
	);
	oMatrixLayout.createRow(
			new Label({text: "Field 3 of group4 Field 1 of group5",labelFor:"field43-51"}),
			new CheckBox({id:"field43-51",width:"200px", fieldGroupIds:["group4","group5"]})
	);
	oMatrixLayout.createRow(
			new Label({text: "Field 4 of group4 Field 2 of group5 Field 1 of group6",labelFor:"field44-52-61"}),
			new CheckBox({id:"field44-52-61",width:"200px", fieldGroupIds:["group5","group4","group6"]})
	);
	oMatrixLayout.createRow(
			new Label({text: "Field 3 of group5",labelFor:"field54"}),
			new CheckBox({id:"field53",width:"200px", fieldGroupIds:["group5"]})
	);
	oMatrixLayout.createRow(
			new Label({text: "Field 4 of group5",labelFor:"field54"}),
			new CheckBox({id:"field54",width:"200px", fieldGroupIds:["group5"]})
	);
	oMatrixLayout.createRow(
			new Label({text: "Field 5 of group5",labelFor:"field55"}),
			new CheckBox({id:"field55",width:"200px", fieldGroupIds:["group5"]})
	);
	oMatrixLayout.createRow(
			new Label({text: "Field 2 of group6",labelFor:"field62"}),
			new CheckBox({id:"field62",width:"200px", fieldGroupIds:["group6"]})
	);
	oMatrixLayout.createRow(
			new Label({text: "Field 3 of group6",labelFor:"field63"}),
			new CheckBox({id:"field63",width:"200px", fieldGroupIds:["group6"]})
	);
	oMatrixLayout.createRow(
			new Label({text: "Field 5 of group6 Field 5 of group4",labelFor:"field32"}),
			new CheckBox({id:"field45-65",width:"200px", fieldGroupIds:["group4","group6"]})
	);

	oVerticalLayout.addContent(oMatrixLayout);
	oVerticalLayout.placeAt("content");

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

	// Assert changeGroup events
	function checkEvent(oEvent) {
		if (Array.isArray(sCurrentGroup)) {
			var iFound = 0;
			for (var i = 0; i < sCurrentGroup.length; i++) {
				if (oEvent.mParameters.fieldGroupIds.indexOf(sCurrentGroup[i]) > -1) {
					iFound++;
				}
			}
			QUnit.config.current.assert.equal(oEvent.mParameters.fieldGroupIds.length,iFound,"ValidateFieldGroup groups, event fired for correct group:" + sCurrentGroup);
		}
	}

	function moveFocus(sFieldId, sCurrent, sNew, fnContinue) {
		sCurrentGroup = sCurrent;
		sNewGroup = sNew;

		sap.ui.getCore().byId(sFieldId).focus();
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
		},1);
	}

	QUnit.test("focus field of group 1", function(assert) {
		assert.expect(1);
		var done = assert.async();
		//focus the content area initially
		document.getElementById("content").focus();
		moveFocus("field11", [""], "group1", done);
	});

	QUnit.test("focus field of group 2", function(assert) {
		assert.expect(2);
		var done = assert.async();
		document.getElementById("field11").focus();
		moveFocus("field21", ["group1"], "group2", done);
	});

	QUnit.test("focus field of group 3", function(assert) {
		assert.expect(2);
		var done = assert.async();
		document.getElementById("field21").focus();
		moveFocus("field31", ["group2"], "group3", done);
	});

	QUnit.test("focus field with no group ", function(assert) {
		assert.expect(2);
		var done = assert.async();
		document.getElementById("field31").focus();
		moveFocus("field1", ["group3"], "", done);
	});

	QUnit.test("focus field of group 3 and validate", function(assert) {
		assert.expect(3);
		var done = assert.async();
		document.getElementById("field1").focus();
		moveFocus("field31", [], "group3", function() {

			qutils.triggerKeyEvent("keyup",
					sap.ui.core.UIArea._oFieldGroupControl.getDomRef(),
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
					sap.ui.core.UIArea._oFieldGroupControl.getDomRef(),
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
		oEnterControl = sap.ui.getCore().byId("field31");
		oEnterControl.setFieldGroupIds([sNewGroup]);
		assert.equal(oEnterControl.getFieldGroupIds().indexOf(sNewGroup),0,"FieldGroupId changed to group4");
		sCurrentGroup = [sNewGroup];
		sap.ui.getCore().byId("field1").focus();
		setTimeout(function() {
			sNewGroup = "group3";
			oEnterControl = sap.ui.getCore().byId("field31");
			oEnterControl.setFieldGroupIds([sNewGroup]);
			assert.equal(oEnterControl.getFieldGroupIds().indexOf(sNewGroup),0,"FieldGroupId changed to group3");
			setTimeout(function() {
				oEnterControl.focus();
				sCurrentGroup = ["group3"];
				setTimeout(function() {
					sap.ui.getCore().byId("field1").focus();
					setTimeout(function() {
						done();
					},1);
				},1);
			},1);
		},1);

	});

	QUnit.test("get controls by field group", function(assert) {
		var aGroup;
		assert.expect(18);
		aGroup = oVerticalLayout.getControlsByFieldGroupId("group1");
		assert.equal(aGroup.length,3,"3 controls in group1");
		aGroup = oVerticalLayout.getControlsByFieldGroupId("group2");
		assert.equal(aGroup.length,3,"3 controls in group2");
		aGroup = oVerticalLayout.getControlsByFieldGroupId("group3");
		assert.equal(aGroup.length,4,"4 controls in group3");
		aGroup = oVerticalLayout.getControlsByFieldGroupId([]);
		assert.equal(aGroup.length,48,"48 controls with no field group");
		aGroup = oVerticalLayout.getControlsByFieldGroupId("");
		assert.equal(aGroup.length,48,"48 controls with no field group");
		aGroup = oVerticalLayout.getControlsByFieldGroupId();
		assert.equal(aGroup.length,20,"20 controls with  field groups");
		aGroup = oVerticalLayout.getControlsByFieldGroupId(["group5","group4","group6"]);
		assert.equal(aGroup.length,1,"1 controls with  field groups ['group5','group4','group6']");
		aGroup = oVerticalLayout.getControlsByFieldGroupId(["group6","group4","group5"]);
		assert.equal(aGroup.length,1,"1 controls with  field groups ['group6','group4','group5']");
		aGroup = oVerticalLayout.getControlsByFieldGroupId(["group6","group4"]);
		assert.equal(aGroup.length,2,"2 controls with  field groups ['group6','group4']");
		aGroup = oVerticalLayout.getControlsByFieldGroupId("group6,group4");
		assert.equal(aGroup.length,2,"2 controls with  field groups 'group6,group4'");


		aGroup = sap.ui.getCore().byFieldGroupId("group1");
		assert.equal(aGroup.length,3,"3 controls in group1");
		aGroup = sap.ui.getCore().byFieldGroupId("group2");
		assert.equal(aGroup.length,3,"3 controls in group2");
		aGroup = sap.ui.getCore().byFieldGroupId("group3");
		assert.equal(aGroup.length,4,"4 controls in group3");
		aGroup = sap.ui.getCore().byFieldGroupId([]);
		assert.equal(aGroup.length,49,"49 controls with no field group");
		aGroup = sap.ui.getCore().byFieldGroupId();
		assert.equal(aGroup.length,20,"20 controls with  field groups");
		aGroup = sap.ui.getCore().byFieldGroupId(["group5","group4","group6"]);
		assert.equal(aGroup.length,1,"1 controls with  field groups ['group5','group4','group6']");
		aGroup = sap.ui.getCore().byFieldGroupId(["group6","group4","group5"]);
		assert.equal(aGroup.length,1,"1 controls with  field groups ['group6','group4','group5']");
		aGroup = sap.ui.getCore().byFieldGroupId(["group6","group4"]);
		assert.equal(aGroup.length,2,"2 controls with  field groups ['group6','group4']");

	});

	QUnit.test("Destroy of fields", function(assert) {
		assert.expect(6);
		var oParent = null;
		var done = assert.async();
		document.getElementById("field11").focus();
		oEnterControl = sap.ui.getCore().byId("field21");
		oParent = oEnterControl.getParent();
		moveFocus("field21","group1","group2",function () {
			oEnterControl.destroy();
		});
		setTimeout(function() {
			moveFocus("field31",["group2"],"group3",function() {
				moveFocus("field11",["group3"],"group1",function() {
					var aGroup = oVerticalLayout.getControlsByFieldGroupId("group2");
					assert.equal(aGroup.length,2,"2 controls in group2 field21 was destroyed");
					//adding ading field again
					oParent.addContent(new CheckBox({id:"field21",width:"200px", fieldGroupIds:["group2"]}));
					aGroup = oVerticalLayout.getControlsByFieldGroupId("group2");
					assert.equal(aGroup.length,3,"3 controls in group2 field21 was added");
					setTimeout(function() {
						document.getElementById("content").focus();
						done();
					},1);
				});
			});
		},1);
	});


	QUnit.test("Multiple Groups focus field of group 4, group5, group6", function(assert) {
		assert.expect(7);
		var done = assert.async();
		//focus the content area initially
		bPauseEventing = true;
		setTimeout(function() {
			document.getElementById("field43-51").focus();
			setTimeout(function() {
				bPauseEventing = false;
				moveFocus("field41", ["group5"], "group4",function() {
					setTimeout(function() {
						moveFocus("field44-52-61", ["group5"], "group4", function() {
							setTimeout(function() {
								moveFocus("field53", ["group4","group6"], "group5", function() {
									setTimeout(function() {
										moveFocus("field33", ["group5"], "group3", done);
									},1);
								});
							},1);
						});
					},1);
				});
			},1);
		},1);
	});

});