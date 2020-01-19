const keypress = require('keypress')

const { hideCursor, showCursor, tableMenu, computeTableLayout } = require('../src')


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
    console.log('Selection: ' + selection + ' - ' + options[selection])
    showCursor()
    process.exit(0)
}

let options = []

function main() {
    let loremIpsum = 'Lorem ipsum dolor sit amet ' +
        'consectetur adipiscing elit sed do eiusmod ' +
        'tempor incididunt ut labore et dolore magna aliqua ' +
        'a/very/long/option'
    options = loremIpsum.split(' ')
    let [ columns, columnWidth ] = computeTableLayout(options)
    hideCursor()
    let menuKeyHandler = tableMenu({
        options,
        columns,
        columnWidth,
        // columns: 3,
        // columnWidth: 12,
        //selection: 3,
        done: menuDone
    })
    listenKeyboard(menuKeyHandler)
}

main()