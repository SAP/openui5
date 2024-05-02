/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/m/OverflowToolbarButton",
	"sap/m/OverflowToolbarToggleButton",
	"sap/m/Title",
	"sap/m/IllustratedMessageType",
	"sap/ui/mdc/chart/SelectionButton",
	"sap/ui/mdc/chart/SelectionButtonDisplay",
	"sap/ui/mdc/chart/DrillBreadcrumbs",
	"./ChartSelectionDetails",
	"sap/ui/core/InvisibleText",
	"sap/m/OverflowToolbarLayoutData",
	"sap/ui/core/library",
	"sap/ui/Device",
	"sap/ui/core/ShortcutHintsMixin",
	"sap/base/util/merge"
],
(
	Library,
	OverflowButton,
	OverflowToggleButton,
	Title,
	IllustratedMessageType,
	SelectionButton,
	SelectionButtonDisplay,
	DrillBreadcrumbs,
	ChartSelectionDetails,
	InvisibleText,
	OverflowToolbarLayoutData,
	coreLibrary,
	Device,
	ShortcutHintsMixin,
	merge
) => {
	"use strict";

	// shortcut for sap.ui.core.aria.HasPopup
	const AriaHasPopup = coreLibrary.aria.HasPopup;

	/**
	 * Provides utility functions for chart toolbar.
	 *
	 * @namespace
	 * @alias sap.ui.mdc.chart.ToolbarControlFactory
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.123
	 * @experimental
	 * @private
	 */
	const ToolbarControlFactory = {};
	const MDCRb = Library.getResourceBundleFor("sap.ui.mdc");

	ToolbarControlFactory.createDrillBreadcrumbs = function(sId, mSettings) {
		mSettings = merge({
		}, mSettings);

		const oBreadcrumbs = new DrillBreadcrumbs(sId + "--breadcrumbs", mSettings);
		return oBreadcrumbs;
	};

	ToolbarControlFactory.createTitle = function(sId, mSettings, oToolbar) {
		const sHeader = mSettings.header;

		oToolbar._oInvTitle = new InvisibleText(sId + "-invTitle", { text: sHeader });
		oToolbar._oInvTitle.toStatic();
		oToolbar.addAriaLabelledBy(oToolbar._oInvTitle);

		const oTitle = new Title(sId + "-title", {
			text: sHeader,
			level: mSettings.headerLevel,
			titleStyle: mSettings.headerStyle,
			visible: mSettings.headerVisible
		});
		return oTitle;
	};

	ToolbarControlFactory.createSelectionDetailsBtn = function(sId, mSettings) {
		const fncGetSelectionDetailsActions =  mSettings.getSelectionDetailsActions;
		delete mSettings.getSelectionDetailsActions;

		//mSettings = merge({}, mSettings);
		const oChartSelectionDetails = new ChartSelectionDetails(sId + "-selectionDetails", mSettings);

		oChartSelectionDetails.attachBeforeOpen((oEvent) => {
			const oChartSelectionDetails = oEvent.getSource();
			const oSelectionDetailsActions = fncGetSelectionDetailsActions();
			let oClone;

			if (oSelectionDetailsActions) {
				// Update item actions
				const aSelectionItems = oChartSelectionDetails.getItems();

				aSelectionItems.forEach((oItem) => {
					const aItemActions = oSelectionDetailsActions?.getDetailsItemActions() || [];
					aItemActions.forEach((oAction) => {
						oClone = oAction.clone();
						oItem.addAction(oClone);
					});
				});

				// Update list actions
				const aDetailsActions = oSelectionDetailsActions?.getDetailsActions() || [];
				oChartSelectionDetails.removeAllActions();
				aDetailsActions.forEach((oAction) => {
					oClone = oAction.clone();
					oChartSelectionDetails.addAction(oClone);
				});

				// Update group actions
				const aActionGroups = oSelectionDetailsActions?.getActionGroups() || [];
				oChartSelectionDetails.removeAllActionGroups();
				aActionGroups.forEach((oActionGroup) => {
					oClone = oActionGroup.clone();
					oChartSelectionDetails.addActionGroup(oClone);
				});
			}

		});

		return oChartSelectionDetails;
	};

	ToolbarControlFactory.createDrillDownBtn = function(sId, mSettings) {
		mSettings = merge({
			display: SelectionButtonDisplay.Text,

			text: MDCRb.getText("chart.CHART_DRILLDOWN_TITLE"),
			title: MDCRb.getText("chart.CHART_DRILLDOWN_TITLE"),
			icon: "sap-icon://drill-down",

			noDataTitle: MDCRb.getText("chart.NO_DRILLABLE_DIMENSION"),
			noDataDescription: MDCRb.getText("chart.NO_DRILLABLE_DIMENSION_DESC"),
			noDataType: IllustratedMessageType.NoDimensionsSet,
			searchPlaceholder: MDCRb.getText("chart.CHART_DRILLDOWN_SEARCH"),
			searchEnabled: true,
			sortEnabled: false,
			sorted: "ascending",

			type: "Transparent",
			ariaHasPopup: AriaHasPopup.ListBox,
			layoutData: new OverflowToolbarLayoutData({
				closeOverflowOnInteraction: false
			})
		}, mSettings);

		const oDrillDownBtn = new SelectionButton(sId + "-drillDown", mSettings);
		return oDrillDownBtn;
	};

	ToolbarControlFactory.createLegendBtn = function(sId, mSettings) {
		mSettings = merge({
			type: "Transparent",
			text: MDCRb.getText("chart.LEGENDBTN_TEXT"),
			tooltip: MDCRb.getText("chart.LEGENDBTN_TOOLTIP"),
			icon: "sap-icon://legend"
		}, mSettings);

		const oLegendBtn = new OverflowToggleButton(sId + "btnLegend", mSettings);
		return oLegendBtn;
	};

	ToolbarControlFactory.createZoomInBtn = function(sId, mSettings) {
		mSettings = merge({
			icon: "sap-icon://zoom-in",
			tooltip: MDCRb.getText("chart.TOOLBAR_ZOOM_IN"),
			text: MDCRb.getText("chart.TOOLBAR_ZOOM_IN")
		}, mSettings);

		const oZoomInButton = new OverflowButton(sId + "btnZoomIn", mSettings);
		return oZoomInButton;
	};

	ToolbarControlFactory.createZoomOutBtn = function(sId, mSettings) {
		mSettings = merge({
			icon: "sap-icon://zoom-out",
			tooltip: MDCRb.getText("chart.TOOLBAR_ZOOM_OUT"),
			text: MDCRb.getText("chart.TOOLBAR_ZOOM_OUT")
		}, mSettings);

		const oZoomOutButton = new OverflowButton(sId + "btnZoomOut", mSettings);
		return oZoomOutButton;
	};

	ToolbarControlFactory.createSettingsBtn = function(sId, mSettings) {
		mSettings = merge({
			icon: "sap-icon://action-settings",
			tooltip: MDCRb.getText('chart.SETTINGS'),
			text: MDCRb.getText('chart.SETTINGS')
		}, mSettings);

		const oSettingsBtn = new OverflowButton(sId + "-chart_settings", mSettings);

		ShortcutHintsMixin.addConfig(oSettingsBtn, {
			addAccessibilityLabel: true,
			message: MDCRb.getText(Device.os.macintosh ? "mdc.PERSONALIZATION_SHORTCUT_MAC" : "mdc.PERSONALIZATION_SHORTCUT")
		}, this);

		return oSettingsBtn;
	};

	ToolbarControlFactory.createChartTypeBtn = function(sId, mSettings) {
		mSettings = merge({
			text: MDCRb.getText("chart.CHART_TYPELIST_TEXT"),
			title: MDCRb.getText("chart.CHART_TYPELIST_TEXT"),
			noDataTitle: MDCRb.getText("chart.NO_CHART_TYPES_AVAILABLE"),
			noDataDescription: MDCRb.getText("chart.NO_CHART_TYPES_AVAILABLE_ACTION"),
			noDataType: IllustratedMessageType.AddDimensions,
			searchPlaceholder: MDCRb.getText("chart.CHART_TYPE_SEARCH"),
			searchEnabled: true,
			sortEnabled: false,

			type: "Transparent",
			ariaHasPopup: AriaHasPopup.ListBox,
			layoutData: new OverflowToolbarLayoutData({
				closeOverflowOnInteraction: false
			})
		}, mSettings);

		const oChartTypeBtn = new SelectionButton(sId + "-btnChartType", mSettings);
		return oChartTypeBtn;
	};

	return ToolbarControlFactory;
});