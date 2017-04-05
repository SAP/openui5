/*!
 * ${copyright}
 */
sap.ui.define([
    'jquery.sap.global', 'sap/ui/core/FragmentControl', 'sap/ui/core/FragmentControlMetadata'
], function(jQuery, FragmentControl, FragmentControlMetadata)
{
    "use strict";
    var Field = FragmentControl.extend("sap.ui.core.internal.samples.composite.fragmentcontrol.ex1.comp.field",
    {
        metadata:
        {
            properties:
            {
                text:
                {
                    type: "string",
                    defaultValue: "Default Value Text"
                },
                value:
                {
                    type: "string",
                    defaultValue: "Default Value Input"
                },
                textFirst:
                {
                    type: "string",
                    defaultValue: "y",
                    invalidate: FragmentControlMetadata.InvalidationMode.Template
                }
            }
        },
        fragment: "sap.ui.core.internal.samples.composite.fragmentcontrol.ex1.comp.field"
    });
    return Field;
}, /* bExport= */ true);
