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

const mkdocData = YAML.parse(fs.readFileSync('mkdocs.yml').toString());
mkdocData['docs_dir'] = `/app/docs_${language}`;
mkdocData['site_description'] = languageData.site_description;
mkdocData.theme.language = languageData.language_code;

mkdocData.nav = [
    { 
        [languageData.nav.Tutorial.title] : [
            { [languageData.nav['Getting Started'].title] : `${languageData.tutorial_dir_name}/index.md`, },
            { [languageData.nav['Our Application'].title] : `${languageData.tutorial_dir_name}/${languageData.nav['Our Application'].dir_name}/index.md` }, 
            { [languageData.nav['Updating our App'].title] : `${languageData.tutorial_dir_name}/${languageData.nav['Updating our App'].dir_name}/index.md` }, 
            { [languageData.nav['Sharing our App'].title] : `${languageData.tutorial_dir_name}/${languageData.nav['Sharing our App'].dir_name}/index.md` }, 
            { [languageData.nav['Persisting our DB'].title] : `${languageData.tutorial_dir_name}/${languageData.nav['Persisting our DB'].dir_name}/index.md` }, 
            { [languageData.nav['Using Bind Mounts'].title] : `${languageData.tutorial_dir_name}/${languageData.nav['Using Bind Mounts'].dir_name}/index.md` }, 
            { [languageData.nav['Multi-Container Apps'].title] : `${languageData.tutorial_dir_name}/${languageData.nav['Multi-Container Apps'].dir_name}/index.md` }, 
            { [languageData.nav['Using Docker Compose'].title] : `${languageData.tutorial_dir_name}/${languageData.nav['Using Docker Compose'].dir_name}/index.md` }, 
            { [languageData.nav['Image Building Best Practices'].title] : `${languageData.tutorial_dir_name}/${languageData.nav['Image Building Best Practices'].dir_name}/index.md` }, 
            { [languageData.nav['What Next?'].title] : `${languageData.tutorial_dir_name}/${languageData.nav['What Next?'].dir_name}/index.md` }, 
        ],
    },
    { 
        [languageData.nav['PWD Tips'].title] : `${languageData.nav['PWD Tips'].dir_name}/index.md` 
    },
];

fs.writeFileSync("mkdocs-configured.yml", YAML.stringify(mkdocData));
