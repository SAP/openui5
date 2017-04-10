/*!
 * ${copyright}
 */

// Provides reuse functionality for reading documentation from api.json files (as created by the UI5 JSDoc3 template/plugin)
sap.ui.define(['jquery.sap.global'],
    function(jQuery) {
        "use strict";

        /**
         * Root path to read api.json files from
         */
        var sTestResourcesRoot;

        function getLibraryElementsJSONSync(sLibraryName) {
            var oResponse = {};
            if ( !sLibraryName ) {
                return undefined;
            }

            jQuery.ajax({
                async: false,
                url : sTestResourcesRoot + sLibraryName.replace(/\./g, '/') + '/designtime/api.json',
                dataType : 'json',
                success : function(vResponse) {
                    oResponse = vResponse.symbols;
                },
                error : function (err) {
                    oResponse = [];
                    jQuery.sap.log.error("failed to load api.json for: " + sLibraryName);
                }
            });
            return oResponse;
        }

        function getLibraryElementsJSONAsync(that, sLibraryName, _parseLibraryElements) {
            if ( !sLibraryName ) {
                return undefined;
            }

            jQuery.ajax({
                async: true,
                url : sTestResourcesRoot + sLibraryName.replace(/\./g, '/') + '/designtime/api.json',
                dataType : 'json',
                success : function(vResponse) {
                    _parseLibraryElements.call(that, vResponse.symbols);

                },
                error : function (err) {
                    jQuery.sap.log.error("failed to load api.json for: " + sLibraryName);
                }
            });
        }

        function setRoot(sRoot) {
            sRoot = sRoot == null ? jQuery.sap.getModulePath('', '/') + '../test-resources/' : sRoot;
            if ( sRoot.slice(-1) != '/' ) {
                sRoot += '/';
            }
            sTestResourcesRoot = sRoot;
        }

        setRoot();

        return {
            _setRoot : setRoot,
            getLibraryElementsJSONSync : getLibraryElementsJSONSync,
            getLibraryElementsJSONAsync: getLibraryElementsJSONAsync
        };

    });
