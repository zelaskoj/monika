module.exports = {
	simpleTime: function(d){
		var hours = d.getHours();
		if (hours > 12){
			hours -= 12;
			return hours + ":"  + ('0' + d.getMinutes().toString()).slice(-2) + ":" + ('0' + d.getSeconds().toString()).slice(-2) + " PM";
		}
		if (hours == 12){
			return hours + ":"  + ('0' + d.getMinutes().toString()).slice(-2) + ":" + ('0' + d.getSeconds().toString()).slice(-2) + " PM";
		}
		if (hours == 0){
			hours += 12;
		}
		return hours + ":"  + ('0' + d.getMinutes().toString()).slice(-2) + ":" + ('0' + d.getSeconds().toString()).slice(-2) + " AM";
	},
	simpleDate: function(d){
		return (d.getMonth()+1) + "/" + d.getDate()  + "/" + d.getFullYear();
	},
	timeSince: function(d){
		var res = "";
		var seconds = Math.floor((new Date() - d) / 1000);
		var interval = Math.floor(seconds / 31536000);

		if (interval > 0) {
			res += interval;
			(interval == 1 ? res += " year, " : res += " years, ");
			seconds -= 31536000 * interval;
		}
		interval = Math.floor(seconds / 2592000);
		if (interval > 0) {
			res += interval;
			(interval == 1 ? res += " month, " : res += " months, ");
			seconds -= 2592000 * interval;
		}
		interval = Math.floor(seconds / 86400);
		if (interval > 0) {
			res += interval;
			(interval == 1 ? res += " day, " : res += " days, ");
			seconds -= 86400 * interval;
		}
		interval = Math.floor(seconds / 3600);
		if (interval > 0) {
			res += interval;
			(interval == 1 ? res += " hour, " : res += " hours, ");
			seconds -= 3600 * interval;
		}
		interval = Math.floor(seconds / 60);
		if (interval > 0) {
			res += interval;
			(interval == 1 ? res += " minute and " : res += " minutes and ");
			seconds -= 60 * interval;
		}
		res += seconds;
		(seconds == 1 ? res += " second" : res += " seconds");
		return res;
	},
	timeDatestamp: function(d){
		return "[" + module.exports.simpleDate(d) + " @ " + module.exports.simpleTime(d) + "]";
	},
	timestamp: function(d){
		return "[" + module.exports.simpleTime(d) + "]";
	}
};

