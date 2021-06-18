const fs = require('fs');
const path = require('path');
const branchName = require('current-git-branch');
const version = require('../package.json').version;
const execa = require('execa');

const FOLDER_NAME = 'dist';
const BRANCH = branchName() || 'master';
const DOMAIN = 'vfbounds.occupantfonts.com';

process.env.GH_PAGES = true;

(async function() {
  try {
    await execa('git', ['checkout', '--orphan', 'gh-pages']);
    console.log(`Building Application from ${BRANCH} ...`);
    await execa('npm', ['run', 'build']);

    // add a way of writing a CNAME file here with the domain.
    await fs.writeFile(path.join(FOLDER_NAME, 'CNAME'), DOMAIN, err => {});

    await execa('git', ['--work-tree', FOLDER_NAME, 'add', '--all']);
    await execa('git', ['--work-tree', FOLDER_NAME, 'commit', '-m', `deploy ${version}`]);
    console.log('Pushing to gh-pages...');
    await execa('git', ['push', 'origin', 'HEAD:gh-pages', '--force']);
    await execa('rm', ['-rf', FOLDER_NAME]);
    await execa('git', ['checkout', '-f', BRANCH]);
    await execa('git', ['branch', '-D', 'gh-pages']);
    console.log('Deployed.');
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
