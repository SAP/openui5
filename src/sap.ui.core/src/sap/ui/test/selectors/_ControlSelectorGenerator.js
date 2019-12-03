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
      * The selector should be unique in the control subtree with root oOptions.validationRoot. By default, this subtree is the entire app control tree.
      * @param {boolean} oOptions.shallow whether to do a shallow or deep search of the control tree to find a selector. Default value is false, enabling search through the tree.
      * @param {boolean} oOptions.multiple whether to return non-unique selectors as well. Default value is false, meaning that only unique selectors are returned.
      * @param {boolean} oOptions.includeAll whether to return all selectors, matching a unique control, or just the top one. Default value is false, meaning that at most one selector is returned.
      * @returns {Promise<object|Array|Error>} a plain object representation of a control or Error if none can be generated
      * If multiple selectors are requested, an array is returned.
      * @private
      */
    _ControlSelectorGenerator._generate = function (oOptions) {
        var oPlainGeneratorsPromise = oOptions.includeAll ? _ControlSelectorGenerator._executeAllPlainGenerators(selectors, oOptions)
            : _ControlSelectorGenerator._executeTopPlainGenerator(selectors, oOptions);
        return oPlainGeneratorsPromise
            .catch(function (oError) {
                if (oOptions.shallow) {
                    throw oError;
                } else {
                    // if 'plain' generators don't find a selector, search the hierarchy
                    return _ControlSelectorGenerator._generateHierarchicalUp(oOptions.control)
                        .catch(function () {
                            return  _ControlSelectorGenerator._generateHierarchicalDown(oOptions.control);
                        }).then(function (mSelector) {
                            return _ControlSelectorGenerator._filterUnique(mSelector, oOptions.validationRoot, oOptions.multiple);
                        });
                }
            });
    };

    // hieararchical search parameters. modify only when debugging
    var DEFAULT_MAX_DEPTH = 20;
    var DEAULT_MAX_WIDTH = 10;

    _ControlSelectorGenerator.setParams = function (mParams) {
        if (mParams.maxDepth && Number.isInteger(mParams.maxDepth) && mParams.maxDepth > 0) {
            _ControlSelectorGenerator._maxDepth = mParams.maxDepth;
        }
        if (mParams.maxWidth && Number.isInteger(mParams.maxWidth) && mParams.maxWidth > 0) {
            _ControlSelectorGenerator._maxWidth = mParams.maxWidth;
        }
    };

    _ControlSelectorGenerator.resetParams = function (iDepth) {
        _ControlSelectorGenerator._maxDepth = DEFAULT_MAX_DEPTH;
        _ControlSelectorGenerator._maxWidth = DEAULT_MAX_WIDTH;
    };

    _ControlSelectorGenerator.resetParams();

    /**
     * Execute all plain generators, in a certain sequence, and collect all selectors
     * @param {Array} aGenerators the generators to execute
     * @param {object} oOptions options passed to each generator
     * @returns {Array|Error} an array of selectors; can be an array of arrays. Error if no selectors are generated
     * @private
     */
     _ControlSelectorGenerator._executeAllPlainGenerators = function (aGenerators, oOptions) {
        return Promise.all(aGenerators.map(function (oGenerator) {
                return _ControlSelectorGenerator._executeGenerator(oGenerator, oOptions);
            })).then(function (aSelectors) {
                aSelectors = aSelectors.filter(function (vSelector) {
                    return vSelector && !$.isEmptyObject(vSelector) && (!$.isArray(vSelector) || vSelector.length);
                });
                if (aSelectors.length) {
                    _oLogger.debug("The matching " + (oOptions.multiple ? "non-unique" : "unique") + " selectors are: " + JSON.stringify(aSelectors));
                    return aSelectors;
                } else {
                    throw new Error("Could not generate a selector for control " + oOptions.control);
                }
            });
    };

    /**
     * Execute plain generators one by one according to their priority and stop at the first one that produces a selector.
     * Priority is defined by index in the aGenerators array
     * @param {Array} aGenerators the generators to execute
     * @param {object} oOptions options passed to each generator
     * @param {number} iIndex index of the generator to execute
     * @returns {object|Error} a selector or Error if none can be generated
     * @private
     */
    _ControlSelectorGenerator._executeTopPlainGenerator = function (aGenerators, oOptions, iIndex) {
        iIndex = iIndex || 0;
        if (iIndex === aGenerators.length) {
            throw new Error("Could not generate a selector for control " + oOptions.control);
        }
        return _ControlSelectorGenerator._executeGenerator(aGenerators[iIndex], oOptions)
            .then(function (aSelectors) {
                if (aSelectors.length) {
                    _oLogger.debug("The top priority " + (oOptions.multiple ? "non-unique" : "unique") + " selector is: " + JSON.stringify(aSelectors[0]));
                    return aSelectors[0];
                } else {
                    return _ControlSelectorGenerator._executeTopPlainGenerator(aGenerators, oOptions, iIndex + 1);
                }
            });
    };

    /**
     * Execute a single plain generator and validate the selector
     * @param {object} oGenerator the generator to execute
     * @param {object} oOptions options passed to the generator
     * @returns {object|Array} a selector or an array of selectors, depending on the options
     * @private
     */
    _ControlSelectorGenerator._executeGenerator = function (oGenerator, oOptions) {
        return _ControlSelectorGenerator._getValidationRootSelector(oGenerator, oOptions)
            .then(function (mRelativeSelector) {
                return _ControlSelectorGenerator._getAncestorSelector(oGenerator, oOptions)
                    .then(function (mAncestorSelector) {
                        // once all ancestor selectors are resolved, generate selector for the control itself
                        var vSelector = oGenerator.generate(oOptions.control, mAncestorSelector, mRelativeSelector);
                        return _ControlSelectorGenerator._filterUnique(vSelector, oOptions.validationRoot, oOptions.multiple);
                    });
            });
    };

    /**
     * Some generators require a validation root.
     * In this case, generate an 'intermediate' selector, relative to the validation root, that will be part of the main selector.
     * @param {object} oGenerator the generator with which a relative selector will be generated
     * @param {object} oOptions options passed to the generator
     * @returns {object} a selector that is unique relative to a validation root, if the generator requires a validation root.
     * or, null, if the generator doesn't require a validation root or it cannot be found.
     * @private
     */
    _ControlSelectorGenerator._getValidationRootSelector = function (oGenerator, oOptions) {
        oOptions = oOptions || {};
        return new Promise(function (resolve, reject) {
            if (oOptions.shallow || !oGenerator._isValidationRootRequired()) {
                resolve(null);
            } else {
                var oValidationRoot = oGenerator._getValidationRoot(oOptions.control);
                if (oValidationRoot) {
                    return _ControlSelectorGenerator._generateUniqueSelectorInSubtree(oOptions.control, oValidationRoot)
                        .then(function (mSelector) {
                            resolve(mSelector);
                        }).catch(function (oError) {
                            reject(oError);
                        });
                } else {
                    resolve(null);
                }
            }
        });
    };

     /**
     * Some generators require an ancestor.
     * In this case, generate an 'intermediate' selector for the ancestor, that will be part of the main selector.
     * @param {object} oGenerator the generator with which a relative selector will be generated
     * @param {object} oOptions options passed to the generator
     * @returns {object} a unique selector for the ancestor, if the generator requires an ancestor.
     * or, null, if the generator doesn't require an ancestor or it cannot be found.
     * @private
     */
    _ControlSelectorGenerator._getAncestorSelector = function (oGenerator, oOptions) {
        oOptions = oOptions || {};
        return new Promise(function (resolve, reject) {
            if (oOptions.shallow || !oGenerator._isAncestorRequired()) {
                resolve(null);
            } else {
                var oAncestor = oGenerator._getAncestor(oOptions.control);
                if (oAncestor) {
                    return _ControlSelectorGenerator._generate({
                        control: oAncestor
                    }).then(function (mSelector) {
                        resolve(mSelector);
                    }).catch(function (oError) {
                        _oLogger.debug("Could not generate selector for ancestor " + oAncestor + ". Error: " + oError);
                        resolve(null);
                    });
                } else {
                    resolve(null);
                }
            }
        });
    };

    /**
     * (slow) Use when no selector can be generated for the control by the plain generators.
     * Find an ancestor that is closest to the control, and has a selector that describes it uniquely within the app.
     * Then, find a selector for the control, which uniquely describes it within the ancestor subtree.
     * @param {object} oControl the control to use as a starting point for the search
     * @returns {object} a selector
     * @private
     */
    _ControlSelectorGenerator._generateHierarchicalUp = function (oControl) {
        return _ControlSelectorGenerator._generateUniqueAncestorSelector(oControl)
            .then(function (mUniqueAncestor) {
                return _ControlSelectorGenerator._generateUniqueSelectorInSubtree(oControl, mUniqueAncestor.ancestor)
                    .then(function (mRelativeSelector) {
                        return $.extend({}, mRelativeSelector, {
                            ancestor: mUniqueAncestor.selector
                        });
                    });
                    // .catch(function () {
                    //     // for every ancestor between validation root and 'unique' ancestor,
                    //     // find a 'sibling-level 'unique' selector for the ancestor, and then a unique selector for the control within the ancestor subtree
                    // })
            });
    };

    /**
     * (slow) Use when no selector can be generated for the control by the plain generators.
     * Find a selector that desribes the control within the app (doesn't have to be unique).
     * Then, find the closest of its descendants, which has a selector that uniquely describes it within the app.
     * @param {object} oControl the control to use as a starting point for the search
     * @returns {object} a selector
     * @private
     */
    _ControlSelectorGenerator._generateHierarchicalDown = function (oControl) {
        return _ControlSelectorGenerator._generate({
            control: oControl,
            shallow: true,
            multiple: true
        }).then(function (mMultiSelector) {
            return _ControlSelectorGenerator._generateUniqueDescendantSelector(oControl)
                .then(function (mUniqueDescendantSelector) {
                    return $.extend({}, mMultiSelector, {
                        descendant: mUniqueDescendantSelector
                    });
                });
        });
    };

    /**
     * Search the control aggregations for controls. For each child, try to generate a unique selector.
     * If it can't be generated, continue the search for the child's aggregations.
     * @param {object} oControl the control to use as a starting point for the search
     * @param {number} iDepth current depth of the tree of aggregated children with root oControl
     * @returns {object} a selector
     * @private
     */
    _ControlSelectorGenerator._generateUniqueDescendantSelector = function (oControl, iDepth) {
        return new Promise(function (resolve, reject) {
            iDepth = iDepth || 0;
            if (iDepth >= _ControlSelectorGenerator._maxDepth) {
                reject(new Error("Could not generate selector for descendant of " + oControl + ". Exceeded limit of " + _ControlSelectorGenerator._maxDepth + " levels"));
            } else {
                // extract all relevant children
                var aChildren = Object.keys(oControl.mAggregations).filter(function (sAggregation) {
                    // filter out aggregations with controls in them
                    var vAggregation = oControl.mAggregations[sAggregation];
                    return vAggregation && (($.isArray(vAggregation) && vAggregation.length) || (vAggregation.getMetadata && vAggregation.getMetadata().getName()));
                }).map(function (sAggregation) {
                    var vAggregation = oControl.mAggregations[sAggregation];
                    return $.isArray(vAggregation) ? vAggregation.slice(0, _ControlSelectorGenerator._maxWidth) : vAggregation;
                }).reduce(function (aResult, aAggregationChildren) {
                    // flatten
                    return aResult.concat(aAggregationChildren);
                }, []);

                return _ControlSelectorGenerator._generateUniqueSelectorForChild(aChildren)
                    .then(function (mSelector) {
                        resolve(mSelector);
                    }).catch(function () {
                         // search children's aggregations
                        return _ControlSelectorGenerator._callGenerateUniqueDescendant(aChildren, iDepth + 1)
                            .then(function (mSelector) {
                                resolve(mSelector);
                            })
                            .catch(function (oError) {
                                reject(oError);
                            });
                    });
            }
        });
    };

    /**
     * For each child of aChildren (depth iDepth in the descendant tree), search through its aggregations.
     * @param {Array} aChildren the children at iDepth
     * @param {number} iDepth current depth of the tree of aggregated children with root oControl
     * @param {number} iIndex index of the child for which to start the search
     * @returns {object} a selector
     * @private
     */
    _ControlSelectorGenerator._callGenerateUniqueDescendant = function (aChildren, iDepth, iIndex) {
        iIndex = iIndex || 0;
        if (iIndex >= aChildren.length) {
            throw new Error("Could not generate unique selector for descendant at level " + iDepth);
        }
        return _ControlSelectorGenerator._generateUniqueDescendantSelector(aChildren[iIndex], iDepth)
            .then(function (mSelector) {
                return mSelector;
            }).catch(function () {
                // search through other children of the same parent
                return _ControlSelectorGenerator._callGenerateUniqueDescendant(aChildren, iDepth, iIndex + 1);
            });
    };

     /**
     * For each child of aChildren (depth iDepth in the descendant tree), try to generate a unique selector.
     * @param {Array} aChildren the children at a certain depth
     * @param {number} iIndex index of the child for which to start the search
     * @returns {object} a selector
     * @private
     */
    _ControlSelectorGenerator._generateUniqueSelectorForChild = function (aChildren, iIndex) {
        iIndex = iIndex || 0;
        if (iIndex >= aChildren.length) {
            return Promise.reject();
        }
        return _ControlSelectorGenerator._generate({
            control: aChildren[iIndex],
            shallow: true
        }).then(function (mSelector) {
            return mSelector;
        }).catch(function (e) {
            // search through other children of the same parent
            return _ControlSelectorGenerator._generateUniqueSelectorForChild(aChildren, iIndex + 1);
        });
    };

    /**
     * Given a control, find its closest ancestor that has a unique selector within the app.
     * @param {object} oControl the control
     * @param {object} oUniqueAncestor the current ancestor
     * @param {number} iDepth how far up the tree is the current ancestor
     * @returns {object} a selector
     * @private
     */
    _ControlSelectorGenerator._generateUniqueAncestorSelector = function (oControl, oUniqueAncestor, iDepth) {
        oUniqueAncestor = oUniqueAncestor || oControl.getParent();
        iDepth = iDepth || 0;
        var bDepthExceeded = iDepth >= _ControlSelectorGenerator._maxDepth;
        if (!oUniqueAncestor || bDepthExceeded) {
            throw new Error("Could not generate unique selector for ancestor of " + oControl +
                (bDepthExceeded ? ". Exceeded limit of " + _ControlSelectorGenerator._maxDepth + " levels" : ""));
        }
        return _ControlSelectorGenerator._generate({
            control: oUniqueAncestor,
            shallow: true
        }).then(function (mAncestorSelector) {
            return {
                ancestor: oUniqueAncestor,
                selector: mAncestorSelector
            };
        }).catch(function (oError) {
            _oLogger.debug("Could not generate selector for ancestor " + oUniqueAncestor + ". Error: " + oError);
            return _ControlSelectorGenerator._generateUniqueAncestorSelector(oControl, oUniqueAncestor.getParent(), iDepth + 1);
        });
    };

    /**
     * Find a selector for oControl that is unique within the subtree with root oValidationRoot.
     * @param {object} oControl the control
     * @param {object} oValidationRoot the subtree root
     * @returns {object} a selector
     * @private
     */
    _ControlSelectorGenerator._generateUniqueSelectorInSubtree = function (oControl, oValidationRoot) {
        return _ControlSelectorGenerator._generate({
            control: oControl,
            validationRoot: oValidationRoot,
            shallow: true
        });
    };

     /**
     * Filters valid selectors.
     * @param {object} vSelector a control selector or array of selectors
     * @param {object} oValidationRoot the subtree root. If not defined, the selector will be valid for the entire app.
     * @param {boolean} bMultiple whether the selector can match mulitple controls. False by default.
     * @returns {array} an array of valid selectors
     * @private
     */
    _ControlSelectorGenerator._filterUnique = function (vSelector, oValidationRoot, bMultiple) {
        var aSelectors = [];
        var oSelectorValidator = new _ControlSelectorValidator(oValidationRoot, bMultiple);

        if ($.isArray(vSelector)) {
            // vSelector is an array when it includes multiple selectors of the same type (eg: 1 per property, each with a properties matcher)
            vSelector.forEach(function (vSelectorPerType) {
                // vSelector is an array of arrays (eg: 1 selector per binding part, each with a bindingPath matcher)
                if ($.isArray(vSelectorPerType)) {
                    vSelectorPerType.forEach(function (mSelectorPerPart) {
                        if (oSelectorValidator._validate(mSelectorPerPart)) {
                            aSelectors.push(mSelectorPerPart);
                        }
                    });
                } else if (oSelectorValidator._validate(vSelectorPerType)) {
                    aSelectors.push(vSelectorPerType);
                }
            });
        } else if (oSelectorValidator._validate(vSelector)) {
            aSelectors.push(vSelector);
        }

        return aSelectors;
    };

	return _ControlSelectorGenerator;
});
