/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.commons.FileUploader
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', 'sap/ui/unified/FileUploaderRenderer'],
	function(jQuery, Renderer, FileUploaderRenderer1) {
	"use strict";


	var FileUploaderRenderer = Renderer.extend(FileUploaderRenderer1);

	return FileUploaderRenderer;

}, /* bExport= */ true);
