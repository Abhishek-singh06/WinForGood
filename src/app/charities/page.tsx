import React from "react";
import { getCharities } from "@/lib/charities/actions";
import { CharityDirectory } from "@/components/charities/CharityDirectory";

export const dynamic = "force-dynamic";

export default async function CharitiesPage() {
  const charities = await getCharities({ activeOnly: false });

  return <CharityDirectory initialCharities={charities} />;
}
