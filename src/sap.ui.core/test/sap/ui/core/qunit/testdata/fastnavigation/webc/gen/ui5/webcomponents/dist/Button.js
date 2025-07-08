/*!
 * ${copyright}
 */
sap.ui.define(
    [
        "sap/ui/core/webc/WebComponent",
        "sap/ui/core/EnabledPropagator",
        "testdata/fastnavigation/webc/gen/ui5/webcomponents",
        "testdata/fastnavigation/webc/integration/Button"
    ],
    function (WebComponentBaseClass, EnabledPropagator) {
        "use strict";

        const WrapperClass = WebComponentBaseClass.extend(
            "testdata.fastnavigation.webc.gen.ui5.webcomponents.dist.Button",
            {
                metadata: {
                    namespace:
                        "testdata/fastnavigation/webc/gen/ui5/webcomponents",
                    qualifiedNamespace:
                        "testdata.fastnavigation.webc.gen.ui5.webcomponents",
                    tag: "ui5-button-5acb3449",
                    interfaces: [
                        "testdata.fastnavigation.webc.gen.ui5.webcomponents.IButton"
                    ],
                    properties: {
                        design: {
                            type: "testdata.fastnavigation.webc.gen.ui5.webcomponents.ButtonDesign",
                            mapping: "property",
                            defaultValue: "Default"
                        },
                        enabled: {
                            type: "boolean",
                            defaultValue: "true",
                            mapping: {
                                type: "property",
                                to: "disabled",
                                formatter: "_mapEnabled"
                            }
                        },
                        icon: {
                            type: "string",
                            mapping: "property"
                        },
                        endIcon: {
                            type: "string",
                            mapping: "property"
                        },
                        submits: {
                            type: "boolean",
                            mapping: "property",
                            defaultValue: false
                        },
                        tooltip: {
                            type: "string",
                            mapping: "property"
                        },
                        accessibleName: {
                            type: "string",
                            mapping: "property"
                        },
                        accessibilityAttributes: {
                            type: "object",
                            mapping: "property",
                            defaultValue: {}
                        },
                        accessibleDescription: {
                            type: "string",
                            mapping: "property"
                        },
                        type: {
                            type: "testdata.fastnavigation.webc.gen.ui5.webcomponents.ButtonType",
                            mapping: "property",
                            defaultValue: "Button"
                        },
                        accessibleRole: {
                            type: "testdata.fastnavigation.webc.gen.ui5.webcomponents.ButtonAccessibleRole",
                            mapping: "property",
                            defaultValue: "Button"
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
                        }
                    },
                    aggregations: {
                        badge: {
                            type: "testdata.fastnavigation.webc.gen.ui5.webcomponents.dist.ButtonBadge",
                            multiple: true,
                            slot: "badge"
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
                        click: {
                            allowPreventDefault: true,
                            enableEventBubbling: true,
                            parameters: {
                                originalEvent: {
                                    type: "event"
                                },
                                altKey: {
                                    type: "boolean"
                                },
                                ctrlKey: {
                                    type: "boolean"
                                },
                                metaKey: {
                                    type: "boolean"
                                },
                                shiftKey: {
                                    type: "boolean"
                                }
                            }
                        }
                    },
                    getters: [],
                    methods: [],
                    designtime:
                        "testdata/fastnavigation/webc/gen/ui5/webcomponents/designtime/Button.designtime"
                }
            }
        );

        EnabledPropagator.call(WrapperClass.prototype);

        return WrapperClass;
    }
);
