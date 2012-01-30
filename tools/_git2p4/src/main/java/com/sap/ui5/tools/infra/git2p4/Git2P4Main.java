package com.sap.ui5.tools.infra.git2p4;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeSet;

public class Git2P4Main {

	private static void copy(File a, File b) throws IOException {
		if ( !b.getParentFile().exists() ) {
			b.getParentFile().mkdirs();
		}
		FileInputStream fis = new FileInputStream(a);
		FileOutputStream fos = new FileOutputStream(b);

		byte[] buffer = new byte[0x10000];
		while ( true ) {
			int n = fis.read(buffer);
			if ( n < 0 ) break;
			fos.write(buffer, 0, n);
		}
		fis.close();
		fos.close();
	}

	static String summary(List<String> lines) {
		if (lines.size() < 20 ) {
			String summary = lines.toString();
			if ( summary.length() < 500 ) {
				return summary;
			} else if ( lines.size() < 5 ) {
				return lines.get(0) + "..." + lines.get(lines.size()-1);
			}
		}
		List<String> start = lines.subList(0, Math.min(2, lines.size()-1));
		List<String> end = lines.subList(Math.max(0, lines.size()-3), lines.size()-1);
		return start + " (..." + (lines.size() - 4) + " more lines ...)" + end; 
	}

	private static void revertDummyChanges(P4Client p4, String p4path, String p4change) throws IOException {
		Log.println("optimizing change: remove whitespace-only diffs and RCS tag diffs");
		p4.fstat(p4path + "/...", p4change);
		for(P4Client.FStat file : p4.lastFiles) {
			if ( "edit".equals(file.getAction()) ) {
				// p4.diffSummary(file.getDepotPath());
				if ( true /* p4.lastDiff.add == 0 && p4.lastDiff.deleted == 0 && p4.lastDiff.changedFrom == p4.lastDiff.changedTo && p4.lastDiff.changedTo > 0 */ ) {
					p4.diff(file.getDepotPath());
					boolean ok=true;
					for(P4Client.Chunk diff : p4.lastDiffChunks) {
						if ( diff.x.contains("binary") ) {
							ok = diff.x.contains("equal");
							break;
						}
						if ( diff.x.contains("d") && diff.after.size() == 0 ) {
							for(int i=0; i<diff.before.size(); i++) {
								String before = diff.before.get(i);
								if ( !before.trim().isEmpty() ) {
									ok = false;
									break;
								}
							}
						} else if ( diff.x.contains("c") && diff.before.size() == diff.after.size() ) {
							for(int i=0; i<diff.before.size(); i++) {
								String before = diff.before.get(i);
								String after = diff.after.get(i);
								String normalizedBefore = before.replaceAll("\\$(Id|Header|Author|Date|DateTime|Change|File|Revision):[^$]*\\$", "\\$$1\\$");
								String normalizedAfter = after.replaceAll("\\$(Id|Header|Author|Date|DateTime|Change|File|Revision):[^$]*\\$", "\\$$1\\$");
								if ( !normalizedBefore.equals(normalizedAfter) ) {
									Log.println("<" + before);
									Log.println(">" + after);
									ok = false;
									break;
								}
							}
						} else {
							ok = false;
						}
						if ( !ok ) break;
					}
					if ( ok ) {
						Log.println("**** reverting 'dummy' change: " + file.getDepotPath());
						p4.revert(file.getDepotPath(), p4change);
					}
				}
			}
		}
	}

	/**
	 * Files that have been found in Git repository and that have not been ignored in either Git or P4.
	 */
	static Set<File> touchedFiles = new HashSet<File>();

	/**
	 * Set of files existing in the P4 repository before the Git commit has been applied.
	 * Filled with an p4 fstat for the repository, then files copied from Git are removed from the collection.
	 * Any remaining files in the set must be deleted files -> p4 delete
	 */
	static Set<File> existingFiles = new HashSet<File>();

	private static void walk(File srcDir, P4Client p4, String change, File dest, String path) throws IOException {
		File[] children = srcDir.listFiles();
		if ( children != null ) {
			for(File child : children) {
				// files that are ignored by Git shouldn't be copied to perforce
				if ( srcIgnore(child) ) {
					continue;
				}
				String localPath = path + (path.isEmpty() ? "" : "/") + child.getName();
				if ( child.isDirectory() ) {
					walk(child, p4, change, new File(dest, child.getName()), localPath);
				} else if ( !destIgnore(localPath) ){
					File localFile = new File(dest, child.getName());
					touchedFiles.add(localFile);
					copy(child, localFile);
					/*
					// files ignored by the current mapping also shouldn't be copied 
					if ( destIgnore() ) {
						
					}
					*/
					// if a file didn't exist before, "add" it to our change list
					if ( !existingFiles.contains(localFile) ) {
						p4.add(localFile.getPath(), change);
					}
				}
			}
		}
	}

	private static boolean srcIgnore(File file) {
		boolean dir = file.isDirectory();
		String name = file.getName();
		String ext = name.lastIndexOf(".") < 0 ? "" : name.substring(name.lastIndexOf('.'));

		return
				(dir && ".git".equals(name))
				|| (dir && "target".equals(name))
				|| (dir && ".settings".equals(name))
				|| (!dir && ".classpath".equals(name))
				|| (!dir && ".project".equals(name))
				|| (!dir && ".class".equals(ext))
				|| (!dir && ".jar".equals(ext))
				|| (!dir && ".zip".equals(ext))
				|| (!dir && ".exe".equals(ext))
				;
	}

	private static List<String> targetIncludes = new ArrayList<String>();
	private static List<String> targetExcludes = new ArrayList<String>();
	
	private static void setFilter(String includes, String excludes) {
		targetIncludes.clear();
		if ( includes != null ) {
			targetIncludes.addAll(Arrays.asList(includes.split(",")));
		}
		targetExcludes.clear();
		if ( excludes != null ) {
			targetExcludes.addAll(Arrays.asList(excludes.split(",")));
		}
	}
	
	private static boolean destIgnore(String repositoryLocalPath) {
		
		boolean ignore = true;
		if ( targetIncludes.isEmpty() ) {
			ignore = false;
		} else {
			for(String include : targetIncludes) {
				if ( repositoryLocalPath.startsWith(include) ) {
					ignore = false;
					break;
				}
			}
		}
		if ( !ignore && !targetExcludes.isEmpty() ) {
			for(String exclude : targetExcludes) {
				if ( repositoryLocalPath.startsWith(exclude) ) {
					ignore = true;
					break;
				}
			}
		}
		return ignore;
	}

	
	private static boolean destIgnore(P4Client.FStat file, String p4path) {
		if ( file.getDepotPath().startsWith(p4path) ) {
			return destIgnore(file.getDepotPath().substring(p4path.length()+1));
		} else {
			throw new RuntimeException();
		}
	}

	
	static P4Client p4 = new P4Client();
	// static String p4path = null;
	static String p4change = null;
	static boolean opt = false;
	static boolean submit = false;
	static GitClient git = new GitClient();
	static String after = null;
	static String gitto = null;
	
	static String[] FIELDS = {
		"Author", "AuthorDate", "Commit", "CommitDate"
	};

	static DateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

	static String NL = System.getProperty("line.separator");
	private static void append(StringBuilder desc, String prefix, GitClient.Commit commit) {
		desc.append(prefix).append("Git Commit: ").append(commit.getId()).append(" (");
		desc.append(commit.getAuthor()).append(", ").append(format.format(commit.getAuthorDate())).append(")").append(NL);
		if ( !commit.getAuthor().equals(commit.getCommiter()) || !commit.getAuthorDate().equals(commit.getCommitDate()) ) {
			desc.append(prefix).append("Commit:").append(commit.getCommiter()).append(" ").append(format.format(commit.getCommitDate())).append(NL); 
		}
		/*
		for(int i=0; i<FIELDS.length; i++) {
			if ( commit.fields.get(FIELDS[i]) != null ) {
				desc.append(prefix).append(FIELDS[i]).append(": ").append(commit.fields.get(FIELDS[i])).append(NL);
			}
		}
		*/
		for(int i=0; i<commit.lines.size(); i++) {
			desc.append(prefix).append("  ").append(commit.lines.get(i)).append(NL);
		}
		desc.append(NL);
	}
	
	private static String getDescription(GitClient.Commit commit) {
		StringBuilder desc = new StringBuilder(1024);
		desc.append("CSN: na Reason: git2p4 Desc: BC-WD-HTM - ").append(GerritHelper.ungerrit(commit.lines.get(0))).append(NL);
		desc.append(NL);
		
		int first=0;
		if ( commit.mergeIns.size() > 0 && commit.isGerritMergeOf(commit.mergeIns.get(first)) ) {
			desc.append("Gerrit Merge: ").append(commit.getId()).append(" (").append(commit.getAuthor()).append(" ").append(format.format(commit.getAuthorDate())).append(")").append(NL);
			append(desc, "", commit.mergeIns.get(first++));
		} else {
			append(desc, "", commit);
		}
		if ( commit.mergeIns.size() > first ) {
			desc.append("also contains").append(NL).append(NL);
			for(int i=first; i<commit.mergeIns.size(); i++) {
				append(desc, "  ", commit.mergeIns.get(i));
			}
		}
		return desc.toString();
	}
	
	/*
	 * Input:
	 * - directory of (new) files
	 * - path in perforce where the files belong to
	 * 
	 * 1. sync to head
	 * 2. create new changelist
	 * 3. check out all files for edit  
	 * 4. get file status from perforce
	 * 5. walk over new files and copy them
	 *    5.1 if new, add it to cl
	 * 6. revert unchanged
	 * 7. walk over file status: if file was not copied, delete it (ignore case?)
	 * 
	 * Collect file infos from perforce
	 */
	private static void git2p4(Mapping repoMapping, GitClient.Commit commit) throws IOException  {
		// create a new changelist

		String p4path = repoMapping.p4path;
		setFilter(repoMapping.targetIncludes, repoMapping.targetExcludes);
		
		String desc = getDescription(commit);
		
		if ( p4change == null ) {
			p4change = p4.createChange(desc);
		} else {
			p4.updateChange(p4change, desc);
		}

		// revert any pending changes in the given path
		p4.revert(p4path + "/...", null);
		
		// sync required path to head
		p4.sync(p4path + "/...", "#head");

		// check out all files for edit
		p4.checkOut(p4path + "/...", p4change);
		
		// initialize bookkeeping
		existingFiles.clear();
		touchedFiles.clear();
		
		// get file status from perforce
		p4.fstat(p4path + "/...");
		List<P4Client.FStat> before = p4.lastFiles;
		File localPath = null;
		for(P4Client.FStat file : before) {
			// deleted files and files filtered out for the current repository  
			if ( file.getHeadAction().contains("delete") || destIgnore(file, p4path)) {
				continue;
			}
			// all others contribute to the current p4 repository content
			existingFiles.add(file.getFile());
			
			// check for the local depot path 
			String depotPath = file.getDepotPath();
			if ( depotPath.substring(0, depotPath.lastIndexOf('/')).equals(p4path) ) {
				localPath = file.getFile().getParentFile();
			}
		}
		Log.println("Existing files found " + existingFiles.size());
		if ( localPath == null ) {
			throw new RuntimeException("local path couldn't be determined");
		}
		
		// walk over new files and copy them
		walk(git.repository, p4, p4change, localPath, "");

		// revert all unchanged files (let p4 compare old and new) 
		p4.revertUnchanged(p4change);

		if ( opt ) {
			// okay, now check the files from Peter
			revertDummyChanges(p4, p4path, p4change);
		}
		
		// walk over file status, if file was not touched, delete it
		for(P4Client.FStat file : before) {
			if ( file.getHeadAction().contains("delete") || destIgnore(file, p4path)) {
				continue;
			}
			if ( !touchedFiles.contains(file.getFile()) ) {
				Log.println("file: " + file.getDepotPath() + ":" + file.getHeadAction());
				p4.delete(file.getDepotPath(), p4change);
			}
		}
		
		// submit
		p4.fstat(p4path + "/...", p4change);
		if ( p4.lastFiles.size() == 0 ) {
			Log.println("no files to submit, skipping change");
			return;
		} else {
			Log.println("Description: " + desc);
			Log.println("Files:");
			for(P4Client.FStat file : p4.lastFiles) {
				Log.println(file.getAction() + " " + file.getDepotPath());
			}
		}
		
		int c = 'y';
		/*
		c = System.in.read();
		while ( System.in.available() > 0 ) {
			System.in.read();
		}
		*/
		
		if ( c == 'y' && submit ) {
			p4.submit(p4change);
			p4change = null;
		}
	}

	static SortedSet<GitClient.Commit> allCommits = new TreeSet<GitClient.Commit>(new Comparator<GitClient.Commit>() {
		public int compare(GitClient.Commit a, GitClient.Commit b) {
			int r = a.getCommitDate().compareTo(b.getCommitDate());
			if ( r != 0 ) 
				return r;
			return a.getId().compareTo(b.getId());
		}
	});
	
	static void collect(Mapping repo, String from, String to) throws IOException {
		git.repository = repo.gitRepository;
		git.log(from, to);
		List<GitClient.Commit> commits = new CommitHistoryOptimizer(git.lastCommits).run(to);
		for(GitClient.Commit commit : commits) {
			commit.data = repo;
		}
		allCommits.addAll(commits);
	}

	private static class Mapping {
		File gitRepository;
		String p4path;
		String targetIncludes;
		String targetExcludes;
		
		Mapping(String gitRepository, String p4path, String includes, String excludes) {
			this.gitRepository = new File(gitRepository);  
			this.p4path = p4path;
			this.targetIncludes = includes; 
			this.targetExcludes = excludes; 
		}
	}
	
	public static void main(String[] args) throws IOException {
		String template = null;
		
		for(int i=0; i<args.length; i++) {
			if ( "-p".equals(args[i]) ) {
				p4.port = args[++i];
			} else if ( "-u".equals(args[i]) ) {
				p4.user = args[++i];
			} else if ( "-P".equals(args[i]) ) {
				if ( !args[++i].isEmpty() ) {
					p4.passwd = args[i];
				}
			} else if ( "-v".equals(args[i]) ) {
				p4.verbose = true;
				git.verbose = true;
			} else if ( "-l".equals(args[i]) ) {
				Log.setLogFile(new File(args[++i]));
			} else if ( "-c".equals(args[i]) ) {
				p4.client = args[++i];
			} else if ( "-change".equals(args[i]) ) {
				p4change = args[++i];
			} else if ( "-src".equals(args[i]) ) {
				git.repository = new File(args[++i]);
			} else if ( "-after".equals(args[i]) ) {
				after = args[++i];
			} else if ( "-gitto".equals(args[i]) ) {
				gitto = args[++i];
			} else if ( "-opt".equals(args[i]) ) {
				opt = true;
			} else if ( "-submit".equals(args[i]) ) {
				submit = true;
			} else if ( "-template".equals(args[i]) ) {
				template = args[++i];
			} else {
				throw new RuntimeException("unsupported option " + args[i]);
			}
		}

		Log.println("args = " + Arrays.toString(args));
		Log.println("");
		
		String rootpath = "//tc1/phoenix/dev";
		
		Mapping SAPUI5_RUNTIME = new Mapping(
				"C:\\ws\\Phoenix\\depot\\sapui5.runtime", 
				rootpath,
				"pom.xml,src/,test/",
				"src/dist/_osgi/,src/dist/_osgi_tools/,src/platforms/,test/_selenium_tests_lsf/"
		);
		Mapping SAPUI5_PLATFORMS_GWT = new Mapping(
				"C:\\ws\\Phoenix\\depot\\sapui5.platforms.gwt",
				rootpath + "/src/platforms/gwt",
				null,
				null
		);
		Mapping SAPUI5_PLATFORMS_QTP_ADDIN = new Mapping(
				"C:\\ws\\Phoenix\\depot\\sapui5.platforms.qtp-addin",
				rootpath + "/src/platforms/qtp-addin",
				null,
				null
				); 
		Mapping SAPUI5_OSGI_RUNTIME = new Mapping(
				"C:\\ws\\Phoenix\\depot\\sapui5.osgi.runtime",
				rootpath + "/src/dist/_osgi",
				null,
				null
		);
		Mapping SAPUI5_OSGI_TOOLS = new Mapping(
				"C:\\ws\\Phoenix\\depot\\sapui5.osgi.tools",
				rootpath + "/src/dist/_osgi_tools",
				null,
				null
		);

		// TODO determine commits from tags 
		collect(SAPUI5_RUNTIME, "7417fadf4cfc81c2c1c102b06a68a8906de07c6a", "ac0573cb31439a02fc5c6a2a1c51f892b2664067");
		collect(SAPUI5_PLATFORMS_GWT, "d0c8c0590c3983a6f0e690edb48f5375582eae5e", "9b50de69fe86856e8b08451db6875ad51369b8bc");
		collect(SAPUI5_OSGI_RUNTIME, "6ece82f8525fb4bbc4a2c1dcb870dd18dfe115c9", "3caf52a6a5d2c707932002b6b20c85c843efc8a1");
		collect(SAPUI5_OSGI_TOOLS, "2fc421e94d76f8ba1190d6902ef63da563921a12", "aed5e498eb0257ab9585e015f09718d0f455306c");

		if ( template != null ) {
			SplitLogs.run(template, allCommits);
			return;
		}
		
		for(GitClient.Commit commit : allCommits) {
			Log.println(commit.repository + " " + commit.getId() + " " + commit.getCommitDate());
			if ( after != null ) {
				if ( after.equals(commit.getId()) ) {
					after = null;
				}
				Log.println("skip");
				continue;
			}
			Mapping mapping = (Mapping) commit.data;
			git.repository = mapping.gitRepository;
			git.checkout(commit.getId());
			git2p4(mapping, commit);
		}
		
	}
	
}
