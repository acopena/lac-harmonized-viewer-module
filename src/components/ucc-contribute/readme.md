# ucc-contribute



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute          | Description     | Type      | Default     |
| ----------------- | ------------------ | --------------- | --------- | ----------- |
| `isUcc`           | `is-ucc`           |                 | `boolean` | `false`     |
| `itemNumber`      | `item-number`      |                 | `string`  | `undefined` |
| `layoutOption`    | `layout-option`    |                 | `string`  | `'right'`   |
| `referenceSystem` | `reference-system` | STATE VARIABLES | `string`  | `undefined` |


## Events

| Event                              | Description | Type               |
| ---------------------------------- | ----------- | ------------------ |
| `itemUpdated`                      |             | `CustomEvent<any>` |
| `lacModUccContributeTutorialReady` |             | `CustomEvent<any>` |


## Dependencies

### Used by

 - [ucc-bottom](../ucc)
 - [ucc-left](../ucc)
 - [ucc-right](../ucc)
 - [ucc-top](../ucc)

### Depends on

- [ucc-help-toggle](../ucc-help-toggle)
- [ucc-message](../ucc-message)
- [ucc-input](../ucc-input)
- [ucc-contribute-status](../ucc-contribute-status)
- [ucc-global-tagging](../ucc-global-tagging)

### Graph
```mermaid
graph TD;
  ucc-contribute --> ucc-help-toggle
  ucc-contribute --> ucc-message
  ucc-contribute --> ucc-input
  ucc-contribute --> ucc-contribute-status
  ucc-contribute --> ucc-global-tagging
  ucc-global-tagging --> ucc-tag
  ucc-bottom --> ucc-contribute
  ucc-left --> ucc-contribute
  ucc-right --> ucc-contribute
  ucc-top --> ucc-contribute
  style ucc-contribute fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
