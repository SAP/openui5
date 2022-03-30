/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.support.
 */
sap.ui.define(["sap/ui/core/library"],
	function (library1) {
	"use strict";

	/**
	 * UI5 library: sap.ui.support.
	 * A library for the Support Assistant tool.
	 * <h3>Overview</h3>
	 * The library provides the Support Assistant tool. It enables application
	 * developers to check whether their applications are built according to the
	 * best practices for building SAPUI5 apps. The tool uses a set of pre-defined
	 * rules to check all aspects of an application.
	 *
	 * @namespace
	 * @alias sap.ui.support
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.50
	 * @public
	 */
	var thisLib = sap.ui.getCore().initLibrary({
		name : "sap.ui.support",
		dependencies : ["sap.ui.core"],
		types: [
			"sap.ui.support.Severity"
		],
		interfaces: [],
		controls: [],
		elements: [],
		noLibraryCSS: true,
		version: "${version}",
		extensions: {
			//Configuration used for rule loading of Support Assistant
			"sap.ui.support": {
				internalRules:true
			}
		}
	});

	/**
	 * Defines severity types.
	 * @enum {string}
	 * @since 1.50
	 * @public
	 */
	thisLib.Severity = {
		/**
		 * Medium issue severity.
		 * @public
		 */
		Medium: "Medium",
		/**
		 * High issue severity.
		 * @public
		 */
		High: "High",
		/**
		 * Low issue severity.
		 * @public
		 */
		Low: "Low"
	};

	/**
	 * Defines the Audiences.
	 * @enum {string}
	 * @since 1.50
	 * @public
	 */
	thisLib.Audiences = {
		/**
		 * Audience just on Control level.
		 * @public
		 */
		Control: "Control",
		/**
		 * Audience just on Internal level.
		 * @public
		 */
		Internal: "Internal",
		/**
		 * Audience just on Application level.
		 * @public
		 */
		Application: "Application"
	};

	/**
	 * Issue Categories.
	 * @enum {string}
	 * @since 1.50
	 * @public
	 */
	thisLib.Categories = {
		/**
		 * Accessibility issue category.
		 * @public
		 */
		Accessibility: "Accessibility",
		/**
		 * Performance issue category.
		 * @public
		 */
		Performance: "Performance",
		/**
		 * Memory issue category.
		 * @public
		 */
		Memory: "Memory",
		/**
		 * Binding issue category.
		 * @public
		 */
		Bindings: "Bindings",
		/**
		 * Consistency issue category.
		 * @public
		 */
		Consistency: "Consistency",
		/**
		 * Fiori Guidelines issue category.
		 * @since 1.58
		 * @public
		 */
		FioriGuidelines : "FioriGuidelines",
		/**
		 * Functionality issue category.
		 * @public
		 */
		Functionality: "Functionality",
		/**
		 * Usability issue category.
		 * @public
		 */
		Usability: "Usability",
		/**
		 * DataModel issue category.
		 * @public
		 */
		DataModel: "DataModel",
		/**
		 * Modularization issue category.
		 * @since 1.60
		 * @public
		 */
		Modularization: "Modularization",
		/**
		 * Usage issue category.
		 * @public
		 */
		Usage: "Usage",
		/**
		 * Other issue category.
		 * @public
		 */
		Other: "Other"
	};

	/**
	 * Analysis history formats.
	 * @enum {string}
	 * @since 1.58
	 * @public
	 */
	thisLib.HistoryFormats = {
		/**
		 * ABAP history format.
		 * @public
		 */
		Abap: "Abap",
		/**
		 * String history format.
		 * @public
		 */
		String: "String"
	};

	/**
	 * Contains the available system presets.
	 * @enum {object}
	 * @since 1.60
	 * @public
	 */
	thisLib.SystemPresets = {
		/**
		 * The accessibility preset.
		 *
		 * @public
		 */
		Accessibility : {
			id: "Accessibility",
			title: "Accessibility",
			description: "Accessibility related rules",
			selections: [
				// Grouped by library
				// Public
				{ruleId: "dialogAriaLabelledBy", libName: "sap.m"},
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
	};

	return thisLib;
});
