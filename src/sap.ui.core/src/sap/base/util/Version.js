/*!
 * ${copyright}
 */
sap.ui.define([], function() {

	"use strict";

	// @evo-todo make it a simple object with immutable properties (Object.defineProperties)

	// -------------------------- VERSION -------------------------------------
	var rVersion = /^[0-9]+(?:\.([0-9]+)(?:\.([0-9]+))?)?(.*)$/;

	/**
	 * Returns a Version instance created from the given parameters.
	 *
	 * This function can either be called as a constructor (using <code>new</code>) or as a normal function.
	 * It always returns an immutable Version instance.
	 *
	 * The parts of the version number (major, minor, patch, suffix) can be provided in several ways:
	 * <ul>
	 * <li>Version("1.2.3-SNAPSHOT")    - as a dot-separated string. Any non-numerical char or a dot followed
	 *                                    by a non-numerical char starts the suffix portion. Any missing major,
	 *                                    minor or patch versions will be set to 0.</li>
	 * <li>Version(1,2,3,"-SNAPSHOT")   - as individual parameters. Major, minor and patch must be integer numbers
	 *                                    or empty, suffix must be a string not starting with digits.</li>
	 * <li>Version([1,2,3,"-SNAPSHOT"]) - as an array with the individual parts. The same type restrictions apply
	 *                                    as before.</li>
	 * <li>Version(otherVersion)        - as a Version instance (cast operation). Returns the given instance instead
	 *                                    of creating a new one.</li>
	 * </ul>
	 *
	 * To keep the code size small, this implementation mainly validates the single string variant.
	 * All other variants are only validated to some degree. It is the responsibility of the caller to
	 * provide proper parts.
	 *
	 * @param {int|string|any[]|module:sap/base/util/Version} vMajor the major part of the version (int) or any of the single
	 *        parameter variants explained above.
	 * @param {int} [iMinor] the minor part of the version number
	 * @param {int} [iPatch] the patch part of the version number
	 * @param {string} [sSuffix] the suffix part of the version number
	 * @class Represents a version consisting of major, minor, patch version, and suffix, for example '1.2.7-SNAPSHOT'.
	 * @since 1.58
	 * @alias module:sap/base/util/Version
	 * @public
	 */
	function Version(vMajor, iMinor, iPatch, sSuffix) {
		if ( vMajor instanceof Version ) {
			// note: even a constructor may return a value different from 'this'
			return vMajor;
		}
		if ( !(this instanceof Version) ) {
			// act as a cast operator when called as function (not as a constructor)
			return new Version(vMajor, iMinor, iPatch, sSuffix);
		}

		var m;
		if (typeof vMajor === "string") {
			m = rVersion.exec(vMajor);
		} else if (Array.isArray(vMajor)) {
			m = vMajor;
		} else {
			m = arguments;
		}
		m = m || [];

		function norm(v) {
			v = parseInt(v);
			return isNaN(v) ? 0 : v;
		}
		vMajor = norm(m[0]);
		iMinor = norm(m[1]);
		iPatch = norm(m[2]);
		sSuffix = String(m[3] || "");

		/**
		 * Returns a string representation of this version.
		 *
		 * @returns {string} a string representation of this version.
		 * @public
		 */
		this.toString = function() {
			return vMajor + "." + iMinor + "." + iPatch + sSuffix;
		};

		/**
		 * Returns the major version part of this version.
		 *
		 * @returns {int} the major version part of this version
		 * @public
		 */
		this.getMajor = function() {
			return vMajor;
		};

		/**
		 * Returns the minor version part of this version.
		 *
		 * @returns {int} the minor version part of this version
		 * @public
		 */
		this.getMinor = function() {
			return iMinor;
		};

		/**
		 * Returns the patch (or micro) version part of this version.
		 *
		 * @returns {int} the patch version part of this version
		 * @public
		 */
		this.getPatch = function() {
			return iPatch;
		};

		/**
		 * Returns the version suffix of this version.
		 *
		 * @returns {string} the version suffix of this version
		 * @public
		 */
		this.getSuffix = function() {
			return sSuffix;
		};

		/**
		 * Compares this version with a given one.
		 *
		 * The version with which this version should be compared can be given as a <code>sap/base/util/Version</code> instance,
		 * as a string (e.g. <code>v.compareTo("1.4.5")</code>). Or major, minor, patch and suffix values can be given as
		 * separate parameters (e.g. <code>v.compareTo(1, 4, 5)</code>) or in an array (e.g. <code>v.compareTo([1, 4, 5])</code>).
		 *
		 * @param {int|string|any[]|module:sap/base/util/Version} vOtherMajor
		 *                The major part (an integer) of the version to compare to or the full version in any of the single
		 *                parameter variants, as documented for the {@link module:sap/base/util/Version constructor}.
		 * @param {int} [iOtherMinor] A minor version to compare to (only valid when <code>vOther</code> is a single integer)
		 * @param {int} [iOtherPatch] A patch version to compare to (only valid when <code>vOther</code> is a single integer)
		 * @param {string} [sOtherSuffix] A version suffix like "-SNAPSHOT" to compare to (only valid when <code>vOther</code> is an integer)
		 * @returns {int} 0, if the given version is equal to this version, a negative value if the given other version is greater
		 *               and a positive value otherwise
		 * @public
		 */
		this.compareTo = function(vOtherMajor, iOtherMinor, iOtherPatch, sOtherSuffix) {
			var vOther = Version.apply(window, arguments);
			/*eslint-disable no-nested-ternary */
			return vMajor - vOther.getMajor() ||
					iMinor - vOther.getMinor() ||
					iPatch - vOther.getPatch() ||
					((sSuffix < vOther.getSuffix()) ? -1 : (sSuffix === vOther.getSuffix()) ? 0 : 1);
			/*eslint-enable no-nested-ternary */
		};

	}

	/**
	 * Checks whether this version is in the range of the given interval (start inclusive, end exclusive).
	 *
	 * The boundaries against which this version should be checked can be given as  <code>sap/base/util/Version</code>
	 * instances (e.g. <code>v.inRange(v1, v2)</code>), as strings (e.g. <code>v.inRange("1.4", "2.7")</code>)
	 * or as arrays (e.g. <code>v.inRange([1,4], [2,7])</code>).
	 *
	 * @param {string|any[]|module:sap/base/util/Version} vMin the start of the range (inclusive)
	 * @param {string|any[]|module:sap/base/util/Version} vMax the end of the range (exclusive)
	 * @returns {boolean} <code>true</code> if this version is greater or equal to <code>vMin</code> and smaller
	 *                   than <code>vMax</code>, <code>false</code> otherwise.
	 * @public
	 */
	Version.prototype.inRange = function(vMin, vMax) {
		return this.compareTo(vMin) >= 0 && this.compareTo(vMax) < 0;
	};

	return Version;

});