/*
 * ! ${copyright}
 */

// Provides control sap.m.VariantManagement.
sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/base/ManagedObjectModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/Device",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/Control",
	"sap/ui/core/Icon",
	"sap/ui/core/Item",
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
	"sap/m/ToggleButton",
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
	'sap/m/HBox',
	"sap/ui/events/KeyCodes",
	"sap/ui/core/library",
	"sap/m/library"
], function(
	JSONModel,
	ManagedObjectModel,
	Filter,
	FilterOperator,
	Device,
	InvisibleText,
	Control,
	Icon,
	Item,
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
	ToggleButton,
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
	HBox,
	KeyCodes,
	coreLibrary,
	mobileLibrary
) {
	"use strict";

	// shortcut for sap.m.OverflowToolbarPriority
	var OverflowToolbarPriority = mobileLibrary.OverflowToolbarPriority;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.FlexAlignItems
	var FlexAlignItems = mobileLibrary.FlexAlignItems;

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

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	/**
	 * Constructor for a new <code>VariantManagement</code>.
	 * @param {string} [sId] - ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] - Initial settings for the new control
	 * @class Can be used to manage variants. You can use this control in most controls that are enabled for <i>key user adaptation</i>.<br>
	 * <b>Note: </b>On the user interface, variants are generally referred to as "views".
	 * @extends sap.ui.core.Control
	 * @constructor
	 * @experimental As of version 1.103
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta, sap.ui.comp
	 * @since 1.103
	 * @alias sap.m.VariantManagement
	 */
	var VariantManagement = Control.extend("sap.m.VariantManagement", /** @lends sap.m.VariantManagement.prototype */ {
		metadata: {
			interfaces: [
				"sap.m.IOverflowToolbarContent"
			],
			library: "sap.m",
			designtime: "sap/m/designtime/VariantManagement.designtime",
			properties: {
				/**
				 * Indicates that default of variants is supported
				 */
				supportDefault: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Indicates that favorite handling is supported
				 */
				supportFavorites: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Indicates that apply automatically functionality is supported
				 */
				supportApplyAutomatically: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 *  Indicates that public functionality is supported
				 */
				supportPublic: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 *  Indicates that contexts functionality is supported
				 */
				supportContexts: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Identifies the currently selected item
				 */
				selectedKey: {
					type: "string",
					group: "Misc",
					defaultValue: ""
				},

				/**
				 * Identifies the defaulted item
				 */
				defaultKey: {
					type: "string",
					group: "Misc",
					defaultValue: ""
				},

				/**
				 * Controls the visibility of the 'SaveAs' button
				 */
				showSaveAs: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * If set to <code>false</code> neither 'Save As' nor 'Save' buttons on the 'My Views' dialog are visible.
				 */
				creationAllowed: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Indicates that the control is in edit state. If set to <code>false</code>, the footer of the <i>Views</i> list will be hidden.
				 */
				showFooter: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Indicates the visible and selected item.
				 */
				modified: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Indicates the title in the 'My Views' popover.
				 */
				popoverTitle: {
					type: "string",
					group: "Misc",
					defaultValue: ""
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
				 */
				displayTextForExecuteOnSelectionForStandardVariant: {
					type: "string",
					group: "Misc",
					defaultValue: ""
				},

				/**
				 * Semantic level of the header.
                 * For more information, see {@link sap.m.Title#setLevel}.
				 */
				level: {
					type: "sap.ui.core.TitleLevel",
                    group: "Appearance",
                    defaultValue: TitleLevel.Auto
				}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * Items displayed by the <code>VariantManagement</code> control.
				 */
				items: {
					type: "sap.m.VariantItem",
					multiple: true,
					singularName: "item"
				}
			},
			events: {

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
						 * The default variant indicator
						 */
						def: {
							type: "boolean"
						},

						/**
						 * Indicates the check box state for 'Public'.
						 */
						'public': {
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
				 * This event is fired when users presses the cancel button inside <i>Manage Views</i> dialog.
				 */
				manageCancel: {},

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
						 * List of variant keys and the associated favorite indicator
						 */
						fav: {
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
			}
		},

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 * @param {sap.ui.core.RenderManager} oRm - <code>RenderManager</code> that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl - Object representation of the control that should be rendered
		 */
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl)
					.class("sapMVarMngmt")
					.openEnd();

				oRm.renderControl(oControl.oVariantLayout);
				oRm.close("div");
			}
		}
	});

	VariantManagement.INNER_MODEL_NAME = "$sapMInnerVariants";
	VariantManagement.MAX_NAME_LEN = 100;
	VariantManagement.COLUMN_FAV_IDX = 0;
	VariantManagement.COLUMN_NAME_IDX = 1;

	/*
	 * Constructs and initializes the <code>VariantManagement</code> control.
	 */
	VariantManagement.prototype.init = function() {

		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");


        this._oManagedObjectModel = new ManagedObjectModel(this);
        this.setModel(this._oManagedObjectModel, "$mVariants");
	};

	VariantManagement.prototype.applySettings = function(mSettings, oScope) {
		Control.prototype.applySettings.apply(this, arguments);

		this._createInnerModel();
		this._initializeControl();
	};

	VariantManagement.prototype.setShowFooter = function(bValue) {
		this.setProperty("showFooter", bValue);
		return this;
	};

	VariantManagement.prototype.setDefaultKey = function(sValue) {
		this.setProperty("defaultKey", sValue);
		return this;
	};

	VariantManagement.prototype.setPopoverTitle = function(sValue) {
		this.setProperty("popoverTitle", sValue);
		return this;
	};


	VariantManagement.prototype._initializeControl = function() {
		if (this.oVariantInvisibleText) {
			return;
		}

		this.oVariantInvisibleText = new InvisibleText();

		this.oVariantText = new Title(this.getId() + "-text", {
			text: {
				path: '/selectedKey',
				model: "$mVariants",
				formatter: function(sKey) {
					var sText = "";
					if (sKey) {
						sText = this.getSelectedVariantText(sKey);
						this._setInvisibleText(sText, this.getModified());
					}

					return sText;
				}.bind(this)
			},
			level: {
				path: '/level',
				model: "$mVariants"
			}
		});

		this.oVariantText.addStyleClass("sapMVarMngmtClickable");
		this.oVariantText.addStyleClass("sapMVarMngmtTitle");
		this.oVariantText.addStyleClass("sapMTitleStyleH4");
		if (Device.system.phone) {
			this.oVariantText.addStyleClass("sapMVarMngmtTextPhoneMaxWidth");
		} else {
			this.oVariantText.addStyleClass("sapMVarMngmtTextMaxWidth");
		}

		var oVariantModifiedText = new Text(this.getId() + "-modified", {
			text: "*",
			visible: {
				path: "/modified",
				model: "$mVariants",
				formatter: function(bValue) {
					var sKey = this.getSelectedKey();

					if (sKey) {
						this._setInvisibleText(this.getSelectedVariantText(sKey), bValue);
					}

					return ((bValue === null) || (bValue === undefined)) ? false : bValue;
				}.bind(this)
			}
		});
		oVariantModifiedText.setVisible(false);
		oVariantModifiedText.addStyleClass("sapMVarMngmtModified");
		oVariantModifiedText.addStyleClass("sapMVarMngmtClickable");

		this.oVariantPopoverTrigger = new ToggleButton(this.getId() + "-trigger", {
			icon: "sap-icon://slim-arrow-down",
			type: ButtonType.Transparent,
			tooltip: this._oRb.getText("VARIANT_MANAGEMENT_TRIGGER_TT")
		});

		this.oVariantPopoverTrigger.addAriaLabelledBy(this.oVariantInvisibleText);
		this.oVariantPopoverTrigger.addStyleClass("sapMVarMngmtClickable");

		this.oVariantLayout = new HorizontalLayout({
			content: [
				this.oVariantText, oVariantModifiedText, this.oVariantPopoverTrigger
			]
		});
		this.oVariantLayout.addStyleClass("sapMVarMngmtLayout");

		oVariantModifiedText.setVisible(false);

		this.oVariantModifiedText = oVariantModifiedText;

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
		return {
			canOverflow: false,
			invalidationEvents: ["save", "manage", "select"]
		};
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
			showManualVariantKey: false,
			showCreateTile: false
		});
		this.setModel(oModel, VariantManagement.INNER_MODEL_NAME);
	};


	VariantManagement.prototype._getShowCreateTile = function() {
		return this._getInnerModelProperty("/showCreateTile");
	};
	VariantManagement.prototype._setShowCreateTile = function(bValue) {
		this._setInnerModelProperty("/showCreateTile", bValue);
	};

	VariantManagement.prototype._getShowManualVariantKey = function() {
		return this._getInnerModelProperty("/showManualVariantKey");
	};
	VariantManagement.prototype._setShowManualVariantKey = function(bValue) {
		this._setInnerModelProperty("/showManualVariantKey", bValue);
	};

	VariantManagement.prototype._setInnerModelProperty = function(sPropertyPath, vValue) {
		var oInnerModel = this.getModel(VariantManagement.INNER_MODEL_NAME);
		if (oInnerModel) {
			oInnerModel.setProperty(sPropertyPath, vValue);
		}
	};

	VariantManagement.prototype._getInnerModelProperty = function(sPropertyPath) {
		var oInnerModel = this.getModel(VariantManagement.INNER_MODEL_NAME);
		if (oInnerModel) {
			return oInnerModel.getProperty(sPropertyPath);
		}

		return null;
	};


	/**
	 * Gets all the variants
	 * @private
	 * @returns {array} Of variants
	 */
	VariantManagement.prototype._getItems = function() {
		return this.getItems();
	};


	VariantManagement.prototype.getSelectedVariantText = function(sKey) {
		var oItem = this._getItemByKey(sKey);

		if (oItem) {
			return oItem.getTitle();
		}

		return "";
	};

	VariantManagement.prototype.getStandardVariantKey = function() {
		var aItems = this._getItems();
		if (aItems && aItems[0]) {
			return aItems[0].getKey();
		}

		return null;
	};


	VariantManagement.prototype._clearDeletedItems = function() {
		this._aDeletedItems = [];
	};

	VariantManagement.prototype._addDeletedItem = function(oItem) {
		var sKey = oItem.getKey();
		if (this._aDeletedItems.indexOf(sKey) < 0) {
			this._aDeletedItems.push(sKey);
		}
	};

	VariantManagement.prototype._getDeletedItems = function() {
		return this._aDeletedItems;
	};

	VariantManagement.prototype._clearRenamedItems = function() {
		this._aRenamedItems = [];
	};

	VariantManagement.prototype._addRenamedItem = function(oItem) {
		var sKey = oItem.getKey();
		if (this._aRenamedItems.indexOf(sKey) < 0) {
			this._aRenamedItems.push(sKey);
		}
	};

	VariantManagement.prototype._removeRenamedItem = function(oItem) {
		var sKey = oItem.getKey();
		var nIdx = this._aRenamedItems.indexOf(sKey);
		if ( nIdx >= 0) {
			this._aRenamedItems.splice(nIdx, 1);
		}
	};

	VariantManagement.prototype._getRenamedItems = function() {
		return this._aRenamedItems;
	};


	VariantManagement.prototype._getItemByKey = function(sKey) {
		var oItem = null;
		var aItems = this._getItems();
		if (aItems) {
			aItems.some(function(oEntry) {
				if (oEntry.getKey() === sKey) {
					oItem = oEntry;
				}

				return (oItem !== null);
			});
		}

		return oItem;
	};


	VariantManagement.prototype._obtainControl = function(oEvent) {
		if (oEvent && oEvent.target && oEvent.target.id) {
			var sId = oEvent.target.id;
			var nPos = sId.indexOf("-inner");
			if (nPos > 0) {
				sId = sId.substring(0, nPos);
			}
			return sap.ui.getCore().byId(sId);
		}

		return null;
	};

	// clickable area
	VariantManagement.prototype.handleOpenCloseVariantPopover = function(oEvent) {
		if (!this.bPopoverOpen) {
			this._oCtrlRef = this._obtainControl(oEvent);
			this._openVariantList();
		} else if (this.oVariantPopOver && this.oVariantPopOver.isOpen()) {
			this.oVariantPopOver.close();
		} else if (this.getInErrorState() && this.oErrorVariantPopOver && this.oErrorVariantPopOver.isOpen()) {
			this.oErrorVariantPopOver.close();
		}
	};

	VariantManagement.prototype.getFocusDomRef = function() {
		return this.oVariantPopoverTrigger.getFocusDomRef();
	};

	VariantManagement.prototype.onclick = function(oEvent) {
		if (this.oVariantPopoverTrigger && !this.bPopoverOpen) {
			this.oVariantPopoverTrigger.focus();
		}
		this.handleOpenCloseVariantPopover(oEvent);
	};

	VariantManagement.prototype.onkeyup = function(oEvent) {
		if (oEvent.which === KeyCodes.F4 || oEvent.which === KeyCodes.SPACE || oEvent.altKey === true && oEvent.which === KeyCodes.ARROW_UP || oEvent.altKey === true && oEvent.which === KeyCodes.ARROW_DOWN) {
			this._oCtrlRef = this._obtainControl(oEvent);
			this._openVariantList();
		}
	};

	VariantManagement.prototype.onAfterRendering = function() {
		if (this.oVariantText) {
			this.oVariantText.$().off("mouseover").on("mouseover", function() {
				this.oVariantPopoverTrigger.addStyleClass("sapMVarMngmtTriggerBtnHover");
			}.bind(this));
			this.oVariantText.$().off("mouseout").on("mouseout", function() {
				this.oVariantPopoverTrigger.removeStyleClass("sapMVarMngmtTriggerBtnHover");
			}.bind(this));
		}
	};

	// ERROR LIST
	VariantManagement.prototype._openInErrorState = function() {
		var oVBox;

		if (!this.oErrorVariantPopOver) {
			oVBox = new VBox({
				fitContainer: true,
				alignItems: FlexAlignItems.Center,
				items: [
					new Icon({
						size: "4rem",
						color: "lightgray",
						src: "sap-icon://message-error"
					}), new Title({
						titleStyle: TitleLevel.H2,
						text: this._oRb.getText("VARIANT_MANAGEMENT_ERROR_TEXT1")
					}), new Text({
						textAlign: TextAlign.Center,
						text: this._oRb.getText("VARIANT_MANAGEMENT_ERROR_TEXT2")
					})
				]
			});

			oVBox.addStyleClass("sapMVarMngmtErrorPopover");

			this.oErrorVariantPopOver = new ResponsivePopover(this.getId() + "-errorpopover", {
				title: {
					path: "/popoverTitle",
					model: "$mVariants"
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
				parts: [{
					path: '$mVariants>/creationAllowed'
				},{
					path: '$mVariants>/modified'
				}],
				formatter: function(bCreationAllowed, bModified) {
					return bCreationAllowed && bModified;
				}
			},
			type: ButtonType.Emphasized,
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
			}),
			visible: {
				parts: [{
					path: '$mVariants>/creationAllowed'
				},{
					path: '$mVariants>/showSaveAs'
				}],
				formatter: function(bCreationAllowed, bShowSaveAs) {
					return bCreationAllowed && bShowSaveAs;
				}
			}

		});

		this.oVariantList = new SelectList(this.getId() + "-list", {
			selectedKey: {
				path: "/selectedKey",
				model: "$mVariants"
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
					this.setSelectedKey(sSelectionKey);

					this.fireSelect({
						key: sSelectionKey
					});
					this.oVariantPopOver.close();
				}
			}.bind(this)
		});
		this.oVariantList.setNoDataText(this._oRb.getText("VARIANT_MANAGEMENT_NODATA"));


		var oItemTemplate = new Item({
			key: "{$mVariants>key}",
			text: "{$mVariants>title}"
		});


		this.oVariantList.bindAggregation("items", {
			path: "/items",
			model: "$mVariants",
			template: oItemTemplate
		});

		this._oSearchField = new SearchField(this.getId() + "-search");
		this._oSearchField.attachLiveChange(function(oEvent) {
			this._triggerSearch(oEvent, this.oVariantList);
		}.bind(this));

		this.oVariantSelectionPage = new Page(this.getId() + "-selpage", {
			subHeader: new Toolbar({
				content: [
					this._oSearchField
				]
			}),
			content: [
				this.oVariantList
			],
			footer: new OverflowToolbar({
				content: [
					new ToolbarSpacer(this.getId() + "-spacer"), this.oVariantSaveBtn, this.oVariantSaveAsBtn, this.oVariantManageBtn
				]
			}),
			showNavButton: false,
			showHeader: false
		});

		this.oVariantSelectionPage.bindProperty("showFooter", {
			path: "/showFooter",
			model: "$mVariants"
		});

		this.oVariantPopOver = new ResponsivePopover(this.getId() + "-popover", {
			title: {
				path: "/popoverTitle",
				model: "$mVariants"
			},
			titleAlignment: "Auto",
			contentWidth: "400px",
			placement: PlacementType.VerticalPreferredBottom,
			content: [
				this.oVariantSelectionPage
			],
			afterOpen: function() {
				this.bPopoverOpen = true;
				this.oVariantPopoverTrigger.setPressed(true);
			}.bind(this),
			afterClose: function() {
				this.oVariantPopoverTrigger.setPressed(false);
				if (this.bPopoverOpen) {
					setTimeout(function() {
						this.bPopoverOpen = false;
					}.bind(this), 200);
				}
			}.bind(this),
			contentHeight: "300px"
		});

		this.oVariantPopOver.addStyleClass("sapMVarMngmtPopover");
		if (this.oVariantLayout.$().closest(".sapUiSizeCompact").length > 0) {
			this.oVariantPopOver.addStyleClass("sapUiSizeCompact");
		}
		this.addDependent(this.oVariantPopOver);

		// this.oVariantList.getBinding("items").filter(this._getFilters());
	};


	VariantManagement.prototype._determineEmphasizedFooterButton = function() {
		if (this.oVariantSaveBtn.getVisible()) {
			this.oVariantSaveBtn.setType(ButtonType.Emphasized);
			this.oVariantSaveAsBtn.setType(ButtonType.Default);
		} else {
			this.oVariantSaveAsBtn.setType(ButtonType.Emphasized);
		}
	};

	VariantManagement.prototype.setModified = function(bValue) {
		this.setProperty("modified", bValue);
		return this;
	};

	VariantManagement.prototype._openVariantList = function() {
		if (this.getInErrorState()) {
			this._openInErrorState();
			return;
		}

		if (this.bPopoverOpen) {
			return;
		}

		this._createVariantList();
		this._oSearchField.setValue("");

		this.oVariantList.getBinding("items").filter(this._getFilters());

		this.oVariantSelectionPage.setShowSubHeader(this.oVariantList.getItems().length > 9);

		this._determineEmphasizedFooterButton();

		var oSelectedItem = this.oVariantList.getSelectedItem();
		if (oSelectedItem) {
			this.oVariantPopOver.setInitialFocus(oSelectedItem.getId());
		}

		var oControlRef = this._oCtrlRef ? this._oCtrlRef : this.oVariantLayout;
		this._oCtrlRef = null;
		this.oVariantPopOver.openBy(oControlRef);
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
					this._checkVariantNameConstraints(this.oInputName);
				}.bind(this)
			});

			var oLabelName = new Label(this.getId() + "-namelabel", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_NAME")
			});
			oLabelName.setLabelFor(this.oInputName);
			oLabelName.addStyleClass("sapMVarMngmtSaveDialogLabel");

			this.oDefault = new CheckBox(this.getId() + "-default", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_SETASDEFAULT"),
				visible: {
					path: "/supportDefault",
					model: "$mVariants"
				},
				width: "100%"
			});

			this.oPublic = new CheckBox(this.getId() + "-public", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_SETASPUBLIC"),
				visible: {
					path: "/supportPublic",
					model: "$mVariants"
				},
				width: "100%"
			});

			this.oExecuteOnSelect = new CheckBox(this.getId() + "-execute", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_EXECUTEONSELECT"),
				visible: {
					path: "/supportApplyAutomatically",
					model: "$mVariants"
				},
				width: "100%"
			});

			this.oCreateTile = new CheckBox(this.getId() + "-tile", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_CREATETILE"),
				enabled: true,
				visible: {
					path: "/showCreateTile",
					model: VariantManagement.INNER_MODEL_NAME
				},
				width: "100%"
			});

			this.oInputManualKey = new Input(this.getId() + "-key", {
				visible: {
					path: "/showManualVariantKey",
					model: VariantManagement.INNER_MODEL_NAME
				},
				liveChange: function() {
					this._checkVariantNameConstraints(this.oInputManualKey);
				}.bind(this)
			});

			this.oLabelKey = new Label(this.getId() + "-keylabel", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_KEY"),
				required: true,
				visible: {
					path: "/showManualVariantKey",
					model: VariantManagement.INNER_MODEL_NAME
				}
			});
			this.oLabelKey.setLabelFor(this.oInputManualKey);

			this.oSaveSave = new Button(this.getId() + "-variantsave", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_SAVE"),
				type: ButtonType.Emphasized,
				press: function() {
					if (!this._bSaveOngoing) {
						this._checkVariantNameConstraints(this.oInputName);

						if (this.oInputName.getValueState() === "Error") {
							this.oInputName.focus();
							return;
						}

						this._bSaveOngoing = true;
						this._bSaveCanceled = false;
						var bReturn = this._handleVariantSaveAs(this.oInputName.getValue());
						if (!bReturn) {
							this._bSaveOngoing = false;
						}
					}
				}.bind(this),
				enabled: true
			});
			var oSaveAsDialogOptionsGrid = new Grid({
				defaultSpan: "L12 M12 S12"
			});

			oSaveAsDialogOptionsGrid.addContent(this.oDefault);
			oSaveAsDialogOptionsGrid.addContent(this.oPublic);
			oSaveAsDialogOptionsGrid.addContent(this.oExecuteOnSelect);
			oSaveAsDialogOptionsGrid.addContent(this.oCreateTile);

			this.oSaveAsDialog = new Dialog(this.getId() + "-savedialog", {
				title: this._oRb.getText("VARIANT_MANAGEMENT_SAVEDIALOG"),
				afterClose: function() {
					this._bSaveOngoing = false;

					if (this._sStyleClass) {
						this.setSupportPublic(this._bShowPublic);
						this.oSaveAsDialog.removeStyleClass(this._sStyleClass);

						if (this._oRolesComponentContainer) {
							this.oSaveAsDialog.removeContent(this._oRolesComponentContainer);
						}

						this._sStyleClass = undefined;
						this._oRolesComponentContainer = null;
					}

				}.bind(this),
				beginButton: this.oSaveSave,
				endButton: new Button(this.getId() + "-variantcancel", {
					text: this._oRb.getText("VARIANT_MANAGEMENT_CANCEL"),
					press: this._cancelPressed.bind(this)
				}),
				content: [
					oLabelName, this.oInputName, this.oLabelKey, this.oInputManualKey, oSaveAsDialogOptionsGrid
				],
				stretch: Device.system.phone
			});

			this.oSaveAsDialog.isPopupAdaptationAllowed = function() {
				return false;
			};

			this.oSaveAsDialog.addStyleClass("sapUiContentPadding");
			this.oSaveAsDialog.addStyleClass("sapMVarMngmtSaveDialog");

			if (this.oVariantLayout.$().closest(".sapUiSizeCompact").length > 0) {
				this.oSaveAsDialog.addStyleClass("sapUiSizeCompact");
			}

			this.addDependent(this.oSaveAsDialog);
		}
	};

	VariantManagement.prototype._cancelPressed = function() {
		this._bSaveCanceled = true;

		this.fireCancel();
		this.oSaveAsDialog.close();
	};


	VariantManagement.prototype._getSelectedContexts = function() {
		return this._oRolesComponentContainer.getComponentInstance().getSelectedContexts();
	};
	VariantManagement.prototype._setSelectedContexts = function(mContexts) {
		if (!mContexts || (Object.keys(mContexts).length === 0)) {
			mContexts = { role: []};
		}
		this._oRolesComponentContainer.getComponentInstance().setSelectedContexts(mContexts);
	};

	VariantManagement.prototype._isInErrorContexts = function() {
		return this._oRolesComponentContainer.getComponentInstance().hasErrorsAndShowErrorMessage();
	};

	VariantManagement.prototype._determineRolesSpecificText = function(mContexts, oTextControl) {
		if (!mContexts) {
			mContexts = { role: []};
		}
		if (mContexts && oTextControl) {
			oTextControl.setText(this._oRb.getText((mContexts.role && mContexts.role.length > 0) ? "VARIANT_MANAGEMENT_VISIBILITY_RESTRICTED" : "VARIANT_MANAGEMENT_VISIBILITY_NON_RESTRICTED"));
		}
	};

	VariantManagement.prototype._checkAndAddRolesContainerToManageDialog = function() {
		if (this._oRolesComponentContainer && this._oRolesDialog) {
			var oRolesComponentContainer = null;
			this._oRolesDialog.getContent().some(function(oContent) {
				if (oContent === this._oRolesComponentContainer) {
					oRolesComponentContainer = oContent;
					return true;
				}

				return false;
			}.bind(this));

			if (!oRolesComponentContainer) {
				this._oRolesDialog.addContent(this._oRolesComponentContainer);
			}
		}
	};

	VariantManagement.prototype._createRolesDialog = function() {
		if (!this._oRolesDialog) {
			this._oRolesDialog = new Dialog(this.getId() + "-roledialog", {
				draggable: true,
				resizable: true,
				contentWidth: "40%",
				title: this._oRb.getText("VARIANT_MANAGEMENT_SELECTROLES_DIALOG"),
				beginButton: new Button(this.getId() + "-rolesave", {
					text: this._oRb.getText("VARIANT_MANAGEMENT_SAVE"),
					type: ButtonType.Emphasized,
					press: function() {
						if (!this._checkAndCreateContextInfoChanges(this._oCurrentContextsKey, this._oTextControl)) {
							return;
						}
						this._oRolesDialog.close();
					}.bind(this)
				}),
				endButton: new Button(this.getId() + "-rolecancel", {
					text: this._oRb.getText("VARIANT_MANAGEMENT_CANCEL"),
					press: function() {
						this._oRolesDialog.close();
					}.bind(this)
				}),
				content: [this._oRolesComponentContainer],
				stretch: Device.system.phone
			});

			this._oRolesDialog.setParent(this);
			this._oRolesDialog.addStyleClass("sapUiContentPadding");
			this._oRolesDialog.addStyleClass(this._sStyleClass);

			this._oRolesDialog.isPopupAdaptationAllowed = function() {
				return false;
			};
		}

		this._checkAndAddRolesContainerToManageDialog();
	};

	VariantManagement.prototype._openRolesDialog = function(oItem, oTextControl) {
		this._createRolesDialog();

		this._oCurrentContextsKey = oItem.getKey();
		this._oTextControl = oTextControl;

		this._setSelectedContexts(oItem.getContexts());

		this._oRolesDialog.open();
	};

	VariantManagement.prototype._checkAndCreateContextInfoChanges = function(sKey, oTextControl) {
		if (sKey) {
			if (this._oRolesComponentContainer) {
				try {
					if (!this._isInErrorContexts()) {
						var mContexts = this._getSelectedContexts();

						var oItem = this._getItemByKey(sKey);
						if (oItem) {
							oItem.setContexts(mContexts);
							this._determineRolesSpecificText(mContexts, oTextControl);
						}
					} else {
						return false;
					}
				} catch (ex) {
					return false;
				}
			}
			return true;
		}
		return false;
	};

	VariantManagement.prototype._checkAndAddRolesContainerToSaveAsDialog = function() {
		if (this._oRolesComponentContainer && this.oSaveAsDialog) {
			var oRolesComponentContainer = null;
			this.oSaveAsDialog.getContent().some(function(oContent) {
				if (oContent === this._oRolesComponentContainer) {
					oRolesComponentContainer = oContent;
					return true;
				}

				return false;
			}.bind(this));

			this._setSelectedContexts({ role: []});
			if (!oRolesComponentContainer) {
				this.oSaveAsDialog.addContent(this._oRolesComponentContainer);
			}
		}
	};

	/**
	 * Opens the <i>Save As</i> dialog.
	 * @param {string} sStyleClassName - style-class to be used
	 * @param {object} oRolesComponentContainer - component for roles handling
	 */
	VariantManagement.prototype.openSaveAsDialog = function (sStyleClassName, oRolesComponentContainer) {
		this._openSaveAsDialog(true);
		this.oSaveAsDialog.addStyleClass(sStyleClassName);
		this._sStyleClass = sStyleClassName; // indicates that dialog is running in key user scenario

		this._bShowPublic = this.getSupportPublic();
		this.setSupportPublic(false);

		if (oRolesComponentContainer) {
			Promise.all([oRolesComponentContainer]).then(function(vArgs) {
				this._oRolesComponentContainer = vArgs[0];

				this.setSupportContexts(!!this._oRolesComponentContainer );

				this._checkAndAddRolesContainerToSaveAsDialog();

				this.oSaveAsDialog.open();
			}.bind(this));
		} else {
			this.oSaveAsDialog.open();
		}
	};


	VariantManagement.prototype._openSaveAsDialog = function(bDoNotOpen) {
		this._createSaveAsDialog();

		this.setSupportContexts(false);

		this.oInputName.setValue(this.getSelectedVariantText(this.getSelectedKey()));
		this.oInputName.setEnabled(true);
		this.oInputName.setValueState(ValueState.None);
		this.oInputName.setValueStateText(null);

		this.oDefault.setSelected(false);
		this.oPublic.setSelected(false);
		this.oExecuteOnSelect.setSelected(false);
		this.oCreateTile.setSelected(false);

		if (this.oVariantPopOver) {
			this.oVariantPopOver.close();
		}

//		if (this.getManualVariantKey()) {
//			this.oInputManualKey.setVisible(true);
//			this.oInputManualKey.setEnabled(true);
//			this.oInputManualKey.setValueState(ValueState.None);
//			this.oInputManualKey.setValueStateText(null);
//			this.oLabelKey.setVisible(true);
//		} else {
//			this.oInputManualKey.setVisible(false);
//			this.oLabelKey.setVisible(false);
//		}

		if (!bDoNotOpen) {
			this.oSaveAsDialog.open();
		}
	};

	VariantManagement.prototype._handleVariantSaveAs = function(sNewVariantName) {
		var sKey = null;
		var sName = sNewVariantName.trim();
		var sManualKey = this.oInputManualKey.getValue().trim();

		if (sName === "") {
			this.oInputName.setValueState(ValueState.Error);
			this.oInputName.setValueStateText(this._oRb.getText("VARIANT_MANAGEMENT_ERROR_EMPTY"));
			return false;
		}

		if (this._getShowManualVariantKey()) {
			if (sManualKey === "") {
				this.oInputManualKey.setValueState(ValueState.Error);
				this.oInputManualKey.setValueStateText(this._oRb.getText("VARIANT_MANAGEMENT_ERROR_EMPTY"));
				return false;
			}
			sKey = sManualKey;
		}

		if (this.oSaveAsDialog) {
			this.oSaveAsDialog.close();
		}

		if (this.oDefault.getSelected()) {
			this.setDefaultKey(this.oDefault.getSelected());
		}

		this.setModified(false);

		var oObj = {
				key: sKey,
				name: sName,
				overwrite: false,
				def: this.oDefault.getSelected(),
				execute: this.oExecuteOnSelect.getSelected(),
				"public": this.getSupportPublic() ? this.oPublic.getSelected() : undefined,
				contexts: this._getContextInfoChanges()
		};

		if (this._getShowCreateTile() && this.oCreateTile) {
			oObj.tile = this.oCreateTile.getSelected();
		}

		this.fireSave(oObj);

		return true;
	};

	VariantManagement.prototype._getContextInfoChanges = function() {
		if (this._oRolesComponentContainer) {
			try {
				if (!this._isInErrorContexts()) {
					return this._getSelectedContexts();
				}
			} catch (ex) {
				return undefined;
			}
		}

		return undefined;
	};

	VariantManagement.prototype._handleVariantSave = function() {
		var oItem = this._getItemByKey(this.getSelectedKey());

		var bDefault = false;
		if (this.getDefaultKey() === oItem.getKey()) {
			bDefault = true;
		}

		if (this.oVariantPopOver) {
			this.oVariantPopOver.close();
		}

		this.fireSave({
			name: oItem.getTitle(),
			overwrite: true,
			key: oItem.getKey(),
			def: bDefault
		});

		this.setModified(false);
	};

	// Manage Views dialog

	/**
	 * Opens the <i>Manage Views</i> dialog.
	 * @param {boolean} bCreateAlways - Indicates that if this is set to <code>true</code>, the former dialog will be destroyed before a new one is created
	 * @param {string} sStyleClass - style-class to be used
	 * @param {object} oRolesComponentContainer - component for roles handling
	 */
	VariantManagement.prototype.openManagementDialog = function(bCreateAlways, sStyleClass, oRolesComponentContainer) {
		if (bCreateAlways && this.oManagementDialog) {
			this.oManagementDialog.destroy();
			this.oManagementDialog = undefined;
		}

		if (sStyleClass) {
			this._sStyleClass = sStyleClass;
			this._bShowPublic = this.getSupportPublic();
			this.setSupportPublic(false);

			this.setSupportContexts(false);
		}

		if (oRolesComponentContainer) {
			Promise.all([oRolesComponentContainer]).then(function(vArgs) {
				this._oRolesComponentContainer = vArgs[0];

				this.setSupportContexts(!!this._oRolesComponentContainer);
				this._openManagementDialog();

				if (this._sStyleClass) {
					this.oManagementDialog.addStyleClass(this._sStyleClass);
				}
			}.bind(this));
		} else {
			this._openManagementDialog();

			if (this._sStyleClass) {
				this.oManagementDialog.addStyleClass(this._sStyleClass);
			}
		}
	};

	VariantManagement.prototype._triggerSearchInManageDialog = function(oEvent, oManagementTable) {
		if (!oEvent) {
			return;
		}

		var parameters = oEvent.getParameters();
		if (!parameters) {
			return;
		}

		var sValue;
		if (parameters.query) {
			sValue = parameters.query;
		} else {
			sValue = parameters.newValue ? parameters.newValue : "";
		}

		this._triggerSearchInManageDialogByValue(sValue, oManagementTable);
	};

	VariantManagement.prototype._triggerSearchInManageDialogByValue = function(sValue, oManagementTable) {

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
				contextualWidth: "Auto",
				fixedLayout: false,
				growing: true,
				columns: [
					new Column({
						width: "3rem",
						visible: {
							path: "/supportFavorites",
							model: "$mVariants"
						}
					}), new Column({
						header: new Text({
							text: this._oRb.getText("VARIANT_MANAGEMENT_NAME")
						}),
						width: "16rem"
					}), new Column({
						header: new Text({
							text: this._oRb.getText("VARIANT_MANAGEMENT_VARIANTTYPE"),
							wrappingType: "Hyphenated"
						}),
						visible: {
							path: "/supportPublic",
							model: "$mVariants"
						},
						demandPopin: true,
						popinDisplay: PopinDisplay.Inline,
						minScreenWidth: ScreenSize.Tablet
					}), new Column({
						header: new Text({
							text: this._oRb.getText("VARIANT_MANAGEMENT_DEFAULT"),
							wrappingType: "Hyphenated"
						}),
						hAlign: TextAlign.Center,
						demandPopin: true,
						popinDisplay: PopinDisplay.Block,
						minScreenWidth: ScreenSize.Tablet,
						visible: {
							path: "/supportDefault",
							model: "$mVariants"
						}
					}), new Column({
						header: new Text({
							text: this._oRb.getText("VARIANT_MANAGEMENT_EXECUTEONSELECT"),
							wrappingType: "Hyphenated"
						}),
						hAlign: this.getDisplayTextForExecuteOnSelectionForStandardVariant() ? TextAlign.Begin : TextAlign.Center,
						demandPopin: true,
						popinDisplay: PopinDisplay.Block,
						minScreenWidth: ScreenSize.Tablet,
						visible: {
							path: "/supportApplyAutomatically",
							model: "$mVariants"
						}
					}), new Column({
						header: new Text({
							text: this._oRb.getText("VARIANT_MANAGEMENT_VISIBILITY"),
							wrappingType: "Hyphenated"
						}),
						width: "8rem",
						demandPopin: true,
						popinDisplay: PopinDisplay.Inline,
						minScreenWidth: ScreenSize.Tablet,
						visible: {
							path: "/supportContexts",
							model: "$mVariants"
						}
					}), new Column({
						header: new Text({
							text: this._oRb.getText("VARIANT_MANAGEMENT_AUTHOR")
						}),
						demandPopin: true,
						popinDisplay: PopinDisplay.Block,
						minScreenWidth: ScreenSize.Tablet
					}), new Column({
						hAlign: TextAlign.Center
					}), new Column({
						visible: false
					})
				]
			});

			this.oManagementSave = new Button(this.getId() + "-managementsave", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_SAVE"),
				enabled: true,
				type: ButtonType.Emphasized,
				press: function() {
					this._handleManageSavePressed();
					//this.oManagementDialog.close();
				}.bind(this)
			});

			this.oManagementCancel = new Button(this.getId() + "-managementcancel", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_CANCEL"),
				press: function() {
					this._resumeManagementTableBinding();
					this._handleManageCancelPressed();
					this.oManagementDialog.close();
				}.bind(this)
			});

			this.oManagementDialog = new Dialog(this.getId() + "-managementdialog", {
				contentWidth: "64%",
				resizable: true,
				draggable: true,
				title: this._oRb.getText("VARIANT_MANAGEMENT_MANAGEDIALOG"),
				beginButton: this.oManagementSave,
				endButton: this.oManagementCancel,
				afterClose: function() {
					if (this._sStyleClass) {
						this.setSupportPublic(this._bShowPublic, true);
						this.oManagementDialog.removeStyleClass(this._sStyleClass);
						this._sStyleClass = undefined;
						this._oRolesComponentContainer = null;
					}
				}.bind(this),
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

			this._oSearchFieldOnMgmtDialog.attachSearch(function(oEvent) {
				this._triggerSearchInManageDialog(oEvent, this.oManagementTable);
			}.bind(this));

			var oSubHeader = new Bar(this.getId() + "-mgmHeaderSearch", {
				contentMiddle: [
					this._oSearchFieldOnMgmtDialog
				]
			});
			this.oManagementDialog.setSubHeader(oSubHeader);

			this.oManagementDialog.setInitialFocus(this._oSearchFieldOnMgmtDialog);

			if (this.oVariantLayout.$().closest(".sapUiSizeCompact").length > 0) {
				this.oManagementDialog.addStyleClass("sapUiSizeCompact");
			}
			this.addDependent(this.oManagementDialog);

			this.oManagementTable.bindAggregation("items", {
				path: "/items",
				model: "$mVariants",
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
			oIcon.setAlt(this._oRb.getText(bFlagged ? "VARIANT_MANAGEMENT_FAV_DEL_ACC" : "VARIANT_MANAGEMENT_FAV_ADD_ACC"));
		}
	};

	VariantManagement.prototype._templateFactoryManagementDialog = function(sId, oContext) {
		var sTooltip = null;
		var oDeleteButton;
		var oNameControl;
		var oExecuteOnSelectCtrl;
		var oRolesCell;
		var oItem = oContext.getObject();
		if (!oItem) {
			return undefined;
		}

		var sModelName = "$mVariants";

		var fLiveChange = function(oEvent) {
			var oItem = oEvent.oSource.getBindingContext(sModelName).getObject();
			this._handleManageTitleChange(oEvent.oSource, oItem);
		}.bind(this);

		var fChange = function(oEvent) {
			var oItem = oEvent.oSource.getBindingContext(sModelName).getObject();
			this._handleManageTitleChange(oEvent.oSource, oItem);
		}.bind(this);

		var fSelectRB = function(oEvent) {
			this._handleManageDefaultVariantChange(oEvent.oSource, oEvent.oSource.getBindingContext(sModelName).getObject(), oEvent.getParameters().selected);
		}.bind(this);

		var fPress = function(oEvent) {
			this._handleManageDeletePressed(oEvent.oSource.getBindingContext(sModelName).getObject());
			var oListItem = oEvent.oSource.getParent();
			if (oListItem) {
				oListItem.setVisible(false);
			}

			this._reCheckVariantNameConstraints();
		}.bind(this);

		var fSelectFav = function(oEvent) {
			this._handleManageFavoriteChanged(oEvent.oSource, oEvent.oSource.getBindingContext(sModelName).getObject());
		}.bind(this);

		var fRolesPressed = function(oEvent) {
			var oItem = oEvent.oSource.getBindingContext(sModelName).getObject();
			this._openRolesDialog(oItem, oEvent.oSource.getParent().getItems()[0]);
		}.bind(this);

		if (oItem.getRename()) {
			oNameControl = new Input({
				liveChange: fLiveChange,
				change: fChange,
				value: '{' + sModelName + ">title}"
			});

			if (oItem.getTitle() !== oItem.getOriginalTitle()) {
				this._verifyVariantNameConstraints(oNameControl, oItem.getKey(), oItem.getTitle());
			}


		} else {
			oNameControl = new ObjectIdentifier({
				title: '{' + sModelName + ">title}"
			});
			if (sTooltip) {
				oNameControl.setTooltip(sTooltip);
			}
		}

		oDeleteButton = new Button({
			icon: "sap-icon://decline",
			enabled: true,
			type: ButtonType.Transparent,
			press: fPress,
			tooltip: this._oRb.getText("VARIANT_MANAGEMENT_DELETE"),
			visible: oItem.getRemove()
		});


		this._assignColumnInfoForDeleteButton(oDeleteButton);

		var oFavoriteIcon = new Icon({
			src: {
				path: "favorite",
				model: sModelName,
				formatter: function(bFlagged) {
					return bFlagged ? "sap-icon://favorite" : "sap-icon://unfavorite";
				}
			},
			tooltip: {
				path: 'favorite',
				model: sModelName,
				formatter: function(bFlagged) {
					return this._oRb.getText(bFlagged ? "VARIANT_MANAGEMENT_FAV_DEL_TOOLTIP" : "VARIANT_MANAGEMENT_FAV_ADD_TOOLTIP");
				}.bind(this)
			},
			press: fSelectFav
		});

		if ((this.getStandardVariantKey() === oItem.getKey()) || (this.getDefaultKey() === oItem.getKey())) {
			oFavoriteIcon.addStyleClass("sapMVarMngmtFavNonInteractiveColor");
		} else {
			oFavoriteIcon.addStyleClass("sapMVarMngmtFavColor");
		}

		if (this.getDisplayTextForExecuteOnSelectionForStandardVariant() && (this.getStandardVariantKey() === oItem.getKey())) {
			oExecuteOnSelectCtrl = new CheckBox(this.getId() + "-manage-exe-0",{
				wrapping: true,
				//text: this.getDisplayTextForExecuteOnSelectionForStandardVariant(),
				text: '{' + sModelName + ">/displayTextForExecuteOnSelectionForStandardVariant}",
				selected: '{' + sModelName + ">executeOnSelect}"
			});
		} else if (this.getStandardVariantKey() === oItem.getKey()) {
			oExecuteOnSelectCtrl = new CheckBox(this.getId() + "-manage-exe-0",{
				text: "",
				selected: '{' + sModelName + ">executeOnSelect}"
			});
		} else {
			oExecuteOnSelectCtrl = new CheckBox({
				text: "",
				selected: '{' + sModelName + ">executeOnSelect}"
			});
		}

		// roles
		if (this._sStyleClass && (oItem.getKey() !== this.getStandardVariantKey())) {
			var oText = new Text({ wrapping: false });
			this._determineRolesSpecificText(oItem.getContexts(), oText);
			var oIcon = new Icon({
				src: "sap-icon://edit",
				press: fRolesPressed
			});
			oIcon.addStyleClass("sapMVarMngmtRolesEdit");
			oIcon.setTooltip(this._oRb.getText("VARIANT_MANAGEMENT_VISIBILITY_ICON_TT"));
			oRolesCell = new HBox({
				items: [oText, oIcon]
			});
		} else {
			oRolesCell = new Text();
		}

		return new ColumnListItem({
			cells: [
				oFavoriteIcon, oNameControl, new Text({
					text: {
						path: "sharing",
						model: sModelName,
						formatter: function(sValue) {
							return this._oRb.getText(sValue === "private" ? "VARIANT_MANAGEMENT_PRIVATE" : "VARIANT_MANAGEMENT_PUBLIC");
						}.bind(this)
					},
					textAlign: "Center"
				}), new RadioButton({
					groupName: this.getId(),
					select: fSelectRB,
					selected: {
						path: "/defaultKey",
						model: sModelName,
						formatter: function(sKey) {
							return oItem.getKey() === sKey;
						}
					}
				}), oExecuteOnSelectCtrl, oRolesCell, new Text({
					text: '{' + sModelName + ">author}",
					textAlign: "Begin"
				}), oDeleteButton, new Text({
					text: '{' + sModelName + ">key}"
				})
			]
		});
	};

	VariantManagement.prototype._openManagementDialog = function() {
		this._createManagementDialog();

		if (this.oVariantPopOver) {
			this.oVariantPopOver.close();
		}

		this._suspendManagementTableBinding();

		this._clearDeletedItems();
		this._clearRenamedItems();
		this._sDefaultKey = this.getDefaultKey();
		this._sOriginalDefaultKey = this._sDefaultKey;


		//this.oManagementSave.setEnabled(false);
		this._oSearchFieldOnMgmtDialog.setValue("");

		// Ideally, this should be done only once in <code>_createManagementDialog</code>. However, the binding does not recognize a change if filtering is involved.
		// After a deletion on the UI, the item is filtered out <code>.visible=false</code>. The real deletion will occur only when <i>OK</i> is pressed.
		// Since the filtered items and the result after the real deletion are identical, no change is detected. Based on this, the context on the table is
		// not invalidated....
		// WA: Always do the binding while opening the dialog.
		if (this._bDeleteOccured) {
			this._bDeleteOccured = false;

			this.oManagementTable.bindAggregation("items", {
				path: "/items",
				model: "$mVariants",
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

	VariantManagement.prototype._toggleIconActivityState = function(oIcon, oItem, bToInActive) {
		if (!oIcon) {
			return;
		}

		if (oItem.getKey() === this.getStandardVariantKey()) {
			return;
		}

		if (bToInActive && oIcon.hasStyleClass("sapMVarMngmtFavColor")) {
			oIcon.removeStyleClass("sapMVarMngmtFavColor");
			oIcon.addStyleClass("sapMVarMngmtFavNonInteractiveColor");
		} else if (oIcon.hasStyleClass("sapMVarMngmtFavNonInteractiveColor")) {
			oIcon.removeStyleClass("sapMVarMngmtFavNonInteractiveColor");
			oIcon.addStyleClass("sapMVarMngmtFavColor");
		}
	};


	VariantManagement.prototype._handleManageTitleChange = function(oInput, oItem) {
		this._checkVariantNameConstraints(oInput, oItem.getKey());

		this._addRenamedItem(oItem);
	};

	VariantManagement.prototype._handleManageDefaultVariantChange = function(oRadioButton, oItem, bSelected) {
		var sKey = oItem.getKey();

		if (oRadioButton) {
			var oIcon = oRadioButton.getParent().getCells()[VariantManagement.COLUMN_FAV_IDX];

			if (bSelected) {
				if (this.getSupportFavorites() && !oItem.getFavorite()) {
					oItem.setFavorite(true);
					this._setFavoriteIcon(oIcon, true);
				}

				this.setDefaultKey(sKey);
			}

			this._toggleIconActivityState(oIcon, oItem, bSelected);
		}
	};

	VariantManagement.prototype._handleManageCancelPressed = function() {
		var sDefaultKey = this._sDefaultKey;
//		this._getDeletedItems().forEach(function(sKey) {
//			var oItem = this._getItemByKey(sKey);
//			if (oItem) {
//				oItem.setVisible(true);
//			}
//		});

		this.getItems().forEach(function(oItem) {
			if (oItem.getVisible()) {
				oItem.setTitle(oItem.getOriginalTitle());
				oItem.setFavorite(oItem.getOriginalFavorite());
				oItem.setExecuteOnSelect(oItem.getOriginalExecuteOnSelect());
				oItem.setContexts(oItem.getOriginalContexts());
			} else {
				oItem.setVisible(true);
			}
		});

		sDefaultKey = this._sOriginalDefaultKey;
		if (sDefaultKey !== this.getDefaultKey()) {
			this.setDefaultKey(sDefaultKey);
		}

		this._clearRenamedItems();
		this._clearDeletedItems();

//		if (this._oManagedObjectModel) {
//			this._oManagedObjectModel.checkUpdate();
//		}

		this.fireManageCancel();

		//fireCancel may have deleted the ManageViews dialog
//		if (this.oManagementDialog) {
//			this.oManagementTable.getBinding("items").filter(this._getVisibleFilter());
//		}
	};

	VariantManagement.prototype._handleManageFavoriteChanged = function(oIcon, oItem) {
		//		if (!this._anyInErrorState(this.oManagementTable)) {
		//			this.oManagementSave.setEnabled(true);
		//		}
		if (this.getStandardVariantKey() === oItem.getKey()) {
			return;
		}

		if ((this.getDefaultKey() === oItem.getKey()) && oItem.getFavorite()) {
			return;
		}

		oItem.setFavorite(!oItem.getFavorite());
		this._setFavoriteIcon(oIcon, oItem.getFavorite);
	};

	VariantManagement.prototype._getRowForKey = function(sKey) {
		var oRowForKey = null;
		if (this.oManagementTable) {
			this.oManagementTable.getItems().some(function(oRow) {
				var oColumnItem = oRow.getCells()[0].getParent();
				var oItem = this.getModel("$mVariants").getObject(oColumnItem.getBindingContextPath());
				//if (sKey === oRow.getCells()[0].getBindingContext().getObject().key) {
				if (sKey === oItem.getKey()) {
					oRowForKey = oRow;
				}

				return oRowForKey !== null;
			}.bind(this));
		}

		return oRowForKey;
	};

	VariantManagement.prototype._handleManageDeletePressed = function(oItem) {
		var sKey = oItem.getKey();

		// do not allow the deletion of the standard
		if (this.getStandardVariantKey() === sKey) {
			return;
		}

		oItem.setVisible(false);
		this._addDeletedItem(oItem);

		if (sKey === this.getDefaultKey()) {
			this.setDefaultKey(this.getStandardVariantKey());
			if (this.getSupportFavorites()) {
				var oNewDefaultItem = this._getItemByKey(this.getStandardVariantKey());
				if (oNewDefaultItem && !oNewDefaultItem.getFavorite()) {
					var oRow = this._getRowForKey(this.getStandardVariantKey());
					if (oRow) {
						oNewDefaultItem.setFavorite(true);
						this._setFavoriteIcon(oRow.getCells()[VariantManagement.COLUMN_FAV_IDX], true);
					}
				}
			}
		}

//		var oModel = this.oManagementTable.getModel("$mVariants");
//		if (oModel) {
//			oModel.checkUpdate();
//		}

		this.oManagementTable.getBinding("items").filter(this._getVisibleFilter());

		this.oManagementCancel.focus();
	};

	VariantManagement.prototype._collectManageData = function() {

		var oVariantInfo = {};

		var sDefault = this.getDefaultKey();
		if (sDefault !== this._sOriginalDefaultKey){
			oVariantInfo.def = sDefault;
		}

		this.getItems().forEach(function(oItem) {

			if (!oItem.getVisible()) {
				if (!oVariantInfo.deleted) {
					oVariantInfo.deleted = [];
				}
				oVariantInfo.deleted.push(oItem.getKey());
			}

			if (oItem.getVisible() && (oItem.getFavorite() !== oItem.getOriginalFavorite())) {
				if (!oVariantInfo.fav) {
					oVariantInfo.fav = [];
				}
				oVariantInfo.fav.push({ key: oItem.getKey(), visible: oItem.getFavorite()});
			}

			if (oItem.getVisible() && (oItem.getTitle() !== oItem.getOriginalTitle())) {
				if (!oVariantInfo.renamed) {
					oVariantInfo.renamed = [];
				}
				oVariantInfo.renamed.push({ key: oItem.getKey(), name: oItem.getTitle()});
			}

			if (oItem.getVisible()  && (oItem.getExecuteOnSelect() !== oItem.getOriginalExecuteOnSelect())) {
				if (!oVariantInfo.exe) {
					oVariantInfo.exe = [];
				}
				oVariantInfo.exe.push({ key: oItem.getKey(), exe: oItem.getExecuteOnSelect()});
			}

			if (oItem.getVisible() && this._hasContextsChanged(oItem)) {
				if (!oVariantInfo.contexts) {
					oVariantInfo.contexts = [];
				}
				oVariantInfo.contexts.push({ key: oItem.getKey(), contexts: oItem.getContexts()});
			}

		}.bind(this));

		return oVariantInfo;
	};

	VariantManagement.prototype._hasContextsChanged = function(oItem) {
		return (JSON.stringify(oItem.getContexts()) !== JSON.stringify(oItem.getOriginalContexts()));
	};

	VariantManagement.prototype._handleManageSavePressed = function() {
		if (this._anyInErrorState(this.oManagementTable)) {
			return;
		}

		this.oManagementDialog.close();

		this._getDeletedItems().some(function(sItemKey) {
			if (sItemKey === this.getSelectedKey()) {
				var sKey = this.getStandardVariantKey();

				this.setModified(false);
				this.setSelectedKey(sKey);

				this.fireSelect({
					key: sKey
				});
				return true;
			}

			return false;
		}.bind(this));

		if (this._getRenamedItems().indexOf(this.getSelectedKey()) >= 0) {
			var oBinding = this.oVariantText.getBinding("text");
			if (oBinding) {
				oBinding.checkUpdate(true);
			}
		}

		this.fireManage(this._collectManageData());

		// the manage views dialog may be deleted.
		if (this.oManagementDialog) {
			this._resumeManagementTableBinding();
		}
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

	VariantManagement.prototype._focusOnFirstInputInErrorState = function(oManagementTable) {
		if (oManagementTable) {
			oManagementTable.getItems().some(function(oItem) {
				var oInput = oItem.getCells()[VariantManagement.COLUMN_NAME_IDX];
				if (oInput && oInput.getValueState && (oInput.getValueState() === ValueState.Error)) {
					oInput.getDomRef().scrollIntoView();
					oInput.focus();
					return true;
				}

				return false;
			});
		}
	};


	VariantManagement.prototype._anyInErrorStateManageTable = function(oManagementTable) {
		var oInput;
		var bInError = false;

		if (oManagementTable) {
			oManagementTable.getItems().some(function(oItem) {
				oInput = oItem.getCells()[VariantManagement.COLUMN_NAME_IDX];
				if (oInput && oInput.getValueState && (oInput.getValueState() === ValueState.Error)) {
					bInError = true;
				}
				return bInError;
			});
		}

		return bInError;
	};

	VariantManagement.prototype._anyInErrorState = function(oManagementTable) {
		if (this._anyInErrorStateManageTable(oManagementTable)) {
			return true;
		}

		var aRenamedKeys = this._getRenamedItems();

		for (var i = aRenamedKeys.length - 1; i >= 0; i--) {
			var oItem = this._getItemByKey(aRenamedKeys[i]);
			if (oItem) {
				if (oItem.getTitle() === oItem.getOriginalTitle()) {
					this._removeRenamedItem(oItem);
				}
			}
		}

		var bError = false;
		this._getRenamedItems().some(function(sKey, nIdx) {
			var oItem = this._getItemByKey(sKey);
			if (oItem) {
				bError = this._checkIsDuplicateInModel(oItem.getTitle(), sKey);
			}
			return bError;

		}.bind(this));

		if (bError) {
			this._oSearchFieldOnMgmtDialog.setValue("");
			this._triggerSearchInManageDialogByValue("", oManagementTable);

			this._focusOnFirstInputInErrorState(oManagementTable);
		}

		return bError;
	};

	// UTILS

	VariantManagement.prototype._getFilters = function(oFilter) {
		var aFilters = [];

		if (oFilter) {
			aFilters.push(oFilter);
		}

		aFilters.push(this._getVisibleFilter());

		if (this.getSupportFavorites()) {
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


	VariantManagement.prototype._verifyVariantNameConstraints = function(oInputField, sKey, sTitle) {
		if (!oInputField) {
			return;
		}

		var sValue = sTitle || oInputField.getValue();
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

			if (this._oSearchFieldOnMgmtDialog && this._oSearchFieldOnMgmtDialog.getValue()) {
				oInputField.setValueStateText(this._oRb.getText("VARIANT_MANAGEMENT_ERROR_DUPLICATE_SAVE"));
			} else {
				oInputField.setValueStateText(this._oRb.getText("VARIANT_MANAGEMENT_ERROR_DUPLICATE"));
			}

		}
	};

	VariantManagement.prototype._checkVariantNameConstraints = function(oInputField, sKey) {
		this._verifyVariantNameConstraints(oInputField, sKey);

		if (this.oManagementDialog && this.oManagementDialog.isOpen()) {
			this._reCheckVariantNameConstraints();
		}
	};

	VariantManagement.prototype._reCheckVariantNameConstraints = function() {
		var aItems;
		var bInError = false;

		if (this.oManagementTable) {
			aItems = this.oManagementTable.getItems();
			aItems.some(function(oItem) {
				var oObject = oItem.getBindingContext("$mVariants").getObject();
				if (oObject && oObject.getVisible()) {
					var oInput = oItem.getCells()[VariantManagement.COLUMN_NAME_IDX];
					if (oInput && oInput.getValueState && (oInput.getValueState() === ValueState.Error)) {
						this._verifyVariantNameConstraints(oInput, oObject.getKey());
						if (oInput.getValueState() === ValueState.Error) {
							bInError = true;
						}
					}
				}

				return bInError;
			}.bind(this));
		}

		return bInError;
	};

	VariantManagement.prototype._checkIsDuplicate = function(sValue, sKey) {
		if (this.oManagementDialog && this.oManagementDialog.isOpen()) {
			var bResult = this._checkIsDuplicateInManageTable(sValue, sKey);
			if (this._oSearchFieldOnMgmtDialog.getValue() && bResult) {
				return bResult;
			}
		}

		return this._checkIsDuplicateInModel(sValue, sKey);
	};

	VariantManagement.prototype._checkIsDuplicateInModel = function(sValue, sKey) {
		var bDublicate = false;
		var aItems = this._getItems();
		var sLowerCaseValue = sValue.toLowerCase();
		aItems.some(function(oItem) {
			if (oItem.getTitle().toLowerCase() === sLowerCaseValue) {
				if (sKey && (sKey === oItem.getKey())) {
					return false;
				}
				bDublicate = true;
			}

			return bDublicate;
		});

		return bDublicate;
	};

	VariantManagement.prototype._checkIsDuplicateInManageTable = function(sValue, sKey) {
		var aItems;
		var bInError = false;
		var sLowerCaseValue = sValue.toLowerCase();

		if (this.oManagementTable) {
			aItems = this.oManagementTable.getItems();
			aItems.some(function(oItem) {
				var sTitleLowerCase;
				var oObject = oItem.getBindingContext("$mVariants").getObject();
				if (oObject && oObject.getVisible()) {
					var oInput = oItem.getCells()[VariantManagement.COLUMN_NAME_IDX];

					if (oInput && (oObject.getKey() !== sKey)) {
						if (oInput.isA("sap.m.Input")) {
							sTitleLowerCase = oInput.getValue().toLowerCase();
						} else {
							sTitleLowerCase = oInput.getTitle().toLowerCase();
						}
						if (sTitleLowerCase === sLowerCaseValue) {
							bInError = true;
						}
					}
				}
				return bInError;
			});
		}

		return bInError;
	};

	// exit destroy all controls created in init
	VariantManagement.prototype.exit = function() {
		var oModel;

		Control.prototype.exit.apply(this, arguments);
		this._clearDeletedItems();
		this._clearRenamedItems();

		if (this.oVariantInvisibleText && !this.oVariantInvisibleText._bIsBeingDestroyed) {
			this.oVariantInvisibleText.destroy(true);
			this.oVariantInvisibleText = undefined;
		}

		if (this.oDefault && !this.oDefault._bIsBeingDestroyed) {
			this.oDefault.destroy();
		}
		this.oDefault = undefined;

		if (this.oPublic && !this.oPublic._bIsBeingDestroyed) {
			this.oPublic.destroy();
		}
		this.oPublic = undefined;

		if (this.oExecuteOnSelect && !this.oExecuteOnSelect._bIsBeingDestroyed) {
			this.oExecuteOnSelect.destroy();
		}
		this.oExecuteOnSelect = undefined;

		if (this.oCreateTile && !this.oCreateTile._bIsBeingDestroyed) {
			this.oCreateTile.destroy();
		}
		this.oCreateTile = undefined;
		this._oRb = undefined;

		this.oVariantList = undefined;
		this.oVariantSelectionPage = undefined;
		this.oVariantLayout = undefined;
		this.oVariantText = undefined;
		this.oVariantModifiedText = undefined;
		this.oVariantPopoverTrigger = undefined;
		this._oSearchField = undefined;
		this._oSearchFieldOnMgmtDialog = undefined;
		this._sDefaultKey = undefined;

		oModel = this.getModel(VariantManagement.INNER_MODEL_NAME);
		if (oModel) {
			oModel.destroy();
		}
		if (this._oManagedObjectModel) {
			this._oManagedObjectModel.destroy();
			this._oManagedObjectModel = undefined;
		}

		this._oRolesComponentContainer = null;


		if (this._oRolesDialog && !this._oRolesDialog._bIsBeingDestroyed) {
			this._oRolesDialog.destroy();
			this._oRolesDialog = null;
		}
	};

	return VariantManagement;
});