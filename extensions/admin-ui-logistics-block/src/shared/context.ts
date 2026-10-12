/** Shopify Admin supplies GraphQL resource IDs for the current target. */
export function getSelectedIds(): string[] {
  return (shopify.data.selected ?? [])
    .map(({ id }) => id)
    .filter((id): id is string => Boolean(id));
}

export function getFirstSelectedId(): string | undefined {
  return getSelectedIds()[0];
}
