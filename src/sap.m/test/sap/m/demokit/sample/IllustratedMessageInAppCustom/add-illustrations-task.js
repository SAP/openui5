/* eslint-disable */

/**
 * Custom UI5 Tooling task to validate and copy SVGs from npm package to UI5 resources
 *
 * This task:
 * 1. Validates all SVGs from the specified SVG package using its validation module
 * 2. Copies the validated SVGs to the UI5 application's resources folder
 */

const path = require('path');
const fs = require('fs-extra');

/**
 * UI5 task interface
 * @param {Object} parameters Parameters
 * @param {module:@ui5/fs.DuplexCollection} parameters.workspace DuplexCollection to read and write files
 * @param {module:@ui5/fs.AbstractReader} parameters.dependencies Reader to access dependencies
 * @param {Object} parameters.taskUtil Utility object
 * @param {Object} parameters.options Options
 * @param {string} parameters.options.projectName Project name
 * @param {Object} parameters.options.configuration Task configuration
 */
module.exports = function({workspace, dependencies, taskUtil, options}) {
    const config = options.configuration;

    // Check for required configuration
    if (!config.illustrationsPackage) {
        throw new Error("[illustrations-task] Missing configuration 'illustrationsPackage' in ui5.yaml");
    }

    const sourcePath = config.sourcePath || `node_modules/${config.illustrationsPackage}/illustrations`;
    const targetPath = config.targetPath || `webapp/resources/illustrations`;

    // Log task execution
    console.log(`[illustrations-task] Processing SVGs from ${sourcePath} to ${targetPath}`);

    try {
        // Import the validation function from the SVG package
        const {validateIllustrations} = require(`${config.illustrationsPackage}`);

        // Validate SVGs
        console.log(`[illustrations-task] Validating SVGs...`);
        const validationResult = validateIllustrations(sourcePath);

        if (!validationResult.isValid) {
            // Handle validation errors
            console.error(`[illustrations-task] ❌ SVG validation failed:`);
            validationResult.errors.forEach((error) => {
                console.error(`[illustrations-task] - ${error}`);
            });
            throw new Error("[illustrations-task] SVG validation failed, build aborted");
        }

        // Log validation results
        console.log(`[illustrations-task] ✅ All SVGs are valid!`);

        // Create target directory if it doesn't exist
        fs.ensureDirSync(targetPath);

        // Copy all SVGs to target directory
        console.log(`[illustrations-task] Copying SVGs to ${targetPath}...`);

        // Get list of files from the illustrations set (we've already validated them)
        const files = fs.readdirSync(sourcePath)
            .filter((file) => file.endsWith('.svg') || file.endsWith('.json'));

        // Copy each file
        for (const file of files) {
            const source = path.join(sourcePath, file);
            const target = path.join(targetPath, file);

            fs.copySync(source, target);
            console.log(`[illustrations-task] Copied ${file}`);
        }
        // Log completion
        console.log(`[illustrations-task] ✅ Successfully processed ${files.length} files`);

    } catch (error) {
        // Handle any errors
        console.error(`[illustrations-task] Error: ${error.message}`);
        throw error;
    }
};