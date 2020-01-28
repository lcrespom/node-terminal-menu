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
        '\x1b[1mlong/bright/option\x1b[m ' +
        'potato'
    items = loremIpsum.split(' ')
    let { columns, columnWidth } = computeTableLayout(items)
    hideCursor()
    let menuKeyHandler = tableMenu({
        items,
        columns,
        columnWidth,
        // columns: 3,
        // columnWidth: 12,
        done: menuDone
    })
    listenKeyboard(menuKeyHandler)
}

main()