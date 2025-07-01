/* eslint-disable */

const Validator = require('./illustrationsValidator');

/**
 * Validates a folder of SVG files against specific criteria
 * @param {string} folderPath - Path to the folder containing SVG files
 * @param {Object} [options] - Validation options
 * @param {boolean} [options.silent=false] - If true, suppresses console output
 * @returns {Object} Result object with validation status and details
 */
function validateIllustrations(folderPath, options = {}) {
  const validator = new Validator(folderPath, options);
  const isValid = validator.validate();

  return {
    isValid,
    errors: validator.errors,
    svgFiles: validator.svgFiles,
    illustrationIds: validator.illustrationIds,
    setId: validator.setId
  };
}

// Export both the function and the class for flexibility
module.exports = {
  validateIllustrations
};

// Run validation if invoked directly from command line
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.error('Usage: node index.js <path-to-svg-folder>');
    process.exit(1);
  }

  const result = validateIllustrations(args[0]);
  process.exit(result.isValid ? 0 : 1);
}