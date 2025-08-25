# harmonized-viewer-contribution



<!-- Auto Generated Below -->


## Properties

| Property                 | Attribute                  | Description | Type      | Default     |
| ------------------------ | -------------------------- | ----------- | --------- | ----------- |
| `appEnvironment`         | `app-environment`          |             | `string`  | `undefined` |
| `contributionAlwaysOpen` | `contribution-always-open` |             | `boolean` | `false`     |
| `ecopy`                  | `ecopy`                    |             | `string`  | `undefined` |
| `forceLanguage`          | `language`                 |             | `string`  | `null`      |
| `isUcc`                  | `is-ucc`                   |             | `boolean` | `false`     |
| `itemNumber`             | `item-number`              |             | `string`  | `undefined` |
| `kwicEcopies`            | `kwic-ecopies`             |             | `string`  | `undefined` |
| `kwicPages`              | `kwic-pages`               |             | `string`  | `undefined` |
| `layoutOption`           | `layout-option`            |             | `string`  | `'right'`   |
| `overrideUrl`            | `override-url`             |             | `string`  | `undefined` |
| `referenceSystem`        | `reference-system`         |             | `string`  | `undefined` |
| `showLinkToRecord`       | `show-link-to-record`      |             | `boolean` | `false`     |
| `showUser`               | `show-user`                |             | `boolean` | `false`     |
| `suppressGallery`        | `suppress-gallery`         |             | `boolean` | `false`     |


## Dependencies

### Depends on

- [ucc-message](../ucc-message)
- [ucc-bottom](../ucc)
- [ucc-right](../ucc)
- [ucc-left](../ucc)
- [ucc-indicator](../ucc/ucc-indicator)

### Graph
```mermaid
graph TD;
  lac-harmonized-viewer --> ucc-message
  lac-harmonized-viewer --> ucc-bottom
  lac-harmonized-viewer --> ucc-right
  lac-harmonized-viewer --> ucc-left
  lac-harmonized-viewer --> ucc-indicator
  ucc-bottom --> ucc-toolbar
  ucc-bottom --> ucc-contribute
  ucc-bottom --> ucc-contribute-create
  ucc-toolbar --> ucc-download
  ucc-toolbar --> ucc-user-profile
  ucc-toolbar --> ucc-indicator
  ucc-contribute --> ucc-help-toggle
  ucc-contribute --> ucc-message
  ucc-contribute --> ucc-input
  ucc-contribute --> ucc-contribute-status
  ucc-contribute --> ucc-global-tagging
  ucc-global-tagging --> ucc-tag
  ucc-right --> ucc-toolbar
  ucc-right --> ucc-contribute
  ucc-right --> ucc-contribute-create
  ucc-left --> ucc-contribute
  ucc-left --> ucc-contribute-create
  ucc-left --> ucc-toolbar
  style lac-harmonized-viewer fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
