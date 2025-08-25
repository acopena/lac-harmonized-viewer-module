# ucc-global-tagging



<!-- Auto Generated Below -->


## Properties

| Property            | Attribute            | Description | Type          | Default |
| ------------------- | -------------------- | ----------- | ------------- | ------- |
| `autocompleteDelay` | `autocomplete-delay` |             | `number`      | `500`   |
| `value`             | --                   |             | `GlobalTag[]` | `[]`    |


## Methods

### `selectedTags() => Promise<GlobalTag[]>`



#### Returns

Type: `Promise<GlobalTag[]>`



### `setTags(tags: GlobalTag[]) => Promise<any>`



#### Returns

Type: `Promise<any>`




## Dependencies

### Used by

 - [ucc-contribute](../ucc-contribute)

### Depends on

- [ucc-tag](../ucc-tag)

### Graph
```mermaid
graph TD;
  ucc-global-tagging --> ucc-tag
  ucc-contribute --> ucc-global-tagging
  style ucc-global-tagging fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
