const BASE = 'EUR';
const DISPLAY = ['USD', 'CHF', 'GBP'];

class CurrencyData {

    constructor(base = 'EUR') {
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

class CurrencyWidgetElements {

    constructor({ currenciesToDisplay = ['USD', 'CHF', 'GBP'], currencySourceData } = {}) {
        this.currenciesToDisplay = currenciesToDisplay;
        this.currencySourceData = currencySourceData;
        this.currencyElements = [];
    }

    async _loadFlagImage(currencySymbol) {
        const lowerCasedCurrencySymbol = currencySymbol.toLowerCase();
        const i = new Request(`https://raw.githubusercontent.com/transferwise/currency-flags/master/src/flags/${lowerCasedCurrencySymbol}.png`);
        return i.loadImage();
    }

    async build() {
        return this.currenciesToDisplay.map((currencySymbol) => async () => {
            let currencyFlagImage = await this._loadFlagImage(currencySymbol);
            let currencyRate = (1 / this.currencySourceData.rates[currencySymbol]).toFixed(2);
            this.currencyElements.push({ image: currencyFlagImage, rate: currencyRate, symbol: currencySymbol });
        }).reduce((prevTask, currentTask) => prevTask.then(() => currentTask()), Promise.resolve());
    }

    _displayCurrencyRateItem(flagImage, rate, symbol) {
        let newStack = this.displayStack.addStack();

        newStack.layoutHorizontally();
        newStack.addText(rate + ' ' + symbol);
        newStack.addSpacer(4);

        let image = newStack.addImage(flagImage);
        image.imageSize = new Size(20, 20);

        newStack.addSpacer(4)
    }

    displayAll(stack) {
        this.displayStack = stack;
        this.currencyElements.forEach((element) => this._displayCurrencyRateItem(element.image, element.rate, element.symbol));
    }


};

const currencyData = new CurrencyData(BASE);
await currencyData.fetch();
const currencyElements = new CurrencyWidgetElements({ currenciesToDisplay: DISPLAY, currencySourceData: currencyData });
await currencyElements.build();

let widget = createWidget()
if (config.runsInWidget) {
    // create and show widget
    Script.setWidget(widget)
    Script.complete()
}
else {
    widget.presentSmall()
}

function createWidget() {
    let w = new ListWidget()
    w.setPadding(8, 8, 8, 8)
    w.backgroundColor = new Color("#1A1A1A")

    const upperStack = w.addStack()
    upperStack.layoutVertically()

    let logo = upperStack.addText("Exchange Rates")
    logo.font = Font.boldSystemFont(14)
    logo.textColor = Color.yellow()

    upperStack.addSpacer(10)

    currencyElements.displayAll(upperStack);

    return w
}