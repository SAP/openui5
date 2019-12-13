/*!
 * ${copyright}
 */

// Provides control sap.m.SelectDialog.
sap.ui.define([
	'./Button',
	'./Dialog',
	'./List',
	'./SearchField',
	'./library',
	'./TitleAlignmentMixin',
	'sap/ui/core/Control',
	'sap/ui/Device',
	'sap/ui/base/ManagedObject',
	'sap/m/Toolbar',
	'sap/m/Label',
	'sap/m/BusyIndicator',
	'sap/m/Bar',
	'sap/m/Title',
	'sap/ui/core/theming/Parameters',
	'./SelectDialogRenderer',
	"sap/base/Log"
],
function(
	Button,
	Dialog,
	List,
	SearchField,
	library,
	TitleAlignmentMixin,
	Control,
	Device,
	ManagedObject,
	Toolbar,
	Label,
	BusyIndicator,
	Bar,
	Title,
	Parameters,
	SelectDialogRenderer,
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
	 * Constructor for a new SelectDialog.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * A dialog that enables users to select one or more items from a comprehensive list.
	 * @class
	 * <h3>Overview</h3>
	 * A SelectDialog is a dialog containing a list, search functionality to filter it and a confirmation/cancel button.
	 * The list used in the dialog is a growing list and can be filled with any kind of list item.
	 * <h3>Structure</h3>
	 * <h4>Dialog structure</h4>
	 * The select dialog has the following components:
	 * <ul>
	 * <li>Header - title of the dialog</li>
	 * <li>Search field - input field to enter search terms</li>
	 * <li>Info toolbar (only in multi-select) - displays the number of currently selected items</li>
	 * <li>Content - {@link sap.m.StandardListItem  standard list items}, {@link sap.m.DisplayListItem
	 * display list items} or {@link sap.m.FeedListItem feed list items}</li>
	 * <li>Button toolbar - for confirmation/cancellation buttons </li>
	 * </ul>
	 * <h4>List structure & selection</h4>
	 * <ul>
	 * <li> The search field triggers the events <code>search</code> and <code>liveChange</code>
	 * where a filter function can be applied to the list binding. </li>
	 * <li> The growing functionality of the list does not support two-way Binding, so if you use this control with a JSON model
	 * make sure the binding mode is set to <code>OneWay</code> and that you update the selection model manually with
	 * the items passed in the <code>confirm</code> event. </li>
	 * <li> In the multi-select mode of the select dialog, checkboxes are provided for choosing multiple entries. </li>
	 * <li> You can set <code>rememberSelections</code> to true to store the current selection and load this state
	 * when the dialog is opened again. </li>
	 * <li> When cancelling the selection, the event <code>change</code> will be fired and the selection is restored
	 * to the state when the dialog was opened. </li>
	 * <li>The SelectDialog is usually displayed at the center of the screen. Its size and position can be changed by the user.
	 * To enable this you need to set the <code>resizable</code> and <code>draggable</code> properties. Both properties are available only in desktop mode.</li>
	 * </ul>
	 * <h3>Usage</h3>
	 * <h4>When to use:</h4>
	 * <ul>
	 * <li>You need to select one or more entries from a comprehensive list that contains multiple attributes or values. </li>
	 * </ul>
	 * <h4>When not to use:</h4>
	 * <ul>
	 * <li> You need to pick one item from a predefined set of options. Use {@link sap.m.Select select}
	 * or {@link sap.m.ComboBox combobox} instead. </li>
	 * <li> You need to select a range of item. Use {@link sap.ui.comp.valuehelpdialog.ValueHelpDialog value help dialog} instead. </li>
	 * <li> You need to be able to add your own values to an existing list. Use a {@link sap.m.Dialog dialog} instead. </li>
	 * </ul>
	 * <h4>Note:</h4>
	 * The property <code>growing</code> determines the progressive loading. If it's set to true (the default value), the
	 * <code>selected count</code> in info bar and search  will work only for the currently loaded items.
	 * To make sure that all items in the list are loaded at once and the above feature works properly,
	 * we recommend setting the <code>growing</code> property to false.
	 * <h3>Responsive Behavior</h3>
	 * <ul>
	 * <li> On phones, the select dialog takes up the whole screen. </li>
	 * <li> On desktop and tablet devices, the select dialog appears as a popover. </li>
	 * </ul>
	 * When using the <code>sap.m.SelectDialog</code> in SAP Quartz themes, the breakpoints and layout paddings could be determined by the dialog's width. To enable this concept and add responsive paddings to an element of the control, you have to add the following classes depending on your use case: <code>sapUiResponsivePadding--header</code>, <code>sapUiResponsivePadding--subHeader</code>, <code>sapUiResponsivePadding--content</code>, <code>sapUiResponsivePadding--footer</code>.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.SelectDialog
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/select-dialog/ Select Dialog}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SelectDialog = Control.extend("sap.m.SelectDialog", /** @lends sap.m.SelectDialog.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Determines the title text that appears in the dialog header
			 */
			title : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * Determines the text shown when the list has no data
			 */
			noDataText : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * Determines if the user can select several options from the list
			 */
			multiSelect : {type : "boolean", group : "Dimension", defaultValue : false},

			/**
			 * Determines the number of items initially displayed in the list. Also defines the number of items to be requested from the model for each grow.
			 * <b>Note:</b> This property could take affect only be used if the property <code>growing</code> is set to <code>true</code>.
			 */
			growingThreshold : {type : "int", group : "Misc", defaultValue : null},

			/**
			 * If set to <code>true</code>, enables the growing feature of the control to load more items by requesting from the bound model (progressive loading).
			 * <b>Note:</b> This feature only works when an <code>items</code> aggregation is bound.
			 * <b>Note:</b> Growing property, must not be used together with two-way binding.
			 * @since 1.56
			 */
			growing : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Determines the content width of the inner dialog. For more information, see the dialog documentation.
			 * @since 1.18
			 */
			contentWidth : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * This flag controls whether the dialog clears the selection after the confirm event has been fired. If the dialog needs to be opened multiple times in the same context to allow for corrections of previous user inputs, set this flag to "true".
			 *
			 * <b>Note:</b> The sap.m.SelectDialog uses {@link sap.m.ListBase#rememberSelections this} property of the ListBase and therefore its limitations also apply here.
			 * @since 1.18
			 */
			rememberSelections : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Determines the content height of the inner dialog. For more information, see the dialog documentation.
			 */
			contentHeight : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * This flag controls whether the Clear button is shown. When set to <code>true</code>, it provides a way to clear selection mode in Select Dialog.
			 * We recommended enabling of the Clear button in the following cases, where a mechanism to clear the value is needed:
			 * In case of single selection mode(default mode) for Select Dialog and <code>rememberSelections</code> is set to <code>true</code>. Clear button needs to be enabled in order to allow users to clear the selection.
			 * In case of using <code>sap.m.Input</code> with <code>valueHelpOnly</code> set to <code>true</code>, the Clear button could be used for clearing selection.
			 * In case the application stores a value and uses only Select Dialog to edit/maintain it.
			 * <b>Note:</b>When used with oData, only the loaded selections will be cleared.
			 * @since 1.58
			 */
			showClearButton : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Overwrites the default text for the confirmation button.
			 * @since 1.68
			 */

			 confirmButtonText: {type : "string", group : "Appearance"},
			/**
			 * When set to <code>true</code>, the SelectDialog is draggable by its header. The default value is <code>false</code>. <b>Note</b>: The SelectDialog can be draggable only in desktop mode.
			 * @since 1.70
			 */

			 draggable: {type: "boolean", group: "Behavior", defaultValue: false},
			/**
			 * When set to <code>true</code>, the SelectDialog will have a resize handler in its bottom right corner. The default value is <code>false</code>. <b>Note</b>: The SelectDialog can be resizable only in desktop mode.
			 * @since 1.70
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
			 * The items of the list shown in the search dialog. It is recommended to use a StandardListItem for the dialog but other combinations are also possible.
			 */
			items : {type : "sap.m.ListItemBase", multiple : true, singularName : "item", forwarding: {idSuffix: "-list", aggregation: "items", forwardBinding: true}},

			/**
			 * The internal dialog that will be shown when method open is called
			 */
			_dialog : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"}
		},
		events : {

			/**
			 * This event will be fired when the dialog is confirmed by selecting an item in single selection mode or by pressing the confirmation button in multi selection mode . The items being selected are returned as event parameters.
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
					 * Returns the binding contexts of the selected items including the non-visible items. See {@link sap.m.ListBase#getSelectedContexts getSelectedContexts} of <code>sap.m.ListBase</code>.
					 * NOTE: In contrast to the parameter "selectedItems", this parameter will also include the selected but NOT visible items (e.g. due to list filtering). An empty array will be set for this parameter if no data binding is used.
					 * NOTE: When the list binding is pre-filtered and there are items in the selection that are not visible upon opening the dialog, these contexts are not loaded. Therefore, these items will not be included in the selectedContexts array unless they are displayed at least once.
					 */
					selectedContexts : {type : "object[]"}
				}
			},

			/**
			 * This event will be fired when the search button has been clicked on the searchfield on the visual control
			 */
			search : {
				parameters : {

					/**
					 * The value entered in the search
					 */
					value : {type : "string"},

					/**
					 * The Items binding of the Select Dialog for search purposes. It will only be available if the items aggregation is bound to a model.
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
			 * This event will be fired when the value of the search field is changed by a user - e.g. at each key press
			 */
			liveChange : {
				parameters : {

					/**
					 * The value to search for, which can change at any keypress
					 */
					value : {type : "string"},

					/**
					 * The Items binding of the Select Dialog. It will only be available if the items aggregation is bound to a model.
					 */
					itemsBinding : {type : "any"}
				}
			},

			/**
			 * This event will be fired when the cancel button is clicked or ESC key is pressed
			 */
			cancel : {}
		}
	}});


	/* =========================================================== */
	/*           begin: API methods                                */
	/* =========================================================== */

	/**
	 * Initializes the control
	 * @private
	 */
	SelectDialog.prototype.init = function () {
		var that = this,
			iLiveChangeTimer = 0,
			fnDialogEscape = null;

		this._bAppendedToUIArea = false;
		this._bInitBusy = false;
		this._bFirstRender = true;
		this._bAfterCloseAttached = false;
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		// store a reference to the list for binding management
		this._oList = new List(this.getId() + "-list", {
			growing: that.getGrowing(),
			growingScrollToLoad: that.getGrowing(),
			mode: ListMode.SingleSelectMaster,
			sticky: [library.Sticky.InfoToolbar],
			infoToolbar: new Toolbar({
				visible: false,
				active: false,
				content: [
					new Label({
						text: this._oRb.getText("TABLESELECTDIALOG_SELECTEDITEMS", [0])
					})
				]
			}),
			selectionChange: this._selectionChange.bind(this)
		});

		this._oList.getInfoToolbar().addEventDelegate({
			onAfterRendering: function () {
				that._oList.getInfoToolbar().$().attr('aria-live', 'polite');
			}
		});

		this._list = this._oList; // for downward compatibility

		// attach events to listen to model updates and show/hide a busy indicator
		this._oList.attachUpdateStarted(this._updateStarted, this);
		this._oList.attachUpdateFinished(this._updateFinished, this);

		// store a reference to the busyIndicator to display when data is currently loaded by a service
		this._oBusyIndicator = new BusyIndicator(this.getId() + "-busyIndicator").addStyleClass("sapMSelectDialogBusyIndicator", true);

		// store a reference to the searchField for filtering
		this._oSearchField = new SearchField(this.getId() + "-searchField", {
			width: "100%",
			liveChange: function (oEvent) {
				var sValue = oEvent.getSource().getValue(),
				iDelay = (sValue ? 300 : 0); // no delay if value is empty

				// execute search after user stops typing for 300ms
				clearTimeout(iLiveChangeTimer);
				if (iDelay) {
					iLiveChangeTimer = setTimeout(function () {
						that._executeSearch(sValue, false, "liveChange");
					}, iDelay);
				} else {
					that._executeSearch(sValue, false, "liveChange");
				}
			},
			// execute the standard search
			search: function (oEvent) {
				var sValue = oEvent.getSource().getValue(),
					bClearButtonPressed = oEvent.getParameters().clearButtonPressed;

				that._executeSearch(sValue, bClearButtonPressed, "search");
			}
		});
		this._searchField = this._oSearchField; // for downward compatibility

		// store a reference to the subheader for hiding it when data loads
		this._oSubHeader = new Bar(this.getId() + "-subHeader", {
			contentMiddle: [
				this._oSearchField
			]
		});

		//store a reference to the dialog header
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
			content: [this._oBusyIndicator, this._oList],
			leftButton: this._getCancelButton(),
			initialFocus: (Device.system.desktop ? this._oSearchField : null),
			draggable: this.getDraggable() && Device.system.desktop,
			resizable: this.getResizable() && Device.system.desktop
		}).addStyleClass("sapMSelectDialog", true);
		// for downward compatibility reasons
		this._dialog = this._oDialog;
		this.setAggregation("_dialog", this._oDialog);

		//CSN# 3863876/2013: ESC key should also cancel dialog, not only close it
		fnDialogEscape = this._oDialog.onsapescape;
		this._oDialog.onsapescape = function (oEvent) {
			// call original escape function of the dialog
			if (fnDialogEscape) {
				fnDialogEscape.call(that._oDialog, oEvent);
			}
			// execute cancel action
			that._onCancel();
		};

		// internally set top and bottom margin of the dialog to 4rem respectively
		// CSN# 333642/2014: in base theme the parameter sapUiFontSize is "medium", implement a fallback
		this._oDialog._iVMargin = 8 * (parseInt(Parameters.get("sapUiFontSize")) || 16); // 128

		// helper variables for search update behaviour
		this._sSearchFieldValue = "";

		// flags to control the busy indicator behaviour because the growing list will always show the no data text when updating
		this._bFirstRequest = true; // to only show the busy indicator for the first request when the dialog has been openend
		this._bLiveChange = false; // to check if the triggered event is LiveChange
		this._iListUpdateRequested = 0; // to only show the busy indicator when we initiated the change
	};

	/**
	* Sets the growing  to the internal list
	* @public
	* @param {boolean} bValue Value for the list's growing.
	* @returns {sap.m.SelectDialog} <code>this</code> pointer for chaining
	*/
	SelectDialog.prototype.setGrowing = function (bValue) {
		this._oList.setGrowing(bValue);
		this._oList.setGrowingScrollToLoad(bValue);
		this.setProperty("growing", bValue, true);

		return this;
	};

	/**
	 * Sets the draggable property.
	 * @public
	 * @param {boolean} bValue Value for the draggable property
	 * @returns {sap.m.SelectDialog} <code>this</code> pointer for chaining
	 */
	SelectDialog.prototype.setDraggable = function (bValue) {
		this._setInteractionProperty(bValue, "draggable", this._oDialog.setDraggable);

		return this;
	};

	/**
	 * Sets the resizable property.
	 * @public
	 * @param {boolean} bValue Value for the resizable property
	 * @returns {sap.m.SelectDialog} <code>this</code> pointer for chaining
	 */
	SelectDialog.prototype.setResizable = function (bValue) {
		this._setInteractionProperty(bValue, "resizable", this._oDialog.setResizable);

		return this;
	};

	/**
	 * @private
	 * @param {boolean} bValue Value for the property
	 * @param {string} sPropertyType Property type
	 * @param {function} fnCallback Callback function
	 */
	SelectDialog.prototype._setInteractionProperty = function(bValue, sPropertyType, fnCallback) {
		this.setProperty(sPropertyType, bValue, true);

		if (!Device.system.desktop && bValue) {
			Log.warning(sPropertyType + " property works only on desktop devices!");
			return;
		}

		if (Device.system.desktop && this._oDialog) {
			fnCallback.call(this._oDialog, bValue);
		}
	};

	SelectDialog.prototype.setBusy = function () {
		// Overwrite setBusy as it should be handled in the "real" dialog
		this._oDialog.setBusy.apply(this._oDialog, arguments);

		// Should return "this" (sap.m.SelectDialog)
		return this;
	};

	SelectDialog.prototype.getBusy = function () {
		// Overwrite getBusy as it should be handled in the "real" dialog
		return this._oDialog.getBusy.apply(this._oDialog, arguments);
	};

	/**
	 * Sets the busyIndicatorDelay value to the internal list
	 * @public
	 * @param {int} iValue Value for the busyIndicatorDelay.
	 * @returns {sap.m.SelectDialog} this pointer for chaining
	 */
	SelectDialog.prototype.setBusyIndicatorDelay = function (iValue) {
		this._oList.setBusyIndicatorDelay(iValue);
		this._oDialog.setBusyIndicatorDelay(iValue);
		this.setProperty("busyIndicatorDelay", iValue, true);

		return this;
	};

	/**
	 * Destroys the control
	 * @private
	 */
	SelectDialog.prototype.exit = function () {
		// internal variables
		this._oList = null;
		this._oSearchField = null;
		this._oSubHeader = null;
		this._oClearButton = null;
		this._oBusyIndicator = null;
		this._sSearchFieldValue = null;
		this._iListUpdateRequested = 0;
		this._bFirstRequest = false;
		this._bInitBusy = false;
		this._bFirstRender = false;
		this._bFirstRequest = false;

		// sap.ui.core.Popup removes its content on close()/destroy() automatically from the static UIArea,
		// but only if it added it there itself. As we did that, we have to remove it also on our own
		if ( this._bAppendedToUIArea ) {
			var oStatic = sap.ui.getCore().getStaticAreaRef();
			oStatic = sap.ui.getCore().getUIArea(oStatic);
			oStatic.removeContent(this, true);
		}

		// controls not managed in aggregations
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

		// compatibility
		this._list = null;
		this._searchField = null;
		this._dialog = null;
	};

	/**
	* Is called after renderer is finished to show the busy state
	* @override
	* @protected
	* @returns {sap.m.SelectDialog} <code>this</code> pointer for chaining
	*/
	SelectDialog.prototype.onAfterRendering = function () {
		if (this._bInitBusy && this._bFirstRender) {
			this._setBusy(true);
			this._bInitBusy = false;
		}

		return this;
	};

	/**
	* Invalidates the dialog instead of this control (we don't have a renderer)
	* @override
	* @protected
	* @returns {sap.m.SelectDialog} <code>this</code> pointer for chaining
	*/
	SelectDialog.prototype.invalidate = function () {
		// CSN #80686/2014: only invalidate inner dialog if call does not come from inside
		if (this._oDialog && (!arguments[0] || arguments[0] && arguments[0].getId() !== this.getId() + "-dialog")) {
			this._oDialog.invalidate(arguments);
		} else {
			Control.prototype.invalidate.apply(this, arguments);
		}

		return this;
	};

	/**
	 * Opens the internal dialog with a searchfield and a list.
	 *
	 * @param {string} sSearchValue  A value for the search can be passed to match with the filter applied to the list binding.
	 * @returns {sap.m.SelectDialog} <code>this</code> pointer for chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	SelectDialog.prototype.open = function (sSearchValue) {
		// CSN #80686/2014: only invalidate inner dialog if call does not come from inside
		// Important: do not rely on the ui area fix, it will be removed with a later version of UI5
		// use fragments instead or take care of proper parent-child dependencies
		if ((!this.getParent() || !this.getUIArea()) && !this._bAppendedToUIArea) {
			var oStatic = sap.ui.getCore().getStaticAreaRef();
			oStatic = sap.ui.getCore().getUIArea(oStatic);
			oStatic.addContent(this, true);
			this._bAppendedToUIArea = true;
		}

		// reset internal variables
		this._bFirstRequest = true;

		// set the search value
		this._oSearchField.setValue(sSearchValue);

		// open the dialog
		this._oDialog.open();

		// open dialog with busy state if a list update is still in progress
		if (this._bInitBusy) {
			this._setBusy(true);
		}

		// refresh the selection indicator to be in sync with the model
		this._updateSelectionIndicator();

		// store the current selection for the cancel event
		this._aInitiallySelectedContextPaths = this._oList.getSelectedContextPaths();

		// return Dialog for chaining purposes
		return this;
	};

	/**
	* Sets the growing threshold to the internal list
	* @public
	* @param {int} iValue Value for the list's growing threshold.
	* @returns {sap.m.SelectDialog} <code>this</code> pointer for chaining
	*/
	SelectDialog.prototype.setGrowingThreshold = function (iValue) {
		this._oList.setGrowingThreshold(iValue);
		this.setProperty("growingThreshold", iValue, true);

		return this;
	};

	/**
	 * Enable/Disable multi selection mode.
	 * @override
	 * @public
	 * @param {boolean} bMulti Flag for multi selection mode
	 * @returns {sap.m.SelectDialog} <code>this</code> pointer for chaining
	 */
	SelectDialog.prototype.setMultiSelect = function (bMulti) {
		this.setProperty("multiSelect", bMulti, true);
		if (bMulti) {
			this._oList.setMode(ListMode.MultiSelect);
			this._oList.setIncludeItemInSelection(true);
			this._oDialog.setEndButton(this._getCancelButton());
			this._oDialog.setBeginButton(this._getOkButton());
		} else {
			this._oList.setMode(ListMode.SingleSelectMaster);
			this._oDialog.setEndButton(this._getCancelButton());
			this._oDialog.destroyBeginButton();
			delete this._oOkButton;
		}

		return this;
	};

	/**
	 * Set the title of the internal dialog
	 * @override
	 * @public
	 * @param {string} sTitle The title text for the dialog
	 * @returns {sap.m.SelectDialog} <code>this</code> pointer for chaining
	 */
	SelectDialog.prototype.setTitle = function (sTitle) {
		this.setProperty("title", sTitle, true);
		this._oDialog.getCustomHeader().getAggregation("contentMiddle")[0].setText(sTitle);

		return this;
	};

	/**
	 * Sets the text of the confirmation button.
	 * @override
	 * @public
	 * @param {string} sText The text for the confirm button
	 * @returns {sap.m.SelectDialog} <code>this</code> pointer for chaining
	 */
	SelectDialog.prototype.setConfirmButtonText = function (sText) {
		this.setProperty("confirmButtonText", sText, true);
		this._oOkButton && this._oOkButton.setText(sText || this._oRb.getText("SELECT_CONFIRM_BUTTON"));

		return this;
	};

	/**
	 * Set the internal List's no data text property
	 * @override
	 * @public
	 * @param {string} sNoDataText The no data text for the list
	 * @returns {sap.m.SelectDialog} <code>this</code> pointer for chaining
	 */
	SelectDialog.prototype.setNoDataText = function (sNoDataText) {
		this._oList.setNoDataText(sNoDataText);

		return this;
	};

	/**
	 * Get the internal List's no data text property
	 * @override
	 * @public
	 * @returns {string} the current no data text
	 */
	SelectDialog.prototype.getNoDataText = function () {
		return this._oList.getNoDataText();
	};

	/**
	 * Get the internal Dialog's contentWidth property {@link sap.m.Dialog}
	 * @override
	 * @public
	 * @returns {sap.ui.core.CSSSize} sWidth The content width of the internal dialog
	 */
	SelectDialog.prototype.getContentWidth = function () {
		return this._oDialog.getContentWidth();
	};

	/**
	 * Set the internal Dialog's contentWidth property {@link sap.m.Dialog}
	 * @param {sap.ui.core.CSSSize} sWidth The new content width value for the dialog
	 * @public
	 * @override
	 * @returns {sap.m.SelectDialog} <code>this</code>s pointer for chaining
	 */
	SelectDialog.prototype.setContentWidth = function (sWidth) {
		this._oDialog.setContentWidth(sWidth);

		return this;
	};

	/**
	 * Get the internal Dialog's contentHeight property {@link sap.m.Dialog}
	 * @override
	 * @public
	 * @returns {sap.ui.core.CSSSize} sHeight The content width of the internal dialog
	 */
	SelectDialog.prototype.getContentHeight = function () {
		return this._oDialog.getContentHeight();
	};

	/**
	 * Sets the Clear button visible state
	 * @public
	 * @param {boolean} bVisible Value for the Clear button visible state.
	 * @returns {sap.m.SelectDialog} <code>this</code> pointer for chaining
	 */
	SelectDialog.prototype.setShowClearButton = function (bVisible) {
		this.setProperty("showClearButton", bVisible, true);

		if (bVisible) {
			var oCustomHeader = this._oDialog.getCustomHeader();
			oCustomHeader.addContentRight(this._getClearButton());
		}
		if (this._oClearButton) {
			this._oClearButton.setVisible(bVisible);
		}
		return this;
	};

	/**
	 * Set the internal Dialog's contentHeight property {@link sap.m.Dialog}
	 * @param {sap.ui.core.CSSSize} sHeight The new content width value for the dialog
	 * @public
	 * @override
	 * @returns {sap.m.SelectDialog} <code>this</code> pointer for chaining
	 */
	SelectDialog.prototype.setContentHeight = function (sHeight) {
		this._oDialog.setContentHeight(sHeight);

		return this;
	};


	/**
	 * Forward method to the inner dialog: addStyleClass
	 * @public
	 * @override
	 * @returns {sap.m.SelectDialog} <code>this</code> pointer for chaining
	 */
	SelectDialog.prototype.addStyleClass = function () {
		this._oDialog.addStyleClass.apply(this._oDialog, arguments);
		return this;
	};

	/**
	 * Forward method to the inner dialog: removeStyleClass
	 * @public
	 * @override
	 * @returns {sap.m.SelectDialog} <code>this</code> pointer for chaining
	 */
	SelectDialog.prototype.removeStyleClass = function () {
		this._oDialog.removeStyleClass.apply(this._oDialog, arguments);
		return this;
	};

	/**
	 * Forward method to the inner dialog: toggleStyleClass
	 * @public
	 * @override
	 * @returns {sap.m.SelectDialog} <code>this</code> pointer for chaining
	 */
	SelectDialog.prototype.toggleStyleClass = function () {
		this._oDialog.toggleStyleClass.apply(this._oDialog, arguments);
		return this;
	};

	/**
	 * Forward method to the inner dialog: hasStyleClass
	 * @public
	 * @override
	 * @returns {boolean} true if the class is set, false otherwise
	 */
	SelectDialog.prototype.hasStyleClass = function () {
		return this._oDialog.hasStyleClass.apply(this._oDialog, arguments);
	};

	/**
	 * Forward method to the inner dialog: getDomRef
	 * @public
	 * @override
	 * @return {Element} The Element's DOM Element sub DOM Element or null
	 */
	SelectDialog.prototype.getDomRef = function () {
		if (this._oDialog) {
			return this._oDialog.getDomRef.apply(this._oDialog, arguments);
		} else {
			return null;
		}
	};

	/**
	 * Clears the selections in the <code>sap.m.SelectDialog</code> and its internally used <code>sap.m.List</code> control.
	 *
	 * Use this method whenever the application logic expects changes in the model providing data for
	 * the SelectDialog that will modify the position of the items, or will change the set with completely new items.
	 *
	 * @public
	 * @since 1.68
	 * @returns {sap.m.SelectDialog} <code>this</code> to allow method chaining.
	 */
	SelectDialog.prototype.clearSelection = function () {
		this._removeSelection();
		this._updateSelectionIndicator();
		this._oDialog.focus();

		return this;
	};

	/* =========================================================== */
	/*           begin: forward aggregation  methods to List       */
	/* =========================================================== */

	/**
	 * Set the model for the internal list AND the current control so that
	 * both controls can be used with data binding
	 * @override
	 * @public
	 * @param {sap.ui.Model} oModel the model that holds the data for the list
	 * @param {string} sModelName the optional model name
	 * @returns {sap.m.SelectDialog} <code>this</code> pointer for chaining
	 */
	SelectDialog.prototype._setModel = SelectDialog.prototype.setModel;
	SelectDialog.prototype.setModel = function (oModel, sModelName) {
		var aArgs = Array.prototype.slice.call(arguments);

		// reset busy mode if model was changed
		this._setBusy(false);
		this._bInitBusy = false;

		// we made a request in this control, so we update the counter
		this._iListUpdateRequested += 1;

		// pass the model to the list and also to the local control to allow binding of own properties
		this._oList.setModel(oModel, sModelName);
		SelectDialog.prototype._setModel.apply(this, aArgs);

		// clear the selection label when setting the model
		this._updateSelectionIndicator();

		return this;
	};

	/**
	 * Set the binding context for the internal list AND the current control so that
	 * both controls can be used with the context
	 * @override
	 * @public
	 * @param {sap.ui.model.Context} oContext The new context
	 * @param {string} sModelName The optional model name
	 * @returns {sap.m.SelectDialog} <code>this</code> pointer for chaining
	 */

	SelectDialog.prototype._setBindingContext = SelectDialog.prototype.setBindingContext;
	SelectDialog.prototype.setBindingContext = function (oContext, sModelName) {
		var args = Array.prototype.slice.call(arguments);

		// pass the model to the list and also to the local control to allow binding of own properties
		this._oList.setBindingContext(oContext, sModelName);
		SelectDialog.prototype._setBindingContext.apply(this, args);

		return this;
	};

	/* =========================================================== */
	/*           end: forward aggregation  methods to List       */
	/* =========================================================== */

	/* =========================================================== */
	/*           begin: internal methods and properties            */
	/* =========================================================== */

	/**
	 * Fires the search event. This function is called whenever a search related parameter or the value in the search field is changed
	 * @private
	 * @param {string} sValue The new filter value or undefined if called by management functions
	 * @param {boolean} bClearButtonPressed Indicates if the clear button is pressed
	 * @param {string} sEventType The search field event type that has been called (liveChange / search)
	 * @returns {sap.m.SelectDialog} <code>this</code> pointer for chaining
	 */
	SelectDialog.prototype._executeSearch = function (sValue, bClearButtonPressed, sEventType) {

		var oList = this._oList,
			oBinding = (oList ? oList.getBinding("items") : undefined),
			bSearchValueDifferent = (this._sSearchFieldValue !== sValue); // to prevent unwanted duplicate requests

		// BCP #1472004019/2015: focus after liveChange event is not changed
		if (sEventType === "liveChange") {
			this._bLiveChange = true;
		}

		// fire either the Search event or the liveChange event when dialog is opened.
		// 1) when the clear icon is called then both liveChange and search events are fired but we only want to process the first one
		// 2) when a livechange has been triggered by typing we don't want the next search event to be processed (typing + enter or typing + search button)
		if (this._oDialog.isOpen() && ((bSearchValueDifferent && sEventType === "liveChange") || sEventType === "search")) {
			// set the internal value to the passed value to check if the same value has already been filtered (happens when clear is called, it fires liveChange and change events)
			this._sSearchFieldValue = sValue;

			// only set when the binding has already been executed
			if (oBinding) {
				// we made another request in this control, so we update the counter
				this._iListUpdateRequested += 1;
				if (sEventType === "search") {
					// fire the search so the data can be updated externally
					this.fireSearch({value: sValue, itemsBinding: oBinding, clearButtonPressed: bClearButtonPressed});
				} else if (sEventType === "liveChange") {
					// fire the liveChange so the data can be updated externally
					this.fireLiveChange({value: sValue, itemsBinding: oBinding});
				}
			} else {
				// no binding, just fire the event for manual filtering
				if (sEventType === "search") {
					// fire the search so the data can be updated externally
					this.fireSearch({value: sValue, clearButtonPressed: bClearButtonPressed});
				} else if (sEventType === "liveChange") {
					// fire the liveChange so the data can be updated externally
					this.fireLiveChange({value: sValue});
				}
			}
		}

		return this;
	};

	/**
	 * Internal function that shows/hides a local busy indicator and hides/shows the list
	 * based on the parameter flag. For the first request, the search field is also hidden.
	 * @private
	 * @param {boolean} bBusy flag (true = show, false = hide)
	 */
	SelectDialog.prototype._setBusy = function (bBusy) {
		if (this._iListUpdateRequested) { // check if the event was caused by our control
			if (bBusy) {
				this._oList.addStyleClass('sapMSelectDialogListHide');
				this._oBusyIndicator.$().css('display', 'inline-block');
			} else {
				this._oList.removeStyleClass('sapMSelectDialogListHide');
				this._oBusyIndicator.$().css('display', 'none');
			}
		}
	};

	/**
	 * Event function that is called when the model sent a request to update the data.
	 * It shows a busy indicator and hides searchField and list in the dialog.
	 * @private
	 * @param {jQuery.Event} oEvent The event object
	 */
	SelectDialog.prototype._updateStarted = function (oEvent) {
		if (this.getModel() && this.getModel() instanceof sap.ui.model.odata.ODataModel) {
			if (this._oDialog.isOpen() && this._iListUpdateRequested) {
				// only set busy mode when we have an OData model
				this._setBusy(true);
			} else {
				this._bInitBusy = true;
			}
		}
	};

	/**
	 * Event function that is called when the model request is finished.
	 * It hides the busy indicator and shows searchField and list in the dialog.
	 * @private
	 * @param {jQuery.Event} oEvent The event object
	 */
	SelectDialog.prototype._updateFinished = function (oEvent) {
		// only reset busy mode when we have an OData model
		this._updateSelectionIndicator();
		if (this.getModel() && this.getModel() instanceof sap.ui.model.odata.ODataModel) {
			this._setBusy(false);
			this._bInitBusy = false;
		}
		if (Device.system.desktop) {

			if (this._oList.getItems()[0]) {
				this._oDialog.setInitialFocus(this._oList.getItems()[0]);
			} else {
				this._oDialog.setInitialFocus(this._oSearchField);
			}

			// set initial focus manually after all items are visible
			if (this._bFirstRequest && !this._bLiveChange) {
				var oFocusControl = this._oList.getItems()[0];
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
		this._iListUpdateRequested = 0;

		// List items' delegates to handle mouse clicks/taps & keyboard when an item is already selected
		this._oList.getItems().forEach(function (oItem) {
			oItem.addEventDelegate(this._getListItemsEventDelegates());
		}, this);
	};

	/**
	 * Lazy load the ok button if needed for MultiSelect mode
	 * @private
	 * @returns {sap.m.Button} the button
	 */
	SelectDialog.prototype._getOkButton = function () {
		var that = this,
			fnOKAfterClose = null;

		fnOKAfterClose = function () {
			that._oSelectedItem = that._oList.getSelectedItem();
			that._aSelectedItems = that._oList.getSelectedItems();

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
	 * Lazy load the cancel button
	 * @private
	 * @returns {sap.m.Button} the button
	 */
	SelectDialog.prototype._getCancelButton = function () {
		var that = this;

		if (!this._oCancelButton) {
			this._oCancelButton = new Button(this.getId() + "-cancel", {
				text: this._oRb.getText("MSGBOX_CANCEL"),
				press: function (oEvent) {
					that._onCancel();
				}
			});
		}
		return this._oCancelButton;
	};

	/**
	 * Lazy load the clear button
	 * @private
	 * @returns {sap.m.Button} the button
	 */
	SelectDialog.prototype._getClearButton = function() {

		if (!this._oClearButton) {
			this._oClearButton = new Button(this.getId() + "-clear", {
				text: this._oRb.getText("SELECTDIALOG_CLEARBUTTON"),
				press: this.clearSelection.bind(this)
			});
		}
		return this._oClearButton;
	};

	/**
	 * Internal event handler for the cancel button and ESC key
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	SelectDialog.prototype._onCancel = function (oEvent) {
		var that = this,
			fnAfterClose = null;

		fnAfterClose = function () {
				// reset internal selection values
				that._oSelectedItem = null;
				that._aSelectedItems = [];
				that._sSearchFieldValue = null;

				// detach this function
				that._oDialog.detachAfterClose(fnAfterClose);

				// reset selection to the previous selection
				// CSN# 1166619/2014: selections need to be restored before the cancel event is fired because the filter is usually reset in the cancel event
				that._resetSelection();

				// fire cancel event
				that.fireCancel();
			};

		// attach the reset function to afterClose to hide the dialog changes from the end user
		this._oDialog.attachAfterClose(fnAfterClose);
		this._oDialog.close();
	};

	/**
	 * Internal function to update the selection indicator bar
	 * @private
	 */
	SelectDialog.prototype._updateSelectionIndicator = function () {
		var iSelectedContexts = this._oList.getSelectedContextPaths(true).length,
			oInfoBar = this._oList.getInfoToolbar();

		if (this.getShowClearButton() && this._oClearButton) {
			this._oClearButton.setEnabled(iSelectedContexts > 0);
		}
		// update the selection label
		oInfoBar.setVisible(!!iSelectedContexts && this.getMultiSelect());
		oInfoBar.getContent()[0].setText(this._oRb.getText("TABLESELECTDIALOG_SELECTEDITEMS", [iSelectedContexts]));
	};

	/**
	 * Internal function to fire the confirm event and to update the selection of the list.
	 * The function is called on pressing ok and on close in single select mode
	 * @private
	 */
	SelectDialog.prototype._fireConfirmAndUpdateSelection = function () {
		// fire confirm event with current selection
		var mParams = {
			selectedItem: this._oSelectedItem,
			selectedItems: this._aSelectedItems
		};
		// retrieve the value for 'selectedContexts' only lazily as it might fail for some models
		Object.defineProperty(mParams, "selectedContexts", {
			get: this._oList.getSelectedContexts.bind(this._oList, true)
		});

		this.fireConfirm(mParams);
		this._updateSelection();
	};

	/**
	 * Handles user interaction on pressing OK, Space or clicking on item in the list.
	 *
	 * @private
	 */
	SelectDialog.prototype._selectionChange = function () {
		if (!this._oDialog) {
			return;
		}

		// The following logic handles the item tap / select when:
		// -- the selectDialog is in multi select mode - only update the indicator
		if (this.getMultiSelect()) {
			this._updateSelectionIndicator();
			return; // the SelectDialog should remain open
		}
		// -- the selectDialog in single select mode - close and update the selection of the dialog
		if (!this._bAfterCloseAttached) {
			// if the resetAfterclose function is not attached already
			// attach it to afterClose to hide the dialog changes from the end user
			this._oDialog.attachEventOnce("afterClose", this._resetAfterClose, this);
			this._bAfterCloseAttached = true;
		}
		this._oDialog.close();
	};

	/**
	 * Handles the firing of the confirm event with the correct parameters after the dialog is closed.
	 * The method is called after the dialog is closed via user interaction - pressing enter, ok or clicking on an item in the list.
	 *
	 * @private
	 */
	SelectDialog.prototype._resetAfterClose = function() {
		this._oSelectedItem = this._oList.getSelectedItem();
		this._aSelectedItems = this._oList.getSelectedItems();
		this._bAfterCloseAttached = false;

		this._fireConfirmAndUpdateSelection();
	};

	/**
	 * Internal function to remove/keep the list selection based on property "rememberSelection"
	 * @private
	 */
	SelectDialog.prototype._updateSelection = function () {
		// cleanup old selection on close to allow reuse of dialog
		// due to the delayed call (dialog onAfterClose) the control could be already destroyed
		if (!this.getRememberSelections() && !this.bIsDestroyed) {
			this._removeSelection();
		}
	};

	/**
	 * Removes selection from <code> sap.m.SelectDialog</code>
	 * @private
	 */
	SelectDialog.prototype._removeSelection = function () {
			this._oList.removeSelections(true);
			delete this._oSelectedItem;
			delete this._aSelectedItems;
	};

	/**
	 * Internal function to reset the selection to the items that were selected when the dialog was opened
	 * @private
	 */
	SelectDialog.prototype._resetSelection = function () {
		// due to the delayed call (dialog onAfterClose) the control could be already destroyed
		if (!this.bIsDestroyed) {
			// force-remove the current selection from the list
			this._oList.removeSelections(true);
			// reset the selection to the selected context paths stored in the open method
			this._oList.setSelectedContextPaths(this._aInitiallySelectedContextPaths);
			// reset the selection on the list manually
			this._oList.getItems().forEach(function (oItem) {
				var sPath = oItem.getBindingContextPath();
				if (sPath && this._aInitiallySelectedContextPaths.indexOf(sPath) > -1) {
					oItem.setSelected(true);
				}
			}, this);
		}
	};

	/**
	 * Returns object with the event delegates that will be attached to the list items.
	 *
	 * <b>Note</b>: These events could be prevented by calling <code>event.preventDefault()</code> or
	 * <code>event.setMarked("preventSelectionChange")</code> in the source ListItem.
	 *
	 * That way the former behaviour would be kept- close the Dialog only on List item change.
	 *
	 * @returns {object} The object containing the delegates
	 * @private
	 */
	SelectDialog.prototype._getListItemsEventDelegates = function () {
		var fnEventDelegate = function (oEvent) {
			if (oEvent && oEvent.isDefaultPrevented && oEvent.isMarked &&
				(oEvent.isDefaultPrevented() || oEvent.isMarked("preventSelectionChange"))) {
				return;
			}

			this._selectionChange(oEvent); // Mouse and Touch events
		}.bind(this);

		return {
			ontap: fnEventDelegate,
			onsapselect: fnEventDelegate
		};
	};

	/* =========================================================== */
	/*           end: internal methods                             */
	/* =========================================================== */

	// enrich the control functionality with TitleAlignmentMixin
	TitleAlignmentMixin.mixInto(SelectDialog.prototype);

	return SelectDialog;

});
