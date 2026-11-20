import {BUILDINGS} from '../src/data/buildings.js'
import {UPGRADES} from '../src/data/upgrades.js'

// Settings of the simulated player
const CLICKS_PER_SECOND = 5
const MAX_HOURS = 10
const COST_GROWTH = 1.15

// Same starting state as the game

const TIER_FACTOR = 1
const buildings = BUILDINGS.map(b => ({...b, cost: Math.round(b.cost * TIER_FACTOR ** (b.id - 1)), count: 0}))
const upgrades = UPGRADES.map(u => ({...u, bought: false}))
let score = 0

// Same formulas as GameScene
function getCost(building){
    return Math.floor(building.cost * COST_GROWTH ** building.count)
}

function getClickPower(){
    let power = 1
    for (const u of upgrades) if (u.bought && u.type === "click") power *= u.multiplier
    return power
}

function getBuildingProduction(building){
    let production = building.production
    for (const u of upgrades){
        if (u.bought && u.type === "building" && u.target === building.id) production *= u.multiplier
        if (u.bought && u.type === "global") production *= u.multiplier
    }
    return production
}

function getTotalProduction(){
    let total = 0
    for (const b of buildings) total += b.count * getBuildingProduction(b)
    return total
}

function isUpgradeAvailable(u){
    if (u.bought) return false
    if (u.type !== "building") return true
    return buildings.find(b => b.id === u.target).count >= (u.unlockAt ?? 1)
}

// How many points per second a purchase would add
function gainOf(option){
    const before = getTotalProduction() + getClickPower() * CLICKS_PER_SECOND
    option.apply()
    const after = getTotalProduction() + getClickPower() * CLICKS_PER_SECOND
    option.undo()
    return after - before
}

// The smart choice: the purchase that pays itself back the fastest
function bestOption(){
    const options = []
    for (const b of buildings){
        options.push({label: b.name, cost: getCost(b), apply: () => b.count++, undo: () => b.count--})
    }
    for (const u of upgrades.filter(isUpgradeAvailable)){
        options.push({label: `[upgrade] ${u.name}`, cost: u.cost, apply: () => u.bought = true, undo: () => u.bought = false})
    }

    let best = null
    for (const o of options){
        o.payback = o.cost / gainOf(o)
        if (best === null || o.payback < best.payback) best = o
    }
    return best
}

function formatTime(seconds){
    const minutes = Math.floor(seconds / 60)
    return `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}`
}

const alreadyShown = new Set()

for (let second = 0; second < MAX_HOURS * 3600; second++){
    score += getTotalProduction() + getClickPower() * CLICKS_PER_SECOND

    let next = bestOption()
    while (score >= next.cost){
        score -= next.cost
        next.apply()
        if (!alreadyShown.has(next.label)){
            alreadyShown.add(next.label)
            console.log(`${formatTime(second)}  ${next.label.padEnd(32)}  ${Math.round(getTotalProduction())} points/s`)
        }
        next = bestOption()
    }

    if (buildings.at(-1).count > 0) break
}

console.log('\nFinal count:', buildings.map(b => `${b.name}: ${b.count}`).join(', '))