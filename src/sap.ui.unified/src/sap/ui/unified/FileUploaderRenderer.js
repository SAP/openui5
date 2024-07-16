/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.unified.FileUploader
sap.ui.define(['sap/ui/unified/library', "sap/ui/thirdparty/jquery", "sap/ui/unified/FileUploaderHelper"], function(library, jQuery, FileUploaderHelper) {
"use strict";


/**
 * @namespace
 */
var FileUploaderRenderer = {};

FileUploaderRenderer.apiVersion = 2;


/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
 * @param {sap.ui.unified.FileUploader} oFileUploader An object representation of the control that should be rendered.
 */
FileUploaderRenderer.render = function(oRm, oFileUploader) {
	var bEnabled = oFileUploader.getEnabled();
	var oFileUploaderHelper = FileUploaderHelper.getHelper();

	oRm.openStart("div", oFileUploader);
	oRm.class("sapUiFup");

	if (oFileUploader.getButtonOnly()) {
		oRm.class("sapUiFupButtonOnly");
	}

	var sClass = oFileUploaderHelper.addFormClass();
	if (sClass) {
		oRm.class(sClass);
	}
	if (!bEnabled) {
		oRm.class("sapUiFupDisabled");
	}
	oRm.openEnd();

	// form
	oRm.openStart("form", oFileUploader.getId() + "-fu_form");
	oRm.style("display", "inline-block");
	oRm.attr("enctype", "multipart/form-data");
	oRm.attr("method", oFileUploader.getHttpRequestMethod().toLowerCase());
	oRm.attr('action', oFileUploader.getUploadUrl());
	oRm.attr('target', oFileUploader.getId() + '-frame');
	oRm.openEnd();

	// the SAPUI5 TextField and Button
	oRm.openStart("div");
	if (!oFileUploader.bMobileLib) {
		oRm.class("sapUiFupInp");
	}
	oRm.openEnd();

	oRm.openStart("div");
	oRm.class("sapUiFupGroup");
	oRm.style("border", "0");
	oRm.style("cellPadding", "0");
	oRm.style("cellSpacing", "0");
	oRm.openEnd();
	oRm.openStart("div");
	oRm.openEnd();
	oRm.openStart("div");
	if (oFileUploader.getButtonOnly()) {
		oRm.style("display", "none");
	}
	oRm.openEnd();
	oRm.renderControl(oFileUploader.oFilePath);

	// per style margin
	oRm.close("div");
	oRm.openStart("div");
	oRm.openEnd();

	oFileUploader._ensureBackwardsReference();
	oRm.renderControl(oFileUploader.oBrowse);

	oRm.openStart("span", oFileUploader.getId() + "-AccDescr");
	oRm.class("sapUiInvisibleText");
	oRm.attr("aria-hidden", "true");
	oRm.openEnd();
	oRm.text(oFileUploader._generateAccDescriptionText());
	oRm.close("span");
	oRm.close("div");
	oRm.close("div");
	oRm.close("div");

	// hidden pure input type file (surrounded by a div which is responsible for giving the input the correct size)
	var sName = oFileUploader.getName() || oFileUploader.getId();
	oRm.openStart("div");
	oRm.class("sapUiFupInputMask");
	oRm.openEnd();
	oRm.voidStart("input");
	oRm.attr("type", "hidden");
	oRm.attr("name", "_charset_");
	oRm.attr("aria-hidden", "true");
	oRm.voidEnd();
	oRm.voidStart("input", oFileUploader.getId() + "-fu_data");
	oRm.attr("type", "hidden");
	oRm.attr("aria-hidden", "true");
	oRm.attr('name', sName + '-data');
	oRm.attr('value', oFileUploader.getAdditionalData() || "");
	oRm.voidEnd();
	jQuery.each(oFileUploader.getParameters(), function(iIndex, oParam) {
		oRm.voidStart("input");
		oRm.attr("type", "hidden");
		oRm.attr("aria-hidden", "true");
		oRm.attr('name', oParam.getName() || "");
		oRm.attr('value', oParam.getValue() || "");
		oRm.voidEnd();
	});
	oRm.close("div");

	oRm.close("div");
	oRm.close("form");
	oRm.close("div");
};

return FileUploaderRenderer;

});