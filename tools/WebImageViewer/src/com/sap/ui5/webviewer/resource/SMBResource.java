package com.sap.ui5.webviewer.resource;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.imageio.ImageIO;

import jcifs.UniAddress;
import jcifs.smb.NtlmPasswordAuthentication;
import jcifs.smb.SmbException;
import jcifs.smb.SmbFile;
import jcifs.smb.SmbFileFilter;
import jcifs.smb.SmbSession;

import org.apache.log4j.Logger;

import com.sap.ui5.webviewer.constants.Constants;
import com.sap.ui5.webviewer.resource.path.DefaultPathRule;
import com.sap.ui5.webviewer.utils.StringUtils;

public class SMBResource extends AbstractResource {

	private NtlmPasswordAuthentication auth;

	private SmbFile remoteRootFile;

	private final String rootUrl;

	private final String defaultSeparator;

	private String imageBaseUrl;

	private static Logger LOG = Logger.getLogger(SMBResource.class);

	public SMBResource(String remoteUrl, String domain, String userName, String password) {
		this.defaultSeparator = "/";
		if (!remoteUrl.endsWith(this.defaultSeparator)) {
			remoteUrl += this.defaultSeparator;
		}
		this.rootUrl = remoteUrl;
		LOG.info("Init remote File system [" + this.rootUrl + "]");
		rule = new DefaultPathRule(this.rootUrl, defaultSeparator);
		initContext(domain, userName, password, remoteUrl);
	}

	public boolean verifyPermissions(String domain, String userName, String password) {
		String defalutUserName = (userName == null || "".equals(userName)) ? System.getProperty("user.name") : userName;
		this.auth = new NtlmPasswordAuthentication("", defalutUserName, password);
		try {
			SmbSession.logon(UniAddress.getByName(domain), auth);
		} catch (SmbException e) {
			throw new RuntimeException(e);
		} catch (UnknownHostException e) {
			throw new RuntimeException(e);
		}
		return true;
	}

	private void initContext(String domain, String userName, String password, String remoteUrl) {
		if (verifyPermissions(domain, userName, password)) {
			try {
				this.remoteRootFile = new SmbFile(remoteUrl, auth);
			} catch (MalformedURLException e) {
				throw new RuntimeException(e);
			}
		}
	}

	private void findFilesPath(String path, int depth, List<String> fileList) {
		try {
			SmbFile[] files = new SmbFile(remoteRootFile, path).listFiles();
			for (SmbFile file : files) {
				if (file.isDirectory() && depth > 1) {
					findFilesPath(file.getPath(), depth - 1, fileList);
				} else if (!file.isHidden()) {
					fileList.add(file.getPath());
				}
			}
		} catch (SmbException e) {
			throw new RuntimeException("Find files appear exception", e);
		} catch (MalformedURLException e) {
			throw new RuntimeException("Find files appear exception", e);
		} catch (UnknownHostException e) {
			throw new RuntimeException("Find files appear exception", e);
		}
	}

	@Override
	public List<String> findAllControlsPath() {
		List<String> fileList = new ArrayList<String>();
		findFilesPath("", DefaultPathRule.CONTROL_FOLDER_DEPTH_FROM_ROOT, fileList);
		return fileList;
	}

	@Override
	public List<String> findControlsPathFromRtlPath(String path) {
		if (!path.endsWith("/")) {
			path += "/";
		}
		List<String> fileList = new ArrayList<String>();
		findFilesPath(path, DefaultPathRule.CONTROL_FOLDER_DEPTH_FROM_RTL, fileList);
		return fileList;
	}

	@Override
	public List<Map<String, Object>> findFailedImageInfoByPath(String path) {
		LOG.debug("Find Image Info by [" + path + "]");
		SmbFile file = null;
		SmbFile[] subFiles = null;
		String separator = getResourcePathSeparator();
		String needVerifyPath = StringUtils.combinedResourcePath(separator, path, Constants.NEED_VERIFY_IMAGES_FOLDER);
		String diffVerifyPath = StringUtils.combinedResourcePath(separator, path, Constants.DIFF_IMAGES_FOLDER);
		String expectedVerifyPath = StringUtils.combinedResourcePath(separator, path, Constants.EXPECTED_IMAGES_FOLDER);
		try {
			file = new SmbFile(remoteRootFile, needVerifyPath);
			subFiles = file.listFiles();
		} catch (Exception e) {
			throw new RuntimeException("Init remote file fail by [" + needVerifyPath + "]", e);
		}
		if (subFiles == null) {
			throw new RuntimeException("Find images appear exception in [" + path + "]");
		}

		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		for (SmbFile imageFile : subFiles) {
			try {
				if (imageFile.isHidden()) {
					continue;
				}
				String expectedName = imageFile.getName();
				String diffImageName = rule.getDiffImageByExpectedImageName(expectedName);
				Map<String, Object> imageInfo = new HashMap<String, Object>();
				String verifyImageUrl = StringUtils.combinedString("/", imageBaseUrl, path,
						Constants.NEED_VERIFY_IMAGES_FOLDER, expectedName);
				imageInfo.put(Constants.VERIFY, makeImageInfo(imageFile, expectedName, verifyImageUrl));

				SmbFile diffImageFile = new SmbFile(remoteRootFile, diffVerifyPath + separator + diffImageName);
				if (!diffImageFile.exists()) {
					imageInfo.put(Constants.DIFF, null);
				} else {
					String diffImageUrl = StringUtils.combinedString("/", imageBaseUrl, path,
							Constants.DIFF_IMAGES_FOLDER, diffImageName);
					imageInfo.put(Constants.DIFF, makeImageInfo(diffImageFile, diffImageName, diffImageUrl));
				}

				SmbFile expectedImageFile = new SmbFile(remoteRootFile, expectedVerifyPath + separator + expectedName);
				if (!expectedImageFile.exists()) {
					imageInfo.put(Constants.EXPECT, null);
				} else {
					String exceptedImageUrl = StringUtils.combinedString("/", imageBaseUrl, path,
							Constants.EXPECTED_IMAGES_FOLDER, expectedName);
					imageInfo.put(Constants.EXPECT, makeImageInfo(expectedImageFile, expectedName, exceptedImageUrl));
				}
				list.add(imageInfo);
				LOG.debug("Getted Image Info [" + imageInfo + "]");
			} catch (Exception e) {
				throw new RuntimeException(e);
			}
		}
		return list;
	}

	@Override
	public boolean deleteFiles(String... files) {
		try {
			for (String filePath : files) {
				LOG.debug("Delete file path [" + filePath + "]");
				SmbFile file = new SmbFile(remoteRootFile, filePath);
				file.delete();
			}
		} catch (MalformedURLException e) {

		} catch (SmbException e) {

		} catch (UnknownHostException e) {

		}

		return true;
	}

	@Override
	public boolean copyFile(String sourceFilePath, String destFilePath) {
		try {
			SmbFile sourceFile = new SmbFile(remoteRootFile, sourceFilePath);
			if (!sourceFile.exists()) {
				LOG.debug("Source file not exists, [" + sourceFilePath + "]");
				return false;
			}
			SmbFile destFile = new SmbFile(remoteRootFile, destFilePath);
			if (destFile.exists()) {
				destFile.delete();
			}
			LOG.debug("Copy file from [" + sourceFilePath + "], to [" + destFilePath + "]");
			sourceFile.copyTo(destFile);
		} catch (MalformedURLException e) {
			throw new RuntimeException("Copy file appear exception", e);
		} catch (UnknownHostException e) {
			throw new RuntimeException("Copy file appear exception", e);
		} catch (SmbException e) {
			throw new RuntimeException("Copy file appear exception", e);
		}

		return true;
	}

	@Override
	public String getResourcePathSeparator() {
		return this.defaultSeparator;
	}

	@Override
	public int getSubFileSizeBy(String path) {
		SmbFile[] files = null;
		try {
			files = new SmbFile(remoteRootFile, path).listFiles(new SmbFileFilter() {

				@Override
				public boolean accept(SmbFile file) throws SmbException {
					return !file.isHidden();
				}
			});
		} catch (SmbException e) {
			e.printStackTrace();
		} catch (MalformedURLException e) {
			e.printStackTrace();
		} catch (UnknownHostException e) {
			e.printStackTrace();
		}
		if (files == null) {
			return 0;
		}
		return files.length;
	}

	private Map<String, Object> makeImageInfo(SmbFile file, String imageName, String imageSrc) throws IOException {
		Map<String, Object> diffInfo = new HashMap<String, Object>();
		BufferedImage diffBufferedImage = ImageIO.read(file.getInputStream());
		diffInfo.put(Constants.NAME, imageName);
		diffInfo.put(Constants.HEIGHT, diffBufferedImage.getHeight());
		diffInfo.put(Constants.WIDTH, diffBufferedImage.getWidth());
		diffInfo.put(Constants.SRC, imageSrc);
		return diffInfo;
	}

	public String getImageBaseUrl() {
		return imageBaseUrl;
	}

	public void setImageBaseUrl(String imageBaseUrl) {
		this.imageBaseUrl = imageBaseUrl;
	}

	@Override
	public String[] getAllSubFolders(String path) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<Map<String, Object>> findImagesInfoByPath(String path) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean uploadFile(InputStream in, String fileName, String destPath) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public List<String> findAllTestConditions() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<String> findAllControlsFrom(String modulePath) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void setResourceUrl(String resourceUrl) {
		// TODO Auto-generated method stub

	}

}
