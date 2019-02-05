sap.ui.define([
	"sap/m/upload/UploadSetItem",
	"sap/m/ObjectMarker",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"
], function (UploadCollectionItem, ObjectMarker) {
	"use strict";

	var UploadSetTestUtils = {};

	UploadSetTestUtils.createItemTemplate = function () {
		return new UploadCollectionItem({
			enabledDelete: "{enabledDelete}",
			enabledEdit: "{enabledEdit}",
			fileName: "{fileName}",
			thumbnailUrl: "{thumbnailUrl}",
			tooltip: "{tooltip}",
			uploadState: "{uploadState}",
			url: "{url}",
			visibleEdit: "{visibleEdit}",
			visibleDelete: "{visibleDelete}",
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