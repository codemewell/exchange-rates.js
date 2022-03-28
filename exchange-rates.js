class CurrencyData {

    constructor(base = "EUR") {
        this.base = base;
    }

    async fetch() {
        const url = `https://api.frankfurter.app/latest?from=${this.base}`;
        const req = new Request(url);
        const res = await req.loadJSON();
        this.amount = res.amount;
        this.base = res.base;
        this.date = res.date;
        this.rates = res.rates;
    }
}

async function displayCurrencies({ currenciesToDisplay = ['USD', 'CHF', 'GBP'], currencySourceData, displayStack } = {}) {

    async function _loadFlagImage(currencySymbol) {
        const lowerCasedCurrencySymbol = currencySymbol.toLowerCase();
        const i = new Request(`https://raw.githubusercontent.com/transferwise/currency-flags/master/src/flags/${lowerCasedCurrencySymbol}.png`);
        return i.loadImage()
    }

    function _displayCurrencyRateItem(flagImage, rate, symbol) {
        let newStack = displayStack.addStack();

        newStack.layoutHorizontally();
        newStack.addText(rate + ' ' + symbol);
        newStack.addSpacer(4);

        let image = newStack.addImage(flagImage);
        image.imageSize = new Size(20, 20);

        newStack.addSpacer(4)
    }

    currenciesToDisplay.forEach((currencySymbol) => {
        let currencyFlagImage = await _loadFlagImage(currencySymbol);
        let currencyRate = (1 / currencySourceData[currencySymbol]).toPrecision(2);
        _displayCurrencyRateItem(currencyFlagImage, currencyRate, currencySymbol);
    })

};

const currencyData = await new CurrencyData().fetch();

let widget = createWidget(amount)
if (config.runsInWidget) {
    // create and show widget
    Script.setWidget(widget)
    Script.complete()
}
else {
    widget.presentSmall()
}

function createWidget(amount) {
    let w = new ListWidget()
    w.setPadding(8, 8, 8, 8)
    w.backgroundColor = new Color("#1A1A1A")

    const upperStack = w.addStack()
    upperStack.layoutVertically()

    let logo = upperStack.addText("Exchange Rates")
    logo.font = Font.boldSystemFont(14)
    logo.textColor = Color.yellow()

    upperStack.addSpacer(10)

    displayCurrencies({ currencySourceData: currencyData, displayStack: upperStack });

    return w
}