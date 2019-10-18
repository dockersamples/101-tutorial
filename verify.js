const fs = require('fs');
const data = require('./mkdocs-config.json');

const errors = [];

function assertDefined(property, languageCode, path) {
    if (property === undefined)
        errors.push(`${languageCode}: Missing property ${path}`);
}

function assertNavDefined(navRoot, key, languageCode, dirRequired = true) {
    if (navRoot[key] === undefined)
        return errors.push(`${languageCode}: Missing nav spec for ${key}`);
    
    const p = navRoot[key];
    assertDefined(p.title, languageCode, `nav['${key}'].title`);

    if (dirRequired) {
        assertDefined(p.dir_name, languageCode, `nav['${key}'].dir_name`);
        const path = (key === 'PWD Tips') ? `docs_${languageCode}/` : `docs_${languageCode}/${data[languageCode].tutorial_dir_name}/`;
        if (p.dir_name && !fs.existsSync(`${path}${p.dir_name}`))
            errors.push(`${languageCode}: Unable to find directory ${path}${p.dir_name}`);
    }
}

Object.keys(data).forEach(languageCode => {
    if (!fs.existsSync(`docs_${languageCode}`))
        errors.push(`${languageCode}: Missing directory 'docs_${languageCode}'`);

    const languageData = data[languageCode];
    assertDefined(languageData.language_code, languageCode, 'language_code');
    assertDefined(languageData.site_description, languageCode, 'site_description');

    assertDefined(languageData.nav, languageCode, 'nav');
    assertNavDefined(languageData.nav, 'Tutorial', languageCode, false);
    assertNavDefined(languageData.nav, 'Getting Started', languageCode, false);
    assertNavDefined(languageData.nav, 'Our Application', languageCode);
    assertNavDefined(languageData.nav, 'Updating our App', languageCode);
    assertNavDefined(languageData.nav, 'Sharing our App', languageCode);
    assertNavDefined(languageData.nav, 'Persisting our DB', languageCode);
    assertNavDefined(languageData.nav, 'Using Bind Mounts', languageCode);
    assertNavDefined(languageData.nav, 'Multi-Container Apps', languageCode);
    assertNavDefined(languageData.nav, 'Using Docker Compose', languageCode);
    assertNavDefined(languageData.nav, 'Image Building Best Practices', languageCode);
    assertNavDefined(languageData.nav, 'What Next?', languageCode);
    assertNavDefined(languageData.nav, 'PWD Tips', languageCode);
});

if (errors.length > 0) {
    console.error('Found the following errors:');
    errors.forEach((m) => console.error(`- ${m}`));
    process.exit(1);
}
console.log("All good to go!");