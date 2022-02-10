/*!
 * ${copyright}
 */
/**
 * Defines support rules of the Select control of sap.m library.
 */
sap.ui.define(["sap/ui/support/library", "sap/ui/model/BindingMode"],
	function(SupportLib, BindingMode) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
		Severity = SupportLib.Severity, // Low, Medium, High
		Audiences = SupportLib.Audiences; // Control, Internal, Application

	// const
	var DEFAULT_MODEL_SIZE_LIMIT = 100;

	//**********************************************************
	// Rule Definitions
	//**********************************************************

	/**
	 *Checks if the 'items' aggregation binding of sap.m.Select is limited to 100 items
	 */
	var oSelectRule = {
		id : "selectItemsSizeLimit",
		audiences: [Audiences.Control],
		categories: [Categories.Usability],
		enabled: true,
		minversion: "1.28",
		title: "Select: Items have size limit of 100",
		description: "The 'items' model imposes a default size limit of 100",
		resolution: "Use the sap.ui.model.Model.prototype.setSizeLimit to adjust the size limit of the 'items' model if you expect more than 100 items",
		resolutionurls: [{
			text: "API Reference for sap.ui.model.Model",
			href: "https://openui5.hana.ondemand.com/api/sap.ui.model.Model"
		}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.Select")
				.forEach(function(oElement) {

					var oBinding = oElement.getBinding("items"),
						oModel = oBinding && oBinding.oModel;

					if (oModel && (oModel.iSizeLimit === DEFAULT_MODEL_SIZE_LIMIT)) {

						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						oIssueManager.addIssue({
							severity: Severity.Low,
							details: "Select '" + sElementName + "' (" + sElementId + ") model has a default limit of 100 items",
							context: {
								id: sElementId
							}
						});
					}
				});
		}
	};

	var oSelectedKeyBindingRule = {
		id: "selectedKeyBindingRule",
		audiences: [Audiences.Control],
		categories: [Categories.Bindings],
		enabled: true,
		minversion: "1.64",
		title: "Select: 'selectedKey' property incorrectly bound to item which is bound to the 'items' aggregation",
		description: "Binding the 'selectedKey' property to the 'items' aggregation results in a non-working Select " +
			"control in TwoWay binding mode. When the user changes the selected item, the key of the bound item " +
			"(under the list bound to the 'items' aggregation) also changes, resulting in an incorrect change of the " +
			"selected item.",
		resolution: "If binding of 'selectedKey' is necessary, bind it to a model entry which is not bound to the " +
			"'items' aggregation of the Select control.",
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.Select")
				.forEach(function(oElement) {
					var sElementId,
						sElementName,
						oSelectedKeyModel,
						oItemsModel,
						sSelectedKeyBindingPath,
						sItemsBindingPath,
						sSelectedKeyMinusItemsBindingPath;

					if (
						oElement.isBound("selectedKey") &&
						oElement.isBound("items")
					) { // Both metadata entries are bound

						oSelectedKeyModel = oElement.getBinding("selectedKey").getModel();
						oItemsModel = oElement.getBinding("items").getModel();

						if (
							oSelectedKeyModel && // We have a model for the selectedKey
							oItemsModel && // We have a model for the items
							oSelectedKeyModel.getId() === oItemsModel.getId() && // Both entries are bound to the same model
							oSelectedKeyModel.getDefaultBindingMode() === BindingMode.TwoWay // Model is in TwoWay binding mode
						) {

							sSelectedKeyBindingPath = oElement.getBindingPath("selectedKey");
							sItemsBindingPath = oElement.getBindingPath("items");
							sSelectedKeyMinusItemsBindingPath = sSelectedKeyBindingPath.replace(sItemsBindingPath, "");

							// We will check that the binding path of the "selectedKey" is not a child of the "items"
							// binding path
							//
							// For example:
							// * "selectedKey" bindingPath equals "/ProductCollection/1/ProductId"
							// * "items" bindingPath equals "/ProductCollection"
							// * Subtracting "items" from "selectedKey" binding path should remain "/1/ProductId"
							if (
								sSelectedKeyBindingPath.indexOf(sItemsBindingPath) === 0 && // "selectedKey" starts with "items" binding path
								sSelectedKeyMinusItemsBindingPath.length > 0 && // "selectedKey" is longer than "items" binding path
								sSelectedKeyMinusItemsBindingPath[0] === "/" // remaining binding path starts with slash
							) {
								sElementId = oElement.getId();
								sElementName = oElement.getMetadata().getElementName();

								oIssueManager.addIssue({
									severity: Severity.High,
									details: "Select '" + sElementName + "' (" + sElementId + ") 'selectedKey' property incorrectly bound to item which is bound to the 'items' aggregation",
									context: {
										id: sElementId
									}
								});
							}

						}

					}

				});
		}
	};

	return [
		oSelectRule,
		oSelectedKeyBindingRule
	];

}, true);
