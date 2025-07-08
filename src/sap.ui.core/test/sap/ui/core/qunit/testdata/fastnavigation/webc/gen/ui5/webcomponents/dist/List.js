/*!
 * ${copyright}
 */
sap.ui.define(
    [
        "sap/ui/core/webc/WebComponent",
        "testdata/fastnavigation/webc/gen/ui5/webcomponents",
        "testdata/fastnavigation/webc/integration/List"
    ],
    function (WebComponentBaseClass) {
        "use strict";

        const WrapperClass = WebComponentBaseClass.extend(
            "testdata.fastnavigation.webc.gen.ui5.webcomponents.dist.List",
            {
                metadata: {
                    namespace:
                        "testdata/fastnavigation/webc/gen/ui5/webcomponents",
                    qualifiedNamespace:
                        "testdata.fastnavigation.webc.gen.ui5.webcomponents",
                    tag: "ui5-list-5acb3449",
                    interfaces: [],
                    properties: {
                        headerText: {
                            type: "string",
                            mapping: "property"
                        },
                        footerText: {
                            type: "string",
                            mapping: "property"
                        },
                        indent: {
                            type: "boolean",
                            mapping: "property",
                            defaultValue: false
                        },
                        selectionMode: {
                            type: "testdata.fastnavigation.webc.gen.ui5.webcomponents.ListSelectionMode",
                            mapping: "property",
                            defaultValue: "None"
                        },
                        noDataText: {
                            type: "string",
                            mapping: "property"
                        },
                        separators: {
                            type: "testdata.fastnavigation.webc.gen.ui5.webcomponents.ListSeparator",
                            mapping: "property",
                            defaultValue: "All"
                        },
                        growing: {
                            type: "testdata.fastnavigation.webc.gen.ui5.webcomponents.ListGrowingMode",
                            mapping: "property",
                            defaultValue: "None"
                        },
                        growingButtonText: {
                            type: "string",
                            mapping: "property"
                        },
                        loading: {
                            type: "boolean",
                            mapping: "property",
                            defaultValue: false
                        },
                        loadingDelay: {
                            type: "float",
                            mapping: "property",
                            defaultValue: 1000
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
                        accessibleRole: {
                            type: "testdata.fastnavigation.webc.gen.ui5.webcomponents.ListAccessibleRole",
                            mapping: "property",
                            defaultValue: "List"
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
                        items: {
                            type: "sap.ui.core.Control",
                            multiple: true
                        },
                        header: {
                            type: "sap.ui.core.Control",
                            multiple: true,
                            slot: "header"
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
                        itemClick: {
                            allowPreventDefault: true,
                            enableEventBubbling: true,
                            parameters: {
                                item: {
                                    type: "HTMLElement"
                                }
                            }
                        },
                        itemClose: {
                            allowPreventDefault: false,
                            enableEventBubbling: true,
                            parameters: {
                                item: {
                                    type: "HTMLElement"
                                }
                            }
                        },
                        itemToggle: {
                            allowPreventDefault: false,
                            enableEventBubbling: true,
                            parameters: {
                                item: {
                                    type: "HTMLElement"
                                }
                            }
                        },
                        itemDelete: {
                            allowPreventDefault: false,
                            enableEventBubbling: true,
                            parameters: {
                                item: {
                                    type: "HTMLElement"
                                }
                            }
                        },
                        selectionChange: {
                            allowPreventDefault: true,
                            enableEventBubbling: true,
                            parameters: {
                                selectedItems: {
                                    type: "testdata.fastnavigation.webc.gen.ui5.webcomponents.dist.ListItemBase"
                                },
                                previouslySelectedItems: {
                                    type: "testdata.fastnavigation.webc.gen.ui5.webcomponents.dist.ListItemBase"
                                }
                            }
                        },
                        loadMore: {
                            allowPreventDefault: false,
                            enableEventBubbling: true,
                            parameters: {}
                        },
                        moveOver: {
                            allowPreventDefault: true,
                            enableEventBubbling: true,
                            parameters: {
                                source: {
                                    type: "object"
                                },
                                destination: {
                                    type: "object"
                                }
                            }
                        },
                        move: {
                            allowPreventDefault: false,
                            enableEventBubbling: true,
                            parameters: {
                                source: {
                                    type: "object"
                                },
                                destination: {
                                    type: "object"
                                }
                            }
                        }
                    },
                    getters: ["listItems"],
                    methods: [],
                    defaultAggregation: "items",
                    designtime:
                        "testdata/fastnavigation/webc/gen/ui5/webcomponents/designtime/List.designtime"
                }
            }
        );

        return WrapperClass;
    }
);
