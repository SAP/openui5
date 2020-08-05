/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.commons.FileUploader
sap.ui.define(['sap/ui/core/Renderer', 'sap/ui/unified/FileUploaderRenderer'],
	function(Renderer, UnifiedFileUploaderRenderer) {
	"use strict";


	var FileUploaderRenderer = Renderer.extend(UnifiedFileUploaderRenderer);

	return FileUploaderRenderer;

}, /* bExport= */ true);
