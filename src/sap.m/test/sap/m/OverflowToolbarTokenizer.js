sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/OverflowToolbarTokenizer",
	"sap/m/OverflowToolbar",
	"sap/m/Toolbar",
	"sap/m/Token",
	"sap/m/MessageToast",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/Select",
	"sap/ui/core/Item",
	"sap/m/SearchField",
	"sap/m/ToolbarSpacer",
	"sap/m/ToolbarSeparator",
	"sap/ui/core/IconPool",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/Input",
	"sap/m/DateTimePicker",
	"sap/m/DateRangeSelection",
	"sap/m/RadioButton",
	"sap/m/ToggleButton",
	"sap/m/Title",
	"sap/m/Text",
	"sap/m/library",
	"sap/m/OverflowToolbarLayoutData"
], function (
	App,
	Page,
	OverflowToolbarTokenizer,
	OverflowToolbar,
	Toolbar,
	Token,
	MessageToast,
	Button,
	Label,
	Select,
	Item,
	SearchField,
	ToolbarSpacer,
	ToolbarSeparator,
	IconPool,
	SegmentedButton,
	SegmentedButtonItem,
	Input,
	DateTimePicker,
	DateRangeSelection,
	RadioButton,
	ToggleButton,
	Title,
	Text,
	library,
	OverflowToolbarLayoutData
) {
	"use strict";

	const sNotesIconURI = IconPool.getIconURI("notes");
	const sAddIconURI = IconPool.getIconURI("add");
	const oEventList = new sap.m.List();
	const fnHandleTokenChange = function(oEventArgs) {
		const sType = oEventArgs.getParameter("type");
		const oItem = new sap.m.StandardListItem({ title: "token: " + sType });
		oEventList.addItem(oItem);
	};

	const OverflowToolbarPriority = library.OverflowToolbarPriority;
	const SelectType = library.SelectType;
	const oTokenizerFilter = new OverflowToolbarTokenizer("overflowToolbarTokenizer", {
		width: "75%",
		labelText: "Filter by:",
		tokens: [
			new Token({ text: "Token 1", key: "0001" }),
			new Token({ text: "Token 2", key: "0002" }),
			new Token({ text: "Token 3", key: "0003" }),
			new Token({ text: "Token 4 - long text example", key: "0004" }),
			new Token({ text: "Token 5", key: "0005" }),
			new Token({ text: "Token 6", key: "0006" }),
			new Token({ text: "Token 7", key: "0007" }),
			new Token({ text: "Token 8", key: "0008" }),
			new Token({ text: "Token 9 - ABCDEF", key: "0009" }),
			new Token({ text: "Token with text", key: "0010" }),
			new Token({ text: "Token 11", key: "0011" }),
			new Token({ text: "Token 12", key: "0012" })
		],
		tokenChange: fnHandleTokenChange
	});

	const oTokenizerMaxWidth = new OverflowToolbarTokenizer("tokenizer-maxwidth", {
		width: "65%",
		maxWidth: "85%",
		labelText: "Random label text:",
		tokens: [
			new Token({ text: "Token 1", key: "0001" }),
			new Token({ text: "Token 2", key: "0002" }),
			new Token({ text: "Token 3", key: "0003" }),
			new Token({ text: "Token 4 - long text example", key: "0004" }),
			new Token({ text: "Token 5", key: "0005" }),
			new Token({ text: "Token 1", key: "0006" }),
			new Token({ text: "Token 2", key: "0007" }),
			new Token({ text: "Token 3", key: "0008" }),
			new Token({ text: "Token 4 - long text example", key: "0009" }),
			new Token({ text: "Token 5", key: "0010" })
		],
		tokenChange: fnHandleTokenChange
	});

	const aFilterToolbarContent = [
		new Button({ icon: sNotesIconURI, text: "Notes" }),
		oTokenizerFilter,
		new ToolbarSpacer()
	];

	const oFilterToolbar = new OverflowToolbar("otb2", {
		content: aFilterToolbarContent,
		width: "auto"
	});

	const oToolbarWithMaxWidthTokenizer = new OverflowToolbar("overflow-toolbar-maxwidth", {
		width: "100%",
		ariaHasPopup: "dialog",
		tooltip: "This is a bar with tokenizer",
		content: [
			new Button({ text: "Filter", type: "Default" }),
			new Button({ icon: sAddIconURI, text: "Add custom criteria", type: "Transparent" }),
			oTokenizerMaxWidth,
			new Title({ text: "Title with Icon", level: "H1" }),
			new sap.ui.core.Icon({ src: "sap-icon://collaborate" }),
			new ToolbarSpacer(),
			new Text({ text: "Just a Simple Text" }),
			new Button({ text: "Accept", type: "Accept" })
		]
	});

	const oTokenizerShowItems = new OverflowToolbarTokenizer("toolbarTokenizer", {
		width: "35%",
		labelText: "Show items:",
		tokens: [
			new Token({ text: "Token 1", key: "0001" }),
			new Token({ text: "Token 2", key: "0002" }),
			new Token({ text: "Token 3", key: "0003" }),
			new Token({ text: "Token 4 - long text example", key: "0004" }),
			new Token({ text: "Token 5", key: "0005" }),
			new Token({ text: "Token 1", key: "0006" }),
			new Token({ text: "Token 2", key: "0007" }),
			new Token({ text: "Token 3", key: "0008" }),
			new Token({ text: "Token 4 - long text example", key: "0009" }),
			new Token({ text: "Token 5", key: "0010" })
		],
		tokenChange: fnHandleTokenChange,
		layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.High })
	});

	const oComplexToolbar = new OverflowToolbar("overflow-toolbar", {
		width: "100%",
		ariaHasPopup: "dialog",
		tooltip: "This is a bar with tokenizer",
		content: [
			new sap.ui.core.Icon({ src: "sap-icon://collaborate" }),
			new Label({
				text: "Input controls",
				layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.Low })
			}),
			new Button({
				text: "Regular Button",
				layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.Low })
			}),
			new ToggleButton({
				text: "Toggle me",
				layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.Low })
			}),
			new Input({
				placeholder: "Input",
				ariaLabelledBy: ["dummy_label_acc_name"],
				width: "200px",
				layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.Low })
			}),
			new DateTimePicker({
				placeholder: "DateTimePicker",
				width: "200px",
				layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.Low })
			}),
			new DateRangeSelection({
				placeholder: "DateRangeSelection",
				width: "200px",
				layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.Low })
			}),
			new RadioButton({ text: "Option a", groupName: "a" }),
			new RadioButton({ text: "Option b", groupName: "a" }),
			oTokenizerShowItems,
			new SegmentedButton({
				ariaLabelledBy: "dummy_label_acc_name",
				width: "350px",
				items: [
					new SegmentedButtonItem({ text: "Left Button" }),
					new SegmentedButtonItem({ icon: sNotesIconURI, tooltip: "Notes" }),
					new SegmentedButtonItem({ text: "Disabled Button", enabled: false }),
					new SegmentedButtonItem({ text: "Right Button" })
				],
				layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.Low })
			}),
			new ToolbarSpacer(),
			new Title({ text: "Example Title Text", level: "H1" })
		]
	});

	const oTokenizerFirst = new OverflowToolbarTokenizer("OTBTokenizer1", {
		width: "30%",
		labelText: "First Tokenizer",
		tokens: [
			new Token({ text: "Alpha" }),
			new Token({ text: "Beta" }),
			new Token({ text: "Gamma" })
		],
		layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.High })
	});

	const oTokenizerLongToken = new OverflowToolbarTokenizer("OTBTokenizerNarrow", {
		width: "35%",
		labelText: "Second Tokenizer",
		layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.High }),
		tokens: [
			new Token({ text: "One" }),
			new Token({ text: "Two" }),
			new Token({ text: "ThreeLongTextExample" }),
			new Token({ text: "FourVeryVeryLongTextExampleAlmostANovel" })
		]
	});

	const oTwoTokenizerToolbar = new OverflowToolbar("ComplexToolbar1", {
		width: "100%",
		content: [
			oTokenizerFirst,
			oTokenizerLongToken,
			new ToolbarSpacer(),
			new Button({
				text: "Action",
				press: function() {
					MessageToast.show("Action pressed!");
				}
			})
		]
	});

	const oToolbarHeaderTokenizer = new OverflowToolbarTokenizer("toolbarheader-tokenizer", {
		width: "25%",
		labelText: "Show items:",
		tokens: [
			new Token({ text: "Token 1", key: "0001" }),
			new Token({ text: "Token 2", key: "0002" }),
			new Token({ text: "Token 3", key: "0003" }),
			new Token({ text: "Token 1", key: "0006" }),
			new Token({ text: "Token 2", key: "0007" }),
			new Token({ text: "Token 3", key: "0008" })
		],
		tokenChange: fnHandleTokenChange
	});

	function getToolbarContent (sText, sSelId) {
	return [
		new Button({text : "Button"}),
		new ToolbarSeparator(),
		new Button({text : "Test"}),
		new Label({
			text: "Choose:",
			tooltip: "Choose:",
			labelFor: sSelId
		}),
		new Select(sSelId, {
			autoAdjustWidth: true,
			items : [
				new Item({
						key: "0",
						text: "item 0"
					}),
				new Item({
						key: "1",
						text: "loooooooooooooong item"
				})
			]
		}),
		new SearchField({
			placeholder : "Search",
			ariaLabelledBy: ["SF_AD"],
			width : "200px"
		}),
		new SegmentedButton({
			items: [
				new SegmentedButtonItem({
					icon: sAddIconURI,
					enabled: true
				}),
				new SegmentedButtonItem({
					icon: sAddIconURI,
					enabled: true
				}),
				new SegmentedButtonItem({
					icon: sAddIconURI,
					enabled: true
				}),
				new SegmentedButtonItem({
					icon: sAddIconURI,
					enabled: true
				})
			]
		}),
		new Button({text : "Button"}),
		new Select({
			type: SelectType.IconOnly,
			icon: IconPool.getIconURI("filter"),
			autoAdjustWidth: true,
			items : [
				new Item({
					key: "0",
					text: "item 0"
				}),
				new Item({
					key: "1",
					text: "loooooooooooooong item"
				})
			]
		}),
		new ToolbarSpacer(),
		new Label({ text : sText, tooltip : sText }),
		new ToolbarSpacer(),
		oToolbarHeaderTokenizer,
		new ToolbarSpacer(),
		new Label({
			text: "Choose:",
			tooltip: "Choose:",
			labelFor: sSelId + 'innerSelect'
		}),
		new Select(sSelId + 'innerSelect', {
			items : [
				new Item({
					key: "0",
					text: "item 0"
				}),
				new Item({
					key: "1",
					text: "loooooooooooooong item"
				})
			]
		})
	];
}

	const ToolbarTokenizerPageHeader = new Toolbar({
		content : getToolbarContent("This is Toolbar with Tokenizer as a page custom header", "toolbarTokenizerHeader")
	});

	const oApp = new App("myApp");

	const oPage = new Page("page1", {
		customHeader: ToolbarTokenizerPageHeader,
		content: [
			new Label({ text: "OverflowToolbar with Tokenizer with 75% width and label association", width: "100%" }),
			oFilterToolbar,
			new Label({ text: "Complex Overflow Toolbar with 35% width Tokenizer and label", width: "100%" }),
			oComplexToolbar,
			new Label({ text: "OverflowToolbar with Tokenizer with max width with label but not associated", width: "100%" }),
			oToolbarWithMaxWidthTokenizer,
			new Label({ text: "Toolbar with 2 OverflowToolbar Tokenizers", width: "100%" }),
			oTwoTokenizerToolbar
		]
	});

	oApp.addPage(oPage);
	oApp.placeAt("body");
});
