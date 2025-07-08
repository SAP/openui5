/*!
 * ${copyright}
 */
sap.ui.define(
    [
        "sap/ui/core/webc/WebComponent",
        "testdata/fastnavigation/webc/gen/ui5/webcomponents"
    ],
    function (WebComponentBaseClass) {
        "use strict";

        const WrapperClass = WebComponentBaseClass.extend(
            "testdata.fastnavigation.webc.gen.ui5.webcomponents.dist.ListItemBase",
            {
                metadata: {
                    namespace:
                        "testdata/fastnavigation/webc/gen/ui5/webcomponents",
                    qualifiedNamespace:
                        "testdata.fastnavigation.webc.gen.ui5.webcomponents",
                    interfaces: [],
                    properties: {
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
                    aggregations: {},
                    associations: {},
                    events: {},
                    getters: [],
                    methods: [],
                    designtime:
                        "testdata/fastnavigation/webc/gen/ui5/webcomponents/designtime/ListItemBase.designtime"
                }
            }
        );

        return WrapperClass;
    }
);
