/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";

	var executionScopes = {
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
		audiences: sap.ui.support.Audiences,
		categories: sap.ui.support.Categories,
		severities: sap.ui.support.Severity,
		audiencesFilter : ["All"].concat(Object.keys(sap.ui.support.Audiences)),
		categoriesFilter : ["All"].concat(Object.keys(sap.ui.support.Categories)),
		severitiesFilter : ["All"].concat(Object.keys(sap.ui.support.Severity)),
		newEmptyRule: {
			libName: "",
			id: "",
			categories: [sap.ui.support.Categories.Other],
			audiences: [sap.ui.support.Audiences.Internal],
			title: "",
			description: "",
			resolution: "",
			resolutionurls: [],
			check: "function(oIssueManager, oCoreFacade, oScope) {\n\t/* \n\t oIssueManager - allows you to add new issues with the addIssue() method \n\t oCoreFacade - gives you access to state of the core: getMetadata(), getUIAreas(), getComponents(), getModels() \n\t oScope - retrieves elements in the scope with these methods: getElements(), getElementsByClassName(className), getLoggedObjects(type) \n\t*/ \n}",
			selected: true
		},
		editRule: null,
		tempLink: {
			href: "",
			text: ""
		},
		selectedRuleStringify: "",
		analyzeContext: executionScopes.global,
		executionScopes: executionScopes,
		executionScopeTitle: "Execution scope",
		lastAnalysisElapsedTime: "",
		analysisDurationTitle: "Last analysis duration",
		costants: "",
		executionScopeComponents: [],
		persistingSettings: false,
		loadingAdditionalRuleSets: false,
		analyzedFinish: false,
		selectedRules: true
	});

	return model;
});
