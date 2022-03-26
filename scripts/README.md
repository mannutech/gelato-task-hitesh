# Sign Typed Data
This tool allows you to generate a Dai permit signed typed data.

## Instructions

1. Install all dependencies

 ```bash
yarn install
```

2. Replace the Environment variables in `.env.sample`
```bash
cp .env.sample .env
```

3. Run the project
   ```bash
   node SignTypedData.js
   ```

Note: (Optional) To generate latest JS bindings, run

   ```bash
   npx ts-node SignTypedData.ts
   ```


## Sample Output

```bash
$ node SignTypedData.js

>> signedPermit {"holder":"0x7e00664398A54AE12648CAe2785c36d00dd51672","spender":"0xd3a67F512c338f63c3f81818eFD763fF8C916B73","expiry":1648277766,"allowed":true,"nonce":9,"v":28,"r":"0xc40490abb8a14b2305d1da0f50a280a929c427b5d54d94d1c5c6acbcaff7409e","s":"0x7367c5a4ac22a184b8d56a52f07ba7a16ed4c2569e2d3dcea393fa6c44e5b64d"}
```