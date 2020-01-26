const keypress = require('keypress')

const { hideCursor, showCursor, verticalMenu } = require('../src')


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
    options = ('zero one two three four five six seven-is-long ' +
        'eight nine ten eleven twelve thirteen fourteen').split(' ')
    hideCursor()
    let menuKeyHandler = verticalMenu({
        options,
        height: 5,
        selection: 7,
        done: menuDone
    })
    listenKeyboard(menuKeyHandler)
}

main()
