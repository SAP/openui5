/*
 * ! ${copyright}
 */

// Provides control sap.ui.fl.variants.VariantManagement.
sap.ui.define([
	'sap/ui/model/Context', 'sap/ui/model/PropertyBinding', 'sap/ui/model/json/JSONModel', 'sap/ui/model/Filter', 'sap/ui/Device', 'sap/ui/core/TextAlign', 'sap/ui/core/InvisibleText', 'sap/ui/core/Control', 'sap/ui/core/Icon', 'sap/ui/core/ValueState', 'sap/ui/layout/HorizontalLayout', 'sap/ui/layout/Grid', 'sap/m/SearchField', 'sap/m/RadioButton', 'sap/m/ScreenSize', 'sap/m/PopinDisplay', 'sap/m/ColumnListItem', 'sap/m/Column', 'sap/m/Text', 'sap/m/Bar', 'sap/m/Table', 'sap/m/Page', 'sap/m/PlacementType', 'sap/m/ButtonType', 'sap/m/Toolbar', 'sap/m/ToolbarSpacer', 'sap/m/Button', 'sap/m/CheckBox', 'sap/m/Dialog', 'sap/m/Input', 'sap/m/Label', 'sap/m/Title', 'sap/m/ResponsivePopover', 'sap/m/SelectList', 'sap/m/ObjectIdentifier', 'sap/m/OverflowToolbar', 'sap/m/OverflowToolbarPriority', 'sap/m/OverflowToolbarLayoutData', 'sap/m/VBox', 'sap/ui/fl/Utils', '../changeHandler/BaseTreeModifier', "sap/ui/events/KeyCodes"
], function(Context, PropertyBinding, JSONModel, Filter, Device, TextAlign, InvisibleText, Control, Icon, ValueState, HorizontalLayout, Grid, SearchField, RadioButton, ScreenSize, PopinDisplay, ColumnListItem, Column, Text, Bar, Table, Page, PlacementType, ButtonType, Toolbar, ToolbarSpacer, Button, CheckBox, Dialog, Input, Label, Title, ResponsivePopover, SelectList, ObjectIdentifier, OverflowToolbar, OverflowToolbarPriority, OverflowToolbarLayoutData, VBox, flUtils, BaseTreeModifier, KeyCodes) {
	"use strict";

	/**
	 * Constructor for a new VariantManagement.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>VariantManagement</code> control can be used to manage variants.
	 *
	 * <h3>Usage</h3>
	 *
	 * You can use this control in most controls that are enabled for <i>UI adaptation at runtime</i>.
	 *
	 * @see {@link topic:f1430c0337534d469da3a56307ff76af UI Adaptation at Runtime: Enable Your App}
	 *
	 * @extends sap.ui.core.Control
	 * @constructor
	 * @public
	 * @since 1.56
	 * @alias sap.ui.fl.variants.VariantManagement
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var VariantManagement = Control.extend("sap.ui.fl.variants.VariantManagement", /** @lends sap.ui.fl.variants.VariantManagement.prototype */
	{
		metadata: {
			library: "sap.ui.fl",
			designtime: "sap/ui/fl/designtime/variants/VariantManagement.designtime",
			properties: {

				/**
				 * Indicates that Execute on Selection is visible in the Save Variant and the Manage Variants dialogs.
				 */
				showExecuteOnSelection: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Indicates that set as default is visible in the Save Variant and the Manage Variants dialogs.
				 */
				showSetAsDefault: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * If set to<code>true</code>, the key for a vendor variant will be added manually.<br>
				 * <b>Node:</b>This flag is only used internally in the app variant scenarios.
				 */
				manualVariantKey: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Indicates that the control is in error state. If set to <code>true</code> error message will be displayed whenever the variant is
				 * opened.
				 */
				inErrorState: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Indicates that the control is in edit state. If set to <code>false</code> the footer of the views list will be hidden.
				 */
				editable: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Determines the name of the model. The binding context will be defined by the current ID.
				 * <p>
				 * <b>Note:</b> In a UI adaptation scenario, this property is not used at all because the model name is <i>$FlexVariants</i>
				 */
				modelName: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Determines the intention of setting the current variant based on passed information.
				 * <p>
				 * <b>Note:</b> The VariantManagement control does not react in any way to this property.
				 */
				updateVariantInURL: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				}
			},
			associations: {

				/**
				 * Contains the controls, for which the variant management is responsible.
				 */
				"for": {
					type: "sap.ui.core.Control",
					multiple: true
				}
			},
			events: {

				/**
				 * This event is fired when the Save Variant dialog is closed with OK for a variant.
				 */
				save: {
					parameters: {
						/**
						 * The variant title
						 */
						name: {
							type: "string"
						},

						/**
						 * Indicates if an existing variant is overwritten or if a new variant is created
						 */
						overwrite: {
							type: "boolean"
						},

						/**
						 * The variant key
						 */
						key: {
							type: "string"
						},

						/**
						 * The Execute on Selection indicator
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
				 * This event is fired when users apply changes to variants in the Manage Variants dialog.
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
						 * The variant key
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
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
		 */
		renderer: function(oRm, oControl) {
			oRm.write("<div ");
			oRm.writeControlData(oControl);
			oRm.addClass("sapUiFlVarMngmt");
			oRm.writeClasses();

			oRm.write(">");

			oRm.renderControl(oControl.oVariantLayout);
			oRm.write("</div>");
		}
	});

	VariantManagement.MODEL_NAME = "$FlexVariants";
	VariantManagement.INNER_MODEL_NAME = "$sapUiFlVariants";
	VariantManagement.MAX_NAME_LEN = 100;
	VariantManagement.COLUMN_FAV_IDX = 0;
	VariantManagement.COLUMN_NAME_IDX = 1;

	/*
	 * Constructs and initializes the VariantManagement control.
	 */
	VariantManagement.prototype.init = function() {

		this._sModelName = VariantManagement.MODEL_NAME;

		this.attachModelContextChange(this._setModel, this);

		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl");

		this._createInnerModel();

		this.oVariantInvisibleText = new InvisibleText({
			text: {
				parts: [
					{
						path: 'currentVariant',
						model: this._sModelName
					}, {
						path: "modified",
						model: this._sModelName
					}
				],
				formatter: function(sText, bValue) {
					if (bValue) {
						sText = this._oRb.getText("VARIANT_MANAGEMENT_SEL_VARIANT_MOD", [
							sText
						]);
					} else {
						sText = this._oRb.getText("VARIANT_MANAGEMENT_SEL_VARIANT", [
							sText
						]);
					}
				}.bind(this)
			}
		});

		this.oVariantText = new Title(this.getId() + "-text", {
			text: {
				path: 'currentVariant',
				model: this._sModelName,
				formatter: function(sKey) {
					var sText = this.getSelectedVariantText(sKey);
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
					return (bValue === null || bValue === undefined) ? false : bValue;
				}
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
				this.oVariantText, oVariantModifiedText, this.oVariantPopoverTrigger, this.oVariantInvisibleText
			]
		});
		this.oVariantLayout.addStyleClass("sapUiFlVarMngmtLayout");

		this.addDependent(this.oVariantLayout);
	};

	/**
	 * Returns the title control of the VariantManagement. Usage in RTA scenario.
	 * @protected
	 * @returns {sap.m.Title} title part of the VariantManagement control.
	 */
	VariantManagement.prototype.getTitle = function() {
		return this.oVariantText;
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
	 * @param {String} sKey the variant key which should be selected.
	 * @returns {sap.ui.fl.variants.VariantManagement} the current instance of {@link sap.ui.fl.variants.VariantManagement}.
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
	 * @returns {String} The currently selected variant key. In case the model is yet not set <code>null</code> will be returned.
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
		var sTitle, oInnerModel, oModel = this.getModel(this._sModelName);
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
	 * @returns {array} with all variants. In case the model is yet not set an empty array will be returned.
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

	VariantManagement.prototype._getDeletedItems = function(oItem) {
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
		var oItem = null, aItems = this._getItems();
		aItems.some(function(oEntry) {
			if (oEntry.key === sKey) {
				oItem = oEntry;
			}

			return (oItem != null);
		});

		return oItem;
	};

	VariantManagement.prototype._rebindControl = function(sValue) {

		this.oVariantInvisibleText.unbindProperty("text");
		this.oVariantInvisibleText.bindProperty("text", {
			parts: [
				{
					path: 'currentVariant',
					model: this._sModelName
				}, {
					path: "modified",
					model: this._sModelName
				}
			],
			formatter: function(sText, bValue) {
				if (bValue) {
					sText = this._oRb.getText("VARIANT_MANAGEMENT_SEL_VARIANT_MOD", [
						sText
					]);
				} else {
					sText = this._oRb.getText("VARIANT_MANAGEMENT_SEL_VARIANT", [
						sText
					]);
				}
			}.bind(this)
		});

		this.oVariantText.unbindProperty("text");
		this.oVariantText.bindProperty("text", {
			path: 'currentVariant',
			model: this._sModelName,
			formatter: function(sKey) {
				var sText = this.getSelectedVariantText(sKey);
				return sText;
			}.bind(this)
		});

		this.oVariantText.unbindProperty("visible", {
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

	};

	VariantManagement.prototype._setBindingContext = function() {

		var oModel, sLocalId;

		if (!this.oContext) {

			oModel = this.getModel(this._sModelName);
			if (oModel) {
				sLocalId = this._getLocalId();
				if (sLocalId) {

					this.oContext = new Context(oModel, "/" + sLocalId);
					this.setBindingContext(this.oContext, this._sModelName);

					if (!this.getModelName() && oModel.registerToModel) { // RTA relevant
						oModel.registerToModel(this);
					}

					this._assignPopoverTitle();

					this._registerPropertyChanges(oModel);

					this.fireInitialized();
				}
			}
		}
	};

	VariantManagement.prototype._getLocalId = function() {
		if (this.getModelName() && (this._sModelName !== VariantManagement.MODEL_NAME)) {
			return this.getId();
		}

		return BaseTreeModifier.getSelector(this, flUtils.getComponentForControl(this)).id;
	};

	VariantManagement.prototype._setModel = function() {
		this._setBindingContext();
	};

	VariantManagement.prototype._registerPropertyChanges = function(oModel) {
		var oBinding = new PropertyBinding(oModel, this.oContext + "/variantsEditable");
		oBinding.attachChange(function(oData) {
			if (oData && oData.oSource && oData.oSource.oModel && oData.oSource.sPath) {
				var oInnerModel, bFlag = oData.oSource.oModel.getProperty(oData.oSource.sPath);
				oInnerModel = this.getModel(VariantManagement.INNER_MODEL_NAME);
				if (oInnerModel) {
					oInnerModel.setProperty("/editable", bFlag);
				}
			}
		}.bind(this));

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

	VariantManagement.prototype.onclick = function(oEvent) {
		if (this.oVariantPopoverTrigger && !this.bPopoverOpen) {
			this.oVariantPopoverTrigger.focus();
		}
		this.handleOpenCloseVariantPopover();
	};

	VariantManagement.prototype.onkeydown = function(oEvent) {
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
				placement: PlacementType.Bottom,
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

	// VARIANT LIST
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
			enabled: {
				path: "modified",
				model: this._sModelName,
				formatter: function(bValue) {
					return bValue;
				}
			},
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
			placement: PlacementType.Bottom,
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

		this.oVariantSelectionPage.setShowSubHeader(this._oVariantList.getItems().length > 9 ? true : false);

		this.oVariantSaveBtn.setEnabled(false);
		this.oVariantSaveAsBtn.setEnabled(true);

		if (this.getModified()) {
			oItem = this._getItemByKey(this.getCurrentVariantKey());
			if (oItem && oItem.change) {
				this.oVariantSaveBtn.setEnabled(true);
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
			operator: sap.ui.model.FilterOperator.Contains,
			value1: sValue
		});

		oVariantList.getBinding("items").filter(this._getFilters(oFilter));
	};

	// SAVE DIALOG

	VariantManagement.prototype._createSaveAsDialog = function() {

		if (!this.oSaveAsDialog) {

			this.oInputName = new Input(this.getId() + "-name", {
				liveChange: function(oEvent) {
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
				liveChange: function(oEvent) {
					this._checkVariantNameConstraints(this.oInputManualKey);
				}.bind(this)
			});

			this.oLabelKey = new Label(this.getId() + "-keylabel", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_KEY"),
				required: true
			});
			this.oLabelKey.setLabelFor(this.oInputManualKey);

			this.oSaveSave = new Button(this.getId() + "-variantsave", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_OK"),
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
		var sKey = null, sName = sNewVariantName.trim(), sManualKey = this.oInputManualKey.getValue().trim();

		if (sName == "") {
			this.oInputName.setValueState(ValueState.Error);
			this.oInputName.setValueStateText(this._oRb.getText("VARIANT_MANAGEMENT_ERROR_EMPTY"));
			return;
		}

		if (this.getManualVariantKey()) {
			if (sManualKey == "") {
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

// MANAGE DIALOG

	/**
	 * Opens the manage dialog.
	 * @public
	 * @param {boolean} bCreateAlways in case this is set to <code>true</code> the former dialog will be destroyed, before a new one is created.
	 */
	VariantManagement.prototype.openManagementDialog = function(bCreateAlways) {
		if (bCreateAlways && this.oManagementDialog) {
			this.oManagementDialog.destroy();
			this.oManagementDialog = undefined;
		}
		this._openManagementDialog();
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
						operator: sap.ui.model.FilterOperator.Contains,
						value1: sValue
					}), new Filter({
						path: "author",
						operator: sap.ui.model.FilterOperator.Contains,
						value1: sValue
					})
				],
				and: false
			})
		];

		oManagementTable.getBinding("items").filter(aFilters);

		this._bDeleteOccured = true;
	};

	VariantManagement.prototype._createManagementDialog = function() {

		if (!this.oManagementDialog) {

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
				press: function() {
					this._handleManageSavePressed();
				}.bind(this)
			});

			this.oManagementCancel = new Button(this.getId() + "-managementcancel", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_CANCEL"),
				press: function() {
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

		var sTooltip = null, oDeleteButton, sBindingPath, oNameControl, oItem = oContext.getObject();
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
		}.bind(this);

		var fSelectFav = function(oEvent) {
			this._handleManageFavoriteChanged(oEvent.oSource, oEvent.oSource.getBindingContext(this._sModelName).getObject());
		}.bind(this);

// if (oItem.key !== this.getStandardVariantKey()) {
// if (!oItem.remove) {
// sTooltip = this._oRb.getText("VARIANT_MANAGEMENT_WRONG_LAYER");
// } else if (oItem.textReadOnly) {
// sTooltip = this._oRb.getText("VARIANT_MANAGEMENT_WRONG_LANGUAGE");
// }
// }

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
							return (oItem.key === sKey) ? true : false;
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

	VariantManagement.prototype._openManagementDialog = function() {

		this._createManagementDialog();

		if (this.oVariantPopOver) {
			this.oVariantPopOver.close();
		}

		this._clearDeletedItems();
		this.oManagementSave.setEnabled(false);
		this._oSearchFieldOnMgmtDialog.setValue("");

		// Idealy this should be done only once in _createtManagementDialog. But the binding does not recognize a change, when filtering is involved.
		// After delete on the ui we filter the item out .visible=false. The real deletion will occure only when OK is pressed.
		// But the filterd items and the result after real deletion is identical, so no change is detected; based on this the context on the table is
		// not invalidated....
		// WA: do the binding always, while opening the dialog.
		if (this._bDeleteOccured) {

			this._bDeleteOccured = false;
			this.oManagementTable.bindAggregation("items", {
				path: "variants",
				model: this._sModelName,
				factory: this._templateFactoryManagementDialog.bind(this),
				filters: this._getVisibleFilter()
			});

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
			oItem.favorite = !oItem.favorite;
			this._setFavoriteIcon(oRadioButton.getParent().getCells()[VariantManagement.COLUMN_FAV_IDX], oItem.favorite);
		}

		this.setDefaultVariantKey(sKey);
	};

	VariantManagement.prototype._handleManageCancelPressed = function() {
		var sDefaultVariantKey, oModel;
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

	VariantManagement.prototype._handleManageDeletePressed = function(oItem) {

		var oModel, sKey = oItem.key;

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
		}

		oModel = this.getModel(this._sModelName);
		if (oModel) {
			oModel.checkUpdate();
		}

		this.oManagementCancel.focus();
	};

	VariantManagement.prototype._handleManageExecuteOnSelectionChanged = function(oItem) {

		if (!this._anyInErrorState(this.oManagementTable)) {
			this.oManagementSave.setEnabled(true);
		}
	};

	VariantManagement.prototype._handleManageTitleChanged = function(oItem) {

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

		this.oManagementDialog.close();

	};

	VariantManagement.prototype._anyInErrorState = function(oManagementTable) {
		var aItems, oInput, bInError = false;

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
			operator: sap.ui.model.FilterOperator.EQ,
			value1: true
		});
	};

	VariantManagement.prototype._getFilterFavorites = function() {
		return new Filter({
			path: "favorite",
			operator: sap.ui.model.FilterOperator.EQ,
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
		var bDublicate = false, aItems = this._getItems(), sLowerCaseValue = sValue.toLowerCase();
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
		this.oVariantInvisibleText = undefined;
		this._oSearchField = undefined;
		this._oSearchFieldOnMgmtDialog = undefined;

		oModel = this.getModel(VariantManagement.INNER_MODEL_NAME);
		if (oModel) {
			oModel.destroy();
		}
	};

	return VariantManagement;

}, /* bExport= */true);