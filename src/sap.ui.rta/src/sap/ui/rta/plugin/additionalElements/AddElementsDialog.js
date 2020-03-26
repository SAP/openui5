/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/m/Label",
	"sap/m/Dialog",
	"sap/ui/model/json/JSONModel",
	"sap/m/SearchField",
	"sap/m/Button",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/List",
	"sap/m/CustomListItem",
	"sap/m/ScrollContainer",
	"sap/ui/model/Sorter",
	"sap/base/Log",
	"sap/m/VBox",
	"sap/ui/rta/Utils",
	"sap/m/library",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Text"
], function(
	ManagedObject,
	Label,
	Dialog,
	JSONModel,
	SearchField,
	Button,
	Toolbar,
	ToolbarSpacer,
	Filter,
	FilterOperator,
	List,
	ListItem,
	ScrollContainer,
	Sorter,
	Log,
	VBox,
	Utils,
	mobileLibrary,
	VerticalLayout,
	Text
) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.ListType
	var ListType = mobileLibrary.ListType;

	// shortcut for sap.m.LabelDesign
	var LabelDesign = mobileLibrary.LabelDesign;

	/**
	 * Constructor for a new sap.ui.rta.plugin.additionalElements.AddElementsDialog control.
	 *
	 * @class Context - Dialog for available Fields in Runtime Authoring
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.44
	 * @alias sap.ui.rta.plugin.additionalElements.AddElementsDialog
	 * @experimental Since 1.44. This class is experimental and provides only limited functionality. Also the API might be
	 *			   changed in future.
	 */
	var AddElementsDialog = ManagedObject.extend("sap.ui.rta.plugin.additionalElements.AddElementsDialog", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				customFieldEnabled : {
					type: "boolean",
					defaultValue: false
				},
				businessContextVisible : {
					type: "boolean",
					defaultValue: false
				},
				title : {
					type: "string"
				}
			},
			events : {
				opened : {},
				openCustomField : {}
			}
		}
	});

	/**
	 * Initialize the Dialog
	 *
	 * @private
	 */
	AddElementsDialog.prototype.init = function() {
		// Get messagebundle.properties for sap.ui.rta
		this._oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		this._bAscendingSortOrder = false;
		// sap.m.Dialog shouldn't have no parent or a rendered parent
		// otherwise invalidate/filter/... is not working correctly
		this._oDialog = new Dialog().addStyleClass("sapUIRtaFieldRepositoryDialog");
		this._oDialog.addStyleClass(Utils.getRtaStyleClassName());
		this._oDialog.removeStyleClass("sapUiPopupWithPadding");
		this._oDialog.setModel(new JSONModel({
			elements: []
		}));

		var aContent = this._createContent();
		var aButtons = this._createButtons();
		aContent.forEach(function(oContent) {
			this._oDialog.addContent(oContent);
		}, this);
		aButtons.forEach(function(oButton) {
			this._oDialog.addButton(oButton);
		}, this);
		this._oDialog.setInitialFocus(this._oInput);
	};

	AddElementsDialog.prototype.exit = function() {
		this._oDialog.destroy();
	};

	/**
	 * Create the Content of the Dialog
	 *
	 * @returns {object} list containes inputList and oScrollContainer objects
	 * @private
	 */
	AddElementsDialog.prototype._createContent = function() {
		// SearchField
		this._oInput = new SearchField({
			width : "100%",
			liveChange : [this._updateModelFilter, this]
		});

		// Button for sorting the List
		var oResortButton = new Button({
			text : "",
			icon : "sap-icon://sort",
			press : [this._resortList, this]
		});

		// Button for creating Custom Fields
		this._oCustomFieldButton = new Button({
			text : "",
			icon : "sap-icon://add",
			tooltip : this._oTextResources.getText("BTN_FREP_CCF"),
			enabled : this.getCustomFieldEnabled(),
			press : [this._redirectToCustomFieldCreation, this]
		});

		// Toolbar
		this._oToolbarSpacer1 = new ToolbarSpacer();
		this.oInputFields = new Toolbar({
			content: [this._oInput, oResortButton, this._oToolbarSpacer1, this._oCustomFieldButton]
		});

		//Business Context Display
		this._oBCContainer = new VerticalLayout({
			visible: this.getBusinessContextVisible(),
			content: [new Text({
				text: this._oTextResources.getText("BUSINESS_CONTEXT_TITLE")
			})
			]
		}).addStyleClass("sapUIRtaBusinessContextContainer");

		// Fields of the List
		var oFieldName = new Label({
			design: LabelDesign.Standard,
			text: {
				parts: [{path: "label"}, {path: "referencedComplexPropertyName"}, {path: "duplicateComplexName"}],
				formatter: function(sLabel, sReferencedComplexPropertyName, bDuplicateComplexName) {
					if (bDuplicateComplexName && sReferencedComplexPropertyName) {
						sLabel += " (" + sReferencedComplexPropertyName + ")";
					}
					return sLabel;
				}
			}
		});

		var oFieldName2 = new Label({
			text: {
				parts: [{path: "originalLabel"}],
				formatter: function(sOriginalLabel) {
					if (sOriginalLabel) {
						return this._oTextResources.getText("LBL_FREP", sOriginalLabel);
					}
					return "";
				}.bind(this)
			},
			visible: {
				parts: [{path: "originalLabel"}],
				formatter: function(sOriginalLabel) {
					if (sOriginalLabel) {
						return true;
					}
					return false;
				}
			}
		});

		var oVBox = new VBox();
		oVBox.addItem(oFieldName);
		oVBox.addItem(oFieldName2);

		// List
		var oSorter = new Sorter("label", this._bAscendingSortOrder);
		this._oList = new List(
			{
				mode : "MultiSelect",
				includeItemInSelection : true,
				growing : true,
				growingScrollToLoad : true
			}).setNoDataText(this._oTextResources.getText("MSG_NO_FIELDS", this._oTextResources.getText("MULTIPLE_CONTROL_NAME").toLowerCase()));

		var oListItem = new ListItem({
			type: ListType.Active,
			selected : "{selected}",
			tooltip: "{tooltip}",
			content : [oVBox]
		}).addStyleClass("sapUIRtaListItem");

		this._oList.bindItems({
			path:"/elements",
			template: oListItem,
			sorter: oSorter,
			templateShareable: false,
			//Extended Change Detection via "key" property see docs: #/topic/7cdff73f308b4b10bdf7d83b7aba72e7 -
			key: function (oContext) {
				switch (oContext.getProperty("type")) {
					case "invisible":
						return oContext.getProperty("elementId");
					case "odata":
						return oContext.getProperty("name");
					case "delegate":
						return oContext.getProperty("name");
					case "custom":
						return oContext.getProperty("key");
					default:
						Log.error("sap.ui.rta.plugin.additionalElements.AddElementsDialog#_createContent: unsupported data type");
				}
			}
		});

		// Scrollcontainer containing the List
		// Needed for scrolling the List
		var oScrollContainer = new ScrollContainer({
			content: this._oList,
			vertical: true,
			horizontal: false
		}).addStyleClass("sapUIRtaCCDialogScrollContainer");

		return [this.oInputFields,
			this._oBCContainer,
			oScrollContainer];
	};

	/**
	 * Create the Buttons of the Dialog (OK/Cancel)
	 *
	 * @returns {object} list containes ok button and cancel button objects
	 * @private
	 */
	AddElementsDialog.prototype._createButtons = function() {
		this._oOKButton = new Button({
			text : this._oTextResources.getText("BTN_FREP_OK"),
			press : [this._submitDialog, this],
			type: ButtonType.Emphasized
		});
		var oCancelButton = new Button({
			text : this._oTextResources.getText("BTN_FREP_CANCEL"),
			press : [this._cancelDialog, this]
		});
		return [this._oOKButton, oCancelButton];
	};

	/**
	 * Close the dialog.
	 */
	AddElementsDialog.prototype._submitDialog = function() {
		this._oDialog.close();
		this._fnResolve();
	};

	/**
	 * Close dialog and revert all change operations
	 */
	AddElementsDialog.prototype._cancelDialog = function() {
		// clear all variables
		this._oList.removeSelections();
		this._oDialog.close();
		this._fnReject();
	};

	AddElementsDialog.prototype.setElements = function(aElements) {
		this._oDialog.getModel().setProperty("/elements", aElements);
	};

	AddElementsDialog.prototype.getElements = function() {
		return this._oDialog.getModel().getProperty("/elements");
	};

	AddElementsDialog.prototype.getSelectedElements = function() {
		return this._oDialog.getModel().getObject("/elements").filter(function(oElement) {
			return oElement.selected;
		});
	};

	/**
	 * Open the Field Repository Dialog
	 *
	 * @param {sap.ui.core.Control} oControl Currently selected control
	 * @returns {Promise} empty promise
	 * @public
	 */
	AddElementsDialog.prototype.open = function () {
		return new Promise(function (resolve, reject) {
			this._fnResolve = resolve;
			this._fnReject = reject;
			this._oDialog.attachAfterOpen(function () {
				this.fireOpened();
			}.bind(this));
			// Makes sure the modal div element does not change the size of our application (which would result in
			// recalculation of our overlays)
			this._oDialog.open();
		}.bind(this));
	};

	/**
	 * Resort the list
	 *
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	AddElementsDialog.prototype._resortList = function () {
		this._bAscendingSortOrder = !this._bAscendingSortOrder;
		var oBinding = this._oList.getBinding("items");
		var aSorter = [];
		aSorter.push(new Sorter("label", this._bAscendingSortOrder));
		oBinding.sort(aSorter);
	};

	/**
	 * Updates the model on filter events
	 *
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	AddElementsDialog.prototype._updateModelFilter = function(oEvent) {
		var sValue = oEvent.getParameter("newValue");
		var oBinding = this._oList.getBinding("items");
		if ((typeof sValue) === "string") {
			var oFilterLabel = new Filter("label", FilterOperator.Contains, sValue);
			var oOriginalLabelFilter = new Filter("originalLabel", FilterOperator.Contains, sValue);
			var oReferencedComplexPropertyNameFilter = new Filter("referencedComplexPropertyName", FilterOperator.Contains, sValue);
			var oDuplicateComplexNameFilter = new Filter("duplicateComplexName", FilterOperator.EQ, true);
			var oComplexNameFilter = new Filter({ filters: [oReferencedComplexPropertyNameFilter, oDuplicateComplexNameFilter], and: true });
			var oFilterLabelOrInfo = new Filter({ filters: [oFilterLabel, oOriginalLabelFilter, oComplexNameFilter], and: false });
			oBinding.filter([oFilterLabelOrInfo]);
		} else {
			oBinding.filter([]);
		}
	};

	/**
	 * Fire an event to redirect to custom field creation
	 *
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	AddElementsDialog.prototype._redirectToCustomFieldCreation = function () {
		this.fireOpenCustomField();
		this._oDialog.close();
	};

	AddElementsDialog.prototype.setTitle = function(sTitle) {
		ManagedObject.prototype.setProperty.call(this, "title", sTitle, true);
		this._oDialog.setTitle(sTitle);
	};

	/**
	 * Enables the Custom Field Creation button
	 *
	 * @param {boolean} bCustomFieldEnabled true shows the button, false not
	 * @public
	 */
	AddElementsDialog.prototype.setCustomFieldEnabled = function(bCustomFieldEnabled) {
		this.setProperty("customFieldEnabled", bCustomFieldEnabled, true);
		this._oCustomFieldButton.setEnabled(this.getProperty("customFieldEnabled"));
	};

	/**
	 * Sets the visibility of the business context container
	 *
	 * @param {boolean} bBusinessContextVisible - Indicates whether the container is visible
	 * @private
	 */
	AddElementsDialog.prototype._setBusinessContextVisible = function(bBusinessContextVisible) {
		this.setProperty("businessContextVisible", bBusinessContextVisible, true);
		this._oBCContainer.setVisible(this.getProperty("businessContextVisible"));
	};

	/**
	 * Returns list control
	 * @returns {sap.m.List}
	 */
	AddElementsDialog.prototype.getList = function () {
		return this._oList;
	};

	/**
	 * Adds available business contexts
	 * @param (object[]} aBusinessContexts - Array containing business contexts
	 * @public
	 */
	AddElementsDialog.prototype.addBusinessContext = function (aBusinessContexts) {
		// clear old values from last run
		this._removeBusinessContexts();
		// Message "none" when no business contexts are available
		var oBCDescription = new Text({
			text: this._oTextResources.getText("MSG_NO_BUSINESS_CONTEXTS")
		});
		if (aBusinessContexts && aBusinessContexts.length > 0) {
			aBusinessContexts.forEach(function (oContext) {
				oBCDescription = new Text({
					text: oContext.BusinessContextDescription
				});
				this._oBCContainer.addContent(oBCDescription);
			}, this);
		} else {
			this._oBCContainer.addContent(oBCDescription);
		}
		// set the container visible
		this._setBusinessContextVisible(true);
	};

	/**
	 * Removes business contexts from the vertical layout
	 * (except for the title)
	 * @private
	 */
	AddElementsDialog.prototype._removeBusinessContexts = function () {
		var nIndex;
		var nElementsCount = this._oBCContainer.getContent().length;
		for (nIndex = 0; nIndex < nElementsCount; nIndex++) {
			this._oBCContainer.removeContent(1);
		}
	};

	return AddElementsDialog;
});
