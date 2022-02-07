/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/layout/library',
	"sap/base/Log"
	], function(library, Log) {
	"use strict";


	/**
	 * Form renderer.
	 * @namespace
	 */
	var FormRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.layout.form.Form} oForm an object representation of the control that should be rendered
	 */
	FormRenderer.render = function(rm, oForm){
		var oLayout = oForm.getLayout();
		var mAriaProps = {role: "form"};

		// write only a DIV for the form and let the layout render the rest
		rm.openStart("div", oForm)
			.class("sapUiForm")
			.class("sapUiFormLblColon") // to always have the ":" at the Labels
			.attr("data-sap-ui-customfastnavgroup", "true");

		var sClass = library.form.FormHelper.addFormClass();
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
				var sToolbarTitleID = library.form.FormHelper.getToolbarTitle(oToolbar);
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

}, /* bExport= */ true);