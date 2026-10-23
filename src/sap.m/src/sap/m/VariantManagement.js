/*!
 * ${copyright}
 */

// Provides control sap.m.VariantManagement.
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/core/ShortcutHintsMixin",
	"sap/ui/dom/containsOrEquals",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/base/ManagedObjectModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/BindingMode",
	"sap/ui/base/ManagedObjectObserver",
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
	"sap/m/HBox",
	"sap/m/IllustratedMessage",
	"sap/ui/events/KeyCodes",
	"sap/base/Log",
	"sap/ui/core/library",
	"sap/base/util/merge",
	"sap/m/library"
], function(
	Element,
	Library,
	ShortcutHintsMixin,
	containsOrEquals,
	JSONModel,
	ManagedObjectModel,
	Filter,
	FilterOperator,
	BindingMode,
	ManagedObjectObserver,
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
	IllustratedMessage,
	KeyCodes,
	Log,
	coreLibrary,
	merge,
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

	// shortcut for sap.m.ListKeyboardMode
	var ListKeyboardMode = mobileLibrary.ListKeyboardMode;

	// shortcut for sap.m.Sticky
	var Sticky = mobileLibrary.Sticky;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	// shortcut for sap.m.IllustratedMessageSize
	const IllustratedMessageSize = mobileLibrary.IllustratedMessageSize;

	/**
	 * Constructor for a new <code>VariantManagement</code>.
	 * @param {string} [sId] - ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] - Initial settings for the new control
	 * @class Can be used to manage variants. You can use this control to create and maintain personalization changes.
	 * The persistency and retrieval of such changes has to be handled by the hosting application.<br>
	 * <b>Note:</b>
	 * On the user interface, variants are generally referred to as "views".
	 * @extends sap.ui.core.Control
	 * @constructor
	 * @public
	 * @since 1.103
	 * @alias sap.m.VariantManagement
	 */
	var VariantManagement = Control.extend("sap.m.VariantManagement", /** @lends sap.m.VariantManagement.prototype */ {
		metadata: {
			interfaces: [
				"sap.ui.core.IShrinkable",
				"sap.m.IOverflowToolbarContent",
				"sap.m.IToolbarInteractiveControl"
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
				 *  Indicates that contexts functionality is supported.<br>
				 * <b>Note:</b> This property is used internally by the SAPUI5 flexibility layer.
				 * @restricted sap.ui.fl, sap.ui.comp
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
				 * Controls the visibility of the Save As button.
				 */
				showSaveAs: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * If set to <code>false</code>, neither the Save As nor the Save button in the My Views dialog is visible.
				 */
				creationAllowed: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Indicates if the buttons and the complete footer in the My Views dialog are visible.
				 */
				showFooter: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Indicates if the current variant is modified.
				 */
				modified: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * The title in the My Views popover.
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
				 * Semantic level of the header.
                 * For more information, see {@link sap.m.Title#setLevel}.
				 */
				level: {
					type: "sap.ui.core.TitleLevel",
                    group: "Appearance",
                    defaultValue: TitleLevel.Auto
				},

				/**
				 * Defines the style of the title.
				 * For more information, see {@link sap.m.Title#setTitleStyle}.
				 *
				 * @since 1.109
				 */
				titleStyle: {
					type: "sap.ui.core.TitleLevel",
					group: "Appearance",
					defaultValue: TitleLevel.Auto
				},

				/**
				 * Sets the maximum width of the control.
				 *
				 * @since 1.109
				 */
				maxWidth: {
					type: "sap.ui.core.CSSSize",
					group: "Dimension",
					defaultValue: "100%"
				},

				/**
				 * Defines the Apply Automatically text for the standard variant in the Manage Views dialog if the application controls this behavior.
				 */
				_displayTextForExecuteOnSelectionForStandardVariant: {
					type: "string",
					group: "Misc",
					defaultValue: "",
					visibility: "hidden"
				},

				/**
				 * Renders the name of the variant as a text.
				 * The name of the variant is usually rendered as {@link sap.m.Title}
				 * but there are use cases - related to accessibility requirements - where the
				 * rendering should be done using {@link sap.m.Text} instead.<br>
				 * <b>Note:</b>
				 * If the name of the variant is rendered as <code>sap.m.Text</code>, all the <code>sap.m.Title</code>
				 * specific information like <code>level</code> and <code>titleStyle</code> is ignored.
				 *
				 * @since 1.118
				 */
				_showAsText: {
					type: "boolean",
					group: "Misc",
					defaultValue: false,
					visibility: "hidden"
				},

				/**
				 * Defines the behavior, when the same list item is selected
                 * If set to <code>false</code> the <code>select</code> event will be omitted.
				 */
				_selectStategyForSameItem: {
					type: "boolean",
					group: "Misc",
					defaultValue: true,
					visibility: "hidden"
				},

				/**
				 * Defines the standard variant key.
				 */
				_standardKey: {
					type: "string",
					group: "Misc",
					defaultValue: "",
					visibility: "hidden"
				},
				/**
				 * Callback function that can be used to dynamically load variants when the <i>Manage Views</i> dialog is opened.
				 * The provided function must return a <code>Promise</code>. The management table will be set to busy
				 * until the returned <code>Promise</code> is resolved.
				 * If no callback is provided, the management table's busy state will not be affected.
				 *
				 * @since 1.147
				 *
				 * @private
	 			 * @ui5-restricted sap.ui.fl, sap.m
				 */
				dynamicVariantsLoadedCallback: {
					type: "function",
					bindable: false
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
				 * This event is fired when the Save View dialog or the Save As dialog is closed with the Save button.
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
						 * Indicates if an existing variant is updated or if a new variant is created.
						 */
						overwrite: {
							type: "boolean"
						},

						/**
						 * Variant key. This property is only set, when <code>overwrite</code> is set to <code>true</code>.
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
						 * Array describing the contexts.<br>
						 * <b>Note:</b> This property is used internally by the SAPUI5 flexibility layer.
						 * @restricted sap.ui.fl, sap.ui.comp
						 */
						contexts: {
							type: "object[]"
						},

						/**
						 * Indicates the check box state for 'Create Tile'.<br>
						 * <b>Note:</b>
						 * This event parameter is used only internally.
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
				 * This event is fired when users apply changes variant information in the <i>Manage Views</i> dialog.
				 * Some of the parameters may be ommitted, depending on user selection.
				 */
				manage: {
					parameters: {
						/**
						 * List of changed variants.
						 */
						renamed: {
							type: "sap.m.VariantManagementRename[]"
						},

						/**
						 * List of deleted variant keys
						 */
						deleted: {
							type: "string[]"
						},

						/**
						 * List of variant keys and the associated Execute on Selection indicator.
						 */
						exe: {
							type: "sap.m.VariantManagementExe[]"
						},

						/**
						 * List of variant keys and the associated favorite indicator.
						 */
						fav: {
							type: "sap.m.VariantManagementFav[]"
						},

						/**
						 * The default variant key
						 */
						def: {
							type: "string"
						},

						/**
						 * List of variant keys and the associated contexts array.
						 * Each entry contains a <code>key</code> (the variant key) and a <code>contexts</code> array describing the contexts.<br>
						 * <b>Note:</b> This property is used internally by the SAPUI5 flexibility layer.
						 * @restricted sap.ui.fl, sap.ui.comp
						 */
						contexts: {
							type: "object[]"
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
					.style("max-width", oControl.getMaxWidth())
					.class("sapMVarMngmt")
					.openEnd();

				oRm.renderControl(oControl.oVariantLayout);
				oRm.close("div");
			}
		}
	});

	const AriaHasPopup = coreLibrary.aria.HasPopup;

	VariantManagement.INNER_MODEL_NAME = "$sapMInnerVariants";
	VariantManagement.MAX_NAME_LEN = 100;
	VariantManagement.COLUMN_FAV_IDX = 0;
	VariantManagement.COLUMN_NAME_IDX = 1;
	VariantManagement.COLUMN_DEFAULT_IDX = 3;
	VariantManagement.COLUMN_ROLES_IDX = 5;

	/*
	 * Constructs and initializes the <code>VariantManagement</code> control.
	 */
	VariantManagement.prototype.init = function() {
		Control.prototype.init.apply(this, arguments);

		this._oRb = Library.getResourceBundleFor("sap.m");

		// Check whether device is Macintosh
		this.deviceIsMac = Device.os.macintosh;

        this._oManagedObjectModel = new ManagedObjectModel(this);
        this.setModel(this._oManagedObjectModel, "$mVariants");

		this._oObserver = new ManagedObjectObserver(this._observeChanges.bind(this));
		this._oObserver.observe(this, {
			aggregations: [
				"items"
			]
		});
	};

	VariantManagement.prototype._observeChanges = function(oChanges) {
		var oVariantItem;

		if (oChanges.type === "aggregation") {

			if (oChanges.name === "items") {

				oVariantItem = oChanges.child;

				switch (oChanges.mutation) {
					case "insert":
						if (!this._oObserver.isObserved(oVariantItem, {properties: ["title", "favorite", "executeOnSelect", "contexts"]})) {
							this._oObserver.observe(oVariantItem, {properties: ["title", "favorite", "executeOnSelect", "contexts"]});
						}

						if (this.getSelectedKey() === oVariantItem.getKey()) {
							this.refreshTitle();
						}
						break;
					case "remove":
						if (this._oObserver.isObserved(oVariantItem, {properties: ["title", "favorite", "executeOnSelect", "contexts"]})) {
							this._oObserver.unobserve(oVariantItem, {properties: ["title", "favorite", "executeOnSelect", "contexts"]});
						}
						break;
					default:
						Log.error("operation " + oChanges.mutation + " not yet implemented");
				}
			}
		} else if (oChanges.type === "property") {

			if (oChanges.object?.isA?.("sap.m.VariantItem")) {
				oVariantItem = oChanges.object;

				if (this.getSelectedKey() === oVariantItem.getKey()) {
					this.refreshTitle();
				}

				if (!this.oManagementTable || (this.oManagementTable.getItems && this.oManagementTable.getItems().length === 0)) {
					if (oChanges.name === "title") {
						oVariantItem._setOriginalTitle(oChanges.current);
					} else if (oChanges.name === "favorite") {
						oVariantItem._setOriginalFavorite(oChanges.current);
					} else if (oChanges.name === "executeOnSelect") {
						oVariantItem._setOriginalExecuteOnSelect(oChanges.current);
					} else if (oChanges.name === "contexts") {
						oVariantItem._setOriginalContexts(oChanges.current);
					}
				} else {
					const oRow = this.oManagementTable.getItems().find((oListItem) => {
						const oItem = this._findVariantItem(oListItem.getBindingContext(this._sModelName));
						return oItem.getKey() === oVariantItem.getKey();
					});

					if (oChanges.name === "contexts") {
						this._updateContextsDependencies(oRow);
					}
				}
			}
		}
	};

	VariantManagement.prototype.applySettings = function(mSettings, oScope) {
		Control.prototype.applySettings.apply(this, arguments);

		this._createInnerModel();
		this._initializeControl();
	};

	/**
 	 * Special handling of the rendering the apply automatically control in <i>Manage Views</i>
	 * @returns {string} Value of the private property
	 * @private
	 * @restricted sap.ui.fl, sap.ui.comp
 	 */
	VariantManagement.prototype.getDisplayTextForExecuteOnSelectionForStandardVariant = function() {
		return this.getProperty("_displayTextForExecuteOnSelectionForStandardVariant");
	};
	/**
 	 * Special handling of the rendering the apply automatically control in <i>Manage Views</i>
	 * @param {string} sValue to be displayed
	 * @returns {string} the current instance
	 * @private
	 * @restricted sap.ui.fl, sap.ui.comp
 	 */
	VariantManagement.prototype.setDisplayTextForExecuteOnSelectionForStandardVariant = function(sValue) {
		this.setProperty("_displayTextForExecuteOnSelectionForStandardVariant", sValue);
		return this;
	};
	/**
 	 * Special handling of the rendering of this control.
	 * @param {boolean} bValue defines the intended rendering
	 * @returns {sap.m.VariantManagement} the current instance
	 * @private
	 * @restricted sap.ui.fl, sap.ui.comp
 	 */
	VariantManagement.prototype.setShowAsText = function(bValue) {
		this.setProperty("_showAsText", bValue);
		this._reCreateVariantTextControl();
		return this;
	};

	/**
 	 * Special handling of the rendering of this control.
	 * @returns {boolean} the current intend
	 * @private
	 * @restricted sap.ui.fl, sap.ui.comp
 	 */
	VariantManagement.prototype.getShowAsText = function() {
		return this.getProperty("_showAsText");
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

	VariantManagement.prototype._createVariantTextControl = function() {
		var FnVariantRenderType = this.getShowAsText() ? Text : Title;
		var oVariantText = new FnVariantRenderType(this.getId() + "-text", {
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
			}
		});

		if (oVariantText.isA("sap.m.Title")) {
			oVariantText.bindProperty("level", {
				path: '/level',
				model: "$mVariants"
			});

			oVariantText.bindProperty("titleStyle", {
				path: '/titleStyle',
				model: "$mVariants"
			});
		}

		oVariantText.addStyleClass("sapMVarMngmtClickable");
		oVariantText.addStyleClass("sapMVarMngmtTitle");

		return oVariantText;
	};

	VariantManagement.prototype._initializeControl = function() {
		if (this.oVariantInvisibleText) {
			return;
		}

		this.oVariantInvisibleText = new InvisibleText(this.getId() + "-invText");

		this.oVariantText = this._createVariantTextControl();

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

		this.oVariantPopoverTrigger = new Button(this.getId() + "-trigger", {
			icon: "sap-icon://slim-arrow-down",
			type: ButtonType.Transparent,
			tooltip: this._oRb.getText("VARIANT_MANAGEMENT_TRIGGER_TT"),
			enabled: {
				path: "/isDesignMode",
				model: VariantManagement.INNER_MODEL_NAME,
				formatter: function(bValue) {
					return !bValue;
				}
			},
			ariaHasPopup: AriaHasPopup.Dialog
		});

		this.oVariantPopoverTrigger.addAriaLabelledBy(this.oVariantInvisibleText);
		this.oVariantPopoverTrigger.addStyleClass("sapMVarMngmtClickable");

		this.oVariantLayout = new HorizontalLayout(this.getId() + "-content", {
			content: [
				this.oVariantText, oVariantModifiedText, this.oVariantPopoverTrigger
			]
		});
		this.oVariantLayout.addStyleClass("sapMVarMngmtLayout");
		this.oVariantLayout.addStyleClass("sapMVarMngmtLayoutModifiedHidden");

		oVariantModifiedText.setVisible(false);

		this.oVariantModifiedText = oVariantModifiedText;

		this.oVariantInvisibleText.toStatic();

		this.addDependent(this.oVariantLayout);
	};

	VariantManagement.prototype._reCreateVariantTextControl = function() {

		if (!this.getShowAsText() && this.oVariantText && this.oVariantText.isA("sap.m.Title)")) {
			return;
		}
		if (!this.getShowAsText() && this.oVariantText && this.oVariantText.isA("sap.m.Text)")) {
			return;
		}

		if (this.oVariantText) {
			this.oVariantLayout.removeContent(0);
			this.oVariantText.destroy();
		}

		var oVariantText = this._createVariantTextControl();

		this.oVariantLayout.insertContent(oVariantText, 0);
		this.oVariantText = oVariantText;
	};
	/**
	 * Required by the {@link sap.m.IOverflowToolbarContent} interface.
	 * Registers invalidations event which is fired when width of the control is changed.
	 *
	 * @protected
	 * @returns {{canOverflow: boolean, invalidationEvents: string[]}} Configuration information for the <code>sap.m.IOverflowToolbarContent</code> interface
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

	VariantManagement.prototype.refreshTitle = function() {
		if (this.oVariantText) {
			this.oVariantText.getBinding("text").refresh(true);
		}
	};

	VariantManagement.prototype._setInvisibleText = function(sText, bFlag) {
		var sInvisibleTextKey;
		if (sText) {
			if (bFlag) {
				sInvisibleTextKey = "VARIANT_MANAGEMENT_SEL_VARIANT_MOD";
				this.oVariantLayout.removeStyleClass("sapMVarMngmtLayoutModifiedHidden");
			} else {
				sInvisibleTextKey = "VARIANT_MANAGEMENT_SEL_VARIANT";
				this.oVariantLayout.addStyleClass("sapMVarMngmtLayoutModifiedHidden");
			}

			this.oVariantInvisibleText.setText(this._oRb.getText(sInvisibleTextKey, [sText]));
		}
	};

	VariantManagement.prototype._createInnerModel = function() {
		var oModel = new JSONModel({
			showCreateTile: false,
			isDesignMode: false,
			hasNoData: false
		});
		this.setModel(oModel, VariantManagement.INNER_MODEL_NAME);
	};


	VariantManagement.prototype._getShowCreateTile = function() {
		return this._getInnerModelProperty("/showCreateTile");
	};
	VariantManagement.prototype._setShowCreateTile = function(bValue) {
		this._setInnerModelProperty("/showCreateTile", bValue);
	};

	VariantManagement.prototype.getDesignMode = function() {
		return this._getInnerModelProperty("/isDesignMode");
	};
	VariantManagement.prototype.setDesignMode = function(bValue) {
		this._setInnerModelProperty("/isDesignMode", bValue);
	};
	VariantManagement.prototype.setHasNoData = function(bValue) {
		this._setInnerModelProperty("/hasNoData", bValue);
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

	/**
	 * Retrieves for the controls {@link sap.ui.comp.smartvariants.SmartVariantManagement} and {@link sap.ui.fl.variants.VariantManagement} the <i>Standard</i> variant.
	 * For all other scenarios the first visible variant will be returned, or <code>null</code> if there are none.
	 * @public
	 * @returns {(string | null)} The key of either the standard variant or the first visible variant or <code>null</code>.
	 */
	VariantManagement.prototype.getStandardVariantKey = function() {
		var sKey = this.getProperty("_standardKey");
		if (!sKey) {
			return this._getFirstVisibleVariant();
		}

		return sKey;
	};

	/**
	 * Assignes the key of the <i>Standard</i> variant.
	 *
	 * @private
	 * @restricted sap.ui.fl, sap.ui.comp
	 * @param {string} sValue describing the key of the standard variant
	 */
	VariantManagement.prototype.setStandardVariantKey = function(sValue) {
		this.setProperty("_standardKey", sValue);
	};

	VariantManagement.prototype._getFirstVisibleVariant = function() {
		var aItems = this._getItems();
		for (var i = 0; i < aItems.length; i++) {
			if (!this._isItemDeleted(aItems[i])) {
				if (this.getSupportFavorites()) {
					if (aItems[i].getFavorite()) {
						return aItems[i].getKey();
					}
				} else {
					return aItems[i].getKey();
				}
			}
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

	/**
	 * Retrieves a variant item by its key.
	 * @public
	 * @param {string} sKey of the item
	 * @returns {(sap.m.VariantItem|null)} For a specific key; <code>null</code> if no matching item was found
	 */
	VariantManagement.prototype.getItemByKey = function(sKey) {
		return this._getItemByKey(sKey);
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
			return Element.getElementById(sId);
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

		if (this.getDesignMode()) {
			return;
		}

		if (this.oVariantPopoverTrigger && !this.bPopoverOpen) {
			this.oVariantPopoverTrigger.focus();
		}
		this.handleOpenCloseVariantPopover(oEvent);
	};

	VariantManagement.prototype.onkeyup = function(oEvent) {
		if (oEvent.keyCode === KeyCodes.F4 || oEvent.keyCode === KeyCodes.SPACE || oEvent.altKey === true && oEvent.keyCode === KeyCodes.ARROW_UP || oEvent.altKey === true && oEvent.keyCode === KeyCodes.ARROW_DOWN) {
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

		// Set initial aria-expanded state after rendering
		if (this.oVariantPopoverTrigger && this.oVariantPopoverTrigger.$().length > 0) {
			this.oVariantPopoverTrigger.$().attr("aria-expanded", "false");
		}
	};

	// ERROR LIST
	VariantManagement.prototype._openInErrorState = function() {
		var oVBox;

		if (!this.oErrorVariantPopOver) {
			oVBox = new VBox(this.getId() + "-errorContent", {
				fitContainer: true,
				alignItems: FlexAlignItems.Center,
				items: [
					new Icon(this.getId() + "-errorIcon", {
						size: "4rem",
						color: "lightgray",
						src: "sap-icon://message-error"
					}), new Title(this.getId() + "-errorTitle", {
						titleStyle: TitleLevel.H2,
						text: this._oRb.getText("VARIANT_MANAGEMENT_ERROR_TEXT1")
					}), new Text(this.getId() + "-errorText", {
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
				beforeClose: function() {
					this.oVariantPopoverTrigger?.$().attr("aria-expanded", "false");
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

	VariantManagement.prototype._createIllustratedMessages = function() {

		if (!this._oNoDataIllustratedMessage || this._oNoDataIllustratedMessage.bIsDestroyed) {
			this._oNoDataIllustratedMessage = new IllustratedMessage(this.getId() + "-noData", {
				title: this._oRb.getText("VARIANT_MANAGEMENT_NODATA"),
				description: this._oRb.getText("VARIANT_MANAGEMENT_NODATA_DESCR"),
				enableVerticalResponsiveness: true,
				illustrationSize: IllustratedMessageSize.Auto,
				illustrationType: mobileLibrary.IllustratedMessageType.NoEntries
			});
		}
		if (!this._oNoDataFoundIllustratedMessage || this._oNoDataFoundIllustratedMessage.bIsDestroyed) {
			this._oNoDataFoundIllustratedMessage = new IllustratedMessage(this.getId() + "-noDataFound", {
				title: this._oRb.getText("VARIANT_MANAGEMENT_NODATA_FOUND"),
				description: this._oRb.getText("VARIANT_MANAGEMENT_NODATA_FOUND_DESCR"),
				enableVerticalResponsiveness: true,
				illustrationSize: IllustratedMessageSize.Auto,
				illustrationType: mobileLibrary.IllustratedMessageType.NoSearchResults
			});
			this._oNoDataFoundIllustratedMessage.addStyleClass("sapMVarMngmtIllustratedMessage");
		}
	};

	// My Views List
	VariantManagement.prototype._createVariantList = function() {
		if (this.oVariantPopOver) {
			return;
		}

		this._createIllustratedMessages();

		this.oVariantManageBtn = new Button(this.getId() + "-manage", {
			text: this._oRb.getText("VARIANT_MANAGEMENT_MANAGE"),
			enabled: true,
			press: function() {
				this._openManagementDialog();
			}.bind(this),
			layoutData: new OverflowToolbarLayoutData(this.getId() + "-manage-layoutData", {
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
				},{
					path: '$mVariants>/selectedKey'
				}
				],
				formatter: function(bCreationAllowed, bModified, sSelectedKey) {
					var bItemChangeable = false;
					var oItem = this._getItemByKey(sSelectedKey);
					if (oItem) {
						bItemChangeable = oItem.getChangeable();
					}
					return bCreationAllowed && bModified && bItemChangeable;
				}.bind(this)
			},
			type: ButtonType.Emphasized,
			layoutData: new OverflowToolbarLayoutData(this.getId() + "-mainsave-layoutData", {
				priority: OverflowToolbarPriority.Low
			})
		});
		ShortcutHintsMixin.addConfig(this.oVariantSaveBtn, {
			addAccessibilityLabel: true,
			message: this._getSaveTooltipText("SAVE_MAIN")
		}, this);

		this.oVariantSaveAsBtn = new Button(this.getId() + "-saveas", {
			text: this._oRb.getText("VARIANT_MANAGEMENT_SAVEAS"),
			press: function() {
				this._openSaveAsDialog();
			}.bind(this),
			layoutData: new OverflowToolbarLayoutData(this.getId() + "-saveas-layoutData", {
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
			visible: {
				path: "/hasNoData",
				model: VariantManagement.INNER_MODEL_NAME,
				formatter: function(bValue) {
					 return !bValue;
				}
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
					this.setCurrentVariantKey(sSelectionKey);
					this.oVariantPopOver.close();
				}
			}.bind(this)
		});

		this.oVariantListInvisibleText = new InvisibleText(this.getId() + "-listInvisibleText", {
			text: this._oRb.getText("VARIANT_MANAGEMENT_VIEW_LIST")
		});

		this.oVariantListInvisibleText.toStatic();
		this.oVariantList.addAriaLabelledBy(this.oVariantListInvisibleText);

		this.oNodataTextLayout = new VBox(this.getId() + "-no-data", {
			visible: {
				path: "/hasNoData",
				model: VariantManagement.INNER_MODEL_NAME
			},
			fitContainer: true,
			items: [this._oNoDataFoundIllustratedMessage]
		});

		var oItemTemplate = new Item(this.getId() + "-list-item", {
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
			subHeader: new Toolbar(this.getId() + "-selpage-header", {
				content: [
					this._oSearchField
				]
			}),
			content: [
				this.oVariantList, this.oNodataTextLayout
			],
			footer: new OverflowToolbar(this.getId() + "-selpage-footer", {
				content: [
					new ToolbarSpacer(this.getId() + "-selpage-footer-spacer"), this.oVariantSaveBtn, this.oVariantSaveAsBtn, this.oVariantManageBtn
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
			resizable: true,
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
			beforeClose: function() {
				this.oVariantPopoverTrigger?.$().attr("aria-expanded", "false");
			}.bind(this),
			contentHeight: "300px"
		});

		this.oVariantPopOver.addEventDelegate({
			onkeydown: function(oEvent) {
				const bCtrlKey = this.deviceIsMac ? oEvent.metaKey : oEvent.ctrlKey;

				// Use CTRL / CMD + S to trigger the Save action
				if ( oEvent.keyCode == KeyCodes.S && (oEvent.shiftKey === false) && (oEvent.altKey === false) && (bCtrlKey === true)) {
					if (this.oVariantSaveBtn?.getVisible() && this.oVariantSaveBtn?.getEnabled()) {
						oEvent.preventDefault();
						oEvent.stopPropagation();
						this._handleVariantSave();
					}
				}
			}

		}, this);

		this.oVariantPopOver.addStyleClass("sapMVarMngmtPopover");
		if (this.oVariantLayout.$().closest(".sapUiSizeCompact").length > 0) {
			this.oVariantPopOver.addStyleClass("sapUiSizeCompact");
		}
		this.addDependent(this.oVariantPopOver);

		this.oVariantPopOver.isPopupAdaptationAllowed = function() {
			return false;
		};
	};


	/**
	 * Enables the programmatic selection of a variant.
	 * @public
	 * @param {string} sKey of variant to be selected. If the passed key doesn't identify a variant, it will be ignored
	 *
	 * @since 1.121
	 */
	VariantManagement.prototype.setCurrentVariantKey = function(sKey) {
		var oItem = this.getItemByKey(sKey);
		if (oItem) {
			var bTriggerForSameItem = this.getProperty("_selectStategyForSameItem");

			if (bTriggerForSameItem || (!bTriggerForSameItem && (this.getSelectedKey() !== sKey))) {
				this.setSelectedKey(sKey);

				this.fireSelect({
					key: sKey
				});
			}
		} else {
			Log.error("setCurrentVariantKey called with unknown key:'" + sKey + "'");
		}
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
		this.oVariantPopoverTrigger.$().attr("aria-expanded", "true");

		if (this.bPopoverOpen || this.iOpenTimer) {
			return;
		}

		this._createVariantList();
		this._oSearchField.setValue("");

		const oListBinding = this.oVariantList.getBinding("items");
		oListBinding.attachChange(function(oEvent) {
			this.setHasNoData(this.oVariantList.getItems().length === 0);
		}.bind(this));
		oListBinding.filter(this._getFilters());

		if (this.oVariantList.getItems().length < 1) {
			this.oNodataTextLayout.removeAllItems();
			this.oNodataTextLayout.addItem(this._oNoDataIllustratedMessage);
		}

		this.oVariantSelectionPage.setShowSubHeader(this.oVariantList.getItems().length > 9);

		this._determineEmphasizedFooterButton();

		var oSelectedItem = this.oVariantList.getSelectedItem();
		if (oSelectedItem) {
			this.oVariantPopOver.setInitialFocus(oSelectedItem.getId());
		}

		var oControlRef = this._oCtrlRef ? this._oCtrlRef : this.oVariantLayout;
		this._oCtrlRef = null;
		this.iOpenTimer = setTimeout(() => { // otherwise screenreader would not announce the expanded-state of the button
			delete this.iOpenTimer;
			if (!this.isDestroyed()) {
				this.oVariantPopOver.openBy(oControlRef);
			}
		}, 100);
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

		if (oVariantList.getItems().length < 1) {
			if ((this.oNodataTextLayout.getItems().length === 0) || (this.oNodataTextLayout.getItems().length > 0) && (this.oNodataTextLayout.getItems()[0] !== this._oNoDataFoundIllustratedMessage)) {
				if (!this._oNoDataFoundIllustratedMessage.hasStyleClass("sapMVarMngmtIllustratedMessage")) {
					this._oNoDataFoundIllustratedMessage.toggleStyleClass("sapMVarMngmtIllustratedMessage");
				}
				this.oNodataTextLayout.removeAllItems();
				this.oNodataTextLayout.addItem(this._oNoDataFoundIllustratedMessage);
			}
		}
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
				select: function(oEvent) {
					if (this._sStyleClass) {
						if (oEvent.getParameter("selected")) {
							var mContexts = this._getContextInfoChanges();
							if (this._isRestricted(mContexts)) {
								this.oDefault.setValueState(ValueState.Error);
								this.oDefault.setValueStateText(this._oRb.getText("VARIANT_MANAGEMENT_NO_DEFAULT_ON_RESTRICTED_VIEWS"));
								this.oDefault.focus();
							} else {
								this.oDefault.setValueState(ValueState.None);
								this.oDefault.setValueStateText("");
							}
						} else if (this.oDefault.getValueState() != ValueState.None){
							this.oDefault.setValueState(ValueState.None);
							this.oDefault.setValueStateText("");
						}
					}
				}.bind(this),
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

			this.oSaveSave = new Button(this.getId() + "-variantsave", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_SAVE"),
				type: ButtonType.Emphasized,
				press: this._fireVariantSaveAsEvent.bind(this),
				enabled: true
			});

			this.oSaveAsCancel = new Button(this.getId() + "-variantcancel", {
					text: this._oRb.getText("VARIANT_MANAGEMENT_CANCEL"),
					press: this._cancelPressed.bind(this)
			});

			ShortcutHintsMixin.addConfig(this.oSaveSave, {
				addAccessibilityLabel: true,
				message: this._getSaveTooltipText("SAVE")
			}, this);

			var oSaveAsDialogOptionsGrid = new Grid(this.getId() + "-savedialog-options", {
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
				endButton: this.oSaveAsCancel,
				content: [
					oLabelName, this.oInputName, oSaveAsDialogOptionsGrid
				],
				stretch: Device.system.phone,
				busyIndicatorDelay: 0
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

			// Use submit event to allow enter pressing for save
			this.oInputName.attachSubmit(this._fireVariantSaveAsEvent, this);
		}
	};

	VariantManagement.prototype._fireVariantSaveAsEvent = function() {
		if (!this._bSaveOngoing) {
			this._checkVariantNameConstraints(this.oInputName);

			if (this.oInputName.getValueState() === ValueState.Error) {
				this.oInputName.focus();
				return;
			}

			this._bSaveOngoing = true;
			this._bSaveCanceled = false;
			const bReturn = this._handleVariantSaveAs(this.oInputName.getValue());
			if (!bReturn) {
				this._bSaveOngoing = false;
			}
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

	VariantManagement.prototype._isRestricted = function(mContexts) {
		if (!mContexts) {
			mContexts = { role: []};
		}

		return (mContexts.role && mContexts.role.length > 0);
	};

	VariantManagement.prototype._determineRolesSpecificText = function(oItem, oTextControl) {

		if (oTextControl) {
			oTextControl.setText(this._oRb.getText((this._isRestricted(oItem.getContexts())) ? "VARIANT_MANAGEMENT_VISIBILITY_RESTRICTED" : "VARIANT_MANAGEMENT_VISIBILITY_NON_RESTRICTED"));
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
							this._determineRolesSpecificText(oItem, oTextControl);

                            this._checkDefaultEnabled(oItem);

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

		this.oDefault.setEnabled(true);
		this.oDefault.setSelected(false);
		if (this.oDefault.getValueState() !== ValueState.None) {
			this.oDefault.setValueState(ValueState.None);
			this.oDefault.setValueStateText("");
		}

		this.oPublic.setSelected(false);
		this.oExecuteOnSelect.setSelected(false);
		this.oCreateTile.setSelected(false);

		if (this.oVariantPopOver) {
			this.oVariantPopOver.close();
		}

		//Lazy loading of variants
		if (!this.oSaveAsDialog.isOpen()){
			this._executeDynamicVariantsLoadedCallback(this.oSaveAsDialog);
		}

		if (!bDoNotOpen) {
			this.oSaveAsDialog.open();
		}
		this.oInputName.selectText(0, this.getSelectedVariantText(this.getSelectedKey()).length);
	};

	VariantManagement.prototype._handleVariantSaveAs = function(sNewVariantName) {
		var sKey = null;
		var sName = sNewVariantName.trim();

		if (sName === "") {
			this.oInputName.setValueState(ValueState.Error);
			this.oInputName.setValueStateText(this._oRb.getText("VARIANT_MANAGEMENT_ERROR_EMPTY"));
			return false;
		}

		var mContexts = this._getContextInfoChanges();
		var bIsRestricted = this._isRestricted(mContexts);
		if (bIsRestricted && this.oDefault.getSelected()) {
			this.oDefault.setValueState(ValueState.Error);
			this.oDefault.setValueStateText(this._oRb.getText("VARIANT_MANAGEMENT_NO_DEFAULT_ON_RESTRICTED_VIEWS"));
			this.oDefault.focus();
			return false;
		} else if (!bIsRestricted){
			var bWasInErrorState = this.oDefault.getValueState() !== ValueState.None;

			this.oDefault.setValueState(ValueState.None);
			this.oDefault.setValueStateText("");

			if (bWasInErrorState){
				return false; // otherwise the error state is still visible on the UI and the Save completes...
			}
		}

		if (this.oSaveAsDialog) {
			this.oSaveAsDialog.close();
		}

		var oObj = {
				key: sKey,
				name: sName,
				overwrite: false,
				def: this.oDefault.getSelected(),
				execute: this.oExecuteOnSelect.getSelected(),
				"public": this.getSupportPublic() ? this.oPublic.getSelected() : undefined,
				contexts: mContexts
		};

		if (this._getShowCreateTile() && this.oCreateTile) {
			oObj.tile = this.oCreateTile.getSelected();
		}

		this.destroyManageDialog();

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
	};

	// Manage Views dialog

	VariantManagement.prototype.destroyManageDialog = function() {
		if (this.oManagementDialog) {
			if (this._sStyleClass) {
				this.setSupportPublic(this._bShowPublic, true);
				this._sStyleClass = undefined;
				this._oRolesComponentContainer = null;
				this.setSupportContexts(false);
			}
			this.oManagementDialog.destroy();
			this.oManagementDialog = undefined;
		}
	};

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

		const oBinding = oManagementTable.getBinding("items");
		const oVisibleFilter = this._getVisibleFilter();
		const aFilters = oVisibleFilter ? [oVisibleFilter] : [];

		if (sValue) {
			const sLowerValue = sValue.toLowerCase();
			const aBranches = [];
			let bMatchAll = false;

			for (const sProperty of ["title", "author"]) {
				const oResolved = this._resolveTemplatePath(sProperty);
				if (oResolved.path) {
					aBranches.push(new Filter({
						path: oResolved.path,
						operator: FilterOperator.Contains,
						value1: sValue
					}));
				} else if ("value" in oResolved) {
					if (String(oResolved.value ?? "").toLowerCase().includes(sLowerValue)) {
						// Static value matches search -> show all rows, no further filtering
						bMatchAll = true;
						break;
					}
				} else {
					// Complex binding with formatter -> filter by formatted value
					const oFormatterFilter = this._buildFormatterFilter(oResolved.bindingInfo, sValue, oBinding);
					if (oFormatterFilter) {
						aBranches.push(oFormatterFilter);
					}
				}
			}

			if (!bMatchAll) {
				aFilters.push(aBranches.length
					? new Filter({ filters: aBranches, and: false })
					: new Filter({ path: "/", test: () => false }));
			}
		}

		oBinding.filter(aFilters);

        if (this.oManagementTable.getItems().length < 1) {
			if (this._oNoDataFoundIllustratedMessage.hasStyleClass("sapMVarMngmtIllustratedMessage")) {
				this._oNoDataFoundIllustratedMessage.toggleStyleClass("sapMVarMngmtIllustratedMessage");
			}
			this.oManagementTable.setNoData(this._oNoDataFoundIllustratedMessage);
		}

		this._bRebindRequired = true;
	};

	/**
	 * Builds an OR-filter that matches rows whose formatted value contains <code>sValue</code>,
	 * by evaluating the formatter against each binding context's properties and emitting
	 * key-based <code>EQ</code> filters for the matches. Operates on a snapshot of contexts
	 * cached in <code>this._aManageDialogContexts</code> (populated lazily on first use and
	 * reset on each manage-dialog open), so consecutive searches see the full unfiltered set.
	 *
	 * @param {object} oBI The binding info of the template's property.
	 * @param {string} sValue The search string to match against the formatted value.
	 * @param {sap.ui.model.ListBinding} oBinding The items binding of the management table.
	 * @returns {sap.ui.model.Filter|null} An OR-combined multi-filter of key-based <code>EQ</code>
	 *   filters for the matching rows, or <code>null</code> if no row matches.
	 * @private
	 */
	VariantManagement.prototype._buildFormatterFilter = function(oBI, sValue, oBinding) {
		const sLowerValue = sValue.toLowerCase();
		const aParts = oBI.parts ?? [{ path: oBI.path }];
		const fnFormatter = oBI.formatter ?? ((v) => v);
		const sKeyPath = this._resolveTemplatePath("key").path ?? "key";
		// Snapshot the unfiltered context set on first use; subsequent searches in the same
		// dialog session reuse it so they see all variants, not just the previously filtered ones.
		// Note: Only gets currently materialized contexts in case of oData models
		this._aManageDialogContexts ??= oBinding.getAllCurrentContexts();

		const aMatchingFilters = [];
		this._aManageDialogContexts.forEach((oContext) => {
			const sFormatted = fnFormatter.apply(null, aParts.map((p) => oContext.getProperty(p.path)));
			if (typeof sFormatted === "string" && sFormatted.toLowerCase().includes(sLowerValue)) {
				aMatchingFilters.push(new Filter(sKeyPath, FilterOperator.EQ, oContext.getProperty(sKeyPath)));
			}
		});

		return aMatchingFilters.length
			? new Filter({ filters: aMatchingFilters, and: false })
			: null;
	};

	VariantManagement.prototype.getManageDialog = function() {
		return this.oManagementDialog;
	};

	VariantManagement.prototype._createManagementDialog = function() {
		if (!this.oManagementDialog || this.oManagementDialog.bIsDestroyed) {

			this._createIllustratedMessages();

			this.oManagementTable = new Table(this.getId() + "-managementTable", {
				contextualWidth: "Auto",
				fixedLayout: false,
				growing: true,
				noData: this._oNoDataIllustratedMessage,
				keyboardMode: ListKeyboardMode.Navigation,
				sticky: [ Sticky.ColumnHeaders ],
				columns: [
					new Column(this.getId() + "-managementTable-col-favorite", {
						header: new InvisibleText(this.getId() + "-managementTable-col-favorite-invText", {
									text: this._oRb.getText("VARIANT_MANAGEMENT_FAVORITE_COLUMN")
								}),
						width: "3rem",
						visible: {
							path: "/supportFavorites",
							model: "$mVariants"
						}
					}), new Column(this.getId() + "-managementTable-col-name", {
						header: new Text(this.getId() + "-managementTable-col-name-text", {
							text: this._oRb.getText("VARIANT_MANAGEMENT_NAME")
						}),
						width: "16rem"
					}), new Column(this.getId() + "-managementTable-col-variantType", {
						header: new Text(this.getId() + "-managementTable-col-variantType-text", {
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
					}), new Column(this.getId() + "-managementTable-col-default", {
						header: new Text(this.getId() + "-managementTable-col-default-text", {
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
					}), new Column(this.getId() + "-managementTable-col-executeOnSelect", {
						header: new Text(this.getId() + "-managementTable-col-executeOnSelect-text", {
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
					}), new Column(this.getId() + "-managementTable-col-visibility", {
						header: new Text(this.getId() + "-managementTable-col-visibility-text", {
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
					}), new Column(this.getId() + "-managementTable-col-author", {
						header: new Text(this.getId() + "-managementTable-col-author-text", {
							text: this._oRb.getText("VARIANT_MANAGEMENT_AUTHOR"),
							wrappingType: "Hyphenated"
						}),
						demandPopin: true,
						popinDisplay: PopinDisplay.Block,
						minScreenWidth: ScreenSize.Tablet
					}), new Column(this.getId() + "-managementTable-col-action", {
						header: new InvisibleText(this.getId() + "-managementTable-col-action-invText", {
									text: this._oRb.getText("VARIANT_MANAGEMENT_ACTION_COLUMN")
								}),
						hAlign: TextAlign.Center
					}), new Column(this.getId() + "-managementTable-col-last", {
						visible: false
					})
				],
				busyIndicatorDelay: 0
			});

			this.oManagementSave = new Button(this.getId() + "-managementsave", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_SAVE"),
				enabled: true,
				type: ButtonType.Emphasized,
				press: function() {
					if (this._handleManageSavePressed() && this.oManagementDialog) {
						this.oManagementDialog.close();
					}
				}.bind(this)
			});

			ShortcutHintsMixin.addConfig(this.oManagementSave, {
				addAccessibilityLabel: true,
				message: this._getSaveTooltipText("SAVE")
			}, this);

			this.oManagementCancel = new Button(this.getId() + "-managementcancel", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_CANCEL"),
				press: function() {
					this._resumeManagementTableBinding();
					this._handleManageCancelPressed();
					if (this.oManagementDialog) { // can be deleted during manageCancel event
						this.oManagementDialog.close();
					}
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
						this.setSupportContexts(false);
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

			this._oSearchFieldOnMgmtDialog = new SearchField(this.getId() + "-managementdialog-search");

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

			// Attach keydown event to the search field, as its overrides corresponding keydown events, to handle Ctrl+Enter (or Cmd+Enter on Mac) to trigger Save action
			this._oSearchFieldOnMgmtDialog.addEventDelegate({
				// there is no onsapenter event for SearchField, so we need to use onkeydown
				onkeydown: (oEvent) => {
					if (oEvent.keyCode === KeyCodes.ENTER){
						this._handleManagementDialogKeydown(oEvent);
					}
				}
			}, this);

			this.addDependent(this.oManagementDialog);

			this._rebindVMTable(true);
		}
	};

	VariantManagement.prototype._getSaveTooltipText = function(sTextType) {
		const sTextKey = `VARIANT_MANAGEMENT_${sTextType}_TT${this.deviceIsMac ? "_MAC" : ""}`;
		return this._oRb.getText(sTextKey);
	};

	VariantManagement.prototype._handleManagementDialogKeydown = function(oEvent) {
		// on macintosh os cmd-key is used instead of ctrl-key
		var bCtrlKey = this.deviceIsMac ? oEvent.metaKey : oEvent.ctrlKey;
		if ( (oEvent.shiftKey === false) && (oEvent.altKey === false) && (bCtrlKey === true)){
			this.oManagementSave.firePress();
			oEvent.stopPropagation();
			oEvent.preventDefault();
		}
	};

	VariantManagement.prototype._setFavoriteIcon = function(oIcon, bFlagged) {
		if (oIcon) {
			oIcon.setSrc(bFlagged ? "sap-icon://favorite" : "sap-icon://unfavorite");
			oIcon.setTooltip(this._oRb.getText(bFlagged ? "VARIANT_MANAGEMENT_FAV_DEL_TOOLTIP" : "VARIANT_MANAGEMENT_FAV_ADD_TOOLTIP"));
			oIcon.setAlt(this._oRb.getText(bFlagged ? "VARIANT_MANAGEMENT_FAV_DEL_ACC" : "VARIANT_MANAGEMENT_FAV_ADD_ACC"));
		}
	};

	VariantManagement.prototype._checkDefaultEnabled = function(oItem) {
		var bDefaultEnabled = true;
		if (this._isRestricted(oItem.getContexts())) {
			bDefaultEnabled = false;
			if (oItem.getKey() === this.getDefaultKey()) {
				this.setDefaultKey(this.getStandardVariantKey());
			}
		}
		var oRow = this._getRowForKey(oItem.getKey());
		if (oRow) {
			oRow.getCells()[VariantManagement.COLUMN_DEFAULT_IDX].setEnabled(bDefaultEnabled);
			this._toggleIconActivityState(oRow.getCells()[0], oItem, false);
		}
	};

	VariantManagement.prototype._templateFactoryManagementDialog = function(oItemsTemplate, sId, oContext) {
		const sTooltip = null;
		let oNameControl;
		let oExecuteOnSelectCtrl;
		const oItem = this._findVariantItem(oContext);
		if (!oItem) {
			Log.error("couldn't obtain the item for '" + oContext.getPath() + "'");
			return undefined;
		}

		var nPos = this._determineIndex(oContext.getPath());
		if (nPos < 0) {
			Log.error("couldn't obtain item position for '" + oContext.getPath() + "'");
			return undefined;
		}

		const fnPropertyIsInTemplate = (sProperty) => oItemsTemplate && oItemsTemplate.getBindingInfo(sProperty) !== undefined;

		const fnTemplateExtractBinding = (sProperty) => oItemsTemplate?.getBindingInfo(sProperty) ?? ({value: oItemsTemplate?.getProperty(sProperty)});

		// Index of this item in the $mVariants MOM (/items/N/…). Computed once here so fnCreateBinding
		// can use it without re-scanning the array on each call.
		const nMomIndex = this.getItems().indexOf(oItem);

		const fnCreateBinding = (sProperty) => {
			// use OneWay Binding to not update text and flags via Model but using the explicit event handlers. (fl-VariantModel is alwqays OneWay per default)
			// VariantItem extends Item: "title" (VariantItem) may be bound as "text" (Item) in the template.
			if (!fnPropertyIsInTemplate(sProperty) && sProperty === "title" && fnPropertyIsInTemplate("text")) {
				sProperty = "text";
			}
			if (fnPropertyIsInTemplate(sProperty)) {
				let oBindingCopy = merge({}, fnTemplateExtractBinding(sProperty));
				if (!oBindingCopy.parts) {
					oBindingCopy = {parts: [merge({}, oBindingCopy)]};
				}
				oBindingCopy.parts.forEach((oPart) => {
					oPart.mode = BindingMode.OneWay;
				});
				return oBindingCopy;
			} else {
				// Property is not bound in the template — read from the MOM using an absolute path so
				// no binding context on the row is required (avoids interfering with external-model bindings).
				return {parts: [{path: `/items/${nMomIndex}/${sProperty}`, model: "$mVariants", mode: BindingMode.OneWay}]};
			}
		};

		const sIdPrefix = this.getId() + "-manage";
		const sModelName = this._sModelName;
		const fLiveChange = function(oEvent) {
			const oContext = oEvent.oSource.getBindingContext(sModelName);
			const oItem = this._findVariantItem(oContext);
			this._handleManageTitleChange(oEvent.oSource, oItem);
		}.bind(this);

		const fChange = function(oEvent) {
			const oInput = oEvent.getSource();
			const oContext = oInput.getBindingContext(sModelName);
			const oItem = this._findVariantItem(oContext);
			const oRow = oInput.getParent();

			if (sModelName === "$mVariants" && Element.getActiveElement() !== oInput && containsOrEquals(oRow.getDomRef(), document.activeElement)) {
				// if ManagedObjectModel used, all Bindings are updated on changing title of an item.
				// set it async to allow to finish the triggering browser event (e.g. Click on delete button) if anoter control of the row is focussed
				setTimeout(() => {
					oItem.setTitle(oInput.getValue());
					this._handleManageTitleChange(oInput, oItem);
				}, 100); // 100 beacuse otherwise tab-event on delete button will be later
			} else {
				oItem.setTitle(oInput.getValue());
				this._handleManageTitleChange(oInput, oItem);
			}

		}.bind(this);

		const fSelectRB = function(oEvent) {
			const oContext = oEvent.oSource.getBindingContext(sModelName);
			const oItem = this._findVariantItem(oContext);
			this._handleManageDefaultVariantChange(oEvent.oSource, oItem, oEvent.getParameters().selected);
		}.bind(this);

		const fPress = function(oEvent) {
			const oContext = oEvent.oSource.getBindingContext(sModelName);
			const oItem = this._findVariantItem(oContext);
			this._handleManageDeletePressed(oItem);
			this._reCheckVariantNameConstraints();
		}.bind(this);

		const fSelectFav = function(oEvent) {
			const oContext = oEvent.oSource.getBindingContext(sModelName);
			const oItem = this._findVariantItem(oContext);
			this._handleManageFavoriteChanged(oEvent.oSource, oItem);
		}.bind(this);

		const fEnableApply = (oEvent) => {
			const oContext = oEvent.oSource.getBindingContext(sModelName);
			const oItem = this._findVariantItem(oContext);
			oItem.setExecuteOnSelect(oEvent.getParameter("selected"));
		};

		if (oItem.getRename()) {
			oNameControl = new Input(sIdPrefix + "-input-" + nPos, {
				liveChange: fLiveChange,
				change: fChange,
				value: fnCreateBinding("title")
			});

			if (oItem.getTitle() !== oItem._getOriginalTitle()) {
				this._verifyVariantNameConstraints(oNameControl, oItem.getKey(), oItem.getTitle());
			}


		} else {
			oNameControl = new ObjectIdentifier(sIdPrefix + "-text-" + nPos, {
				title: fnCreateBinding("title")
			});
			if (sTooltip) {
				oNameControl.setTooltip(sTooltip);
			}
		}

		const oDeleteButton = new Button(sIdPrefix + "-del-" + nPos, {
			icon: "sap-icon://decline",
			enabled: true,
			type: ButtonType.Transparent,
			press: fPress,
			tooltip: this._oRb.getText("VARIANT_MANAGEMENT_DELETE"),
			visible: oItem.getRemove()
		});

		const oFavoriteBinding = fnCreateBinding("favorite");
		const oFavoriteIcon = new Icon(sIdPrefix + "-fav-" + nPos, {
			src: Object.assign({}, oFavoriteBinding, {
				formatter: function(bFlagged) {
					return bFlagged || bFlagged == null ? "sap-icon://favorite" : "sap-icon://unfavorite";
				}
			}),
			tooltip: Object.assign({}, oFavoriteBinding, {
				formatter: function(bFlagged) {
					return this._oRb.getText(bFlagged || bFlagged == null ? "VARIANT_MANAGEMENT_FAV_DEL_TOOLTIP" : "VARIANT_MANAGEMENT_FAV_ADD_TOOLTIP");
				}.bind(this)
			}),
			press: fSelectFav,
			decorative: false
		});

		if ((this.getStandardVariantKey() === oItem.getKey()) || (this.getDefaultKey() === oItem.getKey())) {
			this._setIconStyleClass(oFavoriteIcon, "sapMVarMngmtFavNonInteractiveColor");
		} else {
			this._setIconStyleClass(oFavoriteIcon, "sapMVarMngmtFavColor");
		}

		if (this.getDisplayTextForExecuteOnSelectionForStandardVariant() && (this.getStandardVariantKey() === oItem.getKey())) {
			oExecuteOnSelectCtrl = new CheckBox(sIdPrefix + "-exe-" + nPos, {
				wrapping: true,
				text: "{$mVariants>/_displayTextForExecuteOnSelectionForStandardVariant}",
				selected: fnCreateBinding("executeOnSelect"),
				select: fEnableApply
			});
		} else {
			oExecuteOnSelectCtrl = new CheckBox(sIdPrefix + "-exe-" + nPos, {
				text: "",
				selected: fnCreateBinding("executeOnSelect"),
				select: fEnableApply
			});
		}

		// roles
		const oRolesCell = this._createRolesCell(oItem, oContext);

		const oSharingBinding = fnCreateBinding("sharing");
		const oSharingText = new Text(sIdPrefix + "-type-" + nPos, {
			text: Object.assign({}, oSharingBinding, {
				formatter: function(sValue) {
					return this._oRb.getText(sValue === "Private" ? "VARIANT_MANAGEMENT_PRIVATE" : "VARIANT_MANAGEMENT_PUBLIC");
				}.bind(this)
			}),
			textAlign: "Center"
		});

		const oDefaultRadioButton = new RadioButton(sIdPrefix + "-def-" + nPos, {
			groupName: this.getId(),
			select: fSelectRB,
			selected: {
				path: "/defaultKey",
				model: "$mVariants",
				formatter: function(sKey) {
					return oItem.getKey() === sKey;
				}
			}
		});

		if (oRolesCell.isA("sap.m.HBox") && this._isRestricted(oItem.getContexts())) {
			oDefaultRadioButton.setEnabled(false);
			if (this.getDefaultKey() === oItem.getKey())  {
				this.setDefaultKey(this.getStandardVariantKey());
			}
		}

		const oListItem = new ColumnListItem(sIdPrefix + "-item-" + nPos, {
			cells: [
				oFavoriteIcon,
				oNameControl,
				oSharingText,
				oDefaultRadioButton,
				oExecuteOnSelectCtrl,
				oRolesCell,
				new Text(sIdPrefix + "-author-" + nPos, {
					text:  fnCreateBinding("author"),
					textAlign: "Begin",
				    wrappingType: "Hyphenated"
				}),
				oDeleteButton,
				new Text(sIdPrefix + "-key-" + nPos, {
					text: fnCreateBinding("key")
				})
			]
		});

		if (fnPropertyIsInTemplate("visible")) {
			oListItem.bindProperty("visible", fnCreateBinding("visible"));
		}

		if (this._isItemDeleted(oItem)) {
			oListItem.setVisible(false);
		}

		return oListItem;
	};

	VariantManagement.prototype._openManagementDialog = function () {
		this._clearDeletedItems();
		this._clearRenamedItems();
		this._createManagementDialog();

		//Lazy loading of variants
		if (!this.oManagementDialog.isOpen()){
			this._executeDynamicVariantsLoadedCallback(this.oManagementTable, () => {
				this.oManagementTable.unbindAggregation("items", true); // will be bound again at the end. Suppending will not help as update might be forced from model
			}, () => {
				//Rebind table to display refreshed data after lazy loading variants
				this._rebindVMTable(true);
			});
		}

		this.oManagementDialog.open();

		if (this.oVariantPopOver) {
			this.oVariantPopOver.close();
		}

		this._suspendManagementTableBinding();

		this._sDefaultKey = this.getDefaultKey();
		this._sOriginalDefaultKey = this._sDefaultKey;

		this._oSearchFieldOnMgmtDialog.setValue("");

		// Ideally, this should be done only once in <code>_createManagementDialog</code>. However, the binding does not recognize a change if filtering is involved.
		// After a deletion on the UI, the item is filtered out <code>.visible=false</code>. The real deletion will occur only when <i>OK</i> is pressed.
		// Since the filtered items and the result after the real deletion are identical, no change is detected. Based on this, the context on the table is
		// not invalidated....
		// WA: Always do the binding while opening the dialog.
		if (this._bRebindRequired) {
			this._rebindVMTable();
		}

		this._aManageDialogContexts = null;
		const oBinding = this.oManagementTable.getBinding("items");
		if (oBinding) {
			const oVisibleFilter = this._getVisibleFilter();
			oBinding.filter(oVisibleFilter ? [oVisibleFilter] : []);
		}

		if (this.oManagementTable.getItems().length < 1) {
			this.oManagementTable.setNoData(this._oNoDataIllustratedMessage);
		}
	};

	/**
	 * Executes the <code>dynamicVariantsLoadedCallback</code> if provided, managing the busy state of the given control.
	 * The control will be set to busy until the returned <code>Promise</code> is settled.
	 *
	 * @param {sap.ui.core.Control} oControl - The control to set busy during loading
	 * @param {function} [fnOnLoad] - Optional callback to execute when the Promise is returned
	 * @param {function} [fnAfterLoad] - Optional callback to execute after the promise is settled
	 * @private
	 */
	VariantManagement.prototype._executeDynamicVariantsLoadedCallback = function(oControl, fnOnLoad, fnAfterLoad) {
		const fnCallback = this.getDynamicVariantsLoadedCallback();
		if (typeof fnCallback === "function") {
			const oResult = fnCallback();
			if (oResult instanceof Promise && !oControl.isDestroyed()) {
				oControl.setBusy(true);
				if (fnOnLoad) {
					fnOnLoad();
				}
				oResult.finally(function() {
					oControl.setBusy(false);
					// Variants loaded during the callback (e.g. shared PUBLIC variants) are added to the items
					// aggregation after the dialog was built. Their "original" snapshot was taken while the item
					// was created from the persisted file, before the loaded runtime values were applied on top
					// (e.g. a favorite/executeOnSelection re-applied from a USER-layer change, or the variant
					// name/contexts). Without re-seeding, _collectManageData would treat these untouched variants
					// as user-modified on save and issue spurious updates that mark them dirty in the flex layer.
					this._syncOriginalItemState();
					if (fnAfterLoad) {
						fnAfterLoad();
					}
				}.bind(this));
			}
		}
	};

	/**
	 * Re-seeds the "original" snapshot of every variant item to its current value. Used after the dynamic
	 * variants loading completes so that runtime values applied to lazily loaded variants become the baseline
	 * and are not reported as user changes by {@link #_collectManageData}.
	 * @private
	 */
	VariantManagement.prototype._syncOriginalItemState = function() {
		this.getItems().forEach(function(oItem) {
			oItem._setOriginalTitle(oItem.getTitle());
			oItem._setOriginalFavorite(oItem.getFavorite());
			oItem._setOriginalExecuteOnSelect(oItem.getExecuteOnSelect());
			oItem._setOriginalContexts(oItem.getContexts());
		});
	};

	VariantManagement.prototype._toggleIconActivityState = function(oIcon, oItem, bToInActive) {
		if (!oIcon) {
			return;
		}

		if (!oItem || (oItem.getKey() === this.getStandardVariantKey())) {
			return;
		}

		if (bToInActive && oIcon.hasStyleClass("sapMVarMngmtFavColor")) {
			oIcon.removeStyleClass("sapMVarMngmtFavColor");
			this._setIconStyleClass(oIcon, "sapMVarMngmtFavNonInteractiveColor");
		} else if (oIcon.hasStyleClass("sapMVarMngmtFavNonInteractiveColor")) {
			oIcon.removeStyleClass("sapMVarMngmtFavNonInteractiveColor");
			this._setIconStyleClass(oIcon, "sapMVarMngmtFavColor");
		}
	};

	VariantManagement.prototype._setIconStyleClass = function(oIcon, sStyleClass) {
		if (oIcon) {
			oIcon.addStyleClass(sStyleClass);
			oIcon.setNoTabStop(sStyleClass === "sapMVarMngmtFavNonInteractiveColor");
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

					var oRow = this._getRowForKey(oItem.getKey());
					if (oRow) {
						var aCells = oRow.getCells();
						if (aCells) {
							oIcon = aCells[VariantManagement.COLUMN_FAV_IDX];
							this._setFavoriteIcon(oIcon, true);

							aCells[VariantManagement.COLUMN_FAV_IDX + 3].focus();  // focus on default
						}
					}
				}

				this.setDefaultKey(sKey);
			}

			this._toggleIconActivityState(oIcon, oItem, bSelected);
		}
	};

	VariantManagement.prototype._handleManageCancelPressed = function() {

		if (this._getDeletedItems().length > 0) {
			this._getDeletedItems().forEach(function(sKey) {
				var oListItem = this._getRowForKey(sKey);
				if (oListItem && !oListItem.getVisible()) {
					oListItem.setVisible(true);
				}
			}.bind(this));

			this._clearDeletedItems();
		}

		this._resetToOriginal();

		if (this._sOriginalDefaultKey !== this.getDefaultKey()) {
			var sPrevDefaultKey = this.getDefaultKey();
			this.setDefaultKey(this._sOriginalDefaultKey);

			if (sPrevDefaultKey !== this.getStandardVariantKey()) {
				var oRow = this._getRowForKey(sPrevDefaultKey);
				if (oRow) {
					var oIcon = oRow.getCells()[VariantManagement.COLUMN_FAV_IDX];
					this._toggleIconActivityState(oIcon, this._getItemByKey(sPrevDefaultKey), false);
				}
			}
		}

		this._clearRenamedItems();

		this._bRebindRequired = true;
		//this.oManagementTable.unbindItems();

		if (this._oManagedObjectModel) {
			this._oManagedObjectModel.checkUpdate();
		}

		this.fireManageCancel();
	};

	VariantManagement.prototype._handleManageFavoriteChanged = function(oIcon, oItem) {
		if (this.getStandardVariantKey() === oItem.getKey()) {
			return;
		}

		if ((this.getDefaultKey() === oItem.getKey()) && oItem.getFavorite()) {
			return;
		}

		oItem.setFavorite(!oItem.getFavorite());
		var oRow = this._getRowForKey(oItem.getKey());
		if (oRow) {
			const oIconCell = oRow.getCells()[VariantManagement.COLUMN_FAV_IDX];
			this._setFavoriteIcon(oIconCell, oItem.getFavorite());
			oIconCell.focus();
		}
	};

	VariantManagement.prototype._handleManageDeletePressed = function(oItem) {
		var sKey = oItem.getKey();

		// do not allow the deletion of the standard
		if (!oItem.getRemove()) {
			return;
		}

		const oNextFocusTarget = this._findNextFocusTargetAfterDelete(oItem);

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

		var oListItem = this._getRowForKey(oItem.getKey());
		if (oListItem) {
			oListItem.setVisible(false);
		}

		if (oNextFocusTarget) {
			oNextFocusTarget.focus();
		}
	};

	VariantManagement.prototype._findNextFocusTargetAfterDelete = function(oVariantItem) {
		if (!this.oManagementTable || !oVariantItem) {
			return this.oManagementCancel;
		}

		// Get all visible table items
		const aTableItems = this.oManagementTable.getItems();
		const sCurrentKey = oVariantItem.getKey();
		let nCurrentIndex = -1;

		// Find the current row index based on the variant item key
		for (let i = 0; i < aTableItems.length; i++) {
			const oRow = aTableItems[i];
			if (oRow.getVisible()) {
				const oBindingContext = oRow.getBindingContext(this._sModelName);
				if (oBindingContext) {
					const oRowItem = this._findVariantItem(oBindingContext);
					if (oRowItem && oRowItem.getKey() === sCurrentKey) {
						nCurrentIndex = i;
						break;
					}
				}
			}
		}

		if (nCurrentIndex === -1) {
			return this.oManagementCancel;
		}

		// Try to find the next visible row
		let oFoundRow = _findVisibleRowFromIndex(aTableItems, nCurrentIndex + 1, aTableItems.length, 1, this._sModelName);
		if (oFoundRow) {
			return oFoundRow;
		}

		// If no next row found, try to find the previous visible row
		oFoundRow = _findVisibleRowFromIndex(aTableItems, nCurrentIndex - 1, -1, -1, this._sModelName);
		if (oFoundRow) {
			return oFoundRow;
		}

		return this.oManagementCancel;
	};

	/**
	 * Helper function to find a visible row with valid binding context in a given direction
	 */
	function _findVisibleRowFromIndex(aTableItems, nStartIndex, nEndIndex, nStep, sModelName) {
		for (let i = nStartIndex; (nStep > 0 ? i < nEndIndex : i > nEndIndex); i += nStep) {
			const oRow = aTableItems[i];
			if (oRow && oRow.getVisible() && oRow.getBindingContext(sModelName)) {
				return oRow;
			}
		}
		return null;
	}

	VariantManagement.prototype._collectManageData = function() {

		var oVariantInfo = {};

		var sDefault = this.getDefaultKey();
		if (sDefault !== this._sOriginalDefaultKey){
			oVariantInfo.def = sDefault;
		}

		this.getItems().forEach(function(oItem) {
			const bDeleted = this._isItemDeleted(oItem);

			if (bDeleted) {
				if (!oVariantInfo.deleted) {
					oVariantInfo.deleted = [];
				}
				oVariantInfo.deleted.push(oItem.getKey());
			}

			if (!bDeleted && (oItem.getFavorite() !== oItem._getOriginalFavorite())) {
				if (!oVariantInfo.fav) {
					oVariantInfo.fav = [];
				}
				oVariantInfo.fav.push({ key: oItem.getKey(), visible: oItem.getFavorite()});
				oItem._setOriginalFavorite(oItem.getFavorite());
			}

			if (!bDeleted && (oItem.getTitle() !== oItem._getOriginalTitle())) {
				if (!oVariantInfo.renamed) {
					oVariantInfo.renamed = [];
				}
				oVariantInfo.renamed.push({ key: oItem.getKey(), name: oItem.getTitle()});
				oItem._setOriginalTitle(oItem.getTitle());
			}

			if (!bDeleted && (oItem.getExecuteOnSelect() !== oItem._getOriginalExecuteOnSelect())) {
				if (!oVariantInfo.exe) {
					oVariantInfo.exe = [];
				}
				oVariantInfo.exe.push({ key: oItem.getKey(), exe: oItem.getExecuteOnSelect()});
				oItem._setOriginalExecuteOnSelect(oItem.getExecuteOnSelect());
			}

			if (!bDeleted && this._hasContextsChanged(oItem)) {
				if (!oVariantInfo.contexts) {
					oVariantInfo.contexts = [];
				}
				oVariantInfo.contexts.push({ key: oItem.getKey(), contexts: oItem.getContexts()});
				oItem._setOriginalContexts(oItem.getContexts());
			}

		}.bind(this));

		return oVariantInfo;
	};

	VariantManagement.prototype._resetToOriginal = function() {
		this.getItems().forEach(function(oItem) {
			oItem.setTitle(oItem._getOriginalTitle());
			oItem.setFavorite(oItem._getOriginalFavorite());
			oItem.setExecuteOnSelect(oItem._getOriginalExecuteOnSelect());
			oItem.setContexts(oItem._getOriginalContexts());
		});
	};

	VariantManagement.prototype._hasContextsChanged = function(oItem) {
		return (JSON.stringify(oItem.getContexts()) !== JSON.stringify(oItem._getOriginalContexts()));
	};

	VariantManagement.prototype._handleManageSavePressed = function() {
		if (this._anyInErrorState(this.oManagementTable)) {
			return false;
		}

		if (this._getDeletedItems().length > 0) {
			this._bRebindRequired = true;
		}

		if (this._getRenamedItems().length > 0) {
			this._bRebindRequired = true;
			if (this._getRenamedItems().indexOf(this.getSelectedKey()) >= 0) {
				var oBinding = this.oVariantText.getBinding("text");
				if (oBinding) {
					oBinding.checkUpdate(true);
				}
			}
		}

		if (this._bRebindRequired) {
			this.oManagementTable.unbindItems();
		}

		this.fireManage(this._collectManageData());

		if (this.oManagementDialog) {
			this._resumeManagementTableBinding();
		}

		return true;
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

	VariantManagement.prototype._isItemDeleted = function(oItem) {
		const aItemsDeleted = this._getDeletedItems();
		if (!oItem || !aItemsDeleted) {
			return false;
		}
		return (aItemsDeleted.indexOf(oItem.getKey()) > -1);
	};

	VariantManagement.prototype._anyInErrorStateManageTable = function(oManagementTable) {
		var bInError = false;

		if (oManagementTable) {
			oManagementTable.getItems().some(function(oRow) {
				if (oRow.getVisible()) {
					var oInput = oRow.getCells()[VariantManagement.COLUMN_NAME_IDX];
					if (oInput && oInput.getValueState && (oInput.getValueState() === ValueState.Error)) {
						bInError = true;
					}
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
				if (oItem.getTitle() === oItem._getOriginalTitle()) {
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

	VariantManagement.prototype._getRowForKey = function(sKey) {
		let oRowForKey = null;
		if (this.oManagementTable) {
			this.oManagementTable.getItems().some(function(oRow) {
				const oColumnItem = oRow.getCells()[0].getParent();
				const oBindingContext = oColumnItem.getBindingContext(this._sModelName);

				const oItem = this._findVariantItem(oBindingContext);
				if (sKey === oItem.getKey()) {
					oRowForKey = oRow;
				}

				return oRowForKey !== null;
			}.bind(this));
		}

		return oRowForKey;
	};

	VariantManagement.prototype._determineIndex = function(sPath) {
		var nIdx = -1;
		var nPos = sPath.lastIndexOf('/');
		if (nPos > 0) {
			nIdx = parseInt(sPath.substring(nPos + 1));
		}

		return nIdx;
	};

	VariantManagement.prototype._getFilters = function(oFilter) {
		const aFilters = [];

		if (oFilter) {
			aFilters.push(oFilter);
		}

		const oVisibleFilter = this._getVisibleFilter();
		if (oVisibleFilter) {
			aFilters.push(oVisibleFilter);
		}

		if (this.getSupportFavorites()) {
			const oFavoriteFilter = this._getFavoriteFilter();
			if (oFavoriteFilter) {
				aFilters.push(oFavoriteFilter);
			}
		}

		return aFilters;
	};

	/**
	 * Classifies a property of the items template into a filter-relevant shape.
	 * Returns one of:
	 *   { path: "<modelPath>" }                 — bound with a single path, no formatter; suitable for path-based filtering
	 *   { value: <static> }                     — set as a static value on the template
	 *   { complex: true, bindingInfo: <BI> }    — bound with a formatter or multiple parts; needs formatter evaluation
	 * If no external items binding exists, falls back to { path: sProperty } for the legacy $mVariants layout.
	 *
	 * @param {string} sProperty The property to classify
	 * @returns {object} One of <code>{ path: string }</code>, <code>{ value: any }</code>, or <code>{ complex: true, bindingInfo: object }</code>
	 * @private
	 */
	VariantManagement.prototype._resolveTemplatePath = function(sProperty) {
		const oTemplate = this.getBindingInfo("items")?.template;
		if (!oTemplate) {
			return { path: sProperty };
		}
		// VariantItem extends Item; consumers may bind 'text' instead of 'title'.
		// Mirrors the renderer fallback in _templateFactoryManagementDialog.
		let oBI = oTemplate.getBindingInfo(sProperty);
		if (!oBI && sProperty === "title") {
			oBI = oTemplate.getBindingInfo("text");
		}
		if (!oBI) {
			return { value: oTemplate.getProperty(sProperty) };
		}
		if (!oBI.formatter && (!oBI.parts || oBI.parts.length === 1)) {
			return { path: oBI.parts ? oBI.parts[0].path : oBI.path };
		}
		return { complex: true, bindingInfo: oBI };
	};

	VariantManagement.prototype._getFilterForPath = function(sPath) {
		const oResolved = this._resolveTemplatePath(sPath);
		if (oResolved.path) {
			return new Filter({ path: oResolved.path, operator: FilterOperator.EQ, value1: true });
		}
		if ("value" in oResolved) {
			if (oResolved.value === true || oResolved.value == null) {
				return null;
			}
			return new Filter({ path: "/", test: () => false });
		}
		Log.warning(`VariantManagement: '${sPath}' has a complex binding; filter is not applied.`);
		return null;
	};

	VariantManagement.prototype._getVisibleFilter = function() {
		return this._getFilterForPath("visible");
	};

	VariantManagement.prototype._getFavoriteFilter = function() {
		return this._getFilterForPath("favorite");
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
		let aItems;
		let bInError = false;

		if (this.oManagementTable) {
			aItems = this.oManagementTable.getItems();
			aItems.some(function(oItem) {
				const oObject = this._findVariantItem(oItem.getBindingContext(this._sModelName));
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
			if (this._oSearchFieldOnMgmtDialog && this._oSearchFieldOnMgmtDialog.getValue() && bResult) {
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
		let aItems;
		let bInError = false;
		const sLowerCaseValue = sValue.toLowerCase();

		if (this.oManagementTable) {
			aItems = this.oManagementTable.getItems();
			aItems.some((oItem) => {
				let sTitleLowerCase;
				const oVariantItem = this._findVariantItem(oItem.getBindingContext(this._sModelName));
				if (oVariantItem && oVariantItem.getVisible()) {
					var oInput = oItem.getCells()[VariantManagement.COLUMN_NAME_IDX];

					if (oInput && (oVariantItem.getKey() !== sKey)) {
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

	/**
	 * Required by the {@link sap.m.IToolbarInteractiveControl} interface.
	 * Determines if the Control is interactive.
	 *
	 * @returns {boolean} If it is an interactive Control
	 *
	 * @private
	 * @ui5-restricted sap.m.OverflowToolbar, sap.m.Toolbar
	 */
	 VariantManagement.prototype._getToolbarInteractive = function () {
		return true;
	};

	VariantManagement.prototype._rebindVMTable = function(bForceRebind) {
		const bHasExternalBinding = !!this.getBindingInfo("items");
		const oVisibleFilter = this._getVisibleFilter();
		const oItemsBindingInfos = this.getBindingInfo("items") ?? {
			path: "/items",
			model: "$mVariants",
			factory: this._templateFactoryManagementDialog.bind(this, null),
			filters: oVisibleFilter ?? []
		};

		if (!this.oManagementTable.getBinding("items") || bForceRebind) {
			const oBindingInfo = Object.assign({}, {
				path: oItemsBindingInfos.path,
				model: oItemsBindingInfos.model,
				parameters: oItemsBindingInfos.parameters
			}, {
				factory: this._templateFactoryManagementDialog.bind(this, oItemsBindingInfos.template),
				filters: oVisibleFilter ?? []
			});

			this._sModelName = oBindingInfo.model;
			this.oManagementTable.bindAggregation("items", oBindingInfo);
		} else if (!bHasExternalBinding) {
			this.oManagementTable.getBinding("items").filter(oVisibleFilter ? [oVisibleFilter] : []);
		}

		this._bRebindRequired = false;
	};

	VariantManagement.prototype._findVariantItem = function (oContext) {
		const vObject = oContext.getObject();
		if (vObject.isA?.("sap.m.VariantItem")) {
			return vObject;
		}

		const sKeyProperty = this.getBindingInfo("items")?.template?.getBindingPath("key") ?? "key";

		return this.getItems().find((oVariantItem) => oVariantItem.getKey() === vObject[sKeyProperty]);
	};

	VariantManagement.prototype._createRolesCell = function (oItem, oContext, sIdPrefix = `${this.getId()}-manage`) {
		const fRolesPressed = function(oEvent) {
			const oContext = oEvent.oSource.getBindingContext(this._sModelName);
			const oItem = this._findVariantItem(oContext);
			this._openRolesDialog(oItem, oEvent.oSource.getParent().getItems()[0]);
		}.bind(this);

		const nPos = this._determineIndex(oContext.getPath());
		if (this._sStyleClass && this.getSupportContexts() && (oItem.getKey() !== this.getStandardVariantKey())) {
			const oText = new Text(sIdPrefix + "-role-" + nPos + "-text", { wrapping: false });
			this._determineRolesSpecificText(oItem, oText);
			var oIcon = new Icon(sIdPrefix + "-role-" + nPos + "-icon", {
				src: "sap-icon://edit",
				press: fRolesPressed
			});
			oIcon.addStyleClass("sapMVarMngmtRolesEdit");
			oIcon.setTooltip(this._oRb.getText("VARIANT_MANAGEMENT_VISIBILITY_ICON_TT"));
			return new HBox(sIdPrefix + "-role-" + nPos, {
				items: [oText, oIcon]
			});

		} else {
			return new Text(sIdPrefix + "-role-" + nPos + "-text");
		}
	};

	VariantManagement.prototype._updateContextsDependencies = function (oRow) {
		const oContext = oRow.getBindingContext(this._sModelName);
		const oItem = this._findVariantItem(oContext);

		// Update the roles
		const oOldCell = oRow.removeCell(VariantManagement.COLUMN_ROLES_IDX);
		oOldCell?.destroy();
		const oRoleCell = this._createRolesCell(this._findVariantItem(oContext), oContext);
		oRow.insertCell(oRoleCell, VariantManagement.COLUMN_ROLES_IDX);

		// Update the default state of the button and the default key
		if (oRoleCell.isA("sap.m.HBox") && this._isRestricted(oItem.getContexts())) {
			const oDefaultRadioButton = oRow.getCells()[VariantManagement.COLUMN_DEFAULT_IDX];
			oDefaultRadioButton.setEnabled(false);

			if (this.getDefaultKey() === oItem.getKey())  {
				this.setDefaultKey(this.getStandardVariantKey());
			}
		}
	};

	// exit destroy all controls created in init
	VariantManagement.prototype.exit = function() {
		var oModel;

		this._oObserver.disconnect();
		this._oObserver = undefined;

		Control.prototype.exit.apply(this, arguments);
		this._clearDeletedItems();
		this._clearRenamedItems();

		if (this.oVariantInvisibleText && !this.oVariantInvisibleText._bIsBeingDestroyed) {
			this.oVariantInvisibleText.destroy(true);
			this.oVariantInvisibleText = undefined;
		}
		if (this.oVariantListInvisibleText && !this.oVariantListInvisibleText._bIsBeingDestroyed) {
			this.oVariantListInvisibleText.destroy(true);
			this.oVariantListInvisibleText = undefined;
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
		this._oCtrlRef = undefined;

		if (this._oVMTableModel) {
			this._oVMTableModel.destroy();
			this._oVMTableModel = undefined;
		}

		if (this._oNoDataIllustratedMessage && !this._oNoDataIllustratedMessage.bIsDestroyed) {
			this._oNoDataIllustratedMessage.destroy();
		}
		if (this._oNoDataFoundIllustratedMessage && !this._oNoDataFoundIllustratedMessage.bIsDestroyed) {
			this._oNoDataFoundIllustratedMessage.destroy();
		}

		this._oNoDataIllustratedMessage = undefined;
		this._oNoDataFoundIllustratedMessage = undefined;

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
