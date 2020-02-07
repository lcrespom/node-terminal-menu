const keypress = require('keypress')

const {
    hideCursor, showCursor, tableMenu, computeTableLayout
} = require('../src')


function listenKeyboard(kbHandler) {
    process.stdin.setRawMode(true)
    process.stdin.resume()
    keypress(process.stdin)
    process.stdin.on('keypress', (ch, key) => {
        kbHandler(ch, key)
    })
}

function menuDone(selection) {
    process.stdout.clearScreenDown()
    console.log('Selection: ' + selection + ' - ' + items[selection])
    showCursor()
    process.exit(0)
}

let items = []

function main() {
    let loremIpsum = 'Lorem ipsum dolor sit amet ' +
        'consectetur adipiscing elit sed do eiusmod ' +
        'tempor incididunt ut labore et dolore magna aliqua ' +
        'potato'
    items = loremIpsum.split(' ')
    let { columns, columnWidth } = computeTableLayout(items)
    hideCursor()
    let menu = tableMenu({
        items,
        columns,
        columnWidth,
        done: menuDone
    })
    listenKeyboard((ch, key) => {
        if (ch == 'u') {        // Convert items to uppercase
            items = items.map(i => i.toUpperCase())
            menu.update({ items })
        }
        else if (ch == 'd') {   // Delete selected item
            items.splice(menu.selection, 1)
            menu.update({ items })
        }
        else menu.keyHandler(ch, key)
    })
}

main()