/*!
 * ${copyright}
 */

 sap.ui.define([
    'sap/ui/base/ManagedObject',
    "sap/ui/test/_OpaLogger",
    'sap/ui/thirdparty/jquery',
    "sap/ui/test/selectors/_ControlSelectorValidator",
    'sap/ui/test/selectors/_selectors'
], function (ManagedObject, _OpaLogger, $, _ControlSelectorValidator, selectors) {
	"use strict";

    /**
     * Generate a unique selector for a control
     * @class Control selector generator
     * @extends sap.ui.base.ManagedObject
     * @alias sap.ui.test.selectors._ControlSelectorGenerator
     * @private
     */
    var _ControlSelectorGenerator = ManagedObject.extend("sap.ui.test.selectors._ControlSelectorGenerator");

    var _oLogger = _OpaLogger.getLogger("sap.ui.test.selectors._ControlSelectorGenerator");

     /**
      * generates control selector for a control.
      * @param {object} oOptions options to configure selector generation
      * @param {object} oOptions.control control for which to generate a selector
      * @param {object} oOptions.validationRoot control which will be used to test the selector
      * The selector should be unique in the control subtree with root oOptions.validationRoot. By default, this subtree is the entire control tree.
      * @returns {object|Error} a plain object representation of a control or Error if none can be generated
      * @private
      */
    _ControlSelectorGenerator._generate = function (oOptions) {
        // to simplify logic and testing, push all unique selectors and then get the first one
        // TODO: stop generation immediately on the first unique selector
        var aSelectors = [];
        var oSelectorValidator = new _ControlSelectorValidator(aSelectors, oOptions.validationRoot);
        var aOrderedGenerators = [selectors.globalID, selectors.viewID, selectors.labelFor,
            selectors.bindingPath, selectors.properties, selectors.dropdownItem, selectors.tableRowItem];

        aOrderedGenerators.forEach(function (oGenerator) {
            var mRelativeSelector;
            var mAncestorSelector;
            var mGeneratorAncestors = oGenerator._getAncestors(oOptions.control);
            // recursively generate any required ancestors and subtree selectors
            // avoid recursion when generating selector in subtree
            if (mGeneratorAncestors && !oOptions.validationRoot) {
                if (mGeneratorAncestors.validation) {
                    try {
                        mRelativeSelector = _ControlSelectorGenerator._generate({
                            control: oOptions.control,
                            validationRoot: mGeneratorAncestors.validation
                        });
                    } catch (oError) {
                        _oLogger.debug("Could not generate selector relative to ancestor " + mGeneratorAncestors.validation + ". Error: " + oError);
                    }
                }
                if (mGeneratorAncestors.selector) {
                    try {
                        mAncestorSelector = _ControlSelectorGenerator._generate({
                            control: mGeneratorAncestors.selector
                        });
                    } catch (oError) {
                        _oLogger.debug("Could not generate selector for ancestor " + mGeneratorAncestors.selector + ". Error: " + oError);
                    }
                }
            }

            var vSelector = oGenerator.generate(oOptions.control, mAncestorSelector, mRelativeSelector);

            // selectors can be an object, an array (eg: 1 per property), or array of arrays (eg: 1 per binding part)
            if ($.isArray(vSelector)) {
                vSelector.forEach(function (vSelectorPart) {
                    if ($.isArray(vSelectorPart)) {
                        /*eslint max-nested-callbacks: [0, 3]*/
                        vSelectorPart.forEach(function (mPart) {
                            oSelectorValidator._validate(mPart);
                        });
                    } else {
                        oSelectorValidator._validate(vSelectorPart);
                    }
                });
            } else {
                oSelectorValidator._validate(vSelector);
            }
        });

        if (aSelectors[0]) {
            _oLogger.debug("The top matching unique selector is: " + JSON.stringify(aSelectors[0]));
            return aSelectors[0];
        } else {
            throw new Error("Could not generate a selector for control " + oOptions.control);
        }
    };

	return _ControlSelectorGenerator;
});
