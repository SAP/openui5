sap.ui.define(
    [
        "sap/ui/core/library",
        "sap/ui/core/Title",
        "sap/m/App",
        "sap/m/Page",
        "sap/m/Toolbar",
        "sap/m/CheckBox",
        "sap/m/Text",
        "sap/ui/layout/form/SimpleForm"
    ],
    function (
        coreLibrary,
        Title,
        App,
        Page,
        Toolbar,
        CheckBox,
        Text,
        SimpleForm
    ) {
        "use strict";

        var TextDirection = coreLibrary.TextDirection;
        var TitleLevel = coreLibrary.TitleLevel;
        var TextAlign = coreLibrary.TextAlign;

        var oToolbar = new Toolbar("toolbar", {
            enabled: true,
            content: [
                new CheckBox({
                    id: "cb_in_toolbar",
                    text: "In toolbar"
                })
            ]
        });

        var oCheckBoxRTL = new CheckBox({
            text: "+012 345 679",
            textDirection: TextDirection.LTR
        });
        oCheckBoxRTL.setTextAlign = function () {};

        function createContent() {
            return [
                new CheckBox({
                    id: "cb_selected_enabled",
                    visible: true,
                    selected: true,
                    enabled: true,
                    tooltip: "Sample Label"
                }),
                new CheckBox({
                    id: "cb_selected_disabled",
                    visible: true,
                    selected: true,
                    enabled: false,
                    tooltip: "Sample Label"
                }),
                new CheckBox({
                    id: "cb_deselected_enabled",
                    visible: true,
                    selected: false,
                    enabled: true,
                    tooltip: "Sample Label"
                }),
                new CheckBox({
                    id: "cb_required",
                    visible: true,
                    selected: false,
                    enabled: true,
                    required: true,
                    tooltip: "Sample Label",
                    text: "I accept the terms and conditions."
                }),
                new CheckBox({
                    id: "cb_disabled_deselected",
                    visible: true,
                    selected: false,
                    enabled: false,
                    tooltip: "Sample Label"
                }),
                new CheckBox({
                    id: "cb_with_label_size",
                    visible: true,
                    selected: true,
                    enabled: true,
                    width: "100px",
                    text: "Label 100px"
                }),
                new CheckBox({
                    id: "cb_not_editable",
                    enabled: true,
                    visible: true,
                    selected: true,
                    editable: false,
                    text: "Not editable - no value state shown",
                    valueState: "Warning"
                }),
                new CheckBox({
                    id: "cb_display_only_checked",
                    visible: true,
                    enabled: true,
                    displayOnly: true,
                    editable: false,
                    selected: true,
                    text: "Display Only Checked"
                }),
                new CheckBox({
                    id: "cb_display_only",
                    visible: true,
                    enabled: true,
                    displayOnly: true,
                    editable: false,
                    selected: false,
                    text: "Display Only"
                }),
                new CheckBox({
                    id: "cb_disabled_and_display_only",
                    visible: true,
                    enabled: false,
                    displayOnly: true,
                    editable: true,
                    selected: false,
                    text: "Disabled and Display Only (has no effect)"
                }),
                new CheckBox({
                    id: "cb_enabled_editable_and_display_only",
                    visible: true,
                    enabled: true,
                    displayOnly: true,
                    editable: true,
                    selected: true,
                    text: "Enabled, Display Only and Editable"
                }),
                new CheckBox({
                    visible: true,
                    selected: true,
                    enabled: true,
                    textDirection: "RTL",
                    text: "Text direction RTL"
                }),
                new CheckBox({
                    id: "cb_warning_deselected",
                    text: "Warning",
                    valueState: "Warning"
                }),
                new CheckBox({
                    id: "cb_warning_selected",
                    text: "Warning checked",
                    selected: true,
                    valueState: "Warning"
                }),
                new CheckBox({
                    id: "cb_warning_selected_disabled",
                    text: "Warning disabled",
                    selected: true,
                    enabled: false,
                    valueState: "Warning"
                }),
                new CheckBox({
                    id: "cb_success_deselected",
                    text: "Success",
                    valueState: "Success"
                }),
                new CheckBox({
                    id: "cb_success_selected",
                    text: "Success checked",
                    selected: true,
                    valueState: "Success"
                }),
                new CheckBox({
                    id: "cb_success_selected_disabled",
                    text: "Success disabled",
                    selected: true,
                    enabled: false,
                    valueState: "Success"
                }),
                new CheckBox({
                    id: "cb_error_deselected",
                    text: "Error",
                    valueState: "Error"
                }),
                new CheckBox({
                    id: "cb_error_selected",
                    text: "Error checked",
                    selected: true,
                    valueState: "Error"
                }),
                new CheckBox({
                    id: "cb_error_selected_disabled",
                    text: "Error disabled - no value state shown",
                    selected: true,
                    enabled: false,
                    valueState: "Error"
                }),
                new CheckBox({
                    id: "cb_information_deselected",
                    text: "Information",
                    valueState: "Information"
                }),
                new CheckBox({
                    id: "cb_information_selected",
                    text: "Information checked",
                    selected: true,
                    valueState: "Information"
                }),
                new CheckBox({
                    id: "cb_information_selected_disabled",
                    text: "Information disabled",
                    selected: true,
                    enabled: false,
                    valueState: "Information"
                }),
                new CheckBox({
                    id: "cb_partially_selected",
                    selected: true,
                    partiallySelected: true,
                    text: "Partially Selected"
                }),
                new CheckBox({
                    id: "cb_enable_disable_toolbar",
                    visible: true,
                    selected: true,
                    enabled: true,
                    text: "Enable/disable toolbar",
                    select: function () {
                        oToolbar.setEnabled(this.getSelected());
                    }
                }),
                oToolbar,
                new SimpleForm({
                    id: "sf_with_checkbox",
                    title: new Title({
                        text: "Form containing a CheckBox",
                        level: TitleLevel.H2
                    }),
                    editable: true,
                    content: [
                        new CheckBox({
                            id: "cb_in_a_form",
                            selected: true,
                            text: "CheckBox in a Form"
                        })
                    ]
                }),
                // RTL sapmple - set page in rtl mode to explore (sap-ui-rtl='true')
                new Toolbar({
                    content: new Text({
                        text: "RTL sapmple - set page in rtl mode to explore (sap-ui-rtl='true')"
                    })
                }),
                new Toolbar({
                    content: [
                        new CheckBox({
                            text: "+012 345 678"
                        }),
                        new Text({ text: "Default" })
                    ]
                }),
                new Toolbar({
                    content: [
                        oCheckBoxRTL,
                        new Text({
                            text: "textDirection: LTR, no textAlign"
                        })
                    ]
                }),
                new Toolbar({
                    content: [
                        new CheckBox({
                            text: "+012 345 670",
                            textAlign: TextAlign.Right,
                            textDirection: TextDirection.LTR
                        }),
                        new Text({
                            text: "textDirection: LTR, textAlign: Right"
                        })
                    ]
                })
            ];
        }

        new App({
            pages: [
                new Page("checkbox-page", {
                    title: "CheckBox",
                    titleLevel: TitleLevel.H1,
                    content: [createContent()]
                })
            ]
        }).placeAt("content");
    }
);
