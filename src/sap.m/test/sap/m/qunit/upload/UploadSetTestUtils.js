sap.ui.define([
	"sap/m/upload/UploadSetItem",
	"sap/m/ObjectMarker",
	"sap/m/ObjectStatus",
	"sap/m/ObjectAttribute"
], function (UploadSetItem, ObjectMarker, ObjectStatus, ObjectAttribute) {
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
			},
			statuses: {
				path: "statuses",
				template: UploadSetTestUtils.createStatusTemplate(),
				templateShareable: false
			},
			attributes: {
				path: "attributes",
				template: UploadSetTestUtils.createAttributeTemplate(),
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

	UploadSetTestUtils.createStatusTemplate = function () {
		return new ObjectStatus({
			title: "{title}",
			text: "{text}",
			visible: "{visible}"
		});
	};

	UploadSetTestUtils.createAttributeTemplate = function () {
		return new ObjectAttribute({
			title: "{title}",
			text: "{text}",
			visible: "{visible}"
		});
	};

	return UploadSetTestUtils;
});