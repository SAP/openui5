/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/library",
	"sap/ui/mdc/p13n/subcontroller/FilterController",
	"sap/ui/mdc/p13n/subcontroller/AdaptFiltersController",
	"sap/ui/mdc/filterbar/p13n/GroupContainer",
	"sap/ui/mdc/filterbar/p13n/FilterColumnLayout",
	"sap/ui/mdc/filterbar/p13n/FilterGroupLayout",
	"sap/ui/mdc/filterbar/p13n/TableContainer",
	"sap/ui/mdc/filterbar/FilterBarBase",
	"sap/ui/mdc/filterbar/FilterBarBaseRenderer",
	"sap/base/util/merge",
	"sap/m/p13n/enums/PersistenceMode"
], (Element, coreLibrary, FilterController, AdaptFiltersController, GroupContainer, FilterColumnLayout, FilterGroupLayout, TableContainer, FilterBarBase, FilterBarBaseRenderer, merge, PersistenceMode) => {
	"use strict";

	const { ValueState } = coreLibrary;

	/**
	 * Modules for personalization controls
	 * @namespace
	 * @name sap.ui.mdc.filterbar.p13n
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */

	/**
	 * Constructor for a new AdaptationFilterBar.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The <code>AdaptationFilterBar</code> control is used for a lightweight {@link sap.ui.mdc.FilterBar FilterBar} control implementation for p13n use cases.
	 * The <code>AdaptationFilterBar</code> should only be used if the consuming control implements at least the <code>IFilterSource</code>
	 * interface to provide basic filter functionality.
	 *
	 * @extends sap.ui.mdc.filterbar.FilterBarBase
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.80.0
	 * @alias sap.ui.mdc.filterbar.p13n.AdaptationFilterBar
	 */
	const AdaptationFilterBar = FilterBarBase.extend("sap.ui.mdc.filterbar.p13n.AdaptationFilterBar", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Determines whether the <code>AdaptationFilterBar</code> has a fixed width.
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 */
				_useFixedWidth: {
					type: "boolean",
					defaultValue: false,
					visibility: "hidden"
				}
			},
			associations: {
				/**
				 * Determines the parent on which the condition changes should be applied on.
				 */
				adaptationControl: {
					type: "sap.ui.mdc.Control",
					multiple: false
				}
			},
			events: {
				/**
				 * Event which is only being thrown if the inner layout has a <code>change</code> event.
				 * This depends whether the inner layout supports the selection of FilterFields.
				 */
				change: {}
			}
		},
		renderer: FilterBarBaseRenderer
	});

	AdaptationFilterBar.prototype.WIDTH = "30rem";

	/**
	 * Interface function for <code>sap.m.p13n.Popup</code> to determine that the <code>AdaptationFilterBar</code> provides its own scrolling capabilites.
	 *
	 * @returns {boolean} The enablement of the vertical scrolling
	 */
	AdaptationFilterBar.prototype.getVerticalScrolling = function() {
		return this._oFilterBarLayout.getInner().getVerticalScrolling instanceof Function ? this._oFilterBarLayout.getInner().getVerticalScrolling() : false;
	};

	AdaptationFilterBar.prototype.init = function() {
		FilterBarBase.prototype.init.apply(this, arguments);
		this.addStyleClass("sapUIAdaptationFilterBar");

		this.getEngine().defaultProviderRegistry.attach(this, PersistenceMode.Transient);
		this._fnResolveAdaptationControlPromise = null;
		this._oAdaptationControlPromise = new Promise((resolve, reject) => {
			this._fnResolveAdaptationControlPromise = resolve;
		});
	};

	/**
	 * This method will be called whenever the <code>AdaptationFilterBar</code> will be instantiated in a Dialog using the
	 * {@link sap.m.p13n.UIManager}. This flag determines whether the control should be destroyed or kept alive once the p13n
	 * dialog closes.
	 *
	 * @private
	 * @returns {boolean} determines if the control should be destroyed
	 */
	AdaptationFilterBar.prototype.keepAlive = function() {
		return true;
	};

	AdaptationFilterBar.prototype._onModifications = function() {
		const pModification = FilterBarBase.prototype._onModifications.apply(this, arguments);
		if (this._oFilterBarLayout.getInner().isA("sap.ui.mdc.p13n.panels.FilterPanel")) {
			const oP13nData = this._oFilterBarLayout.getInner().getP13nData();
			this._updateActiveStatus(oP13nData);
			this._oFilterBarLayout.setP13nData({ items: oP13nData });
		}
		return pModification;
	};

	AdaptationFilterBar.prototype.getInitialFocusedControl = function() {
		return this._oFilterBarLayout.getInitialFocusedControl();
	};

	/**
	 * Getter for the fixed width of the <code>AdaptationFilterBar</code>
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @returns {string} The fixed width of the <code>AdaptationFilterBar</code>
	 */
	AdaptationFilterBar.prototype.getWidth = function() {
		return this.WIDTH;
	};

	AdaptationFilterBar.prototype.applySettings = function() {
		FilterBarBase.prototype._applySettings.apply(this, arguments);
		this._waitForAdaptControlAndPropertyHelper().then(() => {
			this._initControlDelegate();
		});
	};

	AdaptationFilterBar.prototype.setVisibleFields = function(aVisibleKeys) {
		const oAdaptationControl = this._getAdaptationControlInstance();
		if (this._checkAdvancedParent(oAdaptationControl)) {
			throw new Error("Only supported for simple parents");
		}

		this._aVisibleKeys = aVisibleKeys;
	};

	// FIXME: currently the FilterBar key handling is tightly coupled to the path
	// as the FilterFields themselves are referenced through the path in the conditions binding path
	// of the according FilterField. In use cases as for the AdaptationFilterBar, the Table's propertyinfo
	// is being propagated to the FilterBar, where the name does not neessarily need to reflect the technical
	// path in the model. Once the key reference between FilterFields, Columns and property info object has been aligned,
	// the below fallback logic will become obsolete.
	AdaptationFilterBar.prototype._getPropertyByName = function(sName) {

		let oProperty = FilterBarBase.prototype._getPropertyByName.apply(this, arguments);
		const oPropertyHelper = this.getPropertyHelper();
		if (!oProperty || (oProperty.filterable === false)) {
			oProperty = oPropertyHelper.getProperties().find((oProp) => {
				return oProp.path === sName && oProp.filterable;
			});
		}
		return oProperty;
	};

	AdaptationFilterBar.prototype._waitForAdaptControlAndPropertyHelper = function() {
		return this._oAdaptationControlPromise.then(() => {
			return this._getAdaptationControlInstance().awaitPropertyHelper().then((oPropertyHelper) => {
				this._oPropertyHelper = oPropertyHelper;
			});
		});
	};

	AdaptationFilterBar.prototype._initControlDelegate = function() {
		return this.initControlDelegate().then(() => {
			//this.getTypeMap();
			if (!this._bIsBeingDestroyed) {
				this._applyInitialFilterConditions();
			}
		});
	};

	AdaptationFilterBar.prototype.getControlDelegate = function() {
		return this._getAdaptationControlInstance().getControlDelegate();
	};

	AdaptationFilterBar.prototype.initControlDelegate = function() {
		return this._oAdaptationControlPromise.then(() => {
			return this._getAdaptationControlInstance().initControlDelegate();
		});
	};

	AdaptationFilterBar.prototype.awaitControlDelegate = function() {
		return this._oAdaptationControlPromise.then(() => {
			return this._getAdaptationControlInstance().awaitControlDelegate();
		});
	};

	AdaptationFilterBar.prototype.initPropertyHelper = function() {
		return this._oAdaptationControlPromise.then(() => {
			return this._getAdaptationControlInstance().initPropertyHelper();
		});
	};

	AdaptationFilterBar.prototype.finalizePropertyHelper = function() {
		return this._oAdaptationControlPromise.then(() => {
			return this._getAdaptationControlInstance().finalizePropertyHelper();
		});
	};

	AdaptationFilterBar.prototype.getTypeUtil = function() {
		return this.getTypeMap();
	};

	AdaptationFilterBar.prototype.getTypeMap = function() {
		if (!this._getAdaptationControlInstance()) {
			throw new Error("No adaptation control assigned yet.");
		}

		return this._getAdaptationControlInstance().getTypeMap();
	};

	AdaptationFilterBar.prototype.setMessageStrip = function(oStrip) {
		this._oFilterBarLayout.setMessageStrip(oStrip);
	};

	AdaptationFilterBar.prototype.setLiveMode = function(bLive, bSuppressInvalidate) {
		FilterBarBase.prototype.setLiveMode.apply(this, arguments);

		//update adaptationModel while dialog is open
		this._oConditionModel.attachPropertyChange((oEvt) => {
			const sKey = oEvt.getParameter("path").substring(12);
			if (this.oAdaptationData) {
				const aItems = this.oAdaptationData.items;
				const oItem = aItems.find((o) => {
					return o.name == sKey;
				});
				if (oItem && this._checkAdvancedParent(this._getAdaptationControlInstance())) {
					oItem.active = this._getConditionModel().getConditions(sKey).length > 0 ? true : false;
				}
			}
		});

		return this;
	};

	AdaptationFilterBar.prototype._retrieveMetadata = function() {

		return this._oAdaptationControlPromise.then(() => {
			return this._getAdaptationControlInstance().awaitPropertyHelper().then(function(oPropertyHelper) {
				if (!this._getAdaptationControlInstance().isPropertyHelperFinal()) {
					return this.finalizePropertyHelper();
				}

				return FilterBarBase.prototype._retrieveMetadata.apply(this, arguments);
			}.bind(this));
		});
	};

	AdaptationFilterBar.prototype.isControlDelegateInitialized = function() {
		return this._getAdaptationControlInstance().isControlDelegateInitialized();
	};

	AdaptationFilterBar.prototype.createConditionChanges = function() {
		return Promise.all([this._oAdaptationControlPromise, this.awaitControlDelegate()]).then(() => {
			const mConditions = this._getModelConditions(this._getConditionModel(), false, true);

			return this.getEngine().createChanges({
				control: this._getAdaptationControlInstance(),
				applyAbsolute: true,
				key: "Filter",
				state: mConditions,
				suppressAppliance: true
			});
		});
	};

	/**
	 *
	 * Please note that the provided model should be created with {@link sap.ui.mdc.p13n.P13nBuilder}
	 * @param {object[]} aP13nData Necessary data to display and create <code>FilterColumnLayout</code> instances.
	 */
	AdaptationFilterBar.prototype.setP13nData = function(aP13nData) {
		this.oAdaptationData = aP13nData;
		this._getConditionModel().checkUpdate(true);
		this._updateActiveStatus(this.oAdaptationData.items);
		this._oFilterBarLayout.update(aP13nData);
	};

	AdaptationFilterBar.prototype._updateActiveStatus = function(oP13nData) {
		const mConditions = this.getFilterConditions();
		oP13nData.forEach((oP13nItem) => {
			const oFilterField = this.mFilterFields && this.mFilterFields[oP13nItem.name];
			if (oFilterField) {
				const sKey = oFilterField.getPropertyKey();
				if (mConditions[sKey] && mConditions[sKey].length > 0) {
					oP13nItem.active = true;
				}
			}
		});
	};

	AdaptationFilterBar.prototype.getP13nData = function() {
		if (this._aVisibleKeys && this._aVisibleKeys.length > 0) {
			this.oAdaptationData.items.forEach(function(oItem) {
				if (this._aVisibleKeys.indexOf(oItem.name) > -1) {
					oItem.active = true;
				}
			}, this);
		}
		return this.oAdaptationData;
	};

	AdaptationFilterBar.prototype._handleFilterItemSubmit = function() {
		return;
	};

	AdaptationFilterBar.prototype._getWaitForChangesPromise = function() {
		//Change is applied on parent --> wait for the parent promise not the child
		return this.getEngine().waitForChanges(this._getAdaptationControlInstance());
	};

	/**
	 * Method which will initialize the <code>AdaptationFilterBar</code> and create the required FilterFields
	 * @returns {Promise} A Promise which resolves once all FilterFields are ready and added to the <code>filterItems</code> aggregation
	 */
	AdaptationFilterBar.prototype.createFilterFields = function() {
		return this.initializedWithMetadata().then(() => {
			const mConditions = this._getAdaptationControlInstance().getFilterConditions();

			this.setFilterConditions(mConditions);
			const pConditions = this._setXConditions(mConditions);

			if (this._bFilterFieldsCreated) {
				return pConditions.then(() => {
					this._updateActiveStatus(this.oAdaptationData.items);
					this._oFilterBarLayout.setP13nData(this.getP13nData());
					return this;
				});
			}

			const oAdaptationControl = this._getAdaptationControlInstance();
			const oDelegate = oAdaptationControl.getControlDelegate();
			const oFilterDelegate = this._checkAdvancedParent(oAdaptationControl) ? oDelegate : oDelegate.getFilterDelegate();

			//used to store the originals
			this._mOriginalsForClone = {};
			this.mFilterFields = {};
			const aFieldPromises = [];

			this.getP13nData().items.forEach((oItem, iIndex) => {
				const oFilterFieldPromise = this._checkExisting(oItem, oFilterDelegate);

				oFilterFieldPromise.then((oFilterField) => {

					let oFieldForDialog;

					//Important: always use clones for the personalization dialog. The "originals" should never be shown in the P13n UI
					//Currently the IFilter interface is being used to identify if a more complex personalization is required, this is
					//as of now only part for the sap.ui.mdc.FilterBar, as the AdaptationFilterBar will allow to select FilterFields in advance.
					//This logic requires a cloning logic, as there is a mix of parent/child filterFields which is not the case if the adaptaitonControl
					//does only provide Filter capabilities via an inner FilterBar (such as the Table inbuilt filtering)
					if (this._checkAdvancedParent(oAdaptationControl)) {
						if (oFilterField._bTemporaryOriginal) {
							delete oFilterFieldPromise._bTemporaryOriginal;
							this._mOriginalsForClone[oFilterField.getPropertyKey()] = oFilterField;
						}
						oFieldForDialog = oFilterField.clone();
						if (oAdaptationControl._handleFilterItemChanges) {
							oFieldForDialog.detachChange(oAdaptationControl._handleFilterItemChanges, oAdaptationControl);
						}
						if (oAdaptationControl._handleFilterItemSubmit) {
							oFieldForDialog.detachSubmit(oAdaptationControl._handleFilterItemSubmit, oAdaptationControl);
						}

						if (oFieldForDialog.getValueState() !== ValueState.None) {
							oFieldForDialog.setValueState(ValueState.None);
							oFieldForDialog.setValueStateText();
						}
					} else {
						oFieldForDialog = oFilterField;
					}

					this.mFilterFields[oItem.name] = oFieldForDialog;

				});

				aFieldPromises.push(oFilterFieldPromise);

			});

			return Promise.all(aFieldPromises).then(() => {
				const oP13nData = this.getP13nData();
				oP13nData.items.forEach((oItem) => {
					this.addAggregation("filterItems", this.mFilterFields[oItem.name]);
				});
				this._attachFields();
				this._updateActiveStatus(oP13nData.items);
				this._oFilterBarLayout.setP13nData(oP13nData);
				this._bFilterFieldsCreated = true;

				return this;
			});

		});
	};

	AdaptationFilterBar.prototype._attachFields = function() {
		this.getFilterItems().forEach((oField) => {
			oField.attachChange((oEvt) => {
				this.fireChange();
			});
		});
	};

	/**
	 * This method checks whether a FilterField is already present on the parent and will return this
	 * instead of requesting a new one.
	 * @param {object} oItem Corresponding item in the AdaptaitonModel
	 * @param {object} oFilterDelegate Parent filter delegate
	 *
	 * @returns {Promise} A Promise resolving in the corresponding FilterField
	 */
	AdaptationFilterBar.prototype._checkExisting = function(oItem, oFilterDelegate) {
		let oFilterFieldPromise;

		const oAdaptationControl = this._getAdaptationControlInstance();
		const aExistingItems = this._checkAdvancedParent(oAdaptationControl) ? oAdaptationControl.getFilterItems() : [];

		const mExistingFilterItems = aExistingItems.reduce((mMap, oField) => {
			mMap[oField.getPropertyKey()] = oField;
			return mMap;
		}, {});

		if (mExistingFilterItems[oItem.name]) {
			oFilterFieldPromise = Promise.resolve(mExistingFilterItems[oItem.name]);
		} else {

			oFilterFieldPromise = oFilterDelegate.addItem(this._getAdaptationControlInstance(), oItem.name);

			oFilterFieldPromise = oFilterFieldPromise.then((oFilterField) => {

				if (!oFilterField) {
					throw new Error("No FilterField could be created for property: '" + oItem.name + "'.");
				}

				oFilterField._bTemporaryOriginal = true;
				return oFilterField;
			});
		}

		return oFilterFieldPromise;
	};

	AdaptationFilterBar.prototype.executeRemoves = function() {

		const aExistingItems = this._oFilterBarLayout.getInner().getSelectedFields();
		const aOriginalsToRemove = [];

		Object.keys(this._mOriginalsForClone).forEach((sKey) => {
			const oDelegate = this._getAdaptationControlInstance().getControlDelegate();

			if (aExistingItems.indexOf(sKey) < 0) { //Originals that have not been selected --> use continue similar to 'ItemBaseFlex'
				const oRemovePromise = oDelegate.removeItem.call(oDelegate, this._getAdaptationControlInstance(), sKey).then((bContinue) => {
					if (bContinue && this._mOriginalsForClone[sKey]) {
						// destroy the item
						this._mOriginalsForClone[sKey].destroy();
						delete this._mOriginalsForClone[sKey];
					}
				});
				aOriginalsToRemove.push(oRemovePromise);
			}

		});

		return Promise.all(aOriginalsToRemove);
	};

	AdaptationFilterBar.prototype._checkAdvancedParent = function(oControl) {
		if (!oControl.isA("sap.ui.mdc.IFilterSource") && !oControl.isA("sap.ui.mdc.IFilter")) {
			throw new Error("The 'adaptationControl' needs to implement the IFilterSource or IFilter interface");
		}

		return oControl.isA("sap.ui.mdc.IFilter");
	};

	/**
	 *
	 * @param {sap.ui.mdc.Control} oControl Instance of the new control
	 * @param {boolean} bSuppressInvalidate If <code>true</code>, the property is not marked as changed
	 * @return {sap.ui.mdc.filterbar.p13n.AdaptationFilterBar} Reference to <code>this</code> to allow method chaining
	 */
	AdaptationFilterBar.prototype.setAdaptationControl = function(oControl, bSuppressInvalidate) {

		if (this._fnResolveAdaptationControlPromise) {
			this._fnResolveAdaptationControlPromise();
			this._fnResolveAdaptationControlPromise = null;
		}

		this.setAssociation("adaptationControl", oControl, bSuppressInvalidate);

		this._cLayoutItem = FilterGroupLayout;
		this._oFilterBarLayout = this._checkAdvancedParent(oControl) ? new GroupContainer() : new TableContainer();

		this._oFilterBarLayout.getInner().setParent(this);
		this.setAggregation("layout", this._oFilterBarLayout, true);

		if (this._oFilterBarLayout.getInner().attachChange) {
			this._oFilterBarLayout.getInner().attachChange((oEvt) => {
				if (oEvt.getParameter("reason") === "Remove") {
					const oItem = oEvt.getParameter("item");
					const mConditions = {};
					mConditions[this.mFilterFields[oItem.name].getPropertyKey()] = [];

					return this.getEngine().createChanges({
						control: this,
						applyAbsolute: true,
						key: "Filter",
						state: mConditions
					});
				}
				this.fireChange();
			});
		}
		return this;
	};

	/**
	 * Returns an instance of the associated adaptation control, if available.
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @returns {sap.ui.mdc.Control} The adaptation control instance.
	 */
	AdaptationFilterBar.prototype._getAdaptationControlInstance = function() {
		const sAdaptationControlId = this.getAdaptationControl();
		return sAdaptationControlId && Element.getElementById(sAdaptationControlId);
	};

	AdaptationFilterBar.prototype.exit = function() {
		this.getEngine().defaultProviderRegistry.detach(this);
		FilterBarBase.prototype.exit.apply(this, arguments);
		for (const sKey in this._mOriginalsForClone) {
			this._mOriginalsForClone[sKey].destroy();
		}
		this._mOriginalsForClone = null;
		this.oAdaptationData = null;
		this.mFilterFields = null;
		this._fnResolveAdaptationControlPromise = null;
		this._oAdaptationControlPromise = null;
	};

	return AdaptationFilterBar;

});