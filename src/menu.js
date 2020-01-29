const { print, inverse} = require('./terminal')


let config = {}

function showItem(row, text) {
    if (row < 0) return // Out of scroll pane view
    process.stdout.moveCursor(0, row)
    print(text)
    process.stdout.moveCursor(0, - row - 1)
}

function decorateItem(opt, isSelected = false) {
    if (isSelected)
        return inverse(opt)
    return opt
}

function showSelection(items, sel, oldSel) {
    showItem(oldSel - config.scrollStart, config.decorate(items[oldSel]))
    showItem(sel - config.scrollStart, config.decorate(items[sel], true))
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

function updateSelection(delta) {
    if (config.selection + delta < 0)
        config.selection = 0
    else if (config.selection + delta >= config.items.length)
        config.selection = config.items.length - 1
    else
        config.selection += delta
}

function moveSelection(delta) {
    config.oldSel = config.selection
    updateSelection(delta)
    config.menu.selection = config.selection
    if (adjustScrollStart())
        putMenu(config.items)
    showSelection(config.items, config.selection, config.oldSel)
}

function keyHandler(ch, key) {
    switch (key.name) {
        case 'escape': return config.done(-1)
        case 'return': return config.done(config.selection)
        case 'down': return moveSelection(1)
        case 'up': return moveSelection(-1)
        case 'pagedown': return moveSelection(config.height - 1)
        case 'pageup': return moveSelection(- (config.height - 1))
    }
}

function putMenu(items) {
    process.stdout.clearScreenDown()
    let start = config.scrollStart
    let opts = items.slice(start, start + config.height)
    for (let o of opts) {
        print(config.decorate(o))
    }
    process.stdout.moveCursor(0, -opts.length)
}

function initConfig(cfg) {
    if (cfg.selection === undefined)
        cfg.selection = 0
    if (cfg.height === undefined)
        cfg.height = cfg.items.length
    if (cfg.scrollStart === undefined)
        cfg.scrollStart = 0
    if (!cfg.decorate)
        cfg.decorate = decorateItem
    cfg.oldSel = 0
    return cfg
}

function verticalMenu(menuConfig, updating = false) {
    if (updating) {
        config = { ...config, ...initConfig(menuConfig) }
        updateSelection(0)
    }
    else {
        config = initConfig(menuConfig)
    }
    adjustScrollStart()
    putMenu(config.items)
    showSelection(config.items, config.selection, config.oldSel)
    if (!config.menu) config.menu = {
        keyHandler,
        update: (menuConfig) => verticalMenu(menuConfig, true),
        selection: config.selection
    }
    else config.menu.selection = config.selection
    return config.menu
}


module.exports = {
    verticalMenu
}
