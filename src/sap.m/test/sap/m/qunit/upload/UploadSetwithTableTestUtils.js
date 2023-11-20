sap.ui.define([
	"sap/m/upload/UploadSetwithTableItem"
], function (UploadSetwithTableItem) {
    "use strict";

    var UploadSetwithTableTestUtils = {};

    UploadSetwithTableTestUtils.createItemTemplate = function () {
        return new UploadSetwithTableItem({

            fileName: "{fileName}",
            uploadState: "{uploadState}",
            url: "{url}",
            mediaType: "{mediaType}",
            fileSize: "{fileSize}"

        });
    };

    UploadSetwithTableTestUtils.getData = function () {
		return {
			items: [
				{
					"id": "23004569",
					"fileName": "Invoice summary.doc",
					"mediaType": "application/msword",
					"imageUrl": "images/invoice_manager.png",
					"url": "uploadSetTableDemo/SampleFiles/Business Plan Agenda.doc",
					"revision": "01",
					"status": "In work",
					"fileSize": 200,
					"isLatestVersion": true,
					"lastModifiedBy": "Jane Burns",
					"lastmodified": "10/03/21, 10:03:00 PM",
					"documentType": "Invoice",
					"versions": [
						{
							"fileName": "Invoice summary.doc",
							"version": "00",
							"modifiedBy": "Jane Burns",
							"modifiedOn": "01/03/21, 10:03:00 PM"
						},
						{
							"fileName": "Invoice summary.doc",
							"version": "01",
							"modifiedBy": "Jane Burns",
							"modifiedOn": "02/03/21, 10:03:00 PM"
						},
						{
							"fileName": "Invoice summary.doc",
							"version": "02",
							"modifiedBy": "Jane Burns",
							"modifiedOn": "10/03/21, 10:03:00 PM"
						}
					]
				},
				{
					"id": "23004589",
					"fileName": "Business Plan Topics.xls",
					"mediaType": "application/vnd.ms-excel",
					"url": "uploadSetTableDemo/SampleFiles/Business Plan Topics.xls",
					"revision": "00",
					"status": "In work",
					"fileSize": 2400,
					"isLatestVersion": true,
					"lastModifiedBy": "Jane Burns",
					"lastmodified": "10/03/21, 10:03:00 PM",
					"documentType": "Invoice",
					"versions": [
						{
							"fileName": "Business Plan Topics.xls",
							"version": "00",
							"modifiedBy": "Jane Burns",
							"modifiedOn": "01/03/21, 10:03:00 PM"
						},
						{
							"fileName": "Business Plan Topics.xls",
							"version": "01",
							"modifiedBy": "Jane Burns",
							"modifiedOn": "02/03/21, 10:03:00 PM"
						},
						{
							"fileName": "Business Plan Topics.xls",
							"version": "02",
							"modifiedBy": "Jane Burns",
							"modifiedOn": "10/03/21, 10:03:00 PM"
						}
					]
				},
				{
					"id": "23004583",
					"fileName": "Test Video.mp4",
					"mediaType": "video/mp4",
					"url": "uploadSetTableDemo/SampleFiles/Video.mp4",
					"revision": "99",
					"status": "In work",
					"isLatestVersion": true,
					"fileSize": 420000,
					"lastModifiedBy": "Jane Burns",
					"lastmodified": "10/03/21, 10:03:00 PM",
					"documentType": "Attachment"
				},
				{
					"id": "23004579",
					"fileName": "Document.txt",
					"mediaType": "text/plain",
					"url": "uploadSetTableDemo/SampleFiles/Document.txt",
					"revision": "42",
					"status": "In work",
					"fileSize": 420,
					"isLatestVersion": true,
					"lastModifiedBy": "Jane Burns",
					"lastmodified": "10/03/21, 10:03:00 PM",
					"documentType": "Document"
				},
				{
					"id": "23004581",
					"fileName": "Test Image.png",
					"mediaType": "image/png",
					"imageUrl": "images/invoice_manager.png",
					"url": "images/invoice_manager.png",
					"revision": "06",
					"status": "In work",
					"fileSize": 420,
					"isLatestVersion": true,
					"lastModifiedBy": "Jane Burns",
					"lastmodified": "10/03/21, 10:03:00 PM",
					"documentType": "Attachment"
				},
				{
					"id": "23004582",
					"fileName": "Test Attachment.gif",
					"mediaType": "image/gif",
					"imageUrl": "uploadSetTableDemo/SampleFiles/Animation.gif",
					"url": "uploadSetTableDemo/SampleFiles/Animation.gif",
					"revision": "11",
					"status": "In work",
					"fileSize": 420,
					"lastModifiedBy": "Jane Burns",
					"isLatestVersion": true,
					"lastmodified": "10/03/21, 10:03:00 PM",
					"documentType": "Attachment"
				},
				{
					"id": "23004578",
					"fileName": "Sample Zip File.zip",
					"mediaType": "application/zip",
					"url": "uploadSetTableDemo/SampleFiles/sample-zip-file.zip",
					"revision": "00",
					"status": "In work",
					"isLatestVersion": true,
					"fileSize": 42000,
					"lastModifiedBy": "Jane Burns",
					"lastmodified": "10/03/22, 10:20:00 PM",
					"documentType": "Attachment"
				},
				{
					"id": "23004584",
					"fileName": "Transmission.vds",
					"mediaType": "model/vnd.sap.vds",
					"url": "uploadSetTableDemo/SampleFiles/transmission.vds",
					"revision": "42",
					"status": "In work",
					"isLatestVersion": true,
					"fileSize": 123,
					"lastModifiedBy": "Jane Burns",
					"lastmodified": "10/03/22, 10:20:00 PM",
					"documentType": "Attachment"
				}
			]
		};
	};

    return UploadSetwithTableTestUtils;
});