/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/library',
	'sap/ui/layout/library',
	'sap/ui/layout/form/Form',
	'sap/ui/core/IconPool' // as RenderManager.icon needs it
	], function(coreLibrary, library, Form) {
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
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.layout.form.FormLayout} oLayout an object representation of the control that should be rendered
	 */
	FormLayoutRenderer.render = function(rm, oLayout){
		var oForm = oLayout.getParent();
		if (oForm && oForm instanceof Form) {
			this.renderForm(rm, oLayout, oForm);
		}

	};

	/**
	 * Renders the HTML for the given form content, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.layout.form.FormLayout} oLayout an object representation of the Layout control that should be rendered
	 * @param {sap.ui.layout.form.Form} oForm a form control to render its content
	 */
	FormLayoutRenderer.renderForm = function(rm, oLayout, oForm){

		var oToolbar = oForm.getToolbar();

		rm.openStart("div", oLayout);
		rm.class(this.getMainClass());
		if (oToolbar) {
			rm.class("sapUiFormToolbar");
		}
		this.addBackgroundClass(rm, oLayout);
		rm.openEnd();

		// Form header
		this.renderHeader(rm, oToolbar, oForm.getTitle(), undefined, false, oLayout._sFormTitleSize, oForm.getId());

		this.renderContainers(rm, oLayout, oForm);

		rm.close("div");
	};

	FormLayoutRenderer.getMainClass = function(){
		return "sapUiFormLayout";
	};

	FormLayoutRenderer.addBackgroundClass = function(rm, oLayout){

		var sBackgroundDesign = oLayout.getBackgroundDesign();
		if (sBackgroundDesign != BackgroundDesign.Transparent) {
			rm.class("sapUiFormBackgr" + sBackgroundDesign);
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

		rm.openStart("section", oContainer);
		rm.class("sapUiFormContainer");

		if (oToolbar) {
			rm.class("sapUiFormContainerToolbar");
		} else if (oTitle) {
			rm.class("sapUiFormContainerTitle");
		}

		if (oContainer.getTooltip_AsString()) {
			rm.attr('title', oContainer.getTooltip_AsString());
		}

		this.writeAccessibilityStateContainer(rm, oContainer);

		rm.openEnd();

		this.renderHeader(rm, oToolbar, oTitle, oContainer._oExpandButton, bExpandable, oLayout._sFormSubTitleSize, oContainer.getId());

		if (bExpandable) {
			rm.openStart("div", oContainer.getId() + "-content");
			if (!oContainer.getExpanded()) {
				rm.style("display", "none");
			}
			rm.openEnd();
		}

		var aElements = oContainer.getVisibleFormElements();
		for (var j = 0, jl = aElements.length; j < jl; j++) {
			var oElement = aElements[j];
			this.renderElement(rm, oLayout, oElement);
		}

		if (bExpandable) {
			rm.close("div");
		}
		rm.close("section");

	};

	FormLayoutRenderer.renderElement = function(rm, oLayout, oElement){

		var oLabel = oElement.getLabelControl();

		rm.openStart("div", oElement);
		rm.class("sapUiFormElement");
		if (oLabel) {
			rm.class("sapUiFormElementLbl");
		}
		rm.openEnd();

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
		rm.close("div");

	};

	/**
	 * Renders the title for a <code>Form</code> or a <code>FormContainer</code>
	 *
	 * If this function is overwritten in a Layout please use the right IDs to be sure aria-describedby works fine
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {string|sap.ui.core.Title} oTitle Title text or <code>Title</code> element
	 * @param {sap.ui.core.Control} [oExpandButton] Button control for expander
	 * @param {boolean} [bExpander] If <code>true</code> an expander is rendered
	 * @param {string} sLevel Level of the title. If not set <code>H5</code> is used as default
	 * @param {string} sContentId ID of the header element (<code>Form</code> or <code>FormContainer</code>)
	 */
	FormLayoutRenderer.renderTitle = function(rm, oTitle, oExpandButton, bExpander, sLevel, sContentId){

		if (oTitle) {
			if (typeof oTitle !== "string" && oTitle.getLevel() != TitleLevel.Auto) {
				sLevel = oTitle.getLevel();
			}
			if (!sLevel) {
				// use H5 as fallback -> but it should be set from outside
				sLevel = "H5";
			}

			// just reuse TextView class because there font size & co. is already defined
			if ( typeof oTitle !== "string" ) {
				rm.openStart(sLevel.toLowerCase(), oTitle);
				if (oTitle.getTooltip_AsString()) {
					rm.attr('title', oTitle.getTooltip_AsString());
				}
				if (oTitle.getEmphasized()) {
					rm.class("sapUiFormTitleEmph");
				}
			} else {
				rm.openStart(sLevel.toLowerCase(), sContentId + "--title");
			}
			rm.class("sapUiFormTitle");
			rm.class("sapUiFormTitle" + sLevel);
			if (bExpander && oExpandButton) {
				rm.class("sapUiFormTitleExpandable");
			}
			rm.openEnd();

			if (bExpander && oExpandButton) {
				rm.renderControl(oExpandButton);
			}
			if (typeof oTitle === "string") {
				// Title is just a string
				oTitle.split(/\n/).forEach(function(sLine, iIndex) {
					if ( iIndex > 0 ) {
						rm.voidStart("br").voidEnd();
					}
					rm.text(sLine);
				});
			} else {
				// title control
				var sIcon = oTitle.getIcon();

				if (sIcon) {
					var aClasses = [];
					var mAttributes = {
						"title": null // prevent default icon tooltip
					};

					mAttributes["id"] = oTitle.getId() + "-ico";
					rm.icon(sIcon, aClasses, mAttributes);
				}
				oTitle.getText().split(/\n/).forEach(function(sLine, iIndex) {
					if ( iIndex > 0 ) {
						rm.voidStart("br").voidEnd();
					}
					rm.text(sLine);
				});
			}

			rm.close(sLevel.toLowerCase());
		}

	};

	/**
	 * Renders the header, containing Toolbar or Title, for a Form or a FormContainer
	 *
	 * If this function is overwritten in a Layout please use the right IDs to be sure aria-describedby works fine
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Toolbar} [oToolbar] <code>Toolbar</code> control
	 * @param {string|sap.ui.core.Title} [oTitle] Title text or <code>Title</code> element
	 * @param {sap.ui.core.Control} [oExpandButton] Button control for expander
	 * @param {boolean} [bExpander] If <code>true</code> an expander is rendered
	 * @param {string} sLevel Level of the title.
	 * @param {string} sContentId ID of the header element (<code>Form</code> or <code>FormContainer</code>)
	 */
	FormLayoutRenderer.renderHeader = function(rm, oToolbar, oTitle, oExpandButton, bExpander, sLevel, sContentId){

		if (oToolbar) {
			rm.renderControl(oToolbar);
		} else {
			this.renderTitle(rm, oTitle, oExpandButton, bExpander, sLevel, sContentId);
		}

	};

	/*
	 * Writes the accessibility attributes for FormContainers.
	 * @param {sap.ui.core.RenderManager} rm
	 * @param {sap.ui.layout.form.FormContainer} oContainer
	 */
	FormLayoutRenderer.writeAccessibilityStateContainer = function(rm, oContainer){

		var mAriaProps = {};
		var oTitle = oContainer.getTitle();
		var oToolbar = oContainer.getToolbar();
		if (oToolbar) {
			if (!oContainer.getAriaLabelledBy() || oContainer.getAriaLabelledBy().length == 0) {
				// no aria-label -> use Title of Toolbar
				var sToolbarTitleID = library.form.FormHelper.getToolbarTitle(oToolbar);
				mAriaProps["labelledby"] = {value: sToolbarTitleID, append: true};
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

		rm.accessibilityState(oContainer, mAriaProps);

	};

	return FormLayoutRenderer;

}, /* bExport= */ true);
