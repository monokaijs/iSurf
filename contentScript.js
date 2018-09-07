chrome.storage.sync.get(['BlockNewsfeed'], function(result) {
	if (result.BlockNewsfeed === true) {
		var newsfeed = document.getElementsByClassName("_5pcb _dp7 _4j3f");
		for (index in newsfeed) {
			newsfeed[index].innerHTML = "";
		}
	}
}
