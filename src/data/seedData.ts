import { Business, CatalogItem, Listing, Project } from '../types';

export const INITIAL_PROJECTS: Project[] = [];

export const INITIAL_CATALOG_ITEMS: CatalogItem[] = [
  {
    catalogItemId: 'cat_excavator',
    name: 'Excavator',
    category: 'CONSTRUCTION EQUIPMENT',
    subcategory: 'EARTHMOVING',
    type: 'equipment',
    searchableNames: ['excavator', 'digger', 'cat 320', 'komatsu pc210', 'tracked excavator', 'earthmover'],
    specificationTemplate: {
      operatingWeight: 'e.g. 21,500 kg',
      enginePower: 'e.g. 110 kW (148 hp)',
      bucketCapacity: 'e.g. 1.2 m³',
      maxDiggingDepth: 'e.g. 6.7 m',
      fuelType: 'Diesel',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    catalogItemId: 'cat_concrete_mixer',
    name: 'Concrete Mixer',
    category: 'CONSTRUCTION EQUIPMENT',
    subcategory: 'CONCRETE & MASONRY',
    type: 'equipment',
    searchableNames: ['concrete mixer', 'mixing machine', '350 mixer', 'cement mixer', 'site mixer', 'vibrator'],
    specificationTemplate: {
      mixingCapacity: 'e.g. 350 Litres / 500 Litres',
      engineType: 'Lister Diesel Engine',
      output: 'e.g. 15-20 batches/hr',
      powerSource: 'Diesel / Electric',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    catalogItemId: 'cat_compactor',
    name: 'Plate Compactor / Roller',
    category: 'CONSTRUCTION EQUIPMENT',
    subcategory: 'COMPACTION',
    type: 'equipment',
    searchableNames: ['compactor', 'plate compactor', 'tamping rammer', 'roller', 'soil compactor'],
    specificationTemplate: {
      plateSize: 'e.g. 530mm x 500mm',
      compactionForce: 'e.g. 15 kN',
      enginePower: 'e.g. 5.5 HP',
      fuelType: 'Petrol / Diesel',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    catalogItemId: 'cat_tipper_truck',
    name: 'Tipper Truck',
    category: 'CONSTRUCTION LOGISTICS',
    subcategory: 'MATERIAL HAULAGE',
    type: 'logistics',
    searchableNames: ['tipper', '10 ton tipper', '20 ton tipper', '30 ton tipper', 'sand truck', 'granite tipper'],
    specificationTemplate: {
      payloadCapacity: '10 Tons / 20 Tons / 30 Tons',
      bodyType: 'Steel Dump Body',
      serviceArea: 'Osogbo + 50 km',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    catalogItemId: 'cat_cement',
    name: 'Cement',
    category: 'CONSTRUCTION MATERIALS',
    subcategory: 'BINDERS & MASONRY',
    type: 'material',
    searchableNames: ['cement', 'dangote cement', 'lafarge', 'buacement', 'portland cement', '50kg bag'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    catalogItemId: 'cat_blocks',
    name: 'Concrete Vibrated Blocks',
    category: 'CONSTRUCTION MATERIALS',
    subcategory: 'MASONRY',
    type: 'material',
    searchableNames: ['blocks', 'vibrated blocks', '6 inch blocks', '9 inch blocks', 'paving blocks'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    catalogItemId: 'cat_rebar',
    name: 'Reinforcement Steel Bars (Rebar)',
    category: 'CONSTRUCTION MATERIALS',
    subcategory: 'METALS & REBAR',
    type: 'material',
    searchableNames: ['rebar', 'iron rods', '12mm rod', '16mm rod', 'high tensile steel', 'tmt bars'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_BUSINESSES: Business[] = [];

export const INITIAL_LISTINGS: Listing[] = [];
