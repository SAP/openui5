sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/m/App",
	"sap/m/Button",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/List",
	"sap/m/MessageBox",
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
	"sap/m/FormattedText",
	"sap/m/Link",
	"sap/m/Dialog",
	"sap/m/ToolbarSpacer",
	"sap/m/Title"
], function(JSONModel, App, Button, Column, ColumnListItem, Label, List, MessageBox, MultiInput, Page, StandardListItem, Table, Text, Token, coreLibrary, Theming, GridTable, GridTableColumn, CheckBox, FormattedText, Link, Dialog, ToolbarSpacer, Title) {
	"use strict";

	// var TextDirection = coreLibrary.TextDirection;

	 //*******************************
	var oEventList = new List();
	var fEventWriter = function(eventArgs){
		var type = eventArgs.getParameter("type");
		var item = null;
		if (type === "tokensChanged"){
			item = new StandardListItem({title: "type of TokenChange event: " + type + " added: " + eventArgs.getParameter("addedTokens").length + " removed: " + eventArgs.getParameter("removedTokens").length});
		} else {
			item = new StandardListItem({title: "type of TokenChange event: " + type});
		}
		oEventList.addItem(item);
	};

	var fValueHelpRequested = function(evt) {
		MessageBox.alert("Value help requested");
	};
	//*******************************

	// MultiInput with tokens validated by custom validator
	var oCheckBoxAcceptValidation = new CheckBox({text: "Accept tokens", selected: true}),
		oMultiInputCustomValidator = new MultiInput("multiInputCustomValidator",{
			placeholder: "tokens validated by custom validator",
			valueHelpRequest: fValueHelpRequested,
			tokenChange: fEventWriter,
			width:"85%",
			ariaLabelledBy: "singleLineMode-label"
		});

	oMultiInputCustomValidator.setTokens([
		new Token({text: "Token 1 with a much much much longer text than the rest", key: "0001"}),
		new Token({text: "Token 2", key: "0002"}),
		new Token({text: "Token 3", key: "0003"}),
		new Token({text: "Token 4", key: "0004"})
	]);
	oMultiInputCustomValidator.addValidator(function(args){
		if (oCheckBoxAcceptValidation.getSelected()){
			var text = args.text;
			return new Token({key: text, text: "\"" + text + "\""});
		}
	});
	oMultiInputCustomValidator.addValidator(function(args){
		MessageBox.confirm("Do you really want to add this token?", {
			onClose: function(oAction) {
				if (oAction === MessageBox.Action.OK){
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
	var oMultiInputCustomAsyncValidator = new MultiInput("multiInputCustomAsyncValidator",{
		placeholder: "tokens get validated asynchronously after 500ms + 500ms",
		valueHelpRequest: fValueHelpRequested,
		tokenChange: fEventWriter,
		ariaLabelledBy: "singleLineMode-label"
	});

	var fValidator = function(args){
		window.setTimeout(function(){
			args.asyncCallback(new Token({text: args.text}));
		},500);
		return oMultiInputCustomAsyncValidator.WaitForAsyncValidation;
	};
	oMultiInputCustomAsyncValidator.addValidator(fValidator);
	oMultiInputCustomAsyncValidator.addValidator(fValidator);

	// MultiInput - Warning value state
	var oWarningMultiInput = new MultiInput("mIWarning", {
		placeholder: "Placeholder text",
		valueState: "Warning",
		valueStateText: "Simple value state warning text",
		width: "33%"
	});

	// MultiInput - Error value state
	var oErrorMultiInput = new MultiInput("mIError", {
		placeholder: "Placeholder text",
		valueStateText: "Simple value state error text",
		valueState: "Error",
		width: "33%"
	});

	// MultiInput - Success value state
	var oSuccessMultiInput = new MultiInput("mISuccess", {
		placeholder: "Placeholder text",
		valueState: "Success",
		width: "33%"
	});

	// MultiInput - Formatted value state text with link (warning)
	var oMultiInputValueStateWarningLink = new MultiInput("mIFVSWarning", {
		placeholder: "Warning value message text with link",
		valueState: "Warning",
		width: "33%",
		formattedValueStateText: new FormattedText({
			htmlText: "Warning value state message with formatted text containing %%0",
			controls: [
				new Link({
					text: "link",
					href: ""
				})
			]
		})
	});

	// MultiInput - Formatted value state text with multiple links (error)
	var oMultiInputValueStateErrorLinks = new MultiInput("mIFVSError", {
		placeholder: "Error value message text with multiple links",
		valueState: "Error",
		valueHelpRequest: fValueHelpRequested,
		width: "33%",
		formattedValueStateText: new FormattedText({
			htmlText: "Warning value state message with formatted text containing %%0 %%1",
			controls: [
				new Link({
					text: "multiple",
					href: "#"
				}),
				new Link({
					text: "links",
					href: "#"
				})
			]
		})
	});

	// MultiInput - Not editable with editable and not editable tokens
	var oNotEditableMI = new MultiInput("multiInputNotEditable", {
		value : "Some text",
		tokens: [
			new Token({text: "Token 1", key: "0001"}),
			new Token({text: "Token 2", key: "0002"}),
			new Token({text: "Token 3", key: "0003"}),
			new Token({text: "Token 4", key: "0004"})
		],
		editable: false
	});

	oNotEditableMI.setTokens([
		new Token({text: "Token 1", key: "0001"}),
		new Token({text: "Token 2", key: "0002", editable: false}),
		new Token({text: "Token 3", key: "0003"}),
		new Token({text: "Token 4 with a long text", key: "0004", editable: false})
	]);

	// MultiInput - data binding example
	// JSON sample data
	var data = {
		modelData:[
			{lastName:"Doe",gender:"Male"},
			{lastName:"Ali",gender:"Female"}
		]};

	// create JSON model instance
	var oModel = new JSONModel();

	// set the data for the model
	oModel.setData(data);

	// define the template
	var oItemTemplate = new ColumnListItem({
		cells : [
			new Label({
				text: "{lastName}"
			}),
			new MultiInput({
				tokens:[
					new Token({text:"{lastName}", key:"{lastName}"}),
					new Token({text:"{gender}", key:"{gender}"})
				]
			})
		]
	});
	var aColumns = [
		new Column({
			header : new Label({
				text : "LastName"
			}),
			width: "100px"
		}),
		new Column({
			header : new Label({
				text : "LastName + Gender"
			})
		})
	];

	var oTable = new Table("tableTamplate", { columns : aColumns});
	oTable.bindItems("/modelData", oItemTemplate);

	// MultiInput - editable and not editable tokens
	var oNotEditableTokensMI = new MultiInput("multiInputReadOnlyTokens", {
		width : "60%",
		tokens : [
			new Token({text: "Token 1", key: "0001"}),
			new Token({text: "Token 2", key: "0002", editable : false}),
			new Token({text: "Token 3", key: "0003"}),
			new Token({text: "Token 4", key: "0004", editable : false})
		]
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
		width:"25%",
		tokens: [
			new Token({text: "Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, "})
		]
	});

	// MultiInput - Read only
	var oMultiInputReadOnly = new MultiInput("multiInputReadOnlyInitial", {
		width : "400px",
		editable: false,
		tokens : [
			new Token({text: "100", key: "0001"}),
			new Token({text: "101", key: "0002"}),
			new Token({text: "102", key: "0003"}),
			new Token({text: "103", key: "0004"}),
			new Token({text: "104", key: "0005"}),
			new Token({text: "105", key: "0006"}),
			new Token({text: "106", key: "0007"}),
			new Token({text: "107", key: "000800"}),
			new Token({text: "108", key: "000600"}),
			new Token({text: "109", key: "000700"}),
			new Token({text: "110", key: "000800"})
		]
	}).addStyleClass("sapUiLargeMarginBegin");

	// MultiInput - minimum width
	var oMinWidthMultiInput =  new MultiInput("minWidthMI", {
		width: "5rem",
		tokens: [
			new Token({text: "Token 1", key: "0001"}),
			new Token({text: "Token 2", key: "0002"}),
			new Token({text: "Token 3", key: "0003"}),
			new Token({text: "Lorem ipsum dolor sit amet", key: "0004"}),
			new Token({text: "Token 5", key: "0005"}),
			new Token({text: "Token 6", key: "0006"})
		]
	});

	// MultiInput in a table in condensed mode
	var oCondensedMultiInput = new MultiInput("condensed-multiinput");

	oCondensedMultiInput.setTokens([
		new Token({text: "Token 1", key: "0001"}),
		new Token({text: "Token 2", key: "0002"}),
		new Token({text: "Token 3", key: "0003"})
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

	//*******************************
	var theCompactMode = new CheckBox("compactMode", {
		selected: false,
		select : function() {
			document.getElementById("body").classList.toggle("sapUiSizeCompact");
			Theming.notifyContentDensityChanged();
		}
	});

	// Add a css class to the body HTML element, in order to be used for caret stylization in visual tests run.
	var oCustomCssButton = new Button("customCssButton",{
		text: "Toggle custom CSS for visual test",
		press: function() {
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
			new Label({labelFor: theCompactMode.getId(), text: "Compact Mode"}),
			theCompactMode,
			oMultiInputCustomValidator,
			oCheckBoxAcceptValidation,
			oMultiInputCustomAsyncValidator,
			oWarningMultiInput,
			oErrorMultiInput,
			oSuccessMultiInput,
			oMultiInputValueStateWarningLink,
			oMultiInputValueStateErrorLinks,
			new Label({labelFor: oNotEditableMI.getId(), text: "MultiInput.editable = false", width:"100%"}),
			oNotEditableMI,
			new Label({labelFor: oTable.getId(), text : "token databinding in MultiInput"}),
			oTable,
			new Label({labelFor: oNotEditableTokensMI.getId(), text:"MultiInput with toggle button for read only"}),
			oNotEditableTokensMI,
			new Label({labelFor: oOneLongTokenMI.getId(), text : "One token with extra long text", width:"100%"}),
			oOneLongTokenMI,
			oMultiInputReadOnly,
			new Label({labelFor: oMinWidthMultiInput.getId(), text : "MultiInput with N-more and limited width", width: "100%"}),
			oMinWidthMultiInput,
			oCondensedTable
		]
	}).addStyleClass("sapUiContentPadding");

	var oApp = new App("myApp", {
		initialPage: "page1"
	});

	oApp.setModel(oModel);
	oApp.addPage(oPage);
	oApp.placeAt("body");
});