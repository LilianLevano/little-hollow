const CLICK_UPGRADES = [
    {id: 1, type: "click", target: "clickPower", name: "Gloves", icon: "click-1", cost: 100, multiplier: 2.0, description: "Doubles the amount of points per click."},
    {id: 5, type: "click", target: "clickPower", name: "Iron Knuckles", icon: "click-2", cost: 1500, multiplier: 2.0, description: "Doubles the amount of points per click."},
    {id: 13, type: "click", target: "clickPower", name: "Golden Touch", icon: "click-3", cost: 200000, multiplier: 3.0, description: "Triples the amount of points per click."},
    {id: 19, type: "click", target: "clickPower", name: "Hollow Grip", icon: "click-4", cost: 50000000, multiplier: 5.0, description: "Multiplies the amount of points per click by 5."},
]

const GLOBAL_UPGRADES = [
    {id: 10, type: "global", target: "production", name: "Trade Routes", icon: "global-1", cost: 60000, multiplier: 1.5, description: "Multiplies the production of all buildings by 1.5."},
    {id: 16, type: "global", target: "production", name: "Guild Charter", icon: "global-2", cost: 5000000, multiplier: 1.5, description: "Multiplies the production of all buildings by 1.5."},
    {id: 21, type: "global", target: "production", name: "Golden Age", icon: "global-3", cost: 300000000, multiplier: 2.0, description: "Doubles the production of all buildings."},
    {id: 24, type: "global", target: "production", name: "Hollow Awakening", icon: "global-4", cost: 40000000000, multiplier: 3.0, description: "Triples the production of all buildings."},
]

const FARM_UPGRADES = [
    {id: 2, type: "building", target: 1, name: "Better seeds", icon: "farm-1", cost: 200, multiplier: 2.0, description: "Doubles the amount of points per farm."},
    {id: 6, type: "building", target: 1, unlockAt: 10, name: "Even more seeds!", icon: "farm-2", cost: 2500, multiplier: 2.0, description: "Doubles the amount of points per farm."},
]

const MINE_UPGRADES = [
    {id: 3, type: "building", target: 2, name: "Stone age!", icon: "mine-1", cost: 500, multiplier: 2.0, description: "Doubles the amount of points per mine."},
    {id: 7, type: "building", target: 2, unlockAt: 10, name: "Getting an upgrade!", icon: "mine-2", cost: 6000, multiplier: 2.0, description: "Doubles the amount of points per mine."},
]

const FACTORY_UPGRADES = [
    {id: 4, type: "building", target: 3, name: "Industrialization", icon: "factory-1", cost: 1000, multiplier: 2.0, description: "Doubles the amount of points per factory."},
    {id: 9, type: "building", target: 3, unlockAt: 10, name: "Assembly Lines", icon: "factory-2", cost: 25000, multiplier: 2.0, description: "Doubles the amount of points per factory."},
]

const RAILWAY_UPGRADES = [
    {id: 8, type: "building", target: 4, name: "First station!", icon: "railway-1", cost: 22000, multiplier: 2.0, description: "Doubles the amount of points per railway."},
    {id: 11, type: "building", target: 4, unlockAt: 10, name: "Express Lines", icon: "railway-2", cost: 150000, multiplier: 2.0, description: "Doubles the amount of points per railway."},
]

const HARBOR_UPGRADES = [
    {id: 12, type: "building", target: 5, name: "Only a kayak?", icon: "harbor-1", cost: 180000, multiplier: 2.0, description: "Doubles the amount of points per harbor."},
    {id: 14, type: "building", target: 5, unlockAt: 10, name: "Deep Water Docks", icon: "harbor-2", cost: 1200000, multiplier: 2.0, description: "Doubles the amount of points per harbor."},
]

const BANK_UPGRADES = [
    {id: 15, type: "building", target: 6, name: "The bill collector", icon: "bank-1", cost: 1500000, multiplier: 2.0, description: "Doubles the amount of points per bank."},
    {id: 17, type: "building", target: 6, unlockAt: 10, name: "Offshore Accounts", icon: "bank-2", cost: 10000000, multiplier: 2.0, description: "Doubles the amount of points per bank."},
]

const LABORATORY_UPGRADES = [
    {id: 18, type: "building", target: 7, name: "What's cooking?", icon: "lab-1", cost: 13000000, multiplier: 2.0, description: "Doubles the amount of points per laboratory."},
]

const OBSERVATORY_UPGRADES = [
    {id: 20, type: "building", target: 8, name: "Looking at the stars", icon: "obs-1", cost: 130000000, multiplier: 2.0, description: "Doubles the amount of points per observatory."},
]

const SPACEPORT_UPGRADES = [
    {id: 22, type: "building", target: 9, name: "Making contact with... ?", icon: "sp-1", cost: 1300000000, multiplier: 2.0, description: "Doubles the amount of points per spaceport."},
]

const HOLLOW_RIFT_UPGRADES = [
    {id: 23, type: "building", target: 10, name: "How did we get there?", icon: "hr-1", cost: 13000000000, multiplier: 2.0, description: "Doubles the amount of points per hollow rift."},
]

const BUILDING_UPGRADES = [...FARM_UPGRADES, ...MINE_UPGRADES, ...FACTORY_UPGRADES, ...RAILWAY_UPGRADES, ...HARBOR_UPGRADES, ...BANK_UPGRADES, ...LABORATORY_UPGRADES, ...OBSERVATORY_UPGRADES, ...SPACEPORT_UPGRADES, ...HOLLOW_RIFT_UPGRADES]

// All upgrades, cheapest first
export const UPGRADES = [...CLICK_UPGRADES, ...GLOBAL_UPGRADES, ...BUILDING_UPGRADES].sort((a, b) => a.cost - b.cost)
