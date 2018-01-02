const commandLineArgs = require('command-line-args');
const getUsage = require('command-line-usage');
const difference = require('lodash/difference');

const { printError } = require('./print-error');

const supportedLanguages = [
  'en-AU',
  'en-CA',
  'en-GB',
  'en-US',
  'en-ZA',
];

exports.supportedLanguages = supportedLanguages;

const addPlugins = [
  'spell',
  'indefinite-article',
  'repeated-words',
];

exports.addPlugins = addPlugins;

const removePlugins = [
  'syntax-mentions',
  'syntax-urls',
];

exports.removePlugins = removePlugins;

const supportedPlugins = addPlugins.concat(removePlugins);

exports.supportedPlugins = supportedPlugins;

const defaultPlugins = [
  'spell',
  'indefinite-article',
  'repeated-words',
  'syntax-mentions',
  'syntax-urls',
];

exports.defaultPlugins = defaultPlugins;

const optionList = [
  {
    name: 'files',
    alias: 'f',
    typeLabel: '<file|glob> <file|glob>...',
    description: 'A list of files or globs to spellcheck.',
    multiple: true,
    defaultOption: true,
  },
  {
    name: 'language',
    alias: 'l',
    typeLabel: '<language>',
    description: `The language of the files. The default language is en-US. The following languages are supported: ${supportedLanguages.join(', ')}.`,
    defaultValue: 'en-US',
  },
  {
    name: 'dictionaries',
    alias: 'd',
    typeLabel: '<file> <file>...',
    description: 'Files to combine into a personal dictionary.',
    multiple: true,
    defaultValue: [],
  },
  {
    name: 'generate-dictionary',
    type: Boolean,
    description: 'Write a personal dictionary that contains all found misspellings to dictionary.txt.',
  },
  {
    name: 'plugins',
    alias: 'p',
    typeLabel: '<name> <name>...',
    description: `A list of retext plugins to use. The default is "${defaultPlugins.join(' ')}". The following plugins are supported: ${supportedPlugins.join(', ')}.`,
    multiple: true,
    defaultValue: defaultPlugins,
  },
  {
    name: 'quiet',
    alias: 'q',
    type: Boolean,
    description: 'Do not output anything for files that contain no spelling mistakes.',
  },
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'Print this help screen.',
  },
];

const usage = getUsage([
  {
    header: 'spellchecker',
    content: 'A command-line tool for spellchecking files.',
  },
  {
    header: 'Options',
    optionList,
  },
]);

exports.getUsage = () => usage;

exports.parseArgs = () => {
  let parsedArgs;

  try {
    parsedArgs = commandLineArgs(optionList);
  } catch (error) {
    printError(error.toString());
    console.log(usage);
    process.exit(1);
  }

  const {
    files,
    language,
    plugins,
    dictionaries: personalDictionaryPaths,
    quiet,
    help,
  } = parsedArgs;
  const generateDictionary = parsedArgs['generate-dictionary'];

  if (help) {
    console.log(usage);
    process.exit(0);
  }

  if (!files || files.length === 0) {
    printError('A list of files is required.');
    console.log(usage);
    process.exit(1);
  }

  if (!supportedLanguages.includes(language)) {
    printError(`The language "${language}" is not supported.`);
    console.log(usage);
    process.exit(1);
  }

  const unsupportedPlugins = difference(plugins, supportedPlugins);
  if (unsupportedPlugins.length > 0) {
    printError(`The following retext plugins are not supported: ${unsupportedPlugins.join(', ')}.`);
    console.log(usage);
    process.exit(1);
  }

  return {
    files,
    language,
    personalDictionaryPaths,
    generateDictionary,
    plugins,
    quiet,
  };
};
