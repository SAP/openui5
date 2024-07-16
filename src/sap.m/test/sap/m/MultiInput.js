sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/m/App",
	"sap/m/Button",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/List",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/m/MultiInput",
	"sap/m/Page",
	"sap/m/StandardListItem",
	"sap/m/Table",
	"sap/m/Text",
	"sap/m/Token",
	"sap/ui/core/library",
	"sap/ui/core/Theming",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/m/CheckBox",
	"sap/ui/layout/form/SimpleForm",
	"sap/m/FormattedText",
	"sap/m/Link",
	"sap/m/Dialog",
	"sap/ui/core/Popup",
	"sap/m/ToggleButton",
	"sap/m/SelectDialog",
	"sap/m/Tokenizer",
	"sap/ui/model/Sorter",
	"sap/ui/core/Item",
	"sap/ui/core/SeparatorItem",
	"sap/m/ToolbarSpacer",
	"sap/m/Title"
], function(JSONModel, App, Button, Column, ColumnListItem, Label, List, MessageBox, MessageToast, MultiInput, Page, StandardListItem, Table, Text, Token, coreLibrary, Theming, GridTable, GridTableColumn, CheckBox, SimpleForm, FormattedText, Link, Dialog, Popup, ToggleButton, SelectDialog, Tokenizer, Sorter, Item, SeparatorItem, ToolbarSpacer, Title) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	const ValueState = coreLibrary.ValueState;

	var TextDirection = coreLibrary.TextDirection;

	//*******************************
	var oEventList = new List();
	var fEventWriter = function (eventArgs) {
		var type = eventArgs.getParameter("type");
		var item = null;
		if (type === "tokensChanged") {
			item = new StandardListItem({ title: "type of TokenChange event: " + type + " added: " + eventArgs.getParameter("addedTokens").length + " removed: " + eventArgs.getParameter("removedTokens").length });
		} else {
			item = new StandardListItem({ title: "type of TokenChange event: " + type });
		}
		oEventList.addItem(item);
	};
	//*******************************
	var fValueHelpRequested = function (evt) {
		MessageBox.alert("Value help requested");
	};
	//*******************************

	// MultiInput with tokens validated by custom validator
	var oCheckBoxAcceptValidation = new CheckBox({ text: "Accept tokens", selected: true }),
		oMultiInputCustomValidator = new MultiInput("multiInputCustomValidator", {
			placeholder: "tokens validated by custom validator",
			valueHelpRequest: fValueHelpRequested,
			tokenChange: fEventWriter,
			width: "85%",
			ariaLabelledBy: "singleLineMode-label"
		});

	oMultiInputCustomValidator.setTokens([
		new Token({ text: "Token 1 with a much much much longer text than the rest", key: "0001" }),
		new Token({ text: "Token 2", key: "0002" }),
		new Token({ text: "Token 3", key: "0003" }),
		new Token({ text: "Token 4", key: "0004" })
	]);
	oMultiInputCustomValidator.addValidator(function (args) {
		if (oCheckBoxAcceptValidation.getSelected()) {
			var text = args.text;
			return new Token({ key: text, text: "\"" + text + "\"" });
		}
	});
	oMultiInputCustomValidator.addValidator(function (args) {
		MessageBox.confirm("Do you really want to add this token?", {
			onClose: function (oAction) {
				if (oAction === MessageBox.Action.OK) {
					args.asyncCallback(args.suggestedToken);
				} else {
					args.asyncCallback(null);
				}
			},
			title: "add Token"
		});
		return oMultiInputCustomValidator.getWaitForAsyncValidation();
	});

	// MultiInput - tokens get validated asynchronously after 500ms + 500ms
	var oMultiInputCustomAsyncValidator = new MultiInput("multiInputCustomAsyncValidator", {
		placeholder: "tokens get validated asynchronously after 500ms + 500ms",
		valueHelpRequest: fValueHelpRequested,
		tokenChange: fEventWriter,
		ariaLabelledBy: "singleLineMode-label"
	});

	var fValidator = function (args) {
		window.setTimeout(function () {
			args.asyncCallback(new Token({ text: args.text }));
		}, 500);
		return oMultiInputCustomAsyncValidator.WaitForAsyncValidation;
	};
	oMultiInputCustomAsyncValidator.addValidator(fValidator);
	oMultiInputCustomAsyncValidator.addValidator(fValidator);

	// MultiInput - token text changed by validator
	var oChangeTextValidatorMultiInput = new MultiInput("textChangedMI", {
		placeholder: "token text changed by validator",
		valueHelpRequest: fValueHelpRequested,
		tokenChange: fEventWriter,
		width: "85%",
		ariaLabelledBy: "singleLineMode-label"
	}),
		iKeyCount = 0;

	oChangeTextValidatorMultiInput.addValidator(function (args) {
		var text = args.text;
		iKeyCount++;
		return new Token({ key: iKeyCount, text: text + " (" + iKeyCount + ")" });
	});

	//*******************************
	// JSON Model for rows and i18n model for columns
	// value help and tabular suggestions
	//*******************************

	// data for tabular suggestions
	var oSuggestionData = {
		tabularSuggestionItems: [{
			name: "Holter-di-polter",
			qty: "10 EA",
			limit: "15.00 Eur",
			price: "12.00 EUR"
		}, {
			name: "Ha so was",
			qty: "10 EA",
			limit: "5.00 Eur",
			price: "3.00 EUR"
		}, {
			name: "Hurra einp Produkt",
			qty: "8 EA",
			limit: "60.00 Eur",
			price: "45.00 EUR"
		}, {
			name: "Hallo du tolles Ding",
			qty: "2 EA",
			limit: "40.00 Eur",
			price: "15.00 EUR"
		}, {
			name: "Hier sollte ich zuschlagen",
			qty: "10 EA",
			limit: "90.00 Eur",
			price: "55.00 EUR"
		}, {
			name: "Hohoho",
			qty: "18 EA",
			limit: "29.00 Eur",
			price: "7.00 EUR"
		}, {
			name: "Holla die Waldfee",
			qty: "3 EA",
			limit: "55.00 Eur",
			price: "30.00 EUR"
		}, {
			name: "Hau Ruck",
			qty: "5 EA",
			limit: "2.00 Eur",
			price: "1.00 EUR"
		}, {
			name: "Haste mal nen Euro?",
			qty: "29 EA",
			limit: "99.00 Eur",
			price: "42.00 EUR"
		}, {
			name: "Hol es dir jetzt",
			qty: "4 EA",
			limit: "85.00 Eur",
			price: "10.00 EUR"
		}, {
			name: "Met",
			qty: "1 EA",
			limit: "119.00 EUR",
			price: "88.00 EUR"
		}, {
			name: "Metal",
			qty: "1 EA",
			limit: "119.00 EUR",
			price: "88.00 EUR"
		}, {
			name: "Metallica",
			qty: "1 EA",
			limit: "119.00 EUR",
			price: "88.00 EUR"
		}]
	};

	var aSuggestionColumns = [
		new Column({
			styleClass: "name",
			hAlign: "Left",
			header: new Label({
				text: "Name"
			})
		}),
		new Column({
			hAlign: "Center",
			styleClass: "qty",
			popinDisplay: "Inline",
			header: new Label({
				text: "Qty"
			}),
			minScreenWidth: "Tablet",
			demandPopin: true
		}),
		new Column({
			hAlign: "Center",
			styleClass: "limit",
			width: "30%",
			header: new Label({
				text: "Value"
			}),
			minScreenWidth: "XXSmall",
			demandPopin: true
		}),
		new Column({
			hAlign: "Right",
			styleClass: "price",
			width: "30%",
			popinDisplay: "Inline",
			header: new Label({
				text: "Price"
			}),
			minScreenWidth: "400px",
			demandPopin: true
		})
	];

	var aMoreSuggestionColumns = [
		new Column({
			styleClass: "name",
			hAlign: "Left",
			header: new Label({
				text: "Name"
			})
		}),
		new Column({
			hAlign: "Center",
			styleClass: "qty",
			popinDisplay: "Inline",
			header: new Label({
				text: "Qty"
			}),
			minScreenWidth: "Tablet",
			demandPopin: true
		}),
		new Column({
			hAlign: "Center",
			styleClass: "limit",
			width: "30%",
			header: new Label({
				text: "Value"
			}),
			minScreenWidth: "XXSmall",
			demandPopin: true
		}),
		new Column({
			hAlign: "Right",
			styleClass: "price",
			width: "30%",
			popinDisplay: "Inline",
			header: new Label({
				text: "Price"
			}),
			minScreenWidth: "400px",
			demandPopin: true
		})
	];

	var aEvenMoreSuggestionColumns = [
		new Column({
			styleClass: "name",
			hAlign: "Left",
			header: new Label({
				text: "Name"
			})
		}),
		new Column({
			hAlign: "Center",
			styleClass: "qty",
			popinDisplay: "Inline",
			header: new Label({
				text: "Qty"
			}),
			minScreenWidth: "Tablet",
			demandPopin: true
		}),
		new Column({
			hAlign: "Center",
			styleClass: "limit",
			width: "30%",
			header: new Label({
				text: "Value"
			}),
			minScreenWidth: "XXSmall",
			demandPopin: true
		}),
		new Column({
			hAlign: "Right",
			styleClass: "price",
			width: "30%",
			popinDisplay: "Inline",
			header: new Label({
				text: "Price"
			}),
			minScreenWidth: "400px",
			demandPopin: true
		})
	];

	var oTableItemTemplate = new ColumnListItem({
		type: "Active",
		vAlign: "Middle",
		cells: [
			new Label({
				text: "{name}"
			}),
			new Label({
				text: "{qty}"
			}), new Label({
				text: "{limit}"
			}), new Label({
				text: "{price}"
			})
		]
	});

	// MultiInput - Tabular suggest with JSON binding
	var oTabularSuggestMultiInput = new MultiInput("tabularSuggestMI", {
		width: "60%",
		tokens: [
			new Token({ text: "Token 1", key: "0001" }),
			new Token({ text: "Token 2", key: "0002" }),
			new Token({ text: "Token 3", key: "0003" }),
			new Token({ text: "Token 4", key: "0004" }),
			new Token({ text: "Token 5", key: "0005" }),
			new Token({ text: "Token 6", key: "0006" })
		],
		placeholder: "Tabular suggest with JSON binding (starts with H)",
		valueHelpRequest: fValueHelpRequested,
		suggestionColumns: aSuggestionColumns
	});

	oTabularSuggestMultiInput.addValidator(function (args) {
		if (args.suggestionObject) {
			var key = args.suggestionObject.getCells()[0].getText();
			var text = key + "(" + args.suggestionObject.getCells()[3].getText() + ")";

			return new Token({ key: key, text: text });
		}
		return null;
	});

	var oModel = new JSONModel();
	oModel.setData(oSuggestionData);
	oTabularSuggestMultiInput.setModel(oModel);
	oTabularSuggestMultiInput.bindAggregation("suggestionRows", "/tabularSuggestionItems", oTableItemTemplate);

	// MultiInput in a SimpleForm
	var oSimpleFormMultiInput = new MultiInput("simpleFormMultiInput", {
		width: "65%",
		enableMultiLineMode: true
	});

	oSimpleFormMultiInput.setTokens([
		new Token({ text: "Token 1", key: "0001" }),
		new Token({ text: "Token 2", key: "0002" }),
		new Token({ text: "Token 3", key: "0003" }),
		new Token({ text: "Token 4", key: "0004" }),
		new Token({ text: "Token 5", key: "0005" }),
		new Token({ text: "Token 6", key: "0006" })
	]);
	oSimpleFormMultiInput.addValidator(function (args) {
		var text = args.text;
		return new Token({ key: text, text: text });
	});

	var oSimpleForm = new SimpleForm("simpleFrom", {
		editable: true,
		title: "MultiInput in SimpleForm",
		content: [
			new Label({ text: "Street/ Number" }),
			oSimpleFormMultiInput
		]
	});

	// MultiInput - Warning value state
	var oWarningMultiInput = new MultiInput("mIWarning", {
		placeholder: "Placeholder text",
		valueState: "Warning",
		valueStateText: "Simple value state warning text",
		valueHelpRequest: fValueHelpRequested,
		width: "33%"
	});

	// MultiInput - Error value state
	var oErrorMultiInput = new MultiInput("mIError", {
		placeholder: "Placeholder text",
		valueStateText: "Simple value state error text",
		valueState: "Error",
		valueHelpRequest: fValueHelpRequested,
		width: "33%"
	});

	// MultiInput - Success value state
	var oSuccessMultiInput = new MultiInput("mISuccess", {
		placeholder: "Placeholder text",
		valueState: "Success",
		valueHelpRequest: fValueHelpRequested,
		width: "33%"
	});

	// MultiInput - Formatted value state text with link (warning)
	var oMultiInputValueStateWarningLink = new MultiInput("mIFVSWarning", {
		placeholder: "Warning value message text with link",
		valueState: "Warning",
		valueHelpRequest: fValueHelpRequested,
		width: "33%",
		suggestionColumns: aMoreSuggestionColumns,
		formattedValueStateText: new FormattedText({
			htmlText: "Warning value state message with formatted text containing %%0",
			controls: [
				new Link({
					text: "link",
					href: "",
					press: function () {
						var oDialog = new Dialog({
							title: 'Recomendations are based on:',
							type: Dialog.DialogType.Message,
							state: ValueState.Warning,
							content: new Text({
								text: 'Machine learning information and more details'
							}),
							beginButton: new Button({
								text: 'OK',
								press: function () {
									oDialog.close();
								}
							}),
							afterClose: function () {
								oDialog.destroy();
							}
						});
						oDialog.open();
					}
				})
			]
		})
	});

	oMultiInputValueStateWarningLink.setModel(oModel);
	oMultiInputValueStateWarningLink.bindAggregation("suggestionRows", "/tabularSuggestionItems", oTableItemTemplate);

	// MultiInput - Formatted value state text with multiple links (error)
	var oMultiInputValueStateErrorLinks = new MultiInput("mIFVSError", {
		placeholder: "Error value message text with multiple links",
		valueState: "Error",
		valueHelpRequest: fValueHelpRequested,
		width: "33%",
		suggestionColumns: aEvenMoreSuggestionColumns,
		formattedValueStateText: new FormattedText({
			htmlText: "Warning value state message with formatted text containing %%0 %%1",
			controls: [
				new Link({
					text: "multiple",
					href: "#",
					press: function () {
						MessageToast.show("You have pressed a link in value state message", { my: Popup.Dock.CenterCenter, at: Popup.Dock.CenterCenter });
					}
				}),
				new Link({
					text: "links",
					href: "#",
					press: function () {
						MessageToast.show("You have pressed a link in value state message", { my: Popup.Dock.CenterCenter, at: Popup.Dock.CenterCenter });
					}
				})
			]
		})
	});

	oMultiInputValueStateErrorLinks.setModel(oModel);
	oMultiInputValueStateErrorLinks.bindAggregation("suggestionRows", "/tabularSuggestionItems", oTableItemTemplate);

	// MultiInput - Formatted value state text with link (success)
	var oMultiInputValueStateSuccessLinks = new MultiInput("mIFVSSuccess", {
		placeholder: "Success value state",
		valueState: "Success",
		valueHelpRequest: fValueHelpRequested,
		width: "33%",
		formattedValueStateText: new FormattedText({
			htmlText: "Success value state message with formatted text containing %%0",
			controls: [
				new Link({
					text: "link",
					href: "#",
					target: "_blank"
				})
			]
		})
	});

	// MultiInput - Not editable with editable and not editable tokens
	var oNotEditableMI = new MultiInput("multiInputNotEditable", {
		value: "Some text",
		tokens: [
			new Token({ text: "Token 1", key: "0001" }),
			new Token({ text: "Token 2", key: "0002" }),
			new Token({ text: "Token 3", key: "0003" }),
			new Token({ text: "Token 4", key: "0004" })
		],
		editable: false
	});

	oNotEditableMI.setTokens([
		new Token({ text: "Token 1", key: "0001" }),
		new Token({ text: "Token 2", key: "0002", editable: false }),
		new Token({ text: "Token 3", key: "0003" }),
		new Token({ text: "Token 4 with a long text", key: "0004", editable: false })
	]);

	//*******data binding example***************************************************************
	// JSON sample data
	var data = {
		modelData: [
			{ lastName: "Doe", gender: "Male" },
			{ lastName: "Ali", gender: "Female" }
		]
	};

	// create JSON model instance
	var oModel = new JSONModel();

	// set the data for the model
	oModel.setData(data);

	// define the template
	var oItemTemplate = new ColumnListItem({
		cells: [
			new Label({
				text: "{lastName}"
			}),
			new MultiInput({
				tokens: [
					new Token({ text: "{lastName}", key: "{lastName}" }),
					new Token({ text: "{gender}", key: "{gender}" })
				]
			})
		]
	});

	var aColumns = [
		new Column({
			header: new Label({
				text: "LastName"
			}),
			width: "100px"
		}),
		new Column({
			header: new Label({
				text: "LastName + Gender"
			})
		})
	];

	var oTable = new Table("tableTamplate", { columns: aColumns });

	oTable.bindItems("/modelData", oItemTemplate);
	oTable.setModel(oModel);
	//******************************************

	// MultiInput - max three tokens could be set
	var oMaxThreeTokensMI = new MultiInput("multiInputMaxThreeTokens", {
		maxTokens: 3
	});

	oMaxThreeTokensMI.addValidator(function (args) {
		var text = args.text;
		return new Token({ key: text, text: text });
	});

	// MultiInput - editable and not editable tokens
	var oNotEditableTokensMI = new MultiInput("multiInputReadOnlyTokens", {
		width: "60%",
		tokens: [
			new Token({ text: "Token 1", key: "0001" }),
			new Token({ text: "Token 2", key: "0002", editable: false }),
			new Token({ text: "Token 3", key: "0003" }),
			new Token({ text: "Token 4", key: "0004", editable: false })
		]
	});

	var readOnlyButton = new ToggleButton({
		text: "Toggle Read-Only",
		press: function () {
			oNotEditableTokensMI.setEditable(!oNotEditableTokensMI.getEditable());
		}
	});

	// MultiInput - one very long token
	var oOneLongTokenMI = new MultiInput("multiInputWithOneLongToken", {
		placeholder: "1 item example",
		valueHelpRequest: function () {
			var oDialog = new Dialog({
				endButton: new Button({
					text: "Close",
					press: function () {
						oDialog.close();
					}
				})
			}).open();
		},
		width: "25%",
		tokens: [
			new Token({ text: "Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, " })
		]
	});

	var oOneLongTokenReadOnlyButton = new ToggleButton({
		text: "Toggle Read-Only mode MI with long token",
		press: function () {
			oOneLongTokenMI.setEditable(!oOneLongTokenMI.getEditable());
		}
	});

	// MultiInput - Read only
	var oMultiInputReadOnly = new MultiInput("multiInputReadOnlyInitial", {
		width: "400px",
		editable: false,
		tokens: [
			new Token({ text: "100", key: "0001" }),
			new Token({ text: "101", key: "0002" }),
			new Token({ text: "102", key: "0003" }),
			new Token({ text: "103", key: "0004" }),
			new Token({ text: "104", key: "0005" }),
			new Token({ text: "105", key: "0006" }),
			new Token({ text: "106", key: "0007" }),
			new Token({ text: "107", key: "000800" }),
			new Token({ text: "108", key: "000600" }),
			new Token({ text: "109", key: "000700" }),
			new Token({ text: "110", key: "000800" })
		]
	}).addStyleClass("sapUiLargeMarginBegin");

	// MultiInput with SelectDialog
	var oSelectDialog = new SelectDialog({
		title: "Search Dialog"
	});

	var openSelectDialog = function () {
		oSelectDialog.open();
	};

	var multiInputWithSelectDialog = new MultiInput("multiInputWithSelectDialog", {
		valueHelpRequest: openSelectDialog,
		enableMultiLineMode: true,
		tokens: [
			new Token("testtoken", {
				key: "Key1",
				text: "Text1"
			}),
			new Token("secondtesttoken", {
				key: "Key2",
				text: "Text2"
			})
		]
	});

	// MultiInput - minimum width
	var oMinWidthMultiInput = new MultiInput("minWidthMI", {
		width: "5rem",
		tokens: [
			new Token({ text: "Token 1", key: "0001" }),
			new Token({ text: "Token 2", key: "0002" }),
			new Token({ text: "Token 3", key: "0003" }),
			new Token({ text: "Lorem ipsum dolor sit amet", key: "0004" }),
			new Token({ text: "Token 5", key: "0005" }),
			new Token({ text: "Token 6", key: "0006" })
		]
	});

	// MultiInput with DataBinding
	var oTokensModel = new JSONModel({
		tokens: [
			{
				key: 'key1',
				text: 'Token 1'
			},
			{
				key: 'key2',
				text: 'Token 2'
			},
			{
				key: 'key3',
				text: 'Token 3'
			}
		]
	});

	var multiInputWithDataBinding = new MultiInput("dataBoundMultiInput", {
		tokenUpdate: function (oEvent) {
			var eventType = oEvent.getParameter("type");

			if (eventType != Tokenizer.TokenUpdateType.Removed) {
				return;
			}

			oEvent.preventDefault();

			let token, tokenKey;
			const removedTokens = oEvent.getParameter("removedTokens"),
				model = oEvent.getSource().getModel();
			let data = model.getData().tokens;


			for (var i = 0; i < removedTokens.length; i++) {
				token = removedTokens[i];
				tokenKey = token.getKey();

				// eslint-disable-next-line no-loop-func
				data = data.filter( (item) => item.key != tokenKey );
			}
			model.setData({
				tokens: data
			});
		},
		tokens: {
			path: '/tokens',
			template: new Token({
				key: '{key}',
				text: '{text}'
			})
		}
	});

	multiInputWithDataBinding.setModel(oTokensModel);
	multiInputWithDataBinding.addValidator(function (args) {
		var text = args.text,
			model = multiInputWithDataBinding.getModel(),
			data = model.getData().tokens;

		for (var i = 0; i < data.length; i++) {
			if (data[i].key == text) {
				return;
			}
		}
		data.push({
			key: text,
			text: text
		});
		model.setData({
			tokens: data
		});
	});

	// MultiInput in a table in condensed mode
	var oCondensedMultiInput = new MultiInput("condensed-multiinput");

	oCondensedMultiInput.setTokens([
		new Token({ text: "Token 1", key: "0001" }),
		new Token({ text: "Token 2", key: "0002" }),
		new Token({ text: "Token 3", key: "0003" })
	]);

	var oCondensedTable = new GridTable("condensed-table", {
		visibleRowCount: 2,
		visibleRowCountMode: "Fixed",
		rows: "{/modelData}"
	}).addStyleClass("sapUiMediumMarginBottom");

	oCondensedTable.addColumn(new GridTableColumn({
		label: "Table with MultiInput (Condensed Mode)",
		template: [
			oCondensedMultiInput
		]
	}));
	oCondensedTable.addStyleClass("sapUiSizeCondensed");
	oCondensedTable.setModel(oModel);

	// MultiInput with suggestions
	var aData = [
		{
			name: "Apple", group: "Fruits"
		}, {
			name: "Pineapple", group: "Fruits"
		}, {
			name: "Apricot", group: "Fruits"
		}, {
			name: "Banana", group: "Fruits"
		}, {
			name: "Tomato", group: "Vegetables"
		}, {
			name: "Asparagus", group: "Vegetables"
		}
	],
		oSuggestionsMultiInput = new MultiInput("mIWithSuggestions", {
			ariaLabelledBy: "suggestionsLabel"
		});
	var oModel = new JSONModel();

	oModel.setData(aData);
	oSuggestionsMultiInput.setModel(oModel);
	oSuggestionsMultiInput.bindAggregation("suggestionItems", {
		path: "/",
		sorter: [new Sorter('group', false, true)],
		template: new Item({ text: "{name}" })
	});

	const oSuggestionsMultiInputRTL = new MultiInput("mi-RTL", {
		placeholder: "MultiInput with RTL Suggestion Items",
		ariaLabelledBy: "suggestionsLabel",
		suggestionItems: [
			new Item({
				text: "Apple", textDirection: TextDirection.RTL
			}),
			new Item({
				text: "Pineapple", textDirection: TextDirection.RTL
			}),
			new Item({
				text: "Apricot", textDirection: TextDirection.RTL
			}),
			new Item({
				text: "Banana", textDirection: TextDirection.RTL
			}),
			new SeparatorItem({
				text: "Veggies", textDirection: TextDirection.RTL
			}),
			new Item({
				text: "Tomato", textDirection: TextDirection.RTL
			}),
			new Item({
				text: "Asparagus", textDirection: TextDirection.RTL
			})
		]
	});

	// MultiInput with suggestions
	var aData2 = [
		{ text: "Long Suggestions Item 2: Quisque sollicitudin libero id aliquam accumsan. Pellentesque a pellentesque lectus. Nullam consequat quam dapibus diam vulputate, iaculis sollicitudin lorem bibendum. Curabitur nec massa vel sem molestie euismod. Curabitur suscipit velit malesuada vulputate tristique. " },
		{ text: "Long Suggestions Item 3: Phasellus lobortis tempor elit, quis ultrices ante hendrerit vel. Nam convallis sit amet ligula lacinia eleifend. Sed tincidunt pharetra ipsum. Aliquam euismod vestibulum elit in finibus." },
		{ text: "Long Suggestions Item 4: Ut vehicula, velit et rhoncus cursus, eros augue ornare ipsum, nec pulvinar nunc orci ut justo. Vivamus eget nisi interdum, faucibus eros et, pulvinar tortor. Maecenas imperdiet porttitor orci ac dignissim. Phasellus lacinia blandit elit. In sollicitudin tristique orci nec varius." }
	],

		oSuggMultiInputPopoverWidth = new MultiInput("mi-long-sugg-small-width", {
			ariaLabelledBy: "suggestionsLabel",
			placeholder: "MultiInput with long suggestion and limited width, type 'L'",
			maxSuggestionWidth: "100%",
			width: "50%"
		});

	var oModel = new JSONModel();

	oModel.setData(aData2);
	oSuggMultiInputPopoverWidth.setModel(oModel);
	oSuggMultiInputPopoverWidth.bindAggregation("suggestionItems", {
		path: "/",
		template: new Item({ text: "{text}" })
	});

	// MultiInput with sticky suggestions header
	var oMultiInputWithStickySuggestions = new MultiInput("multiInputWithStickySuggestions", {
		showSuggestion: true,
		ariaLabelledBy: "stickySuggestionsLabel",
		suggestionColumns: [
			new Column({
				header: new Label({ text: "Name" })
			}),
			new Column({
				header: new Label({ text: "Group" })
			})
		],
		showTableSuggestionValueHelp: false
	});

	var oModel = new JSONModel();
	var aData = [];

	for (var index = 1; index < 30; index++) {
		aData.push({ name: "Apple" + index, group: "Fruits" });
	}

	oModel.setData(aData);
	oMultiInputWithStickySuggestions.setModel(oModel);
	oMultiInputWithStickySuggestions.bindAggregation("suggestionRows", {
		path: "/",
		template: new ColumnListItem({
			cells: [
				new Label({ text: "{name}" }),
				new Label({ text: "{group}" })
			]
		})
	});

	// MultiInput with placeholder and nMore
	const oPlaceholderMultiInput = new MultiInput("mi-placeholder", {
		ariaLabelledBy: "placeholderLabel",
		placeholder: "Placeholder - should appear when no tokens are present",
		width: "50%",
		tokens: [
			new Token({ text: "Cras at eros eleifend, fringilla lectus eu, luctus justo. Mauris vehicula ac dui quis finibus." }),
			new Token({ text: "Morbi pulvinar consectetur tortor sit amet luctus. Nullam condimentum justo sit amet diam malesuada, eu rutrum lorem facilisis." }),
			new Token({ text: "Pellentesque a pellentesque lectus. Nullam consequat quam dapibus diam vulputate, iaculis sollicitudin lorem bibendum." }),
			new Token({ text: "Lorem ipsum" })
		]
	});

	// MultiInput with long suggestions
	const oMultiInputWrapping = new MultiInput("mi-wrapping", {
		placeholder: "MultiInput with wrapping",
		width: "30rem",
		suggestionItems: [
			new Item({ key: "1", text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." }),
			new Item({ key: "2", text: "Item with very long text, wrapping enabled and wrapCharLimit set to а very large number in order to make the whole text always visible, taking as much space as needed." }),
			new Item({ key: "3", text: "Item that not wrap" })
		]
	});

	//*******************************
	var theCompactMode = new CheckBox("compactMode", {
		selected: false,
		select: function () {
			document.getElementById("body").classList.toggle("sapUiSizeCompact");
			Theming.notifyContentDensityChanged();
		}
	});

	// Add a css class to the body HTML element, in order to be used for caret stylization in visual tests run.
	var oCustomCssButton = new Button("customCssButton", {
		text: "Toggle custom CSS for visual test",
		press: function () {
			document.querySelector("body").classList.toggle("customClassForVisualTests");
		}
	});
	//******************************************
	var oPage = new Page("page1", {
		headerContent: [
			new ToolbarSpacer({
				width: "500px"
			}),
			new Title({
				text: "sap.m.MultiInput"
			}),
			new ToolbarSpacer({
				width: "650px"
			}),
			oCustomCssButton
		],
		content: [
			new Label({ labelFor: theCompactMode.getId(), text: "Compact Mode" }),
			theCompactMode,
			oMultiInputCustomValidator,
			oCheckBoxAcceptValidation,
			oMultiInputCustomAsyncValidator,
			oChangeTextValidatorMultiInput,
			new Label({ labelFor: oTabularSuggestMultiInput.getId(), text: "Tabular Suggest MultiInput: ", width: "100%" }),
			oTabularSuggestMultiInput,
			new Label({ labelFor: oSimpleForm.getId(), text: "MultiInput in simple form", width: "100%" }),
			oSimpleForm,
			oWarningMultiInput,
			oErrorMultiInput,
			oSuccessMultiInput,
			oMultiInputValueStateWarningLink,
			oMultiInputValueStateErrorLinks,
			oMultiInputValueStateSuccessLinks,
			new Label({ labelFor: oNotEditableMI.getId(), text: "MultiInput.editable = false", width: "100%" }),
			oNotEditableMI,
			new Label({ labelFor: oTable.getId(), text: "token databinding in MultiInput" }),
			oTable,
			new Label({ labelFor: oMaxThreeTokensMI.getId(), text: "MultiInput with maximum three tokens" }),
			oMaxThreeTokensMI,
			new Label({ labelFor: oNotEditableTokensMI.getId(), text: "MultiInput with toggle button for read only" }),
			oNotEditableTokensMI,
			readOnlyButton,
			new Label({ labelFor: oOneLongTokenMI.getId(), text: "One token with extra long text", width: "100%" }),
			oOneLongTokenMI,
			oOneLongTokenReadOnlyButton,
			oMultiInputReadOnly,
			new Label({ labelFor: multiInputWithSelectDialog.getId(), text: "MultiInput with SelectDialog", width: "100%" }),
			multiInputWithSelectDialog,
			new Label({ labelFor: oMinWidthMultiInput.getId(), text: "MultiInput with N-more and limited width", width: "100%" }),
			oMinWidthMultiInput,
			new Label({ labelFor: multiInputWithDataBinding.getId(), text: "MultiInput with DataBinding", width: "100%" }),
			multiInputWithDataBinding,
			oCondensedTable,
			new Label("suggestionsLabel", { text: "MultiInput with suggestions", labelFor: "mIWithSuggestions" }),
			oSuggestionsMultiInput,
			new Label("suggestionsRTLLabel", { text: "MultiInput with RTL Items", labelFor: "mi-rtl" }),
			oSuggestionsMultiInputRTL,
			new Label("stickySuggestionsLabel", { text: "MultiInput with sticky suggestions header", labelFor: "multiInputWithStickySuggestions" }),
			oMultiInputWithStickySuggestions,
			new Label("longSuggestionsLabel", { text: "MultiInput with small width and long suggestions", width: "100%", labelFor: "mi-long-sugg-small-width" }),
			oSuggMultiInputPopoverWidth,
			new Label("placeholderLabel", { text: "MultiInput with nMore and placeholder", width: "100%", labelFor: "mi-placeholder" }),
			oPlaceholderMultiInput,
			new Label("wrappingLabel", { text: "MultiInput with suggestions wrapping", width: "100%", labelFor: "mi-wrapping" }),
			oMultiInputWrapping
		]
	}).addStyleClass("sapUiContentPadding");

	var oApp = new App("myApp", {
		initialPage: "page1"
	});

	oApp.setModel(oModel);
	oApp.addPage(oPage);
	oApp.placeAt("body");
});