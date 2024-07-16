sap.ui.define([
    "sap/m/App",
    "sap/m/Page",
    "sap/m/Toolbar",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/m/Button",
    "sap/m/CheckBox",
    "sap/m/ObjectAttribute",
    "sap/m/ObjectMarker",
    "sap/m/ObjectStatus",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/StepInput",
    "sap/m/HBox",
    "sap/m/Select",
    "sap/m/upload/UploadSet",
    "sap/m/upload/UploadSetItem",
    "sap/ui/core/Item",
    "sap/ui/model/json/JSONModel",
    "sap/m/library",
    "sap/ui/core/library"
], function(App, Page, Toolbar, List, ListItem, Button, CheckBox, ObjectAttribute, ObjectMarker, ObjectStatus, Label, Input, StepInput, HBox, Select, UploadSet, UploadSetItem, Item, JSONModel, mobileLibrary, coreLibrary) {
    "use strict";

    // shortcut for sap.ui.core.TextAlign
    const TextAlign = coreLibrary.TextAlign;

    // shortcut for sap.m.LabelDesign
    const LabelDesign = mobileLibrary.LabelDesign;

    var oUploadSetData = {
        instantUpload: true,
        showIcons: true,
        uploadEnabled: true,
        terminationEnabled: true,
        fileTypes: ["txt", "doc", "png"],
        maxFileNameLength: 30,
        maxFileSize: 200,
        mediaTypes: ["text/plain", "application/msword", "image/jpeg"],
        uploadUrl: "../../../../upload",
        items: [
            {
                fileName: "Business Plan Agenda.doc",
                mediaTypes: "application/msword",
                url: "demokit/sample/UploadCollection/LinkedDocuments/Business Plan Agenda.doc",
                attributes: [
                    { title: "Uploaded By", text: "Jane Burns", active: true },
                    { title: "Uploaded On", text: "2014-07-28", active: false },
                    { title: "File Size", text: "25", active: false },
                    { title: "Lorem ipsum dolor sit amet", text: "consectetur adipisici elit", active: false }
                ],
                markers: [
                    { type: "Draft" },
                    { type: "Favorite" },
                    { type: "Flagged" },
                    { type: "Locked" },
                    { type: "Unsaved" }
                ],
                statuses: [
                    { title: "Basic", text: "Error", state: "Error" },
                    { title: "Advanced", text: "Success", state: "Success", icon: "sap-icon://message-success" },
                    { title: "Ultimate", text: "Warning", state: "Warning", active: true }
                ],
                selected: false
            },
            {
                fileName: "Picture of a woman.png",
                mimeType: "image/png",
                thumbnailUrl: "images/Woman_04.png",
                url: "images/Woman_04.png"
            },
            {
                fileName: "Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
                attributes: [
                    {
                        title: "Lorem ipsum",
                        text: "Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
                    }
                ],
                statuses: [
                    {
                        title: "Lorem ipsum",
                        text: "Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
                    }
                ]
            }
        ]
    };
    var oModel = new JSONModel();
    oModel.setData(oUploadSetData);

    var oUploadSet = new UploadSet({
        instantUpload: "{/instantUpload}",
        showIcons: "{/showIcons}",
        uploadEnabled: "{/uploadEnabled}",
        terminationEnabled: "{/terminationEnabled}",
        fileTypes: "{/fileTypes}",
        maxFileNameLength: "{/maxFileNameLength}",
        maxFileSize: "{/maxFileSize}",
        mediaTypes: "{/mediaTypes}",
        uploadUrl: "{/uploadUrl}",
        items: {
            path: "/items",
            template: new UploadSetItem({
                fileName: "{fileName}",
                mediaType: "{mediaType}",
                url: "{url}",
                thumbnailUrl: "{thumbnailUrl}",
                attributes: {
                    path: "attributes",
                    templateShareable: true,
                    template: new ObjectAttribute({
                        title: "{title}",
                        text: "{text}",
                        active: "{active}"
                    })
                },
                markers: {
                    path: "markers",
                    templateShareable: true,
                    template: new ObjectMarker({
                        type: "{type}",
                        visibility: "{visibility}"
                    })
                },
                statuses: {
                    path: "statuses",
                    templateShareable: true,
                    template: new ObjectStatus({
                        title: "{title}",
                        text: "{text}",
                        state: "{state}",
                        icon: "{icon}",
                        active: "{active}",
                        iconDensityAware: "{iconDensityAware}",
                        textDirection: "{textDirection}"
                    })
                }
            })
        }
    });

    var oAskCheckBox = new CheckBox({
        text: "Ask",
        selected: false
    });

    var oSetToolbar = new Toolbar({
        content: [
            new Label({ text: "Whole set:" }),
            new CheckBox({
                text: "Instant upload",
                selected: "{/instantUpload}"
            }),
            new CheckBox({
                text: "Show icons",
                selected: "{/showIcons}"
            }),
            new CheckBox({
                text: "Upload enabled",
                selected: "{/uploadEnabled}"
            }),
            new CheckBox({
                text: "Termination enabled",
                selected: "{/terminationEnabled}"
            }),
            new CheckBox({
                text: "Add file visible",
                selected: true,
                select: function (oEvent) {
                    var o = oUploadSet.getDefaultFileUploader(),
                        b = oEvent.getParameter("selected");
                    o.setVisible(b);
                }
            }),
            new Button({
                text: "Upload",
                press: function () {
                    oUploadSet.upload();
                }
            }),
            new Button({
                text: "Add via API",
                press: function () {
                    oUploadSet.addIncompleteItem(new UploadSetItem({
                        fileName: "Document.txt",
                        mediaType: "text/plain",
                        thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8f/SAP-Logo.svg",
                        url: "test-resources/sap/m/demokit/sample/UploadCollection/LinkedDocuments/Document.txt",
                        attributes: [new ObjectAttribute({ title: "Content", text: "Sucks" })],
                        markers: [new ObjectMarker({ type: "Locked" })],
                        statuses: [new ObjectStatus({ title: "Ready", text: "Steady" })]
                    }));
                }
            }),
            new Button({
                text: "Delete via API",
                press: function () {
                    var o = oUploadSet._getAllItems()[0];
                    oUploadSet.removeItem(o);
                    oUploadSet.removeIncompleteItem(o);
                }
            }),
            new Button({
                text: "Download",
                press: function () {
                    var o = oUploadSet._getAllItems()[0];
                    o.download(oAskCheckBox.getSelected());
                }
            }),
            oAskCheckBox
        ]
    });

    var oItemToolbar = new Toolbar({
        content: [
            new Label({ text: "Only 1st item:" }),
            new CheckBox({
                text: "Enabled delete",
                selected: true,
                select: function (oEvent) {
                    var o = oUploadSet._getAllItems()[0],
                        b = oEvent.getParameter("selected");
                    o.setEnabledRemove(b);
                }
            }),
            new CheckBox({
                text: "Enabled edit",
                selected: true,
                select: function (oEvent) {
                    var o = oUploadSet._getAllItems()[0],
                        b = oEvent.getParameter("selected");
                    o.setEnabledEdit(b);
                }
            }),
            new CheckBox({
                text: "Visible delete",
                selected: true,
                select: function (oEvent) {
                    var o = oUploadSet._getAllItems()[0],
                        b = oEvent.getParameter("selected");
                    o.setVisibleRemove(b);
                }
            }),
            new CheckBox({
                text: "Visible edit",
                selected: true,
                select: function (oEvent) {
                    var o = oUploadSet._getAllItems()[0],
                        b = oEvent.getParameter("selected");
                    o.setVisibleEdit(b);
                }
            }),
            new Button({
                text: "Change item icon",
                press: function () {
                    if (oUploadSet._getAllItems().length > 0) {
                        oUploadSet._getAllItems()[0]._getIcon().setSrc("sap-icon://pdf-attachment");
                    }
                }
            })
        ]
    });

    var oListTypeSelect = new Select({});
    ["Active", "Detail", "DetailAndActive", "Inactive", "Navigation"].forEach(function (sType) {
        oListTypeSelect.addItem(new Item({
            key: sType, text: sType
        }));
    });
    oListTypeSelect.setSelectedKey("Inactive");
    oListTypeSelect.attachChange(function (oEvent) {
        var sType = oEvent.getParameter("selectedItem").getKey();
        oUploadSet._getAllItems().forEach(function (oItem) {
            oItem.getListItem().setType(sType);
        });
    });
    oItemToolbar.addContent(oListTypeSelect);

    var oListModeSelect = new Select({});
    ["Delete", "MultiSelect", "None", "SingleSelect", "SingleSelectLeft", "SingleSelectMaster"].forEach(function (sMode) {
        oListModeSelect.addItem(new Item({
            key: sMode, text: sMode
        }));
    });
    oListModeSelect.setSelectedKey("None");
    oListModeSelect.attachChange(function (oEvent) {
        var sMode = oEvent.getParameter("selectedItem").getKey();
        oUploadSet.getList().setMode(sMode);
    });
    oItemToolbar.addContent(oListModeSelect);

    var oEventList = new List("eventList", {
        headerToolbar: new Toolbar({
            content: [
                new Label({ text: "Events", design: LabelDesign.Bold }),
                new Button({
                    text: "Clear",
                    press: function () {
                        oEventList.removeAllItems();
                    }
                })
            ]
        })
    });
    [
        "afterItemAdded",
        "beforeItemAdded",
        "beforeItemRemoved",
        "beforeItemEdited",
        "beforeUploadStarts",
        "uploadCompleted",
        "beforeUploadTermination",
        "uploadTerminated",
        "fileTypeMismatch",
        "fileNameLengthExceeded",
        "fileSizeExceeded",
        "mediaTypeMismatch",
        "selectionChanged"
    ].forEach(function (sEvent) {
        oUploadSet.attachEvent(sEvent, function (oEvent) {
            var oParam = oEvent.getParameter("item"),
                sDescription = "";
            if (oParam) {
                sDescription = oParam.getFileName();
            } else {
                oParam = oEvent.getParameter("items");
                if (oParam) {
                    oParam.forEach(function (oItem, iIndex) {
                        sDescription += iIndex > 0 ? ", " : "";
                        sDescription += oItem.getFileName();
                    });
                }
            }
            oEventList.insertItem(new ListItem({
                title: sEvent + ": " + sDescription
            }));
        });
    });

    var oNameInput = new Input({ id: "headerFieldNameInput" }),
    oValueInput = new Input({ id: "headerFieldValueInput" }),
    oHeaderFieldList = new List("headerFieldList", {
        headerToolbar: new Toolbar({
            content: [
                new Label({ text: "Headers", width: "3.5rem", design: LabelDesign.Bold }),
                new Button({
                    text: "Add",
                    press: function () {
                        var sName = oNameInput.getValue(),
                            sValue = oValueInput.getValue();
                        oUploadSet.addHeaderField(new Item({ key: sName, text: sValue }));
                        oHeaderFieldList.insertItem(new ListItem({
                            title: sName + ": " + sValue
                        }));
                    }
                }),
                oNameInput,
                oValueInput
            ]
        }),
        width: "500px"
    });
    oUploadSet.addHeaderField(new Item({ key: "From", text: "user@example.com" }));
    oHeaderFieldList.insertItem(new ListItem({ title: "From: user@example.com" }));

    var oRestrictionToolbar = new Toolbar({
        content: [
            new Label({ text: "fileTypes:", width: "8%", textAlign: TextAlign.End }),
            new Input({ value: "{/fileTypes}", width: "34%" }),
            new Label({ text: "nameLength:", width: "8%", textAlign: TextAlign.End }),
            new StepInput({ value: "{/maxFileNameLength}", width: "120px" }),
            new Label({ text: "fileSize:", width: "8%", textAlign: TextAlign.End }),
            new StepInput({ value: "{/maxFileSize}", width: "120px" }),
            new Label({ text: "mediaTypes:", width: "8%", textAlign: TextAlign.End }),
            new Input({ value: "{/mediaTypes}", width: "34%" })
        ]
    });

    var oPage = new Page("page", {
        title: "Test Page for sap.m.upload.UploadSet",
        content: [
            oRestrictionToolbar,
            oSetToolbar,
            oItemToolbar,
            oUploadSet,
            new HBox({
                items: [
                    oHeaderFieldList,
                    oEventList
                ]
            })
        ]
    });
    oPage.setModel(oModel);

    [
        "openPressed",
        "removePressed"
    ].forEach(function (sEvent) {
        oUploadSet.getItems()[0].attachEvent(sEvent, function () {
            oEventList.insertItem(new ListItem({
                title: sEvent
            }));
        });
    });

    new App("UploadSetTestApp", { pages: [oPage] }).placeAt("content");
});