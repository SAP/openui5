/*!
 * ${copyright}
 */

/* eslint-disable no-loop-func */

sap.ui.define(["sap/ui/thirdparty/jquery"], function(jQueryDOM) {
  "use strict";

  /**
   * For example: " Sold-to   (Party) " -> "Sold to Party"
   *
   * @param {string} sString - the string to normalize
   * @param {string} [sSpaceReplacement=" "] - string to fill the space between words. By default, just limits the
   *                                           return value to a single space between each word.
   * @returns {string} the normalized input string
   * @private
   * @function
   * @static
   */
  function normalize(sString, sSpaceReplacement) {
    sSpaceReplacement = sSpaceReplacement || " ";
    return sString
      .replace(/[\-_]/g, " ") // replaces all dashes or underscores with spaces
      .trim()
      .replace(/(?!\s)\W/g, "") // removes all non alphanumeric characters (except for spaces)
      .replace(/\s+/g, sSpaceReplacement); // replaces any space between words with the input sSpaceReplacement
  }

  /**
   * Provides utility functions for formatting 2D arrays of strings (such as the raw data loaded from a Gherkin
   * feature file) into a more useful format such as an array of objects or a single object. Also handles normalization
   * of the raw strings.
   *
   * @author Rodrigo Jordao
   * @author Jonathan Benn
   * @alias sap.ui.test.gherkin.dataTableUtils
   * @since 1.40
   * @namespace
   * @static
   * @public
   */
  var dataTableUtils = {

    /**
     * A simple object containing a series of normalization functions that change a string according to a
     * particular strategy. All strategies do the following normalization as a minimum:
     *
     * <ul>
     *   <li>Trim spaces off the string on both sides. For example: <code>" hello "</code> becomes
     *     <code>"hello"</code>.</li>
     *   <li>Assume that dashes and underscores are analogs for a space. For example: <code>"sold-to party"</code> and
     *     <code>"sold to party"</code> are equivalent, and would both convert to the camelCase
     *     <code>"soldToParty"</code>.</li>
     *   <li>Trim multiple spaces between words. For example: <code>"hello____world"</code> becomes
     *     <code>"hello world"</code>.</li>
     *   <li>Remove any characters that are not alphanumeric or whitespace. For example: <code>"(hello)"</code> becomes
     *     <code>"hello"</code>.</li>
     * </ul>
     *
     * @alias sap.ui.test.gherkin.dataTableUtils.normalization
     * @namespace
     * @static
     * @public
     */
    normalization: {

      /**
       * For example: "first name" -> "First Name"
       *
       * @param {string} sString - the string to normalize
       * @returns {string} the normalized input string with all words capitalized
       * @public
       * @function
       * @static
       */
      titleCase : function(sString) {
        dataTableUtils._testNormalizationInput(sString, "titleCase");
        return normalize(sString)
          .replace(/\w*/g, function(s){return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();});
      },

      /**
       * For example: "first name" -> "FirstName"
       *
       * @param {string} sString - the string to normalize
       * @returns {string} the normalized input string with all words capitalized and all spaces removed
       * @public
       * @function
       * @static
       */
      pascalCase : function(sString) {
        dataTableUtils._testNormalizationInput(sString, "pascalCase");
        return dataTableUtils.normalization.titleCase(sString).split(/\s/).join("");
      },

      /**
       * For example: "First Name" -> "firstName"
       *
       * @param {string} sString - the string to normalize
       * @returns {string} the normalized input string with all words after the first capitalized and all spaces
       *                   removed
       * @public
       * @function
       * @static
       */
      camelCase : function(sString) {
        dataTableUtils._testNormalizationInput(sString, "camelCase");
        return dataTableUtils.normalization.pascalCase(sString).replace(/^(\w)/, function(s){return s.toLowerCase();});
      },

      /**
       * For example: "First Name" -> "first-name"
       *
       * @param {string} sString - the string to normalize
       * @returns {string} the normalized input string changed to lower case and with space between words
       *                   replaced by a hyphen ("-")
       * @public
       * @function
       * @static
       */
      hyphenated : function(sString) {
        dataTableUtils._testNormalizationInput(sString, "hyphenated");
        return normalize(sString, "-").toLowerCase();
      },

      /**
       * For example: "First Name" -> "First Name"
       *
       * @param {string} sString - the string to normalize
       * @returns {string} the original unchanged input string
       * @public
       * @function
       * @static
       */
      none : function(sString) {
        dataTableUtils._testNormalizationInput(sString, "none");
        return sString;
      }
    },

    /**
     * Takes the inputed 2D array "aData" and returns an equivalent array of objects. The data is expected to
     * have a header row, with each subsequent row being an entity, and each column being a property of that
     * entity. E.g.
     * <pre>
     *   [
     *     ["Their Name",  "Their Age"],
     *     ["Alice",       "16"],
     *     ["Bob",         "22"]
     *   ]
     * </pre>
     *
     * The data's column headers become the returned objects' property names. The property names get normalized
     * according to the strategy defined by the parameter "vNorm". E.g. using hyphenation strategy this is returned:
     * <pre>
     *   [
     *     {their-name: "Alice", their-age: "16"},
     *     {their-name: "Bob", their-age: "22"}
     *   ]
     * </pre>
     *
     * @param {string[]} aData - the 2D array of strings to be converted, with a header row
     * @param {(string|function)} [vNorm="none"] - the normalization function to use to normalize property
     *                                             names. Can also be a String with values "titleCase", "pascalCase",
     *                                             "camelCase", "hyphenated" or "none".
     * @returns {object[]} - an array of objects equivalent to the input data, with property names normalized
     * @throws {Error} if the inputed array aData contains duplicate values in the header row
     * @public
     * @function
     * @static
     */
    toTable : function(aData, vNorm) {

      this._testArrayInput(aData, "toTable");
      var fnNorm = this._getNormalizationFunction(vNorm, "toTable");

      // first row are the object's keys (table column headers)
      var aKeys = aData[0].map(fnNorm);

      // transform the remaining rows
      return aData.slice(1).map(function(aRow) {
        var oGenerated = {};

        // for each key
        for (var i = 0; i < aKeys.length; ++i) {
          var sCurrentKey = aKeys[i];

          // if this is the first time the key is being used
          if (oGenerated.hasOwnProperty(sCurrentKey) === false) {
            // then add the new key and its associated value to the generated object
            oGenerated[sCurrentKey] = aRow[i];

          // else if this is a repeat use of the key
          } else {
            throw new Error("dataTableUtils.toTable: data table contains duplicate header: | " + sCurrentKey + " |");
          }
        }
        return oGenerated;
      });
    },

    /**
     * Takes the inputed 2D array "aData" and returns an equivalent object. Each row of data is expected to
     * be a property-value pair. To create nested objects, add extra columns to the data. E.g.
     * <pre>
     *  [
     *    ["Name", "Alice"],
     *    ["Mass", "135 lbs"],
     *    ["Telephone Number", "Home", "123-456-7890"],
     *    ["Telephone Number", "Work", "123-456-0987"]
     *  ]
     * </pre>
     * For each data row, the right-most element becomes a property value, and everything else is a property
     * name. The property names get normalized according to the strategy defined by the parameter "vNorm".
     * E.g. using camelCase strategy
     * <pre>
     *   {
     *     name: "Alice",
     *     mass: "135 lbs",
     *     telephoneNumber: {
     *       home: "123-456-7890",
     *       work: "123-456-0987"
     *     }
     *   }
     * </pre>
     * @param {string[]} aData - the 2D array of strings to be converted
     * @param {(string|function)} [vNorm="none"] - the normalization function to use to normalize property
     *                                             names. Can also be a string with values "titleCase", "pascalCase",
     *                                             "camelCase", "hyphenated" or "none".
     * @returns {object} - an object equivalent to the input data, with property names normalized
     * @throws {Error} if the inputed array aData contains duplicate keys such that a row would be overwritten
     * @public
     * @function
     * @static
     */
    toObject : function(aData, vNorm) {

      this._testArrayInput(aData, "toObject");
      var fnNorm = this._getNormalizationFunction(vNorm, "toObject");
      this._detectDuplicateKeys(aData, fnNorm);
      var oResult = {};

      // for each row in the inputed data
      aData.forEach(function(aRow) {

        var sKey = fnNorm(aRow[0]);
        var vValue = aRow.slice(1); // vValue starts as an array and becomes a string or object

        // if the value is an array with a single string
        if (vValue.length === 1) {
          // then transform vValue into a string
          vValue = vValue[0];

        // else if the value array contains multiple strings
        } else {
          // then transform vValue into an object (might be a nested object)

          // this function transforms the array into a nested object, e.g. ["A", "B", "C"] => {A: {B: "C"}}
          vValue = vValue.reduceRight(function(i,j) {var o = {}; o[fnNorm(j)] = i; return o;});
        }

        // if this is a new key
        if (!oResult.hasOwnProperty(sKey)) {
          // then just add the new string/object directly
          oResult[sKey] = vValue;

        // else if we are adding an object for a key that already contains an object
        } else {
          // then merge the new object with the existing one
          jQueryDOM.extend(oResult[sKey], vValue);
        }

      });

      return oResult;
    },

    /**
     * Detects errors in aData due to duplicate keys, and throws an Error if an issue was found
     *
     * @param {string[]} aData - a 2D array of strings
     * @param {function} fnNorm - the normalization function to use to normalize keys
     * @throws {Error} if the inputed array aData contains duplicate keys such that a row would be overwritten
     * @private
     */
    _detectDuplicateKeys: function(aData, fnNorm) {

      var oRowSet = {}; // used to help us identify duplicate keys

      // for each row in the inputed data
      aData.forEach(function(aRow) {
        var aKeys = aRow.slice(0, (aRow.length - 1)).map(fnNorm);

        // for each hierarchical level of the keys
        // e.g. when aKeys = ['A', 'B', 'C'], then sKeys will have the values 'A-B-C', 'A-B' and 'A', in that order
        for (var i = aKeys.length; i > 0; --i) {
          var sKeys = aKeys.slice(0, i).join('-');

          // if this set of keys is unique so far
          if (!oRowSet[sKeys]) {
            // then take note of it for next time
            oRowSet[sKeys] = aRow;

          // else if this set of keys is NOT unique
          } else {

            var aOldRow = oRowSet[sKeys];
            var aOldKeys = aOldRow.slice(0, (aOldRow.length - 1)).map(fnNorm);

            // if the new row would overwrite the old one
            if ( (aOldRow.length !== aRow.length) ||
                 (aOldKeys.every(function(str, index) {return aKeys[index] === str;})) ) {

              var sOutput = "| " + aOldRow.join(" | ") + " |";
              throw new Error("dataTableUtils.toObject: data table row is being overwritten: " + sOutput);
            }
          }
        }
      });
    },

    /**
     * Finds the normalization function equivalent to input parameter "vFun"
     *
     * @param {(string|function)} [vFun="none"] - a normalization function. Can also be a string with values
     *                                            "titleCase", "pascalCase", "camelCase", "hyphenated" or "none".
     * @param {string} sFunc - the name of the calling function, for error reporting
     * @returns {function} the normalization function equivalent to the inputed value, or <none> if the input was
     *                     undefined.
     * @throws {Error} if the input string is invalid
     * @private
     */
    _getNormalizationFunction: function(vFun, sFunc) {

      var sErrorMessage = "dataTableUtils." + sFunc + ": parameter 'vNorm' must be either a Function or a String with the value 'titleCase', 'pascalCase', 'camelCase', 'hyphenated' or 'none'";

      if (typeof vFun === "string" || vFun instanceof String) {
        var fnNormalize = this.normalization[vFun];
        if (fnNormalize === undefined) {
          throw new Error(sErrorMessage);
        }
        return fnNormalize;
      } else if (typeof vFun === "function") {
        return vFun;
      } else if (vFun === undefined || vFun === null) {
        return this.normalization.none;
      } else {
        throw new Error(sErrorMessage);
      }
    },

    /**
     * Tests a normalization function's input parameter to make sure it's valid
     *
     * @param {string} sString - the parameter to test
     * @param {string} sNormalizationFunction - the normalization function whose input we're testing
     * @throws {Error} if the input string is invalid
     * @private
     */
    _testNormalizationInput: function(sString, sNormalizationFunction) {
      if (typeof sString !== "string" && !(sString instanceof String)) {
        throw new Error("dataTableUtils.normalization." + sNormalizationFunction + ": parameter 'sString' must be a valid string");
      }
    },

    /**
     * Tests a conversion function's input parameter to make sure it's valid
     *
     * @param {array} aArray - the parameter to test
     * @param {string} sFunc - the conversion function whose input we're testing (e.g. "toObject" or "toTable")
     * @throws {Error} if the input parameter is invalid
     * @private
     */
    _testArrayInput: function(aArray, sFunc) {

      var sErrorMessage = "dataTableUtils." + sFunc + ": parameter 'aData' must be an Array of Array of Strings";

      if (!Array.isArray(aArray)) {
        throw new Error(sErrorMessage);
      }

      if (!aArray.every(function(a) {
            return Array.isArray(a) && (a.every(function(s){return (typeof s === "string" || s instanceof String);}));
          })) {
        throw new Error(sErrorMessage);
      }
    }
  };

  return dataTableUtils;
}, /* bExport= */ true);
