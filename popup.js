refresh();
chrome.storage.sync.get(['BlockNewsfeed'], function(result) {
	if (typeof(result['BlockNewsfeed']) !== 'undefined' && result['BlockNewsfeed'] == true) {
		$("#sw_newsfeed").prop('checked', true);
	}
});
$(document).on('click', "#sw_newsfeed", function () {
	var opt_name = $(this).attr("opt_name");
	var status   = $(this).prop('checked');
	chrome.storage.sync.set({BlockNewsfeed: status});
});
$(document).on('click', '.btn-login', function() {
	login($(this).attr('data-token'));
});
$(document).on('click', '#add_acc', function() {
		chrome.cookies.getAll({url: "https://*.facebook.com/*"}, function (cookies) {
			cookie = "";
			c_user = "";
			for (index in cookies) {
				cookie += cookies[index]['name'] + "=" + cookies[index]['value'] + ';';
				console.log(cookies[index]['name'] + "=" + cookies[index]['value'] + ';');
				if (cookies[index]['name'] === 'c_user') {
					c_user = cookies[index]['value'];
				}
			}
			console.log(cookies);
			$.get("https://graph.facebook.com/" + c_user + "/", {
				access_token: '497086490676190|D1LV8SrqLL6OFpZk1dysBFq6H4U',
				fields: 'id,name'
			}).done(function (data) {
				if (typeof data.id !== 'undefined' && typeof data.name !== 'undefined') {
					chrome.storage.sync.get(['FB_Accounts'], function(result) {
						var list = {};
						if (typeof result['FB_Accounts'] !== 'undefined') {
							list = result.FB_Accounts;
						}
						list[data.id] = {};
						list[data.id]['cookies'] = cookies;
						list[data.id]['name'] = data.name;
						list[data.id]['id'] = data.id;
						chrome.storage.sync.set({FB_Accounts: list}, function () {
							refresh();
						});
					});
				}
			});
		});
});
$(document).on('click', '#safe_logout', function () {
	chrome.cookies.getAll({url: "https://*.facebook.com/*"}, function (cookies) {
		for (index in cookies) {
			chrome.cookies.remove({url: "https://*.facebook.com/*", name: cookies[index]['name']});
		}
		chrome.tabs.executeScript({
			code: 'location.reload();'
		});
	});
});
$(document).on('click', '.remove-account', function () {
	var xid = $(this).attr('data-target');
	chrome.storage.sync.get(['FB_Accounts'], function(result) {
		var list = result.FB_Accounts;
		delete list[xid];
		var newlist = {};
		for (i in list) {
			if (typeof list[i] !== 'undefined') {
				newlist[i] = list[i];
			}
		}
		chrome.storage.sync.set({
			FB_Accounts: newlist
		}, function() {
			refresh();
		});
	});
	return false;
});

function refresh() {
	$("#list_accounts").html("");
	chrome.storage.sync.get(['FB_Accounts'], function(result) {
		var cookies = result.FB_Accounts;
		for (i in cookies) {
			$("#list_accounts").append('<div data-size="medium" data-token="' + i + '" data-role="tile" class="bg-red btn-login" data-cover="https://graph.facebook.com/' + cookies[i].id + '/picture?type=large"><span class="branding-bar">'+cookies[i].name+'</span><span class="badge-top remove-account" data-target="' + cookies[i].id + '">✖</span></div>');
		}
		$("#list_accounts").append('<div id="add_acc" data-size="small" data-role="tile" class="bg-blue"><span class="mif-plus icon"></span></div>');
		$("#list_accounts").append('<div id="safe_logout" data-size="small" data-role="tile" class="bg-red"><span class="mif-cross icon"></span></div>');
	});
}

function login(xid) {
	chrome.storage.sync.get(['FB_Accounts'], function(result) {
		var cookies = result.FB_Accounts[xid]['cookies'];
		for (index in cookies) {
			var cookie = cookies[index];
			chrome.cookies.set({
				url: "https://*.facebook.com/*",
				domain: cookie['domain'],
				name: cookie['name'],
				value: cookie['value']
			});
		}
		chrome.tabs.executeScript({
			code: "location.href='https://facebook.com';"
		});
	});
}

function getHostName(url) {
	var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
	if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
		return match[2];
	} else {
		return null;
	}
}
