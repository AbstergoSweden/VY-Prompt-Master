// Generate keys for the multiple secrets test
const longKey = 'sk-abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrs';
const googleKey = 'AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFG';

console.log('Long key length:', longKey.length - 3); // after sk-
console.log('After sk-:', longKey.substring(3));
console.log('Google key after AIza:', googleKey.substring(4));
