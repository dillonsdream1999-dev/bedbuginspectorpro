# DMA to Territory Relationship Update

## Overview
The database has been updated to reflect a new DMA (Designated Market Area) to territory relationship. Previously, territories had a direct `metro_area` text column. Now, territories reference a `dma` table via a foreign key relationship.

## Database Schema Changes
- **Old**: `territories.metro_area` (TEXT column)
- **New**: `territories.dma_id` (FK to `dma.id`)

## Code Updates

### `src/services/providerService.ts`
- Updated `getProviderByZip()` function to join with the `dma` table
- Changed query from selecting `territories.*` to joining `dma(name)` 
- Added logic to extract DMA name from the joined relationship
- Maintained backward compatibility fallback to `metro_area` if join fails
- Added support for alternative table names (`metro_areas`)

### Key Changes:
1. **Query Update**: Now uses Supabase join syntax:
   ```typescript
   .select(`
     *,
     dma (
       id,
       name
     )
   `)
   ```

2. **DMA Extraction**: Handles both object and array formats from Supabase:
   ```typescript
   if (territory.dma) {
     metroArea = Array.isArray(territory.dma) 
       ? territory.dma[0]?.name 
       : territory.dma.name;
   }
   ```

3. **Fallback Support**: Still checks for `metro_area` direct property for backward compatibility

## Testing
- Verify that provider lookup still works correctly
- Check that `metroArea` is displayed correctly in `LeadFlowScreen`
- Ensure no errors when territories have DMA relationships

## Notes
- If your DMA table is named differently (e.g., `metro_areas`), update the join in `providerService.ts` line 84 from `dma` to your table name
- The foreign key relationship must be properly defined in Supabase for the join to work





