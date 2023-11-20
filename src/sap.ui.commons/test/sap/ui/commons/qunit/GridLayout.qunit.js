/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/form/GridLayout",
	"sap/ui/commons/form/Form",
	"sap/ui/commons/Title",
	"sap/ui/commons/form/FormContainer",
	"sap/ui/commons/form/FormElement",
	"sap/ui/commons/TextField",
	"sap/ui/commons/Label",
	"sap/ui/commons/form/GridElementData",
	"sap/ui/core/VariantLayoutData",
	"sap/ui/commons/TextArea",
	"sap/ui/commons/form/GridContainerData",
	"sap/ui/commons/Image",
	"sap/ui/commons/library",
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device",
	"sap/base/Log"
], function(
	qutils,
	createAndAppendDiv,
	GridLayout,
	Form,
	Title,
	FormContainer,
	FormElement,
	TextField,
	Label,
	GridElementData,
	VariantLayoutData,
	TextArea,
	GridContainerData,
	Image,
	commonsLibrary,
	jQuery,
	Device,
	Log
) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3"]);



	// create Form

	new Form("F1",{
		title: new Title("F1T",{text: "Form Title", icon: "test-resources/sap/ui/commons/images/controls/sap.ui.commons.form.Form.gif", tooltip: "Title tooltip"}),
		layout: new GridLayout("Layout1"),
		formContainers: [
			// container with text-title
			new FormContainer("C1",{
				title: "Container1",
				tooltip: "Container tooltip",
				formElements: [
					// elements with auto size
					new FormElement("C1E1",{
						label: "Label1",
						fields: [
							new TextField("C1E1_T1",{required:true})
						]
					}),
					new FormElement("C1E2",{
						label: new Label("C1E2_L1",{text:"Label2"}),
						fields: [
							new TextField("C1E2_T1"),
							new TextField("C1E2_T2",{required:true})
						]
					}),
					new FormElement("C1E3",{
						label: new Label("C1E3_L1",{text:"Label3", icon:"test-resources/sap/ui/commons/images/help.gif", layoutData: new GridElementData({hCells: "auto"})}),
						fields: [
							new TextField("C1E3_T1",{layoutData: new GridElementData({hCells: "auto"})}),
							new TextField("C1E3_T2",{layoutData: new GridElementData({hCells: "auto"})}),
							new TextField("C1E3_T3",{layoutData: new GridElementData({hCells: "auto"})})
						]
					}),
					// elements with fix size
					new FormElement("C1E4",{
						label: "Label4",
						fields: [
							new TextField("C1E4_T1",{layoutData: new GridElementData({hCells: "3"})})
						]
					}),
					new FormElement("C1E5",{
						label: "Label5",
						fields: [
							new TextField("C1E5_T1",{layoutData: new VariantLayoutData({multipleLayoutData: [new GridElementData({hCells: "3"})]})}),
							new TextField("C1E5_T2",{layoutData: new VariantLayoutData({multipleLayoutData: [new GridElementData({hCells: "3"})]})})
						]
					}),
					// mixed elements
					new FormElement("C1E6",{
						label: new Label("C1E6_L1",{text:"Label6", layoutData: new GridElementData({hCells: "2"})}),
						fields: [
							new TextField("C1E6_T1",{value:"hello", layoutData: new GridElementData({hCells: "3"})}),
							new TextField("C1E6_T2", {enabled: false}),
							new TextField("C1E6_T3",{layoutData: new GridElementData({hCells: "3"})})
						]
					}),
					// elements without label
					new FormElement("C1E7",{
						fields: [
							new TextField("C1E7_T1",{layoutData: new GridElementData({hCells: "3"})}),
							new TextField("C1E7_T2", {editable: false}),
							new TextField("C1E7_T3",{layoutData: new GridElementData({hCells: "3"})})
						]
					}),
					// full size element
					new FormElement("C1E8",{
						label: new Label("C1E8_L1",{text:"Label8"}),
						fields: [
							new TextArea("C1E8_T1",{layoutData: new GridElementData({hCells: "full"})})
						]
					}),
					// full size element without label
					new FormElement("C1E9",{
						fields: [
							new TextArea("C1E9_T1",{layoutData: new GridElementData({hCells: "full",vCells:2})})
						]
					}),
					// elements using vCells
					new FormElement("C1E10",{
						label: new Label({text:"Label 10"}),
						fields: [
							new TextArea("C1E10_T1",{height: "72px", layoutData: new GridElementData({vCells: 3})}),
							new TextArea("C1E10_T2",{height: "47px", layoutData: new GridElementData({hCells: "3",vCells: 2})}),
							new TextArea("C1E10_T3",{height: "22px", layoutData: new GridElementData({vCells: 1})})
						]
					}),
					new FormElement("C1E11",{
						fields: [
							new TextArea("C1E11_T1",{height: "22px", layoutData: new GridElementData({vCells: 1})}),
							new TextArea("C1E11_T2",{height: "47px", layoutData: new GridElementData({vCells: 2})})
						]
					}),
					new FormElement("C1E12",{
						label: new Label({text:"Label 12"}),
						fields: [
							new TextArea("C1E12_T1",{height: "22px", layoutData: new GridElementData({vCells: 1})})
						]
					}),
					new FormElement("C1E13",{
						label: new Label({text:"Label 13"}),
						fields: [
							new TextArea("C1E13_T1",{height: "47px", layoutData: new GridElementData({hCells:"13",vCells: 2})})
						]
					}),
					new FormElement("C1E14",{
						label: new Label({text:"Label 14"}),
						fields: [
							new TextField("C1E14_T1",{layoutData: new GridElementData({hCells: "1"})})
						]
					}),
					new FormElement("C1E15",{
						fields: [
							new TextArea("C1E15_T1",{height: "47px", layoutData: new GridElementData({hCells:"13",vCells: 2})}),
							new TextArea("C1E15_T2",{height: "47px", layoutData: new GridElementData({hCells:"3",vCells: 2})})
						]
					}),
					new FormElement("C1E16",{
						label: "Label 16",
						fields: [
							new TextField("C1E16_T1",{layoutData: new GridElementData({hCells: "1"})})
						]
					}),
					new FormElement("C1E17",{
						label: "Label 17",
						fields: [
							new TextArea("C1E17_T1",{height: "47px", layoutData: new GridElementData({hCells:"3",vCells: 2})})
						]
					}),
					new FormElement("C1E18"), //empty element to put nex field in next row
					new FormElement("C1E19",{
						label: new Label("C1E19_L",{text:"Label 19"}),
						fields: [new TextField("C1E19_T1",{layoutData: new GridElementData({hCells: "1"})})
											]
					})
					]
				}),
				// half size grids
				new FormContainer("C2",{
					title: new Title("C2T",{text: "Title as Control", icon: "test-resources/sap/ui/commons/images/controls/sap.ui.commons.form.Form.gif", tooltip: "Title tooltip"}),
					formElements: [
						new FormElement("C2E1",{
							label: new Label("C2E1_L1",{text:"Label20"}),
							fields: [new TextField("C2E1_T1",{required:true})]
						})
					],
					layoutData: new GridContainerData({halfGrid: true})
				}),
				new FormContainer("C3",{
					title: new Title("C3T",{text: "Title as Control"}),
					expandable: true,
					formElements: [
						new FormElement("C3E1",{
							label: new Label("C3E1_L1",{text:"Label21"}),
							fields: [
								new TextField("C3E1_T1",{layoutData: new GridElementData({hCells: "3"})}),
								new TextField("C3E1_T2",{layoutData: new GridElementData({hCells: "auto"})})
							]
						}),
						new FormElement("C3E2",{
							label: new Label("C3E2_L1",{text:"Label22"}),
							fields: [new TextArea("C3E2_T1",{layoutData: new GridElementData({hCells: "full"})})]
						})
					],
					layoutData: new VariantLayoutData({multipleLayoutData: [new GridContainerData({halfGrid: true})]})
				}),
				// half size grids for vCell testing
				new FormContainer("C4",{
					title: "vCells test left",
					formElements: [
						new FormElement("C4E1",{
							label: "Label23",
							fields: [new TextField("C4E1_T1")]
						}),
						new FormElement("C4E2",{
							label: "Label24",
							fields: [new TextField("C4E2_T1")]
						}),
						new FormElement("C4E3",{
							label: "Label25",
							fields: [new TextField("C4E3_T1")]
						}),
						new FormElement("C4E4",{
							label: "Label26",
							fields: [new TextArea("C4E4_T1",{height: "47px", layoutData: new GridElementData({hCells: "5", vCells: 2})})]
						}),
						new FormElement("C4E5",{
							label: "Label27",
							fields: [new TextArea("C4E5_T1",{height: "47px", layoutData: new GridElementData({hCells: "2", vCells: 2})})]
						}),
						new FormElement("C4E6"),
						new FormElement("C4E7",{
							label: "Label28",
							fields: [new TextField("C4E7_T1",{layoutData: new GridElementData({hCells: "1"})})]
						})
					],
					layoutData: new GridContainerData({halfGrid: true})
				}),
				new FormContainer("C5",{
					title: "vCells test right",
					formElements: [
						new FormElement("C5E1",{
							label: "Label29",
							fields: [new TextArea("C5E1_T1",{height: "47px", layoutData: new GridElementData({hCells: "full", vCells: 2})})]
						}),
						new FormElement("C5E2",{
							label: "Label30",
							fields: [new TextField("C5E2_T1")]
						}),
						new FormElement("C5E3")
					],
					layoutData: new GridContainerData({halfGrid: true})
				}),
				// only one half grif per row and without title
				new FormContainer("C6",{
					formElements: [
						new FormElement("C6E1",{
							label: new Label("C6E1_L1",{text:"Label31"}),
							fields: [new Image("C6E1_I1", {src: "test-resources/sap/ui/commons/images/SAPLogo.gif", layoutData: new GridElementData({hCells: "2"})})]
						}),
						new FormElement("C6E2",{
							label: new Label("C6E2_L1",{text:"Label32"}),
							fields: [new TextArea("C6E2_T1",{layoutData: new GridElementData({hCells: "2", vCells: 3})})]
						}),
						new FormElement("C6E3",{
							visible: false,
							label: new Label("C6E3_L1",{text:"Label"}),
							fields: [new TextField("C6E3_T1",{value: "invisible"})]
						})
					],
					layoutData: new GridContainerData({halfGrid: true})
				}),
				// Error testing
				new FormContainer("C7",{
					title: "Error handling",
					formElements: [
						new FormElement("C7E1",{
							label: new Label("C7E1_L1",{text:"Label33"}),
							fields: [
								new TextField("C7E1_T1",{layoutData: new GridElementData({hCells: "10"})}),
								new TextField("C7E1_T2",{layoutData: new GridElementData({hCells: "10"})})
							]
						}),
						new FormElement("C7E2",{
							label: new Label("C7E2_L1",{text:"Label34"}),
							fields: [
								new TextField("C7E2_T1",{value: "1"}),
								new TextField("C7E2_T2",{value: "2"}),
								new TextField("C7E2_T3",{value: "3"}),
								new TextField("C7E2_T4",{value: "4"}),
								new TextField("C7E2_T5",{value: "5"}),
								new TextField("C7E2_T6",{value: "6"}),
								new TextField("C7E2_T7",{value: "7"}),
								new TextField("C7E2_T8",{value: "8"}),
								new TextField("C7E2_T9",{value: "9"}),
								new TextField("C7E2_T10",{value: "10"}),
								new TextField("C7E2_T11",{value: "11"}),
								new TextField("C7E2_T12",{value: "12"}),
								new TextField("C7E2_T13",{value: "13"}),
								new TextField("C7E2_T14",{value: "14"}),
								new TextField("C7E2_T15",{value: "15"})
							]
						}),
						new FormElement("C7E3",{
							label: new Label("C7E3_L1",{text:"Label35"}),
							fields: [new TextField("C7E3_T1",{layoutData: new GridElementData({hCells: "12"})}),
									 new TextField("C7E3_T2"),
									 new TextField("C7E3_T3")]
						}),
						new FormElement("C7E4",{
							label: new Label("C7E4_L1",{text:"Label36"}),
							fields: [new TextArea("C7E4_T1",{layoutData: new GridElementData({hCells: "2", vCells:2})}),
									 new TextField("C7E4_T2")]
						}),
						new FormElement("C7E5",{
							label: new Label("C7E5_L1",{text:"Label37"}),
							fields: [new TextField("C7E5_T1",{layoutData: new GridElementData({hCells: "full"})})]
						}),
						new FormElement("C7E6",{
							label: new Label("C7E6_L1",{text:"Label38"}),
							fields: [new TextArea("C7E6_T1",{layoutData: new GridElementData({hCells: "2", vCells: 3})})]
						}),
						new FormElement("C7E7",{
							visible: false,
							label: new Label("C7E7_L1",{text:"Label39"}),
							fields: [new TextField("C7E7_T1",{value: "invisible"})]
						})
					]
				}),
				// invisible container
				new FormContainer("C8",{
					title: "Invisible container",
					visible: false,
					formElements: [
						new FormElement("C8E1",{
							label: new Label("C8E1_L1",{text:"Label40"}),
							fields: [new TextField("C8E1_T1")]
						})
					]
				})
			]
		}).placeAt("uiArea1");

	new Form("F2",{
		title: new Title("F2T",{text: "16 cells without separator", level: commonsLibrary.TitleLevel.H1}),
		layout: new GridLayout("Layout2"),
		formContainers: [
			new FormContainer("F2C1",{
				formElements: [
					new FormElement("F2C1E1",{
						label: "Label",
						fields: [
							new TextField("F2C1E1_T1",{value: "1"}),
							new TextField("F2C1E1_T2",{value: "2"}),
							new TextField("F2C1E1_T3",{value: "3"}),
							new TextField("F2C1E1_T4",{value: "4"}),
							new TextField("F2C1E1_T5",{value: "5"}),
							new TextField("F2C1E1_T6",{value: "6"}),
							new TextField("F2C1E1_T7",{value: "7"}),
							new TextField("F2C1E1_T8",{value: "8"}),
							new TextField("F2C1E1_T9",{value: "9"}),
							new TextField("F2C1E1_T10",{value: "10"}),
							new TextField("F2C1E1_T11",{value: "11"}),
							new TextField("F2C1E1_T12",{value: "12"}),
							new TextField("F2C1E1_T13",{value: "13"})
						]
					})
				]
			})
		]
	}).placeAt("uiArea2");

	new Form("F3",{
		title: "8 cells without separator",
		layout: new GridLayout("Layout3", {singleColumn: true}),
		formContainers: [
			new FormContainer("F3C1",{
				title: "full container",
				formElements: [
					new FormElement("F3C1E1",{
						label: "Label",
						fields: [
							new TextField("F3C1E1_T1",{value: "1"}),
							new TextField("F3C1E1_T2",{value: "2"}),
							new TextField("F3C1E1_T3",{value: "3"}),
							new TextField("F3C1E1_T4",{value: "4"}),
							new TextField("F3C1E1_T5",{value: "5"})
						]
					})
				]
			}),
			new FormContainer("F3C2",{
				title: "Half container",
				formElements: [
					new FormElement("F3C2E1",{
						label: "Label",
						fields: [
							new TextField("F3C2E1_T1")
						]
					})
				],
				layoutData: new GridContainerData({halfGrid: true})
			}),
			new FormContainer("F3C3",{
				title: "another Half container",
				formElements: [
					new FormElement("F3C3E1",{
						label: "Label",
						fields: [
							new TextField("F3C3E1_T1"),
							new TextField("F3C3E1_T2")
						]
					}),
					new FormElement("F3C3E2",{
						fields: [
							new TextField("F3C3E2_T1", {value: "Test changing LayoutData"})
						]
					})
				],
				layoutData: new GridContainerData({halfGrid: true})
			})
		]
	}).placeAt("uiArea3");

	var countCells = function(sID, iMax){
		var aRows = jQuery(document.getElementById(sID)).find("tr");
		var bOK = true;
		for ( var i = 0; i < aRows.length; i++){
			var aCells = jQuery(aRows[i]).children();
			var iCells = 0;
			for ( var j = 0; j < aCells.length; j++){
				var oCell = jQuery(aCells[j]);
				var sColspan = oCell.attr("colspan");
				if ( sColspan ){
					iCells = iCells + parseInt(sColspan);
				} else {
					iCells++;
				}
			}
			if (iCells > iMax){
				bOK = false;
			}
		}
		return bOK;
	};

	// test functions

	QUnit.module("Rendering");

	QUnit.test("Grid", function(assert) {
		assert.ok(document.getElementById("F1"), "Form1 is rendered");
		assert.ok(document.getElementById("Layout1"), "Grid1 is rendered");
		assert.ok(jQuery("#Layout1").is("table"), "Grid1 is rendered as table");
		assert.ok(document.getElementById("F1T"), "Form1 title is rendered");
		assert.ok(jQuery("#F1T").is("h4"), "Form title is rendered as H4 as default");
		assert.ok(jQuery("#F1T").parent().is("th"), "Form1 title is in <TH>");
		assert.equal(jQuery("#F1T").parent().attr("colspan"), "17", "Form1 title is stretched over full width");
		assert.ok(jQuery("#F2T").is("h1"), "Form title is rendered as H1 as defined on control");
		assert.ok(countCells("F1",17), "All rows of Form1 have max. 17 cells");
		assert.ok(countCells("F2",16), "All rows of Form2 have max. 16 cells");
		assert.ok(countCells("F3",8), "All rows of Form3 have max. 8 cells");
	});

	QUnit.test("Container Full-Size", function(assert) {
		assert.ok(!document.getElementById("C1--Exp"), "Container1 no expander is rendered");
		assert.ok(jQuery('h5:contains("Container1")').get(0), "Title (as text) is renderd");
		assert.equal(jQuery('h5:contains("Container1")').parent().attr("title"), "Container tooltip", "Container tooltip is renderd");
	});

	QUnit.test("Element", function(assert) {
		assert.ok(document.getElementById("C1E1"), "Element is rendered");
		assert.ok(jQuery("#C1E1").is("tr"), "Element of foll size grid is rendered as table row");
		assert.ok(!document.getElementById("C7E7"), "invisible Element is not rendered");
	});

	QUnit.test("FormControls Full-Size", function(assert) {
		assert.ok(jQuery('label:contains("Label1")').get(0), "Label (as text) is renderd");
		assert.equal(jQuery('label:contains("Label1")').parent().attr("colspan"), "3", "Label 1 rendered over 3 grid cells");
		assert.ok(document.getElementById("C1E1_T1"), "TextField is rendered");
		assert.equal(jQuery("#C1E1_T1").get(0).style.width, "100%", "Element1: Field 1 rendered width = 100%");
		assert.equal(jQuery("#C1E1_T1").parent().attr("colspan"), "14", "Element1: Field 1 rendered over 14 grid cells");
		assert.ok(!jQuery("#C1E1_T1").parent().attr("rowspan") || (Device.browser.internet_explorer && jQuery("#C1E1_T1").parent().attr("rowspan") == "1"), "Element1: Field 1 no rowspan");
		assert.ok(document.getElementById("C1E2_L1"), "Label (as control) is rendered");
		assert.equal(jQuery("#C1E2_T1").parent().attr("colspan"), "7", "Element2: Field 1 rendered over 7 grid cells");
		assert.equal(jQuery("#C1E2_T2").parent().attr("colspan"), "7", "Element2: Field 2 rendered over 7 grid cells");
		assert.equal(jQuery("#C1E3_L1").parent().attr("colspan"), "3", "Element3: Label (with hCells=auto) rendered over 3 grid cells");
		assert.equal(jQuery("#C1E3_T1").parent().attr("colspan"), "4", "Element3: Field 1 rendered over 4 grid cells");
		assert.equal(jQuery("#C1E3_T2").parent().attr("colspan"), "5", "Element3: Field 2 rendered over 5 grid cells");
		assert.equal(jQuery("#C1E3_T3").parent().attr("colspan"), "5", "Element3: Field 3 rendered over 5 grid cells");
		assert.equal(jQuery("#C1E4_T1").parent().attr("colspan"), "3", "Element4: Field 1 (with hCells=3) rendered over 3 grid cells");
		assert.equal(jQuery("#C1E5_T1").parent().attr("colspan"), "3", "Element5: Field 1 (with hCells=3) rendered over 3 grid cells");
		assert.equal(jQuery("#C1E5_T2").parent().attr("colspan"), "4", "Element5: Field 2 (with hCells=3) rendered over 4 grid cells (including middle cell)");
		assert.equal(jQuery("#C1E6_L1").parent().attr("colspan"), "2", "Element6: Label (with hCells=2) rendered over 2 grid cells");
		assert.equal(jQuery("#C1E6_T1").parent().attr("colspan"), "3", "Element6: Field 1 (with hCells=3) rendered over 3 grid cells");
		assert.equal(jQuery("#C1E6_T2").parent().attr("colspan"), "9", "Element6: Field 2 (without hCells) rendered over 9 grid cells (including middle cell)");
		assert.equal(jQuery("#C1E6_T3").parent().attr("colspan"), "3", "Element6: Field 3 (with hCells=3) rendered over 3 grid cells");
		assert.equal(jQuery("#C1E7_T1").parent().attr("colspan"), "3", "Element7: Field 1 (with hCells=3) rendered over 3 grid cells");
		assert.equal(jQuery("#C1E7_T2").parent().attr("colspan"), "11", "Element7: Field 2 (without hCells) rendered over 11 grid cells (including middle cell)");
		assert.equal(jQuery("#C1E7_T3").parent().attr("colspan"), "3", "Element7: Field 3 (with hCells=3) rendered over 3 grid cells");
		assert.equal(jQuery("#C1E8_L1").parent().attr("colspan"), "17", "Element8: Label (with hCells=full) rendered over 17 grid cells");
		assert.equal(jQuery("#C1E8_T1").parent().attr("colspan"), "17", "Element8: Field 1 (with hCells=full) rendered over 17 grid cells");
		assert.equal(jQuery("#C1E9_T1").parent().attr("colspan"), "17", "Element9: Field 1 (with hCells=full) rendered over 17 grid cells");
		// vCells
		assert.ok(!jQuery("#C1E9_T1").parent().attr("rowspan") || (Device.browser.internet_explorer && jQuery("#C1E9_T1").parent().attr("rowspan") == "1"), "Element9: Field 1 (with hCells 0 full, vCells=2) rendered without rowspan");
		assert.equal(jQuery("#C1E10_T1").parent().attr("rowspan"), "3", "Element10: Field 1 (with vCells=3) rendered with rowspan 3");
		assert.equal(jQuery("#C1E10_T1").parent().attr("colspan"), "5", "Element10: Field 1 rendered over 5 grid cells");
		assert.equal(jQuery("#C1E10_T2").parent().attr("rowspan"), "2", "Element10: Field 2 (with vCells=2) rendered with rowspan 3");
		assert.equal(jQuery("#C1E10_T2").parent().attr("colspan"), "4", "Element10: Field 2  (with hCells=3) rendered over 4 grid cells (including middle cell)");
		assert.ok(!jQuery("#C1E10_T3").parent().attr("rowspan") || (Device.browser.internet_explorer && jQuery("#C1E10_T3").parent().attr("rowspan") == "1"), "Element10: Field 3 (with vCells=1) rendered without rowspan");
		assert.equal(jQuery("#C1E10_T3").parent().attr("colspan"), "5", "Element10: Field 5 rendered over 5 grid cells");
		assert.equal(jQuery(jQuery("#C1E11_T1").parent().parent().children()[0]).attr("colspan"), "3", "Element11: label cell rendered");
		assert.ok(!jQuery(jQuery("#C1E11_T1").parent().parent().children()[0]).children().get(0), "Element11: no label rendered");
		assert.ok(!jQuery("#C1E11_T1").parent().attr("rowspan") || (Device.browser.internet_explorer && jQuery("#C1E11_T1").parent().attr("rowspan") == "1"), "Element11: Field 1 (with vCells=1) rendered without rowspan");
		assert.equal(jQuery("#C1E11_T1").parent().attr("colspan"), "2", "Element11: Field 1 rendered over 2 grid cells");
		assert.equal(jQuery("#C1E11_T2").parent().attr("rowspan"), "2", "Element11: Field 2 (with vCells=3) rendered with rowspan 3");
		assert.equal(jQuery("#C1E11_T2").parent().attr("colspan"), "3", "Element11: Field 1 rendered over 3 grid cells");
		assert.ok(!jQuery("#C1E12_T1").parent().attr("rowspan") || (Device.browser.internet_explorer && jQuery("#C1E12_T1").parent().attr("rowspan") == "1"), "Element12: Field 1 (with vCells=1) rendered without rowspan");
		assert.equal(jQuery("#C1E12_T1").parent().attr("colspan"), "6", "Element12: Field 1 rendered over 6 grid cells");
		assert.equal(jQuery("#C1E13_T1").parent().attr("rowspan"), "2", "Element13: Field 1 (with vCells=2) rendered with rowspan 2");
		assert.equal(jQuery("#C1E13_T1").parent().parent().next().children().length, 0, "Empty dummy row rendered after full-size rowspan");
		assert.ok(document.getElementById("C1E14_T1"), "Element14: TextField is rendered");
		assert.equal(jQuery("#C1E15_T1").parent().attr("rowspan"), "2", "Element15: Field 1 (with vCells=2) rendered with rowspan 2");
		assert.equal(jQuery("#C1E15_T1").parent().parent().next().children().length, 0, "Empty dummy row rendered after full-size rowspan");
		assert.ok(document.getElementById("C1E16_T1"), "Element16: TextField is rendered");
		assert.ok(document.getElementById("C1E18"), "Element18: empty element is rendered");
		assert.equal(jQuery("#C1E17_T1").parent().parent().next().next().children().first().children().first().attr("id"), "C1E19_L", "Element19: Label rendered 2 rows below element 17");

		assert.ok(!document.getElementById("C8E1_T1"), "Content of invisible Container is not rendered");
	});

	QUnit.test("Container Half-Size", function(assert) {
		assert.ok(document.getElementById("C2T"), "Title2 (as Control) is rendered");
		assert.equal(jQuery("#C2T").attr("title"), "Title tooltip", "Title2 (as Control): tooltip is rendered");
		assert.ok(document.getElementById("C2T-ico"), "Title2 (as Control): image is rendered");
		assert.ok((jQuery("#C2T").parent().next().is("td") && !jQuery("#C2T").parent().next().hasClass("sapUiGridHeader")), "Separator cell is rendered");
		assert.equal(jQuery("#C2T").parent().next().children().length, 0, "Separator cell has no content");
		assert.ok(!document.getElementById("C3T-ico"), "Title3 (as Control): no image is rendered");

		assert.ok(!jQuery("#C6E1_L1").parent().parent().prev().children().first().hasClass("sapUiGridHeader"), "Container6 no header rendered");

		assert.equal(jQuery("#F3C2E1_T1").parent().attr("colspan"), "5", "Form3(singleColumn) - Container3 - Element1: Field 1 rendered over 5 grid cells (full size even half container)");
		assert.equal(jQuery("#F3C2E1_T1").parent().next().length, 0, "Form3(singleColumn) - Container3 - Element1: Field 1 - no field beside renderd");
		assert.ok(jQuery("#F3C2E1_T1").parent().parent().next().children().first().hasClass("sapUiGridHeader"), "Form3(singleColumn) - Container3 - Element1: next half container rendered below");

		// as button is loaded async, check if already there and rendered, if not, start test async
		if (sap.ui.require("sap/ui/commons/Button") && document.getElementById("C3--Exp")) {
			assert.ok(!document.getElementById("C2--Exp"), "Container2 no expander is rendered");
			assert.ok(document.getElementById("C3--Exp"), "Container3 expander is rendered");
		} else {
			var fnDone = assert.async();
			sap.ui.require(["sap/ui/commons/Button"], function() {
				sap.ui.getCore().applyChanges(); // to wait for re-rendering
				assert.ok(!document.getElementById("C2--Exp"), "Container2 no expander is rendered");
				assert.ok(document.getElementById("C3--Exp"), "Container3 expander is rendered");
				fnDone();
			});
		}
	});

	QUnit.test("FormControls Half-Size", function(assert) {
		assert.equal(jQuery("#C2E1_T1").parent().attr("colspan"), "5", "Container2 - Element1: Field 1 rendered over 5 grid cells");
		assert.ok((jQuery("#C3E2_L1").parent().prev().prev().is("td") && jQuery("#C3E2_L1").parent().prev().prev().attr("colspan") == "8" && jQuery("#C3E2_L1").parent().prev().prev().children().length == 0), "Container2 - empty dummy cell rendered");

		assert.equal(jQuery("#C3E1_T1").parent().attr("colspan"), "3", "Container3 - Element1: Field 1 (with hCells=3) rendered over 3 grid cells");
		assert.equal(jQuery("#C3E1_T2").parent().attr("colspan"), "2", "Container3 - Element1: Field 2 (with hCells=auto) rendered over 2 grid cells");
		assert.equal(jQuery("#C3E2_L1").parent().attr("colspan"), "8", "Container3 - Element2: Label (with hCells=full) rendered over 8 grid cells");
		assert.equal(jQuery("#C3E2_T1").parent().attr("colspan"), "8", "Container3 - Element2: Field 1 (with hCells=full) rendered over 8 grid cells");

		assert.equal(jQuery("#C5E1_T1").parent().attr("rowspan"), "2", "Container5 - Element1: Field 1 (with vCells=2, hCells=full) rendered with rowspan 2");
		assert.equal(jQuery("#C5E1_T1").parent().prev().prev().children().first().attr("id"), "C4E2_T1", "Container4 -Element2: rendered beside full size field");
		assert.equal(jQuery("#C5E1_T1").parent().parent().next().children().first().next().children().first().attr("id"), "C4E3_T1", "Container4 -Element3: rendered beside full size field in second row");
		assert.equal(jQuery("#C5E1_T1").parent().parent().next().children().length, 3, "Container5 - Element1: no cell used in second row of full size field with vCells=2");
		assert.equal(jQuery("#C4E4_T1").parent().attr("rowspan"), "2", "Container4 - Element4: Field 1 (with vCells=2, hCells=5) rendered with rowspan 2");
		assert.equal(jQuery("#C4E4_T1").parent().next().next().next().children().first().attr("id"), "C5E2_T1", "Container5 -Element2: rendered beside full size field");
		assert.equal(jQuery("#C4E4_T1").parent().parent().next().children().length, 3, "Container5 - Element3: dummy cell rendered for dummy element");
		assert.equal(jQuery("#C4E5_T1").parent().attr("rowspan"), "2", "Container4 - Element5: Field 1 (with vCells=2, hCells=2) rendered with rowspan 2");
		assert.equal(jQuery("#C4E5_T1").parent().parent().next().children().length, 4, "Container4 - Element6: dummy cell rendered for dummy element");
		assert.equal(jQuery("#C4E5_T1").parent().parent().next().next().children().first().next().children().first().attr("id"), "C4E7_T1", "Container5 -Element7: rendered in new line");


		assert.equal(jQuery("#C6E1_I1").parent().attr("colspan"), "2", "Container6 - Element1: Field 1 (with hCells=2) rendered over 2 grid cells");
		assert.ok((jQuery("#C6E1_I1").parent().next().next().next().is("td") && jQuery("#C6E1_I1").parent().next().next().next().attr("colspan") == "8" && jQuery("#C6E1_I1").parent().next().next().next().children().length == 0), "Container6 - empty dummy cell rendered beside (because no second half-size container in row)");
		assert.ok(jQuery("#C6E1_I1").get(0).style.width != "100%", "Container6 - Element1: Image not rendered width = 100%");

		assert.ok(!document.getElementById("C6E3_T1"), "Content of invisible Element is not rendered");
	});

	QUnit.module("Interaction");

	QUnit.test("Container expander", function(assert) {
		//expander function
		var oContainer = sap.ui.getCore().byId("C3");
		qutils.triggerMouseEvent("C3--Exp", "click");
		sap.ui.getCore().applyChanges();
		assert.ok(!document.getElementById("C3E1_T1"), "Container3 content area is not visible after click on expander");
		assert.ok((jQuery("#C2E1_T1").parent().next().next().is("td") && jQuery("#C2E1_T1").parent().next().next().attr("colspan") == "8" && jQuery("#C2E1_T1").parent().next().next().children().length == 0), "Container3 - empty dummy cell rendered");
		assert.ok(!(jQuery("#C2E1_L1").parent().parent().next().children().first().is("td") && jQuery("#C2E1_L1").parent().parent().next().children().first().attr("colspan") == "8" && jQuery("#C2E1_L1").parent().parent().next().children().first().children().length == 0), "Container2 - NO empty dummy cell rendered");
		assert.equal(oContainer.getExpanded(), false, "Container3 getExpanded()");
	});

	QUnit.test("change LayoutData", function(assert) {
		var oControl = sap.ui.getCore().byId("F3C3E2_T1");
		assert.ok(!oControl.getLayoutData(), "Field initial has no LayoutData");
		assert.equal(jQuery("#F3C3E2_T1").parent().attr("colspan"), "8", "Field initial without LayoutData - colspan 8");
		var oLayoutData = new GridElementData({hCells: "3"});
		oControl.setLayoutData(oLayoutData);
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#F3C3E2_T1").parent().attr("colspan"), "3", "Field after setting LayoutData - colspan 3");
		oLayoutData.setHCells("4");
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#F3C3E2_T1").parent().attr("colspan"), "4", "Field after changing LayoutData - colspan 4");
		oControl.setLayoutData(null);
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#F3C3E2_T1").parent().attr("colspan"), "8", "Field after deleting LayoutData - colspan 8");
		oLayoutData = new VariantLayoutData({
			multipleLayoutData: [new GridContainerData(), // just to test multiple layout data
								 new GridElementData({hCells: "3"})]});
		oControl.setLayoutData(oLayoutData);
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#F3C3E2_T1").parent().attr("colspan"), "3", "Field after setting multiple LayoutData - colspan 3");
		oControl.setLayoutData(null);
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#F3C3E2_T1").parent().attr("colspan"), "8", "Field after deleting multiple LayoutData - colspan 8");
	});

	QUnit.test("Keyboard Navigation", function(assert) {
		jQuery("#C1E1_T1").trigger("focus");
		assert.equal(jQuery("#C1E1_T1").is(":focus"), true, "Mouseclick: Container 1, Element 1, Field 1 - Selected");
		qutils.triggerKeyboardEvent("C1E1_T1", "ARROW_DOWN");
		assert.equal(jQuery("#C1E2_T1").is(":focus"), true, "Arrow Down: Container 1, Element 2, Field 1 - Selected");
		qutils.triggerKeyboardEvent("C1E2_T1", "ARROW_RIGHT");
		assert.equal(jQuery("#C1E2_T2").is(":focus"), true, "Arrow Right: Container 1, Element 2, Field 2 - Selected");
		qutils.triggerKeyboardEvent("C1E2_T2", "ARROW_DOWN");
		assert.equal(jQuery("#C1E3_T2").is(":focus"), true, "Arrow Down: Container 1, Element 3, Field 2 - Selected");
		qutils.triggerKeyboardEvent("C1E3_T2", "ARROW_RIGHT");
		assert.equal(jQuery("#C1E3_T3").is(":focus"), true, "Arrow Right: Container 1, Element 3, Field 3 - Selected");
		qutils.triggerKeyboardEvent("C1E3_T3", "ARROW_UP");
		assert.equal(jQuery("#C1E2_T2").is(":focus"), true, "Arrow Up: Container 1, Element 2, Field 2 - Selected");
		qutils.triggerKeyboardEvent("C1E2_T2", "ARROW_LEFT");
		assert.equal(jQuery("#C1E2_T1").is(":focus"), true, "Arrow Left: Container 1, Element 2, Field 1 - Selected");
		qutils.triggerKeyboardEvent("C1E2_T1", "F6");
		assert.equal(jQuery("#C2E1_T1").is(":focus"), true, "F6: Container 2, Element 1, Field 1 - Selected");
		qutils.triggerKeyboardEvent("C2E1_T1", "F6", true, false, false);
		assert.equal(jQuery("#C1E1_T1").is(":focus"), true, "Shift + F6: Container 1, Element 1, Field 1 - Selected");
		qutils.triggerKeyboardEvent("C1E1_T1", "END", false, false, true);
		assert.equal(jQuery("#C7E6_T1").is(":focus"), true, "Ctrl + End: Container 7, Element 6, Field 1 - Selected");
		qutils.triggerKeyboardEvent("C7E6_T1", "HOME");
		assert.equal(jQuery("#C7E1_T1").is(":focus"), true, "HOME: Container 7, Element 1, Field 1 - Selected");
		qutils.triggerKeyboardEvent("C7E1_T1", "F6");
		assert.equal(jQuery("#C1E1_T1").is(":focus"), false, "F6: Container 1, Element 1, Field 1 - NOT Selected (No cycling!)");
		jQuery("#C1E1_T1").trigger("focus");
		qutils.triggerKeyboardEvent("C1E1_T1", "F6");
		assert.equal(jQuery("#C2E1_T1").is(":focus"), true, "F6: Container 2, Element 1, Field 1 - Selected");
		qutils.triggerKeyboardEvent("C2E1_T1", "ARROW_RIGHT");
		assert.equal(jQuery("#C4E1_T1").is(":focus"), true, "Arrow Right: Container 4, Element 1, Field 1 - Selected");
		qutils.triggerKeyboardEvent("C4E1_T1", "ARROW_LEFT");
		assert.equal(jQuery("#C2E1_T1").is(":focus"), true, "Arrow Left: Container 2, Element 1, Field 1 - Selected");
		qutils.triggerKeyboardEvent("C2E1_T1", "HOME", false, false, true);
		assert.equal(jQuery("#C1E1_T1").is(":focus"), true, "Ctrl + Home: Container 1, Element 1, Field 1 - Selected");
		qutils.triggerKeyboardEvent("C1E1_T1", "END");
		assert.equal(jQuery("#C1E19_T1").is(":focus"), true, "END: Container 1, Element 19, Field 1 - Selected");
		qutils.triggerKeyboardEvent("C1E19_T1", "HOME");
		qutils.triggerKeyboardEvent("C1E1_T1", "ARROW_DOWN");
		qutils.triggerKeyboardEvent("C1E2_T1", "ARROW_DOWN");
		qutils.triggerKeyboardEvent("C1E3_T1", "ARROW_DOWN");
		qutils.triggerKeyboardEvent("C1E4_T1", "ARROW_DOWN");
		qutils.triggerKeyboardEvent("C1E5_T1", "ARROW_DOWN");
		assert.equal(jQuery("#C1E6_T1").is(":focus"), true, "Home + 5 times Arrow Down: Container 1, Element 6, Field 1 - Selected");
		qutils.triggerKeyboardEvent("C1E6_T1", "ARROW_RIGHT");
		assert.equal(jQuery("#C1E6_T3").is(":focus"), true, "Arrow Right: Container 1, Element 6, Field 3 - Selected");
		qutils.triggerKeyboardEvent("C1E6_T3", "ARROW_RIGHT");
		assert.equal(jQuery("#C1E7_T1").is(":focus"), true, "Arrow Right: Container 1, Element 7, Field 1 - Selected");
		qutils.triggerKeyboardEvent("C1E7_T1", "ARROW_RIGHT");
		assert.equal(jQuery("#C1E7_T2").is(":focus"), true, "Arrow Right: Container 1, Element 7, Field 2 - Selected");
		qutils.triggerKeyboardEvent("C1E7_T2", "ARROW_RIGHT");
		assert.equal(jQuery("#C1E7_T3").is(":focus"), true, "Arrow Right: Container 1, Element 7, Field 3 - Selected");
		qutils.triggerKeyboardEvent("C1E7_T3", "ARROW_LEFT");
		assert.equal(jQuery("#C1E7_T2").is(":focus"), true, "Arrow Left: Container 1, Element 7, Field 2 - Selected");
		qutils.triggerKeyboardEvent("C1E7_T2", "ARROW_LEFT");
		assert.equal(jQuery("#C1E7_T1").is(":focus"), true, "Arrow Left: Container 1, Element 7, Field 1 - Selected");
		qutils.triggerKeyboardEvent("C1E7_T1", "ARROW_LEFT");
		assert.equal(jQuery("#C1E6_T3").is(":focus"), true, "Arrow Left: Container 1, Element 6, Field 3 - Selected");
		qutils.triggerKeyboardEvent("C1E6_T3", "ARROW_LEFT");
		assert.equal(jQuery("#C1E6_T1").is(":focus"), true, "Arrow Left: Container 1, Element 6, Field 1 - Selected");
	});

	QUnit.module("Error handling");

	QUnit.test("too much fields", function(assert) {
		var aLogEntries = Log.getLogEntries();
		var findLogEntry = function(sMessage, iLevel){
			for ( var i = 0; i < aLogEntries.length; i++){
				var oLogEntry = aLogEntries[i];
				if (sMessage == oLogEntry.message && iLevel == oLogEntry.level){
					return true;
				}
			}
			return false;
		};
		assert.ok(document.getElementById("C7E1_T1"), "Element1: TextField1 is rendered");
		assert.ok(!document.getElementById("C7E1_T2"), "Element1: TextField2 is not rendered");
		assert.ok(findLogEntry('Element "C7E1" - Too much fields for one row!',1),"Error entry in log found for Element1");

		var bOK, i;

		bOK = true;
		for ( i = 1; i <= 13; i++){
			if ( !document.getElementById("C7E2_T" + i) ) {
				bOK = false;
			}
		}
		assert.ok(bOK, "Element2: TextFields 1-13 are rendered");

		bOK = true;
		for ( i = 14; i <= 15; i++){
			if ( document.getElementById("C7E2_T" + i) ) {
				bOK = false;
			}
		}
		assert.ok(bOK, "Element2: TextFields 14-15 are not rendered");
		assert.ok(findLogEntry('Element "C7E2" - Too much fields for one row!',1),"Error entry in log found for Element2");

		assert.ok(document.getElementById("C7E3_T1"), "Element3: TextField1 is rendered");
		assert.ok(document.getElementById("C7E3_T2"), "Element3: TextField2 is rendered");
		assert.ok(!document.getElementById("C7E3_T3"), "Element3: TextField3 is not rendered");
		assert.ok(findLogEntry('Element "C7E3" - Too much fields for one row!',1),"Error entry in log found for Element3");


		assert.ok(document.getElementById("C7E4_T1"), "Element4: TextField1 is rendered");
		assert.equal(jQuery("#C7E4_T1").parent().attr("rowspan"), "2", "Element4: Field 1 (with vCells=2) rendered with rowspan 2");
		assert.ok(!document.getElementById("C7E5_T1"), "Element5: TextField1 (full size) is not rendered");
		assert.ok(findLogEntry('Element "C7E5" - Too much fields for one row!',1),"Error entry in log found for Element5");
	});

	QUnit.test("More hCells than Elements", function(assert) {
		assert.equal(jQuery("#C6E2_T1").parent().attr("rowspan"), "3", "Container6 - Element2: Field 1 (with vCells=2, hCells=3) rendered with rowspan 3");
		assert.equal(jQuery("#C6E2_T1").parent().parent().next().children().length, 0, "Container6 - Element2: first dummy row to fill up rowspan");
		assert.equal(jQuery("#C6E2_T1").parent().parent().next().next().children().length, 0, "Container6 - Element2: second dummy row to fill up rowspan");

		assert.equal(jQuery("#C7E6_T1").parent().attr("rowspan"), "3", "Container7 - Element6: Field 1 (with vCells=2, hCells=3) rendered with rowspan 3");
		assert.equal(jQuery("#C7E6_T1").parent().parent().next().children().length, 0, "Container7 - Element6: first dummy row to fill up rowspan");
		assert.equal(jQuery("#C7E6_T1").parent().parent().next().next().children().length, 0, "Container7 - Element6: second dummy row to fill up rowspan");
	});
});