sap.ui.define([
    "sap/ui/webc/fiori/UploadCollection",
    "sap/ui/webc/main/Button",
    "sap/ui/webc/fiori/UploadCollectionItem",
    "sap/ui/webc/main/Title",
    "sap/ui/webc/main/Label",
    "sap/ui/webc/main/Icon"
], function(UploadCollection, Button, UploadCollectionItem, Title, Label, Icon) {
    "use strict";

    var oUploadCollection = new UploadCollection({
        noDataText: "No Data",
        header: [
            new Title({
                text: "Uploaded (2)"
            }),
            new Label({
                text: "Add new files and press to start uploading pending files:"
            }),
            new Button({
                text: "Start",
                click: function(oEvent) {
                    // console.log("Event click fired for Button with parameters: ", oEvent.getParameters());
                }
            })
        ],
        items: [
            new UploadCollectionItem({
                fileName: "LaptopHT-1000.jpg",
                fileNameClickable: true,
                uploadState: "Uploading",
                progress: 37,
                fileNameClick: function(oEvent) {
                    // console.log("Event fileNameClick fired for UploadCollectionItem with parameters: ", oEvent.getParameters());
                },
                terminate: function(oEvent) {
                    // console.log("Event terminate fired for UploadCollectionItem with parameters: ", oEvent.getParameters());
                },
                thumbnail: new Icon({
                    name: "tnt/data-store"
                })
            }),
            new UploadCollectionItem({
                fileName: "Laptop.jpg",
                fileNameClickable: true,
                uploadState: "Error",
                progress: 68,
                fileNameClick: function(oEvent) {
                    // console.log("Event fileNameClick fired for UploadCollectionItem with parameters: ", oEvent.getParameters());
                },
                terminate: function(oEvent) {
                    // console.log("Event terminate fired for UploadCollectionItem with parameters: ", oEvent.getParameters());
                },
                thumbnail: new Icon({
                    name: "document-text"
                })
            }),
            new UploadCollectionItem({
                fileName: "Laptop.jpg",
                fileNameClickable: true,
                uploadState: "Complete",
                fileNameClick: function(oEvent) {
                    // console.log("Event fileNameClick fired for UploadCollectionItem with parameters: ", oEvent.getParameters());
                },
                terminate: function(oEvent) {
                    // console.log("Event terminate fired for UploadCollectionItem with parameters: ", oEvent.getParameters());
                },
                thumbnail: new Icon({
                    name: "tnt/modem"
                })
            })
        ],
        drop: function(oEvent) {
            // console.log("Event drop fired for UploadCollection with parameters: ", oEvent.getParameters());
        },
        itemDelete: function(oEvent) {
            // console.log("Event itemDelete fired for UploadCollection with parameters: ", oEvent.getParameters());
        },
        selectionChange: function(oEvent) {
            // console.log("Event selectionChange fired for UploadCollection with parameters: ", oEvent.getParameters());
        }
    });
    oUploadCollection.placeAt("testControl");
});
