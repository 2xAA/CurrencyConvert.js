// JSONP by Oscar Godson ~ https://github.com/OscarGodson/JSONP
(function(e,t){var n=function(t,n,r,i){t=t||"";n=n||{};r=r||"";i=i||function(){};var s=function(e){var t=[];for(var n in e){if(e.hasOwnProperty(n)){t.push(n)}}return t};if(typeof n=="object"){var o="";var u=s(n);for(var a=0;a<u.length;a++){o+=encodeURIComponent(u[a])+"="+encodeURIComponent(n[u[a]]);if(a!=u.length-1){o+="&"}}t+="?"+o}else if(typeof n=="function"){r=n;i=r}if(typeof r=="function"){i=r;r="callback"}if(!Date.now){Date.now=function(){return(new Date).getTime()}}var f=Date.now();var l="jsonp"+Math.round(f+Math.random()*1000001);e[l]=function(t){i(t);delete e[l]};if(t.indexOf("?")===-1){t=t+"?"}else{t=t+"&"}var c=document.createElement("script");c.setAttribute("src",t+r+"="+l);document.getElementsByTagName("head")[0].appendChild(c)};e.JSONP=n})(window);

(function(w) {
	var a = function() {};

	// All valid currency abbreviations matched in to an array
	a['validCurrency'] = "AEDAFNALLAMDANGAOAARSAUDAWGAZNBAMBBDBDTBGNBHDBIFBNDBOBBRLBSDBTCBTNBWPBYRBZDCADCDFCHFCLPCNYCOPCRCCUPCVECZKDJFDKKDOPDZDEGPERNETBEURFJDFKPGBPGELGHSGIPGMDGNFGQEGTQGYDHKDHNLHRKHTGHUFIDRILSINRIQDIRRISKJMDJODJPYKESKGSKHRKMFKPWKRWKWDKYDKZTLAKLBPLKRLRDLSLLVLLYDMADMDLMGAMKDMMKMNTMOPMROMURMVRMWKMXNMYRMZMNADNGNNIONOKNPRNZDOMRPABPENPGKPHPPKRPLNPYGQARRONRSDRUBRWFSARSBDSCRSDGSEKSGDSHPSLLSOSSRDSTDSYPSZLTHBTJSTMMTNDTOPTRYTTDTWDTZSUAHUGXUSDUYUUZSVEBVNDVUVWSTXAFXCDXDRXOFXPFYERZARZMK".match(/.{1,3}/g);

	// URL Structs
	a['urlOpen'] = 'http://free.currencyconverterapi.com/api/v3/convert?q=';
	a['urlClose'] = '&compact=ultra';

	// -- getMinutesBetweenDates(Number, Number)
	// Calculates the minutes between dates
	a['getMinutesBetweenDates'] = function(startDate, endDate) {
		var diff = endDate - startDate;
		return (diff / 60000);
	};

	// -- ajax(String, Function)
	// Accessing JSONP this way in case the user wants
	// to replace the method with a different 'driver'.
	a['ajax'] = function(url, callback) {
		w['JSONP'](url, callback);
	};

	// -- getRate(String, String, Function)
	// Get a single currency's current exchange rate
	// This caches data and will use the cached data
	// if it's still fresh within a half hour time period.
	a['getRate'] = function(from, to, callback) {
		var request = new XMLHttpRequest(),
			data;

		if(from) from = from.toUpperCase();
		if(to) to = to.toUpperCase();

		if(a['validCurrency'].indexOf(from) > -1 || a['validCurrency'].indexOf(to) > -1) {

			var cacheData = localStorage.getItem(from + '_' + to);
			if(cacheData) {

				cacheData = w['JSON']['parse'](cacheData);
				
				// Check if we've polled in the last 20 minutes, else refresh data
				if(a['getMinutesBetweenDates'](Date.parse(cacheData.time), (new Date()).getTime()) > 20) ajax(from, to);
				else {
					if(typeof callback === 'function') callback(cacheData.data);
				}

			} else {
				a['ajax'](a['urlOpen'] + from + '_' + to + a['urlClose'], function(data) {
					
					// Save cache
					var joined = from + '_' + to;
					localStorage.setItem(joined, w['JSON']['stringify']({data: data[joined], time: new Date()}));
					if(typeof callback === 'function') callback(data[joined]);
				});
			}

		} else {
			if(typeof callback === 'function') callback({'error': 'Invalid currency input.'});
		}

	};

	// -- getRate(Array, Function)
	// Get a multiple currency's current exchange rates.
	// This saves on requests, not only good for the
	// client's bandwidth but makes sure they don't get
	// locked out with rate limiting also. This caches
	// data in exactly the same way getRate does.
	a['getRates'] = function(rates, callback) {
		var request = new XMLHttpRequest(),
			data = {},
			cached = [],
			requestString = '',
			requestArray = [];

		for(var i=0; i < rates.length; i++) {
			var from = rates[i][0].toUpperCase(), to = rates[i][1].toUpperCase();

			if(a['validCurrency'].indexOf(from) === -1 || a['validCurrency'].indexOf(to) === -1) {
				callback({'error': 'Invalid currency input.'});
				return false;
			}
			
			requestArray.push(from + '_' + to);
		}

		for(i=requestArray.length; i >=0; i--) {
			cacheData = localStorage.getItem(requestArray[i]);
			if(cacheData) {
				cacheData = w['JSON']['parse'](cacheData);
				// Check if we've polled in the last 20 minutes, else refresh data
				if(a['getMinutesBetweenDates'](Date.parse(cacheData.time), (new Date()).getTime()) < 20) {
					data[requestArray[i]] = cacheData.data;
					// Remove from request array as we've already got cached data
					requestArray.splice(i, 1);
				}
			}
		}

		if(requestArray.length > 0) {

			requestString = requestArray.join();

			a['ajax'](this['urlOpen'] + requestString + a['urlClose'], function(jsondata) {
				// Save cache
				for(var joined in jsondata) {
					localStorage.setItem(joined, w['JSON']['stringify']({data: jsondata[joined], time: new Date()}));
					data[joined] = jsondata[joined];
				}

				if(typeof callback === 'function') callback(data);
			});

		} else {
			if(typeof callback === 'function') callback(data);
		}



	};

	// -- convert(Number, String, String, Function)
	// Converts a number between different currencies
	// This uses getRate, so will either use cached
	// data or use a HTTP request to get new data.
	a['convert'] = function(amount, from, to, callback) {
		a['getRate'](from, to, function(data) {

			if(!isNaN(data)) {
				if(typeof callback === 'function') callback(amount * data);
			} else {
				if(typeof callback === 'function') callback({'error': 'Something went wrong: ' + data.error});
			}

		});
	};

	w['CurrencyConvert'] = a;
})(window);