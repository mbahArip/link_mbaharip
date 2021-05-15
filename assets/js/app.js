//Connect to firebase
const firebaseConfig = {
	apiKey: 'AIzaSyA512Wflne7F6CxGbgpvmke5iBgNL-TnCA',
	authDomain: 'link-mbaharip.firebaseapp.com',
	projectId: 'link-mbaharip',
	storageBucket: 'link-mbaharip.appspot.com',
	messagingSenderId: '669675644439',
	appId: '1:669675644439:web:b169472c3f34c126081e52',
	measurementId: 'G-2ZN6EHB72Q',
};
firebase.initializeApp(firebaseConfig);
var fs = firebase.firestore();

// Declare
var sc = new SimpleCrypto('');
var alertError = 'Error has been occured! Please check console log for more details!';
var consoleError = 'Error has been caught! Details : ';

// Check for password
async function gateWay() {
	var pass;
	var password = function () {
		fs.collection('mbaharip')
			.doc('mbaharip')
			.get()
			.then(result => {
				if (result.exists) {
					pass = result.data()['aikotoba'];
				} else {
					console.error('ERROR');
				}
			})
			.catch(error => {
				alert(alertError);
				console.error(consoleError, error);
			});
	};
	password();
	await sleep(1000);

	let aikotoba = prompt('Please enter password', '');
	if (aikotoba != pass) {
		document.getElementById('header').innerHTML = '';
		document.getElementById('generator').innerHTML = '';
		await sleep(500);
		hideCover();
	} else {
		await sleep(500);
		hideCover();
	}
}

// Redirect
async function checkLink() {
	let redirectLink, alias, secret, hash;

	if (window.location.search.startsWith('?')) {
		if (window.location.search.split('?').length <= 1) {
			return;
		}
		alias = window.location.search.split('?')[1];
		fs.collection('shortlinkAlias')
			.doc(alias)
			.get()
			.then(result => {
				if (result.exists) {
					return result.data()['hash'];
				}
				alert('Invalid link! Please check URL you entered!');
				return Promise.reject();
			})
			.then(async data => {
				hash = data;

				if (window.location.hash.startsWith('#')) {
					secret = window.location.hash.split('#')[1];

					sc.setSecret(secret);
					try {
						redirectLink = sc.decrypt(hash);
						await redirect(redirectLink);
					} catch {
						alert('Invalid secret key!');
					}
				} else {
					secret = prompt('Enter secret key:', '');

					if (secret == null) {
						document.getElementById('header').innerHTML = '';
						document.getElementById('generator').innerHTML = '';
						await sleep(500);
						hideCover();
						return;
					}

					sc.setSecret(secret);
					try {
						redirectLink = sc.decrypt(hash);
						await redirect(redirectLink);
					} catch {
						alert('Invalid secret key!');
					}
				}
			});
	} else {
		await gateWay();
	}
}

async function redirect(link) {
	document.querySelector('div.info span').innerHTML = 'Redirecting in 5 seconds...';
	await sleep(5000);
	window.location.href = link;
}

// Short link
async function link__short() {
	const inputLink = document.getElementById('inputField');
	const inputSecret = document.getElementById('secretField');
	const inputAlias = document.getElementById('aliasField');
	const outputLink = document.getElementById('outputField');

	//Check input link
	if (inputLink.value == '') {
		return alert('Please input link!');
	}

	//Start function
	sc.setSecret(inputSecret.value); //Assign secret key
	let encryptedLink = sc.encrypt(inputLink.value);
	let alias;
	if (inputAlias.value == null || inputAlias.value == '') {
		alias = randomizeAlias(15);
	} else {
		alias = inputAlias.value;
	}

	//Check duplicate
	await fs
		.collection('shortlinkAlias')
		.doc(alias)
		.get()
		.then(result => {
			if (result.exists) {
				alert('Alias already exist!');
			} else {
				//Add to database
				fs.collection('shortlinkAlias')
					.doc(alias)
					.set({
						hash: encryptedLink,
					})
					.then(() => {
						var URL = window.location.origin + window.location.pathname + '?' + alias;
						outputLink.value = URL;
						document.getElementById('outputCheck').addAttribute('disabled');
						document.getElementById('outputCheck').removeAttribute('disabled');
					})
					.catch(error => {
						alert(alertError);
						console.error(consoleError, error);
					});
			}
		})
		.catch(error => {
			alert(alertError);
			console.error(consoleError, error);
		});
}
document.getElementById('btnSubmit').addEventListener('click', link__short);

// Copy link
function link__copy() {
	const outputLink = document.getElementById('outputField');

	//Check output empty
	if (outputLink.value == null || outputLink.value == '') {
		return alert('Please generate short link first!');
	}

	//Copy to clipboard
	navigator.clipboard
		.writeText(outputLink.value)
		.then(() => {
			alert('Link copied to clipboard!');
		})
		.catch(error => {
			alert(alertError);
			console.error(consoleError, error);
		});
}
document.getElementById('btnCopy').addEventListener('click', link__copy);

// Output Checkbox
function link__secret() {
	const inputSecret = document.getElementById('secretField');
	const outputLink = document.getElementById('outputField');
	const outputCheck = document.getElementById('outputCheck');

	let URL = outputLink.value;

	if (outputCheck.checked) {
		outputLink.value = URL + '#' + inputSecret.value;
	} else {
		URL = URL.split('#')[0];
		outputLink.value = URL;
	}
}
document.getElementById('outputCheck').addEventListener('change', link__secret);

// Util
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
function randomizeAlias(length) {
	var result = [];
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
	}
	return result.join('');
}
function hideCover() {
	document.getElementById('redirect').style.top = '-100vh';
}
