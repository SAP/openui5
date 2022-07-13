/*
 * ! ${copyright}
 */

// Provides control sap.ui.fl.variants.VariantManagement.
sap.ui.define([
	"sap/ui/model/Context",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/VariantItem",
	"sap/m/VariantManagement",
	"sap/ui/fl/Utils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/core/Control",
	"sap/ui/core/library",
	'sap/base/Log'
], function(
	Context,
	Filter,
	FilterOperator,
	VariantItem,
	MVariantManagement,
	flUtils,
	flSettings,
	Control,
	coreLibrary,
	Log
) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	/**
	 * Constructor for a new <code>VariantManagement</code>.
	 * @param {string} [sId] - ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] - Initial settings for the new control
	 * @class Can be used to manage variants. You can use this control in most controls that are enabled for <i>key user adaptation</i>.<br>
	 * <b>Note: </b>On the user interface, variants are generally referred to as "views".
	 * @see {@link topic:f1430c0337534d469da3a56307ff76af Key User Adaptation: Enable Your App}
	 * @extends sap.ui.core.Control
	 * @constructor
	 * @public
	 * @since 1.56
	 * @alias sap.ui.fl.variants.VariantManagement
	 */
	var VariantManagement = Control.extend("sap.ui.fl.variants.VariantManagement", /** @lends sap.ui.fl.variants.VariantManagement.prototype */ {
		metadata: {
			interfaces: [
				"sap.m.IOverflowToolbarContent"
			],
			library: "sap.ui.fl",
			designtime: "sap/ui/fl/designtime/variants/VariantManagement.designtime",
			properties: {
				/**
				 * Determines the intention of setting the current variant based on passed information.
				 * <p>
				 * <b>Note:</b> The <code>VariantManagement</code> control does not react in any way to this property.
				 */
				updateVariantInURL: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},
				/**
				 * When set to false, doesn't reset the <code>VariantManagement</code> control to the default variant, when its binding context is changed.
				 */
				resetOnContextChange: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},
				/**
				 * The name of the model containing the data.
				 */
				modelName: {
					type: "string",
					group: "Misc",
					defaultValue: ""
				},
				/**
				 * Indicated if the buttons on the 'My Views' are visible.
				 */
				editable: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},
				/**
				 * Indicated if the defaulting functionality is enabled.
				 */
				showSetAsDefault: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},
				/**
				 * If set to <code>true</code>, the key for a vendor variant will be added manually.<br>
				 * <b>Note:</b>This flag is only used internally in the app variant scenarios.
				 */
				manualVariantKey: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Indicates that the control is in error state. If set to <code>true</code>, an error message will be displayed whenever the variant is
				 * opened.
				 */
				inErrorState: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Determines the behavior for Apply Automatically if the standard variant is marked as the default variant.
				 *
				 */
				executeOnSelectionForStandardDefault: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Defines the Apply Automatically text for the standard variant in the Manage Views dialog if the application controls this behavior.
				 *
				 * <br><b>Note:</b> the usage of this property is restricted to <code>sap.fe</code> components only.
				 */
				displayTextForExecuteOnSelectionForStandardVariant: {
					type: "string",
					group: "Misc",
					defaultValue: ""
				},

				/**
                 * Semantic level of the header.
                 * For more information, see {@link sap.m.Title#setLevel}.
                 *
                 * @since 1.104
                 */
				headerLevel: {
					type: "sap.ui.core.TitleLevel",
					group: "Appearance",
					defaultValue: TitleLevel.Auto
				}
			},
			events: {
				/**
				 * This event is fired when the model and context are set.
				 */
				initialized: {},

				/**
				 * This event is fired when the <i>Save View</i> dialog or the <i>Save As</i> dialog is closed with the save button.
				 */
				save: {
					parameters: {
						/**
						 * Variant title
						 */
						name: {
							type: "string"
						},

						/**
						 * Indicates if an existing variant is overwritten or if a new variant is created.
						 */
						overwrite: {
							type: "boolean"
						},

						/**
						 * Variant key
						 */
						key: {
							type: "string"
						},

						/**
						 * <i>Apply Automatically</i> indicator
						 */
						execute: {
							type: "boolean"
						},

						/**
						 * Indicates the check box state for 'Public'.
						 */
						'public': {
							type: "boolean"
						},

						/**
						 * The default variant indicator
						 */
						def: {
							type: "boolean"
						},

						/**
						 * Indicates the check box state for 'Create Tile'.
						 * <br>Note:</br>This event parameter is used only internally.
						 */
						tile: {
							type: "boolean"
						}
					}
				},

				/**
				 * This event is fired when users presses the cancel button inside <i>Save As</i> dialog.
				 */
				cancel: {},

				/**
				 * This event is fired when users apply changes to variants in the <i>Manage Views</i> dialog.
				 */

				manage: {
					parameters: {
						/**
						 * List of changed variants. Each entry contains a 'key' - the variant key and a 'name' - the new title of the variant
						 */
						renamed: {
							type: "object[]"
						},

						/**
						 * List of deleted variant keys
						 */
						deleted: {
							type: "string[]"
						},

						/**
						 * List of variant keys and the associated Execute on Selection indicator
						 */
						exe: {
							type: "object[]"
						},

						/**
						 * The default variant key
						 */
						def: {
							type: "string"
						}
					}
				},

				/**
				 * This event is fired when a new variant is selected.
				 */
				select: {
					parameters: {
						/**
						 * Variant key
						 */
						key: {
							type: "string"
						}
					}
				}
			},
			associations: {

				/**
				 * Contains the controls for which the variant management is responsible.
				 */
				"for": {
					type: "sap.ui.core.Control",
					multiple: true
				}
			},
			aggregations: {
				/**
				 * Used for embedded vm
				 */
				_embeddedVM: {
					type: "sap.m.VariantManagement",
					multiple: false,
					visibility: "hidden"
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.openEnd();
				oRm.renderControl(oControl._oVM);
				oRm.close("div");
			}
		}
	});

	/*
	 * Constructs and initializes the <code>VariantManagement</code> control.
	 */
	VariantManagement.prototype.init = function() {
		Control.prototype.init.apply(this); // Call base class

		this.addStyleClass("sapUiFlVarMngmt"); // required for finding the control by RTA/FL
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl");

		this.setModelName(flUtils.VARIANT_MODEL_NAME);

		this.attachModelContextChange(this._setModel, this);

		this._oVM = new MVariantManagement(this.getId() + "-vm");
		this.setAggregation("_embeddedVM", this._oVM, true);

		this._aCancelEventHandlers = [];
		this._aSaveEventHandlers = [];
		this._aManageEventHandlers = [];
		this._aSelectEventHandlers = [];

		this._oVM.attachManage(this._fireManage, this);
		this._oVM.attachCancel(this._fireCancel, this);
		this._oVM.attachSave(this._fireSave, this);
		this._oVM.attachSelect(this._fireSelect, this);

		this._updateWithSettingsInfo();
	};

	/**
	 * Required by the {@link sap.m.IOverflowToolbarContent} interface.
	 * Registers invalidations event which is fired when width of the control is changed.
	 *
	 * @protected
	 * @returns {object} Configuration information for the <code>sap.m.IOverflowToolbarContent</code> interface.
	 */
	VariantManagement.prototype.getOverflowToolbarConfig = function() {
		return {
			canOverflow: false,
			invalidationEvents: ["save", "manage", "select"]
		};
	};

	/// <EVENT FORWARDING>
	VariantManagement.prototype.attachCancel = function(mProps, fnCallback, oObj) {
		this.attachEvent("cancel", mProps, fnCallback, oObj);
		return this;
	};

	VariantManagement.prototype._findCallback = function(aArray, fnCallback, oObj) {
		var mCallbackIdx = -1;
		aArray.some(function(oEntry, nIdx) {
			if ((oEntry.fCallback === fnCallback) && (oEntry.oObj === oObj)) {
				mCallbackIdx = nIdx;
			}

			return (mCallbackIdx >= 0);
		});

		return mCallbackIdx;
	};

	VariantManagement.prototype.detachCancel = function(fnCallback, oObj) {
		var nCancelEntryIdx = this._findCallback(this._aCancelEventHandlers, fnCallback, oObj);

		if (nCancelEntryIdx >= 0) {
			this.detachEvent("cancel", fnCallback, oObj);

			this._aCancelEventHandlers.splice(nCancelEntryIdx, 1);
		}

		return this;
	};

	VariantManagement.prototype.fireManage = function(oEvent) {
		this._oVM.fireManage(oEvent);
	};
	VariantManagement.prototype.fireSave = function(oEvent) {
		this._oVM.fireSave(oEvent);
	};

	VariantManagement.prototype._fireCancel = function(oEvent) {
		for (var i = 0; i < this._aCancelEventHandlers.length; i++) {
			oEvent.oSource = this;
			this._aCancelEventHandlers[i].fCallbackBound(oEvent, this._aCancelEventHandlers[i].mProps);
		}
	};

	VariantManagement.prototype.attachSave = function(mProps, fnCallback, oObj) {
		this.attachEvent("save", mProps, fnCallback, oObj);
		return this;
	};

	VariantManagement.prototype.detachSave = function(fnCallback, oObj) {
		var nSaveEntryIdx = this._findCallback(this._aSaveEventHandlers, fnCallback, oObj);

		if (nSaveEntryIdx > -1) {
			this.detachEvent("save", fnCallback, oObj);

			this._aSaveEventHandlers.splice(nSaveEntryIdx, 1);
		}

		return this;
	};

	VariantManagement.prototype._fireSave = function(oEvent) {
		this._handleAllListeners(oEvent, this._aSaveEventHandlers);
	};

	VariantManagement.prototype.hasListeners = function(sEvent) {
		var aInnerEvents = ["save", "select", "cancel", "manage"];
		if (aInnerEvents.indexOf(sEvent) > -1) {
			var aEventHandler = null;

			if (sEvent === "select") {
				aEventHandler = this._aSelectEventHandlers;
			} else if (sEvent === "save") {
				aEventHandler = this._aSaveEventHandlers;
			} else if (sEvent === "manage") {
				aEventHandler = this._aManageEventHandlers;
			} else if (sEvent === "cancel") {
				aEventHandler = this._aCancelEventHandlers;
			}

			return (aEventHandler.length > 0);
		}
		return Control.prototype.hasListeners.apply(this, arguments);
	};

	VariantManagement.prototype.attachEvent = function(sEvent, mProps, fnCallback, oObj) {
		var aInnerEvents = ["save", "select", "cancel", "manage"];

		if (aInnerEvents.indexOf(sEvent) > -1) {
			var aEventHandler = null;
			var fnFunction = fnCallback;
			if (typeof (mProps) === "function") {
				fnFunction = mProps;
				oObj = fnCallback;
				mProps = undefined;
			}

			oObj = oObj === this ? undefined : oObj;

			if (sEvent === "select") {
				aEventHandler = this._aSelectEventHandlers;
			} else if (sEvent === "save") {
				aEventHandler = this._aSaveEventHandlers;
			} else if (sEvent === "manage") {
				aEventHandler = this._aManageEventHandlers;
			} else if (sEvent === "cancel") {
				aEventHandler = this._aCancelEventHandlers;
			}

			aEventHandler.push({
				fCallback: fnFunction,
				fCallbackBound: oObj ? fnFunction.bind(oObj) : fnFunction,
				oObj: oObj,
				mProps: mProps
			});
		} else {
			Control.prototype.attachEvent.apply(this, arguments);
		}
	};

	VariantManagement.prototype.attachEventOnce = function(sEvent, mPros, fnCallback, oObj) {
		var nIdx;
		if (sEvent === "manage") {
			nIdx = this._findCallback(this._aManageEventHandlers, fnCallback, oObj);
			if ((nIdx > -1) && this._aManageEventHandlers[nIdx].bOnce) {
				this._aManageEventHandlers.splice(nIdx, 1);
			}

			this.attachManage(mPros, fnCallback, oObj);
			nIdx = this._findCallback(this._aManageEventHandlers, fnCallback, oObj);
			if (nIdx > -1) {
				this._aManageEventHandlers[nIdx].bOnce = true;
			}
		} else if (sEvent === "save") {
			nIdx = this._findCallback(this._aSaveEventHandlers, fnCallback, oObj);
			if ((nIdx > -1) && this._aSaveEventHandlers[nIdx].bOnce) {
				this._aSaveEventHandlers.splice(nIdx, 1);
			}

			this.attachSave(mPros, fnCallback, oObj);
			nIdx = this._findCallback(this._aSaveEventHandlers, fnCallback, oObj);
			if (nIdx > -1) {
				this._aSaveEventHandlers[nIdx].bOnce = true;
			}
		} else if (sEvent === "select") {
			nIdx = this._findCallback(this._aSelectEventHandlers, fnCallback, oObj);
			if ((nIdx > -1) && this._aSelectEventHandlers[nIdx].bOnce) {
				this._aSelectEventHandlers.splice(nIdx, 1);
			}

			this.attachSelect(mPros, fnCallback, oObj);
			nIdx = this._findCallback(this._aSelectEventHandlers, fnCallback, oObj);
			if (nIdx > -1) {
				this._aSelectEventHandlers[nIdx].bOnce = true;
			}
		} else {
			Control.prototype.attachEventOnce.apply(this, arguments);
		}
	};

	VariantManagement.prototype.attachManage = function(mProps, fnCallback, oObj) {
		this.attachEvent("manage", mProps, fnCallback, oObj);
		return this;
	};

	VariantManagement.prototype._handleAllListeners = function(oEvent, aEventHandler) {
		var i = 0;
		var aOnlyOnce = [];

		while (i < aEventHandler.length) {
			oEvent.oSource = this;
			aEventHandler[i].fCallbackBound(oEvent, aEventHandler[i].mProps);

			if (aEventHandler[i]) {
				if (aEventHandler[i].hasOwnProperty("bOnce") && aEventHandler[i].bOnce) {
					aOnlyOnce.push(i);
				}
				i += 1;
			}
		}

		for (i = aOnlyOnce.length - 1; i > -1; i--) {
			aEventHandler.splice(aOnlyOnce[i], 1);
		}
	};


	VariantManagement.prototype._fireManage = function(oEvent) {
		this._handleAllListeners(oEvent, this._aManageEventHandlers);
	};

	VariantManagement.prototype.detachManage = function(fnCallback, oObj) {
		var nManageEntryIdx = this._findCallback(this._aManageEventHandlers, fnCallback, oObj);

		if (nManageEntryIdx > -1) {
			this.detachEvent("manage", fnCallback, oObj);

			this._aManageEventHandlers.splice(nManageEntryIdx, 1);
		}

		return this;
	};

	VariantManagement.prototype.attachSelect = function(mProps, fnCallback, oObj) {
		this.attachEvent("select", mProps, fnCallback, oObj);
		return this;
	};

	VariantManagement.prototype._fireSelect = function(oEvent) {
		this._handleAllListeners(oEvent, this._aSelectEventHandlers);
	};

	VariantManagement.prototype.detachSelect = function(fnCallback, oObj) {
		var nSelectEntryIdx = this._findCallback(this._aSelectEventHandlers, fnCallback, oObj);

		if (nSelectEntryIdx > -1) {
			this.detachEvent("select", fnCallback, oObj);

			this._aSelectEventHandlers.splice(nSelectEntryIdx, 1);
		}

		return this;
	};
	/// </EVENT FORWARDING>


	///<OVERWRITES>

	VariantManagement.prototype._createSaveAsDialog = function() {
		this._oVM._createSaveAsDialog();
	};
	VariantManagement.prototype._handleVariantSaveAs = function(sNewVariantName) {
		this._oVM._handleVariantSaveAs(sNewVariantName);
	};
	VariantManagement.prototype.getFocusDomRef = function() {
		if (this._oVM) {
			return this._oVM.oVariantPopoverTrigger.getFocusDomRef();
		}

		return null;
	};

	VariantManagement.prototype.getManageDialog = function() {
		if (this._oVM) {
			return this._oVM.oManagementDialog;
		}

		return null;
	};

	/**
	 * Retrieves all variants.
	 * @public
	 * @returns {array} All variants. In case the model is not yet set, an empty array will be returned.
	 */
	VariantManagement.prototype.getVariants = function() {
		var aItems = [];
		if (this.oContext && this.oContext.getObject()) {
			aItems = this.oContext.getObject().variants.filter(function(oItem) {
				if (!oItem.hasOwnProperty("visible")) {
					return true;
				}

				return oItem.visible;
			});
		}

		return aItems;
	};

	VariantManagement.prototype.getTitle = function() {
		return this._oVM.getTitle();
	};

	VariantManagement.prototype.setPopoverTitle = function(sTitle) {
		this._oVM.setPopoverTitle(sTitle);
		return this;
	};

	VariantManagement.prototype.setHeaderLevel = function(sValue) {
		this.setProperty("headerLevel", sValue);
		this._oVM.setLevel(sValue);
		return this;
	};

	VariantManagement.prototype.setEditable = function(bValue) {
		this.setProperty("editable", bValue);
		this._oVM.setShowFooter(bValue);
		return this;
	};

	VariantManagement.prototype.setShowExecuteOnSelection = function(bValue) {
		this.setProperty("showExecuteOnSelection", bValue);
		this._oVM.setSupportApplyAutomatically(bValue);
		return this;
	};


	VariantManagement.prototype.setShowSetAsDefault = function(bValue) {
		this.setProperty("showSetAsDefault", bValue);
		this._oVM.setSupportDefault(bValue);
		return this;
	};

	VariantManagement.prototype.setExecuteOnSelectionForStandardDefault = function(bValue) {
		this.setProperty("executeOnSelectionForStandardDefault", bValue);
		this._oVM.setExecuteOnSelectionForStandardDefault(bValue);
		return this;
	};

	VariantManagement.prototype.setDisplayTextForExecuteOnSelectionForStandardVariant = function(sValue) {
		this.setProperty("displayTextForExecuteOnSelectionForStandardVariant", sValue);
		this._oVM.setDisplayTextForExecuteOnSelectionForStandardVariant(sValue);
		return this;
	};

	VariantManagement.prototype.setManualVariantKey = function(bValue) {
		this.setProperty("manualVariantKey", bValue);
		this._oVM._setShowManualVariantKey(bValue);
		return this;
	};

	VariantManagement.prototype.setInErrorState = function(bValue) {
		this.setProperty("inErrorState", bValue);
		this._oVM.setInErrorState(bValue);
		return this;
	};

	VariantManagement.prototype.openManagementDialog = function(bCreateAlways, sClass, oRolesComponentContainer) {
		this._oVM.openManagementDialog(bCreateAlways, sClass, oRolesComponentContainer);
	};


	VariantManagement.prototype.openSaveAsDialogForKeyUser = function(sClass, oRolesComponentContainer) {
		this._oVM.openSaveAsDialog(sClass, oRolesComponentContainer);
	};

	VariantManagement.prototype.setEditable = function(bValue) {
		this._oVM.setProperty("showFooter", bValue);
		return this;
	};

	/**
	 * Sets the new selected variant.
	 * @public
	 * @param {string} sKey - Key of the variant that should be selected.
	 */
	VariantManagement.prototype.setCurrentVariantKey = function(sKey) {
		this._oVM.setSelectedKey(sKey);
	};

	/**
	 * Gets the currently selected variant key.
	 * @public
	 * @returns {string} Key of the currently selected variant. In case the model is not yet set <code>null</code> will be returned.
	 */
	VariantManagement.prototype.getCurrentVariantKey = function() {
		return this._oVM.getSelectedKey();
	};

	VariantManagement.prototype.setDefaultVariantKey = function(sKey) {
		this._oVM.setDefaultKey(sKey);
	};

	VariantManagement.prototype.getDefaultVariantKey = function() {
		return this._oVM.getDefaultKey();
	};

	VariantManagement.prototype.getModified = function() {
		return this._oVM.getModified();
	};
	VariantManagement.prototype.setModified = function(bFlag) {
		this._oVM.setModified(bFlag);
	};

	VariantManagement.prototype.getStandardVariantKey = function() {
		return this._oVM.getStandardVariantKey();
	};
	/// </OVERWRITES>

	VariantManagement.prototype._getEmbeddedVM = function() {
		return this._oVM;
	};

	VariantManagement.prototype._updateWithSettingsInfo = function() {
		flSettings.getInstance().then(function (oSettings) {
			if (this._oVM) {
				this._oVM.setShowSaveAs(oSettings.isVariantPersonalizationEnabled());
				this._oVM.setSupportPublic(oSettings.isPublicFlVariantEnabled());
			}
		}.bind(this)).catch(function(oEx) {
			Log.error(oEx);
		});
	};

	VariantManagement.prototype.getModelName = function() {
		return this.getProperty("modelName");
	};

	VariantManagement.prototype.setModelName = function(sModelName) {
		if (this.getModelName()) {
			this.oContext = null;
			this._aCancelEventHandlers = [];
			this._aSaveEventHandlers = [];
			this._aManageEventHandlers = [];
			this._aSelectEventHandlers = [];
		}
		this.setProperty("modelName", sModelName);

		return this;
	};

	VariantManagement.prototype._setModel = function() {
		this._setBindingContext();
	};

	VariantManagement.prototype._setBindingContext = function() {
		var oModel;
		var sLocalId;

		var sModelName = this.getModelName();

		if (!this.oContext) {
			oModel = this.getModel(sModelName);
			if (oModel) {
				sLocalId = this._getLocalId(oModel);
				if (sLocalId) {
					this.oContext = new Context(oModel, "/" + sLocalId);
					this.setBindingContext(this.oContext, sModelName);

					if (oModel.registerToModel) { // Relevant for key user adaptation
						oModel.registerToModel(this);
					}

					this.fireInitialized();

					this._oVM.setModel(oModel, sModelName);

					this._oVM.setSupportDefault(true);


					this._createItemsModel(sModelName);

					this._oVM.bindProperty("selectedKey", {
						path: this.oContext + "/currentVariant",
						model: sModelName
					});

					this._oVM.bindProperty("defaultKey", {
						path: this.oContext + "/defaultVariant",
						model: sModelName
					});

					this._oVM.bindProperty("modified", {
						path: this.oContext + "/modified",
						model: sModelName
					});

					this._oVM.bindProperty("supportFavorites", {
						path: this.oContext + "/showFavorites",
						model: sModelName
					});

					this._oVM.bindProperty("supportApplyAutomatically", {
						path: this.oContext + "/showExecuteOnSelection",
						model: sModelName
					});

					this._oVM.bindProperty("showFooter", {
						path: this.oContext + "/variantsEditable",
						model: sModelName
					});

					this._oVM.setPopoverTitle(this._oRb.getText("VARIANT_MANAGEMENT_VARIANTS"));
				}
			}
		}
	};

	VariantManagement.prototype._createItemsModel = function(sModelName) {
		var oItemsTemplate = new VariantItem({
			key: "{" + sModelName + ">key}",
			title: "{" + sModelName + ">title}",
			sharing: "{" + sModelName + ">sharing}",
			remove: "{" + sModelName + ">remove}",
			favorite: "{" + sModelName + ">favorite}",
			originalFavorite: "{" + sModelName + ">originalFavorite}",
			executeOnSelect: "{" + sModelName + ">executeOnSelect}",
			originalExecuteOnSelect: "{" + sModelName + ">originalExecuteOnSelect}",
			rename: "{" + sModelName + ">rename}",
			originalTitle: "{" + sModelName + ">originalTitle}",
			visible: "{" + sModelName + ">visible}",
			changeable: "{" + sModelName + ">change}",
			author: "{" + sModelName + ">author}",
			contexts: "{" + sModelName + ">contexts}",
			originalContexts: "{" + sModelName + ">originalContexts}"
		});


		this._oVM.bindAggregation("items", {
			path: this.oContext + "/variants",
			model: sModelName,
			template: oItemsTemplate,
			filters: new Filter({
				path: "visible",
				operator: FilterOperator.EQ,
				value1: true
			})
		});
	};

	VariantManagement.prototype._getLocalId = function(oModel) {
		var sModelName = this.getModelName();
		if (!sModelName) {
			return null;
		}
		if (sModelName !== flUtils.VARIANT_MODEL_NAME) {
			return this.getId();
		}

		return oModel.getVariantManagementReferenceForControl(this);
	};

	VariantManagement.prototype._getInnerItems = function() {
		var aItems = [];
		if (this.oContext && this.oContext.getObject()) {
			aItems = this.oContext.getObject().variants.filter(function(oItem) {
				if (!oItem.hasOwnProperty("visible")) {
					return true;
				}

				return oItem.visible;
			});
		}

		return aItems;
	};

	VariantManagement.prototype._getInnerItemByKey = function(sKey) {
		var oItem = null;
		var aItems = this._getInnerItems();
		aItems.some(function(oEntry) {
			if (oEntry.key === sKey) {
				oItem = oEntry;
			}

			return (oItem !== null);
		});

		return oItem;
	};

	/**
	 * Registration of a callback function. The provided callback function is executed to check if apply automatically on standard variant should be considered.
	 * @private
	 * @ui5-restricted sap.fe
	 * @since 1.103
	 * @param {function} fCallBack Called when standard variant must be applied. It determines if apply automatically on standard variant should be considered.
	 * As a convenience the current variant will be passed to the callback. This variant instance may not be changed in any ways. It is only intended to provide certain variant information.
	 * @returns {this} Reference to this in order to allow method chaining.
	 */
	VariantManagement.prototype.registerApplyAutomaticallyOnStandardVariant = function(fCallBack) {
		this._fRegisteredApplyAutomaticallyOnStandardVariant = fCallBack;

		return this;
	};

	/**
	 * Retrieves the apply automatically state for a variant.
	 * @private
	 * @ui5-restricted sap.mdc
	 * @param {object} oVariant the fl-variant object
	 * @returns {boolean} apply automatically state
	 */
	VariantManagement.prototype.getApplyAutomaticallyOnVariant = function(oVariant) {
		var bExecuteOnSelection = false;
		if (oVariant) {
			bExecuteOnSelection = oVariant.executeOnSelect;

			if (this._fRegisteredApplyAutomaticallyOnStandardVariant && this.getDisplayTextForExecuteOnSelectionForStandardVariant() && (oVariant.key === this._oVM.getStandardVariantKey())) {
				try {
					bExecuteOnSelection = this._fRegisteredApplyAutomaticallyOnStandardVariant(oVariant);
				} catch (ex) {
					Log.error("callback for determination of apply automatically on standard variant failed");
				}
			}
		}

		return bExecuteOnSelection;
	};


	// exit destroy all controls created in init
	VariantManagement.prototype.exit = function() {
		this._oVM.detachManage(this._fireManage, this);
		this._oVM.detachCancel(this._fireCancel, this);
		this._oVM.detachSelect(this._fireSelect, this);
		this._oVM.detachSave(this._fireSave, this);

		Control.prototype.exit.apply(this, arguments);
		this._oVM = undefined;

		this._fRegisteredApplyAutomaticallyOnStandardVariant = null;
		this.oContext = undefined;
		this._oRb = undefined;

		this._aCancelEventHandlers = undefined;
		this._aSaveEventHandlers = undefined;
		this._aManageEventHandlers = undefined;
		this._aSelectEventHandlers = undefined;
	};

	return VariantManagement;
});