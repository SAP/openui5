sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/HTML",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Button",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/ToggleButton",
	"sap/m/CheckBox",
	"sap/m/Input",
	"sap/m/Text",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/Label",
	"sap/m/Slider",
	"sap/m/DatePicker",
	"sap/m/SearchField",
	"sap/m/Select",
	"sap/m/Toolbar",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Panel",
	"sap/m/Link",
	"sap/m/MessageItem",
	"sap/m/MessagePopover",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/m/Bar",
	"sap/m/Dialog",
	"sap/m/Title",
	"sap/m/TextArea",
	"sap/m/MessageStrip",
	"sap/ui/core/Icon",
	"sap/ui/core/Item",
	"sap/ui/core/Title",
	"sap/ui/core/library",
	"sap/m/library",
	"sap/ui/core/IconPool",
	"sap/ui/core/Popup",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/layout/Splitter",
	"sap/m/FlexBox",
	"sap/ui/thirdparty/jquery"
], function (
	JSONModel,
	HTML,
	App,
	Page,
	Button,
	SegmentedButton,
	SegmentedButtonItem,
	ToggleButton,
	CheckBox,
	Input,
	Text,
	List,
	StandardListItem,
	Label,
	Slider,
	DatePicker,
	SearchField,
	Select,
	Toolbar,
	Table,
	Column,
	ColumnListItem,
	Panel,
	Link,
	MessageItem,
	MessagePopover,
	MessageToast,
	MessageBox,
	Bar,
	Dialog,
	Title,
	TextArea,
	MessageStrip,
	Icon,
	Item,
	coreTitle,
	coreLibrary,
	mLibrary,
	IconPool,
	Popup,
	SimpleForm,
	Splitter,
	FlexBox,
	jQuery
) {
	"use strict";
	var app = new App("myApp", {initialPage: "page1"});
	var _buttonWidth = "300px";
	var dynamicContentDialogData = {
		isVisible : false
	};

	var model = new JSONModel();
	model.setData(dynamicContentDialogData);

	var oDialogWithHeaderAndSubHeader = new Dialog({
		title: "Header",
		showHeader: true,
		subHeader: new Bar({
			contentMiddle: [
				new Text({
					text: "Subheader ..."
				})
			]
		}),
		icon: "sap-icon://employee",
		ariaDescribedBy: "p1",
		content: [
			new HTML({content: '<p id="p1" style="margin:0; padding: 16px;">Do you want to start a new world domination campaign?</p>'})
		]
	});

	var oButtonToOpenDialogWithHeaderAndSubHeader = new Button({
			text: "With Header and Subheader",
			press: function () {
				oDialogWithHeaderAndSubHeader.open();
			}
		});

		var oButtonToOpenDialogWithHeaderAndSubHeaderDragResize = new Button({
			text: "With Header and Subheader Drag And Resize",
			press: function () {
				oDialogResizeAndDragSubheader.open();
			}
		});

	var oDialog1 = new Dialog("dialog1", {
		title: "World Domination",
		icon: "sap-icon://employee",
		ariaDescribedBy: "p1",
		state: coreLibrary.ValueState.Warning,
		content: [
			new HTML({content: '<p id="p1" style="margin:0; padding: 16px;">Do you want to start a new world domination campaign?</p>'})
		],
		buttons: [
			new Button("closeWarningDialog", {
				text: "Accept",
				press: function () {
					oDialog1.close();
				}
			}),
			new Button({
				text: "Reject",
				icon: "sap-icon://employee",
				press: function () {
					oDialog1.close();
				}
			})
		]
	});

	var oDialogPadding;
	var aButtons = [
		new Button({
			text: "Hide header",
			press: function () {
				oDialogPadding.setShowHeader(false);
			}
		}),
		new Button({
			text: "Hide footer",
			press: function () {
				oDialogPadding.removeAllButtons();
			}
		}),
		new Button({
			text: "Close",
			press: function () {
				oDialogPadding.close();
			}
		})
	];
	oDialogPadding = new Dialog({
		title: "Default Padding",
		icon: "sap-icon://employee",
		ariaDescribedBy: "p1",
		afterClose: function () {
			aButtons.forEach(function (oButton) {
				oDialogPadding.addButton(oButton);
			});
			oDialogPadding.setShowHeader(true);
			oDialogPadding.removeStyleClass("sapUiContentPadding sapUiResponsiveContentPadding");
		},
		content: [
			new List({
				items: [
					new StandardListItem({
						title: "Item 1",
						description: "item 1"
					}),
					new StandardListItem({
						title: "Item 2",
						description: "item 2"
					}),
					new StandardListItem({
						title: "Item 3",
						description: "item 3"
					})
				]
			})
		],
		buttons: aButtons
	});

	var oDialogErrorState = new Dialog("dialogErrorState", {
		title: "Error",
		ariaDescribedBy: "p1",
		state: coreLibrary.ValueState.Error,
		content: [
			new HTML({content: '<p id="p1" style="margin:0; padding: 16px;">Cannot start!</p>'})
		],
		buttons: [
			new Button({
				id: 'oDialogErrorStateOKButton',
				text: "OK",
				press: function () {
					oDialogErrorState.close();
				}
			})
		]
	});

	var oDialogSuccessState = new Dialog("dialogSuccessState", {
		title: "Success",
		ariaDescribedBy: "p1",
		state: coreLibrary.ValueState.Success,
		content: [
			new HTML({content: '<p id="p1" style="margin:0; padding: 16px;">Started</p>'})
		],
		buttons: [
			new Button({
				id: 'oDialogSuccessStateOKButton',
				text: "OK",
				press: function () {
					oDialogSuccessState.close();
				}
			})
		]
	});

	var oDialogInformationState = new Dialog("dialogInformationState", {
		title: "Information",
		ariaDescribedBy: "p1",
		state: coreLibrary.ValueState.Information,
		content: [
			new HTML({content: '<p id="p1" style="margin:0; padding: 16px;">Information!!</p>'})
		],
		buttons: [
			new Button({
				id: 'oDialogInformationStateOKButton',
				text: "OK",
				press: function () {
					oDialogInformationState.close();
				}
			})
		]
	});

	var oCustomHeader = new Bar("customHeader", {
		contentLeft: [new Icon("myAppIcon", {src: "sap-icon://manager"}),
			new Label("IconHeader", {text: "Icon Header"})],
		contentMiddle: [],
		contentRight: []
	});

	var oDialog2 = new Dialog("dialog2", {
		title: "Vacation Form",
		showHeader: true,
		customHeader: oCustomHeader,
		stretch: true,
		subHeader: new Bar({
			contentMiddle: [
				new SearchField({
					placeholder: "Search ...",
					width: "100%"
				})
			]
		}),
		icon: IconPool.getIconURI("employee"),
		content: [
			new HTML({content: '<h1 style="margin: 0; padding: 0;">Want to go on vacation?</h1>'}),
			new Label({text: "How many days?"}),
			new Slider({
				value: 5,
				min: 1,
				max: 30,
				width: "100%",
				progress: true
			}),
			new Label({text: "Starting on"}),
			new DatePicker("startDate", {
				width: "150px"
			}),
			new Label({text: "E-mail address for confirmation"}),
			new DatePicker({
				width: "150px"
			}),
			new Label({text: "Starting on"}),
			new DatePicker({
				width: "150px"
			}),
			new Label({text: "E-mail address for confirmation"}),
			new Input({type: mLibrary.InputType.Email, placeholder: "E-mail"}),
			new Label({text: "Starting on"}),
			new DatePicker({
				width: "150px"
			}),
			new Label({text: "E-mail address for confirmation"}),
			new Input({type: mLibrary.InputType.Email, placeholder: "E-mail"}),
			new Label({text: "Starting on"}),
			new DatePicker({
				width: "150px"
			}),
			new Label({text: "E-mail address for confirmation"}),
			new Input({type: mLibrary.InputType.Email, placeholder: "E-mail"}),
			new Label({text: "Starting on"}),
			new DatePicker({
				width: "800px"
			}),
			new Label({text: "E-mail address for confirmation"}),
			new Input({type: mLibrary.InputType.Email, placeholder: "E-mail"})
		],
		beginButton: new Button({
			text: "Submit",
			type: mLibrary.ButtonType.Accept,
			press: function () {
				oDialog2.close();
			}
		}),
		endButton: new Button({
			text: "Cancel",
			type: mLibrary.ButtonType.Reject,
			press: function () {
				oDialog2.close();
			}
		})
	});

	var oMessageDialog1 = new Dialog("messageDialog1", {
		title: "Important Message",
		content: [
			new Text({
				text: "This message needs to be delivered, I need to make this message longer! This message needs to be delivered, I need to make this message longer! This message needs to be delivered, I need to make this message longer!",
				wrapping: true
			})
		],
		beginButton: new Button({
			text: "Accept",
			type: mLibrary.ButtonType.Accept,
			press: function () {
				oMessageDialog1.close();
			}
		}),
		endButton: new Button({
			text: "Reject",
			type: mLibrary.ButtonType.Reject,
			press: function () {
				oMessageDialog1.close();
			}
		}),
		type: mLibrary.DialogType.Message
	});
	var oButton = new Button("button1", {
		text: "Responsive Form in Dialog",
		width: _buttonWidth,
		ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
		press: function () {
			openDialog();
		}
	});

	var oList2 = new List({
		inset: false
	});

	var data = {
		navigation: [{
			title: "Travel Expend",
			description: "Access the travel expend workflow",
			icon: "images/travel_expend.png",
			iconInset: false,
			type: "Navigation",
			press: "detailPage"
		}, {
			title: "Travel and expense report",
			description: "Access travel and expense reports",
			icon: "images/travel_expense_report.png",
			iconInset: false,
			type: "Navigation",
			press: "detailPage"
		}, {
			title: "Travel Request",
			description: "Access the travel request workflow",
			icon: "images/travel_request.png",
			iconInset: false,
			type: "Navigation",
			press: "detailPage"
		}, {
			title: "Work Accidents",
			description: "Report your work accidents",
			icon: "images/wounds_doc.png",
			iconInset: false,
			type: "Navigation",
			press: "detailPage"
		}, {
			title: "Travel Settings",
			description: "Change your travel worflow settings",
			icon: "images/settings.png",
			iconInset: false,
			type: "Navigation",
			press: "detailPage"
		}]
	};

	var oItemTemplate1 = new StandardListItem({
		title: "{title}",
		description: "{description}",
		icon: "{icon}",
		iconInset: "{iconInset}",
		type: "{type}"
	});

	function bindListData(data, itemTemplate, list) {
		var oModel = new JSONModel();
		// set the data for the model
		oModel.setData(data);
		// set the model to the list
		list.setModel(oModel);

		// bind Aggregation
		list.bindAggregation("items", "/navigation", itemTemplate);
	}

	bindListData(data, oItemTemplate1, oList2);

	var oListDialog = new Dialog({
		title: "Important Message",
		contentWidth: "200px",
		content: [
			oList2
		],
		beginButton: new Button({
			text: "Accept",
			type: mLibrary.ButtonType.Accept,
			press: function () {
				oListDialog.close();
			}
		}),
		endButton: new Button({
			text: "Reject",
			type: mLibrary.ButtonType.Reject,
			press: function () {
				oListDialog.close();
			}
		})
	});

	var oButton2 = new Button("listInDialogButton", {
		text: "List in Dialog",
		width: _buttonWidth,
		ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
		press: function () {
			oListDialog.open();
		}
	});

	var oTextAreaDialog = new Dialog('textAreaDialog', {
		title: "Dialog with TextArea",
		contentWidth: "200px",
		content: new TextArea({cols: 60}),
		beginButton: new Button('textareaDialogCloseButton', {
			text: "Close",
			press: function () {
				oTextAreaDialog.close();
			}
		})
	});

	var oButton4 = new Button({
		text: "SearchField in Dialog",
		width: _buttonWidth,
		press: function () {
			oDialogWithSF.open();
		}
	});

	var oDialogWithSF = new Dialog({
		title: "Dialog with SF",
		subHeader: new Bar({
			contentMiddle: new SearchField()
		}),
		content: new HTML({
			content: '<div style="width: 30px; height: 1000px;">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci animi assumenda autem corporis cupiditate dicta dolores enim est eveniet laborum magnam magni maxime mollitia nostrum odit quasi, sunt! Nemo, sapiente.Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci animi assumenda autem corporis cupiditate dicta dolores enim est eveniet laborum magnam magni maxime mollitia nostrum odit quasi, sunt! Nemo, sapiente.Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci animi assumenda autem corporis cupiditate dicta dolores enim est eveniet laborum magnam magni maxime mollitia nostrum odit quasi, sunt! Nemo, sapiente.</div>'
		}),
		contentWidth: "40rem",
		contentHeight: "250px",
		beginButton: new Button({
			text: "Close",
			press: function () {
				oDialogWithSF.close();
			}
		})
	});

	var oDialogWithResponsivePadding = new Dialog("dialogResponsivePadding", {
		title: "Dialog with Responsive Padding",
		resizable: true,
		content: new Text({ text: "Only on SAP Quartz and Horizon themes." }).addStyleClass("sapUiSmallMarginTop"),
		beginButton: new Button("dialogResponsivePaddingOKButton", {
			text: "OK",
			press: function () {
				oDialogWithResponsivePadding.close();
			}
		}),
		endButton: new Button({
			text: "Close",
			press: function () {
				oDialogWithResponsivePadding.close();
			}
		})
	});
	oDialogWithResponsivePadding.addStyleClass("sapUiResponsivePadding--content sapUiResponsivePadding--header sapUiResponsivePadding--footer");

	var oDialogWithSelect = new Dialog({
		title: "Dialog with Select",
		content: new Select({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),
				new Item({
					key: "1",
					text: "item 1"
				}),
				new Item({
					key: "2",
					text: "item 2"
				}),
				new Item({
					key: "3",
					text: "item 3"
				})
			]
		}),
		contentWidth: "30em",
		contentHeight: "25%",
		beginButton: new Button({
			press: function () {
				oDialogWithSelect.close();
			},
			text: "Close"
		})
	});

	var oButton5 = new Button({
		text: "Select in Dialog",
		width: _buttonWidth,
		ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
		press: function () {
			oDialogWithSelect.open();
		}
	});

	var oButton6 = new Button({
		text: "w: 35rem, h: 25%",
		width: _buttonWidth,
		ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
		press: function () {
			oDialogWithSelect.open();
		}
	});

	function openDialog() {
		var oDialog1 = new Dialog({contentWidth: "500px"});
		oDialog1.setTitle("Dialog with a Responsive Form inside");

		var oTitle = new coreTitle({text: "Title"});
		var oLabel = new Label({text: "label 1"});
		var oText = new Text({text: " text1"});

		var oLabel2 = new Label({text: "label 2"});
		var oText2 = new Text({text: " text2"});

		var oSimpleForm = new SimpleForm({
			maxContainerCols: 3,
			editable: false,
			content: [oTitle,
				oLabel,
				oText,
				oLabel2,
				oText2]
		});

		var oButton = new Button({
			text: "Close",
			press: function () {
				oDialog1.destroy();
			}
		});
		oDialog1.setBeginButton(oButton);

		var oButton2 = new Button({text: "Does nothing"});
		oDialog1.setEndButton(oButton2);


		oDialog1.addContent(oSimpleForm);
		oDialog1.open();
	}

	//=================================================================

	var oDialogDrag = new Dialog({
		title: "Drag Dialog",
		draggable: true,
		content: new HTML({
			content: '<div>Lipsum limple text</div>'
		}),
		endButton: new Button({
			text: "Cancel", press: function () {
				oDialogDrag.close();
			}
		})
	});

	var oDialogResize = new Dialog('resizableDialog', {
		title: "Resizable Dialog",
		resizable: true,
		content: [
			new HTML({
				content: '<div>HTML DIV</div>'
			}),
			new Label({text: "sap.m.Select's Label :"}),
			new Select({
				items: [
					new Item({
						key: "0",
						text: "item 0"
					})
				]
			})
		],
		endButton: new Button('resizeDialogCloseButton', {
			text: "Cancel", press: function () {
				oDialogResize.close();
			}
		})
	});

	var oDialogResizeAndDrag = new Dialog({
		title: "Dialog Resize And Drag",
		draggable: true,
		resizable: true,
		content: new HTML({
			content: '<div>Lipsum limple text</div>'
		}),
		endButton: new Button({
			text: "Cancel", press: function () {
				oDialogResizeAndDrag.close();
			}
		})
	});

	var oDialogSimple = new Dialog('simpleDialog', {
		title: "Simple Dialog",
		content: new HTML({
			content: '<div>Lipsum limple text</div>'
		}),
		beginButton: new Button('simpleDialogAcceptButton', {
			text: "Accept", press: function () {
				oDialogSimple.close();
			}
		}),
		endButton: new Button('simpleDialogCancelButton', {
			text: "Cancel", press: function () {
				oDialogSimple.close();
			}
		})
	});

	var oDialogTypeMessage = new Dialog({
		title: "Message Dialog",
		type: mLibrary.DialogType.Message,
		content: new HTML({
			content: '<div>Lipsum limple text</div>'
		}),
		beginButton: new Button({
			text: "Accept", press: function () {
				oDialogTypeMessage.close();
			}
		}),
		endButton: new Button({
			text: "Cancel", press: function () {
				oDialogTypeMessage.close();
			}
		})
	});

	var oDialogTypeMessageWithSize = new Dialog({
		title: "Message Dialog with Size",
		type: mLibrary.DialogType.Message,
		contentWidth: "800px",
		contentHeight: "800px",
		content: new HTML({
			content: '<div>Lipsum limple text</div>'
		}),
		beginButton: new Button({
			text: "Accept", press: function () {
				oDialogTypeMessageWithSize.close();
			}
		}),
		endButton: new Button({
			text: "Cancel", press: function () {
				oDialogTypeMessageWithSize.close();
			}
		})
	});

	var oDialogNoFooter = new Dialog({
		title: "Dialog without Footer",
		content: new HTML({
			content: '<div>Lipsum limple text</div>'
		})
	});

	var oDialogNoHeader = new Dialog('noHeaderDialog', {
		showHeader: false,
		content: new HTML({
			content: '<div>Lipsum limple text</div>'
		}),
		beginButton: new Button({
			text: "Accept", press: function () {
				oDialogNoHeader.close();
			}
		}),
		endButton: new Button('dialogNoHeaderCancelButton', {
			text: "Cancel", press: function () {
				oDialogNoHeader.close();
			}
		})
	});

	var oDialogNoHeaderNoFooter = new Dialog({
		showHeader: false,
		content: new HTML({
			content: '<div>Lipsum limple text</div>'
		})
	});

	var oDialogBigContent = new Dialog({
		title: "Dialog with Big Content",
		content: new HTML({
			content: '<div style="height: 600px; width: 800px;">Lipsum limple text</div>'
		}),
		beginButton: new Button({
			text: "Accept", press: function () {
				oDialogBigContent.close();
			}
		}),
		endButton: new Button({
			text: "Cancel", press: function () {
				oDialogBigContent.close();
			}
		})
	});

	var oDialogLongTitle = new Dialog({
		title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vitae congue diam. Donec venenatis justo sed bibendum finibus.",
		content: new HTML({
			content: '<div>Lipsum limple text</div>'
		}),
		beginButton: new Button({
			text: "Accept", press: function () {
				oDialogLongTitle.close();
			}
		}),
		endButton: new Button({
			text: "Cancel", press: function () {
				oDialogLongTitle.close();
			}
		})
	});

	var oDialogWithHeight = new Dialog({
		title: "Dialog with Set Height",
		contentHeight: "500px",
		content: new HTML({
			content: '<div>Lipsum limple text</div>'
		}),
		beginButton: new Button({
			text: "Accept", press: function () {
				oDialogWithHeight.close();
			}
		}),
		endButton: new Button({
			text: "Cancel", press: function () {
				oDialogWithHeight.close();
			}
		})
	});

	var oDialogWithWidth = new Dialog({
		title: "Dialog with Set Width",
		contentWidth: "500px",
		content: new HTML({
			content: '<div>Lipsum limple text</div>'
		}),
		beginButton: new Button({
			text: "Accept", press: function () {
				oDialogWithWidth.close();
			}
		}),
		endButton: new Button({
			text: "Cancel", press: function () {
				oDialogWithWidth.close();
			}
		})
	});

	var oDialogWithWidthAndHeight = new Dialog({
		title: "Dialog with Set Width and Height",
		contentWidth: "500px",
		contentHeight: "500px",
		content: new HTML({
			content: "<div>Lipsum limple text</div>"
		}),
		beginButton: new Button({
			text: "Accept", press: function () {
				oDialogWithWidthAndHeight.close();
			}
		}),
		endButton: new Button({
			text: "Cancel", press: function () {
				oDialogWithWidthAndHeight.close();
			}
		})
	});

	var oDialogWithWidthHeightAndBigContent = new Dialog({
		title: "Dialog with Set Width, Height and Big Content",
		contentWidth: "500px",
		contentHeight: "500px",
		content: new HTML({
			content: '<div style="width: 1000px; height: 1000px;">Lipsum limple text</div>'
		}),
		beginButton: new Button({
			text: "Accept", press: function () {
				oDialogWithWidthHeightAndBigContent.close();
			}
		}),
		endButton: new Button({
			text: "Cancel", press: function () {
				oDialogWithWidthHeightAndBigContent.close();
			}
		})
	});

	var oDialogWithWidthHeightAndBigContentAndDisabledScroller = new Dialog({
		title: "Dialog with Width, Height, Big Content and Disabed Scroller",
		contentWidth: "500px",
		contentHeight: "500px",
		verticalScrolling: false,
		horizontalScrolling: false,
		content: new HTML({
			content: '<div style="width: 1000px; height: 1000px;">Lipsum limple text</div>'
		}),
		beginButton: new Button({
			text: "Accept", press: function () {
				oDialogWithWidthHeightAndBigContentAndDisabledScroller.close();
			}
		}),
		endButton: new Button({
			text: "Cancel", press: function () {
				oDialogWithWidthHeightAndBigContentAndDisabledScroller.close();
			}
		})
	});

	var subHeader = new Bar({
		contentMiddle: [
			new SearchField({
				placeholder: "Search ...",
				width: "100%"
			})
		],
		visible: false
	});

	var subHeader1 = new Bar({
		contentMiddle: [
			new SearchField({
				placeholder: "Search ...",
				width: "100%"
			})
		],
		visible: true
	});

	var oDialogWithSubheader = new Dialog('subheaderDialog', {
		title: "Dialog with invisible SubHeader",
		content: new Button('triggerSubheaderButton', {
			text: 'trigger',
			press: function() {
				subHeader.setVisible(!subHeader.getVisible());
			}
		}),
		subHeader: subHeader,
		beginButton: new Button({
			text: "Accept", press: function () {
				oDialogWithSubheader.close();
			}
		}),
		endButton: new Button('dialogWithSubheaderCancelButton', {
			text: "Cancel", press: function () {
				oDialogWithSubheader.close();
			}
		})
	});

	var oDialogResizeAndDragSubheader = new Dialog({
		title: "Dialog Resize And Drag",
		draggable: true,
		resizable: true,
		subHeader: subHeader1,
		content: new HTML({
			content: '<div>Lipsum limple text</div>'
		}),
		endButton: new Button({
			text: "Cancel", press: function () {
				oDialogResizeAndDragSubheader.close();
			}
		})
	});

	var oDialogSubHeaderInfoBar = new Dialog('subHeaderInfoBarDialog', {
		title: "Dialog with SubHeader",
		content: new Text({
			text: 'Content'
		}),
		subHeader: new Toolbar({
			design: "Info",
			content: new Text().setText("Sub Header")
		}),
		beginButton: new Button("oDialogSubHeaderInfoBarClose", {
			text: "OK", press: function () {
				oDialogSubHeaderInfoBar.close();
			}
		})
	});

	var oDialogSubHeaderNoHeader = new Dialog('subHeaderNoHeaderDialog', {
		showHeader: false,
		initialFocus: "dialogSubHeaderNoHeaderCloseBtn",
		content: new Text({
			text: 'Content'
		}),
		subHeader: new Bar({
			contentMiddle: [
				new SearchField({
					placeholder: "Search ...",
					width: "100%"
				})
			]
		}),
		beginButton: new Button("dialogSubHeaderNoHeaderCloseBtn", {
			text: "OK", press: function () {
				oDialogSubHeaderNoHeader.close();
			}
		})
	});

	var oDialogStretched = new Dialog('stretchedDialog', {
		title: "Stretched Dialog",
		stretch: true,
		content: new HTML({
			content: '<div>Lipsum limple text</div>'
		}),
		beginButton: new Button({
			text: "Accept", press: function () {
				oDialogStretched.close();
			}
		}),
		endButton: new Button('stretchedDialogCloseButton', {
			text: "Cancel", press: function () {
				oDialogStretched.close();
			}
		})
	});

	var oDialogStretchedWithContentSize = new Dialog("stretchedDialogWithContentSize", {
		title: "Stretched Dialog with content size set",
		content: new HTML({
			content: '<div>Lipsum limple text</div>'
		}),
		contentHeight: "100%",
		contentWidth: "100%",
		stretch: true,
		beginButton: new Button("stretchedDialogWithContentSizeCloseButton", {
			text: "Cancel", press: function () {
				oDialogStretchedWithContentSize.close();
			}
		})
	});

	var oDialogStretchedOnMobile = new Dialog({
		title: "Streched Dialog on Mobile",
		stretch: true,
		content: new HTML({
			content: '<div>Lipsum limple text</div>'
		}),
		beginButton: new Button({
			text: "Accept", press: function () {
				oDialogStretchedOnMobile.close();
			}
		}),
		endButton: new Button({
			text: "Cancel", press: function () {
				oDialogStretchedOnMobile.close();
			}
		})
	});

	var oDialogWithCustomHeader = new Dialog({
		title: "Dialog with Select",
		customHeader: new Bar({
			contentLeft: [new Icon({src: "sap-icon://manager"}), new Label({text: "Custom Header"})],
			contentMiddle: [],
			contentRight: []
		}),
		content: [
			new Label({text: "sap.m.Select:"}),
			new Select({
				items: [
					new Item({
						key: "0",
						text: "item 0"
					})
				]
			})
		],
		beginButton: new Button({
			press: function () {
				oDialogWithCustomHeader.close();
			},
			text: "Close"
		})
	});

	var confirmDialog;
	var oEscapePreventDialog = new Dialog({
		title : "Try closing me with escape",
		escapeHandler : function(oPromise) {
			// eslint-disable-next-line no-console
			console.log(oPromise);
			if (!confirmDialog) {
				confirmDialog = new Dialog({
					icon : IconPool.getIconURI("message-information"),
					title : "Are you sure?",
					content : [
						new Text({
							text : "Your unsaved changes will be lost"
						})
					],
					type : mLibrary.DialogType.Message,
					buttons : [
						new Button({
							text : "Yes",
							press : function() {
								confirmDialog.close();
								oPromise.resolve();
							}
						}),
						new Button({
							text : "No",
							press : function() {
								confirmDialog.close();
								oPromise.reject();
							}
						})
					]
				});
			}

			confirmDialog.open();
		}
	});

	//=================================================================
	// Real use cases
	//=================================================================

	var dialogChangeContentSizeTimeoutInterval = 2000;
	var dialogChangeContentSizeTimeout;
	var dialogChangeCount = 0;
	var dialogWithChangingContentSize = new Dialog({
		buttons: [
			new Button({
				press: function () {
					dialogWithChangingContentSize.close();
				},
				text: "Close"
			}),
			new Button({
				text: "Stop",
				press: function () {
					clearInterval(dialogChangeContentSizeTimeout);
				}
			}),
			new Button({
				text: "Start",
				press: function () {
					_startResizingInterval();
				}
			})
		],
		content: [
			new HTML({content: '<div id="dialogWithChangingContentSize">Do you want to start a new world domination campaign?</div>'})
		]
	});

	function _startResizingInterval() {
		dialogChangeContentSizeTimeout = setInterval(function () {
			jQuery('#dialogWithChangingContentSize').css({
				width: parseInt(Math.random() * 1500) + 'px',
				height: parseInt(Math.random() * 1500) + 'px'
			}).html('Changed content times: ' + dialogChangeCount++);
		}, dialogChangeContentSizeTimeoutInterval);
	}
	_startResizingInterval();

	var disabledScrollingDialogWithSplitter = new Dialog({
		contentWidth: '20rem',
		contentHeight: "100%",
		showHeader: true,
		horizontalScrolling: false,
		verticalScrolling: false,
		buttons: [new Button({
			press: function () {
				disabledScrollingDialogWithSplitter.close();
			},
			text: "Close"
		})],
		content: new Splitter({
			orientation: "Vertical",
			contentAreas: [
				new Table({
					columns: [
						new Column(),
						new Column()
					]
				}),
				new SimpleForm({
					content: [
						new Label({text: "Test"}),
						new Input()
					]
				})
			]
		})
	});

	var dialogWithHidingFooter = new Dialog('dialogWithHidingFooter', {
		title: 'Toggle toolbar',
		content: [
			new Button({
				text: 'Add EndButton',
				press: function () {
					dialogWithHidingFooter.setEndButton(new Button({text: 'Generated button'}));
				}
			}),
			new Button({
				text: 'Remove EndButton',
				press: function () {
					dialogWithHidingFooter.destroyEndButton();
				}
			})
		]
	});

	var dragDialogWithMultipleHeaders = new Dialog('dragDialogWithMultipleHeaders', {
		title: 'dragDialog With Multiple Headers',
		draggable: true,
		subHeader: new Bar({
			contentMiddle: [
				new Label({
					text: 'SubHeader Label text"'
				})
			]
		}),
		content: [
				new Bar({
					contentMiddle: [
						new Title({
							text: 'Second Title'
						})
					]
				}),
			new Bar({
				contentMiddle: [
					new Label({
						text: 'Second Label'
					})
				]
			}),
			new Panel({
				headerText: 'Panel Header Text',
				expandable: true,
				height: '100%'
			})
		],
		beginButton: new Button({
			press: function () {
				dragDialogWithMultipleHeaders.close();
			},
			text: "Close"
		})
	});

	var allButtons = [
		new Button({
			text: 'Button in buttons',
			press: function () {
				dialogWithManyButtons.close();
			}
		})
	];

	var statusLabel = new Label({
		text: 'status'
	});

	function _setStatusForDialogWithManyButtons() {
		var buttons =  dialogWithManyButtons.getAggregation('buttons');
		var text = 'buttons: ' + (buttons !== null ? buttons.length : 0);

		var beginButton = dialogWithManyButtons.getBeginButton();
		var endButton = dialogWithManyButtons.getEndButton();

		text += ' / beginButton: ' + (beginButton ? 1 : 0);
		text += ' / endButton: ' + (endButton ? 1 : 0);

		var toolbar = dialogWithManyButtons._getToolbar();
		text += ' # toolbar content: ' + toolbar.getContent().length;

		statusLabel.setText(text);
	}

	var dialogWithOneHundredPercentHeightContent = new Dialog('DialogWithTallContent', {
		title: '100% height content - verticalScrolling: false',
		content: [
			new HTML({content: '<iframe url="https://w3c.org/" style="height: 100%; width: 100%;"></iframe>'})
		],
		contentHeight: "50%",
		//verticalScrolling should be false so the content will be able to take the heitgt
		verticalScrolling: false,
		buttons: [
			new Button({
				text: "close",
				press: function() {
					dialogWithOneHundredPercentHeightContent.close();
				}
			})
		]
	});

	var resizableDialogWithOneHundredPercentHeightContent = new Dialog('resizableDialogWithTallContent', {
		title: 'Resizable Dialog with 100% height content',
		resizable: true,
		content: [
			new FlexBox({
				width : "100%",
				height : "100%",
				fitContainer: true
			})
		],
		buttons: [
			new Button({
				text: "close",
				press: function() {
					resizableDialogWithOneHundredPercentHeightContent.close();
				}
			})
		]
	});

	var dynamicContentDialog = new Dialog('dynamicContentDialog', {
		title: 'Dialog with dynamic content',
		content: [
			new MessageStrip({
				text: "Strip1",
				visible: '{/isVisible}'
			}).setModel(model),
			new SimpleForm({
				layout: "ResponsiveGridLayout",
				content: [
					new Label({text: "some label"}),
					new TextArea({
						cols: 20,
						maxLength: 16000,
						rows: 6
					})
				]
			})
		]
	});

	var dialogWithTwoSimpleForms = new Dialog('twoSimpleFormsDialog', {
		title : "Contact Support",
		contentWidth : "29.6rem",
		beginButton : new Button("twoSimpleFormsDialogSendBtn", {
			text: "Send",
			enabled: false
		}),
		endButton : new Button("twoSimpleFormsDialogCancelBtn", {
			text: "Cancel",
			press: function () {
				dialogWithTwoSimpleForms.close();
			}
		}),
		initialFocus : "textArea",
		content : [
			new SimpleForm("topForm", {
				editable: false,
				content: [
					new TextArea("textArea", {
						rows: 7,
						placeholder: "BCP: 1670080757 \nBCP: 1670197927"
					})
				]
			}),
			new SimpleForm("bottomForm", {
				editable: false,
				content: [
					new Link({text: "Show technical data"})
				]
			})
		]
	});

	var tbl = new Table({
		columns : [
			new Column({}),
			new Column({}),
			new Column({
				header : new Label({ text : "Column 3"})
			})
		],
		items : [
			new ColumnListItem({
				cells : [
					new Text({text : "Marin"}),
					new Select(),
					new Input()
				]
			})
		]
	});

	var dialogWithTable = new Dialog({
		content : [ tbl ]
	}).addStyleClass("sapUiSizeCompact");

	var dialogWithFixedSizeContent = new Dialog('dialogWithFixedSizeContent', {
		title: "Dialog with fixed size content",
		content: [new Panel({
			headerText: "Some Panel",
			height: "2000px",
			width: "500px"
		})],
		resizable: true,
		endButton: new Button('dialogWithFixedSizeContentCloseButton', {
			text: "Cancel", press: function () {
				dialogWithFixedSizeContent.close();
			}
		})
	});

	var dialogWithCustomHeaders = new Dialog('dialogWithCustomHeadersDialog', {
		customHeader: new Bar({
			contentLeft: new Title({
				text: "Content Left"
			}),
			contentMiddle: new Title({
				text: "Content Middle"
			}),
			contentRight: new Title({
				text: "Content Right"
			})
		}),
		content: [
			new ToggleButton('dialogWithCustomHeadersDialogToggleButton', {
				width: "100%",
				text: "Toggle Density",
				press: function() {
					dialogWithCustomHeaders.toggleStyleClass("sapUiSizeCompact");
				}
			})
		],
		endButton: new Button('dialogWithCustomHeadersDialogCloseButton', {
			text: "Close",
			press: function () {
				dialogWithCustomHeaders.close();
			}
		})
	}).addStyleClass("sapUiSizeCompact");

	//Added as result of Internal Incident 1570901570
	var oDialogWithOUTSettedWidthInRTL = new Dialog({
		title: "Title",
		showHeader: true,
		type: "Standard",
		state: "None",
		stretch: false,
		contentWidth: "",
		contentHeight: "",
		horizontalScrolling: false,
		verticalScrolling: true,
		resizable: false,
		draggable: false,
		content: [
			new Button({
			text: "Loooooooooooooooooooooooooooooooooooong button text - 600px width",
			width: "600px"
		})],
		endButton: new Button({
			text: "Cancel", press: function () {
				oDialogWithOUTSettedWidthInRTL.close();
			}
		})
	});

	var dialogWithManyButtons = new Dialog('dialogWithManyButtons', {
		title: 'DialogWithManyButtons',
		content: [
			new Button({
				text: 'Add Button',
				press: function () {
					var newButton = new Button({
						text: 'Added new button',
						press: function () {
							dialogWithManyButtons.close();
						}
					});

					dialogWithManyButtons.addButton(newButton);
					_setStatusForDialogWithManyButtons();
				}
			}),
			new Button({
				text: 'Clear Buttons',
				press: function () {
					dialogWithManyButtons.removeAllButtons();

					_setStatusForDialogWithManyButtons();
				}
			}),
			new HTML({content: "<br>"}),
			new Button({
				text: 'Add Begin Button',
				press: function () {
					dialogWithManyButtons.setBeginButton(new Button({
						text: "Begin Button",
						press: function () {
							dialogWithManyButtons.destroyBeginButton();
							_setStatusForDialogWithManyButtons();
						}
					}));
					_setStatusForDialogWithManyButtons();
				}
			}),
			new Button({
				text: 'Add End Button',
				press: function () {
					dialogWithManyButtons.setEndButton(new Button({
						text: "End Button with very long text inside",
						press: function () {
							dialogWithManyButtons.destroyEndButton();
							_setStatusForDialogWithManyButtons();
						}
					}));
					_setStatusForDialogWithManyButtons();
				}
			}),
			new HTML({content: "<br>"}),
			statusLabel
		],
		buttons: allButtons
	});

	var dialogWithButtonsWithLongText = new Dialog('dialogWithButtonsWithLongText', {
		title: 'dialogWithButtonsWithLongText',
		content: [
			new Label({
				text: 'Dialog\' content'
			})
		],
		beginButton: new Button({
			text: 'Begin button with very long text',
			press: function () {
				dialogWithButtonsWithLongText.close();
			}
		}),
		endButton: new Button({
			text: 'End button with long, long text for some reason',
			press: function () {
				dialogWithButtonsWithLongText.close();
			}
		})
	});

	//=================================================================

	var dummyData = {
		names: []
	};

	for (var i = 0; i < 1000; i++) {
		dummyData.names.push({
			firstName: "First " + i,
			lastName: "Last " + i
		});
	}

	var oAutoGrowTable = new Table({
		growing: true,
		growingThreshold: 5,
		growingScrollToLoad: true,
		columns: [
			new Column({header: new Text({text: "Last Name"})}),
			new Column({header: new Text({text: "First Name"})})
		]
	});

	// bind the Table items to the data collection
	oAutoGrowTable.bindItems({
		path : "/names",
		template : new ColumnListItem({
			cells: [
				new Text({text: "{lastName}"}),
				new Text({text: "{firstName}"})
			]
		})
	});

	oAutoGrowTable.setModel(new JSONModel(dummyData));

	var oDialogWithAutoGrowTable = new Dialog('dialogWithAutoGrowTable', {
		title: 'dialogWithAutoGrowTable',
		content: oAutoGrowTable,
		beginButton: new Button("dialogWithAutoGrowTableOKButton", {
			text: "OK",
			press: function () {
				oDialogWithAutoGrowTable.close();
			}
		})
	});


	var oPopoverDialog = new Dialog('popoverDialog', {
		title: "Message Popover Dialog",
		stretch: true,
		content: new HTML({
			content: '<div>Lipsum limple text</div>'
		}),
		footer: new Toolbar({
			content: [new Button({
					icon: "sap-icon://error",
					type: "Negative",
					text: "2",
					press: function () {
						oMessagePopover.toggle(this);
					}
				}),
				new Button({
					text: "Accept",
					type: "Accept",
					press: function () {
						oPopoverDialog.close();
					}
				}),
				new Button({
					text: "Reject",
					press: function () {
						oPopoverDialog.close();
					}
				})
			]
		})
	});
	var oMessage = new MessageItem({
		type: 'Error',
		title: 'Error message',
		description: "Long Error Long Description ",
		subtitle: 'Example of subtitle',
		counter: 1
	});

	var oMessage2 = new MessageItem({
		type: 'Error',
		title: 'Error message',
		description: "Shorter Description ",
		subtitle: 'Example',
		counter: 1
	});


	var oMessagePopover = new MessagePopover("mPopover", {
		items: [oMessage, oMessage2],
		activeTitlePress: function () {
			MessageToast.show('Active title is pressed');
		}
	});


	//=================================================================

	var page1 = new Page("page1", {
		title: "sap.m.Dialog",
		subHeader: new Toolbar({
			content: [
				new CheckBox("compactMode", {
					text: "Compact Mode",
					selected : false,
					select : function() {
						jQuery("body").toggleClass("sapUiSizeCompact");
					}
				}).addStyleClass("sapUiSmallMarginEnd"),
				new CheckBox({
					text: "Custom within area",
					select : function (event) {
						var area = document.getElementById("within");
						if (event.getParameter("selected")) {
							area.hidden = false;
							Popup.setWithinArea(area);
						} else {
							area.hidden = true;
							Popup.setWithinArea(null);
						}
					}
				})
			]
		}),
		content: [
			oButtonToOpenDialogWithHeaderAndSubHeader,
			oButtonToOpenDialogWithHeaderAndSubHeaderDragResize,
			new Button('simpleDialogButton', {
				text: "Simple Dialog",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogSimple.open();
				}
			}),
			new Button('dialogNoHeaderButton', {
				text: "Dialog No Header",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogNoHeader.open();
				}
			}),
			new Button('dialogWithSubheaderButton', {
				text: "With invisible SubHeader",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogWithSubheader.open();
				}
			}),
			new Button('stretchedDialogButton', {
				text: "Stretched",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogStretched.open();
				}
			}),
			new Button('stretchedDialogWithContentSizeButton', {
				text: "Stretched with Content Size",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogStretchedWithContentSize.open();
				}
			}),
			new Button("textareaDialogButton", {
				text: "Textarea in Dialog",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oTextAreaDialog.open();
				}
			}),
			new Button('resizeDialogButton', {
				text: "Resize Enabled",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogResize.open();
				}
			}),
			new Button('dialogWithFixedSizeContentButton', {
				text : "Dialog with fixed size content",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function() {
					dialogWithFixedSizeContent.open();
				}
			}),
			new Button('dialogWithCustomHeadersButton', {
				text : "Dialog with 3 custom headers",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function() {
					dialogWithCustomHeaders.open();
				}
			}),
			new Button({
				text: "Message Dialog",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogTypeMessage.open();
				}
			}),
			new Button({
				text: "Message Dialog - Set Size",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogTypeMessageWithSize.open();
				}
			}),

			new HTML({content: "<br>"}),

			new Button({
				text: "Dialog No Footer Bar",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogNoFooter.open();
				}
			}),
			new Button({
				text: "No Footer and Header",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogNoHeaderNoFooter.open();
				}
			}),

			new HTML({content: "<br>"}),

			new Button({
				text: "Big Content",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogBigContent.open();
				}
			}),
			new Button({
				text: "Very Long Title",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogLongTitle.open();
				}
			}),

			new HTML({content: "<br>"}),

			new Button({
				text: "Set Height",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogWithHeight.open();
				}
			}),
			new Button({
				text: "Set Width",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogWithWidth.open();
				}
			}),
			new Button({
				text: "Set Width & Height",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogWithWidthAndHeight.open();
				}
			}),

			new HTML({content: "<br>"}),

			new Button({
				text: "Scrolling",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogWithWidthHeightAndBigContent.open();
				}
			}),

			new Button({
				text: "Disabled Scrollers",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogWithWidthHeightAndBigContentAndDisabledScroller.open();
				}
			}),

			new HTML({content: "<br>"}),

			new Button({
				text: "With Custom Header",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogWithCustomHeader.open();
				}
			}),
			new HTML({content: "<br>"}),
			new Button({
				text: "Stretched on Mobile (depricated)",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogStretchedOnMobile.open();
				}
			}),
			oButton6,
			new HTML({content: "<br>"}),
			new Button({
				text: "Full-screen Form in Dialog",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialog2.open();
				}
			}),
			oButton,
			new HTML({content: "<br>"}),
			oButton4,
			oButton5,
			oButton2,
			new HTML({content: "<br>"}),
			new Button({
				text: "MessageBox as Dialog",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					MessageBox.show("Do you really want to order this?", {
						title: "Message",
						actions: ["Order this", MessageBox.Action.CANCEL]
					});
				}
			}),
			new Button({
				text: "Accept/Reject Buttons",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oMessageDialog1.open();
				}
			}),
			new HTML({content: "<br>"}),
			new Button({
				text: "Drag Enabled",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogDrag.open();
				}
			}),
			new Button({
				text: "Resize and Drag Enabled",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogResizeAndDrag.open();
				}
			}),
			new HTML({content: "<br>"}),
			new Button({
				width: _buttonWidth,
				text: "Compact size",
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					var oDialog = new Dialog({
						title: "View Settings",
						horizontalScrolling: false,
						contentWidth: "65rem",
						contentHeight: "40rem",
						draggable: true,
						subHeader: new Bar({
							contentLeft: [new SegmentedButton({
								width: "100%",
								items: [new SegmentedButtonItem({
									text: "Filter"
								})]
							})]
						})
					});
					oDialog.toggleStyleClass("sapUiSizeCompact", true);
					oDialog.open();
				}
			}),
			new Button({
				width: _buttonWidth,
				text: "Escape Handler",
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oEscapePreventDialog.open();
				}
			}),
			new Label({text: "Starting on"}).addStyleClass("specialLabelDialogPage"),
			new DatePicker({
				width: "150px"
			}),
			new Label({text: "E-mail address for confirmation"}).addStyleClass("specialLabelDialogPage"),
			new Input({
				type: mLibrary.InputType.Email, placeholder: "Type anything and press enter", change: function () {
					oDialog1.open();
				}
			}),
			new HTML({content: "<br>"}),

			new HTML({content: "<h1>Padding</h1>"}),
			new HTML({content: "<br>"}),
			new Button({
				text: "Default (no padding)",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogPadding.open();
				}
			}),
			new Button({
				text: "sapUiContentPadding",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogPadding.addStyleClass("sapUiContentPadding");
					oDialogPadding.open();
				}
			}),
			new Button({
				text: "sapUiResponsiveContentPadding",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogPadding.addStyleClass("sapUiResponsiveContentPadding");
					oDialogPadding.open();
				}
			}),
			new Button("buttonDialogResponsivePadding", {
				text: "Responsive Padding Enabled",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogWithResponsivePadding.open();
				}
			}),

			new HTML({content: "<h1>States</h1>"}),
			new HTML({content: "<br>"}),
			new Button('dialogWithSuccessStateButton', {
				text: "With Success State",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogSuccessState.open();
				}
			}),
			new Button('dialogWithErrorStateButton', {
				text: "With Error State",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogErrorState.open();
				}
			}),
			new Button('dialogWithInformationStateButton', {
				text: "With Information State",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogInformationState.open();
				}
			}),
			new Button('dialogWithStateButton', {
				text: "With Warning State",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialog1.open();
				}
			}),

			new HTML({content: "<h1>Real use cases</h1>"}),
			new Button({
				text: "No scrollars with splitter",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					disabledScrollingDialogWithSplitter.open();
				}
			}),
			new Button({
				text: "Changing content size",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					dialogWithChangingContentSize.open();
				}
			}),

			new Button({
				text: "Toggling footer if there are/are not buttons",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					dialogWithHidingFooter.open();
				}
			}),

			new Button({
				text: "Too many buttons",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					dialogWithManyButtons.open();
				}
			}),

			new HTML({content: "<br>"}),

			new Button({
				text: "Begin and End buttons with long text",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					dialogWithButtonsWithLongText.open();
				}
			}),

			new Button({
				text: "Drag with more than one header",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					dragDialogWithMultipleHeaders.open();
				}
			}),

			new Button({
				text: "100% Height Content",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					dialogWithOneHundredPercentHeightContent.open();
				}
			}),

			new Button({
				text: "Big width of the content in RTL",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					oDialogWithOUTSettedWidthInRTL.open();
				}
			}),

			new Button({
				text: "Resizable with 100% content height",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function () {
					resizableDialogWithOneHundredPercentHeightContent.open();
				}
			}),

			new Button({
				text: "Dialog with dynamic content",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function() {
					dynamicContentDialog.open();
					setTimeout(function() {
						dynamicContentDialogData.isVisible = true;
						model.setData(dynamicContentDialogData);
					}, 1500);
				}
			}),

			new Button({
				text: "Dialog with two simple forms",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function() {
					dialogWithTwoSimpleForms.open();
				}
			}),

			new Button({
				text : "Dialog with table",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function() {
					dialogWithTable.open();
				}
			}),

			new Button("SubHeaderInfoBarButton", {
				text : "Dialog with SubHeader with InfoBar",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function() {
					oDialogSubHeaderInfoBar.open();
				}
			}),

			new Button("SubHeaderNoHeaderButton", {
				text : "Dialog with SubHeader and no Header",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function() {
					oDialogSubHeaderNoHeader.open();
				}
			}),

			new Button("buttonAutoGrowTable", {
				text : "Dialog with auto grow Table",
				width: _buttonWidth,
				ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
				press: function() {
					oDialogWithAutoGrowTable.open();
				}
			}),
			new Button("buttonPopoverDialog", {
				text: "Message Popover Dialog",
				width: _buttonWidth,
				press: function () {
					oPopoverDialog.open();
				}
			})
		]
	});
	app.addPage(page1).placeAt("content");


});
