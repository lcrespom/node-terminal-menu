const { print, inverse} = require('./terminal')


let config = {}

function showOption(row, text) {
    if (row < 0) return // Out of scroll pane view
    process.stdout.moveCursor(0, row)
    print(text)
    process.stdout.moveCursor(0, - row - 1)
}

function decorateOption(opt, isSelected = false) {
    if (isSelected)
        return inverse(opt)
    return opt
}

function showSelection(options, sel, oldSel) {
    showOption(oldSel - config.scrollStart, config.decorate(options[oldSel]))
    showOption(sel - config.scrollStart, config.decorate(options[sel], true))
}

function adjustScrollStart() {
    if (config.scrollStart + config.height <= config.selection) {
        config.scrollStart = config.selection - config.height + 1
        return true
    }
    else if (config.scrollStart > config.selection) {
        config.scrollStart = config.selection
        return true
    }
    return false
}

function moveSelection(delta) {
    config.oldSel = config.selection
    if (config.selection + delta < 0)
        config.selection = 0
    else if (config.selection + delta >= config.options.length)
        config.selection = config.options.length - 1
    else
        config.selection += delta
    if (adjustScrollStart())
        putMenu(config.options)
    showSelection(config.options, config.selection, config.oldSel)
}

function kbHandler(ch, key) {
    switch (key.name) {
        case 'escape': return config.done(-1)
        case 'return': return config.done(config.selection)
        case 'down': return moveSelection(1)
        case 'up': return moveSelection(-1)
        case 'pagedown': return moveSelection(config.height - 1)
        case 'pageup': return moveSelection(- (config.height - 1))
    }
}

function putMenu(options) {
    process.stdout.clearScreenDown()
    let start = config.scrollStart
    let opts = options.slice(start, start + config.height)
    for (let o of opts) {
        print(config.decorate(o))
    }
    process.stdout.moveCursor(0, -opts.length)
}

function initConfig(cfg) {
    if (cfg.selection === undefined)
        cfg.selection = 0
    if (cfg.height === undefined)
        cfg.height = cfg.options.length
    if (cfg.scrollStart === undefined)
        cfg.scrollStart = 0
    if (!cfg.decorate)
        cfg.decorate = decorateOption
    cfg.oldSel = 0
    return cfg
}

function verticalMenu(menuConfig) {
    config = initConfig(menuConfig)
    adjustScrollStart()
    putMenu(config.options)
    showSelection(config.options, config.selection, config.oldSel)
    return kbHandler
}


module.exports = {
    verticalMenu
}
