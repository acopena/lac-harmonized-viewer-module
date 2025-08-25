# ucc-top



<!-- Auto Generated Below -->


## Properties

| Property                      | Attribute                        | Description | Type      | Default     |
| ----------------------------- | -------------------------------- | ----------- | --------- | ----------- |
| `contributionDrawerForceOpen` | `contribution-drawer-force-open` |             | `boolean` | `undefined` |
| `ecopy`                       | `ecopy`                          |             | `string`  | `undefined` |
| `enabled`                     | `enabled`                        |             | `boolean` | `undefined` |
| `fetched`                     | `fetched`                        |             | `boolean` | `undefined` |
| `fetching`                    | `fetching`                       |             | `boolean` | `undefined` |
| `haserror`                    | `haserror`                       |             | `boolean` | `undefined` |
| `isDrawerOpen`                | `is-drawer-open`                 |             | `boolean` | `undefined` |
| `isFullscreen`                | `is-fullscreen`                  |             | `boolean` | `undefined` |
| `isUcc`                       | `is-ucc`                         |             | `boolean` | `undefined` |
| `itemNumber`                  | `item-number`                    |             | `string`  | `undefined` |
| `items`                       | `items`                          |             | `any`     | `undefined` |
| `manifestLoaded`              | `manifest-loaded`                |             | `boolean` | `undefined` |
| `referenceSystem`             | `reference-system`               |             | `string`  | `undefined` |


## Dependencies

### Depends on

- [ucc-contribute](../ucc-contribute)
- [ucc-contribute-create](../ucc-create)
- [ucc-toolbar](../ucc-toolbar)

### Graph
```mermaid
graph TD;
  ucc-top --> ucc-contribute
  ucc-top --> ucc-contribute-create
  ucc-top --> ucc-toolbar
  ucc-contribute --> ucc-help-toggle
  ucc-contribute --> ucc-message
  ucc-contribute --> ucc-input
  ucc-contribute --> ucc-contribute-status
  ucc-contribute --> ucc-global-tagging
  ucc-global-tagging --> ucc-tag
  ucc-toolbar --> ucc-download
  ucc-toolbar --> ucc-user-profile
  ucc-toolbar --> ucc-indicator
  style ucc-top fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
