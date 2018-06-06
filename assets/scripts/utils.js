function getProtocalHost() {
	var protocal = window.location.protocol;
	var host = window.location.host;
	
	if (typeof protocal == "undefined"
		|| protocal == null) {
		protocal = "http:";
	}
	
	return protocal + "//" + host;
}