/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/library',
	'sap/ui/core/theming/Parameters',
	'sap/ui/layout/library',
	'sap/ui/layout/form/Form'
	], function(coreLibrary, themingParameters, library, Form) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	// shortcut for sap.ui.layout.BackgroundDesign
	var BackgroundDesign = library.BackgroundDesign;

	/**
	 * FormLayout renderer.
	 * @namespace
	 */
	var FormLayoutRenderer = {
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oLayout an object representation of the control that should be rendered
	 */
	FormLayoutRenderer.render = function(oRenderManager, oLayout){
		// convenience variable
		var rm = oRenderManager;

		var oForm = oLayout.getParent();
		if (oForm && oForm instanceof Form) {
			this.renderForm(rm, oLayout, oForm);
		}

	};

	/**
	 * Renders the HTML for the given form content, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oLayout an object representation of the Layout control that should be rendered
	 * @param {sap.ui.layout.form.Form} oForm, a form control to render its content
	 */
	FormLayoutRenderer.renderForm = function(rm, oLayout, oForm){

		var oToolbar = oForm.getToolbar();

		rm.write("<div");
		rm.writeControlData(oLayout);
		rm.addClass(this.getMainClass());
		if (oToolbar) {
			rm.addClass("sapUiFormToolbar");
		}
		this.addBackgroundClass(rm, oLayout);
		rm.writeClasses();
		rm.write(">");

		// Form header
		var sSize;
		if (!oToolbar) {
			sSize = themingParameters.get('sap.ui.layout.FormLayout:_sap_ui_layout_FormLayout_FormTitleSize');
		}
		this.renderHeader(rm, oToolbar, oForm.getTitle(), undefined, false, sSize, oForm.getId());

		this.renderContainers(rm, oLayout, oForm);

		rm.write("</div>");
	};

	FormLayoutRenderer.getMainClass = function(){
		return "sapUiFormLayout";
	};

	FormLayoutRenderer.addBackgroundClass = function(rm, oLayout){

		var sBackgroundDesign = oLayout.getBackgroundDesign();
		if (sBackgroundDesign != BackgroundDesign.Transparent) {
			rm.addClass("sapUiFormBackgr" + sBackgroundDesign);
		}

	};

	FormLayoutRenderer.renderContainers = function(rm, oLayout, oForm){

		var aContainers = oForm.getVisibleFormContainers();
		for (var i = 0, il = aContainers.length; i < il; i++) {
			var oContainer = aContainers[i];
			this.renderContainer(rm, oLayout, oContainer);
		}

	};

	FormLayoutRenderer.renderContainer = function(rm, oLayout, oContainer){

		var bExpandable = oContainer.getExpandable();
		var oToolbar = oContainer.getToolbar();
		var oTitle = oContainer.getTitle();

		rm.write("<section");
		rm.writeElementData(oContainer);
		rm.addClass("sapUiFormContainer");

		if (oToolbar) {
			rm.addClass("sapUiFormContainerToolbar");
		} else if (oTitle) {
			rm.addClass("sapUiFormContainerTitle");
		}

		if (oContainer.getTooltip_AsString()) {
			rm.writeAttributeEscaped('title', oContainer.getTooltip_AsString());
		}
		rm.writeClasses();

		this.writeAccessibilityStateContainer(rm, oContainer);

		rm.write(">");

		this.renderHeader(rm, oToolbar, oTitle, oContainer._oExpandButton, bExpandable, TitleLevel.H4, oContainer.getId());

		if (bExpandable) {
			rm.write("<div id='" + oContainer.getId() + "-content'");
			if (!oContainer.getExpanded()) {
				rm.addStyle("display", "none");
				rm.writeStyles();
			}
			rm.write(">");
		}

		var aElements = oContainer.getVisibleFormElements();
		for (var j = 0, jl = aElements.length; j < jl; j++) {
			var oElement = aElements[j];
			this.renderElement(rm, oLayout, oElement);
		}

		if (bExpandable) {
			rm.write("</div>");
		}
		rm.write("</section>");

	};

	FormLayoutRenderer.renderElement = function(rm, oLayout, oElement){

		var oLabel = oElement.getLabelControl();

		rm.write("<div");
		rm.writeElementData(oElement);
		rm.addClass("sapUiFormElement");
		if (oLabel) {
			rm.addClass("sapUiFormElementLbl");
		}
		rm.writeClasses();
		rm.write(">");

		if (oLabel) {
			rm.renderControl(oLabel);
		}

		var aFields = oElement.getFieldsForRendering();
		if (aFields && aFields.length > 0) {
			for (var k = 0, kl = aFields.length; k < kl; k++) {
				var oField = aFields[k];
				rm.renderControl(oField);
			}
		}
		rm.write("</div>");

	};

	/*
	 * Renders the title for a Form or a FormContainer
	 * If this function is overwritten in a Layout please use the right IDs to be sure aria-describedby works fine
	 */
	FormLayoutRenderer.renderTitle = function(rm, oTitle, oExpandButton, bExpander, sLevelDefault, sContentId){

		if (oTitle) {
			//determine title level -> if not set use H4 as default
			var sLevel = themingParameters.get('sap.ui.layout.FormLayout:_sap_ui_layout_FormLayout_FormSubTitleSize');
			if (sLevelDefault) {
				sLevel = sLevelDefault;
			}
			if (typeof oTitle !== "string" && oTitle.getLevel() != TitleLevel.Auto) {
				sLevel = oTitle.getLevel();
			}

			// just reuse TextView class because there font size & co. is already defined
			rm.write("<" + sLevel + " ");
			rm.addClass("sapUiFormTitle");
			rm.addClass("sapUiFormTitle" + sLevel);

			if (typeof oTitle !== "string") {
				rm.writeElementData(oTitle);
				if (oTitle.getTooltip_AsString()) {
					rm.writeAttributeEscaped('title', oTitle.getTooltip_AsString());
				}
				if (oTitle.getEmphasized()) {
					rm.addClass("sapUiFormTitleEmph");
				}
			} else {
				rm.writeAttribute("id", sContentId + "--title");
			}
			rm.writeClasses();
			rm.write(">");

			if (bExpander && oExpandButton) {
				rm.renderControl(oExpandButton);
			}
			if (typeof oTitle === "string") {
				// Title is just a string
				rm.writeEscaped(oTitle, true);
			} else {
				// title control
				var sIcon = oTitle.getIcon();

				if (sIcon) {
					var aClasses = [];
					var mAttributes = {
						"title": null // prevent default icon tooltip
					};

					mAttributes["id"] = oTitle.getId() + "-ico";
					rm.writeIcon(sIcon, aClasses, mAttributes);
				}
				rm.writeEscaped(oTitle.getText(), true);
			}

			rm.write("</" + sLevel + ">");
		}

	};

	/*
	 * Renders the header, containing Toolbar or Title, for a Form or a FormContainer
	 * If this function is overwritten in a Layout please use the right IDs to be sure aria-describedby works fine
	 */
	FormLayoutRenderer.renderHeader = function(rm, oToolbar, oTitle, oExpandButton, bExpander, sLevelDefault, sContentId){

		if (oToolbar) {
			rm.renderControl(oToolbar);
		} else {
			this.renderTitle(rm, oTitle, oExpandButton, bExpander, sLevelDefault, sContentId);
		}

	};

	/*
	 * Writes the accessibility attributes for FormContainers
	 */
	FormLayoutRenderer.writeAccessibilityStateContainer = function(rm, oContainer){

		var mAriaProps = {};
		var oTitle = oContainer.getTitle();
		var oToolbar = oContainer.getToolbar();
		if (oToolbar) {
			if (!oContainer.getAriaLabelledBy() || oContainer.getAriaLabelledBy().length == 0) {
				// no aria-label -> use complete Toolbar as fallback
				mAriaProps["labelledby"] = {value: oToolbar.getId(), append: true};
			}
		} else if (oTitle) {
			var sId = "";
			if (typeof oTitle == "string") {
				sId = oContainer.getId() + "--title";
			} else {
				sId = oTitle.getId();
			}
			mAriaProps["labelledby"] = {value: sId, append: true};
		}

		if (mAriaProps["labelledby"] || oContainer.getAriaLabelledBy().length > 0) {
			// if no title or label do not set role because of JAWS 18 issues
			mAriaProps["role"] = "form";
		}

		rm.writeAccessibilityState(oContainer, mAriaProps);

	};

	return FormLayoutRenderer;

}, /* bExport= */ true);
