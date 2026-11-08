// Everything about keeping the game in the browser (localStorage)

const SAVE_KEY = 'little-hollow-save'

export function writeSave(save){
    localStorage.setItem(SAVE_KEY, JSON.stringify(save))
}

// Returns the saved game, or null when there is none or it is broken
export function readSave(){
    try{
        return JSON.parse(localStorage.getItem(SAVE_KEY))
    }catch(err){
        console.warn(`Faulty save (${err})`)
        return null
    }
}

export function deleteSave(){
    localStorage.removeItem(SAVE_KEY)
}
