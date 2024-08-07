import {graphFromPackageDependencies, graphFromObject} from "@ui5/project/graph";
import path from "node:path";
import {statSync} from "node:fs";

function existsSync(filePath) {
	try {
		statSync(filePath);
		return true;
	} catch (err) {
		// "File or directory does not exist"
		if (err.code === "ENOENT") {
			return false;
		} else {
			throw err;
		}
	}
}

async function buildProject({
	cwd,
	workspaceConfigPath,
	versionOverride,
	jsdoc = false,
	cleanDest = false,
	createBuildManifest = false,
	includedDependencies = [],
	includedTasks = []
}) {
	const npmGraph = await graphFromPackageDependencies({
		cwd,
		workspaceConfigPath,
		versionOverride
	});

	const rootProject = npmGraph.getRoot();

	const dependencyTree = {
		id: rootProject.__id, // TODO: Provide public getter
		version: rootProject.getVersion(),
		path: rootProject.getRootPath(),
		dependencies: npmGraph.getProjectNames().filter((p) => p !== rootProject.getName()).map((dependencyName) => {
			const dependencyProject = npmGraph.getProject(dependencyName);
			return {
				id: dependencyProject.__id, // TODO: Provide public getter
				version: dependencyProject.getVersion(),

				// Using "dist" folder with build result so that the dependency is not built again and just used as provided
				path: path.join(dependencyProject.getRootPath(), "dist")
			};
		})
	};

	const graph = await graphFromObject({
		cwd,
		dependencyTree,
		resolveFrameworkDependencies: false
	});

	await graph.build({
		jsdoc,
		includedTasks,
		includedDependencies,
		createBuildManifest,
		cleanDest,
		destPath: path.join(cwd, "dist")
	});
}

export async function buildApplicationProject({cwd, workspaceConfigPath, jsdoc}) {
	const librariesToBuild = process.env.OPENUI5_LIBRARIES?.split(",").map(($) => $.trim());

	const applicationProjectGraph = await graphFromPackageDependencies({
		cwd,
		workspaceConfigPath
	});

	function libraryBuildNeeded(project) {
		if (project === applicationProjectGraph.getRoot()) {
			// Root application will be built at the end
			return false;
		}
		if (project.getType() === "module") {
			// Type module currently doesn't support "createBuildManifest" option
			// Project will always be re-built via application build below
			return false;
		}
		if (!existsSync(path.join(project.getRootPath(), "dist"))) {
			// Always build library when it hasn't been built before
			// even when librariesToBuild doesn't list it.
			return true;
		}
		if (librariesToBuild && !librariesToBuild.includes(project.getName())) {
			// Skip if only some libraries should be built and it's not this one
			return false;
		}
		return true;
	}

	const libraryProjectBuildOrder = [];

	await applicationProjectGraph.traverseDepthFirst(async ({project}) => {
		if (libraryBuildNeeded(project)) {
			libraryProjectBuildOrder.push(project);
		}
	});

	// Pass framework version of application to libraries in order to resolve framework
	// dependencies via registry, so that they can afterwards be resolved via workspaces.
	// Without passing a version the framework libraries can't be resolved.
	const versionOverride = applicationProjectGraph.getRoot().getFrameworkVersion();

	for (const project of libraryProjectBuildOrder) {
		await buildProject({
			cwd: project.getRootPath(),
			workspaceConfigPath,
			versionOverride,
			jsdoc,
			includedTasks: ["replaceVersion"],
			cleanDest: true,
			createBuildManifest: true
		});
	}

	// Build application
	await buildProject({
		cwd,
		workspaceConfigPath,
		jsdoc,
		includedDependencies: ["*"], // Ensures to write out files of all dependencies
		includedTasks: ["generateVersionInfo"]
	});
}
