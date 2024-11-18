/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Lib"
], function(
	Element,
	Lib
) {
	"use strict";

	const GeneralTour = {};

	const oTextResources = Lib.getResourceBundleFor("sap.ui.rta");

	function filterAvailableBurgerMenuActions(oGeneralTour) {
		const oControlsModelData = Element.getElementById("sapUIRta_toolbar").getModel("controls").getData();
		const aAvailableBurgerMenuActions = {
			newFeaturesOverview: oControlsModelData.newFeaturesOverview.visible,
			translation: oControlsModelData.translation.visible,
			generalTour: true,
			appVariantMenu: oControlsModelData.appVariantMenu.visible,
			restore: oControlsModelData.restore.visible
		};

		// Find the index of the burger menu step
		const nBurgerMenuStepIndex = oGeneralTour.steps.findIndex((oStep) =>
			oStep.title === oTextResources.getText("TIT_TOUR_GENERAL_STEP_BURGER_MENU_TITLE")
		);

		// Set the available actions
		oGeneralTour.steps[nBurgerMenuStepIndex].listContent = oGeneralTour.steps[nBurgerMenuStepIndex].listContent.filter((oItem) =>
			aAvailableBurgerMenuActions[oItem.id]
		);

		return oGeneralTour;
	}

	/**
	 * The `oGeneralTourContent` object defines the steps for the Guided Tour in the RTA toolbar.
	 * Each step provides information about a specific feature or functionality.
	 *
	 * To add a new step, include an object in the `steps` array with the following structure:
	 *
	 * {
	 *   title: <Title of the step>,
	 *   description: <Description of the step>,
	 *   listContent: [
	 *     {
	 *       id: <id of the action>,
	 *       title: <Title of the action>,
	 *       description: <Description of the action>,
	 *       icon: <Icon representing the action>
	 *     }
	 *   ],
	 *   markerSelector: <Selector for the UI element to highlight during the step>,
	 *   actionSelectors: [<Selectors for elements to trigger actions on during the steps>],
	 *   waitForElement: <Boolean indicating whether to wait for the element to become visible>
	 * }
	 */

	const oGeneralTourContent = {
		initialStateSelectors: ["sapUIRta_toolbar_fragment--sapUiRta_adaptationSwitcherButton-button"],
		steps: [
			{
				title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_UI_ADAPTATION_BUTTON_TITLE"),
				description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_UI_ADAPTATION_BUTTON_DESCRIPTION"),
				listContent: [],
				markerSelector: "sapUIRta_toolbar_fragment--sapUiRta_adaptationSwitcherButton-button",
				actionSelectors: ["sapUIRta_toolbar_fragment--sapUiRta_adaptationSwitcherButton-button"]
			},
			{
				title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_NAVIGATION_BUTTON_TITLE"),
				description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_NAVIGATION_BUTTON_DESCRIPTION"),
				listContent: [],
				markerSelector: "sapUIRta_toolbar_fragment--sapUiRta_navigationSwitcherButton-button",
				actionSelectors: ["sapUIRta_toolbar_fragment--sapUiRta_navigationSwitcherButton-button"]
			},
			{
				title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_VISUALIZATION_BUTTON_TITLE"),
				description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_VISUALIZATION_BUTTON_DESCRIPTION"),
				listContent: [],
				markerSelector: "sapUIRta_toolbar_fragment--sapUiRta_visualizationSwitcherButton-button",
				actionSelectors: ["sapUIRta_toolbar_fragment--sapUiRta_visualizationSwitcherButton-button"]
			},
			{
				title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_CHANGE_LIST_DROPDOWN_TITLE"),
				description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_CHANGE_LIST_DROPDOWN_DESCRIPTION"),
				listContent: [],
				markerSelector:
					"sapUIRta_toolbar_fragment--sapUiRta_toggleChangeVisualizationMenuButton--ChangeIndicatorCategorySelection--popover",
				waitForElement: true,
				actionSelectors: [
					"sapUIRta_toolbar_fragment--sapUiRta_visualizationSwitcherButton-button",
					"sapUIRta_toolbar_fragment--sapUiRta_toggleChangeVisualizationMenuButton"
				]
			},
			{
				title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_SAVE_BUTTON_TITLE"),
				description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_SAVE_BUTTON_DESCRIPTION"),
				listContent: [],
				markerSelector: "sapUIRta_toolbar_fragment--sapUiRta_save",
				waitForElement: true,
				actionSelectors: ["sapUIRta_toolbar_fragment--sapUiRta_adaptationSwitcherButton-button"]
			},
			{
				title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_UNDO_BUTTON_TITLE"),
				description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_UNDO_BUTTON_DESCRIPTION"),
				listContent: [],
				markerSelector: "sapUIRta_toolbar_fragment--sapUiRta_undo"
			},
			{
				title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_REDO_BUTTON_TITLE"),
				description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_REDO_BUTTON_DESCRIPTION"),
				listContent: [],
				markerSelector: "sapUIRta_toolbar_fragment--sapUiRta_redo"
			},
			{
				title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_ACTIVATE_VERSION_BUTTON_TITLE"),
				description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_ACTIVATE_VERSION_BUTTON_DESCRIPTION"),
				listContent: [],
				markerSelector: "sapUIRta_toolbar_fragment--sapUiRta_activate"
			},
			{
				title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_VERSIONS_DROPDOWN_TITLE"),
				description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_VERSIONS_DROPDOWN_DESCRIPTION"),
				listContent: [],
				markerSelector: "sapUIRta_toolbar_fragment--sapUiRta_versionHistoryDialog--originalVersionList",
				waitForElement: true,
				actionSelectors: ["sapUIRta_toolbar_fragment--sapUiRta_versionButton"]
			},
			{
				title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_PUBLISH_BUTTON_TITLE"),
				description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_PUBLISH_BUTTON_DESCRIPTION"),
				listContent: [],
				markerSelector: "sapUIRta_toolbar_fragment--sapUiRta_publishVersion"
			},
			{
				title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_BURGER_MENU_TITLE"),
				description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_BURGER_MENU_DESCRIPTION"),
				listContent: [
					{
						id: "translation",
						title: oTextResources.getText("BTN_TRANSLATE"),
						description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_BURGER_MENU_TRANSLATIONS"),
						icon: "sap-icon://translate"
					},
					{
						id: "appVariantMenu",
						title: oTextResources.getText("BTN_MANAGE_APPS_TXT"),
						description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_BURGER_MENU_APP_VARIANTS"),
						icon: "sap-icon://BusinessSuiteInAppSymbols/icon-variant-configuration"
					},
					{
						id: "restore",
						title: oTextResources.getText("BTN_RESTORE"),
						description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_BURGER_MENU_RESTORE"),
						icon: "sap-icon://reset"
					},
					{
						id: "newFeaturesOverview",
						title: oTextResources.getText("BTN_WHATS_NEW_DIALOG_OVERVIEW"),
						description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_BURGER_MENU_NEW_FEATURES"),
						icon: "sap-icon://newspaper"
					},
					{
						id: "generalTour",
						title: oTextResources.getText("BTN_GUIDED_TOUR_START"),
						description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_BURGER_MENU_GENERAL_TOUR"),
						icon: "sap-icon://map-3"
					}
				],
				markerSelector: "sapUIRta_toolbar_fragment--sapUiRta_actionsMenu"
			},
			{
				title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_CONTEXT_BASED_ADAPTATIONS_TITLE"),
				description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_CONTEXT_BASED_ADAPTATIONS_DESCRIPTION"),
				listContent: [],
				markerSelector: "sapUIRta_toolbar_fragment--sapUiRta_contextBasedAdaptationsButton"
			},
			{
				title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_FEEDBACK_BUTTON_TITLE"),
				description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_FEEDBACK_BUTTON_DESCRIPTION"),
				listContent: [],
				markerSelector: "sapUIRta_toolbar_fragment--sapUiRta_feedback"
			},
			{
				title: oTextResources.getText("TIT_TOUR_GENERAL_STEP_EXIT_BUTTON_TITLE"),
				description: oTextResources.getText("TXT_TOUR_GENERAL_STEP_EXIT_BUTTON_DESCRIPTION"),
				listContent: [],
				markerSelector: "sapUIRta_toolbar_fragment--sapUiRta_exit"
			}
		]
	};

	GeneralTour.getTourContent = function() {
		return filterAvailableBurgerMenuActions(oGeneralTourContent);
	};

	return GeneralTour;
});