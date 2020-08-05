/*
 * ! ${copyright}
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
	'sap/ui/model/Context'
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
		Context
	) {
	"use strict";

	var Dialog;
	var Button;
	var ValueHelpPanel;
	var DefineConditionPanel;
	var ConditionModel;
	var ManagedObjectModel;

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
	 * @class A field help used in the <code>FieldHelp</code> association in <code>FieldBase</code> controls that shows a value help dialog.
	 * @extends sap.ui.mdc.field.FieldHelpBase
	 * @version ${version}
	 * @constructor
	 * @private
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
				 * The fields for which the table data is filtered. As default a <code>$search</code> request is used for filtering.
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
				}
			},
			aggregations: {
				/**
				 * Content of the field help.
				 *
				 * To support different types of content (e.g <code>sap.m.Table</code>), a specific wrapper is used
				 * to map the functionality of the content control to the field help. The content control
				 * is assigned to the wrapper.
				 *
				 * The filter logic must be implemented in the wrapper control.
				 * The filtering is triggered by user interaction (type ahead, search request, or search from <code>FilterBar</code>).
				 * (If <code>FilterBar</code> is in <code>LiveMode</code> and in parameters are used, this also triggers filtering.)
				 *
				 * @since 1.60.0
				 */
				content: {
					type: "sap.ui.mdc.field.FieldValueHelpContentWrapperBase",
					multiple: false
				},

				/**
				 * <code>FilterBar</code> control of the field help.
				 *
				 * @since 1.60.0
				 */
				filterBar: {
					type: "sap.ui.mdc.FilterBar",
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
		ConditionModel = undefined;
		ManagedObjectModel = undefined;

	};

	FieldValueHelp.prototype.init = function() {

		FieldHelpBase.prototype.init.apply(this, arguments);

		this._oObserver = new ManagedObjectObserver(_observeChanges.bind(this));

		this._oObserver.observe(this, {
			properties: ["filterValue", "conditions", "showConditionPanel", "title", "filterFields"],
			aggregations: ["content", "filterBar", "inParameters"]
		});

		this.setBindingContext(null); // don't inherit from parent as this could have a invalid BindingContent to read InParameters...

	};

	FieldValueHelp.prototype.exit = function() {

		FieldHelpBase.prototype.exit.apply(this, arguments);

		if (this._oManagedObjectModel) {
			this._oManagedObjectModel.destroy();
			delete this._oManagedObjectModel;
		}

		if (this._oFilterConditionModel) {
			this._oFilterConditionModel.destroy();
			delete this._oFilterConditionModel;
		}

		this._oObserver.disconnect();
		this._oObserver = undefined;

	};

	FieldValueHelp.prototype.invalidate = function(oOrigin) {

		if (oOrigin) {
			var oWrapper = this.getContent();
			var oDialog = this.getAggregation("_dialog");

			if (oWrapper && oOrigin === oWrapper) {
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

			var oFilterBar = this.getFilterBar();
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

		if (oPopover) { // empty if loaded async
			// use Wrapper content in Popover -> overwrite hook
			var oWrapper = this.getContent();
			if (oWrapper) {
				oWrapper.initialize(true);
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

		var oWrapper = this.getContent();
		if (oWrapper) {
			oWrapper.fieldHelpOpen(true);
		}

	};

	FieldValueHelp.prototype.open = function(bSuggestion) {

		if (this.getNoDialog() && !bSuggestion) {
			bSuggestion = true;
		}

		this._bUseFilterBar = !bSuggestion; // FilterBar should be used for filtering (if exist)

		// as BindingContext of Field might change (happens in table) update if needed
		_updateBindingContext.call(this);

		var oWrapper = this.getContent();

		// trigger content loading in event or delegate
		var fnOpen = function() {
			if (this._bOpenAfterPromise) {
				delete this._bOpenAfterPromise;
				this.open(bSuggestion);
			}
		}.bind(this);
		var bSync = this._bOpen ? this._callContentRequest(!!bSuggestion, fnOpen) : this._fireOpen(!!bSuggestion, fnOpen); // no open event of Popover async loaded
		delete this._bOpen; // set it new if still needed
		if (!bSync) {
			// open after delegates promise is resolved
			// but trigger loading of Popover or Dialog to use the pending time (otherwise we run in the next async loading afterwards)
			if (bSuggestion) {
				this._getPopover();
			} else {
				_getDialog.call(this);
			}

			if (oWrapper && oWrapper.getFilterEnabled() && !this._oFilterConditionModel) {
				_createFilterConditionModel.call(this);
			}

			this._bOpenAfterPromise = true;

			return;
		}

		this._bOpenHandled = true; // prevent double event and delegate call

		oWrapper = this.getContent(); // as Wrapper could be added synchronously in open event
		if (oWrapper && oWrapper.getFilterEnabled() && !this._bNavigateRunning) { //in running navigation already filtered
			if (!oWrapper.isSuspended() || bSuggestion) {// in suggestion applyFilter even if suspended (resume)
				// apply use in-parameter filters
				this._bApplyFilter = true;
			}
			if (!this._oFilterConditionModel) {
				_createFilterConditionModel.call(this);
			} else {
				// remove all filters from FilterBar (initialize on new open). But let in-parameter filters active
				_removeFilterBarFilters.call(this);
			}
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

				if (this._oFilterConditionModel && !this.getFilterValue() && !this._bNavigateRunning) {
					// if no filter call filters to search for all (use in-parameters)
					// use checkUpdate to call _applyFilters not twice
					this._oFilterConditionModel.checkUpdate(true, true);
				}

				FieldHelpBase.prototype.open.apply(this, [bSuggestion]);
			}
		} else {
			// use FilterBar filters
			_updateFiltersFromFilterBar.call(this);

			var oPopover = this.getAggregation("_popover");
			if (oPopover) {
				if (oPopover.isOpen()) {
					this.close();
				}
				oPopover.$().remove(); // destroy DOM of Wrapper content to not have it twice
			}

			var oDialog = _getDialog.call(this);

			if (oDialog) {
				var oValueHelpPanel = oDialog.getContent()[0];
				oValueHelpPanel.setShowTokenizer(this.getMaxConditions() !== 1 && !!oWrapper);
				oValueHelpPanel.setFormatOptions(this._getFormatOptions());
				oValueHelpPanel.bindProperty("conditions", {path: "$help>/conditions"});
				var sFilterFields = this.getFilterFields();
				if (sFilterFields) {
					oValueHelpPanel.bindProperty("filterConditions", {path: "filter>/conditions/" + sFilterFields});
				}

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
			this._bUseFilterBar = false;
			var oDialog = this.getAggregation("_dialog");

			if (oDialog) {
				this._bClosing = true;
				oDialog.close();

				var oValueHelpPanel = oDialog.getContent()[0];
				// remove binding of conditions to prevent updates on ValueHelpPanel and DefineConditionPanel while closed. (e.g. empty row)
				oValueHelpPanel.unbindProperty("conditions", true);
				oValueHelpPanel.unbindProperty("filterConditions", true);
			}

			this._bReopen = false;
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


	function _cleanupFilters() {

		if (!this._oFilterConditionModel) {
			return;
		}

		// remove filters: update table only if filter exist
		var oConditions = this._oFilterConditionModel.getAllConditions();
		var bRemove = false;
		for (var sMyFieldPath in oConditions) {
			if (oConditions[sMyFieldPath].length > 0) {
				bRemove = true;
				break;
			}
		}

		if (bRemove) {
			this._oFilterConditionModel.removeAllConditions(/*sFilterFields*/);
			// _applyFilters called from _handleFilterModelChange after all filters set
		}

	}

	FieldValueHelp.prototype._handleAfterClose = function(oEvent) {

		var oWrapper = this.getContent();

		if (oWrapper) {
			if (!oWrapper.getAsyncKeyText()) {
				// to have the full list if key or text are requested only from table
				_cleanupFilters.call(this);
			}
			oWrapper.fieldHelpClose();
		}

		this._bApplyFilter = false;

		FieldHelpBase.prototype._handleAfterClose.apply(this, arguments);

	};

	function _observeChanges(oChanges) {

		if (oChanges.object == this) { // FieldValueHelp
			var oDialog;

			if (oChanges.name === "content") {
				_contentChanged.call(this, oChanges.mutation, oChanges.child);
			}

			if (oChanges.name === "filterBar") {
				_updateFilterBar.call(this, oChanges.mutation, oChanges.child);
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

			if (oChanges.name === "title") {
				oDialog = this.getAggregation("_dialog");
				if (oDialog) {
					oDialog.setTitle(oChanges.current);
				}
			}

			if (oChanges.name === "filterFields") {
				oDialog = this.getAggregation("_dialog");
				if (oDialog) {
					var oValueHelpPanel = oDialog.getContent()[0];
					oValueHelpPanel.setSearchEnabled(!!oChanges.current);
					if (oDialog.isOpen()) {
						if (oChanges.current) {
							oValueHelpPanel.bindProperty("filterConditions", {path: "filter>/conditions/" + oChanges.current});
						} else {
							oValueHelpPanel.unbindProperty("filterConditions", true);
						}
					}
				}
			}

			if (oChanges.name === "inParameters") {
				_inParametersChanged.call(this, oChanges.child, oChanges.mutation);
			}
		} else if (oChanges.object.isA("sap.ui.mdc.field.InParameter")){
			if (oChanges.name === "value") {
				_inParameterValueChanged.call(this, oChanges.object.getHelpPath(), oChanges.current, oChanges.old, oChanges.object.getUseConditions());
			}
			if (oChanges.name === "helpPath") {
				_inParameterPathChanged.call(this, oChanges.current, oChanges.old, oChanges.object.getValue(), oChanges.object.getUseConditions());
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
			this.initControlDelegate();

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
			if ((oDialog && oDialog.isOpen()) || (this._bDialogRequested && this._bOpen)) {
				return true;
			}
		}

		if (this._bFocusPopover) {
			// focus should be set in popover (while navigation in multi-suggestion)
			return true;
		}

		return false; // as default let focus stay on Field

	};


	FieldValueHelp.prototype.navigate = function(iStep) {

		var oWrapper = this.getContent();
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
				oWrapper = this.getContent();
				this._bNavigate = false; // will be new set if still needed
				this._iStep = null;
				if (oWrapper) {
					this._getPopover();
					if (!this._oFilterConditionModel) {
						_createFilterConditionModel.call(this);
					}
				}
				return;
			}
		}

		this._bNavigate = false; // will be new set if still needed
		this._iStep = null;
		oWrapper = this.getContent();

		if (oWrapper) {
			// only create popover if content
			oPopover = this._getPopover();
			// apply use in-parameter filters
			this._bApplyFilter = true;
			this._bNavigateRunning = true;
			if (!this._oFilterConditionModel) {
				_createFilterConditionModel.call(this);
			} else {
				_setInParameterFilters.call(this);
			}
			this._oFilterConditionModel.checkUpdate(true, true); // if no filter set and no in-parameters, trigger initial select (if suspended)
		}

		if (!oPopover) {
			// Popover not loaded right now
			this._bNavigate = true;
			this._iStep = iStep;
			return;
		}

		if (oWrapper) {
			oWrapper.navigate(iStep);
		}

	};

	function _handleNavigate(oEvent) {

		var oPopover = this._getPopover();
		var vKey = oEvent.getParameter("key");
		var sDescription = oEvent.getParameter("description");
		var oInParameters = oEvent.getParameter("inParameters");
		var oOutParameters = oEvent.getParameter("outParameters");
		var bLeave = oEvent.getParameter("leave");
		var sItemId = oEvent.getParameter("itemId");
		var oCondition;

		if (bLeave) {
			// leave field help and focus Field
			this._oField.focus();
			return;
		}

		if (vKey === undefined) {
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

		oCondition = Condition.createItemCondition(vKey, sDescription);
		oCondition.validated = ConditionValidated.Validated; // validated even if no description (e.g. display value mode)
		if (oInParameters) {
			oCondition.inParameters = _mapInParametersToField.call(this, oInParameters);
		}
		if (oOutParameters) {
			oCondition.outParameters = _mapOutParametersToField.call(this, oOutParameters);
		}
		this.setProperty("conditions", [oCondition], true); // do not invalidate whole FieldHelp
		this.fireNavigate({value: sDescription, key: vKey, condition: oCondition, itemId: sItemId});

	}

	FieldValueHelp.prototype._getTextOrKey = function(vValue, bKey, oBindingContext, oInParameters, oOutParameters, bNoRequest) {

		var vResult = "";
		var oWrapper = this.getContent();

		if (oWrapper) {
			var oListBinding = oWrapper.getListBinding();

			if (!oListBinding) {
				this.fireDataRequested();
			}

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

			var aInBindings = _getParameterBinding.call(this, aInParameters, bBindingChanged, oBindingContext, oMyBindingContext);
			// Out Parameter binding not used, only given outParameter value

			vResult = SyncPromise.resolve().then(function() {
				return _checkBindingsPending.call(this, aInBindings);
			}.bind(this)).then(function() {
				return SyncPromise.resolve().then(function() {
					if (bKey) {
						return oWrapper.getTextForKey(vValue, _mapParametersToHelp.call(this, oInParameters, aInParameters, false, aInBindings, oBindingContext), _mapOutParametersToHelp.call(this, oOutParameters, true), bNoRequest);
					} else {
						// use default in-parameters for check
						return oWrapper.getKeyForText(vValue, _mapParametersToHelp.call(this, undefined, aInParameters, false, aInBindings, oBindingContext), bNoRequest);
					}
				}.bind(this)).then(function(vResult) {
					_cleanupParameterBinding.call(this, aInBindings, bBindingChanged);
					return _adjustWrapperResult.call(this, vResult);
				}.bind(this)).unwrap();
			}.bind(this)).unwrap();
		}

		return vResult;

	};

	function _getParameterBinding(aParameters, bNewBinding, oBindingContext, oMyBindingContext) {

		var aBindings = [];

		for (var i = 0; i < aParameters.length; i++) {
			var oParameter = aParameters[i];
			var oBinding = oParameter.getBinding("value");
			if (oBinding) {
				var sPath = oBinding.getPath();
				var oParameterBindingContext = oBinding.getContext();

				if (bNewBinding && (oParameterBindingContext === oMyBindingContext || (!oParameterBindingContext && oMyBindingContext))) {
					// InParameter is bound and uses the same BindingContext like the FieldHelp or has no BindingContext right now.
					// If InParameter is bound to a different BindingContext just use this one.
					if (oBindingContext.getProperty(sPath) === undefined) {
						// if value is already known in BindingContext from other existing Binding, don't request again.
						var oModel = oBinding.getModel();
						aBindings.push(oModel.bindProperty(sPath, oBindingContext));
					}
				} else {
					if (!oParameterBindingContext || oParameterBindingContext.getProperty(sPath) === undefined ||
							oParameterBindingContext.getProperty(sPath) !== oParameter.getValue()) {
						// Property not already known on BindingContext or not already updated in Parameter value
						aBindings.push(oBinding);
					}
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

		this.initControlDelegate();

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
		var oWrapper = this.getContent();
		return !!oWrapper;

	};

	FieldValueHelp.prototype.isUsableForValidation = function() {

		// if no wrapper only a defineDonditionPanel might be used -> therefore no input validation is possible
		var oWrapper = this.getContent();
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

		// try to keep order stable
		// remove only EQ selections that can be changed from content control
		for (i = aConditions.length - 1; i >= 0; i--) {
			oCondition = aConditions[i];
			oCondition.inParameters = _mapInParametersToHelp.call(this, oCondition.inParameters);
			oCondition.outParameters = _mapOutParametersToHelp.call(this, oCondition.outParameters);
			if (oCondition.validated === ConditionValidated.Validated) {
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
				if (oCondition.validated === ConditionValidated.Validated && oCondition.values[0] === oItem.key
						&& (!oCondition.inParameters || deepEqual(oCondition.inParameters, oItem.inParameters))
						&& (!oCondition.outParameters || deepEqual(oCondition.outParameters, oItem.outParameters))) {
					bFound = true;
					oCondition.inParameters = oItem.inParameters; // to add if not already set
					oCondition.outParameters = oItem.outParameters; // to add if not already set
					break;
				}
			}

			if (!bFound) {
				oCondition = Condition.createItemCondition(oItem.key, oItem.description, oItem.inParameters, oItem.outParameters);
				oCondition.validated = ConditionValidated.Validated; // validated even if no description (e.g. display value mode)
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
		var oWrapper = this.getContent();
		var bAsyncKeyText = oWrapper.getAsyncKeyText();

		if (bContentChange) {
			var oPopover = this.getAggregation("_popover");
			var oDialog = this.getAggregation("_dialog");
			if (oWrapper) {
				if (oWrapper.getFilterEnabled() && !this._oFilterConditionModel && ((oPopover && this._bOpenIfContent) || oDialog)) {
					_createFilterConditionModel.call(this);
				}
				if (oPopover && this._bOpenIfContent) {
					var oField = this._getField();
					if (oField) {
						oWrapper.fieldHelpOpen(true);
						oPopover.openBy(this._getControlForSuggestion());
						// apply filters now
						_applyFilters.call(this);
					}
					this._bOpenIfContent = false;
				} else if (oDialog) {
					var oValueHelpPanel = oDialog.getContent()[0];
					_setContentOnValueHelpPanel.call(this, oValueHelpPanel, oWrapper.getDialogContent());
				}
			}
		}

		if (!bAsyncKeyText) {
			// if asynchronously loading of key or description is supported fields needs no update on data change
			// Format or parse promise waits until table is set and request returned.
			this.fireDataUpdate();
		}

	}

	function _updateConditions(aConditions) {

		// validate flag must be set in the right way to show rght conditions on DefineConditionPanel
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

		var oWrapper = this.getContent();

		if (oWrapper) {
			var aConditions = this.getConditions();
			var aItems = [];
			for (var i = 0; i < aConditions.length; i++) {
				var oCondition = aConditions[i];
				if (oCondition.validated === ConditionValidated.Validated) {
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

		if (!this._oFilterConditionModel) {
			return;
		}

		var sFilterFields = this.getFilterFields();

		if (!sFilterFields) {
			return; // we don't know how to filter
		}

		var aConditions = this._oFilterConditionModel.getConditions(sFilterFields);
		var sFilterValue = aConditions.length > 0 ? aConditions[0].values[0] : "";
		if (sFilterText === sFilterValue) {
			// not changed
			return;
		}

		if (sFilterText) {
			this._bOwnFilterChange = true; // do not filter twice;
		}

		this._oFilterConditionModel.removeAllConditions(sFilterFields);
		sFilterText = sFilterText.trim();
		if (sFilterText) {
			this._bOwnFilterChange = false;
			var oCondition = Condition.createCondition("StartsWith", [sFilterText], undefined, undefined, ConditionValidated.NotValidated);
			this._oFilterConditionModel.addCondition(sFilterFields, oCondition);
		}

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
				bUpdate = _removeInFilter.call(this, sFilterPath); // if exist, remove old filter
				bUpdate = _addInFilter.call(this, sFilterPath, vValue, bUseConditions) || bUpdate;
				_updateSelectedItems.call(this); // as mapping of in-parametrs could change
			}
		}

		// _applyFilters called from _handleFilterModelChange after all filters set

	}

	function _addInFilter(sFilterPath, vValue, bUseConditions) {

		var oFilterBar;
		var oConditions;
		var oCondition;
		var bUpdate = false;

		if (this._oFilterConditionModel && sFilterPath && vValue) { // TODO: support boolean?
			oFilterBar = this.getFilterBar();

			if (this._bUseFilterBar && oFilterBar) {
				// update in FilterBar and in FilterConditionModel
				oConditions = oFilterBar.getInternalConditions();
				if (!oConditions[sFilterPath]) {
					oConditions[sFilterPath] = [];
				}
			}

			if (bUseConditions) {
				if (Array.isArray(vValue)) {
					for (var i = 0; i < vValue.length; i++) {
						oCondition = merge({}, vValue[i]);
						// change paths of in- and out-parameters
						if (oCondition.inParameters) {
							oCondition.inParameters = _mapInParametersToHelp.call(this, oCondition.inParameters);
						}
						if (oCondition.outParameters) {
							oCondition.outParameters = _mapOutParametersToHelp.call(this, oCondition.outParameters);
						}

						this._oFilterConditionModel.addCondition(sFilterPath, oCondition);
						if (this._bUseFilterBar && oFilterBar) {
							oConditions[sFilterPath].push(oCondition); // use FieldHelp paths in FilterBar too
						}
						bUpdate = true;
					}
				}
			} else {
				// TODO: way to provide description on InParameter
				// validated to let FilterField determine description if visible on FilterBar.
				// Also to show it as selected on table in FieldHelp of FilterField.
				oCondition = Condition.createItemCondition(vValue);
				oCondition.validated = ConditionValidated.Validated;
				this._oFilterConditionModel.addCondition(sFilterPath, oCondition);
				if (this._bUseFilterBar && oFilterBar) {
					oConditions[sFilterPath].push(oCondition);
				}
				bUpdate = true;
			}
		}

		if (bUpdate && this._bUseFilterBar && oFilterBar) {
			oFilterBar.setInternalConditions(oConditions);
		}

		return bUpdate;

	}

	function _removeInFilter(sFilterPath) {

		var bUpdate = false;

		if (this._oFilterConditionModel && sFilterPath && this._oFilterConditionModel.getConditions(sFilterPath).length > 0) {
			this._oFilterConditionModel.removeAllConditions(sFilterPath); // TODO: remove only filters from In-parameters, not from FilterBar
			bUpdate = true;
		}

		var oFilterBar = this.getFilterBar();

		if (this._bUseFilterBar && oFilterBar) {
			// update in FilterBar and in FilterConditionModel
			var oConditions = oFilterBar.getInternalConditions();
			if (oConditions[sFilterPath] && oConditions[sFilterPath].length > 0) {
				oConditions[sFilterPath] = [];
				oFilterBar.setInternalConditions(oConditions);
				bUpdate = true;
			}
		}

		return bUpdate;

	}

	function _inParameterValueChanged(sFilterPath, vValue, vOldValue, bUseConditions) {

		if (this._bNoInOutFilterUpdate) {
			// just a updaste of BindingContext during formatting/parsing -> do not update Filter as it will changed back soon.
			return;
		}

		if (!this.sUpdateTimer) { // do async as it can take a while until model updates all bindings.
			this.sUpdateTimer = setTimeout(function() {
				this.sUpdateTimer = undefined;
				this.fireDataUpdate(); // to update text
			}.bind(this), 0);
		}

		if (!this._getField() || !this.isOpen()) {
			return;
		}

		var bUpdate = false;

		bUpdate = _removeInFilter.call(this, sFilterPath); // if exist, remove old filter
		bUpdate = _addInFilter.call(this, sFilterPath, vValue, bUseConditions) || bUpdate;

		// _applyFilters called from _handleFilterModelChange after all filters set

	}

	function _inParameterPathChanged(sFilterPath, sOldFilterPath, vValue, bUseConditions) {

		if (!this._getField() || !this.isOpen()) {
			return;
		}

		var bUpdate = false;

		bUpdate = _removeInFilter.call(this, sOldFilterPath); // if exist, remove old filter
		bUpdate = _addInFilter.call(this, sFilterPath, vValue, bUseConditions) || bUpdate;

		// _applyFilters called from _handleFilterModelChange after all filters set

	}

	function _setInParameterFilters() {

		var aInParameters = this.getInParameters();
		var bUpdate = false;

		for (var i = 0; i < aInParameters.length; i++) {
			var oInParameter = aInParameters[i];
			var sFilterPath = oInParameter.getHelpPath();
			var vValue = oInParameter.getValue();
			var bUseConditions = oInParameter.getUseConditions();
			bUpdate = _removeInFilter.call(this, sFilterPath) || bUpdate; // if exist, remove old filter
			bUpdate = _addInFilter.call(this, sFilterPath, vValue, bUseConditions) || bUpdate;
		}

		if (this._oFilterConditionModel && !bUpdate && this._bApplyFilter && this._bPendingFilterUpdate) {
			// maybe filter change while closed, so trigger check now
			this._bPendingFilterUpdate = false;
			this._oFilterConditionModel.checkUpdate(true, true);
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
								} else {
									if (!oOutParameter.getHelpPath()) {
										oOutParameter.setValue(oOutParameter.getFixedValue());
									} else if (oOutParameter.getFieldPath() === sPath) { // in Conditions fieldPath is used
										oOutParameter.setValue(oCondition.outParameters[sPath]);
									}
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

	function _mapInParametersToHelp(oInParameters) {

		return _mapParametersToHelp.call(this, oInParameters, this.getInParameters());

	}

	function _mapOutParametersToHelp(oOutParameters, bNoDefault) {

		return _mapParametersToHelp.call(this, oOutParameters, this.getOutParameters(), bNoDefault);

	}

	function _mapParametersToHelp(oParameters, aParameters, bNoDefault, aBindings, oBindingContext) {

		var oHelpParameters;
		var oParameter;
		var sHelpPath;
		var sFieldPath;
		var i = 0;

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
						sHelpPath = oParameter.getHelpPath();
						var vValue = oParameter.getValue();
						if (aBindings || oBindingContext) {
							var oBinding = oParameter.getBinding("value");
							var bFound = false;
							if (oBinding) {
								for (var j = 0; j < aBindings.length; j++) {
									if (oBinding.getPath() === aBindings[j].getPath()) {
										vValue = aBindings[j].getValue();
										bFound = true;
										break;
									}
								}
								if (!bFound && oBindingContext && oBinding.getContext() !== oBindingContext && oBinding.getContext() === oMyBindingContext) {
									// no new binding created and different BindingContext -> use propery from BindingConext (was already read before)
									vValue = oBindingContext.getProperty(oBinding.getPath());
								}
							}
						}

						if (sHelpPath && vValue) {
							if (!oHelpParameters) {
								oHelpParameters = {};
							}
							if (oParameter.getUseConditions()) {
								// TODO: What if there are multiple conditions or not EQ?
								if (vValue.length > 0) {
									oHelpParameters[sHelpPath] = vValue[0].values[0];
								}
							} else {
								oHelpParameters[sHelpPath] = vValue;
							}
						}
					}
				}
			} else {
				for (var sMyFieldPath in oParameters) {
					for (i = 0; i < aParameters.length; i++) {
						oParameter = aParameters[i];
						sHelpPath = oParameter.getHelpPath();
						sFieldPath = oParameter.getFieldPath();
						if (sFieldPath && sFieldPath === sMyFieldPath && sHelpPath) {
							if (!oHelpParameters) {
								oHelpParameters = {};
							}
							oHelpParameters[sHelpPath] = oParameters[sMyFieldPath];
						}
					}
				}
			}
		}

		return oHelpParameters;

	}

	function _applyFilters() {

		if (!this._oFilterConditionModel || (!this.isOpen() && !this._bNavigateRunning && !this._bOpen) || this._bClosing || !this._bApplyFilter) {
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
				this._oFilterConditionModel.checkUpdate(true, true); // to trigger _applyFilters ofter the InParameter "value" property was updated and even if InParameter is empty
			}.bind(this));
			this._bFilterWaitingForBinding = true;
			return;
		}

		var oWrapper = this.getContent();
		if (oWrapper) {
			var oConditions = this._oFilterConditionModel.getAllConditions();
			var oConditionTypes = FilterConverter.createConditionTypesMapFromFilterBar( oConditions, this.getFilterBar());
			var oFilter = FilterConverter.createFilters( oConditions, oConditionTypes);

			var aFilters = [];
			var aSearchConditions = this._oFilterConditionModel.getConditions("$search");
			var sSearch;

			if (oFilter) {
				aFilters.push(oFilter);
			}

			if (aSearchConditions.length > 0) {
				sSearch = aSearchConditions[0].values[0];
			}

			oWrapper.applyFilters(aFilters, sSearch);
		}

	}

	function _handleFilterModelChange(oEvent) {

		if (this._bOwnFilterChange) {
			return;
		}

		// check if FilterValue changed by SearchField
		var sFilterFields = this.getFilterFields();
		if (sFilterFields && !this._bUpdateFilterAfterClose) { // filter changed while closing -> condition not updated
			var aConditions = this._oFilterConditionModel.getConditions(sFilterFields);
			var sFilterValue = aConditions.length > 0 ? aConditions[0].values[0] : "";
			if (sFilterValue !== this.getFilterValue()) {
				this.setProperty("filterValue", sFilterValue, true);
			}
		}

		_applyFilters.call(this);

	}

	function _createFilterConditionModel() {

		if (!ConditionModel && !this._bFilterConditionModelRequested) {
			ConditionModel = sap.ui.require("sap/ui/mdc/condition/ConditionModel");
			if (!ConditionModel) {
				sap.ui.require(["sap/ui/mdc/condition/ConditionModel"], _FilterConditionModelLoaded.bind(this));
				this._bFilterConditionModelRequested = true;
			}
		}

		if (ConditionModel) {
			var sFilterValue = this.getFilterValue();

			this._oFilterConditionModel = new ConditionModel();
			if (sFilterValue) {
				_filterContent.call(this, sFilterValue);
			}

			//IN/OUT handling
			_setInParameterFilters.call(this);

			var oConditionChangeBinding = this._oFilterConditionModel.bindProperty("/conditions", this._oFilterConditionModel.getContext("/conditions"));
			oConditionChangeBinding.attachChange(_handleFilterModelChange.bind(this));

			this.setModel(this._oFilterConditionModel, "filter");
		}

	}

	function _FilterConditionModelLoaded(fnConditionModel) {

		ConditionModel = fnConditionModel;
		this._bFilterConditionModelRequested = false;

		if (!this._bIsBeingDestroyed) {
			_createFilterConditionModel.call(this);
		}

	}

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

	FieldValueHelp.prototype.clone = function(sIdSuffix, aLocalIds) {

		// detach event handler before cloning to not have it twice on the clone
		// attach it after clone again
		var oWrapper = this.getContent();
		var oFilterBar = this.getFilterBar();

		if (oWrapper) {
			oWrapper.detachEvent("navigate", _handleNavigate, this);
			oWrapper.detachEvent("selectionChange", _handleSelectionChange, this);
			oWrapper.detachEvent("dataUpdate", _handleDataUpdate, this);
		}

		if (oFilterBar) {
			oFilterBar.detachEvent("search", _updateFiltersFromFilterBar, this);
		}

		var oClone = FieldHelpBase.prototype.clone.apply(this, arguments);

		if (oWrapper) {
			oWrapper.attachEvent("navigate", _handleNavigate, this);
			oWrapper.attachEvent("selectionChange", _handleSelectionChange, this);
			oWrapper.attachEvent("dataUpdate", _handleDataUpdate, this);
		}

		if (oFilterBar) {
			oFilterBar.attachEvent("search", _updateFiltersFromFilterBar, this);
		}

		return oClone;

	};

	function _createDialog() {

		var oDialog;

		if ((!Dialog || !Button || !ValueHelpPanel || !DefineConditionPanel) && !this._bDialogRequested) {
			Dialog = sap.ui.require("sap/m/Dialog");
			Button = sap.ui.require("sap/m/Button");
			ValueHelpPanel = sap.ui.require("sap/ui/mdc/field/ValueHelpPanel");
			DefineConditionPanel = sap.ui.require("sap/ui/mdc/field/DefineConditionPanel"); // TODO: load only if needed
			ManagedObjectModel = sap.ui.require("sap/ui/model/base/ManagedObjectModel");
			if (!Dialog || !Button || !ValueHelpPanel || !DefineConditionPanel || !ManagedObjectModel) {
				sap.ui.require(["sap/m/Dialog", "sap/m/Button", "sap/ui/mdc/field/ValueHelpPanel",
				                "sap/ui/mdc/field/DefineConditionPanel", "sap/ui/model/base/ManagedObjectModel"], _DialogLoaded.bind(this));
				this._bDialogRequested = true;
			}
		}
		if (Dialog && Button && ValueHelpPanel && DefineConditionPanel && ManagedObjectModel && !this._bDialogRequested) {
			if (!this._oResourceBundle) {
				this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
			}

			var oButtonOK = new Button(this.getId() + "-ok", {
				text: this._oResourceBundle.getText("valuehelp.OK"),
				type: sap.m.ButtonType.Emphasized,
				press: _dialogOk.bind(this)
			});

			var oButtonCancel = new Button(this.getId() + "-cancel", {
				text: this._oResourceBundle.getText("valuehelp.CANCEL"),
				press: _dialogCancel.bind(this)
			});

			this._oManagedObjectModel = new ManagedObjectModel(this);

			var oValueHelpPanel = _createValueHelpPanel.call(this);

			oDialog = new Dialog(this.getId() + "-dialog", {
				contentHeight: "600px",
				contentWidth: "1000px",
				horizontalScrolling: false,
				verticalScrolling: false,
				title: this.getTitle(),
				resizable: true,
				draggable: true,
				content: [oValueHelpPanel],
				afterOpen: _handleDialogAfterOpen.bind(this),
				afterClose: _handleDialogAfterClose.bind(this),
				buttons: [oButtonOK, oButtonCancel]
			});

			this.setAggregation("_dialog", oDialog, true);
			// TODO
			oDialog.setModel(new ResourceModel({ bundleName: "sap/ui/mdc/messagebundle", async: false }), "$i18n");

			_toggleDefineConditions.call(this, this.getShowConditionPanel());
		}

		return oDialog;

	}

	function _DialogLoaded(fnDialog, fnButton, fnValueHelpPanel, fnDefineConditionPanel, fnManagedObjectModel) {

		Dialog = fnDialog;
		Button = fnButton;
		ValueHelpPanel = fnValueHelpPanel;
		DefineConditionPanel = fnDefineConditionPanel;
		ManagedObjectModel = fnManagedObjectModel;
		this._bDialogRequested = false;

		if (!this._bIsBeingDestroyed) {
			_createDialog.call(this);
			if (this._bOpen) {
				this.open();
			}
		}

	}

	function _createValueHelpPanel() {

		var oWrapper = this.getContent();
		var oFilterBar = this.getFilterBar();

		var oValueHelpPanel = new ValueHelpPanel(this.getId() + "-VHP", {
			height: "100%",
			showFilterbar: !!oFilterBar,
			searchEnabled: !!this.getFilterFields(),
			formatOptions: this._getFormatOptions(),
			search: _handleSearch.bind(this)
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

	function _contentChanged(sMutation, oWrapper) {

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

			if (oWrapper && oWrapper.getFilterEnabled() && !this._oFilterConditionModel) {
				_createFilterConditionModel.call(this);
			}
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
		if (oDialog) {
			// update ValueHelpPanel
			if (oWrapper) {
				oWrapper.initialize(false);
				if (oWrapper.getFilterEnabled() && !this._oFilterConditionModel) {
					_createFilterConditionModel.call(this);
				}
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
		FilterOperatorUtil.updateConditionsValues(aConditions, this._getFormatOptions().operators); // to remove static text from static conditions

		this._bNoConditionModelUpdate = true;
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

	}

	function _handleDialogAfterClose(oEvent) {

		this._bDialogOpen = false;
		this._aOldConditions = undefined;
		this._bUseFilterBar = false; // to be sure
		this._bApplyFilter = false;

		this._handleAfterClose(oEvent);

		if (this._bOK) {
			// fire select event after Dialog is closed because inside applyFocusInfo is called
			// that might reset cursor and selection of field -> update it after this
			var aConditions = this.getConditions();
			this.fireSelect({conditions: aConditions, add: false, close: true});
		}
		this._bOK = undefined;

	}

	function _toggleDefineConditions(bActive) {
		var oDialog = this.getAggregation("_dialog");
		if (oDialog && this._oField) {
			var oValueHelpPanel = oDialog.getContent()[0];
			if (bActive) { // sow DefineConditions too if only EQ is allowes to suppoer free input. If not wanted, showConditionPanel should be set to false
				if (!oValueHelpPanel._oDefineConditionPanel) { //TODO: use API?
					var oDefineConditionPanel = new DefineConditionPanel(this.getId() + "-DCP");
					oValueHelpPanel.setDefineConditions(oDefineConditionPanel);
				}
			} else {
				oValueHelpPanel.setDefineConditions();
			}
		}
	}

	function _updateFilterBar(sMutation, oFilterBar) {

		if (sMutation === "remove") {
			oFilterBar.detachEvent("search", _updateFiltersFromFilterBar, this);
			oFilterBar = undefined;
		} else {
			oFilterBar.attachEvent("search", _updateFiltersFromFilterBar, this);
		}

		var oDialog = this.getAggregation("_dialog");
		if (oDialog) {
			var oValueHelpPanel = oDialog.getContent()[0];
			oValueHelpPanel.setFilterbar(oFilterBar);
			oValueHelpPanel.setShowFilterbar(!!oFilterBar);
			_setInParameterFilters.call(this);
			_updateFiltersFromFilterBar.call(this); // to add initial filters
		}

	}

	function _updateFiltersFromFilterBar(oEvent) {

		if (!this._oFilterConditionModel || !this._bUseFilterBar) {
			return;
		}

		var oFilterBar = this.getFilterBar();

		if (oFilterBar) {
			// use filters from FilterBar (in-parameters are there included)
			// first remove all filters not in FilterBar, except suggestion
			var oFilterConditions = this._oFilterConditionModel.getAllConditions();
			var oConditions = oFilterBar.getInternalConditions();
			var sFilterFields = this.getFilterFields();
			var i = 0;
			var sMyFieldPath;
			var oCondition;
			for (sMyFieldPath in oFilterConditions) {
				if (sMyFieldPath !== sFilterFields) {
					for (i = 0; i < oFilterConditions[sMyFieldPath].length; i++) {
						oCondition = merge({}, oFilterConditions[sMyFieldPath][i]);
						// don't change paths of in- and out-parameters as they point to the same filters
						if (!oConditions[sMyFieldPath] || FilterOperatorUtil.indexOfCondition(oCondition, oConditions[sMyFieldPath]) < 0) {
							this._oFilterConditionModel.removeCondition(sMyFieldPath, oCondition);
						}
					}
				}
			}

			// add conditions from FilterBar
			for (sMyFieldPath in oConditions) {
				for (i = 0; i < oConditions[sMyFieldPath].length; i++) {
					oCondition = merge({}, oConditions[sMyFieldPath][i]);
					// don't change paths of in- and out-parameters as they pont to the same filters
					if (!oFilterConditions[sMyFieldPath] || FilterOperatorUtil.indexOfCondition(oCondition, oFilterConditions[sMyFieldPath]) < 0) {
						this._oFilterConditionModel.addCondition(sMyFieldPath, oCondition);
					}
				}
			}

			// if conditions are changed in _oFilterConditionModel an update is triggered.
			// But initially the filter must set active
			if (!this._bApplyFilter && (oEvent || oFilterBar.getLiveMode())) {
				// user triggers search or liveMode -> resume
				// use checkUpdate to call _applyFilters not twice
				this._bApplyFilter = true; // applyFilter even if suspended (resume)
				this._oFilterConditionModel.checkUpdate(true, true);
			}
		}

	}

	function _removeFilterBarFilters() {

		if (!this._oFilterConditionModel) {
			return;
		}

		var oFilterBar = this.getFilterBar();

		if (oFilterBar) {
			var oFilterConditions = this._oFilterConditionModel.getAllConditions();
			var oFilterBarConditions = oFilterBar.getInternalConditions();
			var sFilterFields = this.getFilterFields();
			var bUpdateFilterBar = false;
			var sMyFieldPath;

			// check filters in FilterBar
			for (sMyFieldPath in oFilterBarConditions) {
				if (sMyFieldPath !== sFilterFields) {
					if (oFilterConditions[sMyFieldPath] && oFilterConditions[sMyFieldPath].length > 0) {
						this._oFilterConditionModel.removeAllConditions(sMyFieldPath);
					}
					if (oFilterBarConditions[sMyFieldPath].length > 0) {
						oFilterBarConditions[sMyFieldPath] = [];
						bUpdateFilterBar = true;
					}
				}
			}

			// check remaining Filters in FilterConditionModel (might be deleted in FilterBar, but no "Go" pressed"
			oFilterConditions = this._oFilterConditionModel.getAllConditions();
			for (sMyFieldPath in oFilterConditions) {
				if (sMyFieldPath !== sFilterFields) {
					if (oFilterConditions[sMyFieldPath].length > 0) {
						this._oFilterConditionModel.removeAllConditions(sMyFieldPath);
					}
				}
			}

			if (bUpdateFilterBar) {
				oFilterBar.setInternalConditions(oFilterBarConditions);
			}
		}

		// add conditions from In-Parameters
		_setInParameterFilters.call(this);

	}

	function _getSuggestionContent() {

		var oWrapper = this.getContent();
		if (oWrapper) {
			return oWrapper.getSuggestionContent();
		}

	}

	function _updateBindingContext() {

		var oBindingContext = this._oField ? this._oField.getBindingContext() : null; // if not connected use no BindingContext
		this.setBindingContext(oBindingContext);

	}

	function _handleSearch(oEvent) {

		this._bApplyFilter = true; // applyFilter even if suspended (resume)
		this._oFilterConditionModel.checkUpdate(true, true); // to trigger _applyFilters even if no search string is entered

	}

	FieldValueHelp.prototype.getScrollDelegate = function () {

		var oDialog = this.getAggregation("_dialog");

		if (oDialog && (oDialog.isOpen() || oDialog.oPopup.getOpenState() === "Opening")) { // TODO: better way to get opening state
			var oWrapper = this.getContent();
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

	FieldValueHelp.prototype.getRoleDescription = function() {

		if (this.getMaxConditions() === 1) {
			return null;
		} else {
			if (!this._oResourceBundleM) {
				this._oResourceBundleM = sap.ui.getCore().getLibraryResourceBundle("sap.m");
			}
			return this._oResourceBundleM.getText("MULTICOMBOBOX_ARIA_ROLE_DESCRIPTION");
		}

	};

	return FieldValueHelp;

});
