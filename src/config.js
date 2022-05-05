export const PROJECT_NAME = 'NPMRDS';

let API_HOST = 'https://tigtest2.nymtc.org/api2';
let AUTH_HOST = 'https://availauth.availabs.org';
let CLIENT_HOST = 'https://tigtest2.nymtc.org';

if (process.env.NODE_ENV === 'development') {
  //API_HOST = 'http://localhost:4445';
  // AUTH_HOST = 'http://localhost:3457';
  CLIENT_HOST = 'http://localhost:3000';
}
export { API_HOST, AUTH_HOST, CLIENT_HOST };
