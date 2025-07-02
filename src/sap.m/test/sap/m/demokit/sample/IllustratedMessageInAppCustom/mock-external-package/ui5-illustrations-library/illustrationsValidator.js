/* eslint-disable */

const fs = require('fs');
const path = require('path');
const DOMParser = require('xmldom').DOMParser;
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Create a window object for DOMPurify
const window = new JSDOM('').window;
const purify = DOMPurify(window);

class Validator {
  /**
   * @param {string} folderPath - Path to the folder containing SVG files
   * @param {Object} [options] - Validation options
   * @param {boolean} [options.silent=false] - If true, suppresses console output
   * @param {string[]} [options.validSizes] - Custom array of valid sizes
   * @param {boolean} [options.sanitize=true] - Whether to sanitize SVG content
   */
  constructor(folderPath, options = {}) {
    this.folderPath = folderPath;
    this.options = {
      silent: false,
      validSizes: ['Scene', 'Dialog', 'Dot', 'Spot'],
      sanitize: true,
      ...options
    };
    this.errors = [];
    this.warnings = [];
    this.svgFiles = [];
    this.metadata = null;
    this.setId = null;
    this.illustrationIds = [];
  }

  /**
   * Logs a message if silent mode is not enabled
   * @param {string} message - Message to log
   * @param {'log'|'error'|'warn'} [type='log'] - Type of log
   * @private
   */
  _log(message, type = 'log') {
    if (!this.options.silent) {
      console[type](message);
    }
  }

  /**
   * Validates the SVG files in the folder
   * @returns {boolean} Whether validation passed
   */
  validate() {
    try {
      // Check if folder exists
      if (!fs.existsSync(this.folderPath)) {
        throw new Error(`Folder ${this.folderPath} does not exist`);
      }

      // Read all files in the folder
      const files = fs.readdirSync(this.folderPath);

      // Check for metadata.json
      const metadataExists = files.includes('metadata.json');
      if (metadataExists) {
        this.validateMetadata(files);
      }

      // Get all SVG files
      this.svgFiles = files.filter(file => path.extname(file).toLowerCase() === '.svg');
      if (this.svgFiles.length === 0) {
        throw new Error('No SVG files found in the folder');
      }

      // Validate SVG file names and extract SetID
      this.validateSVGFileNames();

      // Validate that for each IllustrationID, there are exactly 4 SVG files (one for each size)
      this.validateIllustrationCounts();

      // Validate SVG content
      this.validateSVGContents();

      if (this.errors.length > 0) {
        this._log('Validation failed with the following errors:', 'error');
        this.errors.forEach((error, index) => {
          this._log(`${index + 1}. ${error}`, 'error');
        });
        return false;
      }

      if (this.warnings.length > 0) {
        this._log('Validation passed with warnings:', 'warn');
        this.warnings.forEach((warning, index) => {
          this._log(`${index + 1}. ${warning}`, 'warn');
        });
      }

      this._log('✅ All validations passed successfully!');
      return true;
    } catch (error) {
      this.errors.push(error.message);
      this._log(`Validation error: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * Validates the metadata.json file
   * @param {string[]} files - List of files in the folder
   * @private
   */
  validateMetadata(files) {
    try {
      const metadataPath = path.join(this.folderPath, 'metadata.json');
      const metadataContent = fs.readFileSync(metadataPath, 'utf8');

      try {
        this.metadata = JSON.parse(metadataContent);
      } catch (e) {
        this.errors.push('metadata.json contains invalid JSON');
        return;
      }

      if (!this.metadata.symbols || !Array.isArray(this.metadata.symbols)) {
        this.errors.push('metadata.json must contain a "symbols" field that is an array');
        return;
      }

      // Validate that all symbols are alphanumeric strings
      const invalidSymbols = this.metadata.symbols.filter(symbol => !/^[a-zA-Z0-9]+$/.test(symbol));
      if (invalidSymbols.length > 0) {
        this.errors.push(`The following symbols in metadata.json are not alphanumeric: ${invalidSymbols.join(', ')}`);
      }
    } catch (error) {
      this.errors.push(`Error reading metadata.json: ${error.message}`);
    }
  }

  /**
   * Validates the names of SVG files
   * @private
   */
  validateSVGFileNames() {
    const { validSizes } = this.options;
    const sizePattern = validSizes.join('|');
    const fileNameRegex = new RegExp(`^([a-zA-Z0-9]+)-(${sizePattern})-([a-zA-Z0-9]+)\\.svg$`, 'i');
    const setIds = new Set();
    const illustrationIds = new Set();

    this.svgFiles.forEach(file => {
      const match = file.match(fileNameRegex);

      if (!match) {
        this.errors.push(`Invalid SVG file name format: ${file}. Expected format: <SetID>-<Size>-<IllustrationID>.svg`);
        return;
      }

      const [_, setId, size, illustrationId] = match;

      // Store SetID
      setIds.add(setId);

      // Store IllustrationID
      illustrationIds.add(illustrationId);

      // Validate Size
      if (!validSizes.includes(size)) {
        this.errors.push(`Invalid size "${size}" in file ${file}. Must be one of: ${validSizes.join(', ')}`);
      }

      // Validate IllustrationID against metadata if metadata exists
      if (this.metadata && !this.metadata.symbols.includes(illustrationId)) {
        this.errors.push(`IllustrationID "${illustrationId}" in file ${file} is not in the metadata.json symbols list`);
      }
    });

    // Check if all SVG files have the same SetID
    if (setIds.size > 1) {
      this.errors.push(`Multiple SetIDs found: ${Array.from(setIds).join(', ')}. All SVG files should have the same SetID.`);
    } else if (setIds.size === 1) {
      this.setId = Array.from(setIds)[0];
    }

    // Store illustration IDs for later validation
    this.illustrationIds = Array.from(illustrationIds);
  }

  /**
   * Validates that each IllustrationID has all required sizes
   * @private
   */
  validateIllustrationCounts() {
    const illustrationCounts = {};
    const { validSizes } = this.options;

    // Count occurrences of each IllustrationID
    this.svgFiles.forEach(file => {
      const sizePattern = validSizes.join('|');
      const regex = new RegExp(`^[a-zA-Z0-9]+(${sizePattern})-([a-zA-Z0-9]+)\\.svg$`, 'i');
      const match = file.match(regex);

      if (match) {
        const illustrationId = match[2];
        illustrationCounts[illustrationId] = (illustrationCounts[illustrationId] || 0) + 1;
      }
    });

    // Check that each IllustrationID has exactly the number of required sizes
    Object.entries(illustrationCounts).forEach(([illustrationId, count]) => {
      if (count !== validSizes.length) {
        this.errors.push(`IllustrationID "${illustrationId}" has ${count} files, but should have exactly ${validSizes.length} (one for each size)`);
      }

      // Check that each IllustrationID has one of each size
      const sizes = new Set();
      this.svgFiles.forEach(file => {
        const sizePattern = validSizes.join('|');
        const regex = new RegExp(`^[a-zA-Z0-9]+(${sizePattern})-${illustrationId}\\.svg$`, 'i');
        const match = file.match(regex);

        if (match) {
          sizes.add(match[1]);
        }
      });

      if (sizes.size !== validSizes.length) {
        this.errors.push(`IllustrationID "${illustrationId}" does not have one file for each size. Found sizes: ${Array.from(sizes).join(', ')}`);
      }
    });
  }

  /**
   * Validates the content of each SVG file
   * @private
   */
  validateSVGContents() {
    this.svgFiles.forEach(file => {
      const filePath = path.join(this.folderPath, file);
      try {
        let svgContent = fs.readFileSync(filePath, 'utf8');

        // Sanitize SVG content if option is enabled
        if (this.options.sanitize) {
          svgContent = purify.sanitize(svgContent);
        }

        // Parse the SVG content
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgContent, 'text/xml');

        // Check for parsing errors
        const errors = Array.from(svgDoc.getElementsByTagName('parsererror'));
        if (errors.length > 0) {
          this.errors.push(`SVG parsing error in file ${file}: ${errors[0].textContent}`);
          return;
        }

        // Get the root SVG element
        const svgElement = svgDoc.getElementsByTagName('svg')[0];
        if (!svgElement) {
          this.errors.push(`No SVG element found in file ${file}`);
          return;
        }

        // Check if the root SVG tag has an ID attribute
        const id = svgElement.getAttribute('id');
        const expectedId = path.basename(file, '.svg');

        if (!id) {
          this.errors.push(`SVG file ${file} does not have an 'id' attribute on the root svg tag`);
        } else if (id !== expectedId) {
          this.errors.push(`SVG file ${file} has an 'id' attribute with value "${id}", but expected "${expectedId}"`);
        }

        // Check for style attributes
        const elementsWithStyle = this.findElementsWithStyleAttribute(svgElement);
        if (elementsWithStyle.length > 0) {
          this.errors.push(`SVG file ${file} contains ${elementsWithStyle.length} element(s) with 'style' attributes. Only 'class' attributes are allowed.`);
        }

        this._log(`✅ SVG file ${file} validated successfully!`);

      } catch (error) {
        this.errors.push(`Error processing SVG file ${file}: ${error.message}`);
      }
    });
  }

  /**
   * Finds elements with style attributes in an SVG element
   * @param {Element} element - SVG element to check
   * @returns {Element[]} Array of elements with style attributes
   * @private
   */
  findElementsWithStyleAttribute(element) {
    const elements = [];

    if (element.hasAttribute && element.hasAttribute('style')) {
      elements.push(element);
    }

    const children = element.childNodes || [];
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.nodeType === 1) { // Element node
        elements.push(...this.findElementsWithStyleAttribute(child));
      }
    }

    return elements;
  }
}

module.exports = Validator;