/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/support/library",
	"sap/ui/model/json/JSONModel"
], function (library, JSONModel) {
	"use strict";

	var Audiences = library.Audiences,
		Categories = library.Categories,
		Severity = library.Severity,
		executionScopes = {
			global: {
				key: "global",
				displayName: "Global",
				description: "The Rules will be / are executed on the complete application with all loaded elements and components, including all previously loaded pages"
			},
			subtree: {
				key: "subtree",
				displayName: "Sub-tree",
				description: "The Rules will be / are executed on the specified sub-tree root element, including all child elements (aggregated sub-elements)"
			},
			components: {
				key: "components",
				displayName: "Component(s)",
				description: "The Rules will be / are executed on the selected components from the list of currently loaded components (or fragments)"
			}
		};

	var model = new JSONModel({
		selectedRule: null,
		libraries: null,
		selectedIssue: null,
		issues: [],
		progress: 0.1,
		showProgressIndicator: false,
		coreStateChanged: true,
		analyzePressed: false,
		selectedRulePreviewKey: "ruleProperties",
		selectedRuleCreateKey: "ruleProperties",
		selectedRuleEditKey: "ruleProperties",
		selectedSetPreviewKey: "availableRules",
		newRule: {},
		newRuleStringified: "",
		updateRuleStringified: "",
		subtreeExecutionContextId: "",
		availableComponents: [],
		audiences: Audiences,
		categories: Categories,
		severities: Severity,
		audiencesFilter : ["All"].concat(Object.keys(Audiences)),
		categoriesFilter : ["All"].concat(Object.keys(Categories)),
		severitiesFilter : ["All"].concat(Object.keys(Severity)),
		newEmptyRule: {
			libName: "",
			id: "",
			categories: [Categories.Other],
			audiences: [Audiences.Internal],
			title: "",
			description: "",
			resolution: "",
			resolutionurls: [],
			check: "function (oIssueManager, oCoreFacade, oScope) {\n\t/* \n\t oIssueManager - allows you to add new issues with the addIssue() method \n\t oCoreFacade - gives you access to state of the core: getMetadata(), getUIAreas(), getComponents(), getModels() \n\t oScope - retrieves elements in the scope with these methods: getElements(), getElementsByClassName(className), getLoggedObjects(type) \n\t fnResolve - optional, passed when the rule property async is set to true \n\t*/ \n}",
			selected: true,
			async: false
		},
		editRule: null,
		tempLink: {
			href: "",
			text: ""
		},
		resolveDescription: "Make sure to resolve your async rule by using the passed fnResolve function",
		selectedRuleStringify: "",
		analyzeContext: executionScopes.global,
		executionScopes: executionScopes,
		executionScopeTitle: "Execution scope",
		lastAnalysisElapsedTime: "",
		analysisDurationTitle: "Last analysis duration",
		constants: "",
		executionScopeComponents: [],
		persistingSettings: false,
		loadingAdditionalRuleSets: false,
		analyzedFinish: false,
		selectedRules: true,
		filteredIssues: null,
		issuesCount: 0,
		visibleRowCount: 5,
		supportAssistantOrigin: "",
		supportAssistantVersion: "",
		initialRulesLoading: true,
		selectionPresets: [
			{
				id: "MySelectionPreset",
				title: "My Selection",
				description: "My Current/Last Selection",
				isMySelection: true,
				selected: true,
				disableDelete: true
			}
		],
		customPresets: [
			// presets added by the user via import
		],
		// To add new System Preset include it here and follow AccessibilityPreset as template
		systemPresets: [
			{
				id: "AccessibilityPreset",
				title: "Accessibility",
				description: "Accessibility related rules",
				disableDelete: true,
				isSystemPreset: true,
				selections: [
					// Grouped by library
					// Public
					{ruleId: "dialogAriaDescribedBy", libName: "sap.m"},
					{ruleId: "onlyIconButtonNeedsTooltip", libName: "sap.m"},
					{ruleId: "inputNeedsLabel", libName: "sap.m"},
					{ruleId: "titleLevelProperty", libName: "sap.m"},
					{ruleId: "formTitleOrAriaLabel", libName: "sap.ui.layout"},
					{ruleId: "formTitleInToolbarAria", libName: "sap.ui.layout"},
					{ruleId: "formMissingLabel", libName: "sap.ui.layout"},
					{ruleId: "gridTableAccessibleLabel", libName: "sap.ui.table"},
					{ruleId: "gridTableColumnTemplateIcon", libName: "sap.ui.table"},
					{ruleId: "smartFormLabelOrAriaLabel", libName: "sap.ui.comp"},
					// Internal
					{ruleId: "icontabbarlabels", libName: "sap.m"},
					{ruleId: "labeltooltip", libName: "sap.m"},
					{ruleId: "labelfor", libName: "sap.m"},
					{ruleId: "labelInDisplayMode", libName: "sap.m"},
					{ruleId: "texttooltip", libName: "sap.m"},
					{ruleId: "rbText", libName: "sap.m"}
				]
			}
		],
		selectionPresetsCurrent: null
	});

	return model;
});
