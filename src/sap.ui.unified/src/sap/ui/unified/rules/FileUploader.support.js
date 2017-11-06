/*!
 * ${copyright}
 */
/**
 * Defines support rules for the FileUploader control of sap.ui.unified library.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/support/library"],
	function(jQuery, SupportLib) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
		Severity = SupportLib.Severity, // Low, Medium, High
		Audiences = SupportLib.Audiences; // Control, Internal, Application

	//**********************************************************
	// Rule Definitions
	//**********************************************************

	/**
	 * Checks if a FileUploader with disabled multipart upload also has XHR enabled
	 */
	var oMultipartFileUploaderRule = {
		id : "nonMultipartFileUploadRequiresXHR",
		audiences: [Audiences.Control],
		categories: [Categories.Usability],
		enabled: true,
		minversion: "1.28",
		title: "FileUploader: To disable multipart upload you should enable XHR",
		description: "The FileUploader 'useMultipart' property is disabled, but the required 'sendXHR' property is not enabled",
		resolution: "Either enable the 'sendXHR' property of the FileUploader or set the 'useMultipart' property to true",
		resolutionurls: [{
			text: "API Reference: FileUploader",
			href: "https://sapui5.hana.ondemand.com/#/api/sap.ui.unified.FileUploader"
		}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.unified.FileUploader")
				.forEach(function(oElement) {
					if (!oElement.getUseMultipart()
						&& !oElement.getSendXHR()) {

						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						oIssueManager.addIssue({
							severity: Severity.High,
							details: "FileUploader '" + sElementName + "' (" + sElementId + ") multipart upload cannot be disabled",
							context: {
								id: sElementId
							}
						});
					}
				});
		}
	};

	/**
	 * Checks if a FileUploader with specified <code>parameters</code> has also disabled XHR requests
	 */
	var oFileUploaderParametersRule = {
		id : "fileUploaderParametersRequireXHRDisabled",
		audiences: [Audiences.Control],
		categories: [Categories.Usability],
		enabled: true,
		minversion: "1.28",
		title: "FileUploader: XHR enabled but non-XHR parameter aggregation specified",
		description: "The FileUploader XHR is enabled but parameters are specified into the non-XHR (i.e. form-based) upload 'parameters' aggregation",
		resolution: "Either disable the 'sendXHR' property of the FileUploader, or use the 'headerParameters' aggregation to specify parameters for XHR upload",
		resolutionurls: [{
			text: "API Reference: FileUploader",
			href: "https://sapui5.hana.ondemand.com/#/api/sap.ui.unified.FileUploader"
		}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.unified.FileUploader")
				.forEach(function(oElement) {
					if (oElement.getParameters()
						&& oElement.getSendXHR()) {

						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						oIssueManager.addIssue({
							severity: Severity.High,
							details: "FileUploader '" + sElementName + "' (" + sElementId + ") has enabled XHR but specified non-XHR parameter aggregation",
							context: {
								id: sElementId
							}
						});
					}
				});
		}
	};

	/**
	 * Checks if a FileUploader with defined <code>headerParameters</code> has also enabled XHR requests
	 */
	var oFileUploaderHeaderParametersRule = {
		id : "fileUploaderHeaderParametersRequireXHREnabled",
		audiences: [Audiences.Control],
		categories: [Categories.Usability],
		enabled: true,
		minversion: "1.28",
		title: "FileUploader: XHR disabled but XHR parameter aggregation specified",
		description: "The FileUploader has specified headerParameters, but the required XHR is disabled",
		resolution: "Either enable the 'sendXHR' property of the FileUploader, or use the 'parameters' aggregation to specify parameters for form-based upload",
		resolutionurls: [{
			text: "API Reference: FileUploader",
			href: "https://sapui5.hana.ondemand.com/#/api/sap.ui.unified.FileUploader"
		}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.unified.FileUploader")
				.forEach(function(oElement) {
					if (oElement.getHeaderParameters()
						&& !oElement.getSendXHR()) {

						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						oIssueManager.addIssue({
							severity: Severity.High,
							details: "FileUploader '" + sElementName + "' (" + sElementId + ") headerParameters require XHR",
							context: {
								id: sElementId
							}
						});
					}
				});
		}
	};

	return [oMultipartFileUploaderRule, oFileUploaderParametersRule, oFileUploaderHeaderParametersRule];

}, true);
