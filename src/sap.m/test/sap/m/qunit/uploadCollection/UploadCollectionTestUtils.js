sap.ui.define([
	"sap/m/UploadCollectionItem",
	"sap/m/ObjectMarker",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"
], function (UploadCollectionItem, ObjectMarker) {
	"use strict";

	var UploadCollectionTestUtils = {};

	UploadCollectionTestUtils.createItemTemplate = function () {
		return new UploadCollectionItem({
			ariaLabelForPicture: "{ariaLabelForPicture}",
			contributor: "{contributor}",
			documentId: "{documentId}",
			enableEdit: "{enableEdit}",
			enableDelete: "{enableDelete}",
			fileName: "{fileName}",
			fileSize: "{fileSize}",
			mimeType: "{mimeType}",
			selected: "{selected}",
			thumbnailUrl: "{thumbnailUrl}",
			tooltip: "{tooltip}",
			uploadedDate: "{uploadedDate}",
			uploadState: "{uploadState}",
			url: "{url}",
			visibleEdit: "{visibleEdit}",
			visibleDelete: "{visibleDelete}",
			markers: {
				path: "markers",
				template: UploadCollectionTestUtils.createMarkerTemplate(),
				templateShareable: false
			}
		});
	};

	UploadCollectionTestUtils.createMarkerTemplate = function () {
		return new ObjectMarker({
			type: "{type}",
			visibility: "{visibility}"
		});
	};

	return UploadCollectionTestUtils;
}, true);