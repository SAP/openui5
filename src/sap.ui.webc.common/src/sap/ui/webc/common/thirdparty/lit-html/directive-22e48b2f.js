sap.ui.define(['exports'], function (exports) { 'use strict';

    /**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
    const PartType = {
        ATTRIBUTE: 1,
        CHILD: 2,
        PROPERTY: 3,
        BOOLEAN_ATTRIBUTE: 4,
        EVENT: 5,
        ELEMENT: 6,
    };
    const directive = (c) => (...values) => ({
        _$litDirective$: c,
        values,
    });
    class Directive {
        constructor(_partInfo) { }
        _$initialize(part, parent, attributeIndex) {
            this.__part = part;
            this._$parent = parent;
            this.__attributeIndex = attributeIndex;
        }
        _$resolve(part, props) {
            return this.update(part, props);
        }
        update(_part, props) {
            return this.render(...props);
        }
    }

    exports.Directive = Directive;
    exports.PartType = PartType;
    exports.directive = directive;

});
