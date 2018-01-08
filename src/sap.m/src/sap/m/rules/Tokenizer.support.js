/*!
 * ${copyright}
 */
/**
 * Defines support rules of the Tokenizer control of sap.m library.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/support/library"],
function(jQuery, SupportLib) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
		Severity = SupportLib.Severity,	// Hint, Warning, Error
		Audiences = SupportLib.Audiences; // Control, Internal, Application

	var oTokenizerParentRule = {
			id : "tokenizerParentRule",
			audiences: [Audiences.Application],
			categories: [Categories.Usage],
			enabled: true,
			minversion: "1.28",
			title : "Tokenizer: Tokenizer parent control",
			description : "The tokenizer can only be used as part of MultiComboBox, MultiInput or ValueHelpDialog.",
			resolution : "Do not use the Tokenizer control standalone.",
			check : function(oIssueManager, oCoreFacade, oScope) {
				var oTokenizers = oScope.getElementsByClassName("sap.m.Tokenizer"),
					bParent,
					sParentControlName,
					oParent;
				oTokenizers.forEach(function (oTokenizer) {
					oParent = oTokenizer.getParent();
					sParentControlName = oParent && oParent.getMetadata().getName();
					bParent = oParent && sParentControlName === "sap.m.MultiInput" ||
								sParentControlName === "sap.m.MultiComboBox" ||
								// Value Help Dialog uses the tokenizer in a vertical layout
								(sParentControlName === "sap.ui.layout.VerticalLayout" &&
								oParent.hasStyleClass("compVHTokenizerHLayout"));

					if (!bParent) {
						oIssueManager.addIssue({
							severity: Severity.High,
							details: "Tokenizer with id: " + oTokenizer.getId() + " is not inside a MultiComboBox, MultiInput or ValueHelpDialog",
							context: {
								id: oTokenizer.getId()
							}
						});
					}
				});
			}
		};

	return [oTokenizerParentRule];
}, true);