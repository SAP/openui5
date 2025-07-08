/*!
 * ${copyright}
 */
sap.ui.define(
    [
        "sap/ui/core/webc/WebComponent",
        "sap/ui/core/EnabledPropagator",
        "sap/ui/core/message/MessageMixin",
        "testdata/fastnavigation/webc/gen/ui5/webcomponents",
        "testdata/fastnavigation/webc/integration/Input"
    ],
    function (WebComponentBaseClass, EnabledPropagator, MessageMixin) {
        "use strict";

        const WrapperClass = WebComponentBaseClass.extend(
            "testdata.fastnavigation.webc.gen.ui5.webcomponents.dist.Input",
            {
                metadata: {
                    namespace:
                        "testdata/fastnavigation/webc/gen/ui5/webcomponents",
                    qualifiedNamespace:
                        "testdata.fastnavigation.webc.gen.ui5.webcomponents",
                    tag: "ui5-input-5acb3449",
                    interfaces: ["sap.ui.core.IFormContent"],
                    properties: {
                        enabled: {
                            type: "boolean",
                            defaultValue: "true",
                            mapping: {
                                type: "property",
                                to: "disabled",
                                formatter: "_mapEnabled"
                            }
                        },
                        placeholder: {
                            type: "string",
                            mapping: "property"
                        },
                        readonly: {
                            type: "boolean",
                            mapping: "property",
                            defaultValue: false
                        },
                        required: {
                            type: "boolean",
                            mapping: "property",
                            defaultValue: false
                        },
                        noTypeahead: {
                            type: "boolean",
                            mapping: "property",
                            defaultValue: false
                        },
                        type: {
                            type: "testdata.fastnavigation.webc.gen.ui5.webcomponents.InputType",
                            mapping: "property",
                            defaultValue: "Text"
                        },
                        value: {
                            type: "string",
                            mapping: "property",
                            defaultValue: ""
                        },
                        valueState: {
                            type: "sap.ui.core.ValueState",
                            mapping: {
                                formatter: "_mapValueState",
                                parser: "_parseValueState"
                            },
                            defaultValue: "None"
                        },
                        name: {
                            type: "string",
                            mapping: "property"
                        },
                        showSuggestions: {
                            type: "boolean",
                            mapping: "property",
                            defaultValue: false
                        },
                        maxlength: {
                            type: "float",
                            mapping: "property"
                        },
                        accessibleName: {
                            type: "string",
                            mapping: "property"
                        },
                        accessibleDescription: {
                            type: "string",
                            mapping: "property"
                        },
                        accessibleDescriptionRef: {
                            type: "string",
                            mapping: "property"
                        },
                        showClearIcon: {
                            type: "boolean",
                            mapping: "property",
                            defaultValue: false
                        },
                        open: {
                            type: "boolean",
                            mapping: "property",
                            defaultValue: false
                        },
                        text: {
                            type: "string",
                            mapping: "textContent"
                        },
                        width: {
                            type: "sap.ui.core.CSSSize",
                            mapping: "style"
                        },
                        height: {
                            type: "sap.ui.core.CSSSize",
                            mapping: "style"
                        },
                        valueStateText: {
                            name: "valueStateText",
                            type: "string",
                            defaultValue: "",
                            mapping: {
                                type: "slot",
                                slotName: "valueStateMessage",
                                to: "div"
                            }
                        }
                    },
                    aggregations: {
                        suggestionItems: {
                            type: "testdata.fastnavigation.webc.gen.ui5.webcomponents.IInputSuggestionItem",
                            multiple: true
                        },
                        icon: {
                            type: "testdata.fastnavigation.webc.gen.ui5.webcomponents.IIcon",
                            multiple: true,
                            slot: "icon"
                        }
                    },
                    associations: {
                        ariaLabelledBy: {
                            type: "sap.ui.core.Control",
                            multiple: true,
                            mapping: {
                                type: "property",
                                to: "accessibleNameRef",
                                formatter: "_getAriaLabelledByForRendering"
                            }
                        }
                    },
                    events: {
                        change: {
                            allowPreventDefault: false,
                            enableEventBubbling: true,
                            parameters: {}
                        },
                        input: {
                            allowPreventDefault: true,
                            enableEventBubbling: true,
                            parameters: {}
                        },
                        select: {
                            allowPreventDefault: false,
                            enableEventBubbling: true,
                            parameters: {}
                        },
                        selectionChange: {
                            allowPreventDefault: false,
                            enableEventBubbling: true,
                            parameters: {
                                item: {
                                    type: "HTMLElement"
                                }
                            }
                        },
                        open: {
                            allowPreventDefault: false,
                            enableEventBubbling: true,
                            parameters: {}
                        },
                        close: {
                            allowPreventDefault: false,
                            enableEventBubbling: false,
                            parameters: {}
                        }
                    },
                    getters: [],
                    methods: [],
                    defaultAggregation: "suggestionItems",
                    designtime:
                        "testdata/fastnavigation/webc/gen/ui5/webcomponents/designtime/Input.designtime"
                }
            }
        );

        EnabledPropagator.call(WrapperClass.prototype);
        MessageMixin.call(WrapperClass.prototype);

        return WrapperClass;
    }
);
