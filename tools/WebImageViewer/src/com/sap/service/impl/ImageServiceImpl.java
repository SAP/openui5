package com.sap.service.impl;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import org.apache.log4j.Logger;
import org.springframework.web.multipart.MultipartFile;

import com.sap.ResourceProvider;
import com.sap.comparator.FailedImageNameComparator;
import com.sap.comparator.FailedNumberComparator;
import com.sap.comparator.JobNameComparator;
import com.sap.constants.Constants;
import com.sap.model.Response;
import com.sap.resource.Resource;
import com.sap.service.ImageService;
import com.sap.utils.ConfigUtil;
import com.sap.utils.HttpServletRequestUtils;
import com.sap.utils.StringUtils;

public class ImageServiceImpl implements ImageService {

	private static Logger LOG = Logger.getLogger(ImageServiceImpl.class);

	@Override
	public Response countResultByJob() {
		LOG.info("Count Result By Job");
		Resource resource = ResourceProvider.getResource();
		// All controls path from root path: "rootPath\\Window7_64\\Chrome\\hcb\\RTL_true\\librarytests\\commons\\Button"
		List<String> allControlsPath = resource.findAllControlsPath();

		// Maps job's information of passed and failed count. K : job name, V : {pass : 10, fail : 20}
		Map<String, Map<String, Integer>> countFailedControllers = new HashMap<String, Map<String, Integer>>();
		String resourceSeparator = resource.getResourcePathSeparator();
		// Job's information
		for (String controlPath : allControlsPath) {
			String needVerifyImagePath = StringUtils.combinedResourcePath(resourceSeparator, controlPath,
					Constants.NEED_VERIFY_IMAGES_FOLDER);
			String jobName = resource.getJobNameByCurrentPath(controlPath);

			// Failed image count from "NeedVerifyImages" folder under current control path.
			int failedImageCount = resource.getFailedImageCountByVerifyFolder(needVerifyImagePath);

			// Maps passed and failed control count information
			Map<String, Integer> controllerMap = countFailedControllers.get(jobName);
			controllerMap = (controllerMap == null) ? new HashMap<String, Integer>() : controllerMap;
			int failNumber = (controllerMap.get(Constants.FAIL)) == null ? 0 : controllerMap.get(Constants.FAIL);
			int passNumber = (controllerMap.get(Constants.PASS)) == null ? 0 : controllerMap.get(Constants.PASS);
			if (failedImageCount > 0) {
				failNumber++;
			} else {
				passNumber++;
			}
			controllerMap.put(Constants.FAIL, failNumber);
			controllerMap.put(Constants.PASS, passNumber);
			countFailedControllers.put(jobName, controllerMap);
		}

		// Generate a data structure to front-end
		List<Map<String, Object>> jobList = new ArrayList<Map<String, Object>>();
		for (String jobName : countFailedControllers.keySet()) {
			Map<String, Object> eachJobInfo = new HashMap<String, Object>();
			eachJobInfo.putAll(splitJobNameInfo(jobName));
			eachJobInfo.putAll(countFailedControllers.get(jobName));
			jobList.add(eachJobInfo);
		}

		Collections.sort(jobList, new JobNameComparator());
		return generateResponse(jobList, true);
	}

	@Override
	public Response findFailedControllersByPath(String path) {
		LOG.info("Find Failed Controls from [" + path + "]");
		Resource resource = ResourceProvider.getResource();
		// Get all controls path from RTL folder
		List<String> allControlsPath = resource.findControlsPathFromRtlPath(path);

		// Maps failed controls to modules, K:categoryName_moduleName, V:[{controlName:failedImageNumber}]
		Map<String, List<Map<String, Object>>> jobDetailResults = new HashMap<String, List<Map<String, Object>>>();
		String resourceSeparator = resource.getResourcePathSeparator();

		// Get failed control names and failed count, maps that information to module
		for (String controlPath : allControlsPath) {
			String needVerifyImagePath = StringUtils.combinedResourcePath(resourceSeparator, controlPath,
					Constants.NEED_VERIFY_IMAGES_FOLDER);

			// Failed image count from "NeedVerifyImages" folder under current control path.
			int failedImageCount = resource.getFailedImageCountByVerifyFolder(needVerifyImagePath);

			// The control is failed.
			if (failedImageCount > 0) {
				String contronlName = resource.getControlNameByCurrentPath(controlPath);
				String moduleName = resource.getModuleNameByCurrentPath(controlPath);
				String categoryName = resource.getCategoryByCurrentPath(controlPath);
				// Maps failed control names and failed count, K : control name, V : failed image number
				Map<String, Object> failedControls = new HashMap<String, Object>();
				failedControls.put(Constants.CONTROL_NAME, contronlName);
				failedControls.put(Constants.FAIL, failedImageCount);

				String resultKey = categoryName + Constants.UNDERLINE_SEPARATOR + moduleName;
				List<Map<String, Object>> jobDetailList = jobDetailResults.get(resultKey);
				jobDetailList = (jobDetailList == null) ? new ArrayList<Map<String, Object>>() : jobDetailList;

				jobDetailList.add(failedControls);
				jobDetailResults.put(resultKey, jobDetailList);
			}
		}

		Map<String, List<Map<String, Object>>> categories = new HashMap<String, List<Map<String, Object>>>();
		for (String key : jobDetailResults.keySet()) {
			String[] keys = key.split(Constants.UNDERLINE_SEPARATOR);
			String category = keys[0];
			String module = keys[1];
			List<Map<String, Object>> modules = categories.get(category);
			modules = (modules == null) ? new ArrayList<Map<String, Object>>() : modules;

			Map<String, Object> detail = new HashMap<String, Object>();
			detail.put(Constants.MODULES_NAME, module);
			Collections.sort(jobDetailResults.get(key), new FailedNumberComparator());
			detail.put(Constants.CONTROLS, jobDetailResults.get(key));
			detail.put(Constants.COUNT, jobDetailResults.get(key).size());
			modules.add(detail);
			categories.put(category, modules);
		}

		// Generate a data structure to front-end
		List<Map<String, Object>> results = new ArrayList<Map<String, Object>>();
		for (String key : categories.keySet()) {
			Map<String, Object> categoryDetail = new HashMap<String, Object>();
			categoryDetail.put(Constants.CATEGORY_NAME, key);
			categoryDetail.put(Constants.MODULES, categories.get(key));
			results.add(categoryDetail);
		}
		return generateResponse(results, true);
	}

	@Override
	public Response findFailedImages(String path) {
		Resource resource = ResourceProvider.getResource();
		List<Map<String, Object>> failedImage = resource.findFailedImageInfoByPath(path);
		Collections.sort(failedImage, new FailedImageNameComparator());
		return generateResponse(failedImage, true);
	}

	@Override
	public Response updateImages(String controlPath, String... imageNames) {
		LOG.info("Update images");
		Resource resource = ResourceProvider.getResource();
		String expectedImagePath = combinedFolderPath(controlPath, Constants.EXPECTED_IMAGES_FOLDER);
		String needVerifyImagePath = combinedFolderPath(controlPath, Constants.NEED_VERIFY_IMAGES_FOLDER);
		String diffImagePath = combinedFolderPath(controlPath, Constants.DIFF_IMAGES_FOLDER);

		boolean isUpdateSuccessed = false;
		for (String imageName : imageNames) {
			LOG.debug("Paramters -> Update image name [" + imageName + "]");
			String needVerifyImage = needVerifyImagePath + imageName;
			boolean isCopySuccessed = resource.copyFile(needVerifyImage, expectedImagePath + imageName);
			if (isCopySuccessed) {
				resource.deleteFiles(needVerifyImage, diffImagePath + resource.getDiffImage(imageName));
			}
			isUpdateSuccessed = isUpdateSuccessed && isCopySuccessed;
		}
		return generateResponse(null, isUpdateSuccessed);
	}

	@Override
	public Response deleteFailedImages(String controlPath, String... imageNames) {
		LOG.debug("Delete images");
		Resource resource = ResourceProvider.getResource();
		String needVerifyImagePath = combinedFolderPath(controlPath, Constants.NEED_VERIFY_IMAGES_FOLDER);
		String diffImagePath = combinedFolderPath(controlPath, Constants.DIFF_IMAGES_FOLDER);
		boolean isDeletedSuccessed = true;
		for (String imageName : imageNames) {
			LOG.debug("Paramters -> Delete image name [" + imageName + "]");
			String needVerifyImage = needVerifyImagePath + imageName;
			String diffImage = diffImagePath + resource.getDiffImage(imageName);
			isDeletedSuccessed = resource.deleteFiles(needVerifyImage, diffImage);
		}
		return generateResponse(null, isDeletedSuccessed);
	}

	// ----------------------------------------Image--------------------------------------------------
	@Override
	public Response findAllDirectories() {
		LOG.info("Find all directories");
		Resource resource = ResourceProvider.getResource();
		String[] platforms = resource.getAllSubFolders("");
		List<Map<String, Object>> allTreeNodes = new ArrayList<Map<String, Object>>();
		String[] keys = new String[] { Constants.THEME, Constants.RTL, Constants.CATEGORY, Constants.MODULE,
				Constants.CONTROL_TYPE };
		int imageFolderDepthFromRoot = resource.getImageFolderDepthFromPlatform();
		for (String platform : platforms) {
			Map<String, Object> platformMap = new HashMap<String, Object>();
			platformMap.put(Constants.NAME, platform);
			platformMap.put(Constants.CHILDREN, Constants.BROWSER);
			int count = 0;
			findDirectory(platform, platformMap, imageFolderDepthFromRoot, keys, count, resource);
			allTreeNodes.add(platformMap);
		}
		return generateResponse(allTreeNodes, true);
	}

	@Override
	public Response findImagesInFolder(String folderPath) {
		LOG.info("Find images from [" + folderPath + "]");
		Resource resource = ResourceProvider.getResource();
		List<Map<String, Object>> imagesInfo = resource.findImagesInfoByPath(folderPath);
		Collections.sort(imagesInfo, new Comparator<Map<String, Object>>() {
			@Override
			public int compare(Map<String, Object> o1, Map<String, Object> o2) {
				String imageName1 = (String) o1.get(Constants.NAME);
				String imageName2 = (String) o2.get(Constants.NAME);
				return imageName1.compareTo(imageName2);
			}
		});
		return generateResponse(imagesInfo, true);
	}

	@Override
	public Response deleteImages(String path, String... imageNames) {
		Resource resource = ResourceProvider.getResource();
		boolean isDeletedSuccessed = true;
		String resourceSeparator = resource.getResourcePathSeparator();
		path = StringUtils.formatterFilePath(path, resourceSeparator);
		for (String imageName : imageNames) {
			LOG.debug("Paramters -> Delete image name [" + imageName + "]");
			isDeletedSuccessed = isDeletedSuccessed && resource.deleteFiles(path + imageName);
		}
		return generateResponse(null, isDeletedSuccessed);
	}

	@Override
	public Response uploadImages(List<MultipartFile> files, String destPath) {
		Resource resource = ResourceProvider.getResource();
		boolean isSuccess = true;
		try {
			for (MultipartFile file : files) {
				LOG.debug("Upload image [" + file.getOriginalFilename() + "] to [" + destPath + "]");
				isSuccess = isSuccess && resource.uploadFile(file.getInputStream(), file.getOriginalFilename(), destPath);
			}
		} catch (IOException e) {
			throw new RuntimeException("Upload file appear exception", e);
		}
		return generateResponse(null, isSuccess);
	}

	@SuppressWarnings("unchecked")
	private void findDirectory(String path, Map<String, Object> parentMap, int depth, String[] keys, int count, Resource resource) {
		if (depth < 1) {
			return;
		}
		String[] subFolders = resource.getAllSubFolders(path);
		List<Map<String, Object>> nodes = (List<Map<String, Object>>) parentMap.get(Constants.NODES);
		nodes = nodes == null ? new ArrayList<Map<String, Object>>() : nodes;
		String category = keys[count];
		count++;
		String resouceSeparator = resource.getResourcePathSeparator();
		for (String fileName : subFolders) {
			Map<String, Object> subFolderMap = new HashMap<String, Object>();
			subFolderMap.put(Constants.NAME, fileName);
			if (depth > 1) {
				if (count >= keys.length) {
					count = keys.length - 1;
				}
				subFolderMap.put(Constants.CHILDREN, category);
			}
			nodes.add(subFolderMap);
			String subPath = path + resouceSeparator + fileName;
			findDirectory(subPath, subFolderMap, depth - 1, keys, count, resource);
		}
		parentMap.put(Constants.NODES, nodes);
	}

	// ----------------------------------------Module--------------------------------------------
	@Override
	public Response countResultByMoudle() {
		LOG.info("Count Result By Module");
		Resource resource = ResourceProvider.getResource();
		List<String> allControlsPath = resource.findAllControlsPath();
		LOG.debug("Finded all controls successfully");
		// key : moduleName name, value : { pass: 2, fail : 20}
		Map<String, Map<String, Integer>> allControllersMap = new HashMap<String, Map<String, Integer>>();
		String resourceSeparator = resource.getResourcePathSeparator();
		for (String controlPath : allControlsPath) {
			String needVerifyImagePath = StringUtils.combinedResourcePath(resourceSeparator, controlPath,
					Constants.NEED_VERIFY_IMAGES_FOLDER);
			int failedImageCount = resource.getFailedImageCountByVerifyFolder(needVerifyImagePath);
			String categoryName = resource.getCategoryByCurrentPath(controlPath);
			String controlName = resource.getControlNameByCurrentPath(controlPath);
			// key : control name, value : failed image number
			Map<String, Integer> controlerInfoMap = allControllersMap.get(categoryName);
			controlerInfoMap = (controlerInfoMap == null) ? new HashMap<String, Integer>() : controlerInfoMap;
			int failNumber = (controlerInfoMap.get(controlName) == null) ? 0 : controlerInfoMap.get(controlName);
			if (failedImageCount > 0) {
				failNumber++;
			}
			controlerInfoMap.put(controlName, failNumber);
			allControllersMap.put(categoryName, controlerInfoMap);
		}
		List<Map<String, Object>> moduleList = new ArrayList<Map<String, Object>>();
		for (String key : allControllersMap.keySet()) {
			Map<String, Object> module = new HashMap<String, Object>();
			module.put(Constants.CATEGORY_NAME, key);
			Map<String, Integer> controlInfoMap = allControllersMap.get(key);
			int failedCount = 0;
			for (String controlName : controlInfoMap.keySet()) {
				if (controlInfoMap.get(controlName) > 0) {
					failedCount++;
				}
			}
			module.put(Constants.FAIL, failedCount);
			module.put(Constants.PASS, controlInfoMap.keySet().size() - failedCount);
			module.putAll(allControllersMap.get(key));
			moduleList.add(module);
		}
		return generateResponse(moduleList, true);
	}

	@Override
	public Response findFailedControlsByModule(String path) {
		Resource resource = ResourceProvider.getResource();
		List<String> allTestConditions = resource.findAllTestConditions();
		Map<String, Map<String, Integer>> modulesInfoMap = new HashMap<String, Map<String, Integer>>();
		for (String parentPath : allTestConditions) {
			String modulePath = combinedFolderPath(parentPath, path);
			List<String> controlsPathUnderModule = resource.findAllControlsFrom(modulePath);
			for (String controlPath : controlsPathUnderModule) {
				String needVerifyImagePath = combinedFolderPath(controlPath, Constants.NEED_VERIFY_IMAGES_FOLDER);
				int failedImageCount = resource.getFailedImageCountByVerifyFolder(needVerifyImagePath);
				String subModuleName = resource.getModuleNameByCurrentPath(controlPath);
				Map<String, Integer> controlsMap = modulesInfoMap.get(subModuleName);
				controlsMap = (controlsMap == null) ? new HashMap<String, Integer>() : controlsMap;
				if (failedImageCount > 0) {
					String controlName = resource.getControlNameByCurrentPath(controlPath);
					int count = controlsMap.get(controlName) == null ? 0 : controlsMap.get(controlName);
					count += failedImageCount;
					controlsMap.put(controlName, count);
				}
				modulesInfoMap.put(subModuleName, controlsMap);
			}
		}

		List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();
		for (String subModuleName : modulesInfoMap.keySet()) {
			Map<String, Object> subModuleMap = new HashMap<String, Object>();
			subModuleMap.put(Constants.MODULES_NAME, subModuleName);
			List<Map<String, Object>> controlsList = new ArrayList<Map<String, Object>>();
			Map<String, Integer> controlsMap = modulesInfoMap.get(subModuleName);
			for (String controlName : controlsMap.keySet()) {
				Map<String, Object> controlMap = new HashMap<String, Object>();
				controlMap.put(Constants.CONTROL_NAME, controlName);
				controlMap.put(Constants.FAIL, controlsMap.get(controlName));
				controlsList.add(controlMap);
			}
			Collections.sort(controlsList, new FailedNumberComparator());
			subModuleMap.put(Constants.CONTROLS, controlsList);
			subModuleMap.put(Constants.COUNT, controlsList.size());
			resultList.add(subModuleMap);
		}
		return generateResponse(resultList, true);
	}

	@Override
	public Response findFailedInfoByController(String module, String subModule, String control) {
		Resource resource = ResourceProvider.getResource();
		List<String> allTestConditions = resource.findAllTestConditions();
		String resourceSeparator = resource.getResourcePathSeparator();
		String path = StringUtils.combinedResourcePath(resourceSeparator, module, subModule, control);
		// Key : test condition(job name), Value : failed Image count
		Map<String, Integer> failedControlsMap = new HashMap<String, Integer>();
		for (String testCondition : allTestConditions) {
			String controlPath = StringUtils.combinedResourcePath(resourceSeparator, testCondition, path);
			String needVerifyImagePath = combinedFolderPath(controlPath, Constants.NEED_VERIFY_IMAGES_FOLDER);
			int failedImageCount = resource.getFailedImageCountByVerifyFolder(needVerifyImagePath);
			if (failedImageCount > 0) {
				String jobName = resource.getJobNameByCurrentPath(needVerifyImagePath);
				failedControlsMap.put(jobName, failedImageCount);
			}
		}
		List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();
		for (String jobName : failedControlsMap.keySet()) {
			Map<String, Object> eachJobInfo = new HashMap<String, Object>();
			eachJobInfo.put(Constants.FAIL, failedControlsMap.get(jobName));
			eachJobInfo.putAll(splitJobNameInfo(jobName));
			resultList.add(eachJobInfo);
		}
		Collections.sort(resultList, new Comparator<Map<String, Object>>() {
			public int compare(Map<String, Object> o1, Map<String, Object> o2) {
				int failedNumber1 = (Integer) o1.get(Constants.FAIL);
				int failedNumber2 = (Integer) o2.get(Constants.FAIL);
				return failedNumber2 - failedNumber1;
			}
		});
		return generateResponse(resultList, true);
	}
	
	@Override
	public Response getAllTokenInformation() {
		String path = HttpServletRequestUtils.getRealPath() + "/" + Constants.TOKEN_CONFIG_PATH;
		Properties prop = ConfigUtil.getProperties(path);
		List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();
		for (Object key : prop.keySet()) {
			Map<String, Object> token = new HashMap<String, Object>();
			token.put(Constants.TOKEN_NAME, key);
			token.put(Constants.IMAGE_STORE_PATH, prop.get(key));
			resultList.add(token);
		}
		return generateResponse(resultList, true);
	}
	
	@Override
	public Response saveOrUpdateConfigInfo(Map<String, String> info) {
		LOG.info("Save or Update config");
		LOG.debug("Save or Update config parameters [" + info + "]");
		String path = HttpServletRequestUtils.getRealPath() + "/" + Constants.TOKEN_CONFIG_PATH;
		Properties prop = ConfigUtil.getProperties(path);
		prop.clear();
		for (String key : info.keySet()) {
			prop.put(key, info.get(key));
		}
		synchronized (this) {
			ConfigUtil.storeProperties(prop, path);
		}
		LOG.info("Save or Update config success");
		return generateResponse(null, true);
	}

	private Map<String, String> splitJobNameInfo(String jobName) {
		Resource resource = ResourceProvider.getResource();
		String[] jobInfo = jobName.split("\\" + resource.getResourcePathSeparator());
		Map<String, String> jobInfoMap = new HashMap<String, String>();
		jobInfoMap.put(Constants.PLATFORM, jobInfo[0]);
		jobInfoMap.put(Constants.BROWSER, jobInfo[1]);
		jobInfoMap.put(Constants.THEME, jobInfo[2]);
		jobInfoMap.put(Constants.RTL, jobInfo[3]);
		return jobInfoMap;
	}

	private Response generateResponse(Object data, boolean isSuccess) {
		Response response = new Response();
		response.setSuccess(isSuccess);
		response.setData(data);
		return response;
	}

	private String combinedFolderPath(String parentPath, String folderName) {
		Resource resource = ResourceProvider.getResource();
		String resourceSeparator = resource.getResourcePathSeparator();
		return StringUtils.combinedResourcePath(resourceSeparator, parentPath, folderName);
	}
}
