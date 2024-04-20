sap.ui.define(
    [
		"sap/base/Log",
        "sap/ui/layout/library",
        "sap/m/library",
        "sap/m/semantic/MultiSelectAction",
        "sap/m/semantic/MainAction",
        "sap/m/semantic/PositiveAction",
        "sap/m/semantic/NegativeAction",
        "sap/m/semantic/AddAction",
        "sap/m/semantic/EditAction",
        "sap/m/semantic/SaveAction",
        "sap/m/semantic/DeleteAction",
        "sap/m/semantic/ForwardAction",
        "sap/m/semantic/CancelAction",
        "sap/m/semantic/SortAction",
        "sap/m/semantic/FilterAction",
        "sap/m/semantic/GroupAction",
        "sap/m/semantic/MessagesIndicator",
        "sap/m/semantic/FlagAction",
        "sap/m/semantic/FavoriteAction",
        "sap/m/semantic/OpenInAction",
        "sap/m/semantic/DiscussInJamAction",
        "sap/m/semantic/SendEmailAction",
        "sap/m/semantic/SendMessageAction",
        "sap/m/semantic/ShareInJamAction",
        "sap/m/semantic/PrintAction",
        "sap/m/semantic/SortSelect",
        "sap/m/semantic/FilterSelect",
        "sap/m/semantic/GroupSelect",
        "sap/m/DraftIndicator",
        "sap/ui/model/json/JSONModel",
        "sap/m/SplitApp",
        "sap/m/Page",
        "sap/m/Button",
        "sap/m/Select",
        "sap/m/Switch",
        "sap/m/Input",
        "sap/m/Text",
        "sap/ui/core/Item",
        "sap/m/Title",
        "sap/ui/layout/form/SimpleForm",
        "sap/ui/core/message/Message",
        "sap/m/semantic/MasterPage",
        "sap/m/semantic/DetailPage",
        "sap/m/OverflowToolbarButton",
        "sap/m/PagingButton",
        "sap/m/SplitContainer",
        "sap/m/Dialog",
        "sap/m/Label",
        "sap/m/VBox",
        "sap/m/HBox",
        "sap/m/Link",
        "sap/m/Bar",
        "sap/m/SearchField",
        "sap/ui/core/Messaging",
        "sap/ui/core/message/MessageType",
        "sap/ui/core/Element"
    ],
    function (
		Log,
        layoutLibrary,
        mLibrary,
        MultiSelectAction,
        MainAction,
        PositiveAction,
        NegativeAction,
        AddAction,
        EditAction,
        SaveAction,
        DeleteAction,
        ForwardAction,
        CancelAction,
        SortAction,
        FilterAction,
        GroupAction,
        MessagesIndicator,
        FlagAction,
        FavoriteAction,
        OpenInAction,
        DiscussInJamAction,
        SendEmailAction,
        SendMessageAction,
        ShareInJamAction,
        PrintAction,
        SortSelect,
        FilterSelect,
        GroupSelect,
        DraftIndicator,
        JSONModel,
        SplitApp,
        Page,
        Button,
        Select,
        Switch,
        Input,
        Text,
        Item,
        Title,
        SimpleForm,
        Message,
        MasterPage,
        DetailPage,
        OverflowToolbarButton,
        PagingButton,
        SplitContainer,
        Dialog,
        Label,
        VBox,
        HBox,
        Link,
        Bar,
        SearchField,
        Messaging,
        MessageType,
        Element
    ) {
        "use strict";

        var aActionClasses = [
            MultiSelectAction,
            MainAction,
            PositiveAction,
            NegativeAction,
            AddAction,
            EditAction,
            SaveAction,
            DeleteAction,
            ForwardAction,
            CancelAction,
            SortAction,
            FilterAction,
            GroupAction,
            FlagAction,
            FavoriteAction,
            OpenInAction,
            DiscussInJamAction,
            ShareInJamAction,
            SendEmailAction,
            SendMessageAction,
            PrintAction,
            MessagesIndicator,
            DraftIndicator
        ];

        var ButtonType = mLibrary.ButtonType;
        var InputType = mLibrary.InputType;
		var SelectType = mLibrary.SelectType;

        var SimpleFormLayout = layoutLibrary.form.SimpleFormLayout;

        var app = new SplitApp("myApp");

        var oModelMessages = new JSONModel({});

        var oTestDataModel = new JSONModel({
            sortItems: [
                {
                    key: "price",
                    label: "Price"
                },
                {
                    key: "name",
                    label: "Name"
                },
                {
                    key: "date",
                    label: "Date"
                }
            ]
        });

        var oStatusModel = new JSONModel({
            lastAction: " ",
            selectedPageId: "master",
            selectedSemanticControl: {
                className: "AddAction",
                enabled: "",
                buttonType: "",
                insertIndex: 0
            },
            selectedCustomControl: {
                className: "Button",
                text: "",
                icon: "",
                buttonType: "",
                iconOnly: true,
                autoAdjustWidth: true,
                insertIndex: 0
            },
            master: {
                showNavButton: false,
                title: "Master Title",
                multiSelectPressed: false,
                multiSelectEnabled: true
            },
            detail: {
                showNavButton: false,
                title: "Detail Title"
            }
        });

        // select
        var oItemTemplate = new Item({
            key: "{testData>key}",
            text: "{testData>label}"
        }).setModel(oTestDataModel, "testData");

        var oStatusLabel = new Text({
            id: "statusLabel",
            text: "{status>/lastAction}"
        }).setModel(oStatusModel, "status");

        var oPressedLabel = new Text({
            id: "pressedLabel",
            text: "{status>/master/multiSelectPressed}"
        }).setModel(oStatusModel, "status");

        var oAddWarningButton = new Button("addMessagesBtn", {
            text: "add Warning",
            press: function () {
                Messaging.addMessages(
                    new Message({
                        message: "Something wrong happend!",
                        type: MessageType.Warning,
                        processor: oModelMessages
                    })
                );
            }
        });

        var oClearWarningsButton = new Button("clearMessagesBtn", {
            text: "clear Messages",
            press: function () {
                Messaging.removeAllMessages();
            }
        });

        var oSavingDraftButton = new Button("showSavingDraftBtn", {
            text: "show Saving Draft",
            press: function () {
                draftInd.showDraftSaving();
            }
        });

        var oSavedDraftButton = new Button("showDraftSavedBtn", {
            text: "show Draft Saved",
            press: function () {
                draftInd.showDraftSaved();
            }
        });

        var oClearDraftButton = new Button("clearDraftStateBtn", {
            text: "clear Draft state",
            press: function () {
                draftInd.clearDraftState();
            }
        });

        var oToggleMultiselectPressed = new Button(
            "toggleMultiselectPressedBtn",
            {
                text: "Toggle Multiselect Pressed",
                press: function () {
                    var bToggle =
                        !oStatusModel.getData().master.multiSelectPressed;
                    oStatusModel.setData(
                        { master: { multiSelectPressed: bToggle } },
                        true
                    );
                }
            }
        );

        var oToggleMultiselectEnabled = new Button(
            "toggleMultiselectEnabledBtn",
            {
                text: "Toggle Multiselect Enabled",
                press: function () {
                    var bToggle =
                        !oStatusModel.getData().master.multiSelectEnabled;
                    oStatusModel.setData(
                        { master: { multiSelectEnabled: bToggle } },
                        true
                    );
                }
            }
        );

        function createPageSelect() {
            return new Select({
                selectedKey: "{status>/selectedPageId}",
                items: [
                    new Item({ key: "master", text: "Master" }),
                    new Item({ key: "detail", text: "Detail" })
                ]
            }).setModel(oStatusModel, "status");
        }

        function createShareMenuPageSelect() {
            return new Select({
                selectedKey: "{status>/selectedPageId}",
                items: [new Item({ key: "detail", text: "Detail" })]
            }).setModel(oStatusModel, "status");
        }

        function createSemanticClassSelect() {
            var oSelect = new Select({
                selectedKey: "{status>/selectedSemanticControl/className}"
            }).setModel(oStatusModel, "status");
			aActionClasses.forEach(function (oValue) {
				var sKey = oValue.getMetadata().getName();
				oSelect.addItem(new Item({ key: sKey, text: sKey }));
			});

            return oSelect;
        }

        function createSemanticEnabledSelect() {
            return new Select({
                selectedKey: "{status>/selectedSemanticControl/enabled}",
                items: [
                    new Item({ key: "", text: "do not customize" }),
                    new Item({ key: "true", text: "enabled" }),
                    new Item({ key: "false", text: "disabled" })
                ]
            }).setModel(oStatusModel, "status");
        }

        function createButtonTypeSelect() {
            return new Select({
                selectedKey: "{status>/selectedSemanticControl/buttonType}",
                items: [
                    new Item({ key: "", text: "do not customize" }),
                    new Item({
                        key: ButtonType.Accept,
                        text: ButtonType.Accept
                    }),
                    new Item({
                        key: ButtonType.Back,
                        text: ButtonType.Back
                    }),
                    new Item({
                        key: ButtonType.Default,
                        text: ButtonType.Default
                    }),
                    new Item({
                        key: ButtonType.Emphasized,
                        text: ButtonType.Emphasized
                    }),
                    new Item({
                        key: ButtonType.Reject,
                        text: ButtonType.Reject
                    }),
                    new Item({
                        key: ButtonType.Transparent,
                        text: ButtonType.Transparent
                    }),
                    new Item({
                        key: ButtonType.Unstyled,
                        text: ButtonType.Unstyled
                    }),
                    new Item({
                        key: ButtonType.Up,
                        text: ButtonType.Up
                    })
                ]
            }).setModel(oStatusModel, "status");
        }

        function createCustomFooterClassSelect() {
            return new Select({
                selectedKey: "{status>/selectedCustomControl/className}",
                items: [
                    new Item({ key: "Button", text: "Button" }),
                    new Item({
                        key: "OverflowToolbarButton",
                        text: "OverflowToolbarButton"
                    }),
                    new Item({ key: "Select", text: "Select" })
                ]
            }).setModel(oStatusModel, "status");
        }

        function createCustomShareMenuClassSelect() {
            return new Select({
                selectedKey: "{status>/selectedCustomControl/className}",
                items: [new Item({ key: "Button", text: "Button" })]
            }).setModel(oStatusModel, "status");
        }

        function createCustomIconSelect() {
            return new Select({
                selectedKey: "{status>/selectedCustomControl/icon}",
                items: [
                    new Item({ key: "", text: "none" }),
                    new Item({
                        key: "sap-icon://video",
                        text: "video"
                    }),
                    new Item({
                        key: "sap-icon://account",
                        text: "account"
                    }),
                    new Item({
                        key: "sap-icon://task",
                        text: "task"
                    }),
                    new Item({
                        key: "sap-icon://synchronize",
                        text: "synchronize"
                    }),
                    new Item({
                        key: "sap-icon://settings",
                        text: "settings"
                    }),
                    new Item({
                        key: "sap-icon://search",
                        text: "search"
                    }),
                    new Item({
                        key: "sap-icon://refresh",
                        text: "refresh"
                    }),
                    new Item({
                        key: "sap-icon://product",
                        text: "product"
                    }),
                    new Item({
                        key: "sap-icon://pool",
                        text: "pool"
                    }),
                    new Item({
                        key: "sap-icon://picture",
                        text: "picture"
                    }),
                    new Item({
                        key: "sap-icon://phone",
                        text: "phone"
                    })
                ]
            }).setModel(oStatusModel, "status");
        }

        function createSemanticInsertInput() {
            return new Input({
                type: InputType.Number,
                value: "{status>/selectedSemanticControl/insertIndex}"
            }).setModel(oStatusModel, "status");
        }

        function createCustomInsertInput() {
            return new Input({
                type: InputType.Number,
                value: "{status>/selectedCustomControl/insertIndex}"
            }).setModel(oStatusModel, "status");
        }

        function createSemanticButtonForm() {
            return new SimpleForm({
                maxContainerCols: 2,
                editable: true,
                content: [
                    new Title({ text: "Customize:" }),
                    new Label({ text: "Enabled:" }),
                    createSemanticEnabledSelect(),
                    new Label({ text: "Button type:" }),
                    createButtonTypeSelect()
                ],
                visible: {
                    path: "status>/selectedSemanticControl/className",
                    formatter: function (className) {
                        return className && className === "SemanticButton";
                    }
                }
            }).setModel(oStatusModel, "status");
        }

        function createSemanticSelectForm() {
            return new SimpleForm({
                maxContainerCols: 2,
                editable: true,
                content: [
                    new Title({ text: "Customize:" }),
                    new Label({ text: "Enabled:" }),
                    createSemanticEnabledSelect()
                ],
                visible: {
                    path: "status>/selectedSemanticControl/className",
                    formatter: function (className) {
                        return className && className === "SemanticSelect";
                    }
                }
            }).setModel(oStatusModel, "status");
        }

        function createCustomButtonForm() {
            return new SimpleForm({
                maxContainerCols: 2,
                editable: true,
                content: [
                    new Label({ text: "Text:" }),
                    new Input({
                        value: "{status>/selectedCustomControl/text}"
                    }).setModel(oStatusModel, "status"),
                    new Label({ text: "Icon:" }),
                    createCustomIconSelect(),
                    new Label({ text: "All other button properties..." })
                ],
                visible: {
                    path: "status>/selectedCustomControl/className",
                    formatter: function (className) {
                        return (
                            className &&
                            (className === "Button" ||
                                className === "OverflowToolbarButton")
                        );
                    }
                }
            }).setModel(oStatusModel, "status");
        }

        function createCustomSelectForm() {
            return new SimpleForm({
                maxContainerCols: 2,
                editable: true,
                content: [
                    new Label({ text: "Icon:" }),
                    createCustomIconSelect(),
                    new Label({ text: "IconOnly:" }),
                    new Switch({
                        state: "{status>/selectedCustomControl/iconOnly}"
                    }).setModel(oStatusModel, "status"),
                    new Label({ text: "autoAdjustWidth:" }),
                    new Switch({
                        state: "{status>/selectedCustomControl/autoAdjustWidth}"
                    }).setModel(oStatusModel, "status")
                ],
                visible: {
                    path: "status>/selectedCustomControl/className",
                    formatter: function (className) {
                        return className && className === "Select";
                    }
                }
            }).setModel(oStatusModel, "status");
        }

        function createAddSemanticContentForm() {
            return new SimpleForm({
                maxContainerCols: 2,
                editable: true,
                content: [
                    new Label({ text: "Target page:" }),
                    createPageSelect(),
                    new Label({ text: "Control type:" }),
                    createSemanticClassSelect()
                ]
            });
        }

        function createAddCustomFooterContentForm() {
            return new SimpleForm({
                maxContainerCols: 2,
                editable: true,
                content: [
                    new Label({ text: "Target page:" }),
                    createPageSelect(),
                    new Label({ text: "Control type:" }),
                    createCustomFooterClassSelect()
                ]
            });
        }

        function createAddCustomShareMenuContentForm() {
            return new SimpleForm({
                maxContainerCols: 2,
                editable: true,
                content: [
                    new Label({ text: "Target page:" }),
                    createShareMenuPageSelect(),
                    new Label({ text: "Control type:" }),
                    createCustomShareMenuClassSelect()
                ]
            });
        }

        function createInsertSemanticContentForm() {
            return new SimpleForm({
                maxContainerCols: 2,
                editable: true,
                content: [
                    new Label({ text: "Insert At:" }),
                    createSemanticInsertInput()
                ]
            });
        }

        function createInsertCustomContentForm() {
            return new SimpleForm({
                maxContainerCols: 2,
                editable: true,
                content: [
                    new Label({ text: "Insert At:" }),
                    createCustomInsertInput()
                ]
            });
        }

        function createPagePropertiesForm() {
            return new SimpleForm({
                maxContainerCols: 2,
                editable: true,
                content: [
                    new Label({ text: "Target page:" }),
                    createPageSelect(),
                    new Label({ text: "Nav button:" }),
                    new Switch({
                        state: {
                            path: "status>/selectedPageId",
                            formatter: function (selectedPageId) {
                                return oStatusModel.getData()[selectedPageId]
                                    .showNavButton;
                            }
                        },
                        change: function () {
                            var bShow = this.getState();
                            var sPage = oStatusModel.getData().selectedPageId;
                            var oUpdate = {};
                            oUpdate[sPage] = { showNavButton: bShow };
                            oStatusModel.setData(oUpdate, true);
                            // Element.getElementById(sPage).setShowNavButton(bShow); //alternatively
                        }
                    }).setModel(oStatusModel, "status"),
                    new Label({ text: "Title:" }),
                    new Input("titleInput", {
                        value: {
                            path: "status>/selectedPageId",
                            formatter: function (selectedPageId) {
                                return oStatusModel.getData()[selectedPageId]
                                    .title;
                            }
                        }
                    }).setModel(oStatusModel, "status"),
                    new Button({
                        text: "SetTitle",
                        press: function () {
                            var sPage = oStatusModel.getData().selectedPageId;
                            var sTitle =
                                Element.getElementById("titleInput").getValue();

                            var oUpdate = {};
                            oUpdate[sPage] = { title: sTitle };
                            oStatusModel.setData(oUpdate, true);
                            //Element.getElementById(sPage).setTitle(sTitle); alternatively
                        }
                    })
                ]
            });
        }

        /**
         *
         * ACTIONS
         *
         */

        function onMultiSelectPress(oEvent) {
            var sState = oEvent.getSource().getPressed()
                ? "multiselect pressed"
                : "multiselect unpressed";
            oStatusModel.setData({ lastAction: sState }, true);
        }

        function onSemanticBtnPress(oEvent) {
            var oType = oEvent.oSource.getMetadata().getName();
            oType = oType.replace(
                oEvent.oSource.getMetadata().getLibraryName() + ".",
                ""
            );

            oStatusModel.setData({ lastAction: oType }, true);
        }

        function onSemanticSelectChange(oEvent, oData) {
            var oType = oEvent.oSource.getMetadata().getName();
            oType = oType.replace(
                oEvent.oSource.getMetadata().getLibraryName() + ".",
                ""
            );
            var oStatusText =
                oType + " by " + oEvent.oSource.getSelectedItem().getText();
            oStatusModel.setData({ lastAction: oStatusText }, true);
        }

        function onCustomBtnPress(oEvent) {
            oStatusModel.setData({ lastAction: "customButton press" }, true);
        }

        var fnCreateSemanticContent = function () {
            var oControlType =
                oStatusModel.getData().selectedSemanticControl.className;
            var oControl;

            if (oControlType === "AddAction") {
                oControl = new AddAction({
                    press: onSemanticBtnPress
                });

                var sSelectedButtonType =
                    oStatusModel.getData().selectedSemanticControl.buttonType;
                if (sSelectedButtonType !== "") {
                    oControl.setButtonType(sSelectedButtonType);
                }
            }

            if (oControlType === "SortSelect") {
                oControl = new SortSelect({
                    change: onSemanticSelectChange
                });
            }

            if (oStatusModel.getData().selectedSemanticControl.enabled !== "") {
                var bCustomEnabled =
                    oStatusModel.getData().selectedSemanticControl.enabled ===
                    "true";
                oControl.setEnabled(bCustomEnabled);
            }

            return oControl;
        };

        var fnCreateCustomContent = function () {
            var oControlType =
                oStatusModel.getData().selectedCustomControl.className;
            var oControl;

            if (oControlType === "Button") {
                oControl = new Button({
                    press: onCustomBtnPress,
                    text: oStatusModel.getData().selectedCustomControl.text,
                    icon: oStatusModel.getData().selectedCustomControl.icon
                });
            }

            if (oControlType === "OverflowToolbarButton") {
                oControl = new OverflowToolbarButton({
                    press: onCustomBtnPress,
                    text: oStatusModel.getData().selectedCustomControl.text,
                    icon: oStatusModel.getData().selectedCustomControl.icon
                });
            }

            if (oControlType === "Select") {
                oControl = new Select({
                    icon: oStatusModel.getData().selectedCustomControl.icon,
                    autoAdjustWidth:
                        oStatusModel.getData().selectedCustomControl
                            .autoAdjustWidth
                });
                var iconOnly =
                    oStatusModel.getData().selectedCustomControl.iconOnly ===
                    true;
                if (iconOnly) {
                    oControl.setType(SelectType.IconOnly);
                }
            }

            return oControl;
        };

        /**
         *
         * DIALOGS
         *
         */

        var oAddSemanticContentDialog = new Dialog({
            title: "Create semantic content",
            content: [
                createAddSemanticContentForm(),
                createSemanticButtonForm(),
                createSemanticSelectForm()
            ],
            buttons: [
                new Button({
                    text: "Add",
                    press: function () {
                        var oControl = fnCreateSemanticContent();
                        var oPage = Element.getElementById(
                            oStatusModel.getData().selectedPageId
                        );
                        oPage.addSemanticControl(oControl);

                        oAddSemanticContentDialog.close();
                    }
                }),
                new Button({
                    text: "Cancel",
                    press: function () {
                        oAddSemanticContentDialog.close();
                    }
                })
            ]
        });

        var oInsertSemanticContentDialog = new Dialog({
            title: "Insert semantic content",
            content: [
                createAddSemanticContentForm(),
                createInsertSemanticContentForm(),
                createSemanticButtonForm(),
                createSemanticSelectForm()
            ],
            buttons: [
                new Button({
                    text: "Insert",
                    press: function () {
                        var oControl = fnCreateSemanticContent();
                        var iIndex = parseInt(
                            oStatusModel.getData().selectedSemanticControl
                                .insertIndex
                        );
                        var oPage = Element.getElementById(
                            oStatusModel.getData().selectedPageId
                        );

                        oPage.insertSemanticControl(oControl, iIndex);

                        oInsertSemanticContentDialog.close();
                    }
                }),
                new Button({
                    text: "Cancel",
                    press: function () {
                        oInsertSemanticContentDialog.close();
                    }
                })
            ]
        });

        var oRemoveAllSemanticContentDialog = new Dialog({
            title: "Remove all semantic content",
            content: [createPageSelect()],
            buttons: [
                new Button({
                    text: "Remove All",
                    press: function () {
                        var oPage = Element.getElementById(
                            oStatusModel.getData().selectedPageId
                        );
                        oPage.removeAllSemanticControls();
                        oRemoveAllSemanticContentDialog.close();
                    }
                }),
                new Button({
                    text: "Cancel",
                    press: function () {
                        oRemoveAllSemanticContentDialog.close();
                    }
                })
            ]
        });

        var oAddCustomFooterContentDialog = new Dialog({
            title: "Create custom footer content",
            content: [
                createAddCustomFooterContentForm(),
                createCustomButtonForm(),
                createCustomSelectForm()
            ],
            buttons: [
                new Button({
                    text: "Add",
                    press: function () {
                        var oControl = fnCreateCustomContent();
                        var oPage = Element.getElementById(
                            oStatusModel.getData().selectedPageId
                        );
                        oPage.addCustomFooterContent(oControl);

                        oAddCustomFooterContentDialog.close();
                    }
                }),
                new Button({
                    text: "Cancel",
                    press: function () {
                        oAddCustomFooterContentDialog.close();
                    }
                })
            ]
        });

        var oInsertCustomFooterContentDialog = new Dialog({
            title: "Insert custom footer content",
            content: [
                createAddCustomFooterContentForm(),
                createInsertCustomContentForm(),
                createCustomButtonForm(),
                createCustomSelectForm()
            ],
            buttons: [
                new Button({
                    text: "Add",
                    press: function () {
                        var oControl = fnCreateCustomContent();
                        var oPage = Element.getElementById(
                            oStatusModel.getData().selectedPageId
                        );
                        var iIndex = parseInt(
                            oStatusModel.getData().selectedCustomControl
                                .insertIndex
                        );
                        oPage.insertCustomFooterContent(oControl, iIndex);

                        oInsertCustomFooterContentDialog.close();
                    }
                }),
                new Button({
                    text: "Cancel",
                    press: function () {
                        oInsertCustomFooterContentDialog.close();
                    }
                })
            ]
        });

        var oCustomFooterContentSelect = new Select(
            "customFooterContentSelect"
        );

        var oRemoveCustomFooterContentDialog = new Dialog({
            title: "Remove custom footer content",
            beforeOpen: function () {
                this.removeAllContent();

                var oForm = new SimpleForm({
                    maxContainerCols: 2,
                    editable: true
                });

                var oPageSelect = createPageSelect();

                function refreshContentSelect() {
                    oCustomFooterContentSelect.removeAllItems();
                    var oPage = Element.getElementById(
                        oStatusModel.getData().selectedPageId
                    );
                    var aContent = oPage.getCustomFooterContent();

					Array.from(aContent).forEach(function (oValue) {
						var sLabel = oValue.getText && oValue.getText();
						if (!sLabel) {
							sLabel = oValue.getIcon && oValue.getIcon();
						}
						if (!sLabel) {
							sLabel = oValue.getId();
						}
						oCustomFooterContentSelect.addItem(
							new Item({
								key: oValue.getId(),
								text: sLabel
							})
						);
					});
                }

                refreshContentSelect();

                oPageSelect.attachChange(refreshContentSelect);

                oForm.addContent(new Label({ text: "Target page:" }));
                oForm.addContent(oPageSelect);
                oForm.addContent(new Label({ text: "Control to remove:" }));
                oForm.addContent(oCustomFooterContentSelect);
                this.addContent(oForm);
            },
            buttons: [
                new Button({
                    text: "Remove",
                    press: function () {
                        var oPage = Element.getElementById(
                            oStatusModel.getData().selectedPageId
                        );
                        var oSelectedControlId = Element.getElementById(
                            "customFooterContentSelect"
                        )
                            .getSelectedItem()
                            .getKey();
                        var oSelectedControl =
                            Element.getElementById(oSelectedControlId);
                        oPage.removeCustomFooterContent(oSelectedControl);
                        oRemoveCustomFooterContentDialog.close();
                    }
                }),
                new Button({
                    text: "Cancel",
                    press: function () {
                        oRemoveCustomFooterContentDialog.close();
                    }
                })
            ]
        });

        var oRemoveAllCustomFooterContentDialog = new Dialog({
            title: "Remove all custom footer content",
            content: [createPageSelect()],
            buttons: [
                new Button({
                    text: "Remove All",
                    press: function () {
                        var oPage = Element.getElementById(
                            oStatusModel.getData().selectedPageId
                        );
                        oPage.removeAllCustomFooterContent();
                        oRemoveAllCustomFooterContentDialog.close();
                    }
                }),
                new Button({
                    text: "Cancel",
                    press: function () {
                        oRemoveAllCustomFooterContentDialog.close();
                    }
                })
            ]
        });

        var oAddCustomShareMenuContentDialog = new Dialog({
            title: "Create custom shareMenu content",
            content: [
                createAddCustomShareMenuContentForm(),
                createCustomButtonForm()
            ],
            buttons: [
                new Button({
                    text: "Add",
                    press: function () {
                        var oControl = fnCreateCustomContent();
                        var oPage = Element.getElementById(
                            oStatusModel.getData().selectedPageId
                        );
                        oPage.addCustomShareMenuContent(oControl);

                        oAddCustomShareMenuContentDialog.close();
                    }
                }),
                new Button({
                    text: "Cancel",
                    press: function () {
                        oAddCustomShareMenuContentDialog.close();
                    }
                })
            ]
        });

        var oInsertCustomShareMenuContentDialog = new Dialog({
            title: "Insert custom shareMenu content",
            content: [
                createAddCustomShareMenuContentForm(),
                createInsertCustomContentForm(),
                createCustomButtonForm()
            ],
            buttons: [
                new Button({
                    text: "Add",
                    press: function () {
                        var oControl = fnCreateCustomContent();
                        var oPage = Element.getElementById(
                            oStatusModel.getData().selectedPageId
                        );
                        var iIndex = parseInt(
                            oStatusModel.getData().selectedCustomControl
                                .insertIndex
                        );
                        oPage.insertCustomShareMenuContent(oControl, iIndex);

                        oInsertCustomShareMenuContentDialog.close();
                    }
                }),
                new Button({
                    text: "Cancel",
                    press: function () {
                        oInsertCustomShareMenuContentDialog.close();
                    }
                })
            ]
        });

        var oCustomShareMenuContentSelect = new Select(
            "customShareMenuContentSelect"
        );

        var oRemoveCustomShareMenuContentDialog = new Dialog({
            title: "Remove custom shareMenu content",
            beforeOpen: function () {
                this.removeAllContent();

                var oForm = new SimpleForm({
                    maxContainerCols: 2,
                    editable: true
                });

                var oPageSelect = createShareMenuPageSelect();
                var aPages = oPageSelect.getItems();
                if (aPages.length > 0) {
                    oPageSelect.setSelectedItem(aPages[0]);
                }

                function refreshContentSelect() {
                    oCustomShareMenuContentSelect.removeAllItems();
                    var oPage = Element.getElementById(
                        oPageSelect.getSelectedItem().getKey()
                    );
                    var aContent = oPage.getCustomShareMenuContent();

					Array.from(aContent).forEach(function (oValue) {
                        var sLabel = oValue.getText && oValue.getText();
                        if (!sLabel) {
                            sLabel = oValue.getIcon && oValue.getIcon();
                        }
                        if (!sLabel) {
                            sLabel = oValue.getId();
                        }
                        oCustomShareMenuContentSelect.addItem(
                            new Item({
                                key: oValue.getId(),
                                text: sLabel
                            })
                        );
                    });
                }

                refreshContentSelect();

                oPageSelect.attachChange(refreshContentSelect);

                oForm.addContent(new Label({ text: "Target page:" }));
                oForm.addContent(oPageSelect);
                oForm.addContent(new Label({ text: "Control to remove:" }));
                oForm.addContent(oCustomShareMenuContentSelect);
                this.addContent(oForm);
            },
            buttons: [
                new Button({
                    text: "Remove",
                    press: function () {
                        var oPage = Element.getElementById(
                            oStatusModel.getData().selectedPageId
                        );
                        var oSelectedControlId = Element.getElementById(
                            "customShareMenuContentSelect"
                        )
                            .getSelectedItem()
                            .getKey();
                        var oSelectedControl =
                            Element.getElementById(oSelectedControlId);
                        oPage.removeCustomShareMenuContent(oSelectedControl);
                        oRemoveCustomShareMenuContentDialog.close();
                    }
                }),
                new Button({
                    text: "Cancel",
                    press: function () {
                        oRemoveCustomShareMenuContentDialog.close();
                    }
                })
            ]
        });

        var oRemoveAllCustomShareMenuContentDialog = new Dialog({
            title: "Remove all custom shareMenu content",
            content: [createShareMenuPageSelect()],
            buttons: [
                new Button({
                    text: "Remove All",
                    press: function () {
                        var oPage = Element.getElementById(
                            oStatusModel.getData().selectedPageId
                        );
                        oPage.removeAllCustomShareMenuContent();
                        oRemoveAllCustomShareMenuContentDialog.close();
                    }
                }),
                new Button({
                    text: "Cancel",
                    press: function () {
                        oRemoveAllCustomShareMenuContentDialog.close();
                    }
                })
            ]
        });

        var oPagePropertiesDialog = new Dialog({
            title: "Edit page properties",
            content: [createPagePropertiesForm()],
            buttons: [
                new Button({
                    text: "Close",
                    press: function () {
                        oPagePropertiesDialog.close();
                    }
                })
            ]
        });

        var oModifyCustomFooterContentBox = new VBox({
            items: [
                new Title({ text: "CustomFooterContent:" }),
                new Link({
                    text: "Add",
                    press: function () {
                        oAddCustomFooterContentDialog.open();
                    }
                }),
                new Link({
                    text: "Insert",
                    press: function () {
                        oInsertCustomFooterContentDialog.open();
                    }
                }),
                new Link({
                    text: "Remove",
                    press: function () {
                        oRemoveCustomFooterContentDialog.open();
                    }
                }),
                new Link({
                    text: "RemoveAll",
                    press: function () {
                        oRemoveAllCustomFooterContentDialog.open();
                    }
                })
            ]
        });

        var oModifyCustomShareMenuContentBox = new VBox({
            items: [
                new Title({ text: "CustomShareMenuContent:" }),
                new Link({
                    text: "Add",
                    press: function () {
                        oAddCustomShareMenuContentDialog.open();
                    }
                }),
                new Link({
                    text: "Insert",
                    press: function () {
                        oInsertCustomShareMenuContentDialog.open();
                    }
                }),
                new Link({
                    text: "Remove",
                    press: function () {
                        oRemoveCustomShareMenuContentDialog.open();
                    }
                }),
                new Link({
                    text: "RemoveAll",
                    press: function () {
                        oRemoveAllCustomShareMenuContentDialog.open();
                    }
                })
            ]
        });

        var oModifyMessagesBox = new HBox({
            items: [oAddWarningButton, oClearWarningsButton]
        });

        var oModifyDraftBox = new HBox({
            items: [oSavingDraftButton, oSavedDraftButton]
        });
        var oModifyDraftBox2 = new HBox({
            items: [oClearDraftButton]
        });

        var oModifyFooter = new HBox({
            items: [
                new Button("showHideFooterBtn", {
                    text: "Show / Hide Footer",
                    press: function () {
                        var bShow = page1.getShowFooter();
                        var bShow2 = page2.getShowFooter();
                        page1.setShowFooter(!bShow);
                        page2.setShowFooter(!bShow2);
                    }
                })
            ]
        });

        var oStatusBox = new SimpleForm({
            maxContainerCols: 1,
            layout: SimpleFormLayout.ResponsiveGridLayout,
            editable: true,
            content: [
                new Text({ text: "Last action: " }),
                oStatusLabel,
                new Text({ text: "Multiselect pressed: " }),
                oPressedLabel
            ]
        });

        var oMenuPage = new Page("menuPage", {
            title: "Modify Content:",
            content: [
                new VBox({
                    items: [
                        oModifyMessagesBox,
                        oModifyDraftBox,
                        oModifyDraftBox2,
                        oModifyFooter,
                        oToggleMultiselectPressed,
                        oToggleMultiselectEnabled,
                        oModifyCustomFooterContentBox,
                        oModifyCustomShareMenuContentBox,
                        oStatusBox
                    ]
                })
            ]
        });

        var page1 = new MasterPage("master", {
            title: "{status>/master/title}",
            showNavButton: "{status>/master/showNavButton}",
            subHeader: new Bar({
                contentMiddle: [new SearchField()]
            }),
            multiSelectAction: new MultiSelectAction("multiselectAction", {
                press: onMultiSelectPress,
                pressed: "{status>/master/multiSelectPressed}",
                enabled: "{status>/master/multiSelectEnabled}"
            }).setModel(oStatusModel, "status"),
            addAction: new AddAction("addAction", {
                press: onSemanticBtnPress
            }),
            group: new GroupAction("groupAction", {
                press: onSemanticBtnPress
            }),
            sort: new SortSelect("sortSelect", {
                items: {
                    path: "testData>/sortItems",
                    template: oItemTemplate
                },
                change: onSemanticSelectChange
            }).setModel(oTestDataModel, "testData"),
            filter: new FilterAction("filterAction", {
                press: onSemanticBtnPress
            }),
            customHeaderContent: [new Button({ text: "Custom in header" })]
        }).setModel(oStatusModel, "status");
        var draftInd = new DraftIndicator();
        var page2 = new DetailPage("detail", {
            title: "{status>/detail/title}",
            showNavButton: "{status>/detail/showNavButton}",
            navButtonPress: function () {
                Log.info("Nav button pressed, arguments are:", arguments);
            },
            content: [],
            customHeaderContent: [new Button({ text: "CH" })],
            customFooterContent: [
                new Button({
                    text: "CustomBtnRight1",
                    press: onCustomBtnPress
                }),
                new OverflowToolbarButton({
                    icon: "sap-icon://settings",
                    text: "CustomBtnRight2",
                    press: onCustomBtnPress
                }),
                new OverflowToolbarButton({
                    icon: "sap-icon://video",
                    text: "CustomBtnRight3",
                    press: onCustomBtnPress
                }),
                new PagingButton({ count: 5 })
            ],
            customShareMenuContent: [
                new Button({
                    icon: "sap-icon://video",
                    text: "test",
                    press: onCustomBtnPress
                })
            ],
            messagesIndicator: new MessagesIndicator(),
            draftIndicator: draftInd,
            positiveAction: new PositiveAction("positiveAction", {
                text: "Positive",
                press: onSemanticBtnPress
            }),
            mainAction: new MainAction("mainAction", {
                text: "Main",
                press: onSemanticBtnPress
            }),
            negativeAction: new NegativeAction("negativeAction", {
                text: "Negative",
                press: onSemanticBtnPress
            }),
            editAction: new EditAction("editAction", {
                press: onSemanticBtnPress
            }),
            flagAction: new FlagAction("flagAction", {
                press: onSemanticBtnPress,
                pressed: true
            }),
            favoriteAction: new FavoriteAction("favoriteAction", {
                press: onSemanticBtnPress
            }),
            saveAction: new SaveAction("saveAction", {
                press: onSemanticBtnPress
            }),
            cancelAction: new CancelAction("cancelAction", {
                press: onSemanticBtnPress
            }),
            deleteAction: new DeleteAction("deleteAction", {
                press: onSemanticBtnPress
            }),
            forwardAction: new ForwardAction("forwardAction", {
                press: onSemanticBtnPress
            }),
            sendMessageAction: new SendMessageAction("sendMessageAction", {
                press: onSemanticBtnPress
            }),
            saveAsTileAction: new Button("saveAsTileBtn", {
                icon: "sap-icon://add-favorite",
                text: "Save as Tile"
            }),
            pagingAction: new PagingButton("pagingBtn", { count: 5 })
        }).setModel(oStatusModel, "status");
        var oSplitContainer = new SplitContainer("semanticPageContainer");

        oSplitContainer.addMasterPage(page1);
        oSplitContainer.addDetailPage(page2);

        app.addMasterPage(oMenuPage);
        app.addDetailPage(oSplitContainer);

        app.placeAt("body");
    }
);
