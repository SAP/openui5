/*!
 * ${copyright}
 */

// Provides control sap.m.ListBase.
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/ControlBehavior",
	"sap/ui/core/RenderManager",
	"sap/ui/Device",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/LabelEnablement",
	"sap/ui/core/delegate/ItemNavigation",
	"./library",
	"sap/ui/core/library",
	"./InstanceManager",
	"./GrowingEnablement",
	"./GroupHeaderListItem",
	"./ListItemBase",
	"./ListBaseRenderer",
	"sap/base/strings/capitalize",
	"sap/ui/thirdparty/jquery",
	"sap/base/Log",
	"sap/ui/core/InvisibleMessage",
	"sap/m/table/Util",
	"sap/ui/core/Lib",
	"sap/ui/dom/jquery/Selectors", // jQuery custom selectors ":sapTabbable"
	"sap/ui/dom/jquery/Aria" // jQuery Plugin "addAriaLabelledBy", "removeAriaLabelledBy"
],
function(
	Localization,
	ControlBehavior,
	RenderManager,
	Device,
	Control,
	Element,
	InvisibleText,
	LabelEnablement,
	ItemNavigation,
	library,
	coreLibrary,
	InstanceManager,
	GrowingEnablement,
	GroupHeaderListItem,
	ListItemBase,
	ListBaseRenderer,
	capitalize,
	jQuery,
	Log,
	InvisibleMessage,
	Util,
	Library
) {
	"use strict";


	// shortcut for sap.m.ListType
	var ListItemType = library.ListType;

	// shortcut for sap.m.ListGrowingDirection
	var ListGrowingDirection = library.ListGrowingDirection;

	// shortcut for sap.m.SwipeDirection
	var SwipeDirection = library.SwipeDirection;

	// shortcut for sap.m.ListSeparators
	var ListSeparators = library.ListSeparators;

	// shortcut for sap.m.ListMode
	var ListMode = library.ListMode;

	// shortcut for sap.m.Sticky
	var Sticky = library.Sticky;

	// shortcut for sap.m.MultiSelectMode
	var MultiSelectMode = library.MultiSelectMode;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	/**
	 * Constructor for a new ListBase.
	 *
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>sap.m.ListBase</code> control provides a base functionality of the <code>sap.m.List</code> and <code>sap.m.Table</code> controls. Selection, deletion, unread states and inset style are also maintained in <code>sap.m.ListBase</code>.
	 *
	 * See section "{@link topic:295e44b2d0144318bcb7bdd56bfa5189 List, List Item, and Table}"
	 * in the documentation for an introduction to subclasses of <code>sap.m.ListBase</code> control.
	 * More information on how to use binding-related functionality, such as {@link topic:ec79a5d5918f4f7f9cbc2150e66778cc Sorting, Grouping, and Filtering},
	 * is also available in the documentation.
	 *
	 * <b>Note:</b> The ListBase including all contained items may be completely re-rendered when the data of a bound model is changed. Due to the limited hardware resources of mobile devices this can lead to longer delays for lists that contain many items. As such the usage of a list is not recommended for these use cases.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.16
	 * @alias sap.m.ListBase
	 */
	var ListBase = Control.extend("sap.m.ListBase", /** @lends sap.m.ListBase.prototype */ {
		metadata : {

			library : "sap.m",
			dnd : true,
			properties : {
				/**
				 * Defines the indentation of the container. Setting it to <code>true</code> indents the list.
				 */
				inset : {type : "boolean", group : "Appearance", defaultValue : false},

				/**
				 * Defines the header text that appears in the control.
				 * <b>Note:</b>
				 * If the <code>headerToolbar</code> aggregation is set, then this property is ignored.
				 * If this is the case, use, for example, a <code>sap.m.Title</code> control in the toolbar to define a header.
				 */
				headerText : {type : "string", group : "Misc", defaultValue : null},

				/**
				 * Defines the semantic header level of the header text (see {@link #getHeaderText headerText} property}).
				 * This information is, for example, used by assistive technologies, such as screenreaders, to create a hierarchical site
				 * map for faster navigation.
				 * Depending on this setting, either the ARIA equivalent of an HTML h1-h6 element is used or, when using the
				 * <code>Auto</code> level, no explicit level information is used.
				 *
				 * <b>Note:</b>
				 * If the <code>headerToolbar</code> aggregation is set, then this property is ignored.
				 * If this is the case, use, for example, a <code>sap.m.Title</code> control in the toolbar to define a header.
				 *
				 * @since 1.117.0
				 */
				headerLevel : {type : "sap.ui.core.TitleLevel", group : "Misc", defaultValue : TitleLevel.Auto},

				/**
				 * Defines the footer text that appears in the control.
				 */
				footerText : {type : "string", group : "Misc", defaultValue : null},

				/**
				 * Defines the mode of the control (e.g. <code>None</code>, <code>SingleSelect</code>, <code>MultiSelect</code>, <code>Delete</code>).
				 */
				mode : {type : "sap.m.ListMode", group : "Behavior", defaultValue : ListMode.None},

				/**
				 * Sets the width of the control.
				 */
				width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : "100%"},

				/**
				 * Defines whether the items are selectable by clicking on the item itself (<code>true</code>) rather than having to set the selection control first.
				 * <b>Note:</b> The <code>SingleSelectMaster</code> mode also provides this functionality by default.
				 */
				includeItemInSelection : {type : "boolean", group : "Behavior", defaultValue : false},

				/**
				 * Activates the unread indicator for all items, if set to <code>true</code>.
				 */
				showUnread : {type : "boolean", group : "Misc", defaultValue : false},

				/**
				 * This text is displayed if the control contains no items.
				 * <b>Note:</b> If both a <code>noDataText</code> property and a <code>noData</code> aggregation are provided, the <code>noData</code> aggregation takes priority.
				 * If the <code>noData</code> aggregation is undefined or set to null, the <code>noDataText</code> property is used instead.
				 */
				noDataText : {type : "string", group : "Misc", defaultValue : null},

				/**
				 * Defines whether or not the text specified in the <code>noDataText</code> property is displayed.
				 */
				showNoData : {type : "boolean", group : "Misc", defaultValue : true},

				/**
				 * When this property is set to <code>true</code>, the control will automatically display a busy indicator when it detects that data is being loaded. This busy indicator blocks the interaction with the items until data loading is finished.
				 * By default, the busy indicator will be shown after one second. This behavior can be customized by setting the <code>busyIndicatorDelay</code> property.
				 * @since 1.20.2
				 */
				enableBusyIndicator : {type : "boolean", group : "Behavior", defaultValue : true},

				/**
				 * Defines if animations will be shown while switching between modes.
				 */
				modeAnimationOn : {type : "boolean", group : "Misc", defaultValue : true},

				/**
				 * Defines which item separator style will be used.
				 */
				showSeparators : {type : "sap.m.ListSeparators", group : "Appearance", defaultValue : ListSeparators.All},

				/**
				 * Defines the direction of the swipe movement (e.g LeftToRight, RightToLeft, Both) to display the control defined in the <code>swipeContent</code> aggregation.
				 */
				swipeDirection : {type : "sap.m.SwipeDirection", group : "Misc", defaultValue : SwipeDirection.Both},

				/**
				 * If set to <code>true</code>, enables the growing feature of the control to load more items by requesting from the model.
				 * <b>Note:</b>: This feature only works when an <code>items</code> aggregation is bound. Growing must not be used together with two-way binding.
				 * @since 1.16.0
				 */
				growing : {type : "boolean", group : "Behavior", defaultValue : false},

				/**
				 * Defines the number of items to be requested from the model for each grow.
				 * This property can only be used if the <code>growing</code> property is set to <code>true</code>.
				 * @since 1.16.0
				 */
				growingThreshold : {type : "int", group : "Misc", defaultValue : 20},

				/**
				 * Defines the text displayed on the growing button. The default is a translated text ("More") coming from the message bundle.
				 * This property can only be used if the <code>growing</code> property is set to <code>true</code>.
				 * @since 1.16.0
				 */
				growingTriggerText : {type : "string", group : "Appearance", defaultValue : null},

				/**
				 * If set to true, the user can scroll down/up to load more items. Otherwise a growing button is displayed at the bottom/top of the control.
				 * <b>Note:</b> This property can only be used if the <code>growing</code> property is set to <code>true</code> and only if there is one instance of <code>sap.m.List</code> or <code>sap.m.Table</code> inside the scrollable scroll container (e.g <code>sap.m.Page</code>).
				 * @since 1.16.0
				 */
				growingScrollToLoad : {type : "boolean", group : "Behavior", defaultValue : false},

				/**
				 * Defines the direction of the growing feature.
				 * If set to <code>Downwards</code> the user has to scroll down to load more items or the growing button is displayed at the bottom.
				 * If set to <code>Upwards</code> the user has to scroll up to load more items or the growing button is displayed at the top.
				 * @since 1.40.0
				 */
				growingDirection : {type : "sap.m.ListGrowingDirection", group : "Behavior", defaultValue : ListGrowingDirection.Downwards},

				/**
				 * If set to true, this control remembers and retains the selection of the items after a binding update has been performed (e.g. sorting, filtering).
				 * <b>Note:</b> This feature works only if two-way data binding for the <code>selected</code> property of the item is not used. It also needs to be turned off if the binding context of the item does not always point to the same entry in the model, for example, if the order of the data in the <code>JSONModel</code> is changed.
				 * <b>Note:</b> This feature leverages the built-in selection mechanism of the corresponding binding context when the OData V4 model is used. Therefore, all binding-relevant limitations apply in this context as well. For more details, see the {@link sap.ui.model.odata.v4.Context#setSelected setSelected}, the {@link sap.ui.model.odata.v4.ODataModel#bindList bindList}, and the {@link sap.ui.model.odata.v4.ODataMetaModel#requestValueListInfo requestValueListInfo} API documentation. Do not enable this feature when <code>$$SharedRequests</code> or <code>$$clearSelectionOnFilter</code> is active.
				 * @since 1.16.6
				 */
				rememberSelections : {type : "boolean", group : "Behavior", defaultValue : true},

				/**
				 * Defines keyboard handling behavior of the control.
				 * @since 1.38.0
				 */
				keyboardMode : {type : "sap.m.ListKeyboardMode", group : "Behavior", defaultValue : "Navigation" },

				/**
				 * Defines the section of the control that remains fixed at the top of the page during vertical scrolling as long as the control is in the viewport.
				 *
				 * <b>Note:</b> Enabling sticky column headers in List controls will not have any effect.
				 *
				 * There are some known restrictions. A few are given below:
				 * <ul>
				 * <li>If the control is placed in layout containers that have the <code>overflow: hidden</code> or <code>overflow: auto</code> style definition, this can
				 * prevent the sticky elements of the control from becoming fixed at the top of the viewport.</li>
				 * <li>If sticky column headers are enabled in the <code>sap.m.Table</code> control, setting focus on the column headers will let the table scroll to the top.</li>
				 * <li>A transparent toolbar design is not supported for sticky bars. The toolbar will automatically get an intransparent background color.</li>
				 * <li>This feature supports only the default height of the toolbar control.</li>
				 * </ul>
				 *
				 * @since 1.58
				 */
				sticky : {type : "sap.m.Sticky[]", group : "Appearance"},

				/**
				 * Defines the multi-selection mode for the control.
				 *
				 * If the property is set to <code>ClearAll</code>, then selecting items via the
				 * keyboard shortcut <i>CTRL + A</i> and via the <code>selectAll</code> method is not possible.
				 * See {@link #selectAll selectAll} for more details.
				 * A selection of multiple items is still possible using the range selection feature.
				 * For more information about the range selection, see {@link topic:8a0d4efa29d44ef39219c18d832012da Keyboard Handling for Item Selection}.
				 *
				 * <b>Only relevant for <code>sap.m.Table</code>:</b>
				 * If <code>ClearAll</code> is set, the table renders a Deselect All icon in the column header,
				 * otherwise a Select All checkbox is shown. The Select All checkbox allows the user to select all the
				 * items in the control, and the Deselect All icon deselects the items.
				 *
				 * <b>Note:</b> This property must be used with the <code>MultiSelect</code> mode.
				 *
				 * @since 1.93
				 */
				multiSelectMode : {type: "sap.m.MultiSelectMode", group: "Behavior", defaultValue: MultiSelectMode.Default}
			},
			defaultAggregation : "items",
			aggregations : {

				/**
				 * Defines the items contained within this control.
				 */
				items : {type : "sap.m.ListItemBase", multiple : true, singularName : "item", bindable : "bindable", selector: "#{id} .sapMListItems", dnd : true},

				/**
				 * User can swipe to bring in this control on the right hand side of an item.
				 * <b>Note:</b>
				 * <ul>
				 * <li>For non-touch screen devices, this functionality is ignored.</li>
				 * <li>There is no accessible alternative provided by the control for swiping.
				 * Applications that use this functionality must provide an accessible alternative UI to perform the same action.</li>
				 * <ul>
				 */
				swipeContent : {type : "sap.ui.core.Control", multiple : false},

				/**
				 * The header area can be used as a toolbar to add extra controls for user interactions.
				 * <b>Note:</b> When set, this overwrites the <code>headerText</code> property.
				 * @since 1.16
				 */
				headerToolbar : {type : "sap.m.Toolbar", multiple : false},

				/**
				 * A toolbar that is placed below the header to show extra information to the user.
				 * @since 1.16
				 */
				infoToolbar : {type : "sap.m.Toolbar", multiple : false},

				/**
				 * Defines the context menu of the items.
				 *
				 * @since 1.54
				 */
				contextMenu : {type : "sap.ui.core.IContextMenu", multiple : false},

				/**
				 * Defines the message strip to display binding-related messages.
				 * @since 1.73
				 */
				_messageStrip: {type : "sap.m.MessageStrip", multiple : false, visibility : "hidden"},

				/**
				 * Defines the custom visualization if there is no data available.
				 * <b>Note:</b> If both a <code>noDataText</code> property and a <code>noData</code> aggregation are provided, the <code>noData</code> aggregation takes priority.
				 * If the <code>noData</code> aggregation is undefined or set to null, the <code>noDataText</code> property is used instead.
				 * @since 1.101
				 */
				noData: {type: "sap.ui.core.Control", multiple: false, altTypes: ["string"]}
			},
			associations: {

				/**
				 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
				 * @since 1.28.0
				 */
				ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }
			},
			events : {
				/**
				 * Fires when selection is changed via user interaction inside the control.
				 * @since 1.16
				 */
				selectionChange : {
					parameters : {

						/**
						 * The item whose selection has changed. In <code>MultiSelect</code> mode, only the up-most selected item is returned. This parameter can be used for single-selection modes.
						 */
						listItem : {type : "sap.m.ListItemBase"},

						/**
						 * Array of items whose selection has changed. This parameter can be used for <code>MultiSelect</code> mode.
						 */
						listItems : {type : "sap.m.ListItemBase[]"},

						/**
						 * Indicates whether the <code>listItem</code> parameter is selected or not.
						 */
						selected : {type : "boolean"},

						/**
						 * Indicates whether the select all action is triggered or not.
						 */
						selectAll : {type : "boolean"}
					}
				},

				/**
				 * Fires when delete icon is pressed by user.
				 */
				"delete" : {
					parameters : {

						/**
						 * The item which fired the delete event.
						 */
						listItem : {type : "sap.m.ListItemBase"}
					}
				},

				/**
				 * Fires after user's swipe action and before the <code>swipeContent</code> is shown. On the <code>swipe</code> event handler, <code>swipeContent</code> can be changed according to the swiped item.
				 * Calling the <code>preventDefault</code> method of the event cancels the swipe action.
				 *
				 * <b>Note:</b> There is no accessible alternative provided by the control for swiping.
				 * Applications that use this functionality must provide an accessible alternative UI to perform the same action.
				 */
				swipe : {allowPreventDefault : true,
					parameters : {

						/**
						 * The item which fired the swipe.
						 */
						listItem : {type : "sap.m.ListItemBase"},

						/**
						 * Aggregated <code>swipeContent</code> control that is shown on the right hand side of the item.
						 */
						swipeContent : {type : "sap.ui.core.Control"},

						/**
						 * Holds which control caused the swipe event within the item.
						 */
						srcControl : {type : "sap.ui.core.Control"},

						/**
						 * Shows in which direction the user swipes and can have the value <code>BeginToEnd</code> (left to right in LTR languages
						 * and right to left in RTL languages) or <code>EndToBegin</code> (right to left in LTR languages
						 * and left to right in RTL languages)
						 */
						swipeDirection : {type : "sap.m.SwipeDirection"}
					}
				},

				/**
				 * Fires before <code>items</code> binding is updated (e.g. sorting, filtering)
				 *
				 * <b>Note:</b> Event handler should not invalidate the control.
				 * @since 1.16.3
				 */
				updateStarted : {
					parameters : {

						/**
						 * The reason of the update, e.g. Binding, Filter, Sort, Growing, Change, Refresh, Context.
						 */
						reason : {type : "string"},

						/**
						 * Actual number of items.
						 */
						actual : {type : "int"},

						/**
						 * The total count of bound items. This can be used if the <code>growing</code> property is set to <code>true</code>.
						 */
						total : {type : "int"}
					}
				},

				/**
				 * Fires after <code>items</code> binding is updated and processed by the control.
				 * @since 1.16.3
				 */
				updateFinished : {
					parameters : {

						/**
						 * The reason of the update, e.g. Binding, Filter, Sort, Growing, Change, Refresh, Context.
						 */
						reason : {type : "string"},

						/**
						 * Actual number of items.
						 */
						actual : {type : "int"},

						/**
						 * The total count of bound items. This can be used if the <code>growing</code> property is set to <code>true</code>.
						 */
						total : {type : "int"}
					}
				},

				/**
				 * Fires when an item is pressed unless the item's <code>type</code> property is <code>Inactive</code>.
				 * @since 1.20
				 */
				itemPress : {
					parameters : {

						/**
						 * The item which fired the pressed event.
						 */
						listItem : {type : "sap.m.ListItemBase"},

						/**
						 * The control which caused the press event within the container.
						 */
						srcControl : {type : "sap.ui.core.Control"}
					}
				},

				/**
				 * Fired when the context menu is opened.
				 * When the context menu is opened, the binding context of the item is set to the given <code>contextMenu</code>.
				 * @since 1.54
				 */
				beforeOpenContextMenu : {
					allowPreventDefault : true,
					parameters : {
						/**
						 * Item in which the context menu was opened.
						 */
						listItem : {type : "sap.m.ListItemBase"}
					}
				}
			},
			designtime: "sap/m/designtime/ListBase.designtime"

		},

		renderer: ListBaseRenderer
	});

	// announce accessibility details at the initial focus
	ListBase.prototype.bAnnounceDetails = true;

	ListBase.getInvisibleText = function() {
		if (!this.oInvisibleText) {
			this.oInvisibleText = new InvisibleText().toStatic();
		}
		return this.oInvisibleText;
	};

	// class name for the navigation items
	ListBase.prototype.sNavItemClass = "sapMLIB";

	ListBase.prototype.init = function() {
		this._aNavSections = [];
		this._aSelectedPaths = [];
		this._iItemNeedsHighlight = 0;
		this._iItemNeedsNavigated = 0;
		this._bItemsBeingBound = false;
		this._bSkippedInvalidationOnRebind = false;
		this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling
	};

	ListBase.prototype.onBeforeRendering = function() {
		this._bRendering = true;
		this._bActiveItem = false;
		this._aNavSections = [];
		this._removeSwipeContent();
	};

	ListBase.prototype.onAfterRendering = function() {
		this._bRendering = false;
		this._sLastMode = this.getMode();
		this._startItemNavigation(true);
	};

	ListBase.prototype.exit = function () {
		this._aNavSections = [];
		this._aSelectedPaths = [];
		this._destroyGrowingDelegate();
		this._destroyItemNavigation();
		this._oLastFakeFocusedItem = null;
	};

	// this gets called only with oData Model when first load or filter/sort
	ListBase.prototype.refreshItems = function(sReason) {
		this._bRefreshItems = true;
		if (this._oGrowingDelegate) {
			// inform growing delegate to handle
			this._oGrowingDelegate.refreshItems(sReason);
		} else {
			// if data multiple time requested during the ongoing request
			// UI5 cancels the previous requests then we should fire updateStarted once
			if (!this._bReceivingData) {
				// handle update started event
				this._updateStarted(sReason);
				this._bReceivingData = true;
			}

			// for flat list get all data
			this.refreshAggregation("items");
		}
	};

	// this gets called via JSON and OData model when binding is updated
	// if there is no data this should get called anyway
	// TODO: if there is a network error this will not get called
	// but we need to turn back to initial state
	ListBase.prototype.updateItems = function(sReason, oEventInfo) {
		// Special handling for "AutoExpandSelect" of the V4 ODataModel.
		if (oEventInfo && oEventInfo.detailedReason === "AddVirtualContext") {
			createVirtualItem(this);
			if (this._oGrowingDelegate) {
				this._oGrowingDelegate.reset(true);
			}
			return;
		} else if (oEventInfo && oEventInfo.detailedReason === "RemoveVirtualContext") {
			destroyVirtualItem(this);
			return;
		}

		if (this._bSkippedInvalidationOnRebind && this.getBinding("items").getLength() === 0) {
			this.invalidate();
		}

		if (this._oGrowingDelegate) {
			// inform growing delegate to handle
			this._oGrowingDelegate.updateItems(sReason);
		} else {
			if (this._bReceivingData) {
				// if we are receiving the data this should be oDataModel
				// updateStarted is already handled before on refreshItems
				// here items binding is updated because data is came from server
				// so we can convert the flag for the next request
				this._bReceivingData = false;
			} else {
				// if data is not requested this should be JSON Model
				// data is already in memory and will not be requested
				// so we do not need to change the flag
				// this._bReceivingData should be always false
				this._updateStarted(sReason);
			}

			// for flat list update items aggregation
			this.updateAggregation("items");

			// items binding are updated
			this._updateFinished();
		}

		this._bSkippedInvalidationOnRebind = false;
	};

	function createVirtualItem(oList) {
		var oBinding = oList.getBinding("items");
		var oBindingInfo = oList.getBindingInfo("items");
		var iLen = oList.getGrowing() ? oList.getGrowingThreshold() : oBindingInfo.length;
		var iIdx = oList.getGrowing() || !oBindingInfo.startIndex ? 0 : oBindingInfo.startIndex;
		var oVirtualContext = oBinding.getContexts(iIdx, iLen)[0];

		destroyVirtualItem(oList);
		oList._oVirtualItem = GrowingEnablement.createItem(oVirtualContext, oBindingInfo, "virtual");
		oList.addAggregation("dependents", oList._oVirtualItem, true);
	}

	function destroyVirtualItem(oList) {
		if (oList._oVirtualItem) {
			oList._oVirtualItem.destroy();
			delete oList._oVirtualItem;
		}
	}

	ListBase.prototype.setBindingContext = function(oContext, sModelName) {
		var sItemsModelName = (this.getBindingInfo("items") || {}).model;
		if (sItemsModelName === sModelName) {
			this._resetItemsBinding();
		}

		return Control.prototype.setBindingContext.apply(this, arguments);
	};

	ListBase.prototype.bindAggregation = function(sName) {
		this._bItemsBeingBound = sName === "items";
		destroyVirtualItem(this);
		Control.prototype.bindAggregation.apply(this, arguments);
		this._bItemsBeingBound = false;
		return this;
	};

	ListBase.prototype._bindAggregation = function(sName, oBindingInfo) {
		function addBindingListener(oBindingInfo, sEventName, fHandler) {
			oBindingInfo.events = oBindingInfo.events || {};

			if (!oBindingInfo.events[sEventName]) {
				oBindingInfo.events[sEventName] = fHandler;
			} else {
				// Wrap the event handler of the other party to add our handler.
				var fOriginalHandler = oBindingInfo.events[sEventName];
				oBindingInfo.events[sEventName] = function() {
					fHandler.apply(this, arguments);
					fOriginalHandler.apply(this, arguments);
				};
			}
		}

		if (sName === "items") {
			this._resetItemsBinding();
			addBindingListener(oBindingInfo, "dataRequested", this._onBindingDataRequestedListener.bind(this));
			addBindingListener(oBindingInfo, "dataReceived", this._onBindingDataReceivedListener.bind(this));
		}

		Control.prototype._bindAggregation.call(this, sName, oBindingInfo);

		if (sName === "items" && this.getModel(oBindingInfo.model).isA("sap.ui.model.odata.v4.ODataModel")) {
			this.getBinding("items").attachEvent("selectionChanged", onBindingSelectionChanged, this);
		}
	};

	ListBase.prototype._onBindingDataRequestedListener = function(oEvent) {
		this._showBusyIndicator();

		if (this._dataReceivedHandlerId != null) {
			clearTimeout(this._dataReceivedHandlerId);
			delete this._dataReceivedHandlerId;
		}
	};

	ListBase.prototype._onBindingDataReceivedListener = function(oEvent) {
		if (this._dataReceivedHandlerId != null) {
			clearTimeout(this._dataReceivedHandlerId);
			delete this._dataReceivedHandlerId;
		}

		// The list will be set to busy when a request is sent, and set to not busy when a response is received.
		// Under certain conditions it can happen that there are multiple requests in the request queue of the binding, which will be processed
		// sequentially. In this case the busy indicator will be shown and hidden multiple times (flickering) until all requests have been
		// processed. With this timer we avoid the flickering, as the list will only be set to not busy after all requests have been processed.
		this._dataReceivedHandlerId = setTimeout(function() {
			this._hideBusyIndicator();
			delete this._dataReceivedHandlerId;
		}.bind(this), 0);

		if (this._oGrowingDelegate) {
			// inform growing delegate to handle
			this._oGrowingDelegate._onBindingDataReceivedListener(oEvent);
		}
	};

	async function onBindingSelectionChanged(oEvent) {
		const oContext = oEvent.getParameter("context");

		if (!this._bSelectionMode) {
			return;
		}

		if (oContext.getBinding().getHeaderContext() === oContext) {
			if (oContext.isSelected()) {
				Log.warning("Selecting the header context does not affect the list selection", this);
			} else {
				this.removeSelections(true, true);
			}
			return;
		}

		const sModelName = this.getBindingInfo("items").model;
		const oItem = this.getItems().find((oItem) => oItem.getBindingContext(sModelName) === oContext);

		if (!oItem) {
			Log.warning("Selecting a context that is not related to a visible item does not affect the list selection", this);
			return;
		}

		await Promise.resolve(); // ListItemBase first needs to update its selected property, otherwise the selectionChange event is fired too often.

		const bContextIsSelected = oContext.isSelected();
		this.setSelectedItem(oItem, bContextIsSelected, bContextIsSelected !== oItem.getSelected());

		if (bContextIsSelected && this.getMode().includes("SingleSelect")) {
			oContext.getBinding().getAllCurrentContexts().forEach((oCurrentContext) => {
				if (oCurrentContext !== oContext) {
					oCurrentContext.setSelected(false);
				}
			});
		}
	}

	ListBase.prototype.destroyItems = function(bSuppressInvalidate) {
		// check whether we have items to destroy or not
		if (!this.getItems(true).length) {
			return this;
		}

		// suppress the synchronous DOM removal of the aggregation destroy
		this.destroyAggregation("items", "KeepDom");

		// invalidate to update the DOM on the next tick of the RenderManager
		if (!bSuppressInvalidate) {
			if (this._bItemsBeingBound) {
				this._bSkippedInvalidationOnRebind = true;
			} else {
				this.invalidate();
			}
		}

		return this;
	};

	ListBase.prototype.getItems = function(bReadOnly) {
		if (bReadOnly) {
			return this.mAggregations["items"] || [];
		}

		return this.getAggregation("items", []);
	};

	ListBase.prototype.getId = function(sSuffix) {
		var sId = this.sId;
		return sSuffix ? sId + "-" + sSuffix : sId;
	};

	ListBase.prototype.setGrowing = function(bGrowing) {
		bGrowing = !!bGrowing;
		if (this.getGrowing() != bGrowing) {
			this.setProperty("growing", bGrowing, !bGrowing);
			if (bGrowing) {
				this._oGrowingDelegate = new GrowingEnablement(this);
			} else if (this._oGrowingDelegate) {
				this._oGrowingDelegate.destroy();
				this._oGrowingDelegate = null;
			}
		}
		return this;
	};

	ListBase.prototype.setGrowingThreshold = function(iThreshold) {
		return this.setProperty("growingThreshold", iThreshold, true);
	};

	ListBase.prototype.setEnableBusyIndicator = function(bEnable) {
		this.setProperty("enableBusyIndicator", bEnable, true);
		this._hideBusyIndicator();
		return this;
	};

	ListBase.prototype.setNoData = function (vNoData) {
		this.setAggregation("noData", vNoData, true);

		if (typeof vNoData === "string") {
			this.$("nodata-text").text(vNoData);
		} else if (vNoData) {
			this.invalidate();
		} else if (!vNoData) {
			this.$("nodata-text").text(this.getNoDataText());
		}
		return this;
	};

	ListBase.prototype.setNoDataText = function(sNoDataText) {
		this.setProperty("noDataText", sNoDataText, true);
		if (!this.getNoData()) {
			// only set noDataText, if noData aggregation is not specified
			this.$("nodata-text").text(this.getNoDataText());
		}
		return this;
	};

	ListBase.prototype.getNoDataText = function(bCheckBusy) {
		// check busy state
		if (bCheckBusy && this._bBusy) {
			return "";
		}

		// return no data text from resource bundle when there is no custom
		var sNoDataText = this.getProperty("noDataText");
		sNoDataText = sNoDataText || Library.getResourceBundleFor("sap.m").getText("LIST_NO_DATA");
		return sNoDataText;
	};


	/**
	 * Returns selected list item. When no item is selected, "null" is returned. When "multi-selection" is enabled and multiple items are selected, only the up-most selected item is returned.
	 *
	 * @type sap.m.ListItemBase
	 * @public
	 */
	ListBase.prototype.getSelectedItem = function() {
		var aItems = this.getItems(true);
		for (var i = 0; i < aItems.length; i++) {
			if (aItems[i].getSelected()) {
				return aItems[i];
			}
		}
		return null;
	};


	/**
	 * Selects or deselects the given list item.
	 *
	 * @param {sap.m.ListItemBase} oListItem The list item whose selection is changed
	 * @param {boolean} [bSelect=true] Sets selected status of the list item provided
	 * @param {boolean} [bFireEvent=false] Determines whether the <code>selectionChange</code> event is fired by this method call (as of version 1.121)
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	ListBase.prototype.setSelectedItem = function(oListItem, bSelect, bFireEvent) {
		if (this.indexOfItem(oListItem) < 0) {
			Log.warning("setSelectedItem is called without valid ListItem parameter on " + this);
			return this;
		}
		if (this._bSelectionMode) {
			oListItem.setSelected((bSelect === undefined) ? true : !!bSelect);
			bFireEvent && this._fireSelectionChangeEvent([oListItem]);
		}
		return this;
	};


	/**
	 * Returns an array containing the selected list items. If no items are selected, an empty array is returned.
	 *
	 * @type sap.m.ListItemBase[]
	 * @public
	 */
	ListBase.prototype.getSelectedItems = function() {
		return this.getItems(true).filter(function(oItem) {
			return oItem.getSelected();
		});
	};


	/**
	 * Sets a list item to be selected by id. In single mode the method removes the previous selection.
	 *
	 * @param {string} sId
	 *         The id of the list item whose selection to be changed.
	 * @param {boolean} [bSelect=true]
	 *         Sets selected status of the list item
	 * @type this
	 * @public
	 */
	ListBase.prototype.setSelectedItemById = function(sId, bSelect) {
		var oListItem = Element.getElementById(sId);
		return this.setSelectedItem(oListItem, bSelect);
	};


	/**
	 * Returns the binding contexts of the selected items.
	 * Note: This method returns an empty array if no databinding is used.
	 *
	 * @param {boolean} [bAll=false]
	 *         Set true to include even invisible selected items(e.g. the selections from the previous filters).
	 *         Note: In single selection modes, only the last selected item's binding context is returned in array.
	 * @type sap.ui.model.Context[]
	 * @public
	 * @since 1.18.6
	 */
	ListBase.prototype.getSelectedContexts = function(bAll) {
		const oBindingInfo = this.getBindingInfo("items");
		const sModelName = oBindingInfo?.model;
		const oModel = this.getModel(sModelName);

		// only deal with binding case
		if (!oBindingInfo || !oModel) {
			return [];
		}

		// return binding contexts from all selection paths
		if (bAll && this.getRememberSelections()) {

			// in ODataV4Model getAllCurrentContexts will also include previously selected contexts
			if (oModel.isA("sap.ui.model.odata.v4.ODataModel")) {
				const aContexts = this.getBinding("items").getAllCurrentContexts?.() || [];
				return aContexts.filter((oContext) => this._aSelectedPaths.includes(oContext.getPath()));
			}

			// for all other models, ask model to provide context over binding path
			return this._aSelectedPaths.map((sPath) => oModel.getContext(sPath));
		}

		// return binding context of current selected items
		return this.getSelectedItems().map((oItem) => oItem.getBindingContext(sModelName));
	};


	/**
	 * Removes visible selections of the current selection mode.
	 *
	 * @param {boolean} [bAll=false] If the <code>rememberSelection</code> property is set to <code>true</code>, this control preserves selections after filtering or sorting. Set this parameter to <code>true</code> to remove all selections (as of version 1.16)
	 * @param {boolean} [bFireEvent=false] Determines whether the <code>selectionChange</code> event is fired by this method call (as of version 1.121)
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	ListBase.prototype.removeSelections = function(bAll, bFireEvent, _bDetectBinding) {
		var aChangedListItems = [];
		this._oSelectedItem = null;
		if (bAll) {
			this._aSelectedPaths = [];
			if (!_bDetectBinding) {
				const oBinding = this.getBinding("items");
				const aContexts = oBinding?.getAllCurrentContexts?.() || [];
				aContexts[0]?.setSelected && aContexts.forEach((oContext) => oContext.setSelected(false));
			}
		}
		this.getItems(true).forEach(function(oItem) {
			if (!oItem.getSelected()) {
				return;
			}

			// if the selected property is two-way bound then we do not need to update the selection
			if (_bDetectBinding && oItem.isSelectedBoundTwoWay()) {
				return;
			}

			oItem.setSelected(false, true);
			aChangedListItems.push(oItem);
			!bAll && this._updateSelectedPaths(oItem);
		}, this);

		if (bFireEvent && aChangedListItems.length) {
			this._fireSelectionChangeEvent(aChangedListItems);
		}
		return this;
	};


	/**
	 * Selects all items in the <code>MultiSelection</code> mode.
	 *
	 * <b>Note:</b> If <code>growing</code> is enabled, only the visible items in the list are selected.
	 * Since version 1.93, the items are not selected if <code>getMultiSelectMode=ClearAll</code>.
	 *
	 * @param {boolean} [bFireEvent=false] Determines whether the <code>selectionChange</code> event is fired by this method call (as of version 1.121)
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 * @since 1.16
	 */
	ListBase.prototype.selectAll = function (bFireEvent) {
		if (this.getMode() != "MultiSelect" || this.getMultiSelectMode() == MultiSelectMode.ClearAll) {
			return this;
		}

		var aChangedListItems = [];
		this.getItems(true).forEach(function(oItem) {
			if (oItem.isSelectable() && !oItem.getSelected()) {
				oItem.setSelected(true, true);
				aChangedListItems.push(oItem);
				this._updateSelectedPaths(oItem);
			}
		}, this);

		if (bFireEvent && aChangedListItems.length) {
			this._fireSelectionChangeEvent(aChangedListItems, bFireEvent);
		}

		var iSelectableItemCount = this.getItems().filter(function(oListItem) {
			return oListItem.isSelectable();
		}).length;
		if (bFireEvent && this.getGrowing() && this.getMultiSelectMode() === "SelectAll" && this.getBinding("items")?.getLength() > iSelectableItemCount) {
			var oSelectAllDomRef = this._getSelectAllCheckbox ? this._getSelectAllCheckbox() : undefined;
			if (oSelectAllDomRef) {
				Util.showSelectionLimitPopover(iSelectableItemCount, oSelectAllDomRef);
			}
		}

		return this;
	};


	/**
	 * Returns the last list mode, the mode that is rendered
	 * This can be used to detect mode changes during rendering
	 *
	 * @protected
	 */
	ListBase.prototype.getLastMode = function(sMode) {
		return this._sLastMode;
	};

	ListBase.prototype.setMode = function(sMode) {
		sMode = this.validateProperty("mode", sMode);
		var sOldMode = this.getMode();
		if (sOldMode == sMode) {
			return this;
		}

		// determine the selection mode
		this._bSelectionMode = sMode.indexOf("Select") > -1;

		// remove selections if mode is not a selection mode
		if (!this._bSelectionMode) {
			this.removeSelections(true);
		} else {
			// update selection status of items
			var aSelecteds = this.getSelectedItems();
			if (aSelecteds.length > 1) {
				// remove selection if there are more than one item is selected
				this.removeSelections(true);
			} else if (sOldMode === ListMode.MultiSelect) {
				// if old mode is multi select then we need to remember selected item
				// in case of new item selection right after setMode call
				this._oSelectedItem = aSelecteds[0];
			}
		}

		// update property with invalidate
		return this.setProperty("mode", sMode);
	};

	/**
	 * Returns growing information as object with "actual" and "total" keys.
	 * Note: This function returns "null" if "growing" feature is disabled.
	 *
	 * @returns {{actual: int, total: int} | null}
	 * @public
	 * @since 1.16
	 */
	ListBase.prototype.getGrowingInfo = function() {
		return this._oGrowingDelegate ? this._oGrowingDelegate.getInfo() : null;
	};

	ListBase.prototype.setRememberSelections = function(bRemember) {
		this.setProperty("rememberSelections", bRemember, true);
		!this.getRememberSelections() && (this._aSelectedPaths = []);
		return this;
	};

	/*
	 * Sets internal remembered selected context paths.
	 * This method can be called to reset remembered selection
	 * and does not change selection of the items until binding update.
	 *
	 * @param {string[]} aSelectedPaths valid binding context path array
	 * @since 1.26
	 * @protected
	 */
	ListBase.prototype.setSelectedContextPaths = function(aSelectedPaths) {
		this._aSelectedPaths = aSelectedPaths || [];
	};

	/*
	 * Returns internal remembered selected context paths as a copy if rememberSelections is set to true,
	 * else returns the binding context path for the current selected items.
	 *
	 * @return {string[]} selected items binding context path
	 * @since 1.26
	 * @protected
	 */
	ListBase.prototype.getSelectedContextPaths = function(bAll) {
		// return this selectedPaths if rememberSelections is true
		if (!bAll || (bAll && this.getRememberSelections())) {
			return this._aSelectedPaths.slice(0);
		}

		// return the binding context path of current selected items
		return this.getSelectedItems().map(function(oItem) {
			return oItem.getBindingContextPath();
		});
	};

	/* Determines whether all selectable items are selected or not
	 * @protected
	 */
	ListBase.prototype.isAllSelectableSelected = function() {
		if (this.getMode() != ListMode.MultiSelect) {
			return false;
		}

		var aItems = this.getItems(true),
			iSelectedItemCount = this.getSelectedItems().length,
			iSelectableItemCount = aItems.filter(function(oItem) {
				return oItem.isSelectable();
			}).length;

		return (aItems.length > 0) && (iSelectedItemCount == iSelectableItemCount);
	};

	/*
	 * Returns only visible items
	 * @protected
	 */
	ListBase.prototype.getVisibleItems = function() {
		return this.getItems(true).filter(function(oItem) {
			return oItem.getVisible();
		});
	};

	// return whether list has active item or not
	ListBase.prototype.getActiveItem = function() {
		return this._bActiveItem;
	};

	// this gets called when items DOM is changed
	ListBase.prototype.onItemDOMUpdate = function(oListItem) {
		if (!this._bRendering && this.bOutput) {
			this._startItemNavigation(true);
		}

		var bVisibleItems = this.getVisibleItems().length > 0;
		if (!bVisibleItems && !this._bInvalidatedForNoData) {
			this.invalidate();
			this._bInvalidatedForNoData = true;
		} else if (bVisibleItems && this._bInvalidatedForNoData) {
			this.invalidate();
			this._bInvalidatedForNoData = false;
		}
	};

	// this gets called when items active state is changed
	ListBase.prototype.onItemActiveChange = function(oListItem, bActive) {
		this._bActiveItem = bActive;
	};

	// this gets called when item type column requirement is changed
	ListBase.prototype.onItemHighlightChange = function(oItem, bNeedsHighlight) {
		this._iItemNeedsHighlight += (bNeedsHighlight ? 1 : -1);

		// update highlight visibility
		if (this._iItemNeedsHighlight == 1 && bNeedsHighlight) {
			this.$("listUl").addClass("sapMListHighlight");
		} else if (this._iItemNeedsHighlight == 0) {
			this.$("listUl").removeClass("sapMListHighlight");
		}
	};

	ListBase.prototype.onItemNavigatedChange = function(oItem, bNeedsNavigated) {
		this._iItemNeedsNavigated += (bNeedsNavigated ? 1 : -1);

		// update navigated visibility
		if (this._iItemNeedsNavigated == 1 && bNeedsNavigated) {
			this.$("listUl").addClass("sapMListNavigated");
		} else if (this._iItemNeedsNavigated == 0) {
			this.$("listUl").removeClass("sapMListNavigated");
		}
	};

	// this gets called when selected property of the ListItem is changed
	ListBase.prototype.onItemSelectedChange = function(oListItem, bSelected) {

		if (this.getMode() == ListMode.MultiSelect) {
			this._updateSelectedPaths(oListItem, bSelected);
			return;
		}

		if (bSelected) {
			this._aSelectedPaths = [];
			this._oSelectedItem && this._oSelectedItem.setSelected(false, true);
			this._oSelectedItem = oListItem;
		} else if (this._oSelectedItem === oListItem) {
			this._oSelectedItem = null;
		}

		// update selection path for the list item
		this._updateSelectedPaths(oListItem, bSelected);
	};

	// this gets called after the selected property of the ListItem is changed
	ListBase.prototype.onItemAfterSelectedChange = function(oListItem, bSelected) {
		this.fireEvent("itemSelectedChange", {
			listItem: oListItem,
			selected: bSelected
		});
	};

	/*
	 * Returns items container DOM reference
	 * @protected
	 */
	ListBase.prototype.getItemsContainerDomRef = function() {
		return this.getDomRef("listUl");
	};

	/*
	 *  This hook method is called if a sticky header is activated and additional height needs to be added in the  calculation of the scrolling position.
	 * @protected
	 */
	ListBase.prototype.getStickyFocusOffset = function() {
		return 0;
	};

	ListBase.prototype.checkGrowingFromScratch = function() {};

	/*
	 * This hook method gets called if growing feature is enabled and before new page loaded
	 * @protected
	 */
	ListBase.prototype.onBeforePageLoaded = function(oGrowingInfo, sChangeReason) {
		this._fireUpdateStarted(sChangeReason, oGrowingInfo);
	};

	/*
	 * This hook method get called if growing feature is enabled and after page loaded
	 * @protected
	 */
	ListBase.prototype.onAfterPageLoaded = function(oGrowingInfo, sChangeReason) {
		this._fireUpdateFinished(oGrowingInfo);
	};

	/*
	 * Adds navigation section that we can be navigate with alt + down/up
	 * @protected
	 */
	ListBase.prototype.addNavSection = function(sId) {
		this._aNavSections.push(sId);
		return sId;
	};

	/*
	 * Returns the max items count.
	 * If aggregation items is bound the count will be the length of the binding
	 * otherwise the length of the list items aggregation will be returned
	 * @protected
	 */
	ListBase.prototype.getMaxItemsCount = function() {
		var oBinding = this.getBinding("items");
		if (oBinding && oBinding.getLength) {
			return oBinding.getLength() || 0;
		}
		return this.getItems(true).length;
	};

	/*
	 * This hook method is called from renderer to determine whether items should render or not
	 * @protected
	 */
	ListBase.prototype.shouldRenderItems = function() {
		return true;
	};

	/*
	 * This hook method is called from GrowingEnablement to determine whether
	 * growing should suppress List invalidation
	 * @protected
	 */
	ListBase.prototype.shouldGrowingSuppressInvalidation = function() {
		return true;
	};

	// when new items binding we should turn back to initial state
	ListBase.prototype._resetItemsBinding = function() {
		if (this.isBound("items")) {
			this._bUpdating = false;
			this._bReceivingData = false;
			this.removeSelections(true, false, true);
			this._oGrowingDelegate && this._oGrowingDelegate.reset();
			this._hideBusyIndicator();

			/* reset focused position */
			if (this._oItemNavigation && document.activeElement.id != this.getId("nodata")) {
				this._oItemNavigation.iFocusedIndex = -1;
			}
		}
	};

	// called before update started via sorting/filtering/growing etc.
	ListBase.prototype._updateStarted = function(sReason) {
		// if data receiving/update is not started or ongoing
		if (!this._bReceivingData && !this._bUpdating) {
			this._bUpdating = true;
			this._fireUpdateStarted(sReason);
		}
	};

	// fire updateStarted event with update reason and actual/total info
	ListBase.prototype._fireUpdateStarted = function(sReason, oInfo) {
		this._sUpdateReason = capitalize(sReason || "Refresh");
		this.fireUpdateStarted({
			reason : this._sUpdateReason,
			actual : oInfo ? oInfo.actual : this.getItems(true).length,
			total : oInfo ? oInfo.total : this.getMaxItemsCount()
		});
	};

	// event listener for theme changed
	ListBase.prototype.onThemeChanged = function() {
		if (this._oGrowingDelegate) {
			this._oGrowingDelegate._updateTrigger();
		}
	};

	// called on after rendering to finalize item update finished
	ListBase.prototype._updateFinished = function() {
		// check if data receiving/update is finished
		if (!this._bReceivingData && this._bUpdating) {
			this._fireUpdateFinished();
			this._bUpdating = false;
		}
	};

	// fire updateFinished event delayed to make sure rendering phase is done
	ListBase.prototype._fireUpdateFinished = function(oInfo) {
		setTimeout(function() {
			this._bItemNavigationInvalidated = true;
			this.fireUpdateFinished({
				reason : this._sUpdateReason,
				actual : oInfo ? oInfo.actual : this.getItems(true).length,
				total : oInfo ? oInfo.total : this.getMaxItemsCount()
			});
		}.bind(this), 0);
	};

	ListBase.prototype._showBusyIndicator = function() {
		if (this.getEnableBusyIndicator() && !this.getBusy() && !this._bBusy) {
			// set the busy state
			this._bBusy = true;

			// set busy property
			this.setBusy(true, "listUl");
		}
	};

	ListBase.prototype._hideBusyIndicator = function() {
		if (this._bBusy) {
			// revert busy state
			this._bBusy = false;
			if (this.getEnableBusyIndicator()) {
				// only call the setBusy method if enableBusyIndicator=true
				this.setBusy(false, "listUl");

				// while the control is busy the focus events are blocked by the BlockLayer
				const oNavigationRoot = this.getNavigationRoot();
				if (document.activeElement == oNavigationRoot) {
					jQuery(oNavigationRoot).trigger("focus");
				}
			}
		}
	};

	ListBase.prototype.setBusy = function(bBusy, sBusySection) {
		if (this.getBusy() == bBusy) {
			return this;
		}

		Control.prototype.setBusy.apply(this, arguments);
		if (!bBusy || !window.IntersectionObserver) {
			clearTimeout(this._iBusyTimer);
			return this;
		}

		this._iBusyTimer = setTimeout(function() {
			var oBusyDom = this.getDomRef(sBusySection);
			var oAnimDom = this.getDomRef("busyIndicator");
			var oScrollDelegate = library.getScrollDelegate(this, true);
			if (!oBusyDom || !oAnimDom || !oScrollDelegate) {
				return;
			}

			var oBusyObserver = new window.IntersectionObserver(function(aEntries) {
				oBusyObserver.disconnect();
				var oEntry = aEntries.pop();
				var fRatio = oEntry.intersectionRatio;
				if (fRatio <= 0 || fRatio >= 1) {
					return;
				}

				var oStyle = oAnimDom.firstChild.style;
				if (oEntry.intersectionRect.height >= oEntry.rootBounds.height) {
					oStyle.position = "sticky";
				} else {
					oStyle.top = ((oEntry.boundingClientRect.top < 0 ? 1 - fRatio : 0) + (fRatio / 2)) * 100 + "%";
				}
			}, {
				root: oScrollDelegate.getContainerDomRef()
			});

			oBusyObserver.observe(oBusyDom);
		}.bind(this), this.getBusyIndicatorDelay());

		return this;
	};

	ListBase.prototype.onItemBindingContextSet = function(oItem) {
		// determine whether selection remember is necessary or not
		if (!this._bSelectionMode || !this.getRememberSelections() || !this.isBound("items")) {
			return;
		}

		// if selected property two-way bound then we do not need to update the selection
		if (oItem.isSelectedBoundTwoWay()) {
			return;
		}

		// update the item selection
		var sPath = oItem.getBindingContextPath();
		if (sPath) {
			var bSelected = (this._aSelectedPaths.indexOf(sPath) > -1);
			oItem.setSelected(bSelected);
		}
	};

	ListBase.prototype.onItemRemoved = function(oItem) {
		oItem._bGroupHeader = false;
		if (this._oLastGroupHeader == oItem) {
			this._oLastGroupHeader = null;
		}
		if (this._oSelectedItem == oItem) {
			this._oSelectedItem = null;
		}
	};

	ListBase.prototype.onItemInserted = function(oItem, bSelectedDelayed) {
		// trigger is also an item of the ListBase which should not me mapped to the groupHeaders
		if (this._oLastGroupHeader && !oItem.isGroupHeader()) {
			this._oLastGroupHeader.setGroupedItem(oItem);
		}

		if (bSelectedDelayed) {
			// item was already selected before inserted to the list
			this.onItemSelectedChange(oItem, true);
		}

		if (!this._bSelectionMode ||
			!this._aSelectedPaths.length ||
			!this.getRememberSelections() ||
			!this.isBound("items") ||
			oItem.isSelectedBoundTwoWay() ||
			oItem.getSelected()) {
			return;
		}

		// retain item selection
		var sPath = oItem.getBindingContextPath();
		if (sPath && this._aSelectedPaths.indexOf(sPath) > -1) {
			oItem.setSelected(true);
		}
	};

	// this gets called from item when selection is changed via checkbox/radiobutton/press event
	ListBase.prototype.onItemSelect = function(oListItem, bSelected) {
		var sMode = this.getMode();

		if (this._mRangeSelection) {
			// if this._mRangeSelection.selected == false, then simply select the item
			if (!this._mRangeSelection.selected) {
				this._fireSelectionChangeEvent([oListItem]);
				// update the _mRangeSelection object so that RangeSelection mode can be resumed as expected by the user
				this._mRangeSelection.index = this.getVisibleItems().indexOf(oListItem);
				this._mRangeSelection.selected = bSelected;
				return;
			}

			// if the item is deselected in rangeSelection mode, then this action should be prevented
			if (!bSelected) {
				oListItem.setSelected(true);
				return;
			}

			var iListItemIndex = this.indexOfItem(oListItem),
				aItems = this.getItems(),
				iItemsRangeToSelect,
				oItemToSelect,
				aSelectedItemsRange = [],
				iDirection;

			if (iListItemIndex < this._mRangeSelection.index) {
				iItemsRangeToSelect = this._mRangeSelection.index - iListItemIndex;
				iDirection = -1;
			} else {
				iItemsRangeToSelect = iListItemIndex - this._mRangeSelection.index;
				iDirection = 1;
			}

			for (var i = 1; i <= iItemsRangeToSelect; i++) {
				oItemToSelect = aItems[this._mRangeSelection.index + (i * iDirection)];

				// if item is not visible or item is already selected then do not fire the selectionChange event
				if (oItemToSelect.isSelectable() && oItemToSelect.getVisible() && !oItemToSelect.getSelected()) {
					oItemToSelect.setSelected(true);
					aSelectedItemsRange.push(oItemToSelect);
				} else if (oItemToSelect === oListItem) {
					// oListItem.getSelected() === true, hence just add item to the aSelectedItemsRange array
					aSelectedItemsRange.push(oItemToSelect);
				}
			}

			this._fireSelectionChangeEvent(aSelectedItemsRange);
			return;
		}

		if (sMode === ListMode.MultiSelect || (this._bSelectionMode && bSelected)) {
			this._fireSelectionChangeEvent([oListItem]);

			// announce the selection state changes
			// but only announce if the document.activeElement is the listItem control, else selection control should announce the selection change
			if (this.getAriaRole() === "list" && document.activeElement === oListItem.getDomRef()) {
				var oResourceBundle = Library.getResourceBundleFor("sap.m");
				InvisibleMessage.getInstance().announce(bSelected ? oResourceBundle.getText("LIST_ITEM_SELECTED") : oResourceBundle.getText("LIST_ITEM_NOT_SELECTED"), "Assertive");
			}
		}
	};

	// Fire selectionChange event and support old select event API
	ListBase.prototype._fireSelectionChangeEvent = function(aListItems, bSelectAll) {
		var oListItem = aListItems && aListItems[0];
		if (!oListItem) {
			return;
		}

		// fire event
		this.fireSelectionChange({
			listItem : oListItem,
			listItems : aListItems,
			selected : oListItem.getSelected(),
			selectAll: !!bSelectAll
		});

		if (this.getGrowing()) {
			this._bSelectAll = bSelectAll;
		}
	};

	// this gets called from item when delete is triggered via delete button
	ListBase.prototype.onItemDelete = function(oListItem) {
		this.fireDelete({
			listItem : oListItem
		});
	};

	// this gets called from item when item is pressed(enter/tap/click)
	ListBase.prototype.onItemPress = function(oListItem, oSrcControl) {

		// do not fire press event for inactive type
		if (oListItem.getType() == ListItemType.Inactive) {
			return;
		}

		// fire event async
		setTimeout(function() {
			this.fireItemPress({
				listItem : oListItem,
				srcControl : oSrcControl
			});
		}.bind(this), 0);
	};

	ListBase.prototype.onItemKeyDown = function (oItem, oEvent) {
		// prevent rangeSelection when SHIFT key is used with an additional key combination (e.g. CTRL + SHIFT + TAB)
		// prevent rangeSelection also for fast navigation (SHIFT + F6)
		if (!oEvent.shiftKey ||
			oEvent.ctrlKey ||
			oEvent.altKey ||
			oEvent.metaKey ||
			oEvent.code == "Tab" ||
			this.getMode() !== ListMode.MultiSelect ||
			!oItem.isSelectable() ||
			oEvent.key === "F6") {
			if (this._mRangeSelection) {
				this._mRangeSelection = null;
			}
			return;
		}

		var aVisibleItems = this.getVisibleItems(),
			bHasVisibleSelectedItems = aVisibleItems.some(function(oVisibleItem) {
				return !!oVisibleItem.getSelected();
			});

		// if there are no visible selected items then no action required in rangeSelection mode
		if (!bHasVisibleSelectedItems) {
			return;
		}

		if (!this._mRangeSelection) {
			this._mRangeSelection = {
				index: this.indexOfItem(oItem),
				selected: oItem.getSelected()
			};
		}
	};

	ListBase.prototype.onItemKeyUp = function(oItem, oEvent) {
		// end of range selection when SHIFT key is released
		if (oEvent.key === "Shift") {
			this._mRangeSelection = null;
		}
	};

	// insert or remove given item's path from selection array
	ListBase.prototype._updateSelectedPaths = function(oItem, bSelect) {
		if (!this.getRememberSelections() || !this.isBound("items")) {
			return;
		}

		const sModelName = this.getBindingInfo("items").model;
		const oBindingContext = oItem.getBindingContext(sModelName);
		const sPath = oBindingContext?.getPath();
		if (!sPath) {
			return;
		}

		const iIndex = this._aSelectedPaths.indexOf(sPath);
		bSelect = (bSelect === undefined) ? oItem.getSelected() : bSelect;
		if (bSelect) {
			iIndex < 0 && this._aSelectedPaths.push(sPath);
		} else {
			iIndex > -1 && this._aSelectedPaths.splice(iIndex, 1);
		}

		if (oBindingContext.setSelected && !oBindingContext.isTransient()) {
			oBindingContext.setSelected(bSelect);
		}
	};

	ListBase.prototype._destroyGrowingDelegate = function() {
		if (this._oGrowingDelegate) {
			this._oGrowingDelegate.destroy();
			this._oGrowingDelegate = null;
		}
	};

	ListBase.prototype._destroyItemNavigation = function() {
		if (this._oItemNavigation) {
			this.removeEventDelegate(this._oItemNavigation);
			this._oItemNavigation.destroy();
			this._oItemNavigation = null;
		}
	};

	/**
	 * After swipe content is shown on the right hand side of the list item
	 * we will block the touch events and this method defines this touch blocker area.
	 * It must be always child/ren of the area because we will listen parent's touch events
	 *
	 * @private
	 */
	ListBase.prototype._getTouchBlocker = function() {
		return this.$().children();
	};

	ListBase.prototype._getSwipeContainer = function() {
		if (!this._$swipeContainer) {
			this._$swipeContainer = jQuery("<div>", {
				"id" : this.getId("swp"),
				"class" : "sapMListSwp"
			});
		}
		return this._$swipeContainer;
	};

	ListBase.prototype._setSwipePosition = function() {
		if (this._isSwipeActive) {
			return this._getSwipeContainer().css("top", this._swipedItem.$().position().top);
		}
	};

	ListBase.prototype._renderSwipeContent = function() {
		var $listitem = this._swipedItem.$(),
			$container = this._getSwipeContainer();

		// add swipe container into list if it is not there
		this.$().prepend($container.css({
			top : $listitem.position().top,
			height : $listitem.outerHeight(true)
		}));

		// render swipe content into swipe container if needed
		if (this._bRerenderSwipeContent) {
			this._bRerenderSwipeContent = false;
			var rm = new RenderManager().getInterface();
			rm.render(this.getSwipeContent(), $container.empty()[0]);
			rm.destroy();
		}

		// for method chaining
		return this;
	};

	ListBase.prototype._swipeIn = function() {
		var that = this,	// scope
			$blocker = that._getTouchBlocker(),
			$container = that._getSwipeContainer();

		// render swipe content
		that._isSwipeActive = true;
		that._renderSwipeContent();

		// add to instance manager
		InstanceManager.addPopoverInstance(that);

		// maybe keyboard is opened
		window.document.activeElement.blur();

		// check orientation change and recalculate the position
		jQuery(window).on("resize.swp", function() {
			that._setSwipePosition();
		});

		// block touch events
		$blocker.css("pointer-events", "none").on("touchstart.swp mousedown.swp", function(e){
			if (!$container[0].firstChild.contains(e.target)) {
				e.preventDefault();
				e.stopPropagation();
			}
		});

		// UX: swipeout is not interruptible till animation is finished
		$container.on("webkitAnimationEnd animationend", function() {
			jQuery(this).off("webkitAnimationEnd animationend");
			// disable animation and focus to container
			$container.css("opacity", 1).trigger("focus");

			// check parents touchend for auto hide mode
			$blocker.parent().on("touchend.swp touchcancel.swp mouseup.swp", function(e) {
				// checks if event source is coming from swipe container's first child
				if (!$container[0].firstChild.contains(e.target)) {
					that.swipeOut();
				}
			});
		}).removeClass("sapMListSwpOutAnim").addClass("sapMListSwpInAnim");
	};

	ListBase.prototype._onSwipeOut = function(callback) {
		// remove container from DOM and disable animation event
		this._getSwipeContainer().css("opacity", 0).remove();

		// remove windows resize listener
		jQuery(window).off("resize.swp");

		// enable touch events again
		this._getTouchBlocker().css("pointer-events", "auto").off("touchstart.swp mousedown.swp");

		if (typeof callback == "function") {
			callback.call(this, this._swipedItem, this.getSwipeContent());
		}

		this._isSwipeActive = false;

		// remove from instance manager
		InstanceManager.removePopoverInstance(this);
	};


	/**
	 * After swipeContent is shown, user can interact with this control(e.g Tap). After interaction is done, you can/should use this method to hide swipeContent from screen.
	 * Note: If users try to tap inside of the list but outside of the swipeContent then control hides automatically.
	 *
	 * @param {function} callback
	 *         This callback function is called with two parameters(swipedListItem and swipedContent) after swipe-out animation is finished.
	 * @type this
	 * @public
	 */
	ListBase.prototype.swipeOut = function(callback) {
		if (!this._isSwipeActive) {
			return this;
		}

		var that = this,
			$container = this._getSwipeContainer();

		// stop listening parents touchend event
		this._getTouchBlocker().parent().off("touchend.swp touchend.swp touchcancel.swp mouseup.swp");

		// add swipeout animation and listen this
		$container.on("webkitAnimationEnd animationend", function() {
			jQuery(this).off("webkitAnimationEnd animationend");
			that._onSwipeOut(callback);
		}).removeClass("sapMListSwpInAnim").addClass("sapMListSwpOutAnim");

		return this;
	};

	/**
	 * Close and hide the opened swipe content immediately
	 * @private
	 */
	ListBase.prototype._removeSwipeContent = function() {
		if (this._isSwipeActive) {
			this.swipeOut()._onSwipeOut();
		}
	};

	/**
	 * This method is required from sap.m.InstanceManager
	 * To remove swipe content when back button is pressed
	 */
	ListBase.prototype.close = ListBase.prototype._removeSwipeContent;

	/**
	 * Called on swipe event to bring in the swipeContent control.
	 * Swipe direction the value can be <code>BeginToEnd</code> (left to right in LTR languages
	 * and right to left in RTL languages) or <code>EndToBegin</code> (right to left in LTR languages
	 * and left to right in RTL languages)
	 */
	ListBase.prototype._onSwipe = function(oEvent, swipeDirection) {
		var oContent = this.getSwipeContent(),
			oSrcControl = oEvent.srcControl;

		if (oContent && oSrcControl && !this._isSwipeActive && this !== oSrcControl && !this._eventHandledByControl
				&& Device.support.touch) {
			// source can be anything so, check parents and find the list item
			/*eslint-disable no-extra-semi, curly */
			for (var li = oSrcControl; li && !(li instanceof ListItemBase); li = li.oParent);
			/*eslint-enable no-extra-semi, curly */
			if (li instanceof ListItemBase) {
				this._swipedItem = li;

				// fire event earlier to let the user change swipeContent according to list item
				// if the event not is canceled then start the animation
				this.fireSwipe({
					listItem : this._swipedItem,
					swipeContent : oContent,
					srcControl : oSrcControl,
					swipeDirection: swipeDirection
				}, true) && this._swipeIn();
			}
		}
	};

	ListBase.prototype.ontouchstart = function(oEvent) {
		this._eventHandledByControl = oEvent.isMarked();
	};

	// Swipe from the end to the begin - right to left in LTR and left to right in RTL languages.
	ListBase.prototype.onswipeleft = function(oEvent) {
		var bRtl = Localization.getRTL();
		var exceptDirection = bRtl ? SwipeDirection.EndToBegin : SwipeDirection.BeginToEnd;
		var swipeDirection = this.getSwipeDirection();

		if (swipeDirection != exceptDirection) {
			if (swipeDirection == SwipeDirection.Both) {
				swipeDirection = bRtl ? SwipeDirection.BeginToEnd : SwipeDirection.EndToBegin;
			}
			this._onSwipe(oEvent, swipeDirection);
		}
	};

	// Swipe from the begin to the end - left to right in LTR and right to left in RTL languages.
	ListBase.prototype.onswiperight = function(oEvent) {
		var bRtl = Localization.getRTL();
		var exceptDirection = bRtl ? SwipeDirection.BeginToEnd : SwipeDirection.EndToBegin;
		var swipeDirection = this.getSwipeDirection();

		if (swipeDirection != exceptDirection) {
			if (swipeDirection == SwipeDirection.Both) {
				swipeDirection = bRtl ? SwipeDirection.EndToBegin : SwipeDirection.BeginToEnd;
			}
			this._onSwipe(oEvent, swipeDirection);
		}
	};

	ListBase.prototype.setSwipeDirection = function(sDirection) {
		return this.setProperty("swipeDirection", sDirection, true);
	};


	/**
	 * Returns swiped list item. When no item is swiped, "null" is returned.
	 *
	 * @type sap.m.ListItemBase
	 * @public
	 */
	ListBase.prototype.getSwipedItem = function() {
		return (this._isSwipeActive ? this._swipedItem : null);
	};

	ListBase.prototype.setSwipeContent = function(oControl) {
		this._bRerenderSwipeContent = true;

		this.toggleStyleClass("sapMListSwipable", !!oControl);

		// prevent list from re-rendering on setSwipeContent
		return this.setAggregation("swipeContent", oControl, !this._isSwipeActive);
	};

	ListBase.prototype.invalidate = function(oOrigin) {
		if (oOrigin && oOrigin === this.getSwipeContent()) {
			this._bRerenderSwipeContent = true;
			this._isSwipeActive && this._renderSwipeContent();
			return;
		}

		return Control.prototype.invalidate.apply(this, arguments);
	};

	ListBase.prototype.addItemGroup = function(oGroup, oHeader, bSuppressInvalidate) {
		if (!oHeader) {
			oHeader = this.getGroupHeaderTemplate(oGroup);
		}

		oHeader._bGroupHeader = true;
		this.addAggregation("items", oHeader, bSuppressInvalidate);
		this.setLastGroupHeader(oHeader);
		return oHeader;
	};

	ListBase.prototype.getGroupHeaderTemplate = function(oGroup) {
		var oHeader = new GroupHeaderListItem();
		// setter is used to avoid complex binding parser checks which happens when setting values in constructor (ManagedObject)
		// i.e., to ignore binding strings "{" "[" from the value being set
		oHeader.setTitle(oGroup.text || oGroup.key);
		return oHeader;
	};

	ListBase.prototype.setLastGroupHeader = function(oGroupHeader) {
		this._oLastGroupHeader = oGroupHeader;
	};

	ListBase.prototype.getLastGroupHeader = function() {
		return this._oLastGroupHeader;
	};

	ListBase.prototype.removeGroupHeaders = function(bSuppressInvalidate) {
		this.getItems(true).forEach(function(oItem) {
			if (oItem.isGroupHeader()) {
				oItem.destroy(bSuppressInvalidate);
			}
		});
	};

	ListBase.prototype.getAccessibilityType = function() {
		return Library.getResourceBundleFor("sap.m").getText("ACC_CTR_TYPE_LIST");
	};

	ListBase.prototype.getAccessibilityStates = function() {
		if (!this.getItems(true).length) {
			return "";
		}

		var sStates = "",
			mMode = ListMode,
			sMode = this.getMode(),
			oBundle = Library.getResourceBundleFor("sap.m");

		if (LabelEnablement.isRequired(this)) {
			sStates += oBundle.getText("LIST_REQUIRED") + " ";
		}

		if (sMode == mMode.Delete) {
			sStates += oBundle.getText("LIST_DELETABLE") + " . ";
		} else if (this.getAriaRole() == "list") {
			if (sMode == mMode.MultiSelect) {
				sStates += oBundle.getText("LIST_MULTISELECTABLE") + " . ";
			} else if (sMode != mMode.None) {
				sStates += oBundle.getText("LIST_SELECTABLE") + " . ";
			}
		}

		if (this.isGrouped()) {
			sStates += oBundle.getText("LIST_GROUPED") + " . ";
		}

		return sStates;
	};

	ListBase.prototype.getAccessibilityInfo = function() {
		return {
			description: this.getAccessibilityStates().trim(),
			focusable: true
		};
	};

	ListBase.prototype.getAccessbilityPosition = function(oItem) {
		var iSetSize, iPosInSet,
			aItems = this.getVisibleItems(),
			sAriaRole = this.getAriaRole(),
			bExcludeGroupHeaderFromCount = (sAriaRole === "list" || sAriaRole === "listbox");

		if (bExcludeGroupHeaderFromCount) {
			aItems = aItems.filter(function(oItem) {
				return !oItem.isGroupHeader();
			});
		}

		if (oItem) {
			iPosInSet = aItems.indexOf(oItem) + 1;
		}

		var oBinding = this.getBinding("items");
		if (oBinding && this.getGrowing() && this.getGrowingScrollToLoad()) {
			iSetSize = oBinding.getLength();
			if (!bExcludeGroupHeaderFromCount && oBinding.isGrouped()) {
				iSetSize += aItems.filter(function(oItem) {
					return oItem.isGroupHeader();
				}).length;
			}
		} else {
			iSetSize = aItems.length;
		}

		return {
			setsize: iSetSize,
			posinset: iPosInSet
		};
	};

	// this gets called when the focus is on the item or its content
	ListBase.prototype.onItemFocusIn = function(oItem, oFocusedControl, oEvent) {
		// focus and scroll handling for sticky elements
		this._handleTargetItemFocus(oEvent.target);

		if (oItem !== oFocusedControl || oEvent.isMarked("contentAnnouncementGenerated") ||
			!ControlBehavior.isAccessibilityEnabled()) {
			return;
		}

		var oItemDomRef = oItem.getDomRef();

		if (!oItem.getContentAnnouncement) {
			// let the screen reader announce the whole content
			this.getNavigationRoot().setAttribute("aria-activedescendant", oItemDomRef.id);
		} else {
			// prepare the announcement for the screen reader
			this.setInvisibleTextAssociation(oItem);
		}
	};

	/**
	 * For the specified list item it updates the invisible text and sets the aria-labelledby association.
	 *
	 * @param {sap.m.ListItemBase} oItem The list item whose invisible text association should be set
	 * @private
	 */
	ListBase.prototype.setInvisibleTextAssociation = function(oItem) {
		var oAccInfo = oItem.getAccessibilityInfo(),
			oBundle = Library.getResourceBundleFor("sap.m"),
			sDescription = oAccInfo.type ? oAccInfo.type + " . " : "";

		if (this.isA("sap.m.Table")) {
			var mPosition = this.getAccessbilityPosition(oItem);
			sDescription += oBundle.getText("LIST_ITEM_POSITION", [mPosition.posinset, mPosition.setsize]) + " . ";
		}

		sDescription += oAccInfo.description;
		this.updateInvisibleText(sDescription, oItem.getDomRef());
	};

	ListBase.prototype.onItemFocusOut = function(oItem) {
		this.removeInvisibleTextAssociation(oItem.getDomRef());
	};

	/**
	 * For the specified <code>HTMLElement</code> it removes the aria-labelledby association to the invisible text.
	 *
	 * @param {HTMLElement} oDomRef The <code>HTMLElement</code> whose invisible text association should be removed
	 * @private
	 */
	ListBase.prototype.removeInvisibleTextAssociation = function(oDomRef) {
		const oInvisibleText = ListBase.getInvisibleText(),
			$FocusedItem = jQuery(oDomRef || document.activeElement);
		$FocusedItem.removeAriaLabelledBy(oInvisibleText.getId());
	};

	/**
	 * It simulates focus by adding the corresponding style classes and updating the invisible text association.
	 * <b>Note</b>: Fake focus is not set when the real focus is inside the list. If the fake focus is set, it gets removed when the real focus lands inside the list.
	 *
	 * @param {sap.m.ListItemBase|null} oItem The list item to receive fake focus, null to remove it
	 * @private
	 * @ui5-restricted sap.m, sap.ui.mdc
	 */
	ListBase.prototype.setFakeFocus = function(oItem) {
		if (this._oLastFakeFocusedItem) {
			this._oLastFakeFocusedItem.removeStyleClass("sapMLIBFocused");
			this.removeInvisibleTextAssociation(this._oLastFakeFocusedItem.getDomRef());
			this._oLastFakeFocusedItem = null;
		}

		if (oItem && !this.getDomRef().contains(document.activeElement)) {
			this._oLastFakeFocusedItem = oItem;
			oItem.addStyleClass("sapMLIBFocused");
			this.setInvisibleTextAssociation(oItem);
		}
	};

	ListBase.prototype.updateInvisibleText = function(sText, oItemDomRef, bPrepend) {
		var oInvisibleText = ListBase.getInvisibleText(),
			$FocusedItem = jQuery(oItemDomRef || document.activeElement);

		if (this.bAnnounceDetails) {
			this.bAnnounceDetails = false;
			sText = this.getAccessibilityInfo().description + " " + sText;
		}

		oInvisibleText.setText(sText.trim());
		$FocusedItem.addAriaLabelledBy(oInvisibleText.getId(), bPrepend);
	};

	/* Keyboard Handling */
	ListBase.prototype.getNavigationRoot = function() {
		return this.getDomRef("listUl");
	};

	ListBase.prototype.getFocusDomRef = function() {
		// let the item navigation handle focus
		return this.getNavigationRoot();
	};

	ListBase.prototype._startItemNavigation = function(bIfNeeded) {

		// item navigation only for desktop
		var oDomRef = this.getDomRef();
		if (!Device.system.desktop || !oDomRef) {
			return;
		}

		// focus on root element should be prevented by showNoData=false and there a no items & destroy ItemNavigation
		if (!this.getShowNoData() && !this.getVisibleItems().length && oDomRef) {
			oDomRef.classList.add("sapMListPreventFocus");
			this._destroyItemNavigation();
			return;
		}

		if (oDomRef) {
			oDomRef.classList.remove("sapMListPreventFocus");
		}

		// if focus is not on the navigation items then only invalidate the item navigation
		var oNavigationRoot = this.getNavigationRoot();
		if (bIfNeeded && oNavigationRoot && !oNavigationRoot.contains(document.activeElement)) {
			this._bItemNavigationInvalidated = true;
			oNavigationRoot.tabIndex = "0";
			return;
		}

		// init item navigation
		if (!this._oItemNavigation) {
			this._oItemNavigation = new ItemNavigation();
			this._oItemNavigation.setCycling(false);
			this.addDelegate(this._oItemNavigation);

			// set the tab index of navigation root
			this._oItemNavigation.setTabIndex0(0);
			this._oItemNavigation.iActiveTabIndex = -1;

			// explicitly setting table mode with one column
			// to disable up/down reaction on events of the cell
			this._oItemNavigation.setTableMode(true, true).setColumns(1);

			// alt + up/down will be used for section navigation
			// alt/meta + left/right in the browser is used by default for navigating backwards or forwards in the browser history
			// notify item navigation not to handle alt, meta key modifiers
			this._oItemNavigation.setDisabledModifiers({
				sapnext : ["alt", "meta", "ctrl"],
				sapprevious : ["alt", "meta", "ctrl"]
			});
		}

		// TODO: Maybe we need a real paging algorithm here
		this._oItemNavigation.setPageSize(this.getGrowingThreshold());

		// configure navigation root
		this._oItemNavigation.setRootDomRef(oNavigationRoot);

		// configure navigation items
		this.setNavigationItems(this._oItemNavigation, oNavigationRoot);

		// clear invalidations
		this._bItemNavigationInvalidated = false;

		if (document.activeElement == oNavigationRoot) {
			jQuery(oNavigationRoot).trigger("focus");
		}
	};

	/*
	 * Sets DOM References for keyboard navigation
	 *
	 * @param {sap.ui.core.delegate.ItemNavigation} oItemNavigation
	 * @param {HTMLElement} [oNavigationRoot]
	 * @protected
	 * @since 1.26
	 */
	ListBase.prototype.setNavigationItems = function(oItemNavigation, oNavigationRoot) {
		var aNavigationItems = jQuery(oNavigationRoot).children(".sapMLIB").get();
		oItemNavigation.setItemDomRefs(aNavigationItems);
		if (oItemNavigation.getFocusedIndex() == -1) {
			if (this.getGrowing() && this.getGrowingDirection() == ListGrowingDirection.Upwards) {
				oItemNavigation.setFocusedIndex(aNavigationItems.length - 1);
			} else {
				oItemNavigation.setFocusedIndex(0);
			}
		}
	};

	/**
	 * Returns the ItemNavigation delegate of the list
	 * @since 1.16.5
	 * @returns {sap.ui.core.delegate.ItemNavigation|undefined}
	 * @protected
	 */
	ListBase.prototype.getItemNavigation = function() {
		return this._oItemNavigation;
	};

	/*
	 * Forward tab before or after List
	 * This function should be called before tab key is pressed
	 *
	 * @see sap.m.ListItemBase#onsaptabnext
	 * @see sap.m.ListItemBase#onsaptabprevious
	 * @since 1.26
	 * @protected
	 */
	ListBase.prototype.forwardTab = function(bForward) {
		this._bIgnoreFocusIn = true;
		this.$(bForward ? "after" : "before").trigger("focus");
	};

	// move focus out of the list
	ListBase.prototype.onsaptabnext = ListBase.prototype.onsaptabprevious = function(oEvent) {
		if (oEvent.isMarked() || oEvent.target.id == this.getId("trigger")) {
			return;
		}

		if (oEvent.target.matches(".sapMLIBFocusable,.sapMTblCellFocusable") ||
			oEvent.target === jQuery(this.getNavigationRoot()).find(":sapTabbable").get(oEvent.type == "saptabnext" ? -1 : 0)) {
			this.forwardTab(oEvent.type == "saptabnext");
			oEvent.setMarked();
		}
	};

	// navigate to previous or next section according to current focus position
	ListBase.prototype._navToSection = function(bForward) {
		var $TargetSection;
		var iIndex = 0;
		var iStep = bForward ? 1 : -1;
		var iLength = this._aNavSections.length;

		// find the current section index
		this._aNavSections.some(function(sSectionId, iSectionIndex) {
			var oSectionDomRef = (sSectionId ? window.document.getElementById(sSectionId) : null);
			if (oSectionDomRef && oSectionDomRef.contains(document.activeElement)) {
				iIndex = iSectionIndex;
				return true;
			}
		});

		// if current section is items container then save the current focus position
		var oItemsContainerDomRef = this.getItemsContainerDomRef();
		var $CurrentSection = jQuery(document.getElementById(this._aNavSections[iIndex]));
		if ($CurrentSection[0] === oItemsContainerDomRef && this._oItemNavigation) {
			$CurrentSection.data("redirect", this._oItemNavigation.getFocusedIndex());
		}

		// find the next focusable section
		this._aNavSections.some(function() {
			iIndex = (iIndex + iStep + iLength) % iLength;	// circle
			$TargetSection = jQuery(document.getElementById(this._aNavSections[iIndex]));

			// if target is items container
			if ($TargetSection[0] === oItemsContainerDomRef && this._oItemNavigation) {
				var iRedirect = $TargetSection.data("redirect");
				var oItemDomRefs = this._oItemNavigation.getItemDomRefs();
				var oTargetSection = oItemDomRefs[iRedirect] || oItemsContainerDomRef.children[0];
				$TargetSection = jQuery(oTargetSection);
			}

			if ($TargetSection.is(":focusable")) {
				$TargetSection.trigger("focus");
				return true;
			}

		}, this);

		// return the found section
		return $TargetSection;
	};

	// Handle Alt + Down
	ListBase.prototype.onsapshow = function(oEvent) {
		// handle events that are only coming from navigation items and ignore F4
		if (oEvent.isMarked() ||
			oEvent.key == "F4" ||
			oEvent.target.id != this.getId("trigger") &&
			!jQuery(oEvent.target).hasClass(this.sNavItemClass)) {
			return;
		}

		// move focus to the next section
		if (this._navToSection(true)) {
			oEvent.preventDefault();
			oEvent.setMarked();
		}
	};

	// Handle Alt + Up
	ListBase.prototype.onsaphide = function(oEvent) {
		// handle events that are only coming from navigation items
		if (oEvent.isMarked() ||
			oEvent.target.id != this.getId("trigger") &&
			!jQuery(oEvent.target).hasClass(this.sNavItemClass)) {
			return;
		}

		// move focus to the previous section
		if (this._navToSection(false)) {
			oEvent.preventDefault();
			oEvent.setMarked();
		}
	};

	ListBase.prototype.onkeydown = function(oEvent) {
		if (oEvent.isMarked()) {
			return;
		}

		var $Target = jQuery(oEvent.target);
		var $FocusableItem = $Target.closest(".sapMLIBFocusable").next(".sapMListTblSubRow").addBack();
		if (!$FocusableItem[0]) {
			$FocusableItem = $Target.closest(".sapMListTblSubRow").prev(".sapMLIBFocusable").addBack();
		}
		if (!$FocusableItem[0]) {
			return;
		}

		var bItemEvent = $Target.hasClass("sapMLIBFocusable");
		var preventDefault = function() {
			oEvent.preventDefault();
			oEvent.setMarked();
		};

		// Ctrl + (Shift) + A: select/deselect all
		if (oEvent.code == "KeyA" && (oEvent.metaKey || oEvent.ctrlKey) && bItemEvent && this.getMode() == ListMode.MultiSelect) {
			var bClearAll = (this.getMultiSelectMode() == MultiSelectMode.ClearAll);
			if (oEvent.shiftKey) {
				if (bClearAll) {
					this.removeSelections(false, true);
					oEvent.setMarked("sapMTableClearAll");
				}
			} else if (!bClearAll) {
				if (this.isAllSelectableSelected()) {
					this.removeSelections(false, true);
					oEvent.setMarked("sapMTableClearAll");
				} else {
					this.selectAll(true);
				}
			}
			return preventDefault();
		}

		// Enter / F2: focus from container to the content
		if ((oEvent.code == "Enter" || oEvent.code == "F2") && $Target.hasClass("sapMTblCellFocusable")) {
			$Target.find(":sapTabbable").first().trigger("focus");
			return preventDefault();
		}

		// F2 / F7: focus from item to the first interactive element
		if ((oEvent.code == "F2" && bItemEvent) || (oEvent.code == "F7" && bItemEvent && this._iFocusIndexOfItem == undefined)) {
			$FocusableItem.find(":sapTabbable").first().trigger("focus");
			return preventDefault();
		}

		// F2: focus from editable content to the container
		if (oEvent.code == "F2" && !bItemEvent) {
			jQuery($Target.closest(".sapMTblCellFocusable")[0] || $FocusableItem[0]).trigger("focus");
			return preventDefault();
		}

		// F7: switch focus between content and item
		if (oEvent.code == "F7") {
			if (bItemEvent) {
				$FocusableItem.find(":sapFocusable").eq(this._iFocusIndexOfItem).trigger("focus");
			} else {
				this._iFocusIndexOfItem = $FocusableItem.find(":sapFocusable").index($Target);
				$FocusableItem.eq(0).trigger("focus");
			}
			return preventDefault();
		}
	};

	ListBase.prototype.onmousedown = function(oEvent) {
		// check whether item navigation should be reapplied from scratch
		if (this._bItemNavigationInvalidated) {
			this._startItemNavigation();
		}

		// prevent text selection when preforming range selection with SHIFT + mouse click
		if (oEvent.shiftKey && this._mRangeSelection && oEvent.srcControl.getId().includes("-selectMulti")) {
			oEvent.preventDefault();
		}
	};

	// focus to previously focused element known in item navigation
	ListBase.prototype.focusPrevious = function() {
		if (!this._oItemNavigation) {
			return;
		}

		// get the last focused element from the ItemNavigation and focus
		var aNavigationDomRefs = this._oItemNavigation.getItemDomRefs();
		var iLastFocusedIndex = this._oItemNavigation.getFocusedIndex();
		var $LastFocused = jQuery(aNavigationDomRefs[iLastFocusedIndex]);

		this.bAnnounceDetails = true;
		if (this.getKeyboardMode() == "Edit") {
			var $Tabbable = $LastFocused.find(":sapTabbable").first();
			$Tabbable[0] ? $Tabbable.trigger("focus") : $LastFocused.trigger("focus");
		} else {
			$LastFocused.trigger("focus");
		}
	};

	// Handles focus to reposition the focus to correct place
	ListBase.prototype.onfocusin = function(oEvent) {
		// ignore self focus
		if (this._bIgnoreFocusIn) {
			this._bIgnoreFocusIn = false;
			oEvent.stopImmediatePropagation(true);
			return;
		}

		// check whether item navigation should be reapplied from scratch
		if (this._bItemNavigationInvalidated) {
			this._startItemNavigation();
		}

		if (this._oLastFakeFocusedItem) {
			this.setFakeFocus(null);
		}

		var oTarget = oEvent.target;
		if (oTarget.id == this.getId("nodata")) {
			var vNoData = this.getNoData();
			var sDescription = vNoData || this.getNoDataText();
			if (vNoData && typeof vNoData !== "string") {
				sDescription = ListItemBase.getAccessibilityText(vNoData);
			}
			this.updateInvisibleText(sDescription, oTarget);
		} else if (oTarget.id == this.getId("listUl") && this.getKeyboardMode() == "Edit") {
			this.focusPrevious();
			oEvent.stopImmediatePropagation(true);
			return;
		}

		// update the focused index of item navigation when inner elements are focused
		if (this._oItemNavigation && !oTarget.matches(".sapMLIBFocusable,.sapMTblCellFocusable")) {
			var oFocusableItem = oTarget.closest(".sapMLIBFocusable,.sapMTblCellFocusable");
			if (oFocusableItem) {
				var iFocusableIndex = this._oItemNavigation.getItemDomRefs().indexOf(oFocusableItem);
				if (iFocusableIndex >= 0) {
					this._oItemNavigation.iFocusedIndex = (this.getKeyboardMode() == "Edit") ? iFocusableIndex : iFocusableIndex - iFocusableIndex % this._oItemNavigation.iColumns;
				}
			}
		}

		// handle only for backward navigation
		if (oEvent.isMarked() || !this._oItemNavigation || oTarget.id != this.getId("after")) {
			return;
		}

		this.focusPrevious();
		oEvent.setMarked();
	};

	ListBase.prototype.onsapfocusleave = function(oEvent) {
		if (this._oItemNavigation &&
			!this.bAnnounceDetails &&
			!this.getNavigationRoot().contains(document.activeElement)) {
			this.bAnnounceDetails = true;
		}
	};

	// this gets called when items up arrow key is pressed for the edit keyboard mode
	ListBase.prototype.onItemArrowUpDown = function(oListItem, oEvent) {
		if (oEvent.target instanceof HTMLTextAreaElement) {
			return;
		}

		var aItems = this.getVisibleItems(true),
			iDirection = (oEvent.type == "sapup" || oEvent.type == "sapupmodifiers" ? -1 : 1),
			iIndex = aItems.indexOf(oListItem) + iDirection,
			oItem = aItems[iIndex];

		if (oItem && oItem.isGroupHeader()) {
			oItem = aItems[iIndex + iDirection];
		}

		if (!oItem) {
			return;
		}

		var $Tabbables = oItem.getTabbables(),
			iFocusPos = oListItem.getTabbables().index(oEvent.target),
			$Element = $Tabbables.eq($Tabbables[iFocusPos] ? iFocusPos : -1);

		$Element[0] ? $Element.trigger("focus") : oItem.focus();
		$Element[0] && $Element[0].select && $Element[0].select();
		oEvent.preventDefault();
		oEvent.setMarked();
	};

	ListBase.prototype.onItemContextMenu = function(oLI, oEvent) {
		var oContextMenu = this.getContextMenu();
		if (!oContextMenu) {
			return;
		}

		var bExecuteDefault = this.fireBeforeOpenContextMenu({
			listItem: oLI,
			column: Element.getElementById(jQuery(oEvent.target).closest(".sapMListTblCell", this.getNavigationRoot()).attr("data-sap-ui-column"))
		});
		if (bExecuteDefault) {
			oEvent.setMarked();
			oEvent.preventDefault();

			var oBindingContext,
				oBindingInfo = this.getBindingInfo("items");
			if (oBindingInfo) {
				oBindingContext = oLI.getBindingContext(oBindingInfo.model);
				oContextMenu.setBindingContext(oBindingContext, oBindingInfo.model);
			}

			oContextMenu.openAsContextMenu(oEvent, oLI);
		}
	};

	ListBase.prototype.onItemUpDownModifiers = function(oItem, oEvent, iDirection) {
		if (oEvent.srcControl != oItem) {
			if (!oEvent.shiftKey && (oEvent.metaKey || oEvent.ctrlKey)) {
				this.onItemArrowUpDown(oItem, oEvent);
			}
			return;
		}

		if (!this._mRangeSelection) {
			return;
		}

		// Range selection with shift + arrow up/down only works with visible items
		var aVisibleItems = this.getVisibleItems(),
			iItemIndex = aVisibleItems.indexOf(oItem),
			oItemToSelect = aVisibleItems[iItemIndex + iDirection];

		if (!oItemToSelect) {
			if (this._mRangeSelection) {
				this._mRangeSelection = null;
			}
			// onItemSelect causes unexpected selection when the item is selected by space key (see ListItemBase.onsapspace)
			// hence marking the event
			oEvent.setMarked();
			return;
		}

		var bItemSelected = oItemToSelect.getSelected();

		if (this._mRangeSelection.direction === undefined) {
			// store the direction when first called
			// -1 indicates "up"
			// 1 indicates "down"
			this._mRangeSelection.direction = iDirection;
		} else if (this._mRangeSelection.direction !== iDirection) {
			if (this._mRangeSelection.index !== aVisibleItems.indexOf(oItem)) {
				// When moving back up/down to the item where the range selection started, the item always get deselected
				oItemToSelect = oItem;
				bItemSelected = oItemToSelect.getSelected();
				if (this._mRangeSelection.selected && bItemSelected) {
					this.setSelectedItem(oItemToSelect, false, true);
					return;
				}
			} else {
				// store the new direction once the above condition is met, so that the selection/deseelction can be handled accordingly
				this._mRangeSelection.direction = iDirection;
			}
		}

		if (this._mRangeSelection.selected !== bItemSelected && oItemToSelect.isSelectable()) {
			// selection change should only happen on selectable items
			this.setSelectedItem(oItemToSelect, this._mRangeSelection.selected, true);
		}
	};

	// return true if grouping is enabled on the binding, else false
	ListBase.prototype.isGrouped = function() {
		var oBinding = this.getBinding("items");
		return oBinding && oBinding.isGrouped();
	};

	// invalidation of the table list is not required for setting the context menu
	ListBase.prototype.setContextMenu = function(oContextMenu) {
		this.setAggregation("contextMenu", oContextMenu, true);
		return this;
	};

	// invalidation of the table list is not required for destroying the context menu
	ListBase.prototype.destroyContextMenu = function() {
		this.destroyAggregation("contextMenu", true);
		return this;
	};

	// Returns the sticky value to be added to the sticky table container.
	// sapMSticky7 is the result of sticky headerToolbar, infoToolbar and column headers.
	// sapMSticky6 is the result of sticky infoToolbar and column headers.
	// sapMSticky5 is the result of sticky headerToolbar and column headers.
	// sapMSticky4 is the result of sticky column headers only.
	// sapMSticky3 is the result of sticky headerToolbar and infoToolbar.
	// sapMSticky2 is the result of sticky infoToolbar.
	// sapMSticky1 is the result of sticky headerToolbar.
	ListBase.prototype.getStickyStyleValue = function() {
		var aSticky = this.getSticky();
		if (!aSticky || !aSticky.length) {
			this._iStickyValue = 0;
			return this._iStickyValue;
		}

		var iStickyValue = 0,
			sHeaderText = this.getHeaderText(),
			oHeaderToolbar = this.getHeaderToolbar(),
			bHeaderToolbarVisible = sHeaderText || (oHeaderToolbar && oHeaderToolbar.getVisible()),
			oInfoToolbar = this.getInfoToolbar(),
			bInfoToolbar = oInfoToolbar && oInfoToolbar.getVisible(),
			bColumnHeadersVisible = false;

		if (this.isA("sap.m.Table")) {
			bColumnHeadersVisible = this.getColumns().some(function(oColumn) {
				return oColumn.getVisible() && oColumn.getHeader();
			});
		}

		aSticky.forEach(function(sSticky) {
			if (sSticky === Sticky.HeaderToolbar && bHeaderToolbarVisible) {
				iStickyValue += 1;
			} else if (sSticky === Sticky.InfoToolbar && bInfoToolbar) {
				iStickyValue += 2;
			} else if (sSticky === Sticky.ColumnHeaders && bColumnHeadersVisible) {
				iStickyValue += 4;
			}
		});

		this._iStickyValue = iStickyValue;
		return this._iStickyValue;
	};

	// gets the sticky header position and scrolls the page so that the targeted item is completely visible when focused
	ListBase.prototype._handleTargetItemFocus = function(oTargetItemDomRef) {
		if (!this._iStickyValue) {
			return;
		}

		var oScrollDelegate = library.getScrollDelegate(this, true);
		if (!oScrollDelegate) {
			return;
		}

		// check the all the sticky element and get their height
		var iTHRectHeight = 0,
			iTHRectBottom = 0,
			iInfoTBarContainerRectHeight = 0,
			iInfoTBarContainerRectBottom = 0,
			iHeaderToolbarRectHeight = 0,
			iHeaderToolbarRectBottom = 0,
			iStickyFocusOffset = this.getStickyFocusOffset();

		if (this._iStickyValue & 4 /* ColumnHeaders */) {
			var oTblHeaderDomRef = this.getDomRef("tblHeader").firstChild;
			var oTblHeaderRect = oTblHeaderDomRef.getBoundingClientRect();
			iTHRectBottom = parseInt(oTblHeaderRect.bottom);
			iTHRectHeight = parseInt(oTblHeaderRect.height);
		}

		if (this._iStickyValue & 2 /* InfoToolbar */) {
			// additional padding is applied in HCW and HCB theme, hence infoToolbarContainer height is required
			var oInfoToolbarContainer = this.getDomRef().querySelector(".sapMListInfoTBarContainer");
			if (oInfoToolbarContainer) {
				var oInfoToolbarContainerRect = oInfoToolbarContainer.getBoundingClientRect();
				iInfoTBarContainerRectBottom = parseInt(oInfoToolbarContainerRect.bottom);
				iInfoTBarContainerRectHeight = parseInt(oInfoToolbarContainerRect.height);
			}
		}

		if (this._iStickyValue & 1 /* HeaderToolbar */) {
			var oHeaderToolbarDomRef = this.getDomRef().querySelector(".sapMListHdr");
			if (oHeaderToolbarDomRef) {
				var oHeaderToolbarRect = oHeaderToolbarDomRef.getBoundingClientRect();
				iHeaderToolbarRectBottom = parseInt(oHeaderToolbarRect.bottom);
				iHeaderToolbarRectHeight = parseInt(oHeaderToolbarRect.height);
			}
		}

		var iItemTop = Math.round(oTargetItemDomRef.getBoundingClientRect().top);
		if (iTHRectBottom > iItemTop || iInfoTBarContainerRectBottom > iItemTop || iHeaderToolbarRectBottom > iItemTop) {
			window.requestAnimationFrame(function () {
				oScrollDelegate.scrollToElement(oTargetItemDomRef, 0, [0, -iTHRectHeight - iInfoTBarContainerRectHeight - iHeaderToolbarRectHeight - iStickyFocusOffset], true);
			});
		}
	};

	ListBase.prototype.setHeaderToolbar = function(oHeaderToolbar) {
		return this._setToolbar("headerToolbar", oHeaderToolbar);
	};

	ListBase.prototype.setInfoToolbar = function(oInfoToolbar) {
		return this._setToolbar("infoToolbar", oInfoToolbar);
	};

	/**
	 * Scrolls the list so that the item with the given index is in the viewport.
	 * If the index is -1, it scrolls to the bottom of the list. If the growing feature is enabled,
	 * the list is scrolled to the last available item.
	 *
	 * Growing in combination with <code>growingScrollToLoad=true</code> can result in loading of
	 * new items when scrolling to the bottom of the list.<br>
	 * <b>Note:</b> This method only works if the control is placed inside a scrollable container (for example, <code>sap.m.Page</code>).
	 * Calling this method if the <code>ListBase</code> control is placed outside the container, will reject the <code>Promise</code> by throwing an error.
	 *
	 * @param {number} iIndex The list item index that must be scrolled into the viewport
	 * @returns {Promise} A <code>Promise</code> that resolves after the table scrolls to the row with the given index.
	 *
	 * @since 1.76
	 * @public
	 */
	ListBase.prototype.scrollToIndex = function(iIndex) {
		return new Promise(function(resolve, reject) {
			var oItem, oScrollDelegate;

			oScrollDelegate = library.getScrollDelegate(this, true);

			if (!oScrollDelegate) {
				return reject();
			}

			oItem = getItemAtIndex(this, iIndex);
			if (!oItem) {
				return reject();
			}

			// adding timeout of 0 ensures the DOM is ready in case of rerendering
			setTimeout(function() {
				try {
					oScrollDelegate.scrollToElement(oItem.getDomRef(), null, [0, this._getStickyAreaHeight() * -1], true);
					resolve();
				} catch (e) {
					reject(e);
				}
			}.bind(this), 0);
		}.bind(this));
	};

	/**
	 * Requests a specified number of items from the back end to load more data in the list.
	 * If the number of items are not specified, the <code>growingThreshold</code> value is used to request more data.
	 *
	 * <b>Note:</b> To use this method, the <code>growing</code> feature must be enabled.
	 *
	 * See {@link #getGrowing growing} and {@link #getGrowingThreshold growingThreshold} for more information.
	 * @param {int} [iItems] A positive number of items to be requested
	 * @since 1.92
	 * @public
	 */
	ListBase.prototype.requestItems = function(iItems) {
		if (iItems <= 0 || !this.getGrowing() || !this._oGrowingDelegate) {
			throw new Error("The prerequisites to use 'requestItems' are not met. Please read the documentation for more details.");
		}

		if (iItems != null) {
			var iOldGrowingThreshold = this.getGrowingThreshold();
			this.setGrowingThreshold(iItems);
			this._oGrowingDelegate.requestNewPage();
			this.setGrowingThreshold(iOldGrowingThreshold);
		} else {
			this._oGrowingDelegate.requestNewPage();
		}
	};

	function getItemAtIndex(oList, iIndex) {
		var aItems = oList.getVisibleItems();
		var iRowCount = aItems.length;

		if (typeof iIndex !== 'number' || iIndex < -1) {
			iIndex = 0;
		}

		if (iIndex >= iRowCount || iIndex === -1) {
			iIndex = iRowCount - 1;
		}

		return aItems[iIndex];
	}

	/**
	 * Sets the focus on the item. If <code>bFirstInteractiveElement</code> is <code>true</code> and there are
	 * interactive elements inside the item, sets the focus on the first interactive element. Otherwise sets
	 * the focus on the entire item.
	 *
	 * If the given index is not in the visible area, the table scrolls to it automatically.
	 *
	 * @param {number} iIndex The index of the item that is to be focused
	 * @param {boolean} [bFirstInteractiveElement=false] Indicates whether to set the focus on the first
	 * interactive element inside the item
	 *
	 * @returns {Promise} A <code>Promise</code> that resolves after the focus has been set
	 * @private
	 */
	ListBase.prototype._setFocus = function(iIndex, bFirstInteractiveElement) {
		return new Promise(function(resolve, reject) {
			var oItem = getItemAtIndex(this, iIndex);
			if (!oItem) {
				return reject();
			}

			if (bFirstInteractiveElement === true) {
				var $InteractiveElements = oItem.getTabbables(true /* bContentOnly */);
				if ($InteractiveElements.length) {
					$InteractiveElements[0].focus();
					return resolve();
				}
			}

			oItem.focus();
			return resolve();
		}.bind(this));
	};

	/**
	 * Returns the height of the sticky area in px. The height depends on the sticky configuration.
	 *
	 * @return {number} Height in px
	 * @private
	 */
	ListBase.prototype._getStickyAreaHeight = function() {
		var aSticky = this.getSticky();

		if  (!(aSticky && aSticky.length)) {
			return 0;
		}

		return aSticky.reduce(function(accumulatedHeight, stickyOption) {
			var oControl, oDomRef;

			switch (stickyOption) {
				case Sticky.HeaderToolbar:
					oControl = this.getHeaderToolbar();
					oDomRef = oControl && oControl.getDomRef() || this.getDomRef("header");
					break;
				case Sticky.InfoToolbar:
					oControl = this.getInfoToolbar();
					oDomRef = oControl && oControl.getDomRef();
					break;
				case Sticky.ColumnHeaders:
					oDomRef = this.getDomRef("tblHeader");
					break;
				default:
			}

			return accumulatedHeight + (oDomRef ? oDomRef.offsetHeight : 0);
		}.bind(this), 0 /* Initial value */);
	};

	ListBase.prototype._setToolbar = function(sAggregationName, oToolbar) {
		var oOldToolbar = this.getAggregation(sAggregationName);
		if (oOldToolbar) {
			oOldToolbar.detachEvent("_change", this._onToolbarPropertyChanged, this);
		}

		this.setAggregation(sAggregationName, oToolbar);
		if (oToolbar) {
			oToolbar.attachEvent("_change", this._onToolbarPropertyChanged, this);
		}
		return this;
	};

	ListBase.prototype._onToolbarPropertyChanged = function(oEvent) {
		if (oEvent.getParameter("name") !== "visible") {
			return;
		}

		// update the sticky style class
		var iOldStickyValue = this._iStickyValue,
			iNewStickyValue = this.getStickyStyleValue();

		if (iOldStickyValue !== iNewStickyValue) {
			var oDomRef = this.getDomRef();
			if (oDomRef) {
				var aClassList = oDomRef.classList;
				aClassList.toggle("sapMSticky", !!iNewStickyValue);
				aClassList.remove("sapMSticky" + iOldStickyValue);
				aClassList.toggle("sapMSticky" + iNewStickyValue, !!iNewStickyValue);
			}
		}
	};

	/**
	 * Return the <code>role</code> attribute of the control.
	 * @returns {string} the <code>role</code> attribute of the control
	 * @protected
	 * @ui5-restricted
	 * @since 1.105
	 */
	ListBase.prototype.getAriaRole = function() {
		return "list";
	};

	return ListBase;
});