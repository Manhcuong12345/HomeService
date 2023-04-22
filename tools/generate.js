const { generateTemplateFiles } = require('generate-template-files');

generateTemplateFiles([
    // Example of generating a single file
    {
        option: 'Create controller',
        defaultCase: '(pascalCase)',
        entry: {
            folderPath: './tools/templates/controller.ts'
        },
        stringReplacers: ['App', '(pascalCase)'],
        output: {
            path: './src/controllers/api/(pascalCase).controller.ts',
            pathAndFileNameDefaultCase: '(kebabCase)'
        }
    },
    {
        option: 'Create service',
        defaultCase: '(pascalCase)',
        entry: {
            folderPath: './tools/templates/service.ts'
        },
        stringReplacers: ['App', '(pascalCase)'],
        output: {
            path: './src/services/(pascalCase).service.ts',
            pathAndFileNameDefaultCase: '(kebabCase)'
        }
    }
]);
