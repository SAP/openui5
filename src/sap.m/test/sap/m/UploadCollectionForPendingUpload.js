sap.ui.define([
	"sap/m/MessageToast",
	"sap/m/Button",
	"sap/m/UploadCollection",
	"sap/m/OverflowToolbar",
	"sap/m/Title",
	"sap/m/ToolbarSpacer",
	"sap/m/SearchField",
	"sap/m/UploadCollectionToolbarPlaceholder",
	"sap/m/UploadCollectionParameter",
	"sap/m/Page",
	"sap/m/Bar",
	"sap/ui/util/Mobile",
	"sap/base/Log"
], function(
	MessageToast,
	Button,
	UploadCollection,
	OverflowToolbar,
	Title,
	ToolbarSpacer,
	SearchField,
	UploadCollectionToolbarPlaceholder,
	UploadCollectionParameter,
	Page,
	Bar,
	Mobile,
	Log
) {
	"use strict";

	Mobile.init();

	/* =========================================================== */
	/* UploadCollection                                            */
	/* =========================================================== */

	// The upper and lower case letters are on purpose to prove that they don't matter
	var aFileTypes = ["jPg", "tXT", "ppt", "doc", "xls", "pdf", "PNG", "mp4"];
	var iRequestCounter = 0, sFileName;
	var oUploadButton = new Button({
		text : "start upload",
		press : fnUpload
	});
	var oRemoveButton = new Button({
		text : "Remove Selected Item",
		press : fnRemove
	});

	var oUploadCollection = fnCreateUploadCollection();


	/* =========================================================== */
	/* Creates an instance of UploadCollection                     */
	/* =========================================================== */
	function fnCreateUploadCollection() {
		return new UploadCollection({
			maximumFilenameLength : 55,
			maximumFileSize : 250,
			multiple : true,
			sameFilenameAllowed : true,
			instantUpload : false,
			fileType : aFileTypes,
			mode : "SingleSelectMaster",
			toolbar : new OverflowToolbar({
				content : [
					new Title("attachmentTitle"),
					new ToolbarSpacer(),
					new SearchField({
						width : "10rem",
						search : fnSearch
					}),
					new UploadCollectionToolbarPlaceholder(),
					new Button({
						icon : "sap-icon://money-bills",
						enabled : false,
						type : "Transparent"
					}),
					new Button({
						text : "Details",
						press : fnDetailsPress,
						type : "Transparent"
					})
				]
			}),
			// events
			change : fnChange,
			filenameLengthExceed : fnfilenameLengthExceed,
			fileSizeExceed : fnFileSizeExceed,
			typeMissmatch : fnTypeMissmatch,
			uploadComplete : fnUploadComplete,
			beforeUploadStarts : fnBeforeUploadStarts
		}).addEventDelegate({
			onBeforeRendering : function() {
				fnUpdateAttachmentTitle();
			}
		});
	}

	/* =========================================================== */
	/* Handles UploadCollection Events                              */
	/* =========================================================== */
	function fnChange(oEvent) {
		MessageToast.show("Event change triggered");
	}

	function fnUpload(oEvent) {
		if (oUploadCollection.getItems().length > 0) {
			oUploadCollection.upload();
			MessageToast.show("Upload has been started");
		}
	}

	function fnRemove(oEvent) {
		oUploadCollection.removeItem(oUploadCollection.getSelectedItem());
	}

	function fnBeforeUploadStarts(oEvent) {
		sFileName = oEvent.getParameter("fileName");
		iRequestCounter++;
		var oHeaderParameter = new UploadCollectionParameter({
			name : "FileNameForTesting",
			value : sFileName
		});
		oEvent.getParameters().addHeaderParameter(oHeaderParameter);
		// Delays the beforeUploadStarts message in order to see the upload message
		setTimeout(function() {
			MessageToast.show("Event beforeUploadStarts triggered, see log for more ...");
		}, 2000);
		Log.info("Event beforeUploadStarts triggered for file " + sFileName);
	}

	function fnfilenameLengthExceed(oEvent) {
		MessageToast.show("Event filenameLengthExceed triggered");
	}

	function fnFileSizeExceed(oEvent) {
		MessageToast.show("Event fileSizeExceed triggered");
	}

	function fnTypeMissmatch(oEvent) {
		MessageToast.show("Event typeMissmatch triggered");
	}

	function fnDetailsPress(oEvent) {
		if (oUploadCollection.getSelectedItem()) {
			MessageToast.show("Details button was clicked for file: "
									+ oUploadCollection.getSelectedItem().getFileName());
		} else {
			MessageToast.show("First, select an item");
		}
	}

	function fnSearch(oEvent) {
		MessageToast.show("Search feature isn't available in this sample");
	}

	function fnUpdateAttachmentTitle() {
		sap.ui.getCore().byId("attachmentTitle").setText("Attachments (" + oUploadCollection.getItems().length + ")");
	}

	function fnUploadComplete(oEvent) {
		sFileName = oEvent.getParameter("files")[0].fileName;
		// Delays the uploadComplete message in order to see the beforeUploadStarts message
		setTimeout(function() {
			MessageToast.show("Event uploadComplete triggered, see log for more ...");
		}, 4000);
		Log.info("Event uploadComplete triggered for file " + sFileName);
		if (iRequestCounter <= 1) {
			setTimeout(function() {
				oUploadCollection.removeAllItems();
			}, 6000);
			iRequestCounter = 0;
		} else {
			iRequestCounter--;
		}
	}

	/* ============================================================	*/
	/* Creates Page                   								*/
	/* ============================================================ */
	// As Mobile.init() is used, it is not needed to create an app and the page can be put directly into the HTML document
	new Page("page", {
		title : "Test Page for sap.m.UploadCollection with Pending Upload",
		content : oUploadCollection,
		footer : new Bar({
			contentMiddle : [ oUploadButton, oRemoveButton ]
		})
	}).placeAt("body");
});
