/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/layout/library'],
	function(jQuery, library) {
	"use strict";


	/**
	 * Form renderer.
	 * @namespace
	 */
	var FormRenderer = {
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oForm an object representation of the control that should be rendered
	 */
	FormRenderer.render = function(oRenderManager, oForm){
		// convenience variable
		var rm = oRenderManager;
		var oLayout = oForm.getLayout();
		var mAriaProps = {role: "form"};

		// write only a DIV for the form and let the layout render the rest
		rm.write("<div");
		rm.writeControlData(oForm);
		rm.addClass("sapUiForm");
		rm.addClass("sapUiFormLblColon"); // to always have the ":" at the Labels
		rm.writeAttribute("data-sap-ui-customfastnavgroup", "true");

		var sClass = library.form.FormHelper.addFormClass();
		if (sClass) {
			rm.addClass(sClass);
		}

		if (oForm.getEditable()) {
			rm.addClass("sapUiFormEdit");
			rm.addClass("sapUiFormEdit-CTX");
		} else {
			mAriaProps.readonly = ""; // to prevent rendering of aria-readonly
		}

		if (oForm.getWidth()) {
			rm.addStyle("width", oForm.getWidth());
		}
		if (oForm.getTooltip_AsString()) {
			rm.writeAttributeEscaped('title', oForm.getTooltip_AsString());
		}
		rm.writeClasses();
		rm.writeStyles();

		var oTitle = oForm.getTitle();
		var oToolbar = oForm.getToolbar();
		if (oToolbar) {
			if (!oForm.getAriaLabelledBy() || oForm.getAriaLabelledBy().length == 0) {
				// no aria-label -> use complete Toolbar as fallback
				mAriaProps["labelledby"] = oToolbar.getId();
			}
		} else if (oTitle) {
			var sId = "";
			if (typeof oTitle == "string") {
				sId = oForm.getId() + "--title";
			} else {
				sId = oTitle.getId();
			}
			mAriaProps["labelledby"] = {value: sId, append: true};
		}

		rm.writeAccessibilityState(oForm, mAriaProps);

		rm.write(">");

		if (oLayout) {
			// render the layout with the content of this form control
			rm.renderControl(oLayout);
		} else {
			jQuery.sap.log.warning("Form \"" + oForm.getId() + "\" - Layout missing!", "Renderer", "Form");
		}

		rm.write("</div>");
	};

	return FormRenderer;

}, /* bExport= */ true);
