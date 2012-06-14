package com.sap.ui5.tools.infra.git2p4;
import java.io.File;
import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.sap.ui5.tools.infra.git2p4.Git2P4Main.Mapping;

public class Git2P4 {

  public Git2P4(GitClient git, P4Client p4) {
    this.git = git;
    this.p4 = p4;
  }

  private final GitClient git;
  private final P4Client p4;

  boolean opt = false;
  boolean interactive = false;
  boolean submit = false;

  private final List<String> targetIncludes = new ArrayList<String>();
  private final List<String> targetExcludes = new ArrayList<String>();

  /**
   * Files that have been found in Git repository and that have not been ignored in either Git or P4.
   */
  private Set<File> touchedFiles = new HashSet<File>();

  /**
   * Set of files existing in the P4 repository before the Git commit has been applied.
   * Filled with an p4 fstat for the repository, then files copied from Git are removed from the collection.
   * Any remaining files in the set must be deleted files -> p4 delete
   */
  private Set<File> existingFiles = new HashSet<File>();


  private void syncTree(File srcDir, String change, File dest, String path) throws IOException {
    File[] children = srcDir.listFiles();
    if ( children != null ) {
      for(File child : children) {
        // files that are ignored by Git shouldn't be copied to perforce
        if ( srcIgnore(child) ) {
          continue;
        }
        String localPath = path + (path.isEmpty() ? "" : "/") + child.getName();
        if ( child.isDirectory() ) {
          syncTree(child, change, new File(dest, child.getName()), localPath);
        } else if ( !destIgnore(localPath) ){
          File localFile = new File(dest, child.getName());
          touchedFiles.add(localFile);
          IOUtils.copy(child, localFile);
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

  private boolean srcIgnore(File file) {
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

  private void setFilter(String includes, String excludes) {
    targetIncludes.clear();
    if ( includes != null ) {
      targetIncludes.addAll(Arrays.asList(includes.split(",")));
    }
    targetExcludes.clear();
    if ( excludes != null ) {
      targetExcludes.addAll(Arrays.asList(excludes.split(",")));
    }
  }

  private boolean destIgnore(String repositoryLocalPath) {

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


  private boolean destIgnore(P4Client.FStat file, String p4path) {
    if ( file.getDepotPath().startsWith(p4path) ) {
      return destIgnore(file.getDepotPath().substring(p4path.length()+1));
    } else {
      throw new RuntimeException();
    }
  }


  private void revertDummyChanges(P4Client p4, String p4path, String p4change) throws IOException {
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

  private static class DescriptionBuilder {

    private static DateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    private static String NL = System.getProperty("line.separator");

    private StringBuilder desc = new StringBuilder(1024);
    //		private static String[] FIELDS = {
    //			"Author", "AuthorDate", "Commit", "CommitDate"
    //		};

    DescriptionBuilder (GitClient.Commit commit) {
      desc.append("CSN: na Reason: infra Desc: BC-WD-HTM - git2p4: ").append(GerritHelper.ungerrit(commit.lines.get(0))).append(NL);
      desc.append(NL);

      int first=0;
      if ( commit.mergeIns.size() > 0 && commit.isGerritMergeOf(commit.mergeIns.get(first)) ) {
        desc.append("Gerrit Merge: ").append(commit.getId()).append(" (").append(commit.getAuthor()).append(" ").append(format.format(commit.getAuthorDate())).append(")").append(NL);
        appendCommit("", commit.mergeIns.get(first++));
      } else {
        appendCommit("", commit);
      }
      if ( commit.mergeIns.size() > first ) {
        desc.append("also contains").append(NL).append(NL);
        for(int i=first; i<commit.mergeIns.size(); i++) {
          appendCommit("  ", commit.mergeIns.get(i));
        }
      }
    }

    private void appendCommit(String prefix, GitClient.Commit commit) {
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

    @Override
    public String toString() {
      return desc.toString();
    }
  }

  private static Pattern GERRIT_COMMIT = Pattern.compile("^\\s+Gerrit Merge:\\s+([0-9A-Za-z]{40})\\s+");
  private static Pattern GIT_COMMIT = Pattern.compile("^\\s+Git Commit:\\s+([0-9A-Za-z]{40})\\s+");

  public String findLastCommit(String path) throws IOException {
    int max=1;
    int lastLength = -1;

    do {
      p4.changes(path + "/...", max);
      if ( p4.lastChanges.size() <= lastLength ) {
        return null;
      }
      lastLength = p4.lastChanges.size();
      for(P4Client.Change change : p4.lastChanges) {
        // scan change description
        for(String line : change.description) {
          Matcher m = GERRIT_COMMIT.matcher(line);
          if ( m.find() ) {
            return  m.group(1);
          }
          m = GIT_COMMIT.matcher(line);
          if ( m.find() ) {
            return m.group(1);
          }
        }
        System.out.println("warning: manual change detected: " + change.changeId + ":" + change.description);
      }
      max = 2*max;
    } while (true);
  }


  private void init(Mapping repoMapping) {
    git.repository = repoMapping.gitRepository;
    setFilter(repoMapping.targetIncludes, repoMapping.targetExcludes);
    existingFiles.clear();
    touchedFiles.clear();
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
  public String run(GitClient.Commit commit, String p4change) throws IOException  {

    Mapping repoMapping = (Mapping) commit.data;
    String p4path = repoMapping.p4path;
    this.init(repoMapping);

    // sync git to commit
    git.checkout(commit.getId());

    // create a change description form the commit(s)
    String desc = new DescriptionBuilder(commit).toString();

    // create a new changelist
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
    syncTree(git.repository, p4change, localPath, "");

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
      return p4change;
    } else {
      Log.println("Description: " + desc);
      Log.println("Files:");
      for(P4Client.FStat file : p4.lastFiles) {
        Log.println(file.getAction() + " " + file.getDepotPath());
      }
    }

    if ( submit ) {

      int c = 'y';
      if ( interactive ) {
        System.out.println("P4 Change " + p4change + " prepared from Commit " + commit.getId() + ". Submit? (y/n):");
        c = System.in.read();
        while ( System.in.available() > 0 ) {
          System.in.read();
        }
      }

      if ( c == 'y' ) {
        p4.submit(p4change);
        p4change =  null;
      }
    }

    return p4change;
  }

}
