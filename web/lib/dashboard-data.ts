import { integrationStatus as readIntegrationStatus } from "@/lib/env";
import {
  auditEvents,
  buyerProfile,
  campaign,
  ledgerEntries,
  members,
  orders,
  organization,
  pickupWindows,
  productionBatches,
  variants
} from "@/lib/mock-data";

export {
  auditEvents,
  buyerProfile,
  campaign,
  ledgerEntries,
  members,
  orders,
  organization,
  pickupWindows,
  productionBatches,
  variants
};

export const integrationStatus = readIntegrationStatus;
