const { print, inverse} = require('./terminal')


let config = {}

function showOption(row, text) {
    process.stdout.moveCursor(0, row)
    print(text)
    process.stdout.moveCursor(0, - row - 1)
}

function showSelection(options, sel, oldSel) {
    showOption(oldSel, options[oldSel])
    showOption(sel, inverse(options[sel]))
}

function moveSelection(delta) {
    if (config.selection + delta < 0 ||
        config.selection + delta >= config.options.length)
        return
    config.oldSel = config.selection
    config.selection += delta
    showSelection(config.options, config.selection, config.oldSel)
}

function kbHandler(ch, key) {
    switch (key.name) {
        case 'escape': return config.done(-1)
        case 'return': return config.done(config.selection)
        case 'down': return moveSelection(1)
        case 'up': return moveSelection(-1)
    }
}

function putMenu(options) {
    for (let o of options) {
        print(o)
    }
    process.stdout.moveCursor(0, -options.length)
}

function verticalMenu(menuConfig) {
    config = menuConfig
    if (config.selection === undefined)
        config.selection = 0
    config.oldSel = 0
    putMenu(config.options)
    showSelection(config.options, config.selection, config.oldSel)
    return kbHandler
}


module.exports = {
    verticalMenu
}
