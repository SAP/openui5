/*!
 * ${copyright}
 */

// Provides control sap.ui.rta.appVariant.AppVariantDialog.
sap.ui.define([
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/DialogRenderer",
	"sap/m/GenericTile",
	"sap/m/ImageContent",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/SelectDialog",
	"sap/m/StandardListItem",
	"sap/m/TextArea",
	"sap/m/TileContent",
	"sap/m/VBox",
	"sap/ui/core/Title",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/Utils",
	// needs to be preloaded for the test to work
	"sap/ui/layout/form/ResponsiveGridLayout"
],
function(
	Button,
	Dialog,
	DialogRenderer,
	GenericTile,
	ImageContent,
	Input,
	Label,
	SelectDialog,
	StandardListItem,
	TextArea,
	TileContent,
	VBox,
	Title,
	SimpleForm,
	Filter,
	JSONModel,
	RtaUtils
) {
	"use strict";

	var oResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
	var oDataSet;
	var oTitleLabel;
	var oTitleInput;
	var oSubTitleLabel;
	var oSubTitleInput;
	var oDescriptionLabel;
	var oDescriptionText;
	var oIconLabel;
	var oIconInput;
	var oSimpleForm;
	var oSelectDialog;
	var oCustomTileModel;
	var oSelectDialogModel;

	function _createTile() {
		oDataSet = new GenericTile("tile", {
			header: "{/title}",
			subheader: "{/subtitle}",
			ariaLabel: oResources.getText("APP_VARIANT_TILE_ARIA_LABEL"),
			tileContent: [
				new TileContent({
					content: [
						new ImageContent({
							src: "{/icon}"
						})
					]
				})
			]
		}).addStyleClass("sapUiMediumMarginBegin").addStyleClass("sapUiTinyMarginTop").addStyleClass("sapUiTinyMarginBottom");
	}

	function _handleSearch(oEvent) {
		var sValue = oEvent.getParameter("value");
		var oFilter = new Filter("name", sap.ui.model.FilterOperator.Contains, sValue);
		var oBinding = oEvent.getSource().getBinding("items");
		oBinding.filter([oFilter]);
	}

	function _handleClose(oEvent) {
		var aContexts = oEvent.getParameter("selectedContexts");

		if (aContexts && aContexts.length) {
			aContexts.forEach(function(oContext) {
				var newValue = oContext.getObject().name;
				oIconInput.setValue(newValue);
				oCustomTileModel.setProperty("/icon", oContext.getObject().icon);
			});
		}

		oEvent.getSource().getBinding("items").filter([]);
	}

	function _handleSelectDialog() {
		if (!oSelectDialog) {
			oSelectDialog = new SelectDialog("selectDialog", {
				noDataText: oResources.getText("APP_VARIANT_ICON_NO_DATA"),
				title: oResources.getText("APP_VARIANT_ICON_SELECT_ICON"),
				search: function(oEvent) {
					_handleSearch(oEvent);
				},
				confirm: function(oEvent) {
					_handleClose(oEvent);
				},
				cancel: function(oEvent) {
					_handleClose(oEvent);
				}
			});
		}

		oSelectDialog.addStyleClass(RtaUtils.getRtaStyleClassName());

		oSelectDialog.bindAggregation("items", {
			path:"/icons",
			template: new StandardListItem({
				title: "{name}",
				description: "",
				icon: "{icon}",
				iconDensityAware: false,
				iconInset: false,
				type: "Active"
			})
		});

		var aUI5Icons = sap.ui.core.IconPool.getIconNames();
		var aIcons = [];

		aUI5Icons.forEach(function(sName) {
			aIcons.push({
				icon: sap.ui.core.IconPool.getIconInfo(sName).uri,
				name : sName.toLowerCase()
			});
		});

		oSelectDialogModel.setProperty("/icons", aIcons);

		oSelectDialog.setModel(oSelectDialogModel);
		oSelectDialog.getBinding("items").filter([]);

		oSelectDialog.open();
	}

	function _createTileAttributes() {
		oTitleLabel = new Label({
			required: true,
			text: oResources.getText("APP_DIALOG_TITLE_TEXT"),
			textAlign: "Left"
		});

		oTitleInput = new Input("titleInput", {
			value: "{/title}",
			valueLiveUpdate: true,
			placeholder: oResources.getText("SAVE_AS_DIALOG_PLACEHOLDER_TITLE_TEXT"),
			liveChange: function() {
				var oSaveButton = sap.ui.getCore().byId("saveButton");
				if (this.getValue() === "") {
					this.setValueState(sap.ui.core.ValueState.Error);  // if the field is empty after change, it will go red
					oSaveButton.setEnabled(false);
				} else {
					this.setValueState(sap.ui.core.ValueState.None); // if the field is not empty after change, the value state (if any) is removed
					oSaveButton.setEnabled(true);
				}
			}
		});

		oSubTitleLabel = new Label({
			text: oResources.getText("APP_DIALOG_SUB_TITLE_TEXT"),
			textAlign: "Left"
		});

		oSubTitleInput = new Input({
			value: "{/subtitle}",
			valueLiveUpdate: true
		});

		oDescriptionLabel = new Label({
			text: oResources.getText("APP_DIALOG_DESCRIPTION_TEXT"),
			textAlign: "Left"
		});

		oDescriptionText = new TextArea({
			rows: 4
		});

		oIconLabel = new Label({
			text: oResources.getText("APP_DIALOG_ICON_TEXT"),
			textAlign: "Left"
		});

		oIconInput = new Input("selectInput", {
			showValueHelp: true,
			liveChange: function(oEvent) {
				_handleSelectDialog(oEvent);
			},
			valueHelpRequest: function(oEvent) {
				_handleSelectDialog(oEvent);
			},
			value: "{/iconname}",
			valueLiveUpdate: true
		});
	}

	function _createSimpleForm() {
		oSimpleForm = new SimpleForm({
			editable: true,
			layout: "ResponsiveGridLayout",
			labelSpanXL: 4,
			labelSpanL: 4,
			labelSpanM: 4,
			labelSpanS: 4,
			adjustLabelSpan: false,
			emptySpanXL: 0,
			emptySpanL: 0,
			emptySpanM: 0,
			emptySpanS: 0,
			columnsXL: 2,
			columnsL: 2,
			columnsM: 2,
			singleContainerFullSize: false,
			content: [
				new Title("title1"),
				oTitleLabel,
				oTitleInput,
				oSubTitleLabel,
				oSubTitleInput,
				oIconLabel,
				oIconInput,
				oDescriptionLabel,
				oDescriptionText,
				new Title("title2"),
				oDataSet
			]
		});

		return oSimpleForm;
	}

	function _createContentList() {
		var oVBox = new VBox({
			items: [
				_createSimpleForm()
			]
		}).addStyleClass("sapUISmallMargin");

		return oVBox;
	}

	var AppVariantDialog = Dialog.extend("sap.ui.rta.appVariant.AppVariantDialog", {
		metadata : {
			library : "sap.ui.rta",
			events : {

				/**
				 * This event will be fired when the user clicks the Create button on the dialog.
				 */
				create : {},

				/**
				 * This event will be fired when the user clicks the Cancel button on the dialog.
				 */
				cancel : {}
			}
		},
		init: function() {
			Dialog.prototype.init.apply(this);

			// initialize dialog and create member variables.
			this.setTitle(oResources.getText("CREATE_APP_VARIANT_DIALOG_TITLE"));
			this.setContentWidth("620px");
			this.setContentHeight("250px");

			oCustomTileModel = new JSONModel({
				title: null,
				subtitle: null,
				icon: " ", // icon is a blank string because otherwise it would read undefined in ariaLabel
				iconname: null
			});

			oSelectDialogModel = new JSONModel({
				icons: null
			});

			sap.ui.getCore().setModel(oCustomTileModel);

			_createTile();
			_createTileAttributes();

			this.addContent(_createContentList());

			// create, and cancel buttons.
			this._createButtons();
			this.addStyleClass(RtaUtils.getRtaStyleClassName());
		},
		onAfterRendering: function() {
			document.getElementById('title1').style.height = "0px";
			document.getElementById('title2').style.height = "0px";
			document.getElementById('tile').style.float = "left";
		},
		_onCreate: function() {
			var sTitle = oTitleInput.getValue() || " ";
			var sSubTitle = oSubTitleInput.getValue() || " ";
			var sDescription = oDescriptionText.getValue() || " ";

			var sIconValue = oIconInput.getValue() ? sap.ui.core.IconPool.getIconInfo(oIconInput.getValue()).uri : " ";

			this.fireCreate({
				title: sTitle,
				subTitle: sSubTitle,
				description: sDescription,
				icon: sIconValue
			});

			this.close();
			this.destroy();
		},
		_createButtons: function() {
			this.addButton(new Button("saveButton", {
				text: oResources.getText("APP_VARIANT_DIALOG_SAVE"),
				tooltip: oResources.getText("TOOLTIP_APP_VARIANT_DIALOG_SAVE"),
				enabled: false,
				press: function() {
					this._onCreate();
				}.bind(this)
			}));

			this.addButton(new Button({
				text: oResources.getText("SAVE_AS_APP_VARIANT_DIALOG_CANCEL"),
				tooltip: oResources.getText("TOOLTIP_SAVE_AS_APP_VARIANT_DIALOG_CANCEL"),
				press: function() {
					this.fireCancel();
					this.close();
					this.destroy();
				}.bind(this)
			}));
		},
		destroy: function() {
			if (oCustomTileModel) {
				oCustomTileModel.destroy();
			}
			Dialog.prototype.destroy.apply(this, arguments);
		},
		renderer: DialogRenderer.render
	});

	return AppVariantDialog;
});