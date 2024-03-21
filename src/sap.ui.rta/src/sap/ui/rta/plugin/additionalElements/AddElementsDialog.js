/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Element",
	"sap/ui/core/Fragment",
	"sap/ui/core/Lib",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/Sorter",
	"sap/ui/rta/Utils"
], function(
	ManagedObject,
	Element,
	Fragment,
	Lib,
	JSONModel,
	Filter,
	FilterOperator,
	ResourceModel,
	Sorter,
	Utils
) {
	"use strict";

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
	 */
	var AddElementsDialog = ManagedObject.extend("sap.ui.rta.plugin.additionalElements.AddElementsDialog", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				businessContextVisible: {
					type: "boolean",
					defaultValue: false
				},
				title: {
					type: "string"
				}
			},
			events: {
				opened: {},
				triggerExtensibilityAction: {}
			}
		}
	});

	var oRTAResourceModel;

	/**
	 * Initialize the Dialog
	 *
	 * @private
	 */
	AddElementsDialog.prototype.init = function() {
		this._oDialogPromise = Fragment.load({
			id: this.getId(),
			name: "sap.ui.rta.plugin.additionalElements.AddElementsDialog",
			controller: this
		});

		this._oDialogModel = new JSONModel({
			elements: [],
			customFieldButtonText: "",
			customFieldButtonVisible: false,
			businessContextVisible: false,
			customFieldButtonTooltip: "",
			businessContextTexts: [{text: ""}], // empty element in first place to be replaced by the headerText (see: addExtensibilityInfo)
			extensibilityMenuButtonActive: false,
			extensibilityMenuButtonText: "",
			extensibilityMenuButtonTooltip: "",
			extensibilityOptions: []
		});

		this._oDialogPromise.then(function(oDialog) {
			oDialog.setModel(this._oDialogModel);
			oRTAResourceModel ||= new ResourceModel({bundleName: "sap.ui.rta.messagebundle"});
			oDialog.setModel(oRTAResourceModel, "i18n");

			oDialog.addStyleClass(Utils.getRtaStyleClassName());

			this._oDialogModel.setProperty("/listNoDataText", oRTAResourceModel.getProperty("MSG_NO_FIELDS").toLowerCase());

			// retrieve List to set the sorting for the 'items' aggregation, since sap.ui.model.Sorter
			// does not support binding to a model property...
			this._oList = Element.getElementById(`${this.getId()}--rta_addElementsDialogList`);
			this._bDescendingSortOrder = false;
		}.bind(this));
	};

	AddElementsDialog.prototype.exit = function(...aArgs) {
		this._oDialogPromise.then(function(oDialog) {
			oDialog.destroy();
		});

		if (ManagedObject.prototype.exit) {
			ManagedObject.prototype.exit.apply(this, aArgs);
		}
	};

	AddElementsDialog.prototype.setCustomFieldButtonVisible = function(bVisible) {
		this._oDialogModel.setProperty("/customFieldButtonVisible", bVisible);
	};

	AddElementsDialog.prototype.getCustomFieldButtonVisible = function() {
		return this._oDialogModel.getProperty("/customFieldButtonVisible");
	};

	/**
	 * Close the dialog.
	 * @returns {Promise} a Promise that resolves (to nothing) once the dialog is loaded and closed
	 */
	AddElementsDialog.prototype._submitDialog = function() {
		return this._oDialogPromise.then(function(oDialog) {
			oDialog.close();
			this._fnResolveOnDialogConfirm();
		}.bind(this));
		// indicate that the dialog has been closed and the selected fields (if any) are to be added to the UI
	};

	/**
	 * Close dialog. All sections will be reverted
	 */
	AddElementsDialog.prototype._cancelDialog = function() {
		// clear all selections
		this._oDialogModel.getObject("/elements").forEach(function(oElem) {
			oElem.selected = false;
		});
		this._oDialogPromise.then(function(oDialog) {
			oDialog.close();
		});
		// indicate that the dialog has been closed without choosing to add any fields (canceled)
		this._fnRejectOnDialogCancel();
	};

	AddElementsDialog.prototype.setElements = function(aElements) {
		this._oDialogModel.setProperty("/elements", aElements);
	};

	AddElementsDialog.prototype.getElements = function() {
		return this._oDialogModel.getProperty("/elements");
	};

	AddElementsDialog.prototype.getSelectedElements = function() {
		return this._oDialogModel.getObject("/elements").filter(function(oElement) {
			return oElement.selected;
		});
	};

	/**
	 * Open the Field Repository Dialog
	 *
	 * @returns {Promise} promise that resolves once the Fragment is loaded and the dialog is opened
	 * @public
	 */
	AddElementsDialog.prototype.open = function() {
		return new Promise(function(resolve, reject) {
			this._fnResolveOnDialogConfirm = resolve;
			this._fnRejectOnDialogCancel = reject;

			this._oDialogPromise.then(function(oDialog) {
				oDialog.attachAfterOpen(function() {
					this.fireOpened();
				}.bind(this));
				oDialog.open();
			}.bind(this));
		}.bind(this));
	};

	/**
	 * Resort the list
	 *
	 * @private
	 */
	AddElementsDialog.prototype._resortList = function() {
		this._bDescendingSortOrder = !this._bDescendingSortOrder;
		var oBinding = this._oList.getBinding("items");
		var aSorter = [];
		aSorter.push(new Sorter("label", this._bDescendingSortOrder));
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
			var oParentPropertyNameFilter = new Filter("parentPropertyName", FilterOperator.Contains, sValue);
			var oDuplicateNameFilter = new Filter("duplicateName", FilterOperator.EQ, true);
			var oParentNameFilter = new Filter({ filters: [oParentPropertyNameFilter, oDuplicateNameFilter], and: true });
			var oFilterLabelOrInfo = new Filter({ filters: [oFilterLabel, oOriginalLabelFilter, oParentNameFilter], and: false });
			oBinding.filter([oFilterLabelOrInfo]);
		} else {
			oBinding.filter([]);
		}
	};

	/**
	 * Fire an event to redirect to the extensibility action
	 * @param {string} sActionKey - Key for the mapping of specific actions (e.g. which URI to open for given extension data)
	 * @private
	 */
	AddElementsDialog.prototype._redirectToExtensibilityAction = function(sActionKey) {
		this.fireTriggerExtensibilityAction({actionKey: sActionKey});
		this._oDialogPromise.then(function(oDialog) {
			oDialog.close();
		});
	};

	AddElementsDialog.prototype.setTitle = function(sTitle) {
		ManagedObject.prototype.setProperty.call(this, "title", sTitle, true);
		this._oDialogPromise.then(function(oDialog) {
			oDialog.setTitle(sTitle);
		});
	};

	/**
	 * Sets the information for the extensibility menu button items
	 *
	 * @param {string} sButtonText - Text for the extensibility MenuButton
	 * @param {string} sButtonTooltip - Tooltip for the extensibility MenuButton
	 * @param {object[]} aExtensibilityOptions - Options available on the extensibility MenuButton
	 * @public
	 */
	AddElementsDialog.prototype.setExtensibilityOptions = function(oExtensibilityInfo) {
		const aExtensibilityOptions = oExtensibilityInfo.UITexts.options;

		this._oDialogModel.setProperty("/extensibilityOptions", aExtensibilityOptions);
		if (aExtensibilityOptions.length === 1) {
			// if there is only one option, we can directly set the button text
			this._oDialogModel.setProperty("/customFieldButtonText", aExtensibilityOptions[0].text);
			if (aExtensibilityOptions[0]?.tooltip) {
				this._oDialogModel.setProperty("/customFieldButtonTooltip", aExtensibilityOptions[0].tooltip);
			}
			this.setCustomFieldButtonVisible(true);
		} else {
			this._oDialogModel.setProperty("/extensibilityMenuButtonActive", true);
			this._oDialogModel.setProperty("/extensibilityMenuButtonText", oExtensibilityInfo.UITexts.buttonText);
			this._oDialogModel.setProperty("/extensibilityMenuButtonTooltip", oExtensibilityInfo.UITexts.tooltip);
		}
	};

	AddElementsDialog.prototype.getExtensibilityOptions = function() {
		return this._oDialogModel.getProperty("/extensibilityOptions");
	};

	/**
	 * Sets the visibility of the business context container
	 *
	 * @param {boolean} bBusinessContextVisible - Indicates whether the container is visible
	 * @private
	 */
	AddElementsDialog.prototype._setBusinessContextVisible = function(bBusinessContextVisible) {
		this.setProperty("businessContextVisible", bBusinessContextVisible, true);
		this._oDialogModel.setProperty("/businessContextVisible", bBusinessContextVisible);
	};

	/**
	 * Adds extensibility info - business contexts, UI Texts, etc...
	 * @param {object} oExtensibilityInfo - Extensibility Info
	 * @public
	 */
	AddElementsDialog.prototype.addExtensibilityInfo = function(oExtensibilityInfo) {
		const aContexts = oExtensibilityInfo?.extensionData;
		// clear old values from last run
		this._removeExtensionDataTexts();

		var aBusinessContextTexts = this._oDialogModel.getObject("/businessContextTexts");
		if (aContexts && aContexts.length > 0) {
			aContexts.forEach(function(oContext) {
				aBusinessContextTexts.push({
					text: oContext.description
				});
			}, this);
		} else {
			// Message "none" when no extension data is available
			aBusinessContextTexts.push({
				text: oRTAResourceModel.getProperty("MSG_NO_BUSINESS_CONTEXTS")
			});
		}
		// set the container visible
		this._setBusinessContextVisible(true);

		// the first entry is always the "header" to be set by the implementation of FieldExtensibility
		// it is set during the instantiation of the model, in the 'init' function
		this._oDialogModel.setProperty("/businessContextTexts/0/text", oExtensibilityInfo?.UITexts?.headerText);
	};

	/**
	 * Removes extension data from the vertical layout
	 * (except for the title)
	 * @private
	 */
	AddElementsDialog.prototype._removeExtensionDataTexts = function() {
		var aBusinessContextTexts = this._oDialogModel.getObject("/businessContextTexts");
		aBusinessContextTexts.splice(1);
	};

	return AddElementsDialog;
});