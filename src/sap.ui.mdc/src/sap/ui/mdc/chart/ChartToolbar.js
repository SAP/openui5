/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/ui/core/Lib",
		"sap/ui/mdc/ActionToolbar",
		"sap/m/OverflowToolbarRenderer",
		"sap/m/OverflowToolbarButton",
		"sap/m/OverflowToolbarToggleButton",
		"sap/m/Title",
		"sap/m/IllustratedMessageType",
		"sap/ui/mdc/chart/SelectionButton",
		"sap/ui/mdc/chart/SelectionButtonItem",
		"./ChartSelectionDetails",
		"sap/ui/core/InvisibleText",
		"sap/m/OverflowToolbarLayoutData",
		"sap/ui/core/library",
		"sap/ui/Device",
		"sap/ui/core/ShortcutHintsMixin",
		"sap/ui/mdc/enums/ChartToolbarActionType"
	],
	(
		Library,
		ActionToolbar,
		OverflowToolbarRenderer,
		OverflowButton,
		OverflowToggleButton,
		Title,
		IllustratedMessageType,
		SelectionButton,
		SelectionButtonItem,
		ChartSelectionDetails,
		InvisibleText,
		OverflowToolbarLayoutData,
		coreLibrary,
		Device,
		ShortcutHintsMixin,
		ChartToolbarActionType
	) => {
		"use strict";

		// shortcut for sap.ui.core.aria.HasPopup
		const AriaHasPopup = coreLibrary.aria.HasPopup;

		/**
		 * Constructor for a new ChartToolbar.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 * @class The ChartToolbar control is a sap.m.OverflowToolbar based on metadata and the configuration specified.
		 * @extends sap.ui.mdc.ActionToolbar
		 * @author SAP SE
		 * @version ${version}
		 * @constructor
		 * @experimental As of version 1.88
		 * @private
		 * @since 1.88
		 * @alias sap.ui.mdc.chart.ChartToolbar
		 */
		const ChartToolbar = ActionToolbar.extend("sap.ui.mdc.chart.ChartToolbar", /** @lends sap.ui.mdc.chart.ChartToolbar.prototype */ {
			metadata: {
				library: "sap.ui.mdc",
				interfaces: [],
				defaultAggregation: "",
				properties: {},
				aggregations: {},
				associations: {},
				events: {}
			},
			renderer: OverflowToolbarRenderer
		});

		const MDCRb = Library.getResourceBundleFor("sap.ui.mdc");

		/**
		 * Initialises the MDC Chart Selection Details
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		ChartToolbar.prototype.init = function() {
			ActionToolbar.prototype.init.apply(this, arguments);
		};

		/**
		 * Creates the inner toolbar content.
		 * @param {sap.ui.mdc.Chart} oChart Reference to the parent chart
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		ChartToolbar.prototype.createToolbarContent = function(oChart) {
			this._oChart = oChart;

			//Keep track of chart buttons to enable them later on
			this._chartInternalButtonsToEnable = [];

			this._oInvTitle = new InvisibleText(oChart.getId() + "-invTitle", { text: oChart.getHeader() });
			this._oInvTitle.toStatic();
			this.addAriaLabelledBy(this._oInvTitle);

			/**add beginning**/
			this._oTitle = new Title(oChart.getId() + "-title", {
				text: oChart.getHeader(),
				level: oChart.getHeaderLevel(),
				titleStyle: oChart.getHeaderStyle(),
				visible: oChart.getHeaderVisible()
			});
			this.addBegin(this._oTitle);

			/** variant management */
			if (oChart.getAggregation("variant")) {
				this.addVariantManagement(oChart.getAggregation("variant"));
			}

			/**add end **/
			if (oChart.getShowSelectionDetails()) {
				this._oChartSelectionDetails = new ChartSelectionDetails(oChart.getId() + "-selectionDetails", {});
				this._oChartSelectionDetails.attachBeforeOpen((oEvent) => {
					this._updateSelectionDetailsActions(oChart);
				});

				this.addEnd(this._oChartSelectionDetails);
			}

			//Check p13n mode property on the chart and enable only desired buttons
			const aP13nMode = oChart.getP13nMode() || [];

			if (aP13nMode.indexOf("Item") > -1 && (!oChart.getIgnoreToolbarActions().length || oChart.getIgnoreToolbarActions().indexOf(ChartToolbarActionType.DrillDownUp) < 0)) {
				this._oDrillDownBtn = new SelectionButton(this.getId() + "-drillDown", {
					text: MDCRb.getText("chart.CHART_DRILLDOWN_TITLE"),
					title: MDCRb.getText("chart.CHART_DRILLDOWN_TITLE"),

					noDataTitle: MDCRb.getText("chart.NO_DRILLABLE_DIMENSION"),
					noDataDescription: MDCRb.getText("chart.NO_DRILLABLE_DIMENSION_DESC"),
					noDataType: IllustratedMessageType.NoDimensionsSet,
					searchPlaceholder: MDCRb.getText("chart.CHART_DRILLDOWN_SEARCH"),
					searchEnabled: true,
					sortEnabled: false,
					sorted: "ascending",

					enabled: false,
					type: "Transparent",
					ariaHasPopup: AriaHasPopup.ListBox,
					layoutData: new OverflowToolbarLayoutData({
						closeOverflowOnInteraction: false
					}),
					beforeOpen: function(oEvent) {
						const oViewByBtn = oEvent.getSource();
						oViewByBtn.removeAllItems();
						oViewByBtn.setSelectedItemKey("");

						const fnGetDrillStackDimensions = function(oChart) {
							const aDrillStack = oChart.getControlDelegate().getDrillStack(oChart);
							const aStackDimensions = [];

							aDrillStack.forEach((oStackEntry) => {
								// loop over nested dimension arrays
								oStackEntry.dimension.forEach((sDimension) => {
									if (sDimension != null && sDimension != "" && aStackDimensions.indexOf(sDimension) == -1) {
										aStackDimensions.push(sDimension);
									}
								});
							});

							return aStackDimensions;
						};

						const pSortedDimensionsPromise = oChart.getControlDelegate().getSortedDimensions(oChart);
						return pSortedDimensionsPromise.then((aSortedDimensions) => {
							// Ignore currently applied dimensions from drill-stack for selection
							const aIgnoreDimensions = fnGetDrillStackDimensions(oChart);
							aSortedDimensions = aSortedDimensions.filter((oDimension) => { return aIgnoreDimensions.indexOf(oDimension.name) < 0; });

							aSortedDimensions.forEach((oDimension) => {
								// oData.items.push({ text: oDimension.label, id: oDimension.name });
								this._oDrillDownBtn.addItem(new SelectionButtonItem({key: oDimension.name, text: oDimension.label}));
							});
							oViewByBtn.setSearchEnabled(aSortedDimensions.length >= 7);
							oViewByBtn._openPopover(); // in this case the beforeOpen is not able to provide all item syncron
						});
					}.bind(this),
					itemSelected: function(oEvent) {
						const sDimensionName = oEvent.getParameter("item").key;

						//Call flex to capture current state before adding an item to the chart aggregation
						oChart.getEngine().createChanges({
							control: oChart,
							key: "Item",
							state: [{
								name: sDimensionName,
								position: oChart.getItems().length
							}]
						});
					}
				});
				// Workaround to display a text on the OverFlowToolbar button when not inside the overflow.
				this._oDrillDownBtn._bInOverflow = true;
				this._oDrillDownBtn._onAfterExitOverflow = function () {this._bInOverflow = true;};

				this.addEnd(this._oDrillDownBtn);
				this._chartInternalButtonsToEnable.push(this._oDrillDownBtn);
			}

			if (!oChart.getIgnoreToolbarActions().length || oChart.getIgnoreToolbarActions().indexOf(ChartToolbarActionType.Legend) < 0) {
				this._oLegendBtn = new OverflowToggleButton(oChart.getId() + "btnLegend", {
					type: "Transparent",
					text: MDCRb.getText("chart.LEGENDBTN_TEXT"),
					tooltip: MDCRb.getText("chart.LEGENDBTN_TOOLTIP"),
					icon: "sap-icon://legend",
					pressed: "{$mdcChart>/legendVisible}",
					enabled: false
				});
				this.addEnd(this._oLegendBtn);
				this._chartInternalButtonsToEnable.push(this._oLegendBtn);
			}

			if (!oChart.getIgnoreToolbarActions().length || oChart.getIgnoreToolbarActions().indexOf(ChartToolbarActionType.ZoomInOut) < 0) {
				this.oZoomInButton = new OverflowButton(oChart.getId() + "btnZoomIn", {
					icon: "sap-icon://zoom-in",
					tooltip: MDCRb.getText("chart.TOOLBAR_ZOOM_IN"),
					text: MDCRb.getText("chart.TOOLBAR_ZOOM_IN"),
					enabled: false,
					press: function onZoomOutButtonPressed(oControlEvent) {
						oChart.zoomIn();
						this.toggleZoomButtons(oChart);
					}.bind(this)
				});

				this.oZoomOutButton = new OverflowButton(oChart.getId() + "btnZoomOut", {
					icon: "sap-icon://zoom-out",
					tooltip: MDCRb.getText("chart.TOOLBAR_ZOOM_OUT"),
					text: MDCRb.getText("chart.TOOLBAR_ZOOM_OUT"),
					enabled: false,
					press: function onZoomOutButtonPressed(oControlEvent) {
						oChart.zoomOut();
						this.toggleZoomButtons(oChart);
					}.bind(this)
				});
				this.addEnd(this.oZoomInButton);
				this.addEnd(this.oZoomOutButton);
				//Enabled via toggleZoomButtons()
			}

			if (aP13nMode.indexOf("Sort") > -1 || aP13nMode.indexOf("Item") > -1 || aP13nMode.indexOf("Filter") > -1) {
				this._oSettingsBtn = new OverflowButton(oChart.getId() + "-chart_settings", {
					icon: "sap-icon://action-settings", //TODO the right icon for P13n chart dialog
					tooltip: MDCRb.getText('chart.SETTINGS'),
					text: MDCRb.getText('chart.SETTINGS'),
					enabled: false,
					press: function(oEvent) {
						const aP13nMode = oChart.getP13nMode();
						const iIdx = aP13nMode.indexOf("Type");
						if (iIdx > -1) {
							aP13nMode.splice(iIdx, 1);
						}

						//TODO: Move this to p13n functionality?
						if (oChart.isPropertyHelperFinal()) {
							oChart.getEngine().show(oChart, aP13nMode);
						} else {
							oChart.finalizePropertyHelper().then(() => {
								oChart.getEngine().show(oChart, aP13nMode);
							});
						}
					}
				});

				ShortcutHintsMixin.addConfig(this._oSettingsBtn, {
					addAccessibilityLabel: true,
					messageBundleKey: Device.os.macintosh ? "mdc.PERSONALIZATION_SHORTCUT_MAC" : "mdc.PERSONALIZATION_SHORTCUT" // Cmd+, or Ctrl+,
				}, this);

				this.addEnd(this._oSettingsBtn);
				this._chartInternalButtonsToEnable.push(this._oSettingsBtn);
			}

			if (oChart._getTypeBtnActive()) {
				const sChartType = oChart.getChartType();

				this._oChartTypeBtn = new SelectionButton(this.getId() + "-btnChartType", {
					chartType: sChartType,

					text: MDCRb.getText("chart.CHART_TYPELIST_TEXT"),
					title: MDCRb.getText("chart.CHART_TYPELIST_TEXT"),
					noDataTitle: MDCRb.getText("chart.NO_CHART_TYPES_AVAILABLE"),
					noDataDescription: MDCRb.getText("chart.NO_CHART_TYPES_AVAILABLE_ACTION"),
					noDataType: IllustratedMessageType.AddDimensions,
					searchPlaceholder: MDCRb.getText("chart.CHART_TYPE_SEARCH"),
					searchEnabled: true,
					sortEnabled: false,

					enabled: false,
					type: "Transparent",
					ariaHasPopup: AriaHasPopup.ListBox,
					layoutData: new OverflowToolbarLayoutData({
						closeOverflowOnInteraction: false
					}),
					beforeOpen: function(oEvent) {
						const oChartTypeBtn = oEvent.getSource();
						// use this to update the available ChartTypes
						const aAvailableChartTypes = oChart.getAvailableChartTypes();
						oChartTypeBtn.removeAllItems();
						aAvailableChartTypes.forEach((oChartType) => {
							oChartTypeBtn.addItem(
								new SelectionButtonItem({key: oChartType.key, text: oChartType.text, icon: oChartType.icon})
							);
						});
						oChartTypeBtn.setSearchEnabled(aAvailableChartTypes.length >= 7);
					},
					itemSelected: function(oEvent) {
						const oChartTypeBtn = oEvent.getSource();
						const sChartType = oEvent.getParameter("item").key;

						const oChartTypeInfo = oChart.getChartTypeInfo();
						const aAvailableChartTypes = oChart.getAvailableChartTypes();
						const oChartType = aAvailableChartTypes.filter((o) => {return o.key === sChartType; })[0];

						oChartTypeBtn.setText(oChartType.text);
						oChartTypeBtn.setTooltip(oChartTypeInfo.text);
						oChartTypeBtn.setIcon(oChartType.icon);

						//TODO should be done in the chart, the control should only raise an event
						sap.ui.require([
							"sap/ui/mdc/flexibility/Chart.flexibility"
						], (ChartFlex) => {

							oChart.getEngine().createChanges({
								control: oChart,
								key: "Type",
								state: {
									properties: {
										chartType: sChartType
									}
								}
							}).then((vResult) => {
								oChart.getControlDelegate().requestToolbarUpdate(oChart);
							});

						});
					}
				});
				this.addEnd(this._oChartTypeBtn);
				this._chartInternalButtonsToEnable.push(this._oChartTypeBtn);
			}

			this._updateVariantManagement();
		};

		/**
		 * This adds a <code>VariantManagement</code> control at the beginning of the toolbar.
		 * @param {sap.ui.fl.variantManagement} oVariantManagement the <code>VariantManagement</code> control to add to the toolbar
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		ChartToolbar.prototype.addVariantManagement = function(oVariantManagement) {

			if (oVariantManagement) {
				if (this._oVariantManagement) {
					this.removeBetween(this._oVariantManagement);
				}

				this._oVariantManagement = oVariantManagement;
				this.addBetween(this._oVariantManagement);

				this._updateVariantManagement();
			}

		};

		/**
		 * This checks the enablement of the zoom button in the toolbar.
		 * @param {sap.ui.mdc.Chart} oChart Reference to the parent chart
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.fe
		 */
		ChartToolbar.prototype.toggleZoomButtons = function(oChart) {
			if (!this.oZoomInButton || !this.oZoomOutButton) {
				return;
			}
			const oZoomInfo = this._getZoomEnablement(oChart);

			if (oZoomInfo.enabled) {
				const bInFocused = document.activeElement === this.oZoomInButton.getDomRef();
				const bOutFocused = document.activeElement === this.oZoomOutButton.getDomRef();

				this.oZoomInButton.setEnabled(oZoomInfo.enabledZoomIn);
				this.oZoomOutButton.setEnabled(oZoomInfo.enabledZoomOut);

				// toggle the focus between zoom buttons when the currecnt is disabled
				if (!oZoomInfo.enabledZoomIn && bInFocused) {
					this.oZoomOutButton.focus();
				}
				if (!oZoomInfo.enabledZoomOut && bOutFocused) {
					this.oZoomInButton.focus();
				}
			} else {
				this.oZoomInButton.setEnabled(false);
				this.oZoomOutButton.setEnabled(false);
			}

		};

		/**
		 * This updates the toolbar in accordance with the parent chart.
		 * Only used internally.
		 * @param {sap.ui.mdc.Chart} oChart Reference to the parent chart
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.fe
		 */
		ChartToolbar.prototype.updateToolbar = function(oChart) {
			this.toggleZoomButtons(oChart);

			if (!this._toolbarInitialUpdated) {
				this.setEnabled(true);

				this._chartInternalButtonsToEnable.forEach((oBtn) => {
					oBtn.setEnabled(true);
				});
				delete this._chartInternalButtonsToEnable;

				this._toolbarInitialUpdated = true;
			}

			//TODO do we have to attach the SelectionHandler in every call or only once?
			const oSelectionHandler = oChart.getSelectionHandler();
			if (oSelectionHandler && oChart.getShowSelectionDetails()) {
				this._oChartSelectionDetails.attachSelectionHandler(oSelectionHandler.eventId, oSelectionHandler.listener);
			}
		};

		ChartToolbar.prototype._getVariantReference = function() {
			return this._oVariantManagement;
		};

		ChartToolbar.prototype._getZoomEnablement = function(oChart) {
			let zoomInfo;

			try {
				zoomInfo = oChart.getZoomState();
			} catch (error) {
				//Catch the case when an inner chart is not yet rendered
				zoomInfo = { enabled: false };
			}


			if (zoomInfo && zoomInfo.hasOwnProperty("currentZoomLevel") && zoomInfo.currentZoomLevel != null && zoomInfo.enabled) {
				const toolbarZoomInfo = { enabled: true };

				//TODO: Move this to the delegate since we don't know how other chart librariers handle this
				toolbarZoomInfo.enabledZoomOut = zoomInfo.currentZoomLevel > 0;
				toolbarZoomInfo.enabledZoomIn = zoomInfo.currentZoomLevel < 1;
				return toolbarZoomInfo;
			} else {
				return { enabled: false };
			}
		};

		ChartToolbar.prototype._updateSelectionDetailsActions = function(oChart) {

			//In case details button is disabled
			if (!oChart.getShowSelectionDetails()) {
				return;
			}

			const oSelectionDetailsActions = oChart.getSelectionDetailsActions();
			let oClone;

			if (oSelectionDetailsActions) {
				// Update item actions
				const aSelectionItems = this._oChartSelectionDetails.getItems();

				aSelectionItems.forEach((oItem) => {
					const aItemActions = oSelectionDetailsActions.getDetailsItemActions();
					aItemActions.forEach((oAction) => {
						oClone = oAction.clone();
						oItem.addAction(oClone);
					});
				});

				// Update list actions
				const aDetailsActions = oSelectionDetailsActions.getDetailsActions();
				this._oChartSelectionDetails.removeAllActions();
				aDetailsActions.forEach((oAction) => {
					oClone = oAction.clone();
					this._oChartSelectionDetails.addAction(oClone);
				});

				// Update group actions
				const aActionGroups = oSelectionDetailsActions.getActionGroups();
				this._oChartSelectionDetails.removeAllActionGroups();
				aActionGroups.forEach((oActionGroup) => {
					oClone = oActionGroup.clone();
					this._oChartSelectionDetails.addActionGroup(oClone);
				});
			}

		};

		ChartToolbar.prototype._setHeader = function(sHeader) {
			this._oTitle?.setText(sHeader);
			this._oInvTitle?.setText(sHeader);
		};

		ChartToolbar.prototype._setHeaderLevel = function(sHeaderLevel) {
			this._oTitle?.setLevel(sHeaderLevel);
			this._updateVariantManagement();
		};

		ChartToolbar.prototype._setHeaderStyle = function(sHeaderStyle) {
			this._oTitle?.setTitleStyle(sHeaderStyle);
			this._updateVariantManagement();
		};

		ChartToolbar.prototype._setHeaderVisible = function(bVisible) {
			// this._oTitle?.setWidth(bVisible ? undefined : "0px");
			this._oTitle?.setVisible(bVisible);
			this._updateVariantManagement();
		};

		ChartToolbar.prototype._updateVariantManagement = function() {
			if (this._oVariantManagement && this._oChart) {
				this._oVariantManagement.setShowAsText(this._oChart.getHeaderVisible());
				this._oVariantManagement.setTitleStyle(this._oChart.getHeaderStyle());
				this._oVariantManagement.setHeaderLevel(this._oChart.getHeaderLevel());
			}
		};

		/**
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		ChartToolbar.prototype.getSettingsButton = function() {
			return this._oSettingsBtn;
		};

		ChartToolbar.prototype.exit = function() {
			ActionToolbar.prototype.exit.apply(this, arguments);

			if (this._oInvTitle) {
				this._oInvTitle.destroy();
				this._oInvTitle = null;
			}
		};

		return ChartToolbar;
	});