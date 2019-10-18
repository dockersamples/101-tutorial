const fs = require('fs');
const YAML = require('yaml');
const { stringifyString } = require('yaml/util');

const language = process.argv[2];
console.log(`Configuring mkdocs for ${language}`);

const languageData = require('./mkdocs-config.json')[language];
if (!languageData) {
    console.error("Unable to find language config");
    process.exit(1);
}

const pythonName = {
    identify: value => value.constructor === Symbol,
    tag: 'tag:yaml.org,2002:python/name:pymdownx.emoji.to_svg',
    resolve: (doc, cst) => YAML.createNode('!!python/name:pymdownx.emoji.to_svg', false),
};
  
YAML.defaultOptions.customTags = [pythonName]

const mkdocData = YAML.parse(fs.readFileSync('mkdocs.yml').toString());
mkdocData['site_description'] = languageData.site_description;
mkdocData.theme.language = languageData.language_code;

mkdocData.nav = [
    { 
        [languageData.nav.Tutorial.title] : [
            { [languageData.nav['Getting Started'].title] : `tutorial/index.md`, },
            { [languageData.nav['Our Application'].title] : `tutorial/${languageData.nav['Our Application'].dir_name}/index.md` }, 
            { [languageData.nav['Updating our App'].title] : `tutorial/${languageData.nav['Updating our App'].dir_name}/index.md` }, 
            { [languageData.nav['Sharing our App'].title] : `tutorial/${languageData.nav['Sharing our App'].dir_name}/index.md` }, 
            { [languageData.nav['Persisting our DB'].title] : `tutorial/${languageData.nav['Persisting our DB'].dir_name}/index.md` }, 
            { [languageData.nav['Using Bind Mounts'].title] : `tutorial/${languageData.nav['Using Bind Mounts'].dir_name}/index.md` }, 
            { [languageData.nav['Multi-Container Apps'].title] : `tutorial/${languageData.nav['Multi-Container Apps'].dir_name}/index.md` }, 
            { [languageData.nav['Using Docker Compose'].title] : `tutorial/${languageData.nav['Using Docker Compose'].dir_name}/index.md` }, 
            { [languageData.nav['Image Building Best Practices'].title] : `tutorial/${languageData.nav['Image Building Best Practices'].dir_name}/index.md` }, 
            { [languageData.nav['What Next?'].title] : `tutorial/${languageData.nav['What Next?'].dir_name}/index.md` }, 
        ],
    },
    { 
        [languageData.nav['PWD Tips'].title] : `${languageData.nav['PWD Tips'].dir_name}/index.md` 
    },
];

// console.log(YAML.stringify(mkdocData));

fs.writeFileSync("mkdocs-configured.yml", YAML.stringify(mkdocData));