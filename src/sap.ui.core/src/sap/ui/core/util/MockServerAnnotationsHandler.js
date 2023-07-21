/*
 * ${copyright}
 */
sap.ui.define(['sap/ui/model/odata/ODataMetadata'],
	function(ODataMetadata) {
		"use strict";
		return {
			parse: function(oMetadata, sMetadata) {
				return ODataMetadata.getServiceAnnotations(sMetadata);
			}
		};
	}, /* bExport= */ true);