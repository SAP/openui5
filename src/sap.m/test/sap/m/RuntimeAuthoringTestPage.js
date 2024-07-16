// Create the FakeLrep with localStorage
sap.ui.define(["sap/ui/rta/RuntimeAuthoring", "sap/ui/core/UIComponent", "sap/m/App", "sap/m/Page", "sap/m/Text", "sap/m/Bar", "sap/m/ListBase", "sap/m/CustomListItem", "sap/m/Switch", "sap/m/StandardListItem", "sap/m/InputListItem", "sap/ui/layout/VerticalLayout", "sap/m/Label", "sap/m/RadioButton", "sap/m/CheckBox", "sap/m/RatingIndicator", "sap/m/Button", "sap/m/Input", "sap/m/MultiInput", "sap/ui/layout/HorizontalLayout", "sap/ui/layout/form/Form", "sap/ui/core/Title", "sap/ui/layout/form/ResponsiveLayout", "sap/ui/layout/form/FormContainer", "sap/ui/layout/form/FormElement", "sap/m/Toolbar", "sap/m/OverflowToolbar", "sap/m/OverflowToolbarLayoutData", "sap/m/library", "sap/m/ScrollContainer", "sap/m/Title", "sap/m/Panel", "sap/m/Slider", "sap/ui/layout/Grid", "sap/m/Table", "sap/m/Column", "sap/m/ColumnListItem", "sap/ui/core/ComponentContainer"], function(RuntimeAuthoring, UIComponent, App, Page, Text, Bar, ListBase, CustomListItem, Switch, StandardListItem, InputListItem, VerticalLayout, Label, RadioButton, CheckBox, RatingIndicator, Button, Input, MultiInput, HorizontalLayout, Form, Title, ResponsiveLayout, FormContainer, FormElement, Toolbar, OverflowToolbar, OverflowToolbarLayoutData, mobileLibrary, ScrollContainer, MTitle, Panel, Slider, Grid, Table, Column, ColumnListItem, ComponentContainer) {
	"use strict";
	undefined/*FakeLrepConnectorLocalStorage*/.enableFakeConnector();
});

var MyComponent = UIComponent.extend("MyComponent", {
	createContent: function () {
		return new App("myApp", {
			pages: [new Page({
				id: "idMain1", content: [
					new Page("page1", {
						title: "Page Title",
						headerContent: [
							new Text({id: "text1", text: "HeaderTitle"}),
							new Text({id: "text2", text: "text2"}),
							new Text({id: "text3", text: "text3"})
						],
						subHeader: new Bar({
							id: "bar0",
							contentLeft: [
								new Text({id: "text4", text: "SubHeader"}),
								new Text({id: "text5", text: "Left"}),
								new Text({id: "text6", text: "text6"})
							],
							contentMiddle: [
								new Text({id: "text7", text: "text7"}),
								new Text({id: "text8", text: "Middle"}),
								new Text({id: "text9", text: "text9"})
							],
							contentRight: [
								new Text({id: "text10", text: "text10"}),
								new Text({id: "text11", text: "Right"}),
								new Text({id: "text12", text: "text12"})
							]
						})
						,
						content: [
							new ListBase({
								id: "list",
								headerText: "List",
								items: [
									new CustomListItem({
										id: "customListItem1",
										content: [
											new Text({id:"textInListItem1", text:"Custom List Item"}),
											new Switch({id:"switchInListItem"})
										]
									}),
									new StandardListItem({id: "standardListItem1", title: "Item 1", description: "Standardlistitem description"}),
									new InputListItem({
										id: "listItem1",
										label: "Item 1",
										content: [
											new Switch({id: "inputInListItem2"})
										]
									}),
									new StandardListItem({id: "standardListItem2", title: "Item 2"}),
									new StandardListItem({id: "standardListItem3", title: "Item 3"})
								]
							}),
							new VerticalLayout({
								id: "verticalLayout",
								content: [
									new Label({id: "labelInvisible", visible: false, text: "Not Visible"}),
									new Label({id: "labelOutsideForm", text: "Label Outside Form"}),
									new RadioButton({id: "btn1", text: "Button1"}),
									new CheckBox({id:"checkbox1", text: "CheckBox1"}),
									new RatingIndicator("ratingIndicator", { iconSize: "1rem", value: 2.5 }),
									new Button({id: "btn2", text: "Button2"}),
									new Label({id: "labelForInput", text: "Input", labelFor: "input1"}),
									new Input({id: "input1"}),
									new Label({id: "labelForMultiInput", text: "MultiInput", labelFor: "multiinput1"}),
									new MultiInput({id: "multiinput1"}),
									new VerticalLayout({
										id: "verticalLayout2",
										content: [
											new Button({id: "btn3", text: "V2Button3"}),
											new Button({id: "btn4", text: "V2Button4"})
										]
									}),
									new HorizontalLayout({
										id: "verticalLayout3",
										content: [
											new Button({id: "btn5", text: "HButton5"}),
											new Button({id: "btn6", text: "HButton6"})
										]
									})
								]
							}),
							new Form("F1",{
								title: new Title({text: "Form Title", tooltip: "Title tooltip"}),
								tooltip: "Form tooltip",
								editable: true,
								layout: new ResponsiveLayout(),
								formContainers: [
									new FormContainer("C1", {
										title: "contact data",
										formElements: [
											new FormElement("F1C1E1", {
												label: "Name",
												fields: [new Input({value: "Name", required: true})]
											}),
											new FormElement({
												label: "First name",
												fields: [new Input()]
											})
										]
									})
								]
							}),
							new VerticalLayout({id: "justTest"}),
							new VerticalLayout({id: "justTest2"}),
							new Toolbar({
								id: "toolbar0",
								content: [
									new Text({id: "text13", text: "Text13"}),
									new Text({id: "text14", text: "Text14"}),
									new Text({id: "text15", text: "Text15"})
								]
							}),
							new Bar({
								id: "bar2",
								contentLeft: [
									new Text({id: "text16", text: "SubHeader"}),
									new Text({id: "text17", text: "Left"}),
									new Text({id: "text18", text: "text18"})
								],
								contentMiddle: [
									new Text({id: "text19", text: "text19"}),
									new Text({id: "text20", text: "Middle"}),
									new Text({id: "text21", text: "text21"})
								],
								contentRight: [
									new Text({id: "text22", text: "text22"}),
									new Text({id: "text23", text: "Right"}),
									new Text({id: "text24", text: "text24"})
								]
							}),
							new OverflowToolbar({
								id: "overflowToolbar0",
								content: [
									new Button({id: "btn7", text: "Btn7"}),
									new Button({id: "btn8", text: "Btn8"}),
									new Button({
										id: "btn9",
										text: "Btn9",
										layoutData: new OverflowToolbarLayoutData({
											priority: OverflowToolbarPriority.AlwaysOverflow
										})
									})
								]
							}),
							new ScrollContainer({
								id: "scrollContainer",
								content: [
									new MTitle({id: "title1", text: "Scroll Container"}),
									new Text({id: "text25", text: "text25"}),
									new Text({id: "text26", text: "text26"}),
									new Text({id: "text27", text: "text27"}),
									new Button({id: "btn10", text: "Btn10"})
								]
							}),
							new Panel({
								id: "myPanel",
								headerText: "My Panel Header Text",
								content: [
									new Text({id: "text28", text: "PanelContentText1"}),
									new Text({id: "text29", text: "PanelContentText2"}),
									new Text({id: "text30", text: "PanelContentText3"})
								]
							}),
							new Panel({
								id: "myPanel2",
								headerText: "My Panel Header Text",
								expandable: true,
								expanded: true,
								content: [
									new Text({id: "text31", text: "PanelContentText1"}),
									new Text({id: "text32", text: "PanelContentText2"}),
									new Text({id: "text33", text: "PanelContentText3"})
								],
								headerToolbar: new Toolbar({
									id: "headerToolbar2",
									content: [
										new MTitle({id: "text34", text: "HeaderToolbarContentTitle1"}),
										new Text({id: "text35", text: "HeaderToolbarContentText1"}),
										new Text({id: "text36", text: "HeaderToolbarContentText2"})
									]
								}),
								infoToolbar: new Toolbar({
									id: "infoToolbar2",
									content: [
										new Text({id: "text37", text: "InfoToolbarContentText1"}),
										new Text({id: "text38", text: "InfoToolbarContentText2"}),
										new Text({id: "text39", text: "InfoToolbarContentText3"})
									]
								})
							}),
							new Panel({
								id: "myPanel3",
								headerText: "My Panel Header Text",
								content: [
									new Text({id: "text40", text: "PanelContentText1"}),
									new Text({id: "text41", text: "PanelContentText2"}),
									new Text({id: "text42", text: "PanelContentText3"})
								],
								headerToolbar: new Toolbar({
									id: "headerToolbar3",
									content: [
										new MTitle({id: "text43", text: "HeaderToolbarContentTitle1"}),
										new Text({id: "text44", text: "HeaderToolbarContentText1"}),
										new Text({id: "text45", text: "HeaderToolbarContentText2"})
									]
								}),
								infoToolbar: new Toolbar({
									id: "infoToolbar3",
									content: [
										new Text({id: "text46", text: "InfoToolbarContentText1"}),
										new Text({id: "text47", text: "InfoToolbarContentText2"}),
										new Text({id: "text48", text: "InfoToolbarContentText3"})
									]
								})
							}),
							new Slider({
								id: "mySlider1"
							}),
							new Grid({
								id: "grid",
								content: [
									new MTitle({id: "text49", text: "Grid"}),
									new Text({id: "text50", text: "text25"}),
									new Text({id: "text51", text: "text26"}),
									new Text({id: "text52", text: "text27"}),
									new Button({id: "btn11", text: "Btn11"})
								]
							}),
							new Table({
								id: "table1",
								inset: false,
								columns: [
									new Column({
										id: "column1",
										header: new Text({id: "text53", text: "Header 1"})
									}),
									new Column({
										id: "column2",
										minScreenWidth: "Desktop",
										header: new Text({id: "text54", text: "Header 2"}),
										demandPopin: true
									}),
									new Column({
										id: "column3",
										header: new Text({id: "text55", text: "Header 3"})
									})
								],
								items: [
									new ColumnListItem({
										id: "columnListItem1",
										cells: [
											new Text({id: "text56", text: "text11"}),
											new Text({id: "text57", text: "text12"}),
											new Text({id: "text58", text: "text13"})
										]
									}),
									new ColumnListItem({
										id: "columnListItem2",
										cells: [
											new Text({id: "text59", text: "text21"}),
											new Text({id: "text60", text: "text22"}),
											new Text({id: "text61", text: "text23"}),
										]
									})
								]
							})
						],
						footer: new Bar({
							id: "bar1",
							contentLeft: [
								new Button({
									id: "addapt",
									text: "Adapt UI",
									press: function () {
										var oRta = new RuntimeAuthoring({
											rootControl: sap.ui.getCore().byId("idMain1")/*Not inside AMD call*/
										});
										oRta.attachStop(function() {
											oRta.destroy();
										})
										oRta.start();
									}
								}),
								new Button({id: "test", text: "test"})
							]
						})
					})
				]
			})]
		});
	}
});

new ComponentContainer({
	component: new MyComponent({id: "Comp1"})
}).placeAt("content");