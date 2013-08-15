package com.sap.resource;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileFilter;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.imageio.ImageIO;

import org.apache.log4j.Logger;
import org.springframework.util.FileCopyUtils;

import com.sap.UnknownResourceException;
import com.sap.constants.Constants;
import com.sap.resource.path.DefaultPathRule;
import com.sap.resource.path.PathRule;
import com.sap.utils.StringUtils;

public class FileSystemResource extends AbstractResource {

	private static Logger LOG = Logger.getLogger(FileSystemResource.class);

	private String url;

	private String imageBaseUrl;

	private String defaultSeparator;

	private void initContext() {
		File rootFile = new File(url);
		if (!rootFile.exists()) {
			LOG.warn("Not found the [" + url +"]");
			throw new IllegalArgumentException(Constants.NOT_FIND_IMAGE_STORE_PATH);
		}
		if (!rootFile.canRead() || !rootFile.canWrite()) {
			LOG.warn("No operation permissions for [" + url +"]");
			throw new IllegalArgumentException(Constants.NO_PERMISSIONS);
		}
		// Verify root folder structure whether it is a right data structure
		verifyRootFolderStructure(rootFile);
		
		if (this.rule == null) {
			this.url = rootFile.getAbsolutePath();
			rule = new DefaultPathRule(this.url, this.defaultSeparator);
		}
		LOG.info("Init success local File system [" + url + "]");
	}

	@Override
	public List<String> findAllControlsPath() {
		LOG.debug("Find all controls path from root directory");
		List<String> fileList = new ArrayList<String>();
		findFilesPath(url, DefaultPathRule.CONTROL_FOLDER_DEPTH_FROM_ROOT, fileList);
		return fileList;
	}

	@Override
	public List<String> findControlsPathFromRtlPath(String path) {
		String untilRtlFolderPath = getAbsolutePath(path);
		LOG.debug("Find all controls path from RTL [" + path + "]");
		List<String> fileList = new ArrayList<String>();
		findFilesPath(untilRtlFolderPath, DefaultPathRule.CONTROL_FOLDER_DEPTH_FROM_RTL, fileList);
		return fileList;
	}

	@Override
	public int getFailedImageCountByVerifyFolder(String path) {
		LOG.debug("Find image count from Need verify folder [" + path + "]");
		return getSubFileSize(path);
	}

	@Override
	public synchronized List<Map<String, Object>> findFailedImageInfoByPath(String path) {
		String separator = getResourcePathSeparator();
		String absolutePath = getAbsolutePath(path);
		String needVerifyPath = StringUtils.combinedResourcePath(separator, absolutePath,
				Constants.NEED_VERIFY_IMAGES_FOLDER);
		String diffImagePath = StringUtils.combinedResourcePath(separator, absolutePath,
				Constants.DIFF_IMAGES_FOLDER);
		String expectedImagePath = StringUtils.combinedResourcePath(separator, absolutePath,
				Constants.EXPECTED_IMAGES_FOLDER);

		File file = new File(needVerifyPath);
		File[] subFiles = file.listFiles(new FileFilter() {
			@Override
			public boolean accept(File file) {
				return !file.isHidden() && isImage(file);
			}
		});
		if (subFiles == null) {
			LOG.warn("Not find the need verify image path [" + needVerifyPath + "]");
			throw new UnknownResourceException("Not find the need verify image path");
		}
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		for (File imageFile : subFiles) {
			String expectedName = imageFile.getName();
			String diffImageName = rule.getDiffImageByExpectedImageName(expectedName);
			try {
				Map<String, Object> imageInfo = new HashMap<String, Object>();
				String verifyImageUrl = StringUtils.combinedString("/", imageBaseUrl, path,
						Constants.NEED_VERIFY_IMAGES_FOLDER, expectedName);
				imageInfo.put(Constants.VERIFY, makeImageInfo(imageFile, expectedName, verifyImageUrl));

				File diffImageFile = new File(diffImagePath + separator + diffImageName);
				if (!diffImageFile.exists()) {
					imageInfo.put(Constants.DIFF, null);
				} else {
					String diffImageUrl = StringUtils.combinedString("/", imageBaseUrl, path,
							Constants.DIFF_IMAGES_FOLDER, diffImageName);
					imageInfo.put(Constants.DIFF, makeImageInfo(diffImageFile, diffImageName, diffImageUrl));
				}

				File expectedImageFile = new File(expectedImagePath + separator + expectedName);
				if (!expectedImageFile.exists()) {
					imageInfo.put(Constants.EXPECT, null);
				} else {
					String exceptedImageUrl = StringUtils.combinedString("/", imageBaseUrl, path,
							Constants.EXPECTED_IMAGES_FOLDER, expectedName);
					imageInfo.put(Constants.EXPECT, makeImageInfo(expectedImageFile, expectedName, exceptedImageUrl));
				}
				list.add(imageInfo);
				LOG.debug("Find image info [" + imageInfo + "]");
			} catch (IOException e) {
				LOG.error("Get images information from [" + path + "] appear exception");
				throw new RuntimeException("Get images appear exception", e);
			}
		}
		return list;
	}

	@Override
	public String getResourcePathSeparator() {
		return this.defaultSeparator;
	}

	private int getSubFileSize(String path) {
		File[] files = new File(path).listFiles(new FileFilter() {
			@Override
			public boolean accept(File file) {
				return !file.isHidden() && isImage(file);
			}
		});
		if (files == null) {
			return 0;
		}
		return files.length;
	}

	@Override
	public synchronized boolean deleteFiles(String... files) {
		boolean isDeletedSuccess = true;
		for (String filePath : files) {
			String absoluteFilePath = getAbsolutePath(filePath);
			LOG.debug("Delete image file path [" + absoluteFilePath + "]");
			File file = new File(absoluteFilePath);
			isDeletedSuccess = isDeletedSuccess && file.delete();
		}
		return isDeletedSuccess;
	}

	@Override
	public synchronized boolean copyFile(String sourceFilePath, String destFilePath) {
		String absolutedSourceFilePath = getAbsolutePath(sourceFilePath);
		String absolutedDestFilePath = getAbsolutePath(destFilePath);
		File sourceFile = new File(absolutedSourceFilePath);
		if (!sourceFile.exists()) {
			return false;
		}
		File destFile = new File(absolutedDestFilePath);
		if (destFile.exists()) {
			destFile.delete();
		}
		LOG.debug("Copy image file from [" + absolutedSourceFilePath + "] to [" + absolutedDestFilePath + "]");
		try {
			FileCopyUtils.copy(sourceFile, destFile);
		} catch (IOException e) {
			throw new RuntimeException("Copy file appear exception", e);
		}
		return true;
	}

	@Override
	public String[] getAllSubFolders(String path) {
		String absolutPath = getAbsolutePath(path);
		LOG.debug("Get sub folders: " + absolutPath);
		File file = new File(absolutPath);
		File[] files = file.listFiles(new FileFilter() {
			@Override
			public boolean accept(File file) {
				return !file.isHidden() && file.isDirectory() && !Constants.TEMP_IMAGES_FOLDER.equals(file.getName());
			}
		});
		if (files == null) {
			LOG.warn("Not find the path [" + path + "], when get the sub folders");
			throw new UnknownResourceException("Not find path , when get the sub folders");
		}
		int size = files.length;
		String[] fileNames = new String[size];
		for (int i = 0; i < size; i++) {
			fileNames[i] = files[i].getName();
		}
		return fileNames;
	}

	@Override
	public synchronized List<Map<String, Object>> findImagesInfoByPath(String path) {
		String absolutPath = getAbsolutePath(path);
		File file = new File(absolutPath);
		File[] subFiles = file.listFiles(new FileFilter() {
			@Override
			public boolean accept(File file) {
				return !file.isHidden() && isImage(file);
			}
		});
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		try {
			for (File imageFile : subFiles) {
				String imageName = imageFile.getName();
				Map<String, Object> imageInfo = new HashMap<String, Object>();
				String imageUrl = StringUtils.combinedString("/", imageBaseUrl, path, imageName);
				list.add(makeImageInfo(imageFile, imageName, imageUrl));
				LOG.debug("Find image info [" + imageInfo + "]");
			}
		} catch (IOException e) {
			throw new RuntimeException("Get images information for [" + path + "] appear exception", e);
		}
		return list;
	}

	@Override
	public boolean uploadFile(InputStream in, String fileName, String destPath) {
		String absolutPath = getAbsolutePath(destPath) + fileName;
		LOG.debug("Upload absolute path [" + absolutPath + "]");
		BufferedImage bufferedImage = null;
		try {
			bufferedImage = ImageIO.read(in);
			if (bufferedImage == null) {
				throw new IllegalArgumentException("The file is not image");
			}
		} catch (IOException e) {
			LOG.warn("Upload image failed, maybe the file is not image", e);
			throw new IllegalArgumentException("Upload image failed, maybe the file is not image", e);
		}
		
		try {
			String formatter = fileName.substring(fileName.lastIndexOf(".") + 1);
			FileOutputStream bos = new FileOutputStream(absolutPath);
			ImageIO.write(bufferedImage, formatter, bos);
			if (bos != null) {
				bos.flush();
				bos.close();
			}
			bufferedImage = null;
		} catch (Exception e) {
			LOG.error("Upload image failed", e);
			throw new RuntimeException("Output file stream appear exception", e);
		}
		return true;
	}
	
	@Override
	public List<String> findAllTestConditions() {
		List<String> fileList = new ArrayList<String>();
		findFilesPath(url, DefaultPathRule.RTL_FOLDER_DEPTH_FROM_ROOT, fileList);
		return fileList;
	}
	
	@Override
	public List<String> findAllControlsFrom(String modulePath) {
		List<String> fileList = new ArrayList<String>();
		File file = new File(modulePath);
		if (file.exists()) {
			findFilesPath(modulePath, DefaultPathRule.CONTROL_FOLDER_DEPTH_FROM_MODULE, fileList);
		}
		return fileList;
	}
	
	@Override
	public void setResourceUrl(String resourceUrl) {
		setUrl(resourceUrl);
	}
	
	private void findFilesPath(String path, int depth, List<String> fileList) {
		File[] files = new File(path).listFiles(new FileFilter() {
			@Override
			public boolean accept(File file) {
				return !file.isHidden();
			}
		});
		if (files == null) {
			LOG.warn("Not find the path [" + path + "]");
			return ;
		}
		for (File file : files) {
			if (file.isDirectory() && depth > 1) {
				LOG.debug("Find the directory is [" + file.getAbsolutePath() + "]");
				findFilesPath(file.getAbsolutePath(), depth - 1, fileList);
			} else {
				fileList.add(file.getAbsolutePath());
			}

		}
	}


	private String getAbsolutePath(String path) {
		path = StringUtils.formatterFilePath(path);
		String root = url;
		String targetPath = path;
		if (!path.contains(root)) {
			root = StringUtils.formatterFilePath(root);
			targetPath = root + path;
		}
		return targetPath;
	}

	private Map<String, Object> makeImageInfo(File file, String imageName, String imageSrc) throws IOException {
		Map<String, Object> imageInfo = new HashMap<String, Object>();
		BufferedImage bufferedImage = ImageIO.read(file);
		imageInfo.put(Constants.NAME, imageName);
		imageInfo.put(Constants.HEIGHT, bufferedImage.getHeight());
		imageInfo.put(Constants.WIDTH, bufferedImage.getWidth());
		imageInfo.put(Constants.SRC, imageSrc);
		return imageInfo;
	}

	private boolean isImage(File file) {
		boolean flag = false;
		BufferedImage image = null;
		try {
			image = ImageIO.read(file);
			if (image == null) {
				return flag;
			}
			flag = true;
		} catch (IOException e) {
			return false;
		} finally {
			image = null;
		}
		return flag;
	}
	
	private boolean verifyRootUrl(String url) {
		if (url == null || "".equals(url)) {
			LOG.warn("URL is empty");
			throw new IllegalArgumentException("URL is empty");
		}
		this.url = url;
		this.defaultSeparator = File.separator;
		if (!url.endsWith(this.defaultSeparator)) {
			this.url += this.defaultSeparator;
		}
		return true;
	}
	
	private void verifyRootFolderStructure(File rootFile) {
		File[] files = rootFile.listFiles(new FileFilter() {
			@Override
			public boolean accept(File file) {
				return !file.isHidden();
			}
		});
		if (files == null || files.length == 0) {
			throw new IllegalArgumentException("All the folder is empty");
		}
		int depth = 0;
		depth = findLastFolderDepthFrom(rootFile, depth);
		if (depth != (DefaultPathRule.CONTROL_FOLDER_DEPTH_FROM_ROOT + 1)) {
			throw new IllegalArgumentException(Constants.INVALID_IMAGE_STORE);
		}
	}
	
	private int findLastFolderDepthFrom(File rootFile, Integer depth) {
		File[] files = rootFile.listFiles(new FileFilter() {
			@Override
			public boolean accept(File file) {
				return !file.isHidden();
			}
		});
		if (files == null) {
			LOG.warn("Not find the path [" + this.url + "]");
			return 0;
		}
		if (files.length > 0) {
			File file = files[0];
			if (file.isDirectory()) {
				depth ++;
				return findLastFolderDepthFrom(file, depth);
			}
		}
		return depth;
	}
	
	@Override
	public void setRule(PathRule rule) {
		super.setRule(rule);
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		verifyRootUrl(url);
		initContext();
	}

	public String getImageBaseUrl() {
		return imageBaseUrl;
	}

	public void setImageBaseUrl(String imageBaseUrl) {
		this.imageBaseUrl = imageBaseUrl;
	}
}
