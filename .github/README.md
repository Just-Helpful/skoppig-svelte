# SKOPPIG (svelte)

## Primary idea

This project is based around building a webapp paint project with a node based brush editor allowing for the creation and (potentially heavy) optimisation of customised brushes.
Tools within the editor are based around these customised brushes made along with multiple sketching tools.

## Layout

The site can be separated into two main 'pages':

### A Canvas page

This page is where the actual drawing is done, making use of the brushes created

#### Brush

Just apply the brush to the created canvas

#### Fill

Flood fill an area by tiling a brush back to back and cropping

#### Smart Fill

Flood fill an area by using a [wfc](https://github.com/mxgmn/WaveFunctionCollapse) algorithm and cropping.

It might be possible to do wfc via GPU (for canvas size C, brush size B, section size S):

1. Precompute side hashes for each section of brush result - O((B/S)^2)
   1. Also could be done via GPU
2. Whilst maximum entropy > 0
   1. Compute maximum + minimum entropy via GPU - O(logC)
   2. For each cell has entropy = the minimum entropy
      1. Assign random value to cell
      2. Mark cell for updates
   3. Whilst there are still cells to update, For each cell C to update
      1. Attempt to update the entropy of cells around C
      2. If a cell is updated, mark it for update and check

#### Ruler

Makes drawing straight lines easier by placing a limit on where can be drawn
