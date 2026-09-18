# Game Library Frontend

Set the URLs for the GLS and UMS in `app/src/lib/setup.js` to the ones you want to use. The official public ones are:
```
const gls_url = 'https://vassalengine.org/api/gls/v1';
const ums_url = 'https://vassalengine.org/api/ums/v1';
```
If you are running the GLS and UMS locally, you might want something like:
```
const gls_url = 'http://localhost:3000/api/v1';
const ums_url = 'http://localhost:4000/api/v1';
```

Set the location of the site assets in `src/main.rs`:
```
const SITE_DIR: &str = "/path/to/site";
```
The site assets are available from the [vassal-site repo](https://github.com/vassalengine/vassal-site).

Copy `config.toml.sample` to `config.toml` and adjust as desred.

To build:
```sh
$ cd app
$ npm install
$ npm run build
$ cd ..
$ cargo build

```

To test:
```sh
cd app
npm run test 
cd ..
cargo test
```

To run:
```sh
$ cargo run
```
