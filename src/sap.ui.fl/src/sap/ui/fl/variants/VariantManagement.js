/*
 * ! ${copyright}
 */

// Provides control sap.ui.fl.variants.VariantManagement.
sap.ui.define([
	"sap/ui/model/Context",
	"sap/ui/model/PropertyBinding",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/Device",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/Control",
	"sap/ui/core/Icon",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/Grid",
	"sap/m/SearchField",
	"sap/m/RadioButton",
	"sap/m/ColumnListItem",
	"sap/m/Column",
	"sap/m/Text",
	"sap/m/Bar",
	"sap/m/Table",
	"sap/m/Page",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/Dialog",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Title",
	"sap/m/ResponsivePopover",
	"sap/m/SelectList",
	"sap/m/ObjectIdentifier",
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarLayoutData",
	"sap/m/VBox",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/library",
	"sap/m/library",
	"sap/ui/fl/Utils"
], function(
	Context,
	PropertyBinding,
	JSONModel,
	Filter,
	FilterOperator,
	Device,
	InvisibleText,
	Control,
	Icon,
	HorizontalLayout,
	Grid,
	SearchField,
	RadioButton,
	ColumnListItem,
	Column,
	Text,
	Bar,
	Table,
	Page,
	Toolbar,
	ToolbarSpacer,
	Button,
	CheckBox,
	Dialog,
	Input,
	Label,
	Title,
	ResponsivePopover,
	SelectList,
	ObjectIdentifier,
	OverflowToolbar,
	OverflowToolbarLayoutData,
	VBox,
	KeyCodes,
	coreLibrary,
	mobileLibrary,
	flUtils
) {
	"use strict";

	// shortcut for sap.m.OverflowToolbarPriority
	var OverflowToolbarPriority = mobileLibrary.OverflowToolbarPriority;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	// shortcut for sap.m.PopinDisplay
	var PopinDisplay = mobileLibrary.PopinDisplay;

	// shortcut for sap.m.ScreenSize
	var ScreenSize = mobileLibrary.ScreenSize;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

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
			interfaces : [
				"sap.m.IOverflowToolbarContent"
			],
			library: "sap.ui.fl",
			designtime: "sap/ui/fl/designtime/variants/VariantManagement.designtime",
			properties: {

				/**
				 * Indicates that <i>Apply Automatically</i> is visible in the <i>Save View</i> and the <i>Manage Views</i> dialogs.
				 */
				showExecuteOnSelection: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Indicates that <i>Set as Default</i> is visible in the <i>Save View</i> and the <i>Manage Views</i> dialogs.
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
				 * Indicates that the control is in edit state. If set to <code>false</code>, the footer of the <i>Views</i> list will be hidden.
				 */
				editable: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Determines the name of the model. The binding context will be defined by the current ID.
				 * <p>
				 * <b>Note:</b> In a UI adaptation scenario, this property is not used at all, because the model name is <code>$FlexVariants</code>.
				 */
				modelName: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

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
			events: {

				/**
				 * This event is fired when the <i>Save View</i> dialog is closed with <i>OK</i> for a variant.
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
						 * The default variant indicator
						 */
						def: {
							type: "boolean"
						}
					}
				},

				/**
				 * This event is fired when users apply changes to variants in the <i>Manage Views</i> dialog.
				 */
				manage: {},

				/**
				 * This event is fired when the model and context are set.
				 */
				initialized: {},

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
			}
		},

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 * @param {sap.ui.core.RenderManager} oRm - <code>RenderManager</code> that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl - Object representation of the control that should be rendered
		 */
		renderer: function(oRm, oControl) {
			oRm.write("<div ");
			oRm.writeControlData(oControl);
			oRm.addClass("sapUiFlVarMngmt");
			oRm.writeClasses();


			var sTooltip = oControl._oRb.getText("VARIANT_MANAGEMENT_TRIGGER_TT");
			oRm.write(" title='" + sTooltip + "'");

			oRm.write(">");

			oRm.renderControl(oControl.oVariantLayout);
			oRm.write("</div>");
		}
	});

	VariantManagement.INNER_MODEL_NAME = "$sapUiFlVariants";
	VariantManagement.MAX_NAME_LEN = 100;
	VariantManagement.COLUMN_FAV_IDX = 0;
	VariantManagement.COLUMN_NAME_IDX = 1;

	/*
	 * Constructs and initializes the <code>VariantManagement</code> control.
	 */
	VariantManagement.prototype.init = function() {
		this._sModelName = flUtils.VARIANT_MODEL_NAME;

		this.attachModelContextChange(this._setModel, this);

		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl");

		this._createInnerModel();

		this.oVariantInvisibleText = new InvisibleText();

		this.oVariantText = new Title(this.getId() + "-text", {
			text: {
				path: 'currentVariant',
				model: this._sModelName,
				formatter: function(sKey) {
					var sText = "";
					if (sKey) {
						sText = this.getSelectedVariantText(sKey);
						this._setInvisibleText(sText, this.getModified());
					}

					return sText;
				}.bind(this)
			}
		});

		this.oVariantText.addStyleClass("sapUiFlVarMngmtClickable");
		this.oVariantText.addStyleClass("sapUiFlVarMngmtTitle");
		if (Device.system.phone) {
			this.oVariantText.addStyleClass("sapUiFlVarMngmtTextPhoneMaxWidth");
		} else {
			this.oVariantText.addStyleClass("sapUiFlVarMngmtTextMaxWidth");
		}

		var oVariantModifiedText = new Label(this.getId() + "-modified", {
			text: "*",
			visible: {
				path: "modified",
				model: this._sModelName,
				formatter: function(bValue) {
					var sKey = this.getCurrentVariantKey();

					if (sKey) {
						this._setInvisibleText(this.getSelectedVariantText(sKey), bValue);
					}

					return ((bValue === null) || (bValue === undefined)) ? false : bValue;
				}.bind(this)
			}
		});
		oVariantModifiedText.setVisible(false);
		oVariantModifiedText.addStyleClass("sapUiFlVarMngmtModified");
		oVariantModifiedText.addStyleClass("sapUiFlVarMngmtClickable");
		oVariantModifiedText.addStyleClass("sapMTitleStyleH4");

		this.oVariantPopoverTrigger = new Button(this.getId() + "-trigger", {
			icon: "sap-icon://slim-arrow-down",
			type: ButtonType.Transparent
		});

		this.oVariantPopoverTrigger.addAriaLabelledBy(this.oVariantInvisibleText);
		this.oVariantPopoverTrigger.addStyleClass("sapUiFlVarMngmtTriggerBtn");
		this.oVariantPopoverTrigger.addStyleClass("sapMTitleStyleH4");

		this.oVariantLayout = new HorizontalLayout({
			content: [
				this.oVariantText, oVariantModifiedText, this.oVariantPopoverTrigger
			]
		});
		this.oVariantLayout.addStyleClass("sapUiFlVarMngmtLayout");

		oVariantModifiedText.setVisible(false);

		this.oVariantInvisibleText.toStatic();

		this.addDependent(this.oVariantLayout);
	};

	/**
	 * Required by the {@link sap.m.IOverflowToolbarContent} interface.
	 * Registers invalidations event which is fired when width of the control is changed.
	 *
	 * @protected
	 * @returns {object} Configuration information for the <code>sap.m.IOverflowToolbarContent</code> interface.
	 */
	VariantManagement.prototype.getOverflowToolbarConfig = function() {
		var oConfig = {
			canOverflow: false,
			invalidationEvents: ["save", "manage", "select"]
		};

		return oConfig;
	};

	/**
	 * Returns the title control of the <code>VariantManagement</code>. This is used in the key user scenario.
	 * @protected
	 * @returns {sap.m.Title} Title part of the <code>VariantManagement</code> control.
	 */
	VariantManagement.prototype.getTitle = function() {
		return this.oVariantText;
	};

	VariantManagement.prototype._setInvisibleText = function(sText, bFlag) {
		var sInvisibleTextKey;
		if (sText) {
			if (bFlag) {
				sInvisibleTextKey = "VARIANT_MANAGEMENT_SEL_VARIANT_MOD";
			} else {
				sInvisibleTextKey = "VARIANT_MANAGEMENT_SEL_VARIANT";
			}

			this.oVariantInvisibleText.setText(this._oRb.getText(sInvisibleTextKey, [sText]));
		}
	};

	VariantManagement.prototype._createInnerModel = function() {
		var oModel = new JSONModel({
			showExecuteOnSelection: false,
			showSetAsDefault: true,
			editable: true,
			popoverTitle: this._oRb.getText("VARIANT_MANAGEMENT_VARIANTS")
		});
		this.setModel(oModel, VariantManagement.INNER_MODEL_NAME);

		this._bindProperties();
	};

	VariantManagement.prototype._bindProperties = function() {
		this.bindProperty("showExecuteOnSelection", {
			path: "/showExecuteOnSelection",
			model: VariantManagement.INNER_MODEL_NAME
		});
		this.bindProperty("showSetAsDefault", {
			path: "/showSetAsDefault",
			model: VariantManagement.INNER_MODEL_NAME
		});
		this.bindProperty("editable", {
			path: "/editable",
			model: VariantManagement.INNER_MODEL_NAME
		});
	};

	VariantManagement.prototype.getOriginalDefaultVariantKey = function() {
		var oModel = this.getModel(this._sModelName);
		if (oModel && this.oContext) {
			return oModel.getProperty(this.oContext + "/originalDefaultVariant");
		}
		return null;
	};

	VariantManagement.prototype.setDefaultVariantKey = function(sKey) {
		var oModel = this.getModel(this._sModelName);
		if (oModel && this.oContext) {
			oModel.setProperty(this.oContext + "/defaultVariant", sKey);
		}
	};

	VariantManagement.prototype.getDefaultVariantKey = function() {
		var oModel = this.getModel(this._sModelName);
		if (oModel && this.oContext) {
			return oModel.getProperty(this.oContext + "/defaultVariant");
		}
		return null;
	};

	/**
	 * Sets the new selected variant.
	 * @public
	 * @param {String} sKey - Key of the variant that should be selected.
	 * @returns {sap.ui.fl.variants.VariantManagement} Current instance of {@link sap.ui.fl.variants.VariantManagement}.
	 */
	VariantManagement.prototype.setCurrentVariantKey = function(sKey) {
		var oModel = this.getModel(this._sModelName);
		if (oModel && this.oContext) {
			oModel.setProperty(this.oContext + "/currentVariant", sKey);
		}

		return this;
	};

	/**
	 * Gets the currently selected variant key.
	 * @public
	 * @returns {String} Key of the currently selected variant. In case the model is not yet set <code>null</code> will be returned.
	 */
	VariantManagement.prototype.getCurrentVariantKey = function() {
		var oModel = this.getModel(this._sModelName);
		if (oModel && this.oContext) {
			return oModel.getProperty(this.oContext + "/currentVariant");
		}

		return null;
	};

	/**
	 * Sets the popover title.
	 */
	VariantManagement.prototype._assignPopoverTitle = function() {
		var sTitle;
		var oInnerModel;
		var oModel = this.getModel(this._sModelName);
		if (oModel && this.oContext) {
			sTitle = oModel.getProperty(this.oContext + "/popoverTitle");
		}

		if (sTitle !== undefined) {
			oInnerModel = this.getModel(VariantManagement.INNER_MODEL_NAME);
			if (oInnerModel) {
				oInnerModel.setProperty("/popoverTitle", sTitle);
			}
		}
	};

	/**
	 * Retrieves all variants.
	 * @public
	 * @returns {array} All variants. In case the model is not yet set, an empty array will be returned.
	 */
	VariantManagement.prototype.getVariants = function() {
		return this._getItems();
	};

	VariantManagement.prototype.setModified = function(bFlag) {
		var oModel = this.getModel(this._sModelName);
		if (oModel && this.oContext) {
			oModel.setProperty(this.oContext + "/modified", bFlag);
		}
	};

	VariantManagement.prototype.getModified = function() {
		var oModel = this.getModel(this._sModelName);
		if (oModel && this.oContext) {
			return oModel.getProperty(this.oContext + "/modified");
		}
		return false;
	};

	VariantManagement.prototype.getSelectedVariantText = function(sKey) {
		var oItem = this._getItemByKey(sKey);

		if (oItem) {
			return oItem.title;
		}

		return "";
	};

	VariantManagement.prototype.getStandardVariantKey = function() {
		var aItems = this._getItems();
		if (aItems && aItems[0]) {
			return aItems[0].key;
		}

		return null;
	};

	VariantManagement.prototype.getShowFavorites = function() {
		var oModel = this.getModel(this._sModelName);
		if (oModel && this.oContext) {
			return oModel.getProperty(this.oContext + "/showFavorites");
		}
		return false;
	};

	VariantManagement.prototype._clearDeletedItems = function() {
		this._aDeletedItems = [];
	};

	VariantManagement.prototype._addDeletedItem = function(oItem) {
		this._aDeletedItems.push(oItem);
	};

	VariantManagement.prototype._getDeletedItems = function() {
		return this._aDeletedItems;
	};

	VariantManagement.prototype._getItems = function() {
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

	VariantManagement.prototype._getItemByKey = function(sKey) {
		var oItem = null;
		var aItems = this._getItems();
		aItems.some(function(oEntry) {
			if (oEntry.key === sKey) {
				oItem = oEntry;
			}

			return (oItem !== null);
		});

		return oItem;
	};

	VariantManagement.prototype._rebindControl = function() {
		this.oVariantText.unbindProperty("text");
		this.oVariantText.bindProperty("text", {
			path: 'currentVariant',
			model: this._sModelName,
			formatter: function(sKey) {
				var sText = this.getSelectedVariantText(sKey);
				return sText;
			}.bind(this)
		});

		this.oVariantText.unbindProperty("visible");
		this.oVariantText.bindProperty("visible", {
			path: "modified",
			model: this._sModelName,
			formatter: function(bValue) {
				return (bValue === null || bValue === undefined) ? false : bValue;
			}
		});
	};

	VariantManagement.prototype.setModelName = function(sValue) {
		if (this.getModelName()) {
			this.oContext = null;
		}

		this.setProperty("modelName", sValue);

		this._sModelName = sValue;

		this._rebindControl();

		return this;
	};

	VariantManagement.prototype._setBindingContext = function() {
		var oModel;
		var sLocalId;

		if (!this.oContext) {
			oModel = this.getModel(this._sModelName);
			if (oModel) {
				sLocalId = this._getLocalId(oModel);
				if (sLocalId) {
					this.oContext = new Context(oModel, "/" + sLocalId);
					this.setBindingContext(this.oContext, this._sModelName);

					if (!this.getModelName() && oModel.registerToModel) { // Relevant for key user adaptation
						oModel.registerToModel(this);
					}

					this._assignPopoverTitle();

					this._registerPropertyChanges(oModel);

					this.fireInitialized();
				}
			}
		}
	};

	VariantManagement.prototype._getLocalId = function(oModel) {
		if (this.getModelName() && (this._sModelName !== flUtils.VARIANT_MODEL_NAME)) {
			return this.getId();
		}
		return oModel.getVariantManagementReferenceForControl(this);
	};

	VariantManagement.prototype._setModel = function() {
		this._setBindingContext();
	};

	VariantManagement.prototype._registerPropertyChanges = function(oModel) {
		var oBinding = new PropertyBinding(oModel, this.oContext + "/variantsEditable");
		oBinding.attachChange(function(oData) {
			if (oData && oData.oSource && oData.oSource.oModel && oData.oSource.sPath) {
				var oInnerModel;
				var bFlag = oData.oSource.oModel.getProperty(oData.oSource.sPath);
				oInnerModel = this.getModel(VariantManagement.INNER_MODEL_NAME);
				if (oInnerModel) {
					oInnerModel.setProperty("/editable", bFlag);
				}
			}
		}.bind(this));

		var oBindingBusy = new PropertyBinding(oModel, this.oContext + "/variantBusy");
		oBindingBusy.attachChange(function(oData) {
			if (oData && oData.oSource && oData.oSource.oModel && oData.oSource.sPath) {
				var bFlag = oData.oSource.oModel.getProperty(oData.oSource.sPath);
				this._handleBusy(bFlag);
			}
		}.bind(this));
	};

	// clickable area
	VariantManagement.prototype._handleBusy = function(bFlag) {
		if (bFlag !== undefined) {
			this.getAssociation("for", []).forEach(function(sControlId) {
				var oControl = sap.ui.getCore().byId(sControlId);
				if (oControl && oControl.setBusy) {
					oControl.setBusy(bFlag);
				}
			});
		}
	};


	// clickable area
	VariantManagement.prototype.handleOpenCloseVariantPopover = function() {
		if (!this.bPopoverOpen) {
			this._openVariantList();
		} else if (this.oVariantPopOver && this.oVariantPopOver.isOpen()) {
			this.oVariantPopOver.close();
		} else if (this.getInErrorState() && this.oErrorVariantPopOver && this.oErrorVariantPopOver.isOpen()) {
			this.oErrorVariantPopOver.close();
		}
	};

	VariantManagement.prototype.getFocusDomRef = function() {
		if (this.oVariantPopoverTrigger) {
			return this.oVariantPopoverTrigger.getFocusDomRef();
		}
	};

	VariantManagement.prototype.onclick = function() {
		if (this.oVariantPopoverTrigger && !this.bPopoverOpen) {
			this.oVariantPopoverTrigger.focus();
		}
		this.handleOpenCloseVariantPopover();
	};

	VariantManagement.prototype.onkeyup = function(oEvent) {
		if (oEvent.which === KeyCodes.F4 || oEvent.which === KeyCodes.SPACE || oEvent.altKey === true && oEvent.which === KeyCodes.ARROW_UP || oEvent.altKey === true && oEvent.which === KeyCodes.ARROW_DOWN) {
			this._openVariantList();
		}
	};

	VariantManagement.prototype.onAfterRendering = function() {
		this.oVariantText.$().off("mouseover").on("mouseover", function() {
			this.oVariantPopoverTrigger.addStyleClass("sapUiFlVarMngmtTriggerBtnHover");
		}.bind(this));
		this.oVariantText.$().off("mouseout").on("mouseout", function() {
			this.oVariantPopoverTrigger.removeStyleClass("sapUiFlVarMngmtTriggerBtnHover");
		}.bind(this));
	};

	// ERROR LIST
	VariantManagement.prototype._openInErrorState = function() {
		var oVBox;

		if (!this.oErrorVariantPopOver) {
			oVBox = new VBox({
				fitContainer: true,
				alignItems: sap.m.FlexAlignItems.Center,
				items: [
					new Icon({
						size: "4rem",
						color: "lightgray",
						src: "sap-icon://message-error"
					}), new Title({
						titleStyle: sap.ui.core.TitleLevel.H2,
						text: this._oRb.getText("VARIANT_MANAGEMENT_ERROR_TEXT1")
					}), new Text({
						textAlign: sap.ui.core.TextAlign.Center,
						text: this._oRb.getText("VARIANT_MANAGEMENT_ERROR_TEXT2")
					})
				]
			});

			oVBox.addStyleClass("sapUiFlVarMngmtErrorPopover");

			this.oErrorVariantPopOver = new ResponsivePopover(this.getId() + "-errorpopover", {
				title: {
					path: "/popoverTitle",
					model: VariantManagement.INNER_MODEL_NAME
				},
				contentWidth: "400px",
				placement: PlacementType.VerticalPreferredBottom,
				content: [
					new Page(this.getId() + "-errorselpage", {
						showSubHeader: false,
						showNavButton: false,
						showHeader: false,
						content: [
							oVBox
						]
					})
				],
				afterOpen: function() {
					this.bPopoverOpen = true;
				}.bind(this),
				afterClose: function() {
					if (this.bPopoverOpen) {
						setTimeout(function() {
							this.bPopoverOpen = false;
						}.bind(this), 200);
					}
				}.bind(this),
				contentHeight: "300px"
			});

			this.oErrorVariantPopOver.attachBrowserEvent("keyup", function(e) {
				if (e.which === 32) { // UP
					this.oErrorVariantPopOver.close();
				}
			}.bind(this));
		}

		if (this.bPopoverOpen) {
			return;
		}

		this.oErrorVariantPopOver.openBy(this.oVariantLayout);
	};

	// My Views List
	VariantManagement.prototype._createVariantList = function() {
		if (this.oVariantPopOver) {
			return;
		}

		this.oVariantManageBtn = new Button(this.getId() + "-manage", {
			text: this._oRb.getText("VARIANT_MANAGEMENT_MANAGE"),
			enabled: true,
			press: function() {
				this._openManagementDialog();
			}.bind(this),
			layoutData: new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.Low
			})
		});

		this.oVariantSaveBtn = new Button(this.getId() + "-mainsave", {
			text: this._oRb.getText("VARIANT_MANAGEMENT_SAVE"),
			press: function() {
				this._handleVariantSave();
			}.bind(this),
			visible: {
				path: "modified",
				model: this._sModelName,
				formatter: function(bValue) {
					return bValue;
				}
			},
			type: sap.m.ButtonType.Emphasized,
			layoutData: new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.Low
			})
		});

		this.oVariantSaveAsBtn = new Button(this.getId() + "-saveas", {
			text: this._oRb.getText("VARIANT_MANAGEMENT_SAVEAS"),
			press: function() {
				this._openSaveAsDialog();
			}.bind(this),
			layoutData: new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.Low
			})
		});

		this._oVariantList = new SelectList(this.getId() + "-list", {
			selectedKey: {
				path: "currentVariant",
				model: this._sModelName
			},
			itemPress: function(oEvent) {
				var sSelectionKey = null;
				if (oEvent && oEvent.getParameters()) {
					var oItemPressed = oEvent.getParameters().item;
					if (oItemPressed) {
						sSelectionKey = oItemPressed.getKey();
					}
				}
				if (sSelectionKey) {
					// this.setModified(false);
					this.setCurrentVariantKey(sSelectionKey);

					this.fireEvent("select", {
						key: sSelectionKey
					});
					this.oVariantPopOver.close();
				}
			}.bind(this)
		});
		this._oVariantList.setNoDataText(this._oRb.getText("VARIANT_MANAGEMENT_NODATA"));

		var oItemTemplate = new sap.ui.core.Item({
			key: '{' + this._sModelName + ">key}",
			text: '{' + this._sModelName + ">title}"
		});

		this._oVariantList.bindAggregation("items", {
			path: "variants",
			model: this._sModelName,
			template: oItemTemplate
		});

		this._oSearchField = new SearchField(this.getId() + "-search");
		this._oSearchField.attachLiveChange(function(oEvent) {
			this._triggerSearch(oEvent, this._oVariantList);
		}.bind(this));

		this.oVariantSelectionPage = new Page(this.getId() + "-selpage", {
			subHeader: new Toolbar({
				content: [
					this._oSearchField
				]
			}),
			content: [
				this._oVariantList
			],
			footer: new OverflowToolbar({
				content: [
					new ToolbarSpacer(this.getId() + "-spacer"), this.oVariantSaveBtn, this.oVariantSaveAsBtn, this.oVariantManageBtn
				]
			}),
			showNavButton: false,
			showHeader: false,
			showFooter: {
				path: "/editable",
				model: VariantManagement.INNER_MODEL_NAME
			}
		});

		this.oVariantPopOver = new ResponsivePopover(this.getId() + "-popover", {
			title: {
				path: "/popoverTitle",
				model: VariantManagement.INNER_MODEL_NAME
			},
			contentWidth: "400px",
			placement: PlacementType.VerticalPreferredBottom,
			content: [
				this.oVariantSelectionPage
			],
			afterOpen: function() {
				this.bPopoverOpen = true;
			}.bind(this),
			afterClose: function() {
				if (this.bPopoverOpen) {
					setTimeout(function() {
						this.bPopoverOpen = false;
					}.bind(this), 200);
				}
			}.bind(this),
			contentHeight: "300px"
		});

		this.oVariantPopOver.addStyleClass("sapUiFlVarMngmtPopover");
		if (this.oVariantLayout.$().closest(".sapUiSizeCompact").length > 0) {
			this.oVariantPopOver.addStyleClass("sapUiSizeCompact");
		}
		this.addDependent(this.oVariantPopOver);

		// this._oVariantList.getBinding("items").filter(this._getFilters());
	};

	/**
	 * Hide or show <i>Save</i> button and emphasize "most positive action" - either <i>Save</i> button if it is visible, or <i>Save As</i> button if <i>Save</i> is hidden.
	 * @param bShow - Indicator if <i>Save</i> button should be visible
	 * @private
	 */
	VariantManagement.prototype.showSaveButton = function(bShow) {
		if (bShow === false) {
			this.oVariantSaveAsBtn.setType(sap.m.ButtonType.Emphasized);
			this.oVariantSaveBtn.setVisible(false);
		} else {
			this.oVariantSaveAsBtn.setType(sap.m.ButtonType.Default);
			this.oVariantSaveBtn.setVisible(true);
		}
	};

	VariantManagement.prototype._openVariantList = function() {
		var oItem;

		if (this.getInErrorState()) {
			this._openInErrorState();
			return;
		}

		if (this.bPopoverOpen) {
			return;
		}

		// proceed only if context is available
		if (!this.oContext) {
			return;
		}

		this._createVariantList();
		this._oSearchField.setValue("");

		this._oVariantList.getBinding("items").filter(this._getFilters());

		this.oVariantSelectionPage.setShowSubHeader(this._oVariantList.getItems().length > 9);

		this.showSaveButton(false);

		if (this.getModified()) {
			oItem = this._getItemByKey(this.getCurrentVariantKey());
			if (oItem && oItem.change) {
				this.showSaveButton(true);
			}
		}

		this.oVariantPopOver.openBy(this.oVariantLayout);
	};

	VariantManagement.prototype._triggerSearch = function(oEvent, oVariantList) {
		if (!oEvent) {
			return;
		}

		var parameters = oEvent.getParameters();
		if (!parameters) {
			return;
		}

		var sValue = parameters.newValue ? parameters.newValue : "";

		var oFilter = new Filter({
			path: "title",
			operator: FilterOperator.Contains,
			value1: sValue
		});

		oVariantList.getBinding("items").filter(this._getFilters(oFilter));
	};

	// Save View dialog

	VariantManagement.prototype._createSaveAsDialog = function() {
		if (!this.oSaveAsDialog) {
			this.oInputName = new Input(this.getId() + "-name", {
				liveChange: function() {
					this._checkVariantNameConstraints(this.oInputName, this.oSaveSave);
				}.bind(this)
			});

			var oLabelName = new Label(this.getId() + "-namelabel", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_NAME"),
				required: true
			});
			oLabelName.setLabelFor(this.oInputName);

			this.oDefault = new CheckBox(this.getId() + "-default", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_SETASDEFAULT"),
				visible: {
					path: "/showSetAsDefault",
					model: VariantManagement.INNER_MODEL_NAME
				},
				width: "100%"
			});

			this.oExecuteOnSelect = new CheckBox(this.getId() + "-execute", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_EXECUTEONSELECT"),
				visible: {
					path: "/showExecuteOnSelection",
					model: VariantManagement.INNER_MODEL_NAME
				},
				width: "100%"
			});

			this.oInputManualKey = new Input(this.getId() + "-key", {
				liveChange: function() {
					this._checkVariantNameConstraints(this.oInputManualKey);
				}.bind(this)
			});

			this.oLabelKey = new Label(this.getId() + "-keylabel", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_KEY"),
				required: true
			});
			this.oLabelKey.setLabelFor(this.oInputManualKey);

			this.oSaveSave = new Button(this.getId() + "-variantsave", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_SAVE"),
				press: function() {
					this._bSaveCanceled = false;
					this._handleVariantSaveAs(this.oInputName.getValue());
				}.bind(this),
				enabled: true
			});
			var oSaveAsDialogOptionsGrid = new Grid({
				defaultSpan: "L12 M12 S12"
			});

			if (this.getShowSetAsDefault()) {
				oSaveAsDialogOptionsGrid.addContent(this.oDefault);
			}
			if (this.getShowExecuteOnSelection()) {
				oSaveAsDialogOptionsGrid.addContent(this.oExecuteOnSelect);
			}

			this.oSaveAsDialog = new Dialog(this.getId() + "-savedialog", {
				title: this._oRb.getText("VARIANT_MANAGEMENT_SAVEDIALOG"),
				beginButton: this.oSaveSave,
				endButton: new Button(this.getId() + "-variantcancel", {
					text: this._oRb.getText("VARIANT_MANAGEMENT_CANCEL"),
					press: function() {
						this._bSaveCanceled = true;
						this.oSaveAsDialog.close();
					}.bind(this)
				}),
				content: [
					oLabelName, this.oInputName, this.oLabelKey, this.oInputManualKey, oSaveAsDialogOptionsGrid
				],
				stretch: Device.system.phone
			});

			this.oSaveAsDialog.addStyleClass("sapUiPopupWithPadding");
			this.oSaveAsDialog.addStyleClass("sapUiFlVarMngmtSaveDialog");

			if (this.oVariantLayout.$().closest(".sapUiSizeCompact").length > 0) {
				this.oSaveAsDialog.addStyleClass("sapUiSizeCompact");
			}

			this.addDependent(this.oSaveAsDialog);
		}
	};

	VariantManagement.prototype._openSaveAsDialog = function() {
		this._createSaveAsDialog();

		this.oInputName.setValue(this.getSelectedVariantText(this.getCurrentVariantKey()));
		this.oSaveSave.setEnabled(false);

		this.oInputName.setEnabled(true);
		this.oInputName.setValueState(ValueState.None);
		this.oInputName.setValueStateText(null);
		this.oDefault.setSelected(false);
		this.oExecuteOnSelect.setSelected(false);

		if (this.oVariantPopOver) {
			this.oVariantPopOver.close();
		}

		if (this.getManualVariantKey()) {
			this.oInputManualKey.setVisible(true);
			this.oInputManualKey.setEnabled(true);
			this.oInputManualKey.setValueState(ValueState.None);
			this.oInputManualKey.setValueStateText(null);
			this.oLabelKey.setVisible(true);
		} else {
			this.oInputManualKey.setVisible(false);
			this.oLabelKey.setVisible(false);
		}

		this.oSaveAsDialog.open();
	};

	VariantManagement.prototype._handleVariantSaveAs = function(sNewVariantName) {
		var sKey = null;
		var sName = sNewVariantName.trim();
		var sManualKey = this.oInputManualKey.getValue().trim();

		if (sName === "") {
			this.oInputName.setValueState(ValueState.Error);
			this.oInputName.setValueStateText(this._oRb.getText("VARIANT_MANAGEMENT_ERROR_EMPTY"));
			return;
		}

		if (this.getManualVariantKey()) {
			if (sManualKey === "") {
				this.oInputManualKey.setValueState(ValueState.Error);
				this.oInputManualKey.setValueStateText(this._oRb.getText("VARIANT_MANAGEMENT_ERROR_EMPTY"));
				return;
			}
			sKey = sManualKey;
		}

		if (this.oSaveAsDialog) {
			this.oSaveAsDialog.close();
		}

		if (this.oDefault.getSelected()) {
			this.setDefaultVariantKey(sKey);
		}

		this.setModified(false);

		this.fireSave({
			key: sKey, // is null
			name: sName,
			overwrite: false,
			def: this.oDefault.getSelected(),
			execute: this.oExecuteOnSelect.getSelected()
		});
	};

	VariantManagement.prototype._handleVariantSave = function() {
		var oItem = this._getItemByKey(this.getCurrentVariantKey());

		var bDefault = false;
		if (this.getDefaultVariantKey() === oItem.key) {
			bDefault = true;
		}

		if (this.oVariantPopOver) {
			this.oVariantPopOver.close();
		}

		this.fireSave({
			name: oItem.title,
			overwrite: true,
			key: oItem.key,
			def: bDefault
		});

		this.setModified(false);
	};

	// Manage Views dialog

	/**
	 * Opens the <i>Manage Views</i> dialog.
	 * @public
	 * @param {boolean} bCreateAlways - Indicates that if this is set to <code>true</code>, the former dialog will be destroyed before a new one is created
	 */
	VariantManagement.prototype.openManagementDialog = function(bCreateAlways, sClass) {
		if (bCreateAlways && this.oManagementDialog) {
			this.oManagementDialog.destroy();
			this.oManagementDialog = undefined;
		}
		this._openManagementDialog(sClass);
	};

	VariantManagement.prototype._triggerSearchInManageDialog = function(oEvent, oManagementTable) {
		if (!oEvent) {
			return;
		}

		var parameters = oEvent.getParameters();
		if (!parameters) {
			return;
		}

		var sValue = parameters.newValue ? parameters.newValue : "";

		var aFilters = [
			this._getVisibleFilter(), new Filter({
				filters: [
					new Filter({
						path: "title",
						operator: FilterOperator.Contains,
						value1: sValue
					}), new Filter({
						path: "author",
						operator: FilterOperator.Contains,
						value1: sValue
					})
				],
				and: false
			})
		];

		oManagementTable.getBinding("items").filter(aFilters);

		this._bDeleteOccured = true;
	};

	VariantManagement.prototype.getManageDialog = function() {
		return this.oManagementDialog;
	};

	VariantManagement.prototype._createManagementDialog = function() {
		if (!this.oManagementDialog || this.oManagementDialog.bIsDestroyed) {
			this.oManagementTable = new Table(this.getId() + "-managementTable", {
				growing: true,
				columns: [
					new Column({
						width: "3rem",
						visible: {
							path: "showFavorites",
							model: this._sModelName
						}
					}), new Column({
						header: new Text({
							text: this._oRb.getText("VARIANT_MANAGEMENT_NAME")
						}),
						width: "14rem"
					}), new Column({
						header: new Text({
							text: this._oRb.getText("VARIANT_MANAGEMENT_DEFAULT")
						}),
						width: "4rem",
						demandPopin: true,
						popinDisplay: PopinDisplay.Inline,
						minScreenWidth: ScreenSize.Tablet,
						visible: {
							path: "/showSetAsDefault",
							model: VariantManagement.INNER_MODEL_NAME
						}
					}), new Column({
						header: new Text({
							text: this._oRb.getText("VARIANT_MANAGEMENT_EXECUTEONSELECT")
						}),
						width: "6rem",
						hAlign: TextAlign.Center,
						demandPopin: true,
						popinDisplay: PopinDisplay.Inline,
						minScreenWidth: "800px",
						visible: {
							path: "/showExecuteOnSelection",
							model: VariantManagement.INNER_MODEL_NAME
						}
					}), new Column({
						header: new Text({
							text: this._oRb.getText("VARIANT_MANAGEMENT_AUTHOR")
						}),
						width: "8rem",
						demandPopin: true,
						popinDisplay: PopinDisplay.Inline,
						minScreenWidth: "900px"
					}), new Column({
						width: "2rem",
						hAlign: TextAlign.Center
					}), new Column({
						visible: false
					})
				]
			});

			this.oManagementSave = new Button(this.getId() + "-managementsave", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_OK"),
				enabled: true,
				type: sap.m.ButtonType.Emphasized,
				press: function() {
					this._handleManageSavePressed();
				}.bind(this)
			});

			this.oManagementCancel = new Button(this.getId() + "-managementcancel", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_CANCEL"),
				press: function() {
					this._resumeManagementTableBinding();
					this.oManagementDialog.close();
					this._handleManageCancelPressed();
				}.bind(this)
			});

			this.oManagementDialog = new Dialog(this.getId() + "-managementdialog", {
				resizable: true,
				draggable: true,
				customHeader: new Bar(this.getId() + "-managementHeader", {
					contentMiddle: [
						new Text(this.getId() + "-managementHeaderText", {
							text: this._oRb.getText("VARIANT_MANAGEMENT_MANAGEDIALOG")
						})
					]
				}),
				beginButton: this.oManagementSave,
				endButton: this.oManagementCancel,
				content: [
					this.oManagementTable
				],
				stretch: Device.system.phone
			});

			// add marker
			this.oManagementDialog.isPopupAdaptationAllowed = function() {
				return false;
			};

			this._oSearchFieldOnMgmtDialog = new SearchField();
			this._oSearchFieldOnMgmtDialog.attachLiveChange(function(oEvent) {
				this._triggerSearchInManageDialog(oEvent, this.oManagementTable);
			}.bind(this));

			var oSubHeader = new Bar(this.getId() + "-mgmHeaderSearch", {
				contentRight: [
					this._oSearchFieldOnMgmtDialog
				]
			});
			this.oManagementDialog.setSubHeader(oSubHeader);

			if (this.oVariantLayout.$().closest(".sapUiSizeCompact").length > 0) {
				this.oManagementDialog.addStyleClass("sapUiSizeCompact");
			}
			this.addDependent(this.oManagementDialog);

			this.oManagementTable.bindAggregation("items", {
				path: "variants",
				model: this._sModelName,
				factory: this._templateFactoryManagementDialog.bind(this),
				filters: this._getVisibleFilter()
			});

			this._bDeleteOccured = false;
		}
	};

	VariantManagement.prototype._setFavoriteIcon = function(oIcon, bFlagged) {
		if (oIcon) {
			oIcon.setSrc(bFlagged ? "sap-icon://favorite" : "sap-icon://unfavorite");
			oIcon.setTooltip(this._oRb.getText(bFlagged ? "VARIANT_MANAGEMENT_FAV_DEL_TOOLTIP" : "VARIANT_MANAGEMENT_FAV_ADD_TOOLTIP"));
		}
	};

	VariantManagement.prototype._templateFactoryManagementDialog = function(sId, oContext) {
		var sTooltip = null;
		var oDeleteButton;
		var sBindingPath;
		var oNameControl;
		var oItem = oContext.getObject();
		if (!oItem) {
			return undefined;
		}

		var fLiveChange = function(oEvent) {
			this._checkVariantNameConstraints(oEvent.oSource, this.oManagementSave, oEvent.oSource.getBindingContext(this._sModelName).getObject().key);
		}.bind(this);

		var fChange = function(oEvent) {
			this._handleManageTitleChanged(oEvent.oSource.getBindingContext(this._sModelName).getObject());
		}.bind(this);

		var fSelectRB = function(oEvent) {
			if (oEvent.getParameters().selected === true) {
				this._handleManageDefaultVariantChange(oEvent.oSource, oEvent.oSource.getBindingContext(this._sModelName).getObject());
			}
		}.bind(this);

		var fSelectCB = function(oEvent) {
			this._handleManageExecuteOnSelectionChanged(oEvent.oSource.getBindingContext(this._sModelName).getObject());
		}.bind(this);

		var fPress = function(oEvent) {
			this._handleManageDeletePressed(oEvent.oSource.getBindingContext(this._sModelName).getObject());
			var oListItem = oEvent.oSource.getParent();
			if (oListItem) {
				oListItem.setVisible(false);
			}
		}.bind(this);

		var fSelectFav = function(oEvent) {
			this._handleManageFavoriteChanged(oEvent.oSource, oEvent.oSource.getBindingContext(this._sModelName).getObject());
		}.bind(this);

		if (oItem.rename) {
			oNameControl = new Input({
				liveChange: fLiveChange,
				change: fChange,
				value: '{' + this._sModelName + ">title}"
			});
		} else {
			oNameControl = new ObjectIdentifier({
				title: '{' + this._sModelName + ">title}"
			});
			if (sTooltip) {
				oNameControl.setTooltip(sTooltip);
			}
		}

		oDeleteButton = new Button({
			icon: "sap-icon://sys-cancel",
			enabled: true,
			type: ButtonType.Transparent,
			press: fPress,
			tooltip: this._oRb.getText("VARIANT_MANAGEMENT_DELETE"),
			// visible: "{:= ${remove} ? true : false }}"
			visible: oItem.remove
		});

		this._assignColumnInfoForDeleteButton(oDeleteButton);

		sBindingPath = this.oContext.getPath();

		var oFavoriteIcon = new Icon({
			src: {
				path: "favorite",
				model: this._sModelName,
				formatter: function(bFlagged) {
					return bFlagged ? "sap-icon://favorite" : "sap-icon://unfavorite";
				}
			},
			tooltip: {
				path: 'favorite',
				model: this._sModelName,
				formatter: function(bFlagged) {
					return this._oRb.getText(bFlagged ? "VARIANT_MANAGEMENT_FAV_DEL_TOOLTIP" : "VARIANT_MANAGEMENT_FAV_ADD_TOOLTIP");
				}.bind(this)
			},
			press: fSelectFav
		});

		oFavoriteIcon.addStyleClass("sapUiFlVarMngmtFavColor");

		var oTemplate = new ColumnListItem({
			cells: [
				oFavoriteIcon, oNameControl, new RadioButton({
					groupName: this.getId(),
					select: fSelectRB,
					// selected: (oItem.key === sDefaultVariantKey) ? true : false
					selected: {
						path: sBindingPath + "/defaultVariant",
						model: this._sModelName,
						formatter: function(sKey) {
							return oItem.key === sKey;
						}
					}
				}), new CheckBox({
					// enabled: oItem.rename,
					select: fSelectCB,
					selected: '{' + this._sModelName + ">executeOnSelect}"
				}), new Text({
					text: '{' + this._sModelName + ">author}",
					textAlign: "Begin"
				}), oDeleteButton, new Text({
					text: '{' + this._sModelName + ">key}"
				})

			]
		});

		return oTemplate;
	};

	VariantManagement.prototype._openManagementDialog = function(sClass) {
		this._createManagementDialog();

		if (this.oVariantPopOver) {
			this.oVariantPopOver.close();
		}

		this._suspendManagementTableBinding();

		this._clearDeletedItems();
		this.oManagementSave.setEnabled(false);
		this._oSearchFieldOnMgmtDialog.setValue("");

		// Ideally, this should be done only once in <code>_createtManagementDialog</code>. However, the binding does not recognize a change if filtering is involved.
		// After a deletion on the UI, the item is filtered out <code>.visible=false</code>. The real deletion will occur only when <i>OK</i> is pressed.
		// Since the filterd items and the result after the real deletion are identical, no change is detected. Based on this, the context on the table is
		// not invalidated....
		// WA: Always do the binding while opening the dialog.
		if (this._bDeleteOccured) {
			this._bDeleteOccured = false;
			this.oManagementTable.bindAggregation("items", {
				path: "variants",
				model: this._sModelName,
				factory: this._templateFactoryManagementDialog.bind(this),
				filters: this._getVisibleFilter()
			});
		}
		if (sClass) {
			this.oManagementDialog.addStyleClass(sClass);
		}
		this.oManagementDialog.open();
	};

	VariantManagement.prototype._assignColumnInfoForDeleteButton = function(oDeleteButton) {
		if (!this._oInvisibleDeleteColumnName) {
			this._oInvisibleDeleteColumnName = new InvisibleText({
				text: this._oRb.getText("VARIANT_MANAGEMENT_ACTION_COLUMN")
			});

			this.oManagementDialog.addContent(this._oInvisibleDeleteColumnName);
		}

		if (this._oInvisibleDeleteColumnName) {
			oDeleteButton.addAriaLabelledBy(this._oInvisibleDeleteColumnName);
		}
	};

	VariantManagement.prototype._handleManageDefaultVariantChange = function(oRadioButton, oItem) {
		var sKey = oItem.key;

		if (!this._anyInErrorState(this.oManagementTable)) {
			this.oManagementSave.setEnabled(true);
		}

		if (this.getShowFavorites() && !oItem.favorite && oRadioButton) {
			oItem.favorite = true;
			this._setFavoriteIcon(oRadioButton.getParent().getCells()[VariantManagement.COLUMN_FAV_IDX], true);
		}

		this.setDefaultVariantKey(sKey);
	};

	VariantManagement.prototype._handleManageCancelPressed = function() {
		var sDefaultVariantKey;
		var oModel;
		this._getDeletedItems().forEach(function(oItem) {
			oItem.visible = true;
		});

		this._getItems().forEach(function(oItem) {
			oItem.title = oItem.originalTitle;
			oItem.favorite = oItem.originalFavorite;
			oItem.executeOnSelection = oItem.originalExecuteOnSelection;
		});

		sDefaultVariantKey = this.getOriginalDefaultVariantKey();
		if (sDefaultVariantKey !== this.getDefaultVariantKey()) {
			this.setDefaultVariantKey(sDefaultVariantKey);
		}

		oModel = this.getModel(this._sModelName);
		if (oModel) {
			oModel.checkUpdate();
		}
	};

	VariantManagement.prototype._handleManageFavoriteChanged = function(oIcon, oItem) {
		if (!this._anyInErrorState(this.oManagementTable)) {
			this.oManagementSave.setEnabled(true);
		}

		if ((this.getDefaultVariantKey() === oItem.key) && oItem.favorite) {
			return;
		}

		oItem.favorite = !oItem.favorite;
		this._setFavoriteIcon(oIcon, oItem.favorite);
	};

	VariantManagement.prototype._getRowForKey = function(sKey) {
		var oRowForKey = null;
		if (this.oManagementTable) {
			this.oManagementTable.getItems().some(function(oRow) {
				if (sKey === oRow.getCells()[0].getBindingContext(this._sModelName).getObject().key) {
					oRowForKey = oRow;
				}

				return oRowForKey !== null;
			}.bind(this));
		}

		return oRowForKey;
	};

	VariantManagement.prototype._handleManageDeletePressed = function(oItem) {
		var oModel;
		var sKey = oItem.key;

		// do not allow the deletion of the last entry
		if (this.oManagementTable.getItems().length === 1) {
			return;
		}

		if (!this._anyInErrorState(this.oManagementTable)) {
			this.oManagementSave.setEnabled(true);
		}

		oItem.visible = false;
		this._addDeletedItem(oItem);

		if ((sKey === this.getDefaultVariantKey())) {
			this.setDefaultVariantKey(this.getStandardVariantKey());
			if (this.getShowFavorites()) {
				var oNewDefaultItem = this._getItemByKey(this.getStandardVariantKey());
				if (oNewDefaultItem && !oNewDefaultItem.favorite) {
					var oRow = this._getRowForKey(this.getStandardVariantKey());
					if (oRow) {
						oNewDefaultItem.favorite = true;
						this._setFavoriteIcon(oRow.getCells()[VariantManagement.COLUMN_FAV_IDX], true);
					}
				}
			}
		}

		oModel = this.getModel(this._sModelName);
		if (oModel) {
			oModel.checkUpdate();
		}

		this.oManagementCancel.focus();
	};

	VariantManagement.prototype._handleManageExecuteOnSelectionChanged = function() {
		if (!this._anyInErrorState(this.oManagementTable)) {
			this.oManagementSave.setEnabled(true);
		}
	};

	VariantManagement.prototype._handleManageTitleChanged = function() {
		if (!this._anyInErrorState(this.oManagementTable)) {
			this.oManagementSave.setEnabled(true);
		}
	};

	VariantManagement.prototype._handleManageSavePressed = function() {
		this._getDeletedItems().some(function(oItem) {
			if (oItem.key === this.getCurrentVariantKey()) {
				var sKey = this.getStandardVariantKey();

				this.setModified(false);
				this.setCurrentVariantKey(sKey);

				this.fireEvent("select", {
					key: sKey
				});
				return true;
			}

			return false;
		}.bind(this));

		this.fireManage();

		this._resumeManagementTableBinding();
		this.oManagementDialog.close();
	};

	VariantManagement.prototype._resumeManagementTableBinding = function() {
		if (this.oManagementTable) {
			var oListBinding = this.oManagementTable.getBinding("items");
			if (oListBinding) {
				oListBinding.resume();
			}
		}
	};

	VariantManagement.prototype._suspendManagementTableBinding = function() {
		if (this.oManagementTable) {
			var oListBinding = this.oManagementTable.getBinding("items");
			if (oListBinding) {
				oListBinding.suspend();
			}
		}
	};

	VariantManagement.prototype._anyInErrorState = function(oManagementTable) {
		var aItems;
		var oInput;
		var bInError = false;

		if (oManagementTable) {
			aItems = oManagementTable.getItems();
			aItems.some(function(oItem) {
				oInput = oItem.getCells()[VariantManagement.COLUMN_NAME_IDX];
				if (oInput && oInput.getValueState && (oInput.getValueState() === ValueState.Error)) {
					bInError = true;
				}

				return bInError;
			});
		}

		return bInError;
	};

	// UTILS

	VariantManagement.prototype._getFilters = function(oFilter) {
		var aFilters = [];

		if (oFilter) {
			aFilters.push(oFilter);
		}

		aFilters.push(this._getVisibleFilter());

		if (this.getShowFavorites()) {
			aFilters.push(this._getFilterFavorites());
		}

		return aFilters;
	};

	VariantManagement.prototype._getVisibleFilter = function() {
		return new Filter({
			path: "visible",
			operator: FilterOperator.EQ,
			value1: true
		});
	};

	VariantManagement.prototype._getFilterFavorites = function() {
		return new Filter({
			path: "favorite",
			operator: FilterOperator.EQ,
			value1: true
		});
	};


	VariantManagement.prototype._checkVariantNameConstraints = function(oInputField, oSaveButton, sKey) {
		if (!oInputField) {
			return;
		}

		var sValue = oInputField.getValue();
		sValue = sValue.trim();

		if (!this._checkIsDuplicate(sValue, sKey)) {
			if (sValue === "") {
				oInputField.setValueState(ValueState.Error);
				oInputField.setValueStateText(this._oRb.getText("VARIANT_MANAGEMENT_ERROR_EMPTY"));
			} else if (sValue.indexOf('{') > -1) {
				oInputField.setValueState(ValueState.Error);
				oInputField.setValueStateText(this._oRb.getText("VARIANT_MANAGEMENT_NOT_ALLOWED_CHAR", [
					"{"
				]));
			} else if (sValue.length > VariantManagement.MAX_NAME_LEN) {
				oInputField.setValueState(ValueState.Error);
				oInputField.setValueStateText(this._oRb.getText("VARIANT_MANAGEMENT_MAX_LEN", [
					VariantManagement.MAX_NAME_LEN
				]));
			} else {
				oInputField.setValueState(ValueState.None);
				oInputField.setValueStateText(null);
			}
		} else {
			oInputField.setValueState(ValueState.Error);
			oInputField.setValueStateText(this._oRb.getText("VARIANT_MANAGEMENT_ERROR_DUPLICATE"));
		}

		if (oSaveButton) {
			if (oInputField.getValueState() === ValueState.Error) {
				oSaveButton.setEnabled(false);
			} else {
				oSaveButton.setEnabled(true);
			}
		}
	};

	VariantManagement.prototype._checkIsDuplicate = function(sValue, sKey) {
		var bDublicate = false;
		var aItems = this._getItems();
		var sLowerCaseValue = sValue.toLowerCase();
		aItems.some(function(oItem) {
			if (oItem.title.toLowerCase() === sLowerCaseValue) {
				if (sKey && (sKey === oItem.key)) {
					return false;
				}
				bDublicate = true;
			}

			return bDublicate;
		});

		return bDublicate;
	};

	// exit destroy all controls created in init
	VariantManagement.prototype.exit = function() {
		var oModel;

		if (this.oVariantInvisibleText) {
			this.oVariantInvisibleText.destroy(true);
			this.oVariantInvisibleText = undefined;
		}

		if (this.oDefault && !this.oDefault._bIsBeingDestroyed) {
			this.oDefault.destroy();
		}
		this.oDefault = undefined;

		if (this.oExecuteOnSelect && !this.oExecuteOnSelect._bIsBeingDestroyed) {
			this.oExecuteOnSelect.destroy();
		}
		this.oExecuteOnSelect = undefined;
		this._oRb = undefined;

		this.oContext = undefined;

		this._oVariantList = undefined;
		this.oVariantSelectionPage = undefined;
		this.oVariantLayout = undefined;
		this.oVariantText = undefined;
		this.oVariantPopoverTrigger = undefined;
		this._oSearchField = undefined;
		this._oSearchFieldOnMgmtDialog = undefined;

		oModel = this.getModel(VariantManagement.INNER_MODEL_NAME);
		if (oModel) {
			oModel.destroy();
		}
	};

	return VariantManagement;
});
