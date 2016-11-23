if (typeof PAYPAL === 'undefined' || !PAYPAL) {
	var PAYPAL = {};
}

PAYPAL.apps = PAYPAL.apps || {};
PAYPAL.exchangeRates = null;

(function () {
	function loadScript(url, callback) {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;
		script.onload = callback;

		document.getElementsByTagName('head')[0].appendChild(script);

		return script;
	}

	function getExchangeRate() {
		var el = document.getElementById('exchange-rates');

		el = (el && el.value) || 'USD';

		if (el && PAYPAL.exchangeRates && PAYPAL.exchangeRates[el]) {
			return { currency: el, value: PAYPAL.exchangeRates[el] };
		}

		return null;
	}

	function selectExchangeRates(rates) {
		var el = document.getElementById('exchange-rates'),
			i = 0,
			currency,
			amt;

		if (el) {
			el.onchange = resetExchangeRate;
			while(el.childNodes[i]) {
				currency = el.childNodes[i].value;
				if (currency && rates[currency]) {
					amt = Math.round(100/rates[currency]) / 100;
					el.childNodes[i].text = el.childNodes[i].text.replace(/\d+.$/, amt + ')');
				}
				i = i + 1;
			}
		}
	}

	function resetExchangeRate() {
		var rate = getExchangeRate(),
			forms,
			fields,
			index = 0;
		if (rate) {
			forms = document.getElementsByTagName("form");
			while (forms[index]) {
				fields = getInrFields(forms[index], rate);
				if (fields) {
					setInrFieldValues(forms[index], fields, rate);
				}
				index++;
			}
		}
	}

	function setInrFieldValues(form, fields, rate) {
		var index = 0;
		form.currencyField.value = rate.currency;
		while(fields[index]) {
			if (!fields[index].inrValue) {
				fields[index].inrValue = fields[index].value;
			}
			fields[index].value = fields[index].inrValue * rate.value;
			index++;
		}
	}

	function getInrFields(form) {
		var nodes = form.childNodes,
			fields = [],
			isInrEnable = false,
			index = 0;

		if (form.inrFields) {
			return form.inrFields;
		}

		while (nodes[index]) {
			if (nodes[index].value === 'INR' && nodes[index].name === 'currency_code') {
				form.currencyField = nodes[index];
				isInrEnable = true;
			} else if (['amount', 'tax', 'shipping'].indexOf(nodes[index].name) >= 0) {
				fields.push(nodes[index]);
			}
			index++;
		}

		if (isInrEnable) {
			form.inrFields = fields;
			return fields;
		}

		return null;
	}


	loadScript('https://www.paypalobjects.com/js/external/paypal-button.min.js', function () {
		if (!PAYPAL.apps.backupButtonFactoryCreate) {
			PAYPAL.apps.backupButtonFactoryCreate = PAYPAL.apps.ButtonFactory.create;
			PAYPAL.apps.ButtonFactory.create = function () {
				var button = PAYPAL.apps.backupButtonFactoryCreate.apply(PAYPAL.apps.ButtonFactory, arguments);
				button.onsubmit = resetExchangeRate;
				return button;
			};
		}
		resetExchangeRate();
	});

	if (window.storeExchangeRate) {
		return;
	}

	window.storeExchangeRate = function (data) {
		PAYPAL.exchangeRates = data.rates;
		selectExchangeRates(data.rates);
		resetExchangeRate();
	};

	loadScript('https://api.fixer.io/latest?callback=storeExchangeRate&base=INR&symbols=USD,GBP');
}());
