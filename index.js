#!/usr/bin/env node

const fs = require('fs-extra');
const glob = require('globby');
const report = require('vfile-reporter');

const { buildPersonalDictionary } = require('./lib/build-personal-dictionary');
const { parseArgs } = require('./lib/command-line');
const { hasMessages } = require('./lib/has-messages');
const { printError } = require('./lib/print-error');
const { Spellchecker } = require('./lib/spellchecker');
const { toDictionary } = require('./lib/to-dictionary');

(async () => {
  const {
    files,
    language,
    personalDictionaryPaths,
    generateDictionary,
    plugins,
    quiet,
  } = parseArgs();

  const personalDictionary = await buildPersonalDictionary(personalDictionaryPaths);
  const spellchecker = new Spellchecker({ language, personalDictionary, plugins });

  if (personalDictionaryPaths.length > 0) {
    files.push(...personalDictionaryPaths.map(filePath => `!${filePath}`));
  }

  const filesFromGlobs = await glob(files, { gitignore: true });

  console.log();
  console.log(`Spellchecking ${filesFromGlobs.length} file${filesFromGlobs.length === 1 ? '' : 's'}...`);
  const checkSpelling = filePath => spellchecker.checkSpelling(filePath);
  const vfiles = await Promise.all(filesFromGlobs.map(checkSpelling));

  console.log();
  console.log(report(vfiles, { quiet }));

  if (hasMessages(vfiles)) {
    if (generateDictionary && hasMessages(vfiles, message => message.source === 'retext-spell')) {
      await fs.writeFile('dictionary.txt', toDictionary(vfiles));
      console.log('Personal dictionary written to dictionary.txt.');
    }

    process.exit(1);
  }
})().catch((error) => {
  printError(error);
  process.exit(1);
});
