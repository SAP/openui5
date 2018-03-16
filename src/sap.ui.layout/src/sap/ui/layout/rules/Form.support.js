/*!
 * ${copyright}
 */
/**
 * Defines support rules of the Form controls of sap.ui.layout library.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/support/library"],
	function(jQuery, SupportLib) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories; // Accessibility, Performance, Memory, ...
	var Severity = SupportLib.Severity; // Hint, Warning, Error
	var Audiences = SupportLib.Audiences; // Control, Internal, Application


	//**********************************************************
	// Rule Definitions
	//**********************************************************

	/* eslint-disable no-lonely-if */

	function _isLazyInstance(oObj, sModule) {
		var fnClass = sap.ui.require(sModule);
		return oObj && typeof fnClass === 'function' && (oObj instanceof fnClass);
	}

	function isSimpleForm(oControl){
		if (oControl) {
			var oMetadata = oControl.getMetadata();
			if (oMetadata.getName() == "sap.ui.layout.form.SimpleForm") {
				return true;
			}
		}

		return false;
	}

	function isSmartForm(oControl){
		if (oControl) {
			var oMetadata = oControl.getMetadata();
			if (oMetadata.getName() == "sap.ui.comp.smartform.SmartForm" ||
					(oMetadata.getName() == "sap.m.Panel" && oControl.getParent().getMetadata().getName() == "sap.ui.comp.smartform.SmartForm")) {
				return true;
			}
		}

		return false;
	}

	var oFormResponsiveLayoutRule = {
		id: "formResponsiveLayout",
		audiences: [Audiences.Control],
		categories: [Categories.Functionality],
		enabled: true,
		minversion: "1.48",
		title: "Form: Use of ResponsiveLayout",
		description: "ResponsiveLayout should not be used any longer because of UX requirements",
		resolution: "Use the ResponsiveGridLayout instead",
		resolutionurls: [{
				text: "API Reference: Form",
				href: "https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.Form.html"
			},
			{
				text: "API Reference: SimpleForm",
				href: "https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.SimpleForm.html"
			},
			{
				text: "API Reference: ResponsiveGridLayout",
				href: "https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.ResponsiveGridLayout.html"
			}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.layout.form.Form")
				.forEach(function (oForm) {
					var oLayout = oForm.getLayout();
					if (oLayout && oLayout.getMetadata().getName() == "sap.ui.layout.form.ResponsiveLayout") {
						var oParent = oForm.getParent();
						var sId;
						var sName = "Form";

						if (isSimpleForm(oParent)) {
							sId = oParent.getId();
							sName = "SimpleForm";
						} else if (isSmartForm(oParent)) {
							// for SmartForm don't check on Form level
							return;
						} else {
							sId = oForm.getId();
						}

						oIssueManager.addIssue({
							severity: Severity.Medium,
							details: sName + " " + sId + " uses ResponsiveLayout.",
							context: {
								id: sId
							}
						});
					}
				});
		}
	};

	function checkTitleAndToolbar(oElement, sName, oIssueManager) {
		var oTitle = oElement.getTitle();
		var oToolbar = oElement.getToolbar();
		if (oTitle && oToolbar) {
			var sId = oElement.getId();

			oIssueManager.addIssue({
				severity: Severity.Medium,
				details: sName + " " + sId + " has Title and Toolbar assigned.",
				context: {
					id: sId
				}
			});
		}
	}

	var oFormTitleAndToolbarRule = {
		id: "formTitleAndToolbar",
		audiences: [Audiences.Application],
		categories: [Categories.Functionality],
		enabled: true,
		minversion: "1.48",
		title: "Form: Title and Toolbar at same time",
		description: "A Form or FormContainer can only have a Title or a Toolbar assigned, not both",
		resolution: "Use either Title or a Toolbar",
		resolutionurls: [{
				text: "API Reference: Form",
				href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.Form.html"
			},
			{
				text: "API Reference: SimpleForm",
				href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.SimpleForm.html"
			},
			{
				text: "API Reference: FormContainer",
				href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.FormContainer.html"
			}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.layout.form.Form")
			.forEach(function(oForm) {
				var oParent = oForm.getParent();
				if (isSimpleForm(oParent)){
					// check on SimpleForm
					return;
				}
				checkTitleAndToolbar(oForm, "Form", oIssueManager);
			});
			oScope.getElementsByClassName("sap.ui.layout.form.FormContainer")
			.forEach(function(oFormContainer) {
				checkTitleAndToolbar(oFormContainer, "FormContainer", oIssueManager);
			});
			oScope.getElementsByClassName("sap.ui.layout.form.SimpleForm")
			.forEach(function(oSimpleForm) {
				checkTitleAndToolbar(oSimpleForm, "SimpleForm", oIssueManager);
			});
		}
	};

	var oFormTitleOrAriaLabelRule = {
		id: "formTitleOrAriaLabel",
		audiences: [Audiences.Application],
		categories: [Categories.Accessibility],
		enabled: true,
		minversion: "1.48",
		title: "Form: Container must have a Title",
		description: "A FormContainer must have some Title information." +
		             "\n This can be a Title on the FormContainer or some Title assigned via AriaLabelledBy." +
		             "\n If no Title is assigned to the FormContainer there must be at least a Title set" +
		             " on the Form or assigned via AriaLabelledBy on the Form.",
		resolution: "Set a Title on Form or FormContainer or assign it via AriaLabelledBy",
		resolutionurls: [{
				text: "API Reference: Form",
				href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.Form.html"
			},
			{
				text: "API Reference: SimpleForm",
				href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.SimpleForm.html"
			},
			{
				text: "API Reference: FormContainer",
				href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.FormContainer.html"
			}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.layout.form.FormContainer")
			.forEach(function(oFormContainer) {
				var oForm = oFormContainer.getParent();
				if (!oForm) {
					return;
				}

				var oParent = oForm.getParent();
				var sId;
				var sName = "Form";

				if (isSimpleForm(oParent)) {
					sId = oParent.getId();
					sName = "SimpleForm";
				} else if (isSmartForm(oParent)) {
					// for SmartForm handle there
					return;
				} else {
					sId = oForm.getId();
				}

				if (!oFormContainer.getTitle() && oFormContainer.getAriaLabelledBy().length == 0 &&
						!oForm.getTitle() && oForm.getAriaLabelledBy().length == 0) {
					oIssueManager.addIssue({
						severity: Severity.High,
						details: "In " + sName + " " + sId + ", FormContainer" + oFormContainer.getId() + " has no Title assigned.",
						context: {
							id: oFormContainer.getId()
						}
					});
				}
			});
		}
	};

	function checkAllowedContent(oField, sName, oIssueManager) {
		var sId = oField.getId();
		var oMetadata = oField.getMetadata();
		if (!oMetadata.isInstanceOf("sap.ui.core.IFormContent")) {
			oIssueManager.addIssue({
				severity: Severity.High,
				details: oMetadata.getName() + " " + sId + " is not allowed as " + sName + " content.",
				context: {
					id: sId
				}
			});
		}
	}

	var oFormAllowedContentRule = {
		id: "formAllowedContent",
		audiences: [Audiences.Application],
		categories: [Categories.Usability],
		enabled: true,
		minversion: "1.48",
		title: "Form: Content not allowed",
		description: "It is not allowed to use any layout as content of a Form or nest Forms" +
		             " This leads to issues with screen reader support, keyboard support and field alignment." +
		             "\nIt is also not supported to use other unsupported controls as content of the Form" +
		             " as it is not sure this controls will meet the alingment and intartaction requirements of the Form.",
		resolution: "Use only labels and controls implementing interface sap.ui.core.IFormContent as content of a Form",
		resolutionurls: [{
				text: "API Reference: Form",
				href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.Form.html"
			},
			{
				text: "API Reference: SimpleForm",
				href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.SimpleForm.html"
			},
			{
				text: "API Reference: FormElement",
				href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.FormElement.html"
			},
			{
				text: "API Reference: IFormContent",
				href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.core.IFormContent.html"
			}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.layout.form.Form")
			.forEach(function(oForm) {
				var oParent = oForm.getParent();
				if (isSimpleForm(oParent) || isSmartForm(oParent)) {
					// for SimpleForm and SmartForm don't check on Form level
					return;
				} else {
					var aFormContainers = oForm.getFormContainers();
					for (var i = 0; i < aFormContainers.length; i++) {
						var oFormContainer = aFormContainers[i];
						var aFormElements = oFormContainer.getFormElements();
						for (var j = 0; j < aFormElements.length; j++) {
							var oFormElement = aFormElements[j];
							var aFields = oFormElement.getFields();
							for (var k = 0; k < aFields.length; k++) {
								var oField = aFields[k];
								checkAllowedContent(oField, "Form", oIssueManager);
							}
						}
					}
				}
			});
			oScope.getElementsByClassName("sap.ui.layout.form.SimpleForm")
			.forEach(function(oSimpleForm) {
				var aContent = oSimpleForm.getContent();
				for (var i = 0; i < aContent.length; i++) {
					var oField = aContent[i];
					if (!(_isLazyInstance(oField, "sap/ui/core/Title") || oField.getMetadata().isInstanceOf("sap.ui.core.Toolbar")
								|| oField.getMetadata().isInstanceOf("sap.ui.core.Label"))) {
						checkAllowedContent(oField, "SimpleForm", oIssueManager);
					}
				}
			});
			oScope.getElementsByClassName("sap.ui.comp.smartform.SmartForm")
			.forEach(function(oSmartForm) {
				var aGroups = oSmartForm.getGroups();
				for (var i = 0; i < aGroups.length; i++) {
					var oGroup = aGroups[i];
					var aGroupElements = oGroup.getGroupElements();
					for (var j = 0; j < aGroupElements.length; j++) {
						var oGroupElement = aGroupElements[j];
						var aElements = oGroupElement.getElements();
						for (var k = 0; k < aElements.length; k++) {
							var oElement = aElements[k];
							checkAllowedContent(oElement, "SmartForm", oIssueManager);
						}
					}
				}
			});
		}
	};

	function checkTitleInToolbarAria(oElement, sName, oIssueManager) {
		var oToolbar = oElement.getToolbar();

		if (oToolbar) {
			var sId = oElement.getId();
			var aAriaLabel = oElement.getAriaLabelledBy();
			var aContent;
			if (oToolbar.getContent) {
				//sap.m.Toolbar
				aContent = oToolbar.getContent();
			} else if (oToolbar.getItems) {
				//sap.ui.commons.Toolbar
				aContent = oToolbar.getItems();
			}

			for (var i = 0; i < aContent.length; i++) {
				var oControl = aContent[i];
				if (_isLazyInstance(oControl, "sap/ui/core/Title") || oControl.getMetadata().getName() == "sap.m.Title") {
					var bFound = false;
					for (var j = 0; j < aAriaLabel.length; j++) {
						var sAriaLabel = aAriaLabel[j];
						if (oControl.getId() == sAriaLabel) {
							bFound = true;
							break;
						}
					}

					if (!bFound) {
						oIssueManager.addIssue({
							severity: Severity.Medium,
							details: "in" + sName + " " + sId + " AriaLabelledBy for Title in Toolbar is missing.",
							context: {
								id: sId
							}
						});
					}
				}
			}

		}
	}

	var oFormTitleInToolbarAriaRule = {
		id: "formTitleInToolbarAria",
		audiences: [Audiences.Application],
		categories: [Categories.Accessibility],
		enabled: true,
		minversion: "1.48",
		title: "Form: Title in Toolbar needs to be set to AriaLabelledBy",
		description: "If a Toolbar is used in a Form or FormContainer and the Toolbar has a Title inside" +
		             " it must be set to AriaLabelledBy to enable screen reader support",
		resolution: "Set the Title used inside the Toolbar to AriaLabelledBy of the Form or FormContainer.",
		resolutionurls: [{
				text: "API Reference: Form",
				href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.Form.html"
			},
			{
				text: "API Reference: SimpleForm",
				href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.SimpleForm.html"
			},
			{
				text: "API Reference: FormContainer",
				href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.FormContainer.html"
			}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.layout.form.Form")
			.forEach(function(oForm) {
				var oParent = oForm.getParent();
				if (isSimpleForm(oParent)){
					// check on SimpleForm
					return;
				}
				checkTitleInToolbarAria(oForm, "Form", oIssueManager);
			});
			oScope.getElementsByClassName("sap.ui.layout.form.FormContainer")
			.forEach(function(oFormContainer) {
				var oParent = oFormContainer.getParent().getParent();
				if (isSimpleForm(oParent)){
					// can not happen in SimpleForm
					return;
				}
				checkTitleInToolbarAria(oFormContainer, "FormContainer", oIssueManager);
			});
			oScope.getElementsByClassName("sap.ui.layout.form.SimpleForm")
			.forEach(function(oSimpleForm) {
				checkTitleInToolbarAria(oSimpleForm, "SimpleForm", oIssueManager);
			});
		}
	};

	var oFormPropertiesOfOtherLayoutRule = {
		id: "formPropertiesOfOtherLayout",
		audiences: [Audiences.Application],
		categories: [Categories.Consistency],
		enabled: true,
		minversion: "1.48",
		title: "SimpleForm: Properties not valid for layout",
		description: "Some properties of SimpleForm are only valid for a special layout." +
		             " If they are used with a different layout they have no effect.",
		resolution: "Use only properties that are valid for the layout used",
		resolutionurls: [{
			text: "API Reference: SimpleForm",
			href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.SimpleForm.html"
		}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.layout.form.SimpleForm")
			.forEach(function(oSimpleForm) {
				var sId = oSimpleForm.getId();
				var sLayout = oSimpleForm.getLayout();
				var aFields = [];
				var checkProperty = function(sProperty) {
					if (!oSimpleForm.isPropertyInitial(sProperty)) {
						aFields.push(sProperty);
					}
				};

				if (sLayout != sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout &&
						sLayout != sap.ui.layout.form.SimpleFormLayout.ColumnLayout) {
					checkProperty("labelSpanL");
					checkProperty("emptySpanL");
					checkProperty("columnsXL");
					checkProperty("columnsL");
					checkProperty("columnsM");
				}

				if (sLayout != sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout) {
					checkProperty("labelSpanXL");
					checkProperty("labelSpanM");
					checkProperty("labelSpanS");
					checkProperty("adjustLabelSpan");
					checkProperty("emptySpanXL");
					checkProperty("emptySpanM");
					checkProperty("emptySpanS");
					checkProperty("singleContainerFullSize");
					checkProperty("breakpointXL");
					checkProperty("breakpointL");
					checkProperty("breakpointM");
				}

				if (sLayout != sap.ui.layout.form.SimpleFormLayout.ResponsiveLayout) {
					checkProperty("minWidth");
					checkProperty("labelMinWidth");
				}

				if (sLayout == sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout) {
					checkProperty("maxContainerCols");
				}

				for (var i = 0; i < aFields.length; i++) {
					oIssueManager.addIssue({
						severity: Severity.Low,
						details: "SimpleForm " + sId + " with Layout " + sLayout + " doesn't support use of property " + aFields[i] + ".",
						context: {id: sId}
					});
				}

			});
		}
	};

	var oFormEditableContentRule = {
		id: "formEditableContent",
		audiences: [Audiences.Application],
		categories: [Categories.Usability],
		enabled: true,
		minversion: "1.48",
		title: "Form: Editable content must match editable property",
		description: "The editable property of the Form is used to align the Labels and add screen reader information. If editable controls are used in Form, the property must be set, otherwise it should not be set.",
		resolution: "Set the editable property according to the content of the Form.",
		resolutionurls: [{
			text: "API Reference: Form",
			href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.Form.html"
		},
		{
			text: "API Reference: SimpleForm",
			href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.SimpleForm.html"
		},
		{
			text: "API Reference: FormElement",
			href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.FormElement.html"
		}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.layout.form.Form")
			.forEach(function(oForm) {
				var bEditable = oForm.getEditable();
				var oParent = oForm.getParent();
				var oMetadata = oParent ? oParent.getMetadata() : undefined;
				var sId;
				var sName = "Form";

				if (isSimpleForm(oParent)) {
					sId = oParent.getId();
					sName = "SimpleForm";
				} else if (isSmartForm(oParent)) {
					// for SmartForm SmartControls handle edit mode
					return;
				} else {
					sId = oForm.getId();
				}

				var bError = false;
				var bEditableField = false;
				var aFormContainers = oForm.getFormContainers();
				for (var i = 0; i < aFormContainers.length; i++) {
					var oFormContainer = aFormContainers[i];
					var aFormElements = oFormContainer.getFormElements();
					for (var j = 0; j < aFormElements.length; j++) {
						var oFormElement = aFormElements[j];
						var aFields = oFormElement.getFields();
						for (var k = 0; k < aFields.length; k++) {
							var oField = aFields[k];
							oMetadata = oField.getMetadata();

							if (bEditable) {
								// check if no non editable fields are used (can only check for known fields)
								if (/*_isLazyInstance(oField, "sap/m/Text") ||
										_isLazyInstance(oField, "sap/m/Link") ||*/
										_isLazyInstance(oField, "sap/ui/core/Icon") ||
										/*_isLazyInstance(oField, "sap/m/Image") ||
										_isLazyInstance(oField, "sap/m/ObjectNumber") ||
										_isLazyInstance(oField, "sap/m/ObjectStatus") ||*/
										(oMetadata.hasProperty("displayOnly") && oField.getDisplayOnly())){
									bError = true;
									break;
								}
							}
							// check if editable fields are used (can only check for known fields)
							if (_isLazyInstance(oField, "sap/m/InputBase") ||
									_isLazyInstance(oField, "sap/m/CheckBox") ||
									_isLazyInstance(oField, "sap/m/RadioButton") ||
									_isLazyInstance(oField, "sap/m/RadioButtonGroup") ||
									(_isLazyInstance(oField, "sap/m/Button") && oFormElement.getLabel()) || //allow buttons only without label
									_isLazyInstance(oField, "sap/m/Slider") ||
									(oMetadata.hasProperty("displayOnly") && !oField.getDisplayOnly())) {
								bEditableField = true;
								if (!bEditable) {
									// in display mode no editable fields are allowed
									bError = true;
									break;
								}
							}
						}
						if (bError) {
							break;
						}
					}
					if (!bError && bEditable && !bEditableField) {
						// if editable, at least one editable field must exist
						bError = true;
					}
				}

				if (bError) {
					if (bEditable) {
						oIssueManager.addIssue({
							severity: Severity.High,
							details: sName + " " + sId + " is set to editable but has only non-editable content.",
							context: {
								id: sId
							}
						});
					} else {
						oIssueManager.addIssue({
							severity: Severity.High,
							details: sName + " " + sId + " is set to non-editable but has editable content.",
							context: {
								id: sId
							}
						});
					}
				}
			});
		}
	};

	function checkLayoutData(oElement, sName, sFormId, oLayout, oLayoutData, oIssueManager) {

		var sLayout = oLayout.getMetadata().getName();
		var sLayoutData = oLayoutData.getMetadata().getName();
		var sElement = oElement.getMetadata().getName();
		var sId = oElement.getId();
		var bWrong = false;
		var bUnsupported = false;

		switch (sLayout) {
		case "sap.ui.layout.form.ResponsiveGridLayout":
			if (sLayoutData != "sap.ui.layout.GridData") {
				bWrong = true;
			} else if (sElement == "sap.ui.layout.form.FormElement") {
				bUnsupported = true;
			}
			break;

		case "sap.ui.layout.form.ResponsiveLayout":
			if (sLayoutData != "sap.ui.layout.ResponsiveFlowLayoutData") {
				bWrong = true;
			}
			break;

		case "sap.ui.layout.form.GridLayout":
			if (sLayoutData != "sap.ui.layout.form.GridElementData") {
				if (!(sElement == "sap.ui.layout.form.FormContainer" && sLayoutData == "sap.ui.layout.form.GridContainerData")) {
					bWrong = true;
				}
			} else if (sElement == "sap.ui.layout.form.FormElement") {
				bUnsupported = true;
			}
			break;

		case "sap.ui.layout.form.ColumnLayout":
			if (sLayoutData != "sap.ui.layout.form.ColumnElementData") {
				if (!(sElement == "sap.ui.layout.form.FormContainer" && sLayoutData == "sap.ui.layout.form.ColumnContainerData")) {
					bWrong = true;
				}
			} else if (sElement == "sap.ui.layout.form.FormElement" || sElement == "sap.ui.layout.form.FormContainer") {
				bUnsupported = true;
			}
			break;

		default:
			break;
		}

		if (bWrong) {
			oIssueManager.addIssue({
				severity: Severity.Low,
				details: sName + " " + sFormId + " uses " + sLayout + ", therefore " + sLayoutData + " is not supported on " + sElement + " " + sId + ".",
				context: {
					id: sId
				}
			});
		}

		if (bUnsupported) {
			oIssueManager.addIssue({
				severity: Severity.Low,
				details: sName + " " + sFormId + " uses " + sLayout + ", but " + sLayoutData + " is not supported on " + sElement + " " + sId + ".",
				context: {
					id: sId
				}
			});
		}
	}

	function checkLayoutDataOfElement(oElement, sName, sFormId, oLayout, oIssueManager) {

		var oLayoutData = oElement.getLayoutData();
		if (oLayoutData) {
			if (oLayoutData.getMetadata().getName() == "sap.ui.core.VariantLayoutData") {
				var aLayoutData = oLayoutData.getMultipleLayoutData();
				for ( var l = 0; l < aLayoutData.length; l++) {
					oLayoutData = aLayoutData[l];
					checkLayoutData(oElement, sName, sFormId, oLayout, oLayoutData, oIssueManager);
				}
			} else {
				checkLayoutData(oElement, sName, sFormId, oLayout, oLayoutData, oIssueManager);
			}
		}
	}

	var oFormWrongLayoutDataRule = {
		id: "formWrongLayoutData",
		audiences: [Audiences.Application],
		categories: [Categories.Consistency],
		enabled: true,
		minversion: "1.48",
		title: "Form: LayoutData assigned to Form content not valid for layout",
		description: "Layout data on Form content can be used to influence the appearance of Form. Depending on the layout used, different LayoutData can be used.",
		resolution: "Use only valid LayoutData that are suitable for the layout used",
		resolutionurls: [{
			text: "API Reference: ResponsiveGridLayout",
			href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.ResponsiveGridLayout.html"
		},
		{
			text: "API Reference: ResponsiveLayout",
			href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.ResponsiveLayout.html"
		}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.layout.form.Form")
			.forEach(function(oForm) {
				var oLayout = oForm.getLayout();
				var oParent = oForm.getParent();
				var sId;
				var sName = "Form";

				if (isSimpleForm(oParent)) {
					sId = oParent.getId();
					sName = "SimpleForm";
				} else if (isSmartForm(oParent)) {
					sId = oParent.getId();
					sName = "SmartForm";
				} else {
					sId = oForm.getId();
				}

				var aFormContainers = oForm.getFormContainers();
				for (var i = 0; i < aFormContainers.length; i++) {
					var oFormContainer = aFormContainers[i];
					var aFormElements = oFormContainer.getFormElements();

					checkLayoutDataOfElement(oFormContainer, sName, sId, oLayout, oIssueManager);

					for (var j = 0; j < aFormElements.length; j++) {
						var oFormElement = aFormElements[j];
						var aFields = oFormElement.getFields();

						checkLayoutDataOfElement(oFormElement, sName, sId, oLayout, oIssueManager);

						for (var k = 0; k < aFields.length; k++) {
							var oField = aFields[k];
							checkLayoutDataOfElement(oField, sName, sId, oLayout, oIssueManager);
						}
					}
				}

			});
		}
	};

	var oFormMissingLabelRule = {
		id: "formMissingLabel",
		audiences: [Audiences.Application],
		categories: [Categories.Accessibility],
		enabled: true,
		minversion: "1.48",
		title: "Form: Label for Form content missing",
		description: "For accessibility reasons, each field must have a label." +
		             " \n If Label is assigned to FormElement, it will be automatically assigned to the corresponding fields." +
		             " \n But if no Label is assigned to FormElement, the application must use the ariaLabelledBy property of the field to assign a label.",
		resolution: "Assign a label to the field",
		resolutionurls: [{
			text: "API Reference: Form",
			href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.Form.html"
		},
		{
			text: "API Reference: SimpleForm",
			href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.SimpleForm.html"
		},
		{
			text: "API Reference: FormElement",
			href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.FormElement.html"
		}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.layout.form.Form")
			.forEach(function(oForm) {
				var oParent = oForm.getParent();
				var oMetadata = oParent ? oParent.getMetadata() : undefined;
				var sId;
				var sName = "Form";

				if (isSimpleForm(oParent)) {
					sId = oParent.getId();
					sName = "SimpleForm";
				} else if (isSmartForm(oParent)) {
					return; // as in SmartForm Labels are created for SmartFields there must no explicit Label set
				} else {
					sId = oForm.getId();
				}

				var aFormContainers = oForm.getFormContainers();
				for (var i = 0; i < aFormContainers.length; i++) {
					var oFormContainer = aFormContainers[i];
					if (oFormContainer.getVisible() && oFormContainer.getExpanded()) {
						var aFormElements = oFormContainer.getFormElements();
						for (var j = 0; j < aFormElements.length; j++) {
							var oFormElement = aFormElements[j];
							var oLabel = oFormElement.getLabel();
							if (!oLabel && oFormElement.getVisible()) {
								var aFields = oFormElement.getFields();
								for (var k = 0; k < aFields.length; k++) {
									var oField = aFields[k];
									var sFieldId = oField.getId();
									oMetadata = oField.getMetadata();
									if (oMetadata.getAssociation("ariaLabelledBy") &&
											(!oField.getAriaLabelledBy() || oField.getAriaLabelledBy().length == 0) &&
											!_isLazyInstance(oField, "sap/m/Button") &&
											!(_isLazyInstance(oField, "sap/m/CheckBox") && oField.getText()) &&
											!(_isLazyInstance(oField, "sap/m/RadioButton") && oField.getText())) {
										oIssueManager.addIssue({
											severity: Severity.High,
											details: "In " + sName + " " + sId + ", no label has been assigned to field " + oMetadata.getName() + " " + sFieldId + ".",
											context: {
												id: sFieldId
											}
										});
									}
								}
							}
						}
					}
				}
			});
		}
	};

	var oFormLabelAsFieldRule = {
		id: "formLabelAsField",
		audiences: [Audiences.Application],
		categories: [Categories.Usability],
		enabled: true,
		minversion: "1.48",
		title: "Form: Label is used as field",
		description: "FormElements can have Labels and Fields." +
		             " \n Depending on the layout used and device and screen sizes, the way labels and fields are shown might differ." +
		             " \n If labels are used as fields, this will lead to misaligned fields and labels in the Form and might have an effect on the screen reader support.",
		resolution: "Use Labels only in the Label aggregation",
		resolutionurls: [{
			text: "API Reference: Form",
			href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.Form.html"
		},
		{
			text: "API Reference: FormElement",
			href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.FormElement.html"
		}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.layout.form.Form")
			.forEach(function(oForm) {
				var oParent = oForm.getParent();
				var oMetadata = oParent ? oParent.getMetadata() : undefined;
				var sId;
				var sName = "Form";

				if (isSimpleForm(oParent)) {
					// could not happen in SimleForm
					return;
				} else if (isSmartForm(oParent)) {
					sId = oParent.getId();
					sName = "SmartForm";
				} else {
					sId = oForm.getId();
				}

				var aFormContainers = oForm.getFormContainers();
				for (var i = 0; i < aFormContainers.length; i++) {
					var oFormContainer = aFormContainers[i];
					var aFormElements = oFormContainer.getFormElements();
					for (var j = 0; j < aFormElements.length; j++) {
						var oFormElement = aFormElements[j];
						var aFields = oFormElement.getFields();
						for (var k = 0; k < aFields.length; k++) {
							var oField = aFields[k];
							var sFieldId = oField.getId();
							oMetadata = oField.getMetadata();
							if (oMetadata.isInstanceOf("sap.ui.core.Label")){
								oIssueManager.addIssue({
									severity: Severity.High,
									details: sName + " " + sId + ": " + oMetadata.getName() + " " + sFieldId + " is used as field.",
									context: {
										id: sFieldId
									}
								});
							}
						}
					}
				}
			});
		}
	};

	return [
		oFormResponsiveLayoutRule,
		oFormTitleAndToolbarRule,
		oFormTitleOrAriaLabelRule,
		oFormAllowedContentRule,
		oFormTitleInToolbarAriaRule,
		oFormPropertiesOfOtherLayoutRule,
		oFormEditableContentRule,
		oFormWrongLayoutDataRule,
		oFormMissingLabelRule,
		oFormLabelAsFieldRule
	];

}, true);