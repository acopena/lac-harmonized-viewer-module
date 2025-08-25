import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

function determineEnvironment(): string {
    if (!process.argv)
    throw new Error("Couldn't parse node arguments.");

    if (process.argv.indexOf('--hvLocal') > -1) {
        return 'local';
    } else if (process.argv.indexOf('--hvDev') > -1) {
        return 'dev';
    } else if (process.argv.indexOf('--hvQa') > -1) {
        return 'qa';
    } else {
        return 'prod';
    }
}
const env: string = determineEnvironment();
const globalScript: string = `./src/global/environment/${env}-config.ts`;

export const config: Config = {
    namespace: 'lac-harmonized-viewer-module',
    outputTargets: [
        {
            type: 'dist',
            esmLoaderPath: '../loader',
            copy: [
                {
                  src: 'locales/**.json',
                  dest: 'locales'
                }
            ]
        },
        {
            type: 'www',
            copy: [
                { src: 'locales/**.json', dest: 'locales' },
                { src: 'index.html', dest: 'index.html' },
                { src: 'callback.html', dest: 'callback.html' }
            ],
            serviceWorker: null // disable service workers
        }
    ],
    commonjs: {
        namedExports: {   
            'node_modules/i18next': ['i18next'],
        }
    },
    globalScript: globalScript,
    globalStyle: './src/global/app.scss',
    plugins: [
        sass({ includePaths: ['node_modules'] })
    ],
    devServer: {
        port: 3334        
    }
};
