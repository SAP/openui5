/*!
 * ${copyright}
 */

sap.ui.define([
	'./FormHelper',
	'sap/base/Log'
	], function(FormHelper, Log) {
	"use strict";


	/**
	 * Form renderer.
	 * @namespace
	 */
	var FormRenderer = {
		apiVersion: 2
	};


	/*
	 * Form ARIA-Rendering:
	 * The Form itself should be rendered as role "region" and the fingle FormContainers (that will at the end have the labels and fields)
	 * should be rendered with role "form".
	 * Only if there is only one FormContainer without title (or other label) the Form itself renders with role "form" and the FormContainer
	 * renders without any role.
	 * For FormLayouts what renders FormContainers without any role (other Layout-controls) used. The Form needs to render role "form".
	 * At the end role "form" needs to be somewhere araund the labels and fields.
	 */

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.layout.form.Form} oForm an object representation of the control that should be rendered
	 */
	FormRenderer.render = function(rm, oForm){
		const oLayout = oForm.getLayout();
		const mAriaProps = {role: oLayout && oLayout.hasLabelledContainers(oForm) ? "region" : "form"};

		// write only a DIV for the form and let the layout render the rest
		rm.openStart("div", oForm)
			.class("sapUiForm")
			.class("sapUiFormLblColon") // to always have the ":" at the Labels
			.attr("data-sap-ui-customfastnavgroup", "true");

		var sClass = FormHelper.addFormClass(); // FormHelper must already be initialized by Form
		if (sClass) {
			rm.class(sClass);
		}

		if (oForm.getEditable()) {
			rm.class("sapUiFormEdit");
			rm.class("sapUiFormEdit-CTX");
		} else {
			mAriaProps.readonly = ""; // to prevent rendering of aria-readonly
		}

		if (oForm.getWidth()) {
			rm.style("width", oForm.getWidth());
		}
		if (oForm.getTooltip_AsString()) {
			rm.attr('title', oForm.getTooltip_AsString());
		}

		var oTitle = oForm.getTitle();
		var oToolbar = oForm.getToolbar();
		if (oToolbar) {
			if (!oForm.getAriaLabelledBy() || oForm.getAriaLabelledBy().length == 0) {
				// no aria-label -> use Title of Toolbar
				var sToolbarTitleID = FormHelper.getToolbarTitle(oToolbar); // FormHelper must already be initialized by Form
				mAriaProps["labelledby"] = sToolbarTitleID;
			}
		} else if (oTitle) {
			var sId = "";
			if (typeof oTitle == "string") {
				sId = oForm.getId() + "--title";
			} else {
				sId = oTitle.getId();
			}
			mAriaProps["labelledby"] = {value: sId, append: true};
		} else if (oForm._sSuggestedTitleId) {
			mAriaProps["labelledby"] = {value: oForm._sSuggestedTitleId, append: true};
		}

		rm.accessibilityState(oForm, mAriaProps);

		rm.openEnd();

		if (oLayout) {
			// render the layout with the content of this form control
			rm.renderControl(oLayout);
		} else {
			Log.warning("Form \"" + oForm.getId() + "\" - Layout missing!", "Renderer", "Form");
		}

		rm.close("div");
	};

	return FormRenderer;

});