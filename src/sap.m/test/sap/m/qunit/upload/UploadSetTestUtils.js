sap.ui.define([
	"sap/m/upload/UploadSetItem",
	"sap/m/ObjectMarker",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"
], function (UploadSetItem, ObjectMarker) {
	"use strict";

	var UploadSetTestUtils = {};

	UploadSetTestUtils.createItemTemplate = function () {
		return new UploadSetItem({
			enabledRemove: "{enabledRemove}",
			enabledEdit: "{enabledEdit}",
			fileName: "{fileName}",
			thumbnailUrl: "{thumbnailUrl}",
			tooltip: "{tooltip}",
			uploadState: "{uploadState}",
			url: "{url}",
			visibleEdit: "{visibleEdit}",
			visibleRemove: "{visibleRemove}",
			markers: {
				path: "markers",
				template: UploadSetTestUtils.createMarkerTemplate(),
				templateShareable: false
			}
		});
	};

	UploadSetTestUtils.createMarkerTemplate = function () {
		return new ObjectMarker({
			type: "{type}",
			visibility: "{visibility}"
		});
	};

	return UploadSetTestUtils;
}, true);