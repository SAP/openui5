/*!
 * ${copyright}
 */
/**
 * Defines support rules related to the view.
 */
sap.ui.define(["sap/base/Log", "sap/ui/support/library", "sap/ui/core/Element", "sap/ui/thirdparty/jquery", "sap/base/util/isEmptyObject", "sap/ui/base/DataType"],
	function(Log, SupportLib, Element, jQuery, isEmptyObject, DataType) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories; // Accessibility, Performance, Memory, ...
	var Severity = SupportLib.Severity; // Hint, Warning, Error
	var Audiences = SupportLib.Audiences; // Control, Internal, Application

	var isDefaultValue = function (oPropertyMetadata, vValue) {
		if (oPropertyMetadata.defaultValue !== null) {
			return oPropertyMetadata.defaultValue === vValue;
		}

		return vValue === DataType.getType(oPropertyMetadata.type).getDefaultValue();
	};

	//**********************************************************
	// Rule Definitions
	//**********************************************************

	/**
	 * Checks for wrongly configured view namespace
	 */
	var oXMLViewWrongNamespace = {
		id: "xmlViewWrongNamespace",
		audiences: [Audiences.Application],
		categories: [Categories.Functionality],
		enabled: true,
		minversion: "-",
		title: "XML View is not configured with namespace 'sap.ui.core.mvc'",
		description: "For consistency and proper resource loading, the root node of an XML view must be configured with the namespace 'mvc'",
		resolution: "Define the XML view as '<mvc:View ...>' and configure the XML namespace as 'xmlns:mvc=\"sap.ui.core.mvc\"'",
		resolutionurls: [{
			text: "Documentation: Namespaces in XML Views",
			href: "https://sdk.openui5.org/topic/2421a2c9fa574b2e937461b5313671f0"
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			var aXMLViews = oScope.getElements().filter(function (oControl) {
				return oControl.isA("sap.ui.core.mvc.XMLView") && !oControl.isSubView();
			});

			aXMLViews.forEach(function (oXMLView) {
				if (oXMLView._xContent.namespaceURI !== "sap.ui.core.mvc") {
					var sViewName = oXMLView.getViewName().split("\.").pop();
					oIssueManager.addIssue({
						severity: Severity.Medium,
						details: "The view '" + sViewName + "' (" + oXMLView.getId() + ") is configured with namespace '" + oXMLView._xContent.namespaceURI + "' instead of 'sap.ui.core.mvc'",
						context: {
							id: oXMLView.getId()
						}
					});
				}
			});
		}
	};

	/**
	 * Checks if a default namespaces is set in an XML view
	 */
	var oXMLViewDefaultNamespace = {
		id: "xmlViewDefaultNamespace",
		audiences: [Audiences.Control, Audiences.Application],
		categories: [Categories.Performance],
		enabled: true,
		minversion: "-",
		title: "Default namespace missing in XML view",
		description: "If the default namespace is missing, the code is less readable and parsing performance may be slow",
		resolution: "Set the namespace of the control library that holds most of the controls you use as default namespace (e.g. xmlns=\"sap.m\")",
		resolutionurls: [{
			text: "Documentation: Namespaces in XML Views",
			href: "https://sdk.openui5.org/topic/2421a2c9fa574b2e937461b5313671f0"
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			var aXMLViews = oScope.getElements().filter(function (oControl) {
				return oControl.isA("sap.ui.core.mvc.XMLView") && !oControl.isSubView();
			});

			aXMLViews.forEach(function (oXMLView) {
				if (!oXMLView._xContent.attributes.getNamedItem("xmlns")) {
					var sViewName = oXMLView.getViewName().split("\.").pop();
					oIssueManager.addIssue({
						severity: Severity.Low,
						details: "The view '" + sViewName + "' (" + oXMLView.getId() + ") does not contain a default namespace",
						context: {
							id: oXMLView.getId()
						}
					});
				}
			});
		}
	};

	var oXMLViewLowerCaseControl = {
		id: "xmlViewLowerCaseControl",
		audiences: ["Control","Application"],
		categories: ["Performance"],
		enabled: true,
		minversion: "-",
		title: "Control tag in XML view starts with lower case",
		description: "Control tags with lower case cannot be loaded in Linux-based systems",
		resolution: "Start the Control tag with upper case",
		resolutionurls: [{
			text: "Documentation: SAPUI5 Control Development Guidelines",
			href: "https://sdk.openui5.org/topic/4549da61e2d949d6a3d20ad8a9d17a6f"
		}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			var aRelevantLogMessages = Log.getLogEntries().filter(function(oEntry) {
				return oEntry.component === "sap.ui.core.XMLTemplateProcessor#lowerCase";
			});
			aRelevantLogMessages.forEach(function(oMessage) {
				oIssueManager.addIssue({
					severity: Severity.High,
					details: oMessage.message,
					context: {
						id: oMessage.details
					}
				});
			});
		}
	};

	/**
	 * Checks for unused namespaces inside an XML view
	 */
	var oXMLViewUnusedNamespaces = {
		id: "xmlViewUnusedNamespaces",
		audiences: [Audiences.Control, Audiences.Application],
		categories: [Categories.Usability],
		enabled: true,
		minversion: "-",
		title: "Unused namespaces in XML view",
		description: "Namespaces that are declared but not used may confuse readers of the code",
		resolution: "Remove the unused namespaces from the view definition",
		resolutionurls: [{
			text: "Documentation: Namespaces in XML Views",
			href: "https://sdk.openui5.org/topic/2421a2c9fa574b2e937461b5313671f0"
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			var aXMLViews = oScope.getElements().filter(function (oControl) {
				return oControl.isA("sap.ui.core.mvc.XMLView");
			});

			aXMLViews.forEach(function (oXMLView) {
				for (var i = 0; i < oXMLView._xContent.attributes.length; i++) {
					var sName = oXMLView._xContent.attributes.item(i).name;
					var sLocalName = oXMLView._xContent.attributes.item(i).localName;
					var sFullName = oXMLView._xContent.attributes.item(i).value;

					// check all explicit namespaces except for the injected support namespace
					// and the mvc, because the use of mvc is checked in other rule
					if (sName.match("xmlns:")
						&& sLocalName !== "xmlns:support"
						&& sLocalName !== "mvc"
						&& sFullName.indexOf("schemas.sap.com") < 0) {
							// get the xml code of the view as a string
							var sContent = jQuery(oXMLView._xContent)[0].outerHTML;

							// check if there is a reference of this namespace inside the view
							if (!sContent.match("<" + sLocalName + ":") && !sContent.match(" " + sLocalName + ":")) {
								var sViewName = oXMLView.getViewName().split("\.").pop();
								oIssueManager.addIssue({
									severity: Severity.Medium,
									details: "View '" + sViewName + "' (" + oXMLView.getId() + ") contains an unused XML namespace '" + sLocalName + "' referencing library '" + sFullName + "'",
									context: {
										id: oXMLView.getId()
									}
								});
							}
						}
				}
			});
		}
	};

	/**
	 * Checks for deprecated properties
	 */
	var oDeprecatedPropertyRule = {
		id: "deprecatedProperty",
		audiences: [Audiences.Application],
		categories: [Categories.Functionality],
		enabled: true,
		minversion: "1.38",
		title: "Control is using deprecated property",
		description: "Using deprecated properties should be avoided, because they are not maintained anymore",
		resolution: "Refer to the API of the element which property should be used instead.",
		resolutionurls: [{
			text: "API Reference",
			href: "https://sdk.openui5.org/api/deprecated"
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName(Element).forEach(function(oElement) {

				var oMetadata = oElement.getMetadata(),
					mProperties = oMetadata.getAllProperties();

				for (var sProperty in mProperties) {
					// if property is deprecated and it is set to a different from the default value
					// Checks only the deprecated properties with defaultValue property is not null
					if (mProperties[sProperty].deprecated &&
						!isDefaultValue(mProperties[sProperty], oElement.getProperty(sProperty))) {

						oIssueManager.addIssue({
							severity: Severity.Medium,
							details: "Deprecated property '" + sProperty + "' is used for element '" + oElement.getId()
								+ "'. Default value: '" + mProperties[sProperty].defaultValue + "' and current value: '"
								+ oElement.getProperty(sProperty) + "'",
							context: {
								id: oElement.getId()
							}
						});
					}
				}
			});
		}
	};

	/**
	 * Checks for deprecated controls
	 */
	var oDeprecatedElementRule = {
		id: "deprecatedElement",
		audiences: [Audiences.Application],
		categories: [Categories.Functionality],
		enabled: true,
		minversion: "1.38",
		title: "Usage of deprecated element",
		description: "Using deprecated controls should be avoided, because they are not maintained anymore",
		resolution: "Refer to the API of the element which element should be used instead.",
		resolutionurls: [{
			text: "API Reference",
			href: "https://sdk.openui5.org/api/deprecated"
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName(Element).forEach(function(oElement) {

				var oMetadata = oElement.getMetadata();

				if (oMetadata.isDeprecated()) {
					oIssueManager.addIssue({
						severity: Severity.Medium,
						details: "Deprecated element '" + oElement.getId() + "' is used.",
						context: {
							id: oElement.getId()
						}
					});
				}
			});
		}
	};

	/**
	 * Checks for deprecated aggregations
	 */
	var oDeprecatedAggregationRule = {
		id: "deprecatedAggregation",
		audiences: [Audiences.Application],
		categories: [Categories.Functionality],
		enabled: true,
		minversion: "1.38",
		title: "Control is using deprecated aggregation",
		description: "Using deprecated aggregation should be avoided, because they are not maintained anymore",
		resolution: "Refer to the API of the element which aggregation should be used instead.",
		resolutionurls: [{
			text: "API Reference",
			href: "https://sdk.openui5.org/api/deprecated"
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName(Element).forEach(function(oElement) {

				var oMetadata = oElement.getMetadata(),
					mAggregations = oMetadata.getAllAggregations();

				for (var sAggregation in mAggregations) {
					// if aggregation is deprecated and contains elements
					if (mAggregations[sAggregation].deprecated
						&& !isEmptyObject(oElement.getAggregation(sAggregation))) {

						oIssueManager.addIssue({
							severity: Severity.Medium,
							details: "Deprecated aggregation '" + sAggregation + "' is used for element '" + oElement.getId() + "'.",
							context: {
								id: oElement.getId()
							}
						});
					}
				}
			});
		}
	};

	/**
	 * Checks for deprecated associations
	 */
	var oDeprecatedAssociationRule = {
		id: "deprecatedAssociation",
		audiences: [Audiences.Application],
		categories: [Categories.Functionality],
		enabled: true,
		minversion: "1.38",
		title: "Control is using deprecated association",
		description: "Using deprecated association should be avoided, because they are not maintained anymore",
		resolution: "Refer to the API of the element which association should be used instead.",
		resolutionurls: [{
			text: "API Reference",
			href: "https://sdk.openui5.org/api/deprecated"
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName(Element).forEach(function(oElement) {

				var oMetadata = oElement.getMetadata(),
					mAssociations = oMetadata.getAllAssociations();

				for (var sAssociation in mAssociations) {
					// if association is deprecated and set by developer
					if (mAssociations[sAssociation].deprecated
						&& !isEmptyObject(oElement.getAssociation(sAssociation))) {

						oIssueManager.addIssue({
							severity: Severity.Medium,
							details: "Deprecated association '" + sAssociation + "' is used for element '" + oElement.getId() + "'.",
							context: {
								id: oElement.getId()
							}
						});
					}
				}
			});
		}
	};

	/**
	 * Checks for deprecated events
	 */
	var oDeprecatedEventRule = {
		id: "deprecatedEvent",
		audiences: [Audiences.Application],
		categories: [Categories.Functionality],
		enabled: true,
		minversion: "1.38",
		title: "Control is using deprecated event",
		description: "Using deprecated event should be avoided, because they are not maintained anymore",
		resolution: "Refer to the API of the element which event should be used instead.",
		resolutionurls: [{
			text: "API Reference",
			href: "https://sdk.openui5.org/api/deprecated"
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName(Element).forEach(function(oElement) {

				var oMetadata = oElement.getMetadata(),
					mEvents = oMetadata.getAllEvents();

				for (var sEvent in mEvents) {
					// if event is deprecated and developer added event handler
					if (mEvents[sEvent].deprecated
						&& oElement.mEventRegistry[sEvent] && oElement.mEventRegistry[sEvent].length > 0) {

						oIssueManager.addIssue({
							severity: Severity.Medium,
							details: "Deprecated event '" + sEvent + "' is used for element '" + oElement.getId() + "'.",
							context: {
								id: oElement.getId()
							}
						});
					}
				}
			});
		}
	};

	return [
		oXMLViewWrongNamespace,
		oXMLViewDefaultNamespace,
		oXMLViewLowerCaseControl,
		oXMLViewUnusedNamespaces,
		oDeprecatedPropertyRule,
		oDeprecatedElementRule,
		oDeprecatedAggregationRule,
		oDeprecatedAssociationRule,
		oDeprecatedEventRule
	];
}, true);
