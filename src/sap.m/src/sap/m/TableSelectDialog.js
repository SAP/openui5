/*!
 * ${copyright}
 */

// Provides control sap.m.TableSelectDialog.
sap.ui.define([
	'./Button',
	'./Dialog',
	'./SearchField',
	'./Table',
	'./library',
	'./TitleAlignmentMixin',
	'sap/ui/core/Control',
	'sap/ui/Device',
	'sap/ui/base/ManagedObject',
	'sap/m/Toolbar',
	'sap/m/Label',
	'sap/m/BusyIndicator',
	'sap/m/Bar',
	'sap/ui/core/theming/Parameters',
	'sap/m/Title',
	'./TableSelectDialogRenderer',
	'sap/base/Log'
],
	function(
		Button,
		Dialog,
		SearchField,
		Table,
		library,
		TitleAlignmentMixin,
		Control,
		Device,
		ManagedObject,
		Toolbar,
		Label,
		BusyIndicator,
		Bar,
		Parameters,
		Title,
		TableSelectDialogRenderer,
		Log
	) {
	"use strict";



	// shortcut for sap.m.ListMode
	var ListMode = library.ListMode;

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	// shortcut for sap.m.TitleAlignment
	var TitleAlignment = library.TitleAlignment;

	/**
	 * Constructor for a new TableSelectDialog.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A dialog to select items in a table containing multiple values and attributes.
	 * <h3>Overview</h3>
	 * The table select dialog helps users select items in a table-like structure with several attributes and values per item. A search fields helps narrow down the results.
	 * <h3>Structure</h3>
	 * The table select dialog consists of the following elements:
	 * <ul>
	 * <li> Search field - used to search enter search terms for a specific item.</li>
	 * <li> Info toolbar (only in multi-select mode) - displays the number of currently selected items.</li>
	 * <li> Content - the table with the items.</li>
	 * <li> Footer (optional) - a toolbar for actions.</li>
	 * </ul>
	 * Table Select Dialog supports multi-selection when the <code>multiSelect</code> property is set to <code>true</code>.
	 *
	 * The selected items can be stored for later editing when the <code>rememberSelections</code> property is set.
	 * <b>Note:</b> This property has to be set before the dialog is opened.
	 * <h3>Usage</h3>
	 * <h4>When to use:</h4>
	 * <ul>
	 * <li>You need to select one or more items from a comprehensive list that contains multiple attributes or values.</li>
	 * </ul>
	 * <h4>When not to use:</h4>
	 * <ul>
	 * <li>You need to select only one item from a predefined list of single-value options. Use the {@link sap.m.Select Select} control instead.</li>
	 * <li>You need to display complex content without having the user navigate away from the current page or you want to prompt the user for an action. Use the {@link sap.m.Dialog Dialog} control instead.</li>
	 * <li>You need to select items within a query-based range. Use the {@link https://experience.sap.com/fiori-design-web/value-help-dialog/ Value Help Dialog} control instead.</li>
	 * <li>You need to filter a set of items without any selection. Use the {@link https://experience.sap.com/fiori-design-web/filter-bar/ Filter Bar} control instead.</li>
	 * </ul>
	 * <h4>Notes:</h4>
	 * <ul>
	 * <li>The property <code>growing</code> must not be used together with two-way binding.
	 * <li>When the property <code>growing</code> is set to <code>true</code> (default value), the features <code>selected count</code> in info bar, <code>search</code> and <code>select/deselect all</code>, if present, work only for the currently loaded items.
	 * To make sure that all items in the table are loaded at once and the above features work properly, set the property to <code>false</code>.
	 * <li>Since version 1.58, the columns headers and the info toolbar are sticky (remain fixed on top when scrolling). This feature is not supported in all browsers.
	 * <li>The TableSelectDialog is usually displayed at the center of the screen. Its size and position can be changed by the user.
	 * To enable this you need to set the <code>resizable</code> and <code>draggable</code> properties. Both properties are available only in desktop mode.</li>
	 * For more information on browser support limitations, you can refer to the {@link sap.m.ListBase sap.m.ListBase} <code>sticky</code> property.
	 * </ul>
	 * <h3>Responsive Behavior</h3>
	 * <ul>
	 * <li>On smaller screens, the columns of the table wrap and build a list that shows all the information.</li>
	 * </ul>
	 * When using the <code>sap.m.TableSelectDialog</code> in SAP Quartz themes, the breakpoints and layout paddings could be determined by the dialog's width. To enable this concept and add responsive paddings to an element of the control, you have to add the following classes depending on your use case: <code>sapUiResponsivePadding--header</code>, <code>sapUiResponsivePadding--subHeader</code>, <code>sapUiResponsivePadding--content</code>, <code>sapUiResponsivePadding--footer</code>.
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.16
	 * @alias sap.m.TableSelectDialog
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/table-select-dialog/ Table Select Dialog}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TableSelectDialog = Control.extend("sap.m.TableSelectDialog", /** @lends sap.m.TableSelectDialog.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Specifies the title text in the dialog header.
			 */
			title : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * Specifies the text displayed when the table has no data.
			 */
			noDataText : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * Enables the user to select several options from the table.
			 */
			multiSelect : {type : "boolean", group : "Dimension", defaultValue : false},

			/**
			 * Determines the progressive loading. When set to <code>true</code>, enables the growing feature of the control to load more items by requesting from the bound model.
			 * <b>Note:</b> This feature only works when an <code>items</code> aggregation is bound. Growing must not be used together with two-way binding.
			 * <b>Note:</b> If the property is set to true, the features <code>selected count</code> in info bar, <code>search</code> and <code>select/deselect all</code>, if present, work only for the currently loaded items.
			 * To make sure that all items in the table are loaded at once and the above features work properly, we recommend setting the <code>growing</code> property to false.
			 * @since 1.56
			 */
			growing : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Determines the number of items initially displayed in the table and defines the number of items to be requested from the model for each grow.
			 * This property can only be used if the property <code>growing</code> is set to <code>true</code>.
			 */
			growingThreshold : {type : "int", group : "Misc", defaultValue : null},

			/**
			 * Determines the content width of the inner dialog. For more information, see the Dialog documentation.
			 * @since 1.18
			 */
			contentWidth : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Controls whether the dialog clears the selection or not. When the dialog is opened multiple times in the same context to allow for corrections of previous user inputs, set this flag to "true". When the dialog should reset the selection to allow for a new selection each time set it to "false"
			 * Note: This property must be set before the Dialog is opened to have an effect.
			 * @since 1.18
			 */
			rememberSelections : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Specifies the content height of the inner dialog. For more information, see the Dialog documentation.
			 */
			contentHeight : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * This flag controls whether the Clear button is shown. When set to <code>true</code>, it provides a way to clear a selection made in Table Select Dialog.
			 *
			 * We recommend enabling of the Clear button in the following cases, where a mechanism to clear the value is needed:
			 * In case the Table Select Dialog is in single-selection mode (default mode) and <code>rememberSelections</code> is set to <code>true</code>. The Clear button needs to be enabled in order to allow users to clear the selection.
			 * In case of using <code>sap.m.Input</code> with <code>valueHelpOnly</code> set to <code>true</code>, the Clear button can be used for clearing the selection.
			 * In case the application stores a value and uses only Table Select Dialog to edit/maintain it.
			 *
			 * Optional:
			 * In case <code>multiSelect</code> is set to <code>true</code>, the selection can be easily cleared with one click.
			 *
			 * <b>Note:</b> When used with OData, only the loaded selections will be cleared.
			 * @since 1.58
			 */
			showClearButton : {type : "boolean", group : "Behavior", defaultValue : false},
			/**
			 * Overwrites the default text for the confirmation button.
			 * Note: This property applies only when the property <code>multiSelect</code> is set to <code>true</code>.
			 * @since 1.68
			 */
			confirmButtonText: {type : "string", group : "Appearance"},
						/**
			 * When set to <code>true</code>, the TableSelectDialog is draggable by its header. The default value is <code>false</code>. <b>Note</b>: The TableSelectDialog can be draggable only in desktop mode.
			 * @since 1.71
			 */
			draggable: {type: "boolean", group: "Behavior", defaultValue: false},
			/**
			 * When set to <code>true</code>, the TableSelectDialog will have a resize handler in its bottom right corner. The default value is <code>false</code>. <b>Note</b>: The TableSelectDialog can be resizable only in desktop mode.
			 * @since 1.71
			 */
			resizable: {type: "boolean", group: "Behavior", defaultValue: false},

			/**
			 * Specifies the Title alignment (theme specific).
			 * If set to <code>TitleAlignment.Auto</code>, the Title will be aligned as it is set in the theme (if not set, the default value is <code>center</code>);
			 * Other possible values are <code>TitleAlignment.Start</code> (left or right depending on LTR/RTL), and <code>TitleAlignment.Center</code> (centered)
			 * @since 1.72
			 * @public
			 */
			titleAlignment : {type : "sap.m.TitleAlignment", group : "Misc", defaultValue : TitleAlignment.Auto}
		},
		defaultAggregation : "items",
		aggregations : {

			/**
			 * The items of the table.
			 */
			items: {
				type: "sap.m.ColumnListItem", multiple : true, singularName: "item", bindable: "bindable",
				forwarding: { idSuffix: "-table", aggregation: "items", forwardBinding: true }
			},

			/**
			 * The internal dialog that is displayed when method open is called.
			 */
			_dialog: {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"},

			/**
			 * The columns bindings.
			 */
			columns: {
				type : "sap.m.Column", multiple : true, singularName : "column", bindable : "bindable",
				forwarding: { idSuffix: "-table", aggregation: "columns", forwardBinding: true }
			}
		},
		events : {

			/**
			 * Fires when the dialog is confirmed by selecting an item in single-selection mode or by pressing the confirmation button in multi-selection mode. The items being selected are returned as event parameters.
			 */
			confirm : {
				parameters : {

					/**
					 * Returns the selected list item. When no item is selected, "null" is returned. When multi-selection is enabled and multiple items are selected, only the first selected item is returned.
					 */
					selectedItem : {type : "sap.m.StandardListItem"},

					/**
					 * Returns an array containing the visible selected list items. If no items are selected, an empty array is returned.
					 */
					selectedItems : {type : "sap.m.StandardListItem[]"},

					/**
					 * Returns the binding contexts of the selected items including the non-visible items.
					 * Note: In contrast to the parameter "selectedItems", this parameter includes the selected but NOT visible items (due to list filtering). An empty array is set for this parameter if no Databinding is used.
					 */
					selectedContexts : {type : "string"}
				}
			},


			/**
			 * Fires when the search button has been clicked on dialog.
			 */
			search : {
				parameters : {

					/**
					 * Specifies the value entered in the search field.
					 */
					value : {type : "string"},

					/**
					 * Determines the Items binding of the Table Select Dialog. Only available if the items aggregation is bound to a model.
					 */
					itemsBinding : {type : "any"},

					/**
					 * Returns if the Clear button is pressed.
					 * @since 1.70
					 */
					clearButtonPressed: {type: "boolean"}
				}
			},

			/**
			 * Fires when the value of the search field is changed by a user (for example at each key press).
			 */
			liveChange : {
				parameters : {

					/**
					 * Specifies the value entered in the search field.
					 */
					value : {type : "string"},

					/**
					 * The Items binding of the Table Select Dialog.
					 * Only available if the items aggregation is bound to a model.
					 */
					itemsBinding : {type : "any"}
				}
			},

			/**
			 * Fires when the Cancel button is clicked.
			 */
			cancel : {}
		}
	}});


	/* =========================================================== */
	/*           begin: API methods                                */
	/* =========================================================== */

	/**
	 * Initializes the control.
	 * @private
	 */
	TableSelectDialog.prototype.init = function () {
		var that = this,
			iLiveChangeTimer = 0,
			fnResetAfterClose = null;

		fnResetAfterClose = function () {
			that._oSelectedItem = that._oTable.getSelectedItem();
			that._aSelectedItems = that._oTable.getSelectedItems();

			that._oDialog.detachAfterClose(fnResetAfterClose);
			that._fireConfirmAndUpdateSelection();
		};

		this._bAppendedToUIArea = false;
		this._bInitBusy = false;
		this._bFirstRender = true;
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		// store a reference to the table for binding management
		this._oTable = new Table(this.getId() + "-table", {
			growing: that.getGrowing(),
			growingScrollToLoad: that.getGrowing(),
			mode: ListMode.SingleSelectMaster,
			modeAnimationOn: false,
			sticky: [library.Sticky.InfoToolbar, library.Sticky.ColumnHeaders],
			infoToolbar: new Toolbar({
				visible: false,
				active: false,
				content: [
					new Label({
						text: this._oRb.getText("TABLESELECTDIALOG_SELECTEDITEMS", [0])
					})
				]
			}),
			selectionChange: function (oEvent) {
				if (that._oDialog) {
					if (!that.getMultiSelect()) {
						// attach the reset function to afterClose to hide the dialog changes from the end user
						that._oDialog.attachAfterClose(fnResetAfterClose);
						that._oDialog.close();
					} else {
						// update the selection label
						that._updateSelectionIndicator();
					}
				}
			}
		});


		this._oTable.getInfoToolbar().addEventDelegate({
			onAfterRendering: function () {
				that._oTable.getInfoToolbar().$().attr('aria-live', 'polite');
			}
		});

		this._table = this._oTable; // for downward compatibility

		// store a reference to the busyIndicator to display when data is currently loaded by a service
		this._oBusyIndicator = new BusyIndicator(this.getId() + "-busyIndicator").addStyleClass("sapMTableSelectDialogBusyIndicator", true);

		// store a reference to the searchField for filtering
		this._oSearchField = new SearchField(this.getId() + "-searchField", {
			width: "100%",
			liveChange: function (oEvent) {
				var sValue = oEvent.getSource().getValue(),
				iDelay = (sValue ? 300 : 0); // no delay if value is empty

				// execute search after user stopped typing for 300ms
				clearTimeout(iLiveChangeTimer);
				if (iDelay) {
					iLiveChangeTimer = setTimeout(function () {
						that._executeSearch(sValue, false, "liveChange");
					}, iDelay);
				} else {
					that._executeSearch(sValue, false, "liveChange");
				}
			},
			search: function (oEvent) {
				var sValue = oEvent.getSource().getValue(),
					bClearButtonPressed = oEvent.getParameter("clearButtonPressed");

				that._executeSearch(sValue, bClearButtonPressed, "search");
			}
		});
		this._searchField = this._oSearchField; // for downward compatibility

		// store a reference to the subheader for hiding it when data loads
		this._oSubHeader = new Bar(this.getId() + "-subHeader", {
			contentMiddle: [
				this._searchField
			]
		});

		var oCustomHeader = new Bar(this.getId() + "-dialog-header", {
			contentMiddle: [
				new Title(this.getId()  + "-dialog-title", {
					level: "H2"
				})
			]
		});

		// call the method that registers this Bar for alignment
		this._setupBarTitleAlignment(oCustomHeader, this.getId() + "_customHeader");

		// store a reference to the internal dialog
		this._oDialog = new Dialog(this.getId() + "-dialog", {
			customHeader: oCustomHeader,
			stretch: Device.system.phone,
			contentHeight: "2000px",
			subHeader: this._oSubHeader,
			content: [this._oBusyIndicator, this._oTable],
			endButton: this._getCancelButton(),
			initialFocus: ((Device.system.desktop && this._oSearchField) ? this._oSearchField : null),
			draggable: this.getDraggable() && Device.system.desktop,
			resizable: this.getResizable() && Device.system.desktop
		}).addStyleClass("sapMTableSelectDialog");
		this._dialog = this._oDialog; // for downward compatibility
		this.setAggregation("_dialog", this._oDialog);

		//CSN# 3863876/2013: ESC key should also cancel dialog, not only close it
		var fnDialogEscape = this._oDialog.onsapescape;
		this._oDialog.onsapescape = function(oEvent) {
			// call original escape function of the dialog
			if (fnDialogEscape) {
				fnDialogEscape.call(that._oDialog, oEvent);
			}
			// execute cancel action
			that._onCancel();
		};

		// internally set top and bottom margin of the dialog to 8rem respectively
		// CSN# 333642/2014: in base theme the parameter sapUiFontSize is "medium", implement a fallback
		this._oDialog._iVMargin = 8 * (parseInt(Parameters.get("sapUiFontSize")) || 16); //128

		// helper variables for search update behaviour
		this._sSearchFieldValue = "";

		// flags to control the busy indicator behaviour because the growing table will always show the no data text when updating
		this._bFirstRequest = true; // to only show the busy indicator for the first request when the dialog has been openend
		this._iTableUpdateRequested = 0; // to only show the busy indicator when we initiated the change

		this._oDialog.getProperty = function (sName) {
				if (sName !== "title") {
					return Control.prototype.getProperty.call(this, sName);
				}

				return this.getCustomHeader().getAggregation("contentMiddle")[0].getText();
			}.bind(this._oDialog);
		};

	/**
	 * Destroys the control
	 * @private
	 */
	TableSelectDialog.prototype.exit = function () {
		// internal variables
		this._oTable = null;
		this._oSearchField = null;
		this._oSubHeader = null;
		this._oClearButton = null;
		this._oBusyIndicator = null;
		this._sSearchFieldValue = null;
		this._iTableUpdateRequested = null;
		this._bFirstRequest = false;
		this._bInitBusy = false;
		this._bFirstRender = false;

		// sap.ui.core.Popup removes its content on close()/destroy() automatically from the static UIArea,
		// but only if it added it there itself. As we did that, we have to remove it also on our own
		if ( this._bAppendedToUIArea ) {
			var oStatic = sap.ui.getCore().getStaticAreaRef();
			oStatic = sap.ui.getCore().getUIArea(oStatic);
			oStatic.removeContent(this, true);
		}

		if (this._oDialog) {
			this._oDialog.destroy();
			this._oDialog = null;
		}

		if (this._oOkButton) {
			this._oOkButton.destroy();
			this._oOkButton = null;
		}

		// selections
		this._oSelectedItem = null;
		this._aSelectedItems = null;
		this._aInitiallySelectedItems = null;

		// compatibility
		this._table = null;
		this._searchField = null;
		this._dialog = null;
	};

	/**
	* Shows the busy state and is called after the renderer is finished.
	* @overwrite
	* @protected
	* @returns {sap.m.TableSelectDialog} this pointer for chaining
	*/
	TableSelectDialog.prototype.onAfterRendering = function () {
		if (this._bInitBusy && this._bFirstRender) {
			this._setBusy(true);
			this._bInitBusy = false;
			this._bFirstRender = false;
		}

		return this;
	};

	/**
	* Invalidates the dialog instead of this control, as there is no renderer.
	* @overwrite
	* @protected
	* @returns {sap.m.TableSelectDialog} this pointer for chaining
	*/
	TableSelectDialog.prototype.invalidate = function () {
		// CSN #80686/2014: only invalidate inner dialog if call does not come from inside
		if (this._oDialog && (!arguments[0] || arguments[0] && arguments[0].getId() !== this.getId() + "-dialog")) {
			this._oDialog.invalidate(arguments);
		} else {
			Control.prototype.invalidate.apply(this, arguments);
		}

		return this;
	};

	/**
	 * Opens the internal dialog with a searchfield and a table.
	 * @public
	 * @param {string} sSearchValue
	 *         Value for the search. The table will be automatically trigger the search event if this parameter is set.
	 * @returns {sap.m.TableSelectDialog} <code>this</code> to allow method chaining
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	TableSelectDialog.prototype.open = function (sSearchValue) {
		if (!this.getParent() && !this._bAppendedToUIArea) {
			var oStatic = sap.ui.getCore().getStaticAreaRef();
			oStatic = sap.ui.getCore().getUIArea(oStatic);
			oStatic.addContent(this, true);
			this._bAppendedToUIArea = true;
		}

		// reset internal variables
		this._bFirstRequest = true;

		this._sSearchFieldValue = "";

		// set search field value
		this._oSearchField.setValue(sSearchValue);


		// open the dialog
		this._oDialog.open();


		// open dialog with busy state if a list update is still in progress
		if (this._bInitBusy) {
			this._setBusy(true);
		}

		// store the current selection for the cancel event
		this._aInitiallySelectedItems = this._oTable.getSelectedItems();

		// refresh the selection indicator to be in sync with the model
		this._updateSelectionIndicator();

		//now return the control for chaining
		return this;
	};

	/**
	* Sets the growing  to the internal table
	* @public
	* @param {boolean} bValue Value for the table's growing.
	* @returns {sap.m.TableSelectDialog} this pointer for chaining
	*/
	TableSelectDialog.prototype.setGrowing = function (bValue) {
		this._oTable.setGrowing(bValue);
		this._oTable.setGrowingScrollToLoad(bValue);
		this.setProperty("growing", bValue, true);

		return this;
	};

	/**
	* Sets the growing threshold to the internal table
	* @public
	* @param {int} iValue Value for the table's growing threshold.
	* @returns {sap.m.TableSelectDialog} this pointer for chaining
	*/
	TableSelectDialog.prototype.setGrowingThreshold = function (iValue) {
		this._oTable.setGrowingThreshold(iValue);
		this.setProperty("growingThreshold", iValue, true);

		return this;
	};

	/**
	 * Sets the draggable property.
	 * @public
	 * @param {boolean} bValue Value for the draggable property
	 * @returns {sap.m.SelectDialog} <code>this</code> pointer for chaining
	 */
	TableSelectDialog.prototype.setDraggable = function (bValue) {
		this._setInteractionProperty(bValue, "draggable", this._oDialog.setDraggable);

		return this;
	};

	/**
	 * Sets the resizable property.
	 * @public
	 * @param {boolean} bValue Value for the resizable property
	 * @returns {sap.m.SelectDialog} <code>this</code> pointer for chaining
	 */
	TableSelectDialog.prototype.setResizable = function (bValue) {
		this._setInteractionProperty(bValue, "resizable", this._oDialog.setResizable);

		return this;
	};

	/**
	 * @private
	 * @param {boolean} bValue Value for the property
	 * @param {string} sPropertyType Property type
	 * @param {function} fnCallback Callback function
	 */
	TableSelectDialog.prototype._setInteractionProperty = function(bValue, sPropertyType, fnCallback) {
		this.setProperty(sPropertyType, bValue, true);

		if (!Device.system.desktop && bValue) {
			Log.warning(sPropertyType + " property works only on desktop devices!");
			return;
		}

		if (Device.system.desktop && this._oDialog) {
			fnCallback.call(this._oDialog, bValue);
		}
	};

	/**
	 * Enables/Disables busy state.
	 * @overwrite
	 * @public
	 * @param {boolean} flag for enabling busy indicator
	 * @returns {sap.m.TableSelectDialog} this pointer for chaining
	 */
	TableSelectDialog.prototype.setBusy = function (bBusy) {
		this._oSearchField.setEnabled(!bBusy);

		// Overwrite setBusy as it should be handled in the "real" dialog
		this._oDialog.setBusy.apply(this._oDialog, arguments);

		// Should return "this"
		return this;
	};

	/**
	 * Gets current busy state.
	 * @overwrite
	 * @public
	 * @returns {boolean} value of currtent busy state.
	 */
	TableSelectDialog.prototype.getBusy = function () {
		// Overwrite getBusy as it should be handled in the "real" dialog
		return this._oDialog.getBusy.apply(this._oDialog, arguments);
	};

	/**
	 * Sets the busyIndicatorDelay value to the internal table
	 * @public
	 * @param {int} iValue Value for the busyIndicatorDelay.
	 * @returns {sap.m.TableSelectDialog} this pointer for chaining
	 */
	TableSelectDialog.prototype.setBusyIndicatorDelay = function (iValue) {
		this._oTable.setBusyIndicatorDelay(iValue);
		this._oDialog.setBusyIndicatorDelay(iValue);
		this.setProperty("busyIndicatorDelay", iValue, true);

		return this;
	};

	/**
	 * Enables/Disables multi selection mode.
	 * @overwrite
	 * @public
	 * @param {boolean} bMulti flag for multi selection mode
	 * @returns {sap.m.TableSelectDialog} this pointer for chaining
	 */
	TableSelectDialog.prototype.setMultiSelect = function (bMulti) {
		this.setProperty("multiSelect", bMulti, true);
		if (bMulti) {
			this._oTable.setMode(ListMode.MultiSelect);
			this._oTable.setIncludeItemInSelection(true);
			this._oDialog.setEndButton(this._getCancelButton());
			this._oDialog.setBeginButton(this._getOkButton());
		} else {
			this._oTable.setMode(ListMode.SingleSelectMaster);
			this._oDialog.setEndButton(this._getCancelButton());
			this._oDialog.destroyBeginButton();
			delete this._oOkButton;
		}

		return this;
	};

	/**
	 * Sets the title of the internal dialog
	 * @overwrite
	 * @public
	 * @param {string} sTitle the title text for the dialog
	 * @returns {sap.m.TableSelectDialog} this pointer for chaining
	 */
	TableSelectDialog.prototype.setTitle = function (sTitle) {
		this.setProperty("title", sTitle, true);
		this._oDialog.getCustomHeader().getAggregation("contentMiddle")[0].setText(sTitle);
		return this;
	};

	/**
	 * Sets the text of the confirmation button.
	 * @override
	 * @public
	 * @param {string} sText The text for the confirm button
	 * @returns {sap.m.TableSelectDialog} <code>this</code> pointer for chaining
	 */
	TableSelectDialog.prototype.setConfirmButtonText = function (sText) {
		this.setProperty("confirmButtonText", sText, true);
		this._oOkButton && this._oOkButton.setText(sText || this._oRb.getText("SELECT_CONFIRM_BUTTON"));

		return this;
	};

	/**
	 * Sets the no data text of the internal table
	 * @overwrite
	 * @public
	 * @param {string} sNoDataText the no data text for the table
	 */
	TableSelectDialog.prototype.setNoDataText = function (sNoDataText) {
		this._oTable.setNoDataText(sNoDataText);

		return this;
	};

	/**
	 * Retrieves the internal List's no data text property
	 * @overwrite
	 * @public
	 * @returns {string} the current no data text
	 */
	TableSelectDialog.prototype.getNoDataText = function () {
		return this._oTable.getNoDataText();
	};

	/**
	 * Retrieves content width of the select dialog {@link sap.m.Dialog}
	 * @overwrite
	 * @public
	 * @returns {sap.ui.core.CSSSize} sWidth the content width of the internal dialog
	 */
	TableSelectDialog.prototype.getContentWidth = function () {
		return this._oDialog.getContentWidth();
	};

	/**
	 * Sets content width of the select dialog {@link sap.m.Dialog}
	 * @param {sap.ui.core.CSSSize} sWidth the new content width value for the dialog
	 * @public
	 * @overwrite
	 * @returns {sap.m.TableSelectDialog} this pointer for chaining
	 */
	TableSelectDialog.prototype.setContentWidth = function (sWidth) {
		this._oDialog.setContentWidth(sWidth);

		return this;
	};

	/**
	 * Retrieves content height of the select dialog {@link sap.m.Dialog}
	 * @overwrite
	 * @public
	 * @returns {sap.ui.core.CSSSize} sHeight the content height of the internal dialog
	 */
	TableSelectDialog.prototype.getContentHeight = function () {
		return this._oDialog.getContentHeight();
	};

	/**
	 * Sets content height of the select dialog {@link sap.m.Dialog}
	 * @param {sap.ui.core.CSSSize} sHeight the new content height value for the dialog
	 * @public
	 * @overwrite
	 * @returns {sap.m.TableSelectDialog} this pointer for chaining
	 */
	TableSelectDialog.prototype.setContentHeight = function (sHeight) {
		this._oDialog.setContentHeight(sHeight);

		return this;
	};

	/**
	 * Transfers method to the inner dialog: addStyleClass
	 * @public
	 * @override
	 * @returns {sap.m.TableSelectDialog} this pointer for chaining
	 */
	TableSelectDialog.prototype.addStyleClass = function () {
		this._oDialog.addStyleClass.apply(this._oDialog, arguments);
		return this;
	};

	/**
	 * Transfers method to the inner dialog: removeStyleClass
	 * @public
	 * @override
	 * @returns {sap.m.TableSelectDialog} this pointer for chaining
	 */
	TableSelectDialog.prototype.removeStyleClass = function () {
		this._oDialog.removeStyleClass.apply(this._oDialog, arguments);
		return this;
	};

	/**
	 * Transfers method to the inner dialog: toggleStyleClass
	 * @public
	 * @override
	 * @returns {sap.m.TableSelectDialog} this pointer for chaining
	 */
	TableSelectDialog.prototype.toggleStyleClass = function () {
		this._oDialog.toggleStyleClass.apply(this._oDialog, arguments);
		return this;
	};

	/**
	 * Transfers method to the inner dialog: hasStyleClass
	 * @public
	 * @override
	 * @returns {boolean} true if the class is set, false otherwise
	 */
	TableSelectDialog.prototype.hasStyleClass = function () {
		return this._oDialog.hasStyleClass.apply(this._oDialog, arguments);
	};

	/**
	 * Transfers method to the inner dialog: getDomRef
	 * @public
	 * @override
	 * @return {Element} The Element's DOM Element sub DOM Element or null
	 */
	TableSelectDialog.prototype.getDomRef = function () {
		if (this._oDialog) {
			return this._oDialog.getDomRef.apply(this._oDialog, arguments);
		} else {
			return null;
		}
	};

	/**
	 * Sets the Clear button visible state
	 * @public
	 * @param {boolean} bVisible Value for the Clear button visible state.
	 * @returns {sap.m.TableSelectDialog} this pointer for chaining
	 */
	TableSelectDialog.prototype.setShowClearButton = function (bVisible) {
		this.setProperty("showClearButton", bVisible, true);

		if (bVisible) {
			var oCustomHeader = this._oDialog.getCustomHeader();
			oCustomHeader.addContentRight(this._getClearButton());
			this._oClearButton.setVisible(bVisible);
		} else if (this._oClearButton) {
				this._oClearButton.setVisible(bVisible);
		}

		return this;
	};

	/* =========================================================== */
	/*           begin: forward aggregation  methods to table      */
	/* =========================================================== */

	/**
	 * Sets the model for the internal table and the current control, so that both controls can be used with data binding.
	 * @overwrite
	 * @public
	 * @param {sap.ui.Model} oModel The model that holds the data for the table
	 * @param {string} sName The optional model name
	 * @returns {sap.m.TableSelectDialog} This pointer for chaining
	 */
	TableSelectDialog.prototype._setModel = TableSelectDialog.prototype.setModel;
	TableSelectDialog.prototype.setModel = function (oModel, sModelName) {
		var aArgs = Array.prototype.slice.call(arguments);

		// reset busy mode if model was changed
		this._setBusy(false);
		this._bInitBusy = false;

		// we made a request in this control, so we update the counter
		this._iTableUpdateRequested += 1;

		// attach events to listen to model updates and show/hide a busy indicator
		this._oTable.attachUpdateStarted(this._updateStarted, this);
		this._oTable.attachUpdateFinished(this._updateFinished, this);

		// pass the model to the table and also to the local control to allow binding of own properties
		this._oTable.setModel(oModel, sModelName);
		TableSelectDialog.prototype._setModel.apply(this, aArgs);

		// clear the selection label when setting the model
		this._updateSelectionIndicator();

		return this;
	};

	/**
	 * Set the binding context for the internal table AND the current control so that both controls can be used with the context.
	 * @override
	 * @public
	 * @param {sap.ui.model.Context} oContext The new context
	 * @param {string} [sModelName] The optional model name
	 * @returns {sap.m.TableSelectDialog} <code>this</code> pointer for chaining
	 */
	TableSelectDialog.prototype._setBindingContext = TableSelectDialog.prototype.setBindingContext;
	TableSelectDialog.prototype.setBindingContext = function (oContext, sModelName) {
		var args = Array.prototype.slice.call(arguments);

		// pass the model to the table and also to the local control to allow binding of own properties
		this._oTable.setBindingContext(oContext, sModelName);
		TableSelectDialog.prototype._setBindingContext.apply(this, args);

		return this;
	};

	/* =========================================================== */
	/*           end: forward aggregation  methods to table       */
	/* =========================================================== */

	/* =========================================================== */
	/*           begin: internal methods and properties            */
	/* =========================================================== */

	/**
	 * Fires the search event on the internal when dialog is opened.
	 * This function is also called whenever a search event on the "search field" is triggered
	 * @private
	 * @param {string} sValue The new Search value or undefined if called by management functions
	 * @param {boolean} bClearButtonPressed Indicates if the clear button is pressed
	 * @param {string} sEventType The search field event type that has been called (liveChange / search)
	 * @returns {sap.m.TableSelectDialog} this pointer for chaining
	 */
	TableSelectDialog.prototype._executeSearch = function (sValue, bClearButtonPressed, sEventType) {
		var oTable = this._oTable,
			oBinding = (oTable ? oTable.getBinding("items") : undefined),
			bSearchValueDifferent = (this._sSearchFieldValue !== sValue); // to prevent unwanted duplicate requests

		// fire either the Search event or the liveChange event when dialog is opened.
		// 1) when the clear icon is called then both liveChange and search events are fired but we only want to process the first one
		// 2) when a livechange has been triggered by typing we don't want the next search event to be processed (typing + enter or typing + search button)
		if (this._oDialog.isOpen() && ((bSearchValueDifferent && sEventType === "liveChange") || sEventType === "search")) {
			// set the internal value to the passed value to check if the same value has already been filtered (happens when clear is called, it fires liveChange and change events)
			this._sSearchFieldValue = sValue;
			// only set when the binding has already been executed
			// only set when the binding has already been executed
			if (oBinding) {
				// we made another request in this control, so we update the counter
				this._iTableUpdateRequested += 1;
				if (sEventType === "search") {

					// fire the search so the data can be updated externally
					this.fireSearch({
						value: sValue,
						itemsBinding: oBinding,
						clearButtonPressed: bClearButtonPressed
					});
				} else if (sEventType === "liveChange") {
					// fire the liveChange so the data can be updated externally
					this.fireLiveChange({value: sValue, itemsBinding: oBinding});
				}
			} else {
				// no binding, just fire the event for manual filtering
				if (sEventType === "search") {
					// fire the search so the data can be updated externally
					this.fireSearch({
						value: sValue,
						clearButtonPressed: bClearButtonPressed
					});
				} else if (sEventType === "liveChange") {
					// fire the liveChange so the data can be updated externally
					this.fireLiveChange({value: sValue});
				}
			}
		}

		return this;
	};

	/**
	 * Shows/hides a local busy indicator, hides/shows the list based on the parameter flag and enables/disables the search field.
	 * @private
	 * @param {boolean} bBusy flag (true = show, false = hide)
	 */
	TableSelectDialog.prototype._setBusy = function (bBusy) {
		if (this._iTableUpdateRequested) { // check if the event was caused by our control
			if (bBusy) {
				this._oSearchField.setEnabled(false);
				this._oTable.addStyleClass('sapMSelectDialogListHide');
				this._oBusyIndicator.$().css('display', 'inline-block');
			} else {
				this._oSearchField.setEnabled(true);
				this._oTable.removeStyleClass('sapMSelectDialogListHide');
				this._oBusyIndicator.$().css('display', 'none');
			}
		}
	};

	/**
	 * Shows a busy indicator and hides searchField and list in the dialog.
	 * Event function that is called when the model sends a request to update the data.
	 * @private
	 * @param {jQuery.Event} oEvent The event object
	 */
	TableSelectDialog.prototype._updateStarted = function (oEvent) {
		if (this.getModel() && this.getModel() instanceof sap.ui.model.odata.ODataModel) {
			if (this._oDialog.isOpen() && this._iTableUpdateRequested) {
				// only set busy mode when we have an OData model
				this._setBusy(true);
			} else {
				this._bInitBusy = true;
			}
		}
	};

	/**
	 * Hides the busy indicator and shows searchField and list in the dialog.
	 * Event function that is called when the model request is finished.
	 * @private
	 * @param {jQuery.Event} oEvent The event object
	 */
	TableSelectDialog.prototype._updateFinished = function (oEvent) {
		this._updateSelectionIndicator();
		// only reset busy mode when we have an OData model
		if (this.getModel() && this.getModel() instanceof sap.ui.model.odata.ODataModel) {
			this._setBusy(false);
			this._bInitBusy = false;
		}

		if (Device.system.desktop) {

			if (this._oTable.getItems()[0]) {
				this._oDialog.setInitialFocus(this._oTable.getItems()[0]);
			} else {
				this._oDialog.setInitialFocus(this._oSearchField);
			}

			// set initial focus manually after all items are visible
			if (this._bFirstRequest) {
				var oFocusControl = this._oTable.getItems()[0];
				if (!oFocusControl) {
				oFocusControl = this._oSearchField;
				}

				if (oFocusControl.getFocusDomRef()) {
					oFocusControl.getFocusDomRef().focus();
				}
			}
		}

	this._bFirstRequest = false;

	// we received a request (from this or from another control) so set the counter to 0
	this._iTableUpdateRequested = 0;
	};

	/**
	 * Lazy load the OK button if needed for MultiSelect mode.
	 * @private
	 * @return {sap.m.Button} The button
	 */
	TableSelectDialog.prototype._getOkButton = function () {
		var that = this,
			fnOKAfterClose = null;

		fnOKAfterClose = function () {
				that._oSelectedItem = that._oTable.getSelectedItem();
				that._aSelectedItems = that._oTable.getSelectedItems();

				that._oDialog.detachAfterClose(fnOKAfterClose);
				that._fireConfirmAndUpdateSelection();
			};

		if (!this._oOkButton) {
			this._oOkButton = new Button(this.getId() + "-ok", {
				type: ButtonType.Emphasized,
				text: this.getConfirmButtonText() || this._oRb.getText("SELECT_CONFIRM_BUTTON"),
				press: function () {
					// attach the reset function to afterClose to hide the dialog changes from the end user
					that._oDialog.attachAfterClose(fnOKAfterClose);
					that._oDialog.close();
				}
			});
		}
		return this._oOkButton;
	};

	/**
	 * Lazy load the Cancel button
	 * @private
	 * @return {sap.m.Button} The button
	 */
	TableSelectDialog.prototype._getCancelButton = function () {
		var that = this;

		if (!this._oCancelButton) {
			this._oCancelButton = new Button(this.getId() + "-cancel", {
				text: this._oRb.getText("MSGBOX_CANCEL"),
				press: function () {
					that._onCancel();
				}
			});
		}
		return this._oCancelButton;
	};

	/**
	* Lazy load the Clear button
	* @private
	* @return {sap.m.Button} The button
	*/
	TableSelectDialog.prototype._getClearButton = function () {

		if (!this._oClearButton) {
			this._oClearButton = new Button(this.getId() + "-clear", {
				text: this._oRb.getText("TABLESELECTDIALOG_CLEARBUTTON"),
				press: function() {
					this._removeSelection();
					this._updateSelectionIndicator();
					//when clear is executed focus should stay in sap.mTableSelectDialog
					this._oDialog.focus();
				}.bind(this)
			});
		}

		return this._oClearButton;
	};

	/**
	 * Internal event handler for the Cancel button and ESC key
	 * @private
	 */
	TableSelectDialog.prototype._onCancel = function (oEvent) {
		var that = this,
			fnAfterClose = null;

		fnAfterClose = function () {
			// reset internal selection values
			that._oSelectedItem = null;
			that._aSelectedItems = [];
			that._sSearchFieldValue = null;

			// detach this function
			that._oDialog.detachAfterClose(fnAfterClose);

			// fire cancel event
			that.fireCancel();
		};
		// reset selection
		// before was part of the fnAfterClose callback but apparently actions were executed on
		// a table that does not exist so moving here as fix
		that._resetSelection();

		// attach the reset function to afterClose to hide the dialog changes from the end user
		this._oDialog.attachAfterClose(fnAfterClose);
		this._oDialog.close();
	};

	/**
	 * Updates the selection indicator bar
	 * @private
	 */
	TableSelectDialog.prototype._updateSelectionIndicator = function () {
		var iSelectedContexts = this._oTable.getSelectedContextPaths(true).length,
			oInfoBar = this._oTable.getInfoToolbar();

		if (this.getShowClearButton() && this._oClearButton) {
			this._oClearButton.setEnabled(iSelectedContexts > 0);
		}
		// update the selection label
		oInfoBar.setVisible(!!iSelectedContexts);
		oInfoBar.getContent()[0].setText(this._oRb.getText("TABLESELECTDIALOG_SELECTEDITEMS", [iSelectedContexts]));
	};

	/**
	 * Fires the confirm event and updates the selection of the table.
	 * The function is called on pressing OK and on Close in single select mode
	 * @private
	 */
	TableSelectDialog.prototype._fireConfirmAndUpdateSelection = function () {
		// fire confirm event with current selection
		var mParams = {
			selectedItem: this._oSelectedItem,
			selectedItems: this._aSelectedItems
		};
		// retrieve the value for 'selectedContexts' only lazily as it might fail for some models
		Object.defineProperty(mParams, "selectedContexts", {
			get: this._oTable.getSelectedContexts.bind(this._oTable, true)
		});

		this.fireConfirm(mParams);
		this._updateSelection();
	};

	/**
	 * Removes/keeps the table selection based on property "rememberSelection"
	 * @private
	 */
	TableSelectDialog.prototype._updateSelection = function () {
		// cleanup old selection on Close to allow reuse of dialog
		// due to the delayed call (dialog onAfterClose) the control could be already destroyed
		if (!this.getRememberSelections() && !this.bIsDestroyed) {
			this._removeSelection();
		}
	};

	/**
	 * Removes selection from <code> sap.m.TableSelectDialog</code>
	 * @private
	 */
	TableSelectDialog.prototype._removeSelection = function () {
			this._oTable.removeSelections(true);
			delete this._oSelectedItem;
			delete this._aSelectedItems;
	};

	/**
	 * Resets the selection to the items that were selected when the dialog was opened
	 * @private
	 */
	TableSelectDialog.prototype._resetSelection = function () {
		var i = 0;

		// due to the delayed call (dialog onAfterClose) the control could be already destroyed
		if (!this.bIsDestroyed) {
			var oBindings = this._oTable.getBinding("items");
			if (oBindings && oBindings.aFilters && oBindings.aFilters.length) {
				oBindings.filter([]);
			}
			this._oTable.removeSelections();
			for (; i < this._aInitiallySelectedItems.length; i++) {
				this._oTable.setSelectedItem(this._aInitiallySelectedItems[i]);
			}
		}
	};

	/* =========================================================== */
	/*           end: internal methods                             */
	/* =========================================================== */

	// enrich the control functionality with TitleAlignmentMixin
	TitleAlignmentMixin.mixInto(TableSelectDialog.prototype);

	return TableSelectDialog;

});
