/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/field/FieldHelpBase',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/ui/mdc/enum/OutParameterMode',
	'sap/ui/mdc/enum/ConditionValidated',
	'sap/ui/mdc/condition/FilterConverter',
	'sap/ui/base/ManagedObjectObserver',
	'sap/ui/base/SyncPromise',
	'sap/base/util/ObjectPath',
	'sap/base/util/deepEqual',
	'sap/base/util/merge',
	'sap/ui/model/resource/ResourceModel',
	'sap/ui/model/Context',
	'sap/ui/Device',
	'sap/m/library',
	'sap/ui/core/library',
	"sap/ui/mdc/util/loadModules",
	"sap/ui/events/KeyCodes"
], function(
		FieldHelpBase,
		Condition,
		FilterOperatorUtil,
		OutParameterMode,
		ConditionValidated,
		FilterConverter,
		ManagedObjectObserver,
		SyncPromise,
		ObjectPath,
		deepEqual,
		merge,
		ResourceModel,
		Context,
		Device,
		mobileLibrary,
		coreLibrary,
		loadModules,
		KeyCodes
	) {
	"use strict";

	var Dialog;
	var Button;
	var ValueHelpPanel;
	var DefineConditionPanel;
	var ManagedObjectModel;
	var FilterBar;
	var FilterField;
	var CollectiveSearchSelect;
	var Item;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;
	var OpenState = coreLibrary.OpenState;

	/**
	 * Constructor for a new <code>FieldValueHelp</code>.
	 *
	 * If a more complex value help is needed, the application can add a table to this field help.
	 * As the behavior depends on the used table control in this case,
	 * a wrapper is used between the used control and the <code>FieldValueHelp</code> element.
	 *
	 * <b>Note:</b> If a <code>FieldValueHelp</code> element is connected to a field, it gets the <code>BindingContext</code> of this field.
	 * So the in and out parameters are done in this context. Therefore bind the content table in such a way that that it finds
	 * its data also in the <code>BindingContext</code> of the field.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class A field help used in the <code>FieldHelp</code> association of controls based on {@link sap.ui.mdc.field.FieldBase FieldBase} that shows a value help dialog.
	 * @extends sap.ui.mdc.field.FieldHelpBase
	 * @version ${version}
	 * @constructor
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.58.0
	 * @alias sap.ui.mdc.field.FieldValueHelp
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FieldValueHelp = FieldHelpBase.extend("sap.ui.mdc.field.FieldValueHelp", /** @lends sap.ui.mdc.field.FieldValueHelp.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {

				/**
				 * Defines the module path of the metadata delegate.
				 */
				delegate: {
					type: "object",
					group: "Data",
					defaultValue: {
						name: "sap/ui/mdc/field/FieldValueHelpDelegate"
					}
				},

				/**
				 * The fields based on which the table data is filtered. For filtering the value of the <code>filterValue</code> property is used.
				 *
				 * If set to <code>$search</code> and the used binding supports search requests, a $search request is used for filtering.
				 *
				 * If set to one or more properties, the filters for these properties are used for filtering.
				 * These filters are set on the <code>ListBinding</code> used.
				 * The properties need to be separated by commas and enclosed by "*" characters. (<code>"*Property1,Property2*"</code>)
				 *
				 * If it is empty, no suggestion is available.
				 */
				filterFields: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * The path of the key field in the content binding.
				 * If a table is used as content, this is the binding path of the key of the items.
				 *
				 * If not set, the FieldPath of the assigned field is used.
				 */
				keyPath: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * The path of the description field in the content binding.
				 * If a table is used as content, this is the binding path of the description of the items.
				 */
				descriptionPath: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Determines if a condition panel is shown.
				 *
				 * @since 1.60.0
				 */
				showConditionPanel: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Title text that appears in the dialog header.
				 *
				 * @since 1.60.0
				 */
				title: {
					type: "string",
					group: "Appearance",
					defaultValue: ""
				},

				/**
				 * If set, the field help doesn't open a value help dialog, but just displays the content.
				 * It behaves like in the case of a suggestion but without any search.
				 *
				 * @since 1.60.0
				 */
				noDialog: {
					type: "boolean",
					group: "Appearance",
					defaultValue: false
				},

				/**
				 * If this property is set to <code>true</code>, the filtering for user input is always case-sensitive.
				 * Otherwise user input is checked case-insensitively.
				 * If <code>$search</code> is used, this property has no effect on the <code>$search</code> request.
				 *
				 * If the used back-end service supports a case-insensitive search, set this property to <code>false</code>.
				 *
				 * @since 1.89.0
				 */
				caseSensitive: {
					type: "boolean",
					defaultValue: true
				},

				/**
				 * Internal property to bind the OK button to enable or disable it.
				 */
				_enableOK: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true,
					visibility: "hidden"
				}
			},
			aggregations: {
				/**
				 * Content of the field help.
				 *
				 * To support different types of content (for example <code>sap.m.Table</code>), a specific wrapper is used
				 * to map the functionality of the content control to the field help. The content control
				 * is assigned to the wrapper.
				 *
				 * The filter logic must be implemented in the wrapper control.
				 * The filtering is triggered by user interaction (type-ahead, search request, or search from <code>FilterBar</code>).
				 * (If <code>FilterBar</code> is in <code>LiveMode</code> and in parameters are used, this also triggers filtering.)
				 *
				 * @since 1.60.0
				 */
				content: {
					type: "sap.ui.mdc.field.FieldValueHelpContentWrapperBase",
					multiple: false
				},

				/**
				 * Content for suggestion.
				 *
				 * To support different types of content (for example <code>sap.m.Table</code>), a specific wrapper is used
				 * to map the functionality of the content control to the field help. The content control
				 * is assigned to the wrapper.
				 *
				 * The filter logic must be implemented in the wrapper control.
				 * The filtering is triggered by user interaction (type-ahead, search request, or search from <code>FilterBar</code>).
				 * (If <code>FilterBar</code> is in <code>LiveMode</code> and in parameters are used, this also triggers filtering.)
				 *
				 * <b>Note:</b> If no special content for suggestion is provided, the content of the <code>content</code> aggregation is used.
				 *
				 * @since 1.88.0
				 * @experimental As of version 1.88
				 */
				suggestContent: {
					type: "sap.ui.mdc.field.FieldValueHelpContentWrapperBase",
					multiple: false
				},

				/**
				 * Content for dialog.
				 *
				 * To support different types of content (for example <code>sap.m.Table</code>), a specific wrapper is used
				 * to map the functionality of the content control to the field help. The content control
				 * is assigned to the wrapper.
				 *
				 * The filter logic must be implemented in the wrapper control.
				 * The filtering is triggered by user interaction (type-ahead, search request, or search from <code>FilterBar</code>).
				 * (If <code>FilterBar</code> is in <code>LiveMode</code> and in parameters are used, this also triggers filtering.)
				 *
				 * <b>Note:</b> If no special content for the dialog is provided, the content of the <code>content</code> aggregation is used.
				 *
				 * @since 1.88.0
				 * @experimental As of version 1.88
				 */
				dialogContent: {
					type: "sap.ui.mdc.field.FieldValueHelpContentWrapperBase",
					multiple: false
				},

				/**
				 * <code>FilterBar</code> control of the field help.
				 *
				 * @since 1.60.0
				 */
				filterBar: {
					type: "sap.ui.mdc.filterbar.FilterBarBase",
					multiple: false
				},

				/**
				 * Sets the in parameters of a field help.
				 *
				 * If set, the field help reads the data of these entities in the model and uses it to filter in the value help.
				 * @since 1.66.0
				 */
				inParameters: {
					type: "sap.ui.mdc.field.InParameter",
					group: "Data",
					multiple: true
				},

				/**
				 * Sets the out parameters of a field help.
				 *
				 * If set, the fields sets the data of these entities in the model based to the selected values.
				 * @since 1.66.0
				 */
				outParameters: {
					type: "sap.ui.mdc.field.OutParameter",
					group: "Data",
					multiple: true
				},

				/**
				 * internal dialog
				 */
				_dialog: {
					type: "sap.m.Dialog",
					multiple: false,
					visibility: "hidden"
				},

				/**
				 * Internal <code>FilterBar</code> control of the field help. (If no external <code>FilterBar</code> used.)
				 *
				 * @since 1.86.0
				 */
				_filterBar: {
					type: "sap.ui.mdc.filterbar.FilterBarBase",
					multiple: false,
					visibility: "hidden"
				},

				/**
				 * Items for collective searches.
				 *
				 * If used, a field to switch value helps will be shown. If the value help is switched, the
				 * <code>contentRequest</code> function of the delegate is called and the chosen key is provided.
				 *
				 * <b>Note:</b> Icons are not supported.
				 * @since 1.87.0
				 */
				collectiveSearchItems: {
					type: "sap.ui.core.Item",
					multiple: true,
					singularName : "collectiveSearchItem"
				}
			},
			defaultAggregation: "content",
			events: {
				/**
				 * This event is fired when a description for a key or a key for a description is requested, and
				 * no data table with list binding is assigned.
				 *
				 * This is the case if a <code>Field</code> or <code>FilterField</code> shows the description of the value.
				 * and the value is formatted or a new input is parsed.
				 *
				 * @since 1.67.0
				 */
				dataRequested: {}
			}
		}
	});

	// private function to initialize globals for qUnit tests
	FieldValueHelp._init = function() {

		FieldHelpBase._init.apply(this, arguments);

		Dialog = undefined;
		Button = undefined;
		ValueHelpPanel = undefined;
		DefineConditionPanel = undefined;
		ManagedObjectModel = undefined;

	};

	FieldValueHelp.prototype.init = function() {

		FieldHelpBase.prototype.init.apply(this, arguments);

		this._oObserver = new ManagedObjectObserver(_observeChanges.bind(this));

		this._oObserver.observe(this, {
			properties: ["filterValue", "conditions", "showConditionPanel", "filterFields"],
			aggregations: ["content", "suggestContent", "dialogContent", "filterBar", "_filterBar", "inParameters", "collectiveSearchItems"]
		});

		this.setBindingContext(null); // don't inherit from parent as this could have a invalid BindingContent to read InParameters...

		this._oConditions = {}; // if no FilterBar is used store Conditions for search and InParameters locally

	};

	FieldValueHelp.prototype.exit = function() {

		FieldHelpBase.prototype.exit.apply(this, arguments);

		if (this._oManagedObjectModel) {
			this._oManagedObjectModel.destroy();
			delete this._oManagedObjectModel;
		}

		this._oObserver.disconnect();
		this._oObserver = undefined;

		delete this._oConditions;

		if (this._iUpdateTimer) {
			clearTimeout(this._iUpdateTimer);
			this._iUpdateTimer = null;
		}

		if (this._iFilterTimer) {
			clearTimeout(this._iFilterTimer);
			this._iFilterTimer = null;
		}

		if (this._iSearchFieldTimer) {
			clearTimeout(this._iSearchFieldTimer);
			this._iSearchFieldTimer = null;
		}

		if (this._oCollectiveSearchSelect) {
			this._oCollectiveSearchSelect.destroy();
			delete this._oCollectiveSearchSelect;
		}

		if (this._oResourceBundleM) {
			this._oResourceBundleM = null;
		}

		if (this._oResourceBundle) {
			this._oResourceBundle = null;
		}
	};

	FieldValueHelp.prototype.invalidate = function(oOrigin) {

		if (oOrigin) {
			var oSuggetWrapper = _getWrapper.call(this, true);
			var oDialogWrapper = _getWrapper.call(this, false);
			var oDialog = this.getAggregation("_dialog");

			if ((oSuggetWrapper && oOrigin === oSuggetWrapper) || (oDialogWrapper && oOrigin === oDialogWrapper)) {
				// Wrapper invalidation might need re-rendering (e.g. selection table item leads to re-rendering of CheckBox)
				// --> invalidate rendering parent (ValueHelpPanel or Popover)
				var oPopover = this.getAggregation("_popover");
				if (oDialog && oDialog.isOpen()) {
					var oValueHelpPanel = oDialog.getContent()[0];
					oValueHelpPanel.invalidate(oOrigin);
				} else if (oPopover && oPopover.isOpen()) {
					oPopover.invalidate(oOrigin);
				}
				return;
			}

			var oFilterBar = this._getFilterBar();
			if ((oDialog && oOrigin === oDialog) ||
					(oFilterBar && oOrigin === oFilterBar)) {
				if (oOrigin.bOutput && !this._bIsBeingDestroyed) {
					// Content changed but no UiArea found, this should not happen.
					// now invalidate parent to trigger re-rendering somehow.
					var oParent = this.getParent();
					if (oParent) {
						oParent.invalidate(this);
					}
				}
				return;
			}
		}

		FieldHelpBase.prototype.invalidate.apply(this, arguments);

	};

	FieldValueHelp.prototype.connect = function(oField) {

		FieldHelpBase.prototype.connect.apply(this, arguments);

		// update BindingContext for in/out-parameter
		_updateBindingContext.call(this);

		// new Field might not support define conditions
		_toggleDefineConditions.call(this, this.getShowConditionPanel());

		return this;

	};

	FieldValueHelp.prototype.getIcon = function() {

		if (this.getNoDialog()) {
			return "sap-icon://slim-arrow-down";
		} else {
			return "sap-icon://value-help";
		}

	};

	FieldValueHelp.prototype._createPopover = function() {

		var oPopover = FieldHelpBase.prototype._createPopover.apply(this, arguments);

		var fnOpenDialogFromPopover = function (oEvent) {
			this.fireSwitchToValueHelp();
		}.bind(this);

		if (oPopover) { // empty if loaded async
			oPopover.addDelegate({onsapshow: fnOpenDialogFromPopover});

			// use Wrapper content in Popover -> overwrite hook
			var oWrapper = _getWrapper.call(this, true);
			if (oWrapper) {
				SyncPromise.resolve(oWrapper.initialize(true)).then(function () {
					if (oWrapper.enableShowAllItems()) {
						loadModules(["sap/m/Button", "sap/m/Toolbar", "sap/m/ToolbarSpacer"]).then(function (aModules) {
							var Button = aModules[0];
							var Toolbar = aModules[1];
							var ToolbarSpacer = aModules[2];
							var sapMResourceBundle = getSAPMResourceBundle.apply(this);
							var oShowAllItemsButton = new Button(this.getId() + "-showAllItems", {
								text: sapMResourceBundle.getText("INPUT_SUGGESTIONS_SHOW_ALL"),
								press: fnOpenDialogFromPopover
							});
							var aToolbarContent = [new ToolbarSpacer(this.getId() + "-Spacer")].concat(oShowAllItemsButton);
							var oFooter = new Toolbar(this.getId() + "-TB", {
								content: aToolbarContent,
								visible: !oWrapper.getAllItemsShown()
							}).setModel(this._oFooterModel, "$config");
							oPopover.setFooter(oFooter);
						}.bind(this));
					}
				}.bind(this));
			}

			oPopover._getAllContent = function() {
				var oParent = this.getParent();
				var aContent = [];

				if (oParent) {
					var oContent = _getSuggestionContent.call(oParent);
					if (oContent) {
						aContent.push(oContent);
					}
				}
				return aContent;
			};

			if (this._bNavigate) {
				this.navigate(this._iStep);
			}
		}

		return oPopover;

	};

	FieldValueHelp.prototype._handleAfterOpen = function(oEvent) {

		FieldHelpBase.prototype._handleAfterOpen.apply(this, arguments);

		var oWrapper = _getWrapper.call(this, true);
		if (oWrapper) {
			oWrapper.fieldHelpOpen(true);
		}

	};

	FieldValueHelp.prototype.open = function(bSuggestion) {

		if (this.getNoDialog() && !bSuggestion) {
			bSuggestion = true;
		}

		// as BindingContext of Field might change (happens in table) update if needed
		_updateBindingContext.call(this);

		if (this._bOpenAfterPromise) {
			this._bSuggestion = bSuggestion;
			return; // already wait for opening
		}

		var oWrapper = _getWrapper.call(this, bSuggestion);

		// trigger content loading in event or delegate
		var fnOpen = function() {
			if (this._bOpenAfterPromise) {
				delete this._bOpenAfterPromise;
				this.open(this._bSuggestion);
				delete this._bSuggestion;
			}
		}.bind(this);
		var bSync = this._bOpen ? this._callContentRequest(!!bSuggestion, fnOpen) : this._fireOpen(!!bSuggestion, fnOpen); // no open event of Popover async loaded
		delete this._bOpen; // set it new if still needed
		if (!bSync) {
			// open after delegates promise is resolved
			// but trigger loading of Popover or Dialog to use the pending time (otherwise we run in the next async loading afterwards)
			this._bSuggestion = bSuggestion;
			if (bSuggestion) {
				this._getPopover();
			} else {
				_getDialog.call(this);
			}

			this._bOpenAfterPromise = true;

			return;
		}

		this._bOpenHandled = true; // prevent double event and delegate call

		oWrapper = _getWrapper.call(this, bSuggestion); // as Wrapper could be added synchronously in open event
		if (oWrapper && oWrapper.getFilterEnabled() && !this._bNavigateRunning) { //in running navigation already filtered
			this._bApplyFilter = false; // initialize
			if (!oWrapper.isSuspended() || bSuggestion || this.getFilterValue()) {// in suggestion applyFilter even if suspended (resume), if FilterValue set, filter always
				// apply use in-parameter filters
				this._bApplyFilter = true;
			}
			_initializeFilters.call(this);
		}

		if (this._bUpdateFilterAfterClose) {
			// filter was updated by closing -> perform it now
			this._bUpdateFilterAfterClose = false;
			_filterContent.call(this, this.getFilterValue());
		}

		if (bSuggestion) {
			if (!oWrapper) {
				// do not create Popover if no content
				this._bOpenIfContent = true;
			} else {
				//call the fieldHelpOpen before the open to update the table width and avoid rerender and flickering of suggest popover
				oWrapper.fieldHelpOpen(bSuggestion);
					if (!this.getFilterValue() && !this._bNavigateRunning) {
						// if no filter call filters to search for all (use in-parameters)
						_applyFilters.call(this, true);
					}
					FieldHelpBase.prototype.open.apply(this, [bSuggestion]);
			}
		} else {
			var oPopover = this.getAggregation("_popover");
			if (oPopover) {
				if (oPopover.isOpen()) {
					this.close();
					this._bSwitchToDialog = true;
				}
				oPopover.$().remove(); // destroy DOM of Wrapper content to not have it twice
			}

			var oDialog = _getDialog.call(this);

			if (oDialog) {
				// create SearchField if needed
				_initializeSearchField.call(this);

				// add collectiveSearch if needed
				_assignCollectiveSearch.call(this, true);

				// use FilterBar filters
				_updateFiltersFromFilterBar.call(this);

				// use FieldGropuIDs of field, to not leave group if focus moves to field help
				oDialog.setFieldGroupIds(this._oField.getFieldGroupIds());

				var oValueHelpPanel = oDialog.getContent()[0];
				oValueHelpPanel.setShowTokenizer(this.getMaxConditions() !== 1 && !!oWrapper);
				oValueHelpPanel.setFormatOptions(this._getFormatOptions());
				oValueHelpPanel.bindProperty("conditions", {path: "$help>/conditions"});

				if (oWrapper) {
					oWrapper.fieldHelpOpen(false);
					_updateSelectedItems.call(this);
				}
				this._aOldConditions = this.getConditions();
				oDialog.open();
				this._bDialogOpen = true; // to know already during opening animation
			} else {
				this._bOpen = true;
			}
		}

				this._bOpenHandled = false;

		return;

	};

	FieldValueHelp.prototype.toggleOpen = function(bSuggestion) {

		if (this.getNoDialog() && !bSuggestion) {
			bSuggestion = true;
		}

		if (bSuggestion) {
			FieldHelpBase.prototype.toggleOpen.apply(this, [bSuggestion]);
		} else if (this._bOpen || this._bOpenIfContent || this._bOpenAfterPromise) {
			// dialog is requested and open is pending -> skip opening
			delete this._bOpen;
			delete this._bSuggestion;
			delete this._bOpenIfContent;
			delete this._bOpenAfterPromise;
		} else {
			var oDialog = _getDialog.call(this);

			if (oDialog) {
				if (oDialog.isOpen()) {
					var eOpenState = oDialog.oPopup.getOpenState();
					if (eOpenState !== "CLOSED" && eOpenState !== "CLOSING") { // TODO: better logic
						this.close();
					} else {
						this._bReopen = true;
					}
				} else {
					this.open(bSuggestion);
				}
			} else {
				// it is closed -> just open
				this.open(bSuggestion);
			}
		}

	};

	FieldValueHelp.prototype.close = function() {

		if (!this._bDialogOpen) {
			FieldHelpBase.prototype.close.apply(this, arguments);
		} else {
			var oDialog = this.getAggregation("_dialog");

			if (oDialog) {
				this._bClosing = true;
				oDialog.close();

				var oValueHelpPanel = oDialog.getContent()[0];
				// remove binding of conditions to prevent updates on ValueHelpPanel and DefineConditionPanel while closed. (e.g. empty row)
				oValueHelpPanel.unbindProperty("conditions", true);
				if (oValueHelpPanel._oDefineConditionPanel) { //TODO: use API?
					oValueHelpPanel._oDefineConditionPanel.cleanUp();
				}
			}

			this._bReopen = false;
			this._bSwitchToDialog = false;
			delete this._bOpen;
			delete this._bOpenAfterPromise;
		}

	};

	FieldValueHelp.prototype.isOpen = function(bCheckClosing) {

		var bIsOpen = FieldHelpBase.prototype.isOpen.apply(this, arguments);

		if (!bIsOpen && (!bCheckClosing || !this._bClosing)) { //
			var oDialog = this.getAggregation("_dialog");
			if (oDialog) {
				bIsOpen = oDialog.isOpen();
			}
		}

		return bIsOpen;

	};

	FieldValueHelp.prototype.getDomRef = function() {

		if (!this._bDialogOpen) {
			return FieldHelpBase.prototype.getDomRef.apply(this, arguments);
		} else {
			var oDialog = this.getAggregation("_dialog");

			if (oDialog) {
				return oDialog.getDomRef();
			}
		}

	};

	function _cleanupFilters() { // TODO: really needed or better use single requests if needed by getText or description?

		// remove filters: update table only if filter exist
		var oFilterBar = this._getFilterBar();
		var oConditions;

		if (oFilterBar) {
			oConditions = oFilterBar.getInternalConditions();
		} else {
			oConditions = this._oConditions;
		}

		var bRemove = false;
		for (var sMyFieldPath in oConditions) {
			if (oConditions[sMyFieldPath].length > 0) {
				_removeConditions.call(this, sMyFieldPath);
				bRemove = true;
			}
		}

		if (bRemove) {
			_applyFilters.call(this, true);
		}

	}

	FieldValueHelp.prototype._handleAfterClose = function(oEvent) {

		var oDialog = this.getAggregation("_dialog");
		var bSuggestion = !oDialog || oEvent.getSource() !== oDialog;

		var oWrapper = _getWrapper.call(this, bSuggestion);

		if (oWrapper) {
			if (!oWrapper.getAsyncKeyText()) {
				// to have the full list if key or text are requested only from table
				_cleanupFilters.call(this);
			}
			oWrapper.fieldHelpClose();
		}

		if (!this.isOpen()) { // maybe Popover closed while Dialog opens -> here Filter needs to be applied
			this._bApplyFilter = false;
		}

		this._bNavigateRunning = false; // just to be sure - navigation cannot run after popover closed

		FieldHelpBase.prototype._handleAfterClose.apply(this, arguments);

	};

	function _observeChanges(oChanges) {

		if (oChanges.object == this) { // FieldValueHelp
			var oDialog;

			if (oChanges.name === "content") {
				_contentChanged.call(this, oChanges.mutation, oChanges.child, oChanges.name);
			}

			if (oChanges.name === "suggestContent") {
				_contentChanged.call(this, oChanges.mutation, oChanges.child, oChanges.name);
			}

			if (oChanges.name === "dialogContent") {
				_contentChanged.call(this, oChanges.mutation, oChanges.child, oChanges.name);
			}

			if (oChanges.name === "filterBar") {
				if (oChanges.mutation === "insert" && this.getAggregation("_filterBar")) {
					this.destroyAggregation("_filterBar");
					delete this._oSearchField; // as SearchField is destroyed too
				}
				_updateFilterBar.call(this, oChanges.mutation, oChanges.child, false);
			}

			if (oChanges.name === "_filterBar") {
				_updateFilterBar.call(this, oChanges.mutation, oChanges.child, true);
			}

			if (oChanges.name === "conditions") {
				_updateConditions.call(this, oChanges.current);
			}

			if (oChanges.name === "filterValue") {
				if (this._bClosing) {
					this._bUpdateFilterAfterClose = true;
				} else {
					_filterContent.call(this, oChanges.current);
				}
			}

			if (oChanges.name === "showConditionPanel") {
				_toggleDefineConditions.call(this, oChanges.current);
			}

			if (oChanges.name === "filterFields") {
				oDialog = this.getAggregation("_dialog");
				if (oDialog) {
					if (oDialog.isOpen()) {
						if (oChanges.current) {
							_initializeSearchField.call(this);
						} else if (this.getAggregation("_filterBar")) {
							this.destroyAggregation("_filterBar");
						}
					}
				}
			}

			if (oChanges.name === "inParameters") {
				_inParametersChanged.call(this, oChanges.child, oChanges.mutation);
			}

			if (oChanges.name === "collectiveSearchItems") {
				_assignCollectiveSearch.call(this, false);
			}
		} else if (oChanges.object.isA("sap.ui.mdc.field.InParameter")){
			if (oChanges.name === "value") {
				_inParameterValueChanged.call(this, oChanges.object.getHelpPath(), oChanges.current, oChanges.old, oChanges.object.getUseConditions(), oChanges.object.getInitialValueFilterEmpty());
			}
			if (oChanges.name === "helpPath") {
				_inParameterPathChanged.call(this, oChanges.current, oChanges.old, oChanges.object.getValue(), oChanges.object.getUseConditions(), oChanges.object.getInitialValueFilterEmpty());
			}
		}

	}

	FieldValueHelp.prototype.openByTyping = function() {

		if (!this._bDetermineSearchSupportedCalled && !this.isOpen() && !this._bOpen && !this._bOpenIfContent && !this._bOpenAfterPromise) {
			// call delegate. But don't wait for result as this needs to be checked synchronously.
			// It makes no sense to open the suggestion if typing finished and user already left field.
			// Only call delegate once. FilterFields must not be changed after set once.
			// Only check if not already opened. If opened everything must be set. While opening we still
			// waiting for the settings, so calling again makes no sense.
			if (!this.bDelegateInitialized && !this.bDelegateLoading) {
				this.initControlDelegate();
			}

			if (this.bDelegateInitialized) {
				return _checkSearchSupported.call(this);
			} else {
				this._bDetermineSearchSupportedCalled = true; // don't trigger twice
				return this.awaitControlDelegate().then(function() {
					return _checkSearchSupported.call(this);
				}.bind(this));
			}
		}

		// if no search is defined no suggestion is possible
		return !!this.getFilterFields();

	};

	function _checkSearchSupported() {

		this.fireOpen({suggestion: true}); // TODO: remove after delegate is implemented
		this._bDetermineSearchSupportedCalled = true;
		var oPromise = this.getControlDelegate().determineSearchSupported(this.getPayload(), this);
		if (oPromise instanceof Promise) {
			return oPromise.then( function() {
				return !!this.getFilterFields();
			}.bind(this));
		} else {
			return !!this.getFilterFields();
		}

	}

	FieldValueHelp.prototype.isFocusInHelp = function() {

		if (!this.getNoDialog()) {
			var oDialog = this.getAggregation("_dialog");
			if ((oDialog && oDialog.isOpen()) || (this._bDialogRequested && this._bOpen) || (this._bOpenAfterPromise && !this._bSuggestion)) {
				return true;
			}
		}

		if (this._bFocusPopover) {
			// focus should be set in popover (while navigation in multi-suggestion)
			return true;
		}

		return false; // as default let focus stay on Field

	};

	FieldValueHelp.prototype.removeFocus = function() {

		var oWrapper = _getWrapper.call(this, true); // only needed in suggestion because of navigation
		if (oWrapper) {
			oWrapper.removeFocus();
		}

	};

	FieldValueHelp.prototype.navigate = function(iStep) {

		var oWrapper = _getWrapper.call(this, true); // navigate only in suggestion
		var oPopover = this.getAggregation("_popover");

		// as BindingContext of Field might change (happens in table) update if needed
		_updateBindingContext.call(this);

		if (!oPopover || !oPopover.isOpen()) {
			// trigger content loading in event or delegate
			var fnNavigate = function() {this.navigate(iStep);}.bind(this);
			var bSync = this._bNavigate ? this._callContentRequest(true, fnNavigate) : this._fireOpen(true, fnNavigate); // no open event of Popover async loaded
			if (!bSync) {
				// navigate after delegates promise is resolved
				// but trigger loading of Popover to use the pending time (otherwise we run in the next async loading afterwards)
				oWrapper = _getWrapper.call(this, true);
				this._bNavigate = false; // will be new set if still needed
				this._iStep = null;
				if (oWrapper) {
					this._getPopover();
				}
				return;
			}
		}

		this._bNavigate = false; // will be new set if still needed
		this._iStep = null;
		oWrapper = _getWrapper.call(this, true);

		if (oWrapper) {
			// only create popover if content
			oPopover = this._getPopover();
			// apply use in-parameter filters
			this._bApplyFilter = true;
			this._bNavigateRunning = true;
			_initializeFilters.call(this);
			_applyFilters.call(this, true); // if no filter set and no in-parameters, trigger initial select (if suspended)
		}

		if (!oPopover) {
			// Popover not loaded right now
			this._bNavigate = true;
			this._iStep = iStep;
			return;
		}

		if (oWrapper) {
			oWrapper.navigate(iStep, oPopover.isOpen());
		}

	};

	function _handleNavigate(oEvent) {

		var oPopover = this._getPopover();
		var bDisableFocus = oEvent.getParameter("disableFocus");

		var vKey = oEvent.getParameter("key");
		var sDescription = oEvent.getParameter("description");
		var oInParameters = oEvent.getParameter("inParameters");
		var oOutParameters = oEvent.getParameter("outParameters");
		var bLeave = oEvent.getParameter("leave");
		var sItemId = oEvent.getParameter("itemId");
		var oCondition;

		if (bLeave) {
			// leave field help and focus Field
			this.fireNavigate({key: undefined, value: undefined, condition: undefined, itemId: undefined, leaveFocus: bLeave});
			return;
		}

		if (vKey === undefined && !bDisableFocus) {
			// no real navigation, just open
			this._bFocusPopover = true;
		}

		if (!oPopover.isOpen()) {
			this._bOpenHandled = true; // prevent double event and delegate call
			this.open(true); // as navigation opens suggestion
			this._bOpenHandled = false;
		}

		this._bNavigateRunning = false;

		if (vKey === undefined) {
			// only focus set, no real navigation
			this._bFocusPopover = false;
			return;
		}

		if (oInParameters) {
			oInParameters = _mapInParametersToField.call(this, oInParameters);
		}
		if (oOutParameters) {
			oOutParameters = _mapOutParametersToField.call(this, oOutParameters);
		}
		oCondition = this._createCondition(vKey, sDescription, oInParameters, oOutParameters);
		this.setProperty("conditions", [oCondition], true); // do not invalidate whole FieldHelp
		this.fireNavigate({value: sDescription, key: vKey, condition: oCondition, itemId: sItemId, leaveFocus: bLeave});

	}

	FieldValueHelp.prototype._getTextOrKey = function(vValue, bKey, oBindingContext, oInParameters, oOutParameters, bNoRequest, oConditionModel, sConditionModelName, vParsedValue, bKeyAndDescription, bCaseSensitive) {

		var vResult = "";
		var oWrapper = _getWrapper.call(this, true); // use suggest wrapper to determine text or key

		if (oWrapper) {
			var oListBinding = oWrapper.getListBinding();

			if (!oListBinding) {
				this.fireDataRequested();
			}

			if (oBindingContext && !oBindingContext.getModel()) {
				// BindingContext without model cannot bring any data and might be destroyed -> ignore as request is probably outdated
				return null;
			}

			// if backend don't support case insensitive filtering, filter case sensitive
			bCaseSensitive = bCaseSensitive || this.getCaseSensitive();

			/*
			 * If the description should be displayed inside a Field this description will be determined using this function.
			 * If InParameters are used, they are needed to find the right description.
			 * It could happen taht the Binding of the InParameter is still pending, so the value is not known right now.
			 * In this case we need to wait until the Binding has read the value. This is model specific. Only in oData V4
			 * Bindings there is a requestValue function. So the logic is implemented in the Delegate.
			 *
			 * If the Field is inside a Table, the Description is requested for every table row. Every table row has a different BindingContext.
			 * So the InParamer value needs to be read for every BindingContext. If the value is already read Context.getValue() will return it.
			 * In oData V4 the property is only read in the Context if a Binding exists. So a new Binding to read the value of the InParameter
			 * is created for the BindingContext. (Only if the inParameter is bound to the same BindingContext as the whole FieldValueHelp.
			 * Otherwise the original Binding is used.)
			 */
			var oMyBindingContext = this.oBindingContexts[undefined]; // as getBindingContext returns propagated Context if own context don't fit to model
			var aInParameters = this.getInParameters();
			var bBindingChanged = false;

			if (oBindingContext && Context.hasChanged(oMyBindingContext, oBindingContext)) {
				bBindingChanged = true;
			}

			var aInBindings = _getParameterBinding.call(this, aInParameters, bBindingChanged, oBindingContext, oMyBindingContext, oConditionModel, sConditionModelName);
			// Out Parameter binding not used, only given outParameter value

			vResult = SyncPromise.resolve().then(function() {
				return _checkBindingsPending.call(this, aInBindings);
			}.bind(this)).then(function() {
				return SyncPromise.resolve().then(function() {
					if (oBindingContext && !oBindingContext.getModel()) {
						// BindingContext without model cannot bring any data and might be destroyed -> ignore as request is probably outdated
						return null;
					} else if (bKeyAndDescription) {
						return oWrapper.getKeyAndText(vParsedValue, vValue, _mapParametersToHelp.call(this, oInParameters, aInParameters, false, aInBindings, oBindingContext, true), _mapParametersToHelp.call(this, oOutParameters, this.getOutParameters(), true, undefined, undefined, true), bCaseSensitive);
					} else if (bKey) {
						return oWrapper.getTextForKey(vValue, _mapParametersToHelp.call(this, oInParameters, aInParameters, false, aInBindings, oBindingContext, true), _mapParametersToHelp.call(this, oOutParameters, this.getOutParameters(), true, undefined, undefined, true), bNoRequest, bCaseSensitive);
					} else {
						// use default in-parameters for check
						return oWrapper.getKeyForText(vValue, _mapParametersToHelp.call(this, undefined, aInParameters, false, aInBindings, oBindingContext, true), bNoRequest, bCaseSensitive);
					}
				}.bind(this)).then(function(vResult) {
					_cleanupParameterBinding.call(this, aInBindings, bBindingChanged);
					return _adjustWrapperResult.call(this, vResult);
				}.bind(this)).unwrap();
			}.bind(this)).unwrap();
		}

		return vResult;

	};

	function _getParameterBinding(aParameters, bNewBinding, oBindingContext, oMyBindingContext, oConditionModel, sConditionModelName) {

		var aBindings = [];

		for (var i = 0; i < aParameters.length; i++) {
			var oParameter = aParameters[i];
			var oBinding = oParameter.getBinding("value");

			if (oParameter.getUseConditions() && oConditionModel) {
				// if ConditionModel is used, check if Binding is OK and same ConditionModel is used
				var oMyConditionModel = this.getModel(sConditionModelName);
				if (oMyConditionModel !== oConditionModel) {
					// no or different ConditionModel -> create new binding on given ConditionModel
					aBindings.push(oConditionModel.bindProperty("/" + oParameter.getFieldPath()));
				}
			} else if (oBinding) {
				var sPath = oBinding.getPath();
				var oParameterBindingContext = oBinding.getContext();

				if (bNewBinding && oBinding.isRelative() && (oParameterBindingContext === oMyBindingContext || (!oParameterBindingContext && oMyBindingContext))) {
					// InParameter is bound and uses the same BindingContext like the FieldHelp or has no BindingContext right now.
					// If InParameter is bound to a different BindingContext just use this one.
					if (oBindingContext.getProperty(sPath) === undefined) {
						// if value is already known in BindingContext from other existing Binding, don't request again.
						var oModel = oBinding.getModel();
						aBindings.push(oModel.bindProperty(sPath, oBindingContext));
					}
				} else if ((!oParameterBindingContext && oBinding.isRelative()) // we don't have a BindingContext but need one -> need to wait for one
							|| (oParameterBindingContext && oParameterBindingContext.getProperty(sPath) === undefined) // the BindingContext has no data right now -> need to wait for update
							|| oBinding.getValue() === undefined // the Binding has no data right now, need to wait for update
							|| (oParameterBindingContext && !deepEqual(oParameter.validateProperty("value", oParameterBindingContext.getProperty(sPath)), oParameter.getValue()))) { // value not alreday set
					// Property not already known on BindingContext or not already updated in Parameter value
					// use validateProperty as null might be converted to undefined, if invalid value don't run into a check
					// use deepEqual as, depending on type, the value could be complex (same logic as in setProperty)
					aBindings.push(oBinding);
				}
			}
		}

		return aBindings;

	}

	function _cleanupParameterBinding(aBindings, bNewBinding) {

		if (!bNewBinding) {
			return;
		}

		for (var i = 0; i < aBindings.length; i++) {
			aBindings[i].destroy();
		}

	}

	function _checkBindingsPending(aBindings) {

		if (aBindings.length === 0) {
			return null;
		}

		if (!this.bDelegateInitialized && !this.bDelegateLoading) {
			this.initControlDelegate();
		}

		if (this.bDelegateInitialized) {
			return this.getControlDelegate().checkBindingsPending(this.getPayload(), aBindings);
		} else {
			return this.awaitControlDelegate().then(function() {
				return this.getControlDelegate().checkBindingsPending(this.getPayload(), aBindings);
			}.bind(this));
		}

	}

	function _adjustWrapperResult(vResult) {

		if (vResult && typeof vResult === "object") {
			// map in/out parameters to external keys
			vResult = merge({}, vResult); // do not modify original object, could have strange side effects
			if (vResult.inParameters) {
				vResult.inParameters = _mapInParametersToField.call(this, vResult.inParameters);
			}
			if (vResult.outParameters) {
				vResult.outParameters = _mapOutParametersToField.call(this, vResult.outParameters);
			}
		}

		return vResult;

	}

	FieldValueHelp.prototype._isTextOrKeyRequestSupported = function() {

		// only possible if Wrapper added
		var oWrapper = _getWrapper.call(this, true); // use suggest wrapper to determine text or key
		return !!oWrapper;

	};

	FieldValueHelp.prototype.isUsableForValidation = function() {

		// if no wrapper only a defineDonditionPanel might be used -> therefore no input validation is possible
		var oWrapper = _getWrapper.call(this, true); // use suggest wrapper to determine text or key
		return !!oWrapper;

	};

	function _handleSelectionChange(oEvent) {

		var aSelectedItems = oEvent.getParameter("selectedItems");
		var bItemPress = oEvent.getParameter("itemPress");
		var oItem;
		var aConditions = this.getConditions();
		var oCondition;
		var i = 0;
		var j = 0;
		var bFound = false;
		var iMaxConditions = this.getMaxConditions();
		var oOperator = this._getOperator();

		// try to keep order stable
		// remove only EQ selections that can be changed from content control
		for (i = aConditions.length - 1; i >= 0; i--) {
			oCondition = aConditions[i];
			oCondition.inParameters = _mapInParametersToHelp.call(this, oCondition.inParameters);
			oCondition.outParameters = _mapOutParametersToHelp.call(this, oCondition.outParameters);
			if (oCondition.operator === oOperator.name && oCondition.validated === ConditionValidated.Validated) { // only conditions of used operator supported
				bFound = false;
				for (j = 0; j < aSelectedItems.length; j++) {
					oItem = aSelectedItems[j];
					if (oCondition.values[0] === oItem.key
							&& (!oCondition.inParameters || !oItem.inParameters || deepEqual(oCondition.inParameters, oItem.inParameters))
							&& (!oCondition.outParameters || !oItem.outParameters || deepEqual(oCondition.outParameters, oItem.outParameters))) {
						bFound = true;
						if (oCondition.values[1] !== oItem.description && oItem.description) {
							// use description of selected item (might be changed)
							if (oCondition.values.length === 1) {
								oCondition.values.push(oItem.description);
							} else {
								oCondition.values[1] = oItem.description;
							}
						}
						break;
					}
				}
				if (!bFound) {
					aConditions.splice(i, 1);
				}
			}
		}

		for (i = 0; i < aSelectedItems.length; i++) {
			oItem = aSelectedItems[i];
			bFound = false;

			for (j = 0; j < aConditions.length; j++) {
				oCondition = aConditions[j];
				if (oCondition.operator === oOperator.name && oCondition.validated === ConditionValidated.Validated && oCondition.values[0] === oItem.key // only conditions of used operator supported
						&& (!oCondition.inParameters || deepEqual(oCondition.inParameters, oItem.inParameters))
						&& (!oCondition.outParameters || deepEqual(oCondition.outParameters, oItem.outParameters))) {
					bFound = true;
					oCondition.inParameters = oItem.inParameters; // to add if not already set
					oCondition.outParameters = oItem.outParameters; // to add if not already set
					break;
				}
			}

			if (!bFound) {
				oCondition = this._createCondition(oItem.key, oItem.description, oItem.inParameters, oItem.outParameters);
				aConditions.push(oCondition);
			}
		}

		if (iMaxConditions > 0 && aConditions.length > iMaxConditions) {
			aConditions.splice(0, aConditions.length - iMaxConditions);
		}

		for (i = 0; i < aConditions.length; i++) {
			oCondition = aConditions[i];
			if (oCondition.inParameters) {
				oCondition.inParameters = _mapInParametersToField.call(this, oCondition.inParameters);
			} else {
				delete oCondition.inParameters;
			}
			if (oCondition.outParameters) {
				oCondition.outParameters = _mapOutParametersToField.call(this, oCondition.outParameters);
			} else {
				delete oCondition.outParameters;
			}
		}

		if (this._bDialogOpen) {
			this.setProperty("conditions", aConditions, true); // do not invalidate whole FieldHelp
		} else {
			// suggestion -> fire select event directly
			var bAdd = false;
			var bClose = false;
			if (this.getMaxConditions() === 1 || bItemPress) { // in single selection mode close
				this.close();
				bClose = true;
			}
			if (this.getMaxConditions() === 1) {
				bAdd = true; // in single selection mode conditions are just added
			}
			this.setProperty("conditions", aConditions, true); // do not invalidate whole FieldHelp
			this.fireSelect({conditions: aConditions, add: bAdd, close: bClose});
		}

	}

	function _handleDataUpdate(oEvent) {

		var bContentChange = oEvent.getParameter("contentChange");
		var oWrapper = oEvent.getSource();
		var oPopover;

		if (oWrapper.enableShowAllItems()) {
			oPopover = this.getAggregation("_popover");
			var oShowAllItemsFooter = oPopover && oPopover.getFooter();
			if (oShowAllItemsFooter) {
				oShowAllItemsFooter.setVisible(!oWrapper.getAllItemsShown());
			}
		}

		if (bContentChange) {
			oPopover = oPopover || this.getAggregation("_popover");
			var oDialog = this.getAggregation("_dialog");
			if (oPopover && this._bOpenIfContent) {
				oWrapper = _getWrapper.call(this, true);
				if (oWrapper) {
					var oField = this._getField();
					if (oField) {
						oWrapper.fieldHelpOpen(true);
						oPopover.openBy(this._getControlForSuggestion());
						// apply filters now
						_applyFilters.call(this);
					}
					this._bOpenIfContent = false;
				}
			} else if (oDialog) {
				oWrapper = _getWrapper.call(this, false);
				if (oWrapper) {
					var oValueHelpPanel = oDialog.getContent()[0];
					_setContentOnValueHelpPanel.call(this, oValueHelpPanel, oWrapper.getDialogContent());
					if (!this._bApplyFilter && !this._bClosing && (this.isOpen() || this._bOpen) && !oWrapper.isSuspended()) {
						// in case ListBinding changed or is not longer suspended
						this._bApplyFilter = true;
          }
				}
			}
		}

		if (!oWrapper || !oWrapper.getAsyncKeyText()) {
			// if asynchronously loading of key or description is supported fields needs no update on data change
			// Format or parse promise waits until table is set and request returned.
			this.fireDataUpdate();
		}

	}

	function _updateConditions(aConditions) {

		// validate flag must be set in the right way to show right conditions on DefineConditionPanel
		var bUpdate = false;
		for (var i = 0; i < aConditions.length; i++) {
			var oCondition = aConditions[i];
			if (!oCondition.validated) {
				FilterOperatorUtil.checkConditionValidated(oCondition);
				bUpdate = true;
			}
		}

		if (bUpdate) {
			this.setConditions(aConditions);
		} else {
			_updateSelectedItems.call(this);
		}

	}

	function _updateSelectedItems() {

		if (!this._oField) {
			return; // makes only sense if connected
		}

		// TODO: only for the needed wrapper
		_updateSelectedItemsOnWrapper.call(this, _getWrapper.call(this, true));
		_updateSelectedItemsOnWrapper.call(this, _getWrapper.call(this, false));

	}

	function _updateSelectedItemsOnWrapper(oWrapper) {

		if (oWrapper) {
			var oOperator = this._getOperator();
			var aConditions = this.getConditions();
			var aItems = [];
			for (var i = 0; i < aConditions.length; i++) {
				var oCondition = aConditions[i];
				if (oCondition.operator === oOperator.name && oCondition.validated === ConditionValidated.Validated) { // only conditions of used operator supported
					aItems.push({
						key: oCondition.values[0],
						description: oCondition.values[1],
						inParameters: _mapInParametersToHelp.call(this, oCondition.inParameters),
						outParameters: _mapOutParametersToHelp.call(this, oCondition.outParameters)
					});
				}
			}
			if (!deepEqual(aItems, oWrapper.getSelectedItems())) {
				oWrapper.setSelectedItems(aItems);
			}
		}

	}

	function _filterContent(sFilterText) {

		var sFilterFields = this.getFilterFields();

		if (!sFilterFields) {
			return; // we don't know how to filter
		}

		var aConditions = _getConditions.call(this, sFilterFields);
		var sFilterValue = aConditions.length > 0 ? aConditions[0].values[0] : "";
		if (sFilterText === sFilterValue) {
			// not changed
			return;
		}

		_removeConditions.call(this, sFilterFields);
		sFilterText = sFilterText.trim();
		if (sFilterText) {
			this._bOwnFilterChange = false;
			var oCondition = Condition.createCondition("StartsWith", [sFilterText], undefined, undefined, ConditionValidated.NotValidated);
			_addCondition.call(this, sFilterFields, oCondition);
		}

		_applyFilters.call(this, true);

	}

	// IN/OUT handling
	function _inParametersChanged(oInParameter, sMutation) {

		var sFilterPath = oInParameter.getHelpPath();
		var bUpdate = false;

		if (sMutation === "remove") {
			this._oObserver.unobserve(oInParameter);
			if (this._getField() && this.isOpen()) {
				bUpdate = _removeInFilter.call(this, sFilterPath);
			}
		} else {
			this._oObserver.observe(oInParameter, {properties: true});
			if (this._getField() && this.isOpen()) {
				var vValue = oInParameter.getValue();
				var bUseConditions = oInParameter.getUseConditions();
				var bInitialValueFilterEmpty = oInParameter.getInitialValueFilterEmpty();
				bUpdate = _removeInFilter.call(this, sFilterPath); // if exist, remove old filter
				bUpdate = _addInFilter.call(this, sFilterPath, vValue, bUseConditions, bInitialValueFilterEmpty) || bUpdate; // eslint-disable-line
				_updateSelectedItems.call(this); // as mapping of in-parameters could change
			}
		}

		_applyFilters.call(this, true); // call async to handle more inParamers at one time

	}

	function _addInFilter(sFilterPath, vValue, bUseConditions, bInitialValueFilterEmpty) {

		var oCondition;
		var bUpdate = false;

		if (sFilterPath && (vValue || (bInitialValueFilterEmpty && !bUseConditions))) { // TODO: support boolean?
			if (bUseConditions) {
				if (Array.isArray(vValue)) {
					for (var i = 0; i < vValue.length; i++) {
						oCondition = merge({}, vValue[i]);
						// change paths of in- and out-parameters
						if (oCondition.inParameters) {
							oCondition.inParameters = _mapInParametersToHelp.call(this, oCondition.inParameters, true);
						}
						if (oCondition.outParameters) {
							oCondition.outParameters = _mapOutParametersToHelp.call(this, oCondition.outParameters, false, true);
						}

						_addCondition.call(this, sFilterPath, oCondition);
						bUpdate = true;
					}
				}
			} else {
				if (!vValue && bInitialValueFilterEmpty) {
					oCondition = Condition.createCondition("Empty", []);
					oCondition.isEmpty = false; // no explicit check needed
				} else {
					// TODO: way to provide description on InParameter
					// validated to let FilterField determine description if visible on FilterBar.
					// Also to show it as selected on table in FieldHelp of FilterField.
					oCondition = Condition.createItemCondition(vValue);
					oCondition.validated = ConditionValidated.Validated;
				}
				_addCondition.call(this, sFilterPath, oCondition);
				bUpdate = true;
			}
		}

		return bUpdate;

	}

	function _removeInFilter(sFilterPath) {

		var bUpdate = false;

		if (sFilterPath && _getConditions.call(this, sFilterPath).length > 0) {
			_removeConditions.call(this, sFilterPath); // TODO: remove only filters from In-parameters, not from FilterBar
			bUpdate = true;
		}

		return bUpdate;

	}

	function _inParameterValueChanged(sFilterPath, vValue, vOldValue, bUseConditions, bInitialValueFilterEmpty) {

		if (this._bNoInOutFilterUpdate) {
			// just a updaste of BindingContext during formatting/parsing -> do not update Filter as it will changed back soon.
			return;
		}

		if (!this._iUpdateTimer) { // do async as it can take a while until model updates all bindings.
			this._iUpdateTimer = setTimeout(function() {
				this._iUpdateTimer = undefined;
				this.fireDataUpdate(); // to update text
			}.bind(this), 0);
		}

		if (!this._getField() || !this.isOpen()) {
			return;
		}

		var bUpdate = false;

		bUpdate = _removeInFilter.call(this, sFilterPath); // if exist, remove old filter
		bUpdate = _addInFilter.call(this, sFilterPath, vValue, bUseConditions, bInitialValueFilterEmpty) || bUpdate; // eslint-disable-line
		_updateSelectedItems.call(this); // as default in-parameters could change

		_applyFilters.call(this, true); // call async to handle more inParamers at one time

	}

	function _inParameterPathChanged(sFilterPath, sOldFilterPath, vValue, bUseConditions, bInitialValueFilterEmpty) {

		if (!this._getField() || !this.isOpen()) {
			return;
		}

		var bUpdate = false;

		bUpdate = _removeInFilter.call(this, sOldFilterPath); // if exist, remove old filter
		bUpdate = _addInFilter.call(this, sFilterPath, vValue, bUseConditions, bInitialValueFilterEmpty) || bUpdate; // eslint-disable-line

		_applyFilters.call(this, true); // call async to handle more inParamers at one time

	}

	function _setInParameterFilters() { // if closed, InParameters are not added to FilterBar or conditions, so do it here

		var aInParameters = this.getInParameters();
		var bUpdate = false;

		for (var i = 0; i < aInParameters.length; i++) {
			var oInParameter = aInParameters[i];
			var sFilterPath = oInParameter.getHelpPath();
			var vValue = oInParameter.getValue();
			var bUseConditions = oInParameter.getUseConditions();
			var bInitialValueFilterEmpty = oInParameter.getInitialValueFilterEmpty();
			bUpdate = _removeInFilter.call(this, sFilterPath) || bUpdate; // if exist, remove old filter
			bUpdate = _addInFilter.call(this, sFilterPath, vValue, bUseConditions, bInitialValueFilterEmpty) || bUpdate;
		}

		if (bUpdate || (this._bApplyFilter && this._bPendingFilterUpdate)) {
			// updated or maybe filter change while closed, so trigger check now
			this._bPendingFilterUpdate = false;
			_applyFilters.call(this, true);
		}

	}

	FieldValueHelp.prototype.onFieldChange = function() {

		// apply out-parameters
		var aOutParameters = this.getOutParameters();

		// as BindingContext of Field might change (happens if fast typed and FieldHelp not opened) update if needed
		_updateBindingContext.call(this);


		// if OutParameters are bound and binding is pending, wait until finished
		var aOutBindings = _getParameterBinding.call(this, aOutParameters, false);
		SyncPromise.resolve().then(function() {
			return _checkBindingsPending.call(this, aOutBindings);
		}.bind(this)).then(function() {
			if (this.bIsDestroyed) {
				return; // id festroyed meanwhile, don't update
			}
			var aConditions = this.getConditions();
			for (var i = 0; i < aConditions.length; i++) {
				var oCondition = aConditions[i];
				if (oCondition.outParameters) {
					for ( var sPath in oCondition.outParameters) {
						for (var j = 0; j < aOutParameters.length; j++) {
							var oOutParameter = aOutParameters[j];
							var vValue = oOutParameter.getValue();
							var bUseConditions = oOutParameter.getUseConditions();
							var bUpdate = true;
							if (oOutParameter.getMode() === OutParameterMode.WhenEmpty) {
								if (bUseConditions) {
									bUpdate = !vValue || (Array.isArray(vValue) && vValue.length === 0);
								} else {
									bUpdate = !vValue;
								}
							}
							if (bUpdate) {
								if (bUseConditions) {
									var oNewCondition;
									if (!oOutParameter.getHelpPath()) {
										oNewCondition = Condition.createCondition("EQ", [oOutParameter.getFixedValue()], undefined, undefined, ConditionValidated.NotValidated);
									} else if (oOutParameter.getFieldPath() === sPath) { // in Conditions fieldPath is used
										oNewCondition = Condition.createCondition("EQ", [oCondition.outParameters[sPath]], undefined, undefined, ConditionValidated.Validated); // as choosen from help -> validated

										// TODO: handle in/out Parameters in ConditionModel (to let the condition know it's out-Parameters)
//										var oBinding = oOutParameter.getBinding("value");
//										var oCM = oBinding && oBinding.getModel();

//										if (oCM && oCM.isA("sap.ui.mdc.condition.ConditionModel")) {
//										// TODO: what if In-parameters are set late (by open) ?
//										var oFilterField = oCM.getFilterField(sPath);
//										var sFieldHelpID = oFilterField && oFilterField.getFieldHelp();
//										var oFieldHelp = sFieldHelpID && sap.ui.getCore().byId(sFieldHelpID);

//										if (oFieldHelp) {
//										// set in/out parameter to new condition.
//										var aParameters = oFieldHelp.getInParameters();
//										var k = 0;
//										var sFieldPath;
//										var oFilterFieldParameter;
//										for (k = 0; k < aParameters.length; k++) {
//										oFilterFieldParameter = aParameters[k];
//										sFieldPath = oFilterFieldParameter.getFieldPath();
//										if (oCondition.outParameters[sFieldPath]) {
//										if (!oNewCondition.inParameters) {
//										oNewCondition.inParameters = {};
//										}
//										oNewCondition.inParameters[sFieldPath] = oCondition.outParameters[sFieldPath];
//										}
//										}
//										aParameters = oFieldHelp.getOutParameters();
//										for (k = 0; k < aParameters.length; k++) {
//										oFilterFieldParameter = aParameters[k];
//										sFieldPath = oFilterFieldParameter.getFieldPath();
//										if (oCondition.outParameters[sFieldPath]) {
//										if (!oNewCondition.outParameters) {
//										oNewCondition.outParameters = {};
//										}
//										oNewCondition.outParameters[sFieldPath] = oCondition.outParameters[sFieldPath];
//										}
//										}
//										}
//										}
									} else {
										continue;
									}
									if (!vValue) {
										vValue = [];
									}
									if (!Array.isArray(vValue)) {
										throw new Error("Value on OutParameter must be an array " + oOutParameter);
									}
									if (FilterOperatorUtil.indexOfCondition(oNewCondition, vValue) < 0) {
										oNewCondition.validated = ConditionValidated.Validated; // out-parameters are validated
										vValue.push(oNewCondition);
										oOutParameter.setValue(vValue);
									}
								} else if (!oOutParameter.getHelpPath()) {
										oOutParameter.setValue(oOutParameter.getFixedValue());
									} else if (oOutParameter.getFieldPath() === sPath) { // in Conditions fieldPath is used
										oOutParameter.setValue(oCondition.outParameters[sPath]);
									}
							}
						}
					}
				}
			}
		}.bind(this)).unwrap();

	};

	function _mapInParametersToField(oInParameters) {

		return _mapParametersToField.call(this, oInParameters, this.getInParameters());

	}

	function _mapOutParametersToField(oOutParameters) {

		return _mapParametersToField.call(this, oOutParameters, this.getOutParameters());

	}

	function _mapParametersToField(oParameters, aParameters) {

		if (!oParameters || aParameters.length === 0) {
			return null;
		}

		var oFieldParameters = {};

		for (var i = 0; i < aParameters.length; i++) {
			var oParameter = aParameters[i];
			var sHelpPath = oParameter.getHelpPath();
			var sFieldPath = oParameter.getFieldPath();
			if (sHelpPath && sFieldPath) {
				for (var sMyFieldPath in oParameters) {
					if (sHelpPath === sMyFieldPath) {
						oFieldParameters[sFieldPath] = oParameters[sMyFieldPath];
						break;
					}
				}
			} else if (!sHelpPath && sFieldPath && oParameter.getFixedValue) {
				// if helpPath is not set we expect a fix value for out-parameter
				oFieldParameters[sFieldPath] = oParameter.getFixedValue();
			}
		}

		return oFieldParameters;

	}

	function _mapInParametersToHelp(oInParameters, bNested) {

		return _mapParametersToHelp.call(this, oInParameters, this.getInParameters(), false, undefined, undefined, false, bNested);

	}

	function _mapOutParametersToHelp(oOutParameters, bNoDefault, bNested) {

		return _mapParametersToHelp.call(this, oOutParameters, this.getOutParameters(), bNoDefault, undefined, undefined, false, bNested);

	}

	function _mapParametersToHelp(oParameters, aParameters, bNoDefault, aBindings, oBindingContext, bFilters, bNested) {

		var oHelpParameters;
		var oParameter;
		var sHelpPath;
		var sFieldPath;
		var i = 0;
		var oCondition;

		if (aParameters.length > 0) {
			if (!oParameters) {
				if (!bNoDefault) {
					// use current values of in/out-parameters as default
					// in case of getTextForKey only out-parameters set by condition are from interest (To find manual selected entry again if no in-paramters are used)
					// in this case only provided parameters are from interest.
					// If Bindings are provided (from different BindingContext) use the value of this Binding
					var oMyBindingContext = this.getBindingContext();
					for (i = 0; i < aParameters.length; i++) {
						oParameter = aParameters[i];
						sHelpPath = bNested ? "conditions/" + oParameter.getHelpPath() : oParameter.getHelpPath(); // if InParameter of InParameter it is part of the same FilterBar
						var vValue = oParameter.getValue();
						var bUseConditions = oParameter.getUseConditions();
						var bInitialValueFilterEmpty = oParameter.getInitialValueFilterEmpty();
						var j = 0;
						if (aBindings || oBindingContext) {
							var oBinding = oParameter.getBinding("value");
							var bFound = false;
							if (oBinding || bUseConditions) {
								sFieldPath = oParameter.getFieldPath();
								for (j = 0; j < aBindings.length; j++) {
									if ((oBinding && oBinding.getPath() === aBindings[j].getPath()) ||
											(bUseConditions && aBindings[j].getPath() === "/" + sFieldPath)) {
										vValue = aBindings[j].getValue();
										bFound = true;
										break;
									}
								}
								if (!bFound && !bUseConditions && oBindingContext && oBinding && oBinding.isRelative() && (!oBinding.getContext() || (oBinding.getContext() !== oBindingContext && oBinding.getContext() === oMyBindingContext))) {
									// no new binding created and different BindingContext -> use propery from BindingConext (was already read before)
									vValue = oBindingContext.getProperty(oBinding.getPath());
								}
							}
						}

						if (sHelpPath) {
							if (!oHelpParameters) {
								oHelpParameters = {};
							}
							if (bFilters) {
								// create Filter statements here as here the data type of the Parameters can be determined
								// allow multiple values
								// ignore empty conditions for filtering
								oHelpParameters[sHelpPath] = [];
								if (bUseConditions) { // just use conditions
									if (!vValue) {
										vValue = []; // if ConditionModel Binding not initilaized in the moment
									}
									for (j = 0; j < vValue.length; j++) {
										oCondition = merge({}, vValue[j]);
										// change paths of in- and out-parameters
										if (oCondition.inParameters) {
											oCondition.inParameters = _mapInParametersToHelp.call(this, oCondition.inParameters, true);
										}
										if (oCondition.outParameters) {
											oCondition.outParameters = _mapOutParametersToHelp.call(this, oCondition.outParameters, false, true);
										}
										oHelpParameters[sHelpPath].push(oCondition);
									}
								} else {
									if (!vValue && bInitialValueFilterEmpty) {
										oCondition = Condition.createCondition("Empty", []);
										oCondition.isEmpty = false; // no explicit check needed
									} else if (vValue) {
										oCondition = Condition.createItemCondition(vValue);
										oCondition.validated = ConditionValidated.Validated;
									}
									if (oCondition) {
										oHelpParameters[sHelpPath].push(oCondition);
									}
								}
								oCondition = undefined;
							} else { // also add empty values to InParameter to allow comparison
								if (bUseConditions) {
									// TODO: What if there are multiple conditions or not EQ?
									if (vValue && vValue.length > 0) {
										oHelpParameters[sHelpPath] = vValue[0].values[0];
									}
								} else {
									oHelpParameters[sHelpPath] = vValue;
								}
							}
						}
					}
				}
			} else {
				for (var sMyFieldPath in oParameters) {
					for (i = 0; i < aParameters.length; i++) {
						oParameter = aParameters[i];
						sHelpPath = bNested ? "conditions/" + oParameter.getHelpPath() : oParameter.getHelpPath(); // if InParameter of InParameter it is part of the same FilterBar
						sFieldPath = oParameter.getFieldPath();
						if (sFieldPath && (sFieldPath === sMyFieldPath || sFieldPath === "conditions/" + sMyFieldPath) && sHelpPath) { // support also old saved conditions without "conditions/" in name
							if (!oHelpParameters) {
								oHelpParameters = {};
							}
							if (bFilters) { // create conditions
								oHelpParameters[sHelpPath] = [];
								oCondition = Condition.createItemCondition(oParameters[sMyFieldPath]);
								oCondition.validated = ConditionValidated.Validated;
								oHelpParameters[sHelpPath].push(oCondition);
							} else {
								oHelpParameters[sHelpPath] = oParameters[sMyFieldPath];
							}
						}
					}
				}
			}
			if (bFilters) {
				// return filters for filtering
				var oConditionTypes = this._getTypesForConditions(oHelpParameters);
				var oFilter = FilterConverter.createFilters(oHelpParameters, oConditionTypes);
				oHelpParameters = oFilter;
			}
		}

		return oHelpParameters;

	}

	function _applyFilters(bAsync) {

		if (bAsync) {
			if (!this._iFilterTimer) {
				this._iFilterTimer = setTimeout(function() {
					this._iFilterTimer = undefined;
					_applyFilters.call(this);
				}.bind(this), 0);
			}
			return;
		} else if (this._iFilterTimer) {
			clearTimeout(this._iFilterTimer);
			this._iFilterTimer = undefined;
		}

		if ((!this.isOpen() && !this._bNavigateRunning && !this._bOpen) || (this._bClosing && !this._bSwitchToDialog) || !this._bApplyFilter) {
			// apply filters only if open (no request on closed FieldHelp)
			this._bPendingFilterUpdate = true;
			return;
		}

		if (this._bFilterWaitingForBinding) {
			// there is already a pending request, this will use the current filters. Don't rigger an additional request.
			return;
		}

		// if InParameter value is pending -> wait until it is set
		var aInParameters = this.getInParameters();
		var aInBindings = _getParameterBinding.call(this, aInParameters, false);
		var oBindingPendingPromise = _checkBindingsPending.call(this, aInBindings); // If curently resolved do not check again

		if (oBindingPendingPromise instanceof Promise) {
			oBindingPendingPromise.then(function() {
				// promise on binding is resolved before property updated on InParameter or update triggered in ConditionModel
				this._bFilterWaitingForBinding = false;
				_applyFilters.call(this, true); // trigger after the InParameter "value" property was updated and even if InParameter is empty
			}.bind(this));
			this._bFilterWaitingForBinding = true;
			return;
		}

		// TODO: better way to detrmine what wrapper to use
		var oDialog = this.getAggregation("_dialog");
		var bSuggestion = (!oDialog || !oDialog.isOpen()) && !(this._bClosing && this._bSwitchToDialog); // if switching to dialog use dialog-wrapper

		var oWrapper = _getWrapper.call(this, bSuggestion);
		if (oWrapper) {
			var oFilterBar = this._getFilterBar();
			var oConditions;

			if (oFilterBar) {
				oConditions = oFilterBar.getInternalConditions();
			} else {
				// no FilterBar used - use lokal condition
				oConditions = this._oConditions;
			}

			var oConditionTypes = this._getTypesForConditions(oConditions);
			var oFilter = FilterConverter.createFilters( oConditions, oConditionTypes, undefined, this.getCaseSensitive());
			var aFilters = [];
			var aSearchConditions = oConditions["$search"];
			var sSearch;

			if (oFilter) {
				aFilters.push(oFilter);
			}

			if (aSearchConditions && aSearchConditions.length > 0) {
				sSearch = aSearchConditions[0].values[0];
			}

			oWrapper.applyFilters(aFilters, sSearch, oFilterBar);
		}

	}

	/**
	 * Returns a condition type map for the valuehelp filterbar
	 *
	 * @returns {object} condition types map
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldValueHelpContentWrapperBase
	 */
	FieldValueHelp.prototype._getTypesForConditions = function (oConditions) {

		var oFilterBar = this.getFilterBar();
		var aInParameters = this.getInParameters();
		var oConditionTypes;
		var sFieldPath;

		if (oFilterBar) {
			oConditionTypes = FilterConverter.createConditionTypesMapFromFilterBar( oConditions, oFilterBar);
		} else {
			// collect condition Fieldpaths here
			oConditionTypes = {};
			for (sFieldPath in oConditions) {
				oConditionTypes[sFieldPath] = {type: null};
			}
		}

		// try to find missing type from InParameter
		for (sFieldPath in oConditionTypes) {
			if (!oConditionTypes[sFieldPath].type) {
				for (var i = 0; i < aInParameters.length; i++) {
					var oInParameter = aInParameters[i];
					if (oInParameter.getHelpPath() === sFieldPath) {
						oConditionTypes[sFieldPath].type = oInParameter.getDataType();
						break;
					}
				}
			}
		}

		return oConditionTypes;

	};


	FieldValueHelp.prototype.getMaxConditions = function() {

		if (this._oField && this._oField.getMaxConditionsForHelp) {
			// if Field or FilterField -> use it's MaxConditions
			return this._oField.getMaxConditionsForHelp();
		} else if (this._oField && this._oField.getMaxConditions) {
			// if Field or FilterField -> use it's MaxConditions
			return this._oField.getMaxConditions();
		} else {
			// TODO: how to set if field not provide MaxConditions?
			return 1;
		}

	};

	FieldValueHelp.prototype.getDisplay = function() {

		if (this._oField && this._oField.getDisplay) {
			// if Field or FilterField -> use it's Display
			return this._oField.getDisplay();
		}

	};

	FieldValueHelp.prototype.getRequired = function() {

		if (this._oField && this._oField.getRequired) {
			// if Field or FilterField -> use it's Required
			return this._oField.getRequired();
		} else {
			// TODO: default false?
			return false;
		}

	};

	FieldValueHelp.prototype.getDataType = function() {

		if (this._oField.getDataType) {
			// if Field or FilterField -> use it's DataType
			return this._oField.getDataType();
		} else {
			// TODO: default case?
			return "sap.ui.model.type.String";
		}

	};

	/**
	 * Return field-internal information stored in <code>FormatOptions</code>.
	 *
	 * @returns {object} formatOptions of the field
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldValueHelpContentWrapperBase
	 */
	FieldValueHelp.prototype._getFormatOptions = function() {

		if (this._oField && this._oField._getFormatOptions) {
			// if Field or FilterField -> use it's DataType, Delegate....
			return this._oField._getFormatOptions();
		} else {
			return {};
		}

	};

	/**
	 * Returns the path of the key field inside the content control (for example, table).
	 *
	 * @returns {string} Key path
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldValueHelpContentWrapperBase
	 */
	FieldValueHelp.prototype._getKeyPath = function() {

		var sKeyPath = this.getKeyPath();

		if (!sKeyPath && this._oField && this._oField.getFieldPath && this._oField.getFieldPath()) {
			sKeyPath = this._oField.getFieldPath();
		}

		return sKeyPath;

	};


	/**
	 * Returns the relevant filterbar of this valuehelp.
	 *
	 * @returns {sap.ui.mdc.FilterBar} relevant filterbar
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldValueHelpContentWrapperBase
	 */
	 FieldValueHelp.prototype._getFilterBar = function() {

		var oFilterBar = this.getFilterBar();

		if (!oFilterBar) {
			oFilterBar = this.getAggregation("_filterBar");
		}

		return oFilterBar;

	};

	FieldValueHelp.prototype.clone = function(sIdSuffix, aLocalIds) {

		// detach event handler before cloning to not have it twice on the clone
		// attach it after clone again
		var aWrappers = [this.getContent(), this.getSuggestContent(), this.getDialogContent()];
		var oFilterBar = this.getFilterBar();
		var i = 0;
		var oWrapper;

		for (i = 0; i < aWrappers.length; i++) {
			oWrapper = aWrappers[i];
			if (oWrapper) {
				oWrapper.detachEvent("navigate", _handleNavigate, this);
				oWrapper.detachEvent("selectionChange", _handleSelectionChange, this);
				oWrapper.detachEvent("dataUpdate", _handleDataUpdate, this);
			}
		}

		if (oFilterBar) {
			oFilterBar.detachEvent("search", _updateFiltersFromFilterBar, this);
		}

		var oClone = FieldHelpBase.prototype.clone.apply(this, arguments);

		for (i = 0; i < aWrappers.length; i++) {
			oWrapper = aWrappers[i];
			if (oWrapper) {
				oWrapper.attachEvent("navigate", _handleNavigate, this);
				oWrapper.attachEvent("selectionChange", _handleSelectionChange, this);
				oWrapper.attachEvent("dataUpdate", _handleDataUpdate, this);
			}
		}

		if (oFilterBar) {
			oFilterBar.attachEvent("search", _updateFiltersFromFilterBar, this);
		}

		return oClone;

	};

	function _createDialog() {

		var oDialog;

		if ((!Dialog || !Button || !ValueHelpPanel || !DefineConditionPanel || !ManagedObjectModel || !FilterBar || !FilterField || !CollectiveSearchSelect || !Item) && !this._bDialogRequested) {
			Dialog = sap.ui.require("sap/m/Dialog");
			Button = sap.ui.require("sap/m/Button");
			ValueHelpPanel = sap.ui.require("sap/ui/mdc/field/ValueHelpPanel");
			DefineConditionPanel = sap.ui.require("sap/ui/mdc/field/DefineConditionPanel"); // TODO: load only if needed
			ManagedObjectModel = sap.ui.require("sap/ui/model/base/ManagedObjectModel");
			FilterBar = sap.ui.require("sap/ui/mdc/filterbar/vh/FilterBar");
			FilterField = sap.ui.require("sap/ui/mdc/FilterField");
			CollectiveSearchSelect = sap.ui.require("sap/ui/mdc/filterbar/vh/CollectiveSearchSelect");
			Item = sap.ui.require("sap/ui/core/Item");
			if (!Dialog || !Button || !ValueHelpPanel || !DefineConditionPanel || !ManagedObjectModel || !FilterBar || !FilterField || !CollectiveSearchSelect || !Item) {
				sap.ui.require(["sap/m/Dialog", "sap/m/Button", "sap/ui/mdc/field/ValueHelpPanel",
				                "sap/ui/mdc/field/DefineConditionPanel", "sap/ui/model/base/ManagedObjectModel",
				                "sap/ui/mdc/filterbar/vh/FilterBar", "sap/ui/mdc/FilterField",
				                "sap/ui/mdc/filterbar/vh/CollectiveSearchSelect", "sap/ui/core/Item"], _DialogLoaded.bind(this));
				this._bDialogRequested = true;
			}
		}
		if (Dialog && Button && ValueHelpPanel && DefineConditionPanel && ManagedObjectModel && FilterBar && FilterField && CollectiveSearchSelect && Item && !this._bDialogRequested) {
			if (!this._oResourceBundle) {
				this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
			}

			var oButtonOK = new Button(this.getId() + "-ok", {
				text: this._oResourceBundle.getText("valuehelp.OK"),
				enabled: "{$help>/_enableOK}",
				type: ButtonType.Emphasized,
				press: _dialogOk.bind(this)
			});

			var oButtonCancel = new Button(this.getId() + "-cancel", {
				text: this._oResourceBundle.getText("valuehelp.CANCEL"),
				press: _dialogCancel.bind(this)
			});

			this._oManagedObjectModel = new ManagedObjectModel(this);

			var oValueHelpPanel = _createValueHelpPanel.call(this);

			oDialog = new Dialog(this.getId() + "-dialog", {
				contentHeight: _getContentHeight(),
				contentWidth: _getContentWidth(),
				horizontalScrolling: false,
				verticalScrolling: false,
				title: "{$help>/title}",
				stretch: Device.system.phone,
				resizable: true,
				draggable: true,
				content: [oValueHelpPanel],
				afterOpen: _handleDialogAfterOpen.bind(this),
				afterClose: _handleDialogAfterClose.bind(this),
				buttons: [oButtonOK, oButtonCancel]
			}).setModel(this._oManagedObjectModel, "$help");

			oDialog.isPopupAdaptationAllowed = function () {
				return false;
			};

			oDialog.addStyleClass("sapMdcValueHelpTitle");

			this.setAggregation("_dialog", oDialog, true);
			// TODO
			this.setModel(new ResourceModel({ bundleName: "sap/ui/mdc/messagebundle", async: false }), "$i18n");

			_toggleDefineConditions.call(this, this.getShowConditionPanel());
		}

		return oDialog;

	}

	function _getContentHeight() {
		if (Device.system.desktop) {
			return "700px";
		}
		if (Device.system.tablet) {
			return Device.orientation.landscape ? "600px" : "600px";
		}
	}

	function _getContentWidth() {
		if (Device.system.desktop) {
			return "1080px";
		}
		if (Device.system.tablet) {
			return Device.orientation.landscape ? "920px" : "600px";
		}
	}

	function _DialogLoaded(fnDialog, fnButton, fnValueHelpPanel, fnDefineConditionPanel, fnManagedObjectModel, fnFilterBar, fnFilterField, fnCollectiveSearchSelect, fnItem) {

		Dialog = fnDialog;
		Button = fnButton;
		ValueHelpPanel = fnValueHelpPanel;
		DefineConditionPanel = fnDefineConditionPanel;
		ManagedObjectModel = fnManagedObjectModel;
		FilterBar = fnFilterBar;
		FilterField = fnFilterField;
		CollectiveSearchSelect = fnCollectiveSearchSelect;
		Item = fnItem;
		this._bDialogRequested = false;

		if (!this._bIsBeingDestroyed) {
			_createDialog.call(this);
			if (this._bOpen) {
				this.open();
			}
		}

	}

	function _createValueHelpPanel() {

		var oWrapper = _getWrapper.call(this, false);
		var oFilterBar = this._getFilterBar();

		var oValueHelpPanel = new ValueHelpPanel(this.getId() + "-VHP", {
			height: "100%",
			showFilterbar: !!oFilterBar,
			formatOptions: this._getFormatOptions(),
			inputOK: "{$help>/_enableOK}"
		});
		oValueHelpPanel.setModel(this._oManagedObjectModel, "$help");

		if (oWrapper) {
			oWrapper.initialize(false);
			_setContentOnValueHelpPanel.call(this, oValueHelpPanel, oWrapper.getDialogContent());
		}
		if (oFilterBar) {
			oValueHelpPanel.setFilterbar(oFilterBar);
		}

		return oValueHelpPanel;

	}

	function _setContentOnValueHelpPanel(oValueHelpPanel, oContent) {
		oValueHelpPanel.setTable(oContent);
	}

	function _contentChanged(sMutation, oWrapper, sName) {

		var oPopover = this.getAggregation("_popover");
		var oDialog = this.getAggregation("_dialog");
		if (sMutation === "remove") {
			oWrapper.detachEvent("navigate", _handleNavigate, this);
			oWrapper.detachEvent("selectionChange", _handleSelectionChange, this);
			oWrapper.detachEvent("dataUpdate", _handleDataUpdate, this);
			oWrapper = undefined;
		} else {
			oWrapper.attachEvent("navigate", _handleNavigate, this);
			oWrapper.attachEvent("selectionChange", _handleSelectionChange, this);
			oWrapper.attachEvent("dataUpdate", _handleDataUpdate, this);
			_updateSelectedItems.call(this);
		}
		this.fireDataUpdate();
		if (this._bNavigate) {
			this.navigate(this._iStep);
		} else if (oPopover) {
			oPopover.invalidate();
			var sFilterValue = this.getFilterValue();
			if (sFilterValue) {
				_filterContent.call(this, sFilterValue);
			}
			_setInParameterFilters.call(this);

			if (oWrapper && this._bOpenIfContent) {
				oWrapper.initialize(true);

				var oField = this._getField();
				if (oField) {
					oWrapper.fieldHelpOpen(true);
					oPopover.openBy(this._getControlForSuggestion());
				}
				this._bOpenIfContent = false;
			}
		} else if (oWrapper && this._bOpenIfContent) {
			this._bOpenIfContent = false;
			this.open(true);
		}
		if (oDialog && sName !== "suggestContent" && !(sName === "content" && this.getDialogContent())) {
			// update ValueHelpPanel
			if (oWrapper) {
				oWrapper.initialize(false);
				var oValueHelpPanel = oDialog.getContent()[0];
				oValueHelpPanel.setShowTokenizer(this.getMaxConditions() !== 1);
				_setContentOnValueHelpPanel.call(this, oValueHelpPanel, oWrapper.getDialogContent());
				if (oDialog.isOpen() || this._bOpen) {
					oWrapper.fieldHelpOpen(false);
				}
			}
		}

	}

	function _getDialog() {

		var oDialog = this.getAggregation("_dialog");

		if (!oDialog) {
			oDialog = _createDialog.call(this);
		}

		return oDialog;

	}

	function _dialogOk(oEvent) {

		this.close();

		var aConditions = this.getConditions();
		aConditions = Condition._removeEmptyConditions(aConditions);
		aConditions = Condition._removeInitialFlags(aConditions);
		FilterOperatorUtil.updateConditionsValues(aConditions); // to remove static text from static conditions

		this.setProperty("conditions", aConditions, true); // do not invalidate whole FieldHelp

		// fire select event after Dialog is closed because inside applyFocusInfo is called
		// that might reset cursor and selection of field -> update it after this
		this._bOK = true;

	}

	function _dialogCancel(oEvent) {

		this.close();

		this.setProperty("conditions", this._aOldConditions, true); // do not invalidate whole FieldHelp

	}

	function _handleDialogAfterOpen(oEvent) {

		this._bSwitchToDialog = false;

	}

	function _handleDialogAfterClose(oEvent) {

		var aConditions = this.getConditions(); // get conditions here as they might be modified in a close handler
		this._bDialogOpen = false;
		this._aOldConditions = undefined;

		this._handleAfterClose(oEvent);

		if (this._bOK) {
			// fire select event after Dialog is closed because inside applyFocusInfo is called
			// that might reset cursor and selection of field -> update it after this
			this.fireSelect({conditions: aConditions, add: false, close: true});
		}
		this._bOK = undefined;

		this.setProperty("_enableOK", true, true); // initialize

	}

	function _toggleDefineConditions(bActive) {
		var oDialog = this.getAggregation("_dialog");
		if (oDialog && this._oField) {
			var oValueHelpPanel = oDialog.getContent()[0];
			if (bActive) { // sow DefineConditions too if only EQ is allowes to suppoer free input. If not wanted, showConditionPanel should be set to false
				if (!oValueHelpPanel._oDefineConditionPanel) { //TODO: use API?
					var oDefineConditionPanel = new DefineConditionPanel(this.getId() + "-DCP", {label: "{$help>/title}"});
					oValueHelpPanel.setDefineConditions(oDefineConditionPanel);
				}
			} else {
				oValueHelpPanel.setDefineConditions();
			}
		}
	}

	function _updateFilterBar(sMutation, oFilterBar, bInternalFilterBar) {

		if (sMutation === "remove") {
			oFilterBar.detachEvent("search", _updateFiltersFromFilterBar, this);
			if (!bInternalFilterBar) { // internal FilterBar is completely destroyed
				var oSearchField = oFilterBar.getBasicSearchField();
				if (oSearchField && oSearchField._bCreadedByFVH) { // remove own SearchField
					oFilterBar.setBasicSearchField();
				}
				if (oFilterBar.getCollectiveSearch && oFilterBar.getCollectiveSearch()) { // remove collectiveSearch
					oFilterBar.setCollectiveSearch();
				}
			}

			oFilterBar = undefined;
		} else {
			oFilterBar.attachEvent("search", _updateFiltersFromFilterBar, this);
			_assignCollectiveSearch.call(this, false);
		}

		var oDialog = this.getAggregation("_dialog");
		if (oDialog) {
			var oValueHelpPanel = oDialog.getContent()[0];
			oValueHelpPanel.setFilterbar(oFilterBar);
			oValueHelpPanel.setShowFilterbar(!!oFilterBar);
			if (this.isOpen()) { // add current InParameterFilters and Filtervalue to Filterbar or internal condition to have right filters
				_initializeFilters.call(this);
				if (!bInternalFilterBar || sMutation === "remove") { // on creating internal FilterBar SearchField is already created
					_initializeSearchField.call(this, sMutation === "remove"); // async in removing to prevent creating internal FilterBar while removing old one and adding new one
				}
			}
		}

	}

	function _updateFiltersFromFilterBar(oEvent) {

		var oFilterBar = this._getFilterBar();

		if (oFilterBar) {
			// update FilterValue from SearchField
			var sFilterFields = this.getFilterFields();
			if (sFilterFields && !this._bUpdateFilterAfterClose) { // filter changed while closing -> condition not updated
				var aConditions = _getConditions.call(this, sFilterFields);
				var sFilterValue = aConditions.length > 0 ? aConditions[0].values[0] : "";
				if (sFilterValue !== this.getFilterValue()) {
					this.setProperty("filterValue", sFilterValue, true);
				}
			}

			// If event fired from Filterbar the filter must set active
			if (this._bApplyFilter || (!this._bApplyFilter && (oEvent || oFilterBar.getLiveMode()))) {
				// user triggers search or liveMode -> resume
				this._bApplyFilter = true; // applyFilter even if suspended (resume)
				_applyFilters.call(this, true);
			}
		}

	}

	function _initializeFilters() {

		var oFilterBar = this._getFilterBar();
		if (oFilterBar) {
			// remove old conditions
			oFilterBar.setInternalConditions(Object.keys(oFilterBar.getConditions()).reduce(function (oResult, sKey) {
				oResult[sKey] = [];
				return oResult;
			}, {}));
		}

		// add conditions from In-Parameters and Filter
		_filterContent.call(this, this.getFilterValue());
		_setInParameterFilters.call(this);

	}

	function _getConditions(sFieldPath) {

		var oFilterBar = this._getFilterBar();
		var oConditions;

		if (oFilterBar) {
			oConditions = oFilterBar.getInternalConditions();
		} else {
			oConditions = this._oConditions;
		}

		return oConditions[sFieldPath] || [];

	}

	function _addCondition(sFieldPath, oCondition) {

		var oFilterBar = this._getFilterBar();
		var oConditions;

		if (oFilterBar) {
			oConditions = oFilterBar.getInternalConditions();
		} else {
			oConditions = this._oConditions;
		}

		if (!oConditions[sFieldPath]) {
			oConditions[sFieldPath] = [];
		}
		oConditions[sFieldPath].push(oCondition); // use FieldHelp paths in FilterBar too

		if (oFilterBar) {
			oFilterBar.setInternalConditions(oConditions);
		}

	}

	function _removeConditions(sFieldPath) {

		var oFilterBar = this._getFilterBar();
		var oConditions;

		if (oFilterBar) {
			oConditions = oFilterBar.getInternalConditions();
		} else {
			oConditions = this._oConditions;
		}

		if (oConditions[sFieldPath] && oConditions[sFieldPath].length > 0) {
			oConditions[sFieldPath] = [];
		}

		if (oFilterBar) {
			oFilterBar.setInternalConditions(oConditions);
		}
	}

	/* if search is supported a SearchField is needed on the Dialog. (not on the suggest-popover)
	 * If there is a FilterBar given, add the SearchField to it.
	 * If there is no FilterBar given, create a new one and add the SearchField.
	 */
	function _initializeSearchField(bAsync) {

		if (bAsync) {
			if (!this._iSearchFieldTimer) {
				this._iSearchFieldTimer = setTimeout(function() {
					this._iSearchFieldTimer = undefined;
					_initializeSearchField.call(this, false);
				}.bind(this), 0);
			}
			return;
		} else if (this._iSearchFieldTimer) { // in case of a pending timeOut but sync calling, skip pending timeout
			clearTimeout(this._iSearchFieldTimer);
			this._iSearchFieldTimer = null;
		}

		var sFilterFields = this.getFilterFields();
		var oWrapper = _getWrapper.call(this, false); // without content it makes no sense to have a SearchField

		if (sFilterFields && oWrapper) {
			var oFilterBar = this._getFilterBar();

			if (!oFilterBar) {
				oFilterBar = new FilterBar(this.getId() + "-FB", {
					liveMode: !oWrapper.isSuspended(), // if suspended, no live search
					showGoButton: false
				});
				oFilterBar.setInternalConditions(this._oConditions); // if already InParameter or SearchValue set, move it to FilterBar
				this._oConditions = {};
				this.setAggregation("_filterBar", oFilterBar, true);
			}

			if (!oFilterBar.getBasicSearchField()) {
				if (!this._oSearchField) { // reuse SearchField if just FilterBar switched (CollectiveSearch case)
					this._oSearchField = new FilterField(this.getId() + "-search", {
						conditions: "{$filters>/conditions/" + sFilterFields + "}",
						placeholder:"{$i18n>filterbar.SEARCH}",
						label:"{$i18n>filterbar.SEARCH}", // TODO: do we want a label?
						maxConditions: 1,
						width: "50%"
					});
					this._oSearchField._bCreadedByFVH = true; // to only remove own SearchFields
				} else {
					this._oSearchField.setConditions([]); // initialize
				}

				oFilterBar.setBasicSearchField(this._oSearchField);
			}
		}

		if (this._oSearchField && !this._oSearchField.getParent()) {
			// not longer needed -> destroy
			this._oSearchField.destroy();
			delete this._oSearchField;
		}

	}


	function _getSuggestionContent() {

		var oWrapper = _getWrapper.call(this, true);
		if (oWrapper) {
			return oWrapper.getSuggestionContent();
		}

	}

	function _updateBindingContext() {

		var oBindingContext = this._oField ? this._oField.getBindingContext() : null; // if not connected use no BindingContext
		this.setBindingContext(oBindingContext);

		// in FilterField case also set right ConditionModel
		var oFormatOptions = this._getFormatOptions();
		if (oFormatOptions.conditionModel && this.getModel(oFormatOptions.conditionModelName) !== oFormatOptions.conditionModel) { // don't update propagated model
			this.setModel(oFormatOptions.conditionModel, oFormatOptions.conditionModelName);
		}

	}

	function getSAPMResourceBundle () {
		if (!this._oResourceBundleM) {
			this._oResourceBundleM = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		}
		return this._oResourceBundleM;
	}
	FieldValueHelp.prototype.getScrollDelegate = function () {

		var oDialog = this.getAggregation("_dialog");

		if (oDialog && (oDialog.isOpen() || oDialog.oPopup.getOpenState() === OpenState.OPENING)) { // TODO: better way to get opening state
			var oWrapper = _getWrapper.call(this, false);
			var oContent = oWrapper && oWrapper.getDialogContent();
			if (oContent && oContent.getScrollDelegate) {
				return oContent.getScrollDelegate();
			} else {
				return undefined;
			}
		} else {
			return FieldHelpBase.prototype.getScrollDelegate.apply(this, arguments);
		}

	};

	FieldValueHelp.prototype._fireOpen = function(bSuggestion) {

		if (!this._bOpenHandled) { // to prevent double execution
			return FieldHelpBase.prototype._fireOpen.apply(this, arguments);
		}

		return true;

	};

	FieldValueHelp.prototype.getRoleDescription = function(iMaxConditions) {

		if (!iMaxConditions || iMaxConditions === 1) {
			return null;
		} else if (!_getWrapper.call(this, false) && this.getShowConditionPanel() && !this.getNoDialog()) { // no table, only condition panel -> no comboBox
			return null;
		} else {
			var sapMResourceBundle = getSAPMResourceBundle.apply(this);
			return sapMResourceBundle.getText("MULTICOMBOBOX_ARIA_ROLE_DESCRIPTION");
		}

	};

	FieldValueHelp.prototype.getAriaHasPopup = function() {

		if (this.getNoDialog()) {
			return "listbox";
		} else if (this.getShowConditionPanel()) {
			return "dialog";
		} else {
			return "listbox"; // as list is only content in Popover (it has both, popver and dialog, but on typing and with arrow keys the list is opend)
		}

	};

	FieldValueHelp.prototype.getValueHelpEnabled = function() {

		if (this.getNoDialog()) {
			return false;
		} else {
			return true;
		}

	};

	FieldValueHelp.prototype._getContenRequestProperties = function(bSuggestion) {

		var oProperties = {};
		var aCollectiveSearchItems = this.getCollectiveSearchItems();

		if (aCollectiveSearchItems.length > 0) {
			var oDialog = this.getAggregation("_dialog");
			if (oDialog && oDialog.isOpen() && this._oCollectiveSearchSelect) {
				var vKey = this._oCollectiveSearchSelect.getSelectedItemKey();
				oProperties.collectiveSearchKey = vKey;
			} else {
				// use first item
				oProperties.collectiveSearchKey = aCollectiveSearchItems[0].getKey();
			}
		}

		return oProperties;

	};

	function _createCollectiveSearch() {

		if (!this._oCollectiveSearchSelect) {
			// check if collective search is supported
			var oItemTemplate = new Item(this.getId() + "-collSearchItem", {
				key: "{$help>key}",
				text: "{$help>text}",
				enabled: "{$help>enabled}",
				textDirection: "{$help>textDirection}"
			});

			this._oCollectiveSearchSelect = new CollectiveSearchSelect(this.getId() + "-collSearch", {
				title:"{$i18n>COL_SEARCH_SEL_TITLE}",
				items: {path: "$help>/collectiveSearchItems", template: oItemTemplate},
				select: _handleCollectiveSearchSelect.bind(this)
			}).setModel(this._oManagedObjectModel, "$help");
		}

		return this._oCollectiveSearchSelect;

	}

	function _handleCollectiveSearchSelect(oEvent) {

		var fnCallback = function() {
			// apply Filters after change of Table and/or FilterBar
			_applyFilters.call(this, true);
		}.bind(this);

		this.setProperty("filterValue", "", true); // initialize SearchField
		var bSync = this._callContentRequest(false, fnCallback);

		if (bSync) {
			fnCallback();
		}

	}

	function _assignCollectiveSearch(bInitializeKey) {

		var oDialog = this.getAggregation("_dialog");
		var oFilterBar = this._getFilterBar();
		if (oDialog && oFilterBar) {
			var aCollectiveSearchItems = this.getCollectiveSearchItems();
			if (aCollectiveSearchItems.length <= 1) {
				if (oFilterBar.getCollectiveSearch && oFilterBar.getCollectiveSearch()) {
					oFilterBar.setCollectiveSearch(); // no items or only one item -> no collective search
				}
			} else {
				if (oFilterBar.getCollectiveSearch && !oFilterBar.getCollectiveSearch()) {
					oFilterBar.setCollectiveSearch(_createCollectiveSearch.call(this));
				}
				if (bInitializeKey && this._oCollectiveSearchSelect) {
					//reset collectiveSearch to first item
					this._oCollectiveSearchSelect.setSelectedItemKey(aCollectiveSearchItems[0].getKey());
				}
			}
		}

	}

	function _getWrapper(bSuggestion) {

		var oWrapper;

		if (bSuggestion) {
			oWrapper = this.getSuggestContent();
		} else {
			oWrapper = this.getDialogContent();
		}

		if (!oWrapper) {
			oWrapper = this.getContent();
		}
		return oWrapper;

	}

	return FieldValueHelp;

});
