# LAC Module
Built on top of the Harmonized Viewer, this module aims to provide LAC specific functionality to the open-source project.

Functionalities (based on the currently viewed item):
- Link to search record display
- File download (all individual files)
- Print (images, pdfs)
- Fullscreen with toolbar/UCC
- User contribution (images, audio, video)
.

## Getting started
### Dependencies

- **NodeJS**

  Install NodeJS on your local development environment (required for NPM dependencies).
  Make sure the NPM folder is appended to your PATH environment variable.

### Proxy configuration
If a proxy is configured on the local development environment,
you will have to configure proxy credentials for NPM.

Warning: your proxy credentials will be saved in plain text on your local development environment.

```
Configure HTTP proxy for NPM:
    1. Open a command prompt
    2. Run `npm config set proxy http://[username]:[password]@10.254.1.16:8080`

Configure HTTPS proxy for NPM (not tested):
    1. Open a command prompt
    2. Run `npm config set https-proxy http://[username]:[password]@10.254.1.16:8080`
```
You can also use cntlm to encrypt your password and takeover all proxy requests. Refer to the Developer wiki for how to setup the proxy client.

### Development
A development environment for the LAC Module requires 2-3 servers running:
- Harmonized Viewer (port 3333)
- LAC module project (port 3334)
- WET theme host (port 5000)    *[optional - but highly recommended]*


Start by creating a local copy of the Harmonized Viewer project and running it
```sh
git clone https://github.com/bac-lac/lac-harmonized-viewer.git
cd lac-harmonized-viewer
npm install
(...)
npm start
```

On another terminal, do the same for the LAC Module repository
```sh
git clone https://github.com/bac-lac/lac-harmonized-viewer.git
cd lac-harmonized-viewer
npm install
```

Next, run a server (IIS, nodejs instance, etc.) on port 5000 to host the WET theme's static files.

You should now be able to browse to localhost:3334 to see the LAC module in action.

#### Some things to note
By default, stencil.js doesn't support ES5 (IE11) in development.

If you wish to test ES5, use the following commands when setting up your dev servers:

For Harmonized Viewer (special script due to the amount of memory used)
```sh
npm run-script start.es5
```

For LAC Module
```sh
npm start --es5
```

## Issues
### List of known issues
* UCC tags injection is not 100% reliable. Some DOM events may not fire correctly to inject the tags into the Viewer. Hard to reproduce.
* Cross-origin issue with Central when logged-in user tries to authenticate himself to the FSE


### To do list
* Support for authorization on images, only audio/video content. (solve CORS bearer token issue, detect authorization within HV (404s, etc))
* Local tagging - some work done already by Gab
* Enable selective deepzoom based on manifest (property in manifest, detection/action within HV)


### Gotchas
This is a brief list of tips and hints when dealing with the LAC module and/or the Harmonized Viewer.
- Fundamentals of Web components are essential. Stencil.js is just a fancy compiler which builds Web components out of React/Vue/Angular like components.
- Knowledge of React state and lifecycle is a must (Initializing, Mouting, Updating, Unmounting)
- Interacting between HV and the LAC module is mainly done by DOM events. 
- Beware of the Shadow root in the HV. It is very useful, but also a pain to deal with when you need to target something within.
- Default HTML5 video/audio players are used in the HV, but we use the Azure Media Player for LAC specific AV material. Hence, the custom video component.
- Three major injections within the shadow root of the HV: Digilab Banner, UCC tags on thumbnails and Custom Video option.