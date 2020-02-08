/*!
 * ${copyright}
 */

// Provides control sap.uxap.BlockBase.
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Control",
	"sap/ui/core/CustomData",
	"sap/ui/core/mvc/View",
	"./BlockBaseMetadata",
	"sap/ui/model/Context",
	"sap/ui/Device",
	"sap/ui/layout/form/ColumnLayout",
	"./library",
	"sap/ui/core/Component",
	"sap/ui/layout/library",
	"sap/base/Log"
], function(
	jQuery,
	Control,
	CustomData,
	CoreView,
	BlockBaseMetadata,
	Context,
	Device,
	ColumnLayout,
	library,
	Component,
	layoutLibrary,
	Log
) {
		"use strict";

		// shortcut for sap.ui.layout.form.SimpleFormLayout
		var SimpleFormLayout = layoutLibrary.form.SimpleFormLayout;

		// shortcut for sap.uxap.BlockBaseFormAdjustment
		var BlockBaseFormAdjustment = library.BlockBaseFormAdjustment;

		/**
		 * Constructor for a new <code>BlockBase</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The main element that holds the content that is displayed in an
		 * {@link sap.uxap.ObjectPageLayout ObjectPageLayout}, but not necessarily only there.
		 *
		 * <h3>Overview</h3>
		 *
		 * The blocks give the flexibility to combine different content types.
		 *
		 * A block is a control that:
		 * <ul>
		 * <li>Has modes and a view associated to each mode. At rendering time, the view associated to the mode is rendered.</li>
		 * <li>Can use all view types for storing its internal control tree (XML, JS, JSON, HTML)</li>
		 * </ul>
		 *
		 * As any UI5 view, the XML view can have a controller which automatically comes with a
		 * <code>this.oParentBlock</code> attribute (so that the controller can interact with the block).
		 * The <code>oParentBlock</code> is firstly available in <code>onParentBlockModeChange</code> method.
		 * If the controller implements the <code>onParentBlockModeChange</code> method, this method will
		 * be called with the <code>sMode</code> parameter when the view is used or reused by the block.
		 *
		 * @extends sap.ui.core.Control
		 * @author SAP SE
		 * @constructor
		 * @public
		 * @since 1.26
		 * @see {@link topic:4527729576cb4a4888275b6935aad03a Block Base}
		 * @see {@link topic:2978f6064742456ebed31c5ccf4d051d Creating Blocks}
		 * @alias sap.uxap.BlockBase
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */

		var BlockBase = Control.extend("sap.uxap.BlockBase", {
			metadata: {
				designtime: "sap/uxap/designtime/BlockBase.designtime",
				library: "sap.uxap",
				properties: {
					/**
					 * Determines the mode of the block. See {@link sap.uxap.ObjectPageSubSectionMode ObjectPageSubSectionMode}.
					 * When <code>BlockBase</code> is used inside an <code>ObjectPageLayout</code>,
					 * the <code>mode</code> property is inherited from the respective {@link sap.uxap.ObjectPageSubSection SubSection}.
					 * The <code>mode</code> property of <code>BlockBase</code> changes when the
					 * <code>mode</code> property of <code>ObjectPageSubSection</code> changes.
					 */
					"mode": {type: "string", group: "Appearance"},

					/**
					 * Determines the visibility of the block.
					 */
					"visible": {type: "boolean", group: "Appearance", defaultValue: true},

					/**
					 * Determines on how many columns the layout will be rendered.
					 * Allowed values are integers from 1 to 4 and "auto".
					 */
					"columnLayout": {type: "sap.uxap.BlockBaseColumnLayout", group: "Behavior", defaultValue: "auto"},

					/**
					 * Determines if the block should automatically adjust its inner forms.
					 * Allowed values are "BlockColumns" and "OneColumn" and "None".
					 * If the value is "BlockColumns", then the inner form will have as many columns as the colspan of its parent block.
					 * If the value is "OneColumn", the inner form will have exactly one column, regardless the colspan of its parent block.
					 * If the value is "None", no automatic adjustment of inner forms will be made and the form will keep its original column count.
					 */
					"formAdjustment": {
						type: "sap.uxap.BlockBaseFormAdjustment",
						group: "Behavior",
						defaultValue: BlockBaseFormAdjustment.BlockColumns
					},

					/**
					 * Determines whether the show more button should be shown.
					 *
					 * <b>Note:</b> The property will take effect if the <code>BlockBase</code> is inside <code>ObjectPageSubSection</code>
					 * and would be ignored in case the <code>BlockBase</code> is nested inside another <code>BlockBase</code>.
					 */
					"showSubSectionMore": {type: "boolean", group: "Behavior", defaultValue: false}
				},
				defaultAggregation: "mappings",
				aggregations: {

					/**
					 * Map external UI5 model and internal Block model
					 */
					"mappings": {type: "sap.uxap.ModelMapping", multiple: true, singularName: "mapping"},

					/**
					 * Internal aggregation that contains all views inside this Block
					 */
					"_views": {type: "sap.ui.core.Control", multiple: true, singularName: "view", visibility: "hidden"}
				},
				associations: {

					/**
					 * The current view.
					 * Corresponds to the currently specified <code>mode</code> of the <code>sap.uxap.BlockBase<code>.
					 * Can be used as a getter for the internally created view.
					 *
					 * <b>Note:</b> As the views are created asynchronously, this association will be updated only after the view creation is completed.
					 * Applications that want to be notified when a view is created should subscribe to the <code>viewInit</code> event.
					 */
					"selectedView": {type: "sap.ui.core.Control", multiple: false}
				},
				events: {

					/**
					 * Fired when an aggregated view is instantiated.
					 * @since 1.72
					 */
					"viewInit": {
						parameters: {

							/**
							 * The initialized view.
							 */
							view: {
								type: "sap.ui.core.mvc.View"
							}
						}
					}
				},
				views: {

//				 define your views here following the pattern:
//				 "yourModeName": {viewName: "your.view.path" , type: "yourUI5ViewType" }
//				 for example:
//				 "Collapsed": {
//				 viewName: "sap.uxap.testblocks.multiview.MultiViewBlockCollapsed",
//				 type: "XML"
//				 },
//				 "Expanded": {
//				 viewName: "sap.uxap.testblocks.multiview.MultiViewBlockExpanded",
//				 type: "XML"
//				 }
//
//				 if no views are provided, the blockBase looks for an xml view which name is equal to the block's one
//
				}
			},
			renderer: "sap.uxap.BlockBaseRenderer"
		}, BlockBaseMetadata);

		BlockBase.prototype.init = function () {
			//convenience mechanism:
			//if there are no views defined by the Block,
			// we look for the default one which would have the same name as the block and type XML
			if (!this.getMetadata().hasViews()) {
				this.getMetadata().setView("defaultXML", {viewName: this.getMetadata().getName(), type: "XML"});
			}

			//for performance optimization
			this._oMappingApplied = {};

			//lazy loading
			this._bLazyLoading = false; //by default, no lazy loading so we can use it out of an objectPageLayout
			this._bConnected = false;   //indicates connectToModels function has been called
			this._oUpdatedModels = {};
			this._oParentObjectPageSubSection = null; // the parent ObjectPageSubSection
			this._oPromisedViews = {};
		};

		BlockBase.prototype.onBeforeRendering = function () {
			var oParentObjectPageLayout;

			this._applyMapping();

			if (!this.getMode() || this.getMode() === "") {
				if (this.getMetadata().getView("defaultXML")) {
					this.setMode("defaultXML");
				} else {
					Log.error("BlockBase ::: there is no mode defined for rendering " + this.getMetadata().getName() +
						". You can either set a default mode on the block metadata or set the mode property before rendering the block.");
				}
			}

			this._applyFormAdjustment();

			//TODO: for iconTabBar mode, specify lazyLoading for selectedTab only?
			oParentObjectPageLayout = this._getObjectPageLayout();
			this._bLazyLoading = oParentObjectPageLayout && (oParentObjectPageLayout.getEnableLazyLoading() || oParentObjectPageLayout.getUseIconTabBar());
		};

		BlockBase.prototype.onAfterRendering = function () {
			var oParentObjectPageLayout = this._getObjectPageLayout();

			if (oParentObjectPageLayout) {
				oParentObjectPageLayout._requestAdjustLayout();
			}
		};

		/**
		 * Set the parent control for the current block.
		 * Every time the parent changes, we try to find the parent objectPageLayout in order to determine the lazy loading strategy to apply.
		 * @param {*} oParent parent instance
		 * @param {*} sAggregationName aggregation name
		 * @param {*} bSuppressInvalidate invalidate
		 */
		BlockBase.prototype.setParent = function (oParent, sAggregationName, bSuppressInvalidate) {
			Control.prototype.setParent.call(this, oParent, sAggregationName, bSuppressInvalidate);

			if (oParent instanceof library.ObjectPageSubSection) {
				this._bLazyLoading = true; //we activate the block lazy loading since we are within an objectPageLayout
				this._oParentObjectPageSubSection = oParent;
			}
		};

		/*********************************************
		 * model mapping management
		 * *******************************************/


		/**
		 * Intercept direct setModel calls.
		 * @param {*} oModel model instance
		 * @param {*} sName name of the model
		 * @returns {sap.ui.base.ManagedObject} instance of managed object
		 */
		BlockBase.prototype.setModel = function (oModel, sName) {
			this._applyMapping(sName);
			return Control.prototype.setModel.call(this, oModel, sName);
		};

		/**
		 * Called for applying the modelmapping once all properties are set.
		 * @private
		 */
		BlockBase.prototype._applyMapping = function () {
			if (this._shouldLazyLoad()) {
				Log.debug("BlockBase ::: Ignoring the _applyMapping as the block is not connected");
			} else {
				this.getMappings().forEach(function (oMapping, iIndex) {
					var oModel,
						oBindingContext,
						sInternalModelName = oMapping.getInternalModelName(),
						sExternalPath = oMapping.getExternalPath(),
						sExternalModelName = oMapping.getExternalModelName(),
						sPath;

					if (sExternalPath) {
						if (sInternalModelName == "" || sExternalPath == "") {
							throw new Error("BlockBase :: incorrect mapping, one of the modelMapping property is empty");
						}

						oModel = this.getModel(sExternalModelName);
						if (!oModel) { // model N/A yet
							return;
						}

						//get absolute path (including the external binding context)
						sPath = oModel.resolve(sExternalPath, this.getBindingContext(sExternalModelName));
						oBindingContext = this.getBindingContext(sInternalModelName);

						if (!this._isMappingApplied(sInternalModelName) /* check if mapping is set already */
							|| (this.getModel(sInternalModelName) !== this.getModel(sExternalModelName)) /* model changed, then we have to update internal model mapping */
							|| (oBindingContext && (oBindingContext.getPath() !== sPath)) /* sExternalPath changed, then we have to update internal model mapping */) {

							Log.info("BlockBase :: mapping external model " + sExternalModelName + " to " + sInternalModelName);

							this._oMappingApplied[sInternalModelName] = true;
							Control.prototype.setModel.call(this, oModel, sInternalModelName);
							this.setBindingContext(new Context(oModel, sPath), sInternalModelName);
						}
					}
				}, this);
			}
		};

		BlockBase.prototype._isMappingApplied = function (sInternalModelName) {
			return this.getModel(sInternalModelName) && this._oMappingApplied[sInternalModelName];
		};

		/**
		 * Intercept propagated properties.
		 * @param {*} vName property instance or property name
		 * @returns {*} propagateProperties function result
		 */
		BlockBase.prototype.propagateProperties = function (vName) {
			if (this._shouldLazyLoad() && !this._oUpdatedModels.hasOwnProperty(vName)) {
				this._oUpdatedModels[vName] = true;
			} else {
				this._applyMapping(vName);
			}

			return Control.prototype.propagateProperties.call(this, vName);
		};

		/*********************************************
		 * mode vs views management
		 * *******************************************/

		/**
		 * Returns an object containing the supported modes for the block.
		 * @returns {sap.ui.core/object} supported modes
		 */
		BlockBase.prototype.getSupportedModes = function () {
			var oSupportedModes = jQuery.extend({}, this.getMetadata().getViews());

			for (var key in oSupportedModes) {
				oSupportedModes[key] = key; //this is what developers expect, for ex: {Collapsed:"Collapsed"}
			}

			return oSupportedModes;
		};

		/**
		 * Set the view mode for this particular block.
		 * @public
		 * @param {string} sMode the mode to apply to the control (that should be synchronized with view declared)
		 * @returns {*} this
		 */
		BlockBase.prototype.setMode = function (sMode) {
			sMode = this._validateMode(sMode);

			if (this.getMode() !== sMode) {
				this.setProperty("mode", sMode, false);
				//if Lazy loading is enabled, and if the block is not connected
				//delay the view creation (will be done in connectToModels function)
				if (!this._shouldLazyLoad()) {
					this._selectView(sMode);
				}
			}

			return this;
		};

		/**
		 * Set the column layout for this particular block.
		 * @param {string} sLayout The column layout to apply to the control
		 * @public
		 */
		BlockBase.prototype.setColumnLayout = function (sLayout) {
			if (this._oParentObjectPageSubSection) {
				this._oParentObjectPageSubSection.invalidate();
				/*the parent subsection needs to recalculate block layout data
				 based on the changed block column layout */
			}
			this.setProperty("columnLayout", sLayout);
		};

		/**
		 * Provide a clone mechanism: the selectedView needs to point to one of the _views.
		 * @returns {sap.ui.core.Element} cloned element
		 */
		BlockBase.prototype.clone = function () {
			var iAssocIndex = -1,
				sAssoc = this.getAssociation("selectedView"),
				aViews = this.getAggregation("_views") || [];

			//find the n-view associated
			if (sAssoc) {
				aViews.forEach(function (oView, iIndex) {

					if (oView.getId() === sAssoc) {
						iAssocIndex = iIndex;
					}

					return iAssocIndex < 0;
				});
			}

			var oNewThis = Control.prototype.clone.call(this);
			//we need to maintain the association onto the new object
			if (iAssocIndex >= 0) {
				oNewThis.setAssociation("selectedView", oNewThis.getAggregation("_views")[iAssocIndex]);
			}

			return oNewThis;
		};

		/**
		 * Validate that the provided mode has been declared in the metadata views section, throw an exception otherwise.
		 * @param {*} sMode mode
		 * @returns {*} sMode
		 * @private
		 */
		BlockBase.prototype._validateMode = function (sMode) {
			this.validateProperty("mode", sMode); //type expected as per properties definition

			if (!this.getMetadata().getView(sMode)) {
				var sBlockName = this.getMetadata()._sClassName || this.getId();

				//the view wasn't defined.
				//as a fallback mechanism: we look for the defaultXML one and raise an error before raising an exception
				if (this.getMetadata().getView("defaultXML")) {
					Log.warning("BlockBase :: no view defined for block " + sBlockName + " for mode " + sMode + ", loading defaultXML instead");
					sMode = "defaultXML";
				} else {
					throw new Error("BlockBase :: no view defined for block " + sBlockName + " for mode " + sMode);
				}
			}

			return sMode;
		};

		/**
		 * Get the view associated with the selectedView.
		 * @returns {*} Selected view
		 * @private
		 */
		BlockBase.prototype._getSelectedViewContent = function () {
			var oView = null, sSelectedViewId, aViews;

			sSelectedViewId = this.getAssociation("selectedView");
			aViews = this.getAggregation("_views");

			if (aViews) {
				for (var i = 0; !oView && i < aViews.length; i++) {
					if (aViews[i].getId() === sSelectedViewId) {
						oView = aViews[i];
					}
				}
			}

			return oView;
		};

		/**
		 * Create view
		 * @param {*} mParameter - the view metadata
		 * @param {string} sMode - the mode associated with the view
		 * @returns {*} Promise
		 * @protected
		 */
		BlockBase.prototype.createView = function (mParameter, sMode) {

			if (!this._oPromisedViews[mParameter.id]){
				this._oPromisedViews[mParameter.id] = new Promise(function(resolve, reject) {

					var oOwnerComponent = Component.getOwnerComponentFor(this),
						fnCreateView = function () {
							var fnCoreCreateView = function() {
								return CoreView.create(mParameter);
							};
							if (oOwnerComponent) {
								return oOwnerComponent.runAsOwner(fnCoreCreateView);
							} else {
								return fnCoreCreateView();
							}
						};

					fnCreateView().then(function(oView) {
						this._afterViewInstantiated(oView, sMode);
						resolve(oView);
					}.bind(this));

				}.bind(this));
			}

			return this._oPromisedViews[mParameter.id];
		};

		/**
		 * Finalizes view creation:
		 * adds the created view to the <code>_views</code> aggregation
		 * and assigns <code>oParentBlock</code> to the <code>controller</code> of the view
		 * @param {*} oView the created view
		 * @param {string} sMode the valid mode corresponding to the created view
		 * @private
		 */
		BlockBase.prototype._afterViewInstantiated = function (oView, sMode) {
			var oController = oView.getController();

			//link to the controller defined in the Block
			if (oView) {
				//inject a reference to this
				if (oController) {
					oController.oParentBlock = this;
				}

				oView.addCustomData(new CustomData({
					"key": "layoutMode",
					"value": sMode
				}));

				this.addAggregation("_views", oView);
				this.fireEvent("viewInit", {view: oView});
			} else {
				throw new Error("BlockBase :: no view defined in metadata.views for mode " + sMode);
			}
		};

		/**
		 * Notifies Controller for loading in specific mode
		 * @param {*} oController the Controller of the selected View
		 * @param {*} oViewInner the selected View
		 * @param {*} sMode the valid mode corresponding to the View to initialize
		 * @private
		 */
		BlockBase.prototype._notifyForLoadingInMode = function (oController, oViewInner, sMode) {
			if (oController && typeof oController.onParentBlockModeChange === "function") {
				oController.onParentBlockModeChange(sMode);
			} else {
				Log.info("BlockBase ::: could not notify " + oViewInner.sViewName + " of loading in mode "
					+ sMode + ": missing controller onParentBlockModeChange method");
			}
		};


		/**
		 * Updates the <code>selectedView</code> association to match the view of the given <code>sMode</code>
		 * (and creates the view if it was not created already)
		 * @param {string} sMode the valid mode corresponding to the view to select
		 * @private
		 */
		BlockBase.prototype._selectView = function (sMode) {
			var oView,
				sViewId = this.getId() + "-" + sMode,
				sViewMetadata,
				fnSelect;

			fnSelect = function(oView) {
				if (oView && this.getAssociation("selectedView") !== sViewId) {
					this.setAssociation("selectedView", oView);
					this._notifyForLoadingInMode(oView.getController(), oView, sMode);
				}
			}.bind(this);


			// check if the view is already instantiated
			oView = this._findView(sMode);
			if (oView) {
				fnSelect(oView);
				return;
			}


			//the view is not instantiated yet, handle a new view scenario
			sViewMetadata = this.getMetadata().getView(sMode);
			sViewMetadata.id = sViewId;
			this.createView(sViewMetadata, sMode).then(function (oView) {
				fnSelect(oView);
			});
		};


		/**
		 * Searches the <code>_views</code> aggregation for an existing view
		 * that corresponds to the given <code>sMode</code>
		 * @param {string} sMode the valid mode corresponding to the searched view
		 * @private
		 */
		BlockBase.prototype._findView = function (sMode) {
			var aViews = this.getAggregation("_views") || [],
				sViewMetadata,
				oFilteredViews;

			oFilteredViews = aViews.filter(function(oView) {
				return oView.data("layoutMode") === sMode;
			});

			if (oFilteredViews.length) {
				return oFilteredViews[0];
			}

			//check the view name (we may want to have the same view for several modes)
			sViewMetadata = this.getMetadata().getView(sMode);
			oFilteredViews = aViews.filter(function(oView) {
				return sViewMetadata.viewName === oView.getViewName();
			});

			if (oFilteredViews.length) {
				return oFilteredViews[0];
			}
		};


		// This offset is needed so the breakpoints of the ColumnLayout match those of the GridLayout (offset = Grid container width - ColumnLayout container width)
		BlockBase.FORM_ADUSTMENT_OFFSET = 16;

		BlockBase._FORM_ADJUSTMENT_CONST = {
			labelSpan: {
				/* values specified by design requirement */
				L: 12
			},
			emptySpan: {
				/* values specified by design requirement */
				L: 0
			},
			columns: {
				XL: 1,
				L: 1,
				M: 1
			}
		};

		BlockBase._PARENT_GRID_SIZE = 12;

		BlockBase.prototype._computeFormAdjustmentFields = function (oView, sFormAdjustment, oParentColumns) {

			if (oView && sFormAdjustment && oParentColumns) {

				return sFormAdjustment === BlockBaseFormAdjustment.BlockColumns ?
					jQuery.extend({}, BlockBase._FORM_ADJUSTMENT_CONST, {columns: oParentColumns}) :
					BlockBase._FORM_ADJUSTMENT_CONST;
			}
		};

		BlockBase.prototype._applyFormAdjustment = function () {

			var sFormAdjustment = this.getFormAdjustment(),
				oView = this._getSelectedViewContent(),
				oParent = this._oParentObjectPageSubSection,
				oFormAdjustmentFields,
				oColumnLayout,
				oLayout;

			if (sFormAdjustment && (sFormAdjustment !== BlockBaseFormAdjustment.None)
				&& oView && oParent) {

				var oParentColumns = oParent._oLayoutConfig;

				oView.getContent().forEach(function (oItem) {
					if (oItem.getMetadata().getName() === "sap.ui.layout.form.SimpleForm") {

						oItem.setLayout(SimpleFormLayout.ColumnLayout);

						if (!oFormAdjustmentFields) {
							oFormAdjustmentFields = this._computeFormAdjustmentFields(oView, sFormAdjustment, oParentColumns);
						}

						oLayout = oItem.getAggregation("form").getLayout();

						oLayout._iBreakPointTablet -= BlockBase.FORM_ADUSTMENT_OFFSET;
						oLayout._iBreakPointDesktop -= BlockBase.FORM_ADUSTMENT_OFFSET;
						oLayout._iBreakPointLargeDesktop -= BlockBase.FORM_ADUSTMENT_OFFSET;

						oItem.setLabelSpanL(oFormAdjustmentFields.labelSpan.L);
						oItem.setEmptySpanL(oFormAdjustmentFields.emptySpan.L);
						this._applyFormAdjustmentFields(oFormAdjustmentFields, oItem);

						oItem.setWidth("100%");
					} else if (oItem.getMetadata().getName() === "sap.ui.layout.form.Form") {

						oLayout = oItem.getLayout();

						if (oLayout && oLayout.getMetadata().getName() === "sap.ui.layout.form.ColumnLayout") {
							oColumnLayout = oLayout; // existing ColumnLayout must be reused, otherwise an error is thrown in the existing implementation
						} else {
							oColumnLayout = new ColumnLayout();
							oItem.setLayout(oColumnLayout);
						}

						if (!oFormAdjustmentFields) {
							oFormAdjustmentFields = this._computeFormAdjustmentFields(oView, sFormAdjustment, oParentColumns);
						}

						oColumnLayout._iBreakPointTablet -= BlockBase.FORM_ADUSTMENT_OFFSET;
						oColumnLayout._iBreakPointDesktop -= BlockBase.FORM_ADUSTMENT_OFFSET;
						oColumnLayout._iBreakPointLargeDesktop -= BlockBase.FORM_ADUSTMENT_OFFSET;

						oColumnLayout.setLabelCellsLarge(oFormAdjustmentFields.labelSpan.L);
						oColumnLayout.setEmptyCellsLarge(oFormAdjustmentFields.emptySpan.L);
						this._applyFormAdjustmentFields(oFormAdjustmentFields, oColumnLayout);

						oItem.setWidth("100%");
					}
				}, this);
			}
		};

		BlockBase.prototype._applyFormAdjustmentFields = function (oFormAdjustmentFields, oFormLayout) {

			oFormLayout.setColumnsXL(oFormAdjustmentFields.columns.XL);
			oFormLayout.setColumnsL(oFormAdjustmentFields.columns.L);
			oFormLayout.setColumnsM(oFormAdjustmentFields.columns.M);
		};

		/*************************************************************************************
		 * objectPageLayout integration & lazy loading management
		 ************************************************************************************/

		/**
		 * Getter for the parent object page layout.
		 * @returns {*} OP layout
		 * @private
		 */
		BlockBase.prototype._getObjectPageLayout = function () {
			return library.Utilities.getClosestOPL(this);
		};

		/**
		 * Setter for the visibility of the block.
		 * @public
		 */
		BlockBase.prototype.setVisible = function (bValue, bSuppressInvalidate) {
			var oParentObjectPageLayout = this._getObjectPageLayout();

			this.setProperty("visible", bValue, bSuppressInvalidate);
			oParentObjectPageLayout && oParentObjectPageLayout._requestAdjustLayoutAndUxRules();

			return this;
		};

		BlockBase.prototype.setShowSubSectionMore = function (bValue, bInvalidate) {
			//suppress invalidate as ShowSubSectionMore has no impact on block itself.
			if (bValue != this.getShowSubSectionMore()) {
				this.setProperty("showSubSectionMore", bValue, true);

				//refresh the parent subsection see more visibility if we have changed it and we are within an objectPageSubSection
				if (this._oParentObjectPageSubSection) {
					this._oParentObjectPageSubSection.refreshSeeMoreVisibility();
				}
			}

			return this;
		};

		/**
		 * Connects the <code>sap.uxap.Block</code> to the UI5 model tree.
		 * Initializes a view, if the lazy loading is enabled.
		 */
		BlockBase.prototype.connectToModels = function () {
			if (!this._bConnected) {
				Log.debug("BlockBase :: Connecting block to the UI5 model tree");
				this._bConnected = true;
				if (this._bLazyLoading) {
					//if lazy loading is enabled, the view has not been created during the setMode
					//so create it now
					var sMode = this.getMode();
					sMode && this._selectView(sMode);
				}

				this.invalidate();
			}
		};

		BlockBase.prototype._allowPropagationToLoadedViews = function (bAllow) {

			if (!this._bConnected) {
				return; /* only loaded views should be affected */
			}

			this.mSkipPropagation._views = !bAllow; /* skip if now allowed */
		};

		/**
		 * Override of the default model lifecycle method to disable the automatic binding resolution for lazyloading.
		 * @override
		 * @param {boolean} bSkipLocal
		 * @param {boolean} bSkipChildren
		 * @param {string} sModelName
		 * @param {boolean} bUpdateAll
		 * @returns {*}
		 */
		BlockBase.prototype.updateBindingContext = function (bSkipLocal, bSkipChildren, sModelName, bUpdateAll) {
			if (!this._shouldLazyLoad()) {
				return Control.prototype.updateBindingContext.call(this, bSkipLocal, bSkipChildren, sModelName, bUpdateAll);
			} else {
				Log.debug("BlockBase ::: Ignoring the updateBindingContext as the block is not visible for now in the ObjectPageLayout");
			}
		};

		/**
		 * Override of the default model lifecycle method to disable the automatic binding resolution for lazyloading.
		 * @override
		 * @param {boolean} bUpdateAll
		 * @param {string} sModelName
		 * @returns {*}
		 */
		BlockBase.prototype.updateBindings = function (bUpdateAll, sModelName) {
			if (!this._shouldLazyLoad()) {
				return Control.prototype.updateBindings.call(this, bUpdateAll, sModelName);
			} else {
				Log.debug("BlockBase ::: Ignoring the updateBindingContext as the block is not visible for now in the ObjectPageLayout");
			}
		};

		/**
		 * Determines whether the <code>sap.uxap.BlockBase</code> should be loaded lazily.
		 * There are 3 prerequisites - lazy loading sould be enabled, the block should not be connected
		 * and the block is used whithin <code>sap.uxap.ObjectPageSubSection</code>
		 * @returns {Boolean}
		 * @private
		 */
		BlockBase.prototype._shouldLazyLoad = function () {
			return !!this._oParentObjectPageSubSection && this._bLazyLoading && !this._bConnected;
		};

		return BlockBase;
});